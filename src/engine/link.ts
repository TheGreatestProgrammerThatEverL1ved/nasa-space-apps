import type { EvaluationContext, Ground, LinkService, Radio, ServiceWindow, Bus } from './types'
import { atMost, finite, known, unknown } from './metric'

/** Unique geometric contact intervals. A wrapping interval is split before union. */
export function unionWindows(windows: readonly (readonly [number, number])[]): [number, number][] {
  const intervals: [number, number][] = []
  for (const [start, end] of windows) {
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || end - start > 1440) throw new Error('Invalid contact window')
    const s = ((start % 1440) + 1440) % 1440
    const e = s + end - start
    if (e > 1440) intervals.push([s, 1440], [0, e - 1440])
    else intervals.push([s, e])
  }
  intervals.sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = []
  for (const interval of intervals) {
    const last = merged.at(-1)
    if (last && interval[0] <= last[1]) last[1] = Math.max(last[1], interval[1])
    else merged.push([...interval])
  }
  return merged
}
export const downlinkGBDay = (lineMbps: number, minutes: number, efficiency: number) =>
  lineMbps * minutes * 0.0075 * efficiency

export function link(bus: Bus, radio: Radio, ground: Ground, context: EvaluationContext): LinkService {
  const angular = radio.antenna.kind === 'omni' || atMost(bus.errorDeg, radio.antenna.errorDeg)
  const evidence = [context.fixture.linkClosure, context.fixture.receiverCompatible]
  const failed = !angular || evidence.some(e => e.state === 'known' && !e.value)
  const missing = evidence.some(e => e.state === 'unknown')
  const periodic = context.fixture.evenlySpaced.state === 'known' && context.fixture.evenlySpaced.value
  const n = ground.contactsPerDay
  const intervals = n > 0 && Number.isInteger(n) && periodic
    ? unionWindows(Array.from({ length: n }, (_, i) => [i * 1440 / n, i * 1440 / n + ground.lengthMin] as const)) : []
  const rateGBMin = radio.lineMbps * 0.0075 * ground.efficiency
  const windows: ServiceWindow[] = intervals.map(([startMin, endMin]) => ({
    startMin, endMin, rateGBMin, capacityGB: (endMin - startMin) * rateGBMin,
  }))
  const capacity = windows.reduce((sum, w) => sum + w.capacityGB, 0)
  const nominal = periodic ? finite(capacity, 'GB/day') : unknown('GB/day', 'contact-schedule')
  const state = failed || n === 0 ? 'unavailable' : missing || !periodic ? 'unknown' : 'available'
  return {
    state, contactFixtureId: context.fixtureRevision,
    nominalCapacityGBDay: nominal,
    effectiveCapacityGBDay: state === 'unavailable' ? finite(0, 'GB/day') : state === 'unknown' ? unknown('GB/day', 'link-or-contact-evidence') : nominal,
    windows: state === 'unknown' ? { state: 'unknown', missingEvidenceIds: ['link-or-contact-evidence'] } : known(state === 'unavailable' ? [] : windows),
    reasonIds: failed ? ['ENG-LINK'] : missing || !periodic ? ['missing-link-or-contact-evidence'] : n === 0 ? ['no-contacts'] : [],
  }
}
