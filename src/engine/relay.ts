/** Synthetic periodic two-hop store-and-forward fixture, NOT propagated geometry. */
import type { Bus, EvaluationContext, EvaluationReport, Ground, LinkService, QueueResult, Radio, RelayFixture, RelayPayload, RelayPolicy, Status } from './types'
import { atLeast, atMost, finite as baseFinite, unknown, unavailable } from './metric'
import { unionWindows } from './link'
const basis = { kind: 'derived', sourceRefs: ['docs/nonthermal-missions.md'], assumptionIds: ['synthetic-two-hop-contacts', 'batch-ingress-end-arrivals', 'fifo-store-and-forward', 'both-hop-closure'] } as const
const finite = (value: number, unit = '') => {
  const metric = baseFinite(value, unit)
  return metric.kind === 'finite' ? { ...metric, provenance: basis } : metric
}
const known = <T>(value: T) => ({ state: 'known', value, provenance: basis }) as const

export function validRelayPolicy(value: RelayPolicy | undefined): value is RelayPolicy {
  return !!value && [value.minDeliveredGBDay, value.maxDelayHours, value.minYears].every(n => Number.isFinite(n) && n > 0)
}
export function validRelayFixture(value: RelayFixture | undefined): value is RelayFixture {
  if (!value || !Number.isFinite(value.ingressEfficiency) || value.ingressEfficiency <= 0 || value.ingressEfficiency > 1) return false
  const closure = value.ingressClosure
  const provenance = closure?.state === 'known' ? closure.provenance : undefined
  const validProvenance = !!provenance && typeof provenance === 'object'
    && ['verified-reference', 'derived', 'provisional'].includes(provenance.kind)
    && Array.isArray(provenance.sourceRefs) && provenance.sourceRefs.every(s => typeof s === 'string')
    && Array.isArray(provenance.assumptionIds) && provenance.assumptionIds.every(s => typeof s === 'string')
  if (!closure || (closure.state === 'known' ? typeof closure.value !== 'boolean' || !validProvenance
    : closure.state !== 'unknown' || !Array.isArray(closure.missingEvidenceIds) || !closure.missingEvidenceIds.length || !closure.missingEvidenceIds.every(s => typeof s === 'string'))) return false
  const window = (w: readonly number[]) => w.length === 2 && w.every(Number.isFinite) && w[0] >= 0 && w[1] <= 1440 && w[1] > w[0]
  if (!Array.isArray(value.ingress) || !value.ingress.length || !value.ingress.every(p => p && window([p.startMin, p.endMin]) && Number.isFinite(p.gb) && p.gb > 0)) return false
  const ingress = [...value.ingress].sort((a, b) => a.startMin - b.startMin)
  if (ingress.some((p, i) => i > 0 && p.startMin < ingress[i - 1].endMin)) return false
  return !!value.egressByGround && typeof value.egressByGround === 'object' && !Array.isArray(value.egressByGround)
    && Object.values(value.egressByGround).every(list => Array.isArray(list) && list.every(w => Array.isArray(w) && window(w)))
}
/** Exact maximum scheduled TX minutes in ANY orbit-length interval, including day wrap. */
export function relayPowerWindows(windows: readonly (readonly [number, number])[], period: number) {
  const merged = unionWindows(windows)
  const doubled = [-1, 0, 1].flatMap(day => merged.map(([a, b]) => [a + day * 1440, b + day * 1440] as const))
  const candidates = doubled.flatMap(([a, b]) => [a, b, a - period, b - period])
  let minutes = 0, count = 0
  for (const start of candidates) {
    const overlaps = doubled.map(([a, b]) => Math.max(0, Math.min(b, start + period) - Math.max(a, start)))
    minutes = Math.max(minutes, overlaps.reduce((a, b) => a + b, 0))
    count = Math.max(count, overlaps.filter(n => n > 0).length)
  }
  return { contactsPerOrbit: count, txMinutesPerOrbit: minutes }
}

export function relayModel(payload: RelayPayload | undefined, bus: Bus, radio: Radio, ground: Ground, context: EvaluationContext): {
  service: LinkService; queue: QueueResult; relay: NonNullable<EvaluationReport['relay']>
} {
  const fixture = context.fixture.relay
  const valid = validRelayFixture(fixture)
  const rawWindows = valid ? fixture.egressByGround[ground.id] : undefined
  const routeStatus: Status = !valid || rawWindows === undefined ? 'UNVERIFIED' : rawWindows.length ? 'MET' : 'NOT_MET'
  const failedLink = radio.antenna?.kind === 'directed' && !atMost(bus.errorDeg, radio.antenna.errorDeg)
    || [context.fixture.linkClosure, context.fixture.receiverCompatible].some(e => e.state === 'known' && !e.value)
  const missingLink = !radio.antenna || [context.fixture.linkClosure, context.fixture.receiverCompatible].some(e => e.state === 'unknown')
  const state = failedLink || routeStatus === 'NOT_MET' ? 'unavailable' : missingLink || routeStatus === 'UNVERIFIED' ? 'unknown' : 'available'
  const rate = radio.lineMbps * .0075 * ground.efficiency
  const windows = rawWindows ? unionWindows(rawWindows).map(([startMin, endMin]) => ({ startMin, endMin, rateGBMin: rate, capacityGB: (endMin - startMin) * rate })) : []
  const nominalCapacity = windows.reduce((sum, w) => sum + w.capacityGB, 0)
  const service: LinkService = {
    state, contactFixtureId: context.fixtureRevision,
    nominalCapacityGBDay: rawWindows ? finite(nominalCapacity, 'GB/day') : unknown('GB/day', 'missing-egress-schedule'),
    effectiveCapacityGBDay: state === 'unknown' ? unknown('GB/day', 'egress-link') : finite(state === 'available' ? nominalCapacity : 0, 'GB/day'),
    windows: state === 'unknown' ? { state: 'unknown', missingEvidenceIds: ['egress-link'] } : known(state === 'available' ? windows : []),
    reasonIds: state === 'available' ? [] : ['RL-ROUTE', 'ENG-LINK'],
  }
  const ingressStatus: Status = !payload || !valid ? 'UNVERIFIED'
    : fixture.ingressClosure.state === 'known' && !fixture.ingressClosure.value ? 'NOT_MET'
      : fixture.ingress.some(p => !atLeast(payload.ingressMbps * .0075 * fixture.ingressEfficiency * (p.endMin - p.startMin), p.gb)) ? 'NOT_MET'
        : fixture.ingressClosure.state === 'unknown' ? 'UNVERIFIED' : 'MET'
  const requested = valid ? fixture.ingress.reduce((sum, p) => sum + p.gb, 0) : undefined
  const unknownModel = requested === undefined || !payload || ingressStatus === 'UNVERIFIED' || state === 'unknown'
  const canServe = state === 'available' && ingressStatus === 'MET'
  const stable = !unknownModel && canServe && atLeast(nominalCapacity, requested!)
  let peak = 0, delivered = 0, worstMin = 0
  // Four days with empty startup: day 0 warms up; measure day-1 batches.
  // For stable periodic service, all target bytes clear within the next period.
  if (!unknownModel && canServe && valid) {
    type Packet = { remaining: number; arrival: number; target: boolean }
    const pending: Packet[] = []
    const arrivals = [0, 1, 2, 3].flatMap(day => fixture.ingress.map(p => ({ time: p.endMin + day * 1440, gb: p.gb, target: day === 1 })))
    const serviceWindows = [0, 1, 2, 3].flatMap(day => windows.map(w => ({ start: w.startMin + day * 1440, end: w.endMin + day * 1440 })))
    const times = [...new Set([0, 5760, ...arrivals.map(p => p.time), ...serviceWindows.flatMap(w => [w.start, w.end])])].sort((a, b) => a - b)
    for (let i = 0; i < times.length - 1; i++) {
      const t = times[i]
      for (const p of arrivals.filter(p => p.time === t)) pending.push({ remaining: p.gb, arrival: p.time, target: p.target })
      peak = Math.max(peak, pending.reduce((sum, p) => sum + p.remaining, 0))
      if (!serviceWindows.some(w => t >= w.start && t < w.end)) continue
      let available = (times[i + 1] - t) * rate, used = 0
      while (pending.length && available > 0) {
        const packet = pending[0], sent = Math.min(packet.remaining, available)
        available -= sent; used += sent; packet.remaining -= sent
        if (packet.target) {
          delivered += sent
          worstMin = Math.max(worstMin, t + used / rate - packet.arrival)
        }
        if (packet.remaining <= 1e-12) pending.shift()
        else break
      }
    }
  }
  const buffer = Math.min(bus.storageGB * .8, payload?.bufferGB ?? 0)
  const deliveredMetric = unknownModel ? unknown('GB/day', 'two-hop-evidence')
    : !canServe ? finite(0, 'GB/day') : !stable || !atMost(peak, buffer) ? unknown('GB/day', 'unstable-or-overflow-delivery-not-established') : finite(delivered, 'GB/day')
  const peakMetric = unknownModel ? unknown('GB', 'two-hop-evidence') : ingressStatus === 'NOT_MET' ? unavailable('not-applicable', 'GB', 'ingress-not-received') : !stable ? unavailable('unbounded', 'GB', 'sustained-relay-deficit') : finite(peak, 'GB')
  const delayMetric = unknownModel || stable && !atMost(peak, buffer) ? unknown('h', 'two-hop-evidence-or-overflow') : !stable || !atLeast(delivered, requested!) ? unavailable('unbounded', 'h', 'undelivered-batches') : finite(worstMin / 60 + ground.processingHours, 'h')
  const queue: QueueResult = {
    status: unknownModel ? 'unverified' : stable ? 'stable' : 'unstable',
    perContactStable: unknownModel || ingressStatus === 'NOT_MET' ? 'UNVERIFIED' : stable ? 'MET' : 'NOT_MET',
    peakGB: peakMetric, backlogGBDay: unknownModel || ingressStatus === 'NOT_MET' ? unknown('GB/day') : finite(Math.max(0, requested! - (canServe ? nominalCapacity : 0)), 'GB/day'),
    latencyHours: delayMetric, usefulGBDay: deliveredMetric,
    storageStatus: peakMetric.kind === 'finite' ? atMost(peak, buffer) ? 'MET' : 'NOT_MET' : peakMetric.kind === 'unbounded' ? 'NOT_MET' : 'UNVERIFIED',
    saturationEstimateDays: unavailable('not-applicable', 'day', 'no-imaging-fluid-estimate'),
  }
  return { service, queue, relay: { ingressWindows: valid ? fixture.ingress : [], ingressStatus, routeStatus, ingressGBDay: requested === undefined ? unknown('GB/day') : finite(requested, 'GB/day'), deliveredGBDay: deliveredMetric, peakBufferGB: peakMetric, worstDelayHours: delayMetric } }
}
