import type { CheckResult, Counts, EvaluationContext, EvaluationReport, Metric, MissionConfiguration, Outcome, Part } from './types'
import { ENGINEERING_IDS } from './constants'
import { scienceIds, validSciencePolicy, WILDFIRE_SCIENCE } from './science'
import { atLeast, compare, finite, numberOf, unknown } from './metric'
import { geometry } from './geometry'
import { power } from './power'
import { link } from './link'
import { queue } from './queue'
import { CONFIG_KEYS, normalizeContext, parseRequest, validateContext, validatePart, validBands } from './validate'

export function configurationKey(config: MissionConfiguration, context: EvaluationContext): string {
  return JSON.stringify([context.modelRevision, context.contractRevision, context.catalogRevision, context.scenarioRevision, context.fixtureRevision, ...CONFIG_KEYS.map(k => config[k])])
}
function counts(checks: readonly CheckResult[]): Counts {
  return { MET: checks.filter(c => c.status === 'MET').length, NOT_MET: checks.filter(c => c.status === 'NOT_MET').length, UNVERIFIED: checks.filter(c => c.status === 'UNVERIFIED').length, total: checks.length }
}
export function scienceMerit(values: readonly { value: number; minimum: number; stretch: number; weight: number; direction: 'lower' | 'higher' }[]): number {
  const credits = values.map(v => {
    if (!(v.value > 0 && v.minimum > 0 && v.stretch > 0) || v.minimum === v.stretch) return 0
    const p = v.direction === 'higher' ? Math.log(v.value / v.minimum) / Math.log(v.stretch / v.minimum) : Math.log(v.minimum / v.value) / Math.log(v.minimum / v.stretch)
    return Math.max(0, Math.min(1, p)) * v.weight
  })
  const weight = values.reduce((s, v) => s + v.weight, 0)
  return 70 + (weight > 0 ? 30 * credits.reduce((a, b) => a + b, 0) / weight : 0)
}
function freeze<T>(value: T): T {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value) }
  return value
}
export function evaluateMission(request: unknown, context: EvaluationContext): EvaluationReport {
  const contextIssues = validateContext(context)
  context = normalizeContext(context)
  const parsed = parseRequest(request)
  const c = parsed.config
  const science = validSciencePolicy(context.scenario.science) ? context.scenario.science
    : context.scenario.id === undefined && context.scenario.science === undefined ? WILDFIRE_SCIENCE : null
  const prefix = context.scenario.id === 'urban-heat' ? 'UH' : context.scenario.id === 'visible-mapping' ? 'VM' : 'WF'
  const scienceCheckIds = scienceIds({ prefix })
  const cat = context.catalog
  const b = cat.buses.find(p => p.id === c?.busId)
  const p = cat.payloads.find(p => p.id === c?.payloadId)
  const a = cat.arrays.find(p => p.id === c?.arrayId)
  const battery = cat.batteries.find(p => p.id === c?.batteryId)
  const r = cat.radios.find(p => p.id === c?.radioId)
  const g = cat.grounds.find(p => p.id === c?.groundId)
  const o = cat.orbits.find(p => p.id === c?.orbitId)
  const launch = cat.launchers.find(p => p.id === c?.launcherId)
  const parts = [b, p, a, battery, r, g, o, launch]
  const issues = [...parsed.issues, ...contextIssues]
  if (c) {
    if (context.scenario.id !== undefined ? c.scenarioId !== context.scenario.id
      : !['wildfire', 'flood', 'methane'].includes(c.scenarioId)) issues.push('scenarioId')
    for (const [index, part] of parts.entries()) if (!part) issues.push(['busId', 'payloadId', 'arrayId', 'batteryId', 'radioId', 'groundId', 'orbitId', 'launcherId'][index])
  }
  for (const part of parts) if (part) issues.push(...validatePart(part))
  const metrics: Record<string, Metric> = {}
  const checks: CheckResult[] = []
  const add = (id: string, actual: Metric, operator: CheckResult['operator'], limit: number, reasonCode: string, prerequisites: readonly string[] = [], actualBasis?: 'upper-bound') => {
    if (!Number.isFinite(limit)) { actual = unknown(actual.unit, 'invalid-limit'); limit = 0 }
    checks.push({ ...(actualBasis ? { actualBasis } : {}), checkId: id, scope: scienceCheckIds.includes(id) ? 'science' : 'engineering', actual, operator, limit, status: compare(actual, operator, limit), reasonCode, ruleRef: scienceCheckIds.includes(id) && prefix !== 'WF' ? 'docs/scenario-expansion.md' : 'docs/game-rules-technical.md#6-hard-gates-reason-codes-and-outcome-precedence', prerequisiteIds: prerequisites })
  }
  const store = (key: string, value: number, unit: string) => { metrics[key] = finite(value, unit); return metrics[key] }
  const missing = (unit = '') => unknown(unit, 'invalid-or-missing-prerequisite')
  // All independent fields are evaluated even when another ID/evidence field is bad.
  const spacecraft = b && p && a && battery && r ? (b.massKg + p.massKg + a.massKg + battery.massKg + r.massKg) * 1.15 : undefined
  const mass = spacecraft === undefined ? missing('kg') : store('massKg', spacecraft, 'kg')
  const slot = spacecraft !== undefined && launch ? store('slotKg', spacecraft + launch.adapterKg, 'kg') : missing('kg')
  const complete = parts.every(Boolean)
  const subtotal = complete && g ? (parts as Part[]).reduce((sum, part) => sum + part.costUsd, 0) + g.annualOpsUsd * context.scenario.plannedYears : undefined
  const total = subtotal === undefined ? missing('USD') : store('totalUsd', subtotal * 1.15, 'USD')
  if (subtotal !== undefined) store('subtotalUsd', subtotal, 'USD')
  const schedule = complete && launch ? store('scheduleMonths', Math.max(...(parts as Part[]).map(part => part.leadMonths)) + 4 + launch.queueMonths, 'month') : missing('month')
  const geom = b && p && o && b.jitterArcsec && [b.errorDeg, p.referenceGSDm, p.referenceAltitudeKm, p.crossFovDeg, p.exposureSeconds, o.altitudeKm].every(Number.isFinite) ? geometry(b, p, o, context.fixture.tracking) : null
  const validGround = g && Number.isInteger(g.contactsPerDay) && g.contactsPerDay >= 0 && (g.contactsPerDay === 0 || g.lengthMin > 0) && g.contactsPerDay * g.lengthMin <= 1440 && [g.lengthMin, g.efficiency, g.processingHours].every(Number.isFinite)
  const energy = b && p && a && battery && r && validGround && o ? power(b, p, a, battery, r, g!, o, context.scenario.plannedYears) : null
  const pointingKnown = b && r && Number.isFinite(b.errorDeg) && b.errorDeg >= 0 && r.antenna
    && (r.antenna.kind === 'omni' || r.antenna.kind === 'directed' && Number.isFinite(r.antenna.errorDeg) && r.antenna.errorDeg > 0)
  const service = pointingKnown && Number.isFinite(r!.lineMbps) && validGround ? link(b!, r!, g!, context) : null
  const generation = p && validBands(p.bandsMicrometers) && [p.widthPixels, p.heightPixels, p.bitsPerPixel, p.duty, p.framesPerSecond].every(Number.isFinite) ? p.widthPixels * p.heightPixels * p.bandsMicrometers.length * p.bitsPerPixel / 8 * 86400 * p.duty * p.framesPerSecond / 1e9 : undefined
  const storage = b ? b.storageGB * .8 : undefined
  const q = service && generation !== undefined && storage !== undefined && g ? queue(service, generation, storage, g, context.scenario.acceptedFraction) : null
  if (generation !== undefined) store('generatedGBDay', generation, 'GB/day')
  if (storage !== undefined) store('usableStorageGB', storage, 'GB')
  if (q) {
    metrics.queuePeakGB = q.peakGB; metrics.backlogGBDay = q.backlogGBDay
    metrics.latencyHours = q.latencyHours; metrics.deliveredUsefulGBDay = q.usefulGBDay
    metrics.saturationEstimateDays = q.saturationEstimateDays
  }
  metrics.physicalObservationAgeHours = unknown('h', 'observation-to-smoothed-arrival-mapping-not-established')
  if (service) { metrics.effectiveDownlinkGBDay = service.effectiveCapacityGBDay; metrics.nominalDownlinkGBDay = service.nominalCapacityGBDay }
  if (geom) {
    for (const key of ['nativeGSDm', 'staticOffsetKm', 'swathKm', 'usableSwathKm', 'untrackedSpeedMps', 'trackingRateDegSec', 'periodMin'] as const) store(key, geom[key], key.endsWith('Km') ? 'km' : key.endsWith('Mps') ? 'm/s' : key === 'periodMin' ? 'min' : key.endsWith('DegSec') ? '°/s' : 'm')
    metrics.effectiveScaleM = geom.effectiveScaleM; metrics.jitterGroundM = geom.jitterGroundM; metrics.smearM = geom.smearM
  }
  if (energy) {
    const map = { arrayWhOrbitBOL: energy.bolWh, arrayWhOrbitEOL: energy.eolWh, arrayRequiredWhOrbit: energy.requiredWh, eclipseDemandWh: energy.eclipseDemandWh, batteryUsableWhEOL: energy.usableBatteryWh, peakWh: energy.peakWh }
    Object.entries(map).forEach(([key, v]) => store(key, v, 'Wh'))
    store('peakW', energy.peakW, 'W'); store('avgLoadW', energy.avgLoadW, 'W')
    store('contactsPerOrbit', energy.contactsPerOrbit, ''); store('sunlightMin', energy.sunlightMin, 'min'); store('activityMin', energy.activityMin, 'min')
  }
  const modeKnown = context.fixture.modePlacement
  const modeMetric = modeKnown.state === 'known' && !modeKnown.value ? finite(0) : modeKnown.state === 'unknown' ? missing() : energy ? finite(energy.activityMin <= energy.sunlightMin + 1e-9 * Math.max(1, Math.abs(energy.sunlightMin)) ? 1 : 0) : missing()
  add('ENG-MASS', mass, '<=', b?.spacecraftLimitKg ?? 0, 'CDS_MASS_LIMIT')
  add('ENG-SLOT', slot, '<=', launch?.slotLimitKg ?? 0, 'LAUNCH_INCOMPATIBLE')
  add('ENG-LAUNCH-INTERFACE', launch && b && o && Array.isArray(launch.busIds) && Array.isArray(launch.orbitIds) ? finite(launch.busIds.includes(b.id) && launch.orbitIds.includes(o.id) ? 1 : 0) : missing(), 'true', 1, 'LAUNCH_INCOMPATIBLE')
  add('ENG-PAYLOAD-FIT', p && b && Array.isArray(p.busIds) ? finite(p.busIds.includes(b.id) ? 1 : 0) : missing(), 'true', 1, 'PAYLOAD_INCOMPATIBLE')
  add('ENG-POWER-PACKAGE-FIT', a && battery && b && Array.isArray(a.busIds) ? finite(a.busIds.includes(b.id) && a.massKg + battery.massKg <= b.powerPackageLimitKg + 1e-9 * Math.max(1, b.powerPackageLimitKg) ? 1 : 0) : missing(), 'true', 1, 'STRUCTURE_OVERLOAD')
  add('ENG-BUDGET', total, '<=', context.scenario.budgetUsd, 'OVER_BUDGET')
  add('ENG-SCHEDULE', schedule, '<=', context.scenario.availableMonths, 'SCHEDULE_INFEASIBLE')
  add('ENG-MODES', modeMetric, 'true', 1, 'OPERATIONS_CONFLICT')
  add('ENG-POWER-BOL', energy ? finite(energy.bolWh, 'Wh') : missing('Wh'), '>=', energy?.requiredWh ?? 0, 'POWER_DEFICIT')
  add('ENG-POWER-EOL', energy ? finite(energy.eolWh, 'Wh') : missing('Wh'), '>=', energy?.requiredWh ?? 0, energy && atLeast(energy.bolWh, energy.requiredWh) ? 'POWER_DEGRADATION' : 'POWER_DEFICIT')
  add('ENG-ECLIPSE', energy ? finite(energy.usableBatteryWh, 'Wh') : missing('Wh'), '>=', energy?.eclipseDemandWh ?? 0, 'ECLIPSE_OUTAGE')
  add('ENG-PEAK-W', battery && energy ? finite(battery.dischargeW, 'W') : missing('W'), '>=', energy?.peakW ?? 0, 'PEAK_POWER_FAIL')
  add('ENG-PEAK-WH', energy ? finite(energy.usableBatteryWh, 'Wh') : missing('Wh'), '>=', energy?.peakWh ?? 0, 'PEAK_POWER_FAIL')
  add('ENG-PAYLOAD-POINTING', b && p ? finite(b.errorDeg, '°') : missing('°'), '<=', p?.errorLimitDeg ?? 0, 'POINTING_UNSTABLE')
  add('ENG-MOTION-PROFILE', geom ? geom.motionStatus === 'UNVERIFIED' ? missing() : finite(geom.motionStatus === 'MET' ? 1 : 0) : missing(), 'true', 1, 'POINTING_UNSTABLE')
  const knownLinkFail = b && r && r.antenna?.kind === 'directed' && compare(finite(b.errorDeg), '<=', r.antenna.errorDeg) === 'NOT_MET'
  const linkMetric = knownLinkFail ? finite(0) : context.fixture.linkClosure.state === 'known' && !context.fixture.linkClosure.value || context.fixture.receiverCompatible.state === 'known' && !context.fixture.receiverCompatible.value ? finite(0)
    : context.fixture.linkClosure.state === 'unknown' || context.fixture.receiverCompatible.state === 'unknown' || !pointingKnown ? missing() : finite(1)
  add('ENG-LINK', linkMetric, 'true', 1, 'LINK_UNCLOSED')
  const rate = q ? q.perContactStable === 'UNVERIFIED' ? missing() : finite(q.perContactStable === 'MET' ? 1 : 0) : missing()
  add('ENG-DATA-RATE', rate, 'true', 1, 'DATA_BOTTLENECK', ['ENG-LINK'])
  add('ENG-STORAGE', q?.peakGB ?? missing('GB'), '<=', storage ?? 0, 'STORAGE_SATURATED', ['ENG-DATA-RATE'])
  const supported = b && battery && o ? Math.min(b.lifeYears, battery.lifeYears, o.residenceYears, context.scenario.fundedYears) : undefined
  if (supported !== undefined) store('supportedYears', supported, 'year')
  add('ENG-LIFETIME', supported === undefined ? missing('year') : finite(supported, 'year'), '>=', context.scenario.plannedYears, 'LIFETIME_SHORT')
  add(`${prefix}-SPECTRUM`, science && p && validBands(p.bandsMicrometers) ? finite((prefix !== 'VM' || p.mode === 'visible-bayer') && p.bandsMicrometers.some(([low, high]) => low <= science.spectrumMicrometers[0] && high >= science.spectrumMicrometers[1]) ? 1 : 0) : missing(), 'true', science ? 1 : NaN, 'SCIENCE_REQUIREMENT_UNMET')
  add(`${prefix}-GSD`, geom?.effectiveScaleM ?? missing('m'), '<=', science?.maxScaleM ?? NaN, 'SCIENCE_REQUIREMENT_UNMET', ['ENG-MOTION-PROFILE'])
  add(`${prefix}-FOOTPRINT`, geom ? finite(geom.usableSwathKm, 'km') : missing('km'), '>=', science?.minFootprintKm ?? NaN, 'SCIENCE_REQUIREMENT_UNMET')
  const access = o && context.fixture.targetOrbitIds.includes(o.id) && context.fixture.targetGapHours.state === 'known' ? finite(context.fixture.targetGapHours.value, 'h') : missing('h')
  metrics.targetGapHours = access
  add(`${prefix}-ACCESS`, access, '<=', science?.maxAccessHours ?? NaN, 'SCIENCE_REQUIREMENT_UNMET')
  // Preserve audited WF reports. For new missions, an insufficient optimistic
  // ceiling proves failure even when unstable-queue achieved delivery is unknown.
  const capacity = service ? numberOf(service.effectiveCapacityGBDay) : undefined
  const usefulCeiling = prefix !== 'WF' && generation !== undefined && capacity !== undefined
    ? store('usefulUpperBoundGBDay', Math.min(generation, capacity) * context.scenario.acceptedFraction, 'GB/day') : undefined
  const insufficientCeiling = science && usefulCeiling && compare(usefulCeiling, '>=', science.minUsefulGBDay) === 'NOT_MET'
    && q?.usefulGBDay.kind !== 'finite'
  add(`${prefix}-DELIVERY`, insufficientCeiling ? usefulCeiling! : q?.usefulGBDay ?? missing('GB/day'), '>=', science?.minUsefulGBDay ?? NaN, 'SCIENCE_REQUIREMENT_UNMET', ['ENG-LINK', 'ENG-DATA-RATE', 'ENG-STORAGE'], insufficientCeiling ? 'upper-bound' : undefined)
  add(`${prefix}-LATENCY`, q?.latencyHours ?? missing('h'), '<=', science?.maxLatencyHours ?? NaN, 'SCIENCE_REQUIREMENT_UNMET', ['ENG-LINK', 'ENG-DATA-RATE', 'ENG-STORAGE'])
  add(`${prefix}-DURATION`, finite(context.scenario.plannedYears, 'year'), '>=', science?.minYears ?? NaN, 'LIFETIME_SHORT')
  const deferred = c && ['flood', 'methane'].includes(c.scenarioId) && !issues.length
  if (deferred) {
    for (let i = 0; i < checks.length; i++) checks[i] = { ...checks[i], status: 'UNVERIFIED', actual: missing() }
    for (const key of Object.keys(metrics)) metrics[key] = missing(metrics[key].unit)
  }
  const outcome: Outcome = issues.length ? 'FAILURE' : deferred ? 'DEFERRED' : checks.some(c => c.status === 'NOT_MET') ? 'FAILURE' : checks.some(c => c.status === 'UNVERIFIED') ? 'UNVERIFIED' : 'MODEL_PASS_PROVISIONAL'
  const warnings: string[] = []
  const margin = (key: string, capacity: number | undefined, demand: number | undefined, threshold?: number) => {
    metrics[`${key}Margin`] = capacity !== undefined && demand !== undefined && capacity > 0 ? finite((capacity - demand) / capacity, 'ratio') : missing('ratio')
    if (threshold !== undefined && metrics[`${key}Margin`].kind === 'finite' && (metrics[`${key}Margin`] as { value: number }).value < threshold) warnings.push(key.toUpperCase())
  }
  if (!deferred) {
    margin('mass', b?.spacecraftLimitKg, spacecraft, .1)
    margin('budget', context.scenario.budgetUsd, numberOf(total), .1)
    margin('data', service ? numberOf(service.effectiveCapacityGBDay) : undefined, generation, .1)
    margin('power', energy ? Math.min(energy.bolWh, energy.eolWh) : undefined, energy?.requiredWh, .15)
    margin('storage', storage, q ? numberOf(q.peakGB) : undefined)
    margin('eclipse', energy?.usableBatteryWh, energy?.eclipseDemandWh)
    margin('peakEnergy', energy?.usableBatteryWh, energy?.peakWh)
    margin('peakPower', battery?.dischargeW, energy?.peakW)
    if (schedule.kind === 'finite') { store('scheduleSlackMonths', context.scenario.availableMonths - schedule.value, 'month'); if (context.scenario.availableMonths - schedule.value < 6) warnings.push('SCHEDULE') }
  }
  const merit = outcome === 'MODEL_PASS_PROVISIONAL' && science ? finite(scienceMerit([
    { value: numberOf(metrics.effectiveScaleM)!, minimum: science.maxScaleM, stretch: science.stretch.scaleM, weight: .25, direction: 'lower' },
    { value: numberOf(access)!, minimum: science.maxAccessHours, stretch: science.stretch.accessHours, weight: .25, direction: 'lower' },
    { value: numberOf(metrics.deliveredUsefulGBDay)!, minimum: science.minUsefulGBDay, stretch: science.stretch.usefulGBDay, weight: .20, direction: 'higher' },
    { value: numberOf(metrics.latencyHours)!, minimum: science.maxLatencyHours, stretch: science.stretch.latencyHours, weight: .20, direction: 'lower' },
    { value: context.scenario.plannedYears, minimum: science.minYears, stretch: science.stretch.years, weight: .10, direction: 'higher' },
  ]), 'points') : unknown('points', 'hard-gates-not-all-met')
  const ordered = [...ENGINEERING_IDS, ...scienceCheckIds].map(id => checks.find(c => c.checkId === id)!)
  return freeze(structuredClone({
    origin: 'evaluator', configurationKey: c ? configurationKey(c, context) : JSON.stringify(['invalid', issues]), config: c,
    modelRevision: context.modelRevision, contractRevision: context.contractRevision,
    validation: { kind: issues.length ? 'invalid' : 'valid', issues }, outcome, checks: ordered, metrics,
    counts: { science: counts(ordered.filter(c => c.scope === 'science')), engineering: counts(ordered.filter(c => c.scope === 'engineering')) },
    diagnostics: [
      ...(issues.length ? [{ reasonCode: 'INVALID_INPUT', detailId: 'validation', checkIds: [], causeIds: issues, repairKey: 'INVALID_INPUT' }] : []),
      ...ordered.filter(c => c.status === 'NOT_MET').map(c => ({ reasonCode: c.reasonCode, detailId: c.checkId, checkIds: [c.checkId], causeIds: c.prerequisiteIds, repairKey: c.checkId })),
      ...ordered.filter(c => c.status === 'UNVERIFIED').map(c => ({ reasonCode: 'MISSING_EVIDENCE', detailId: c.checkId, checkIds: [c.checkId], causeIds: c.prerequisiteIds, repairKey: 'MISSING_EVIDENCE' })),
    ],
    warnings, assumptions: ['synthetic-access', 'synthetic-contacts', 'tracking', 'link', 'integration', 'costs', 'life', 'cloud-rejection'],
    sources: [...new Set((parts.filter(Boolean) as Part[]).flatMap(part => Object.values(part.evidence ?? {}).flatMap(e => e?.sourceRefs ?? [])))],
    service: deferred ? null : service, queue: deferred ? null : q, merit,
    timelineEligible: outcome === 'MODEL_PASS_PROVISIONAL',
  } satisfies EvaluationReport))
}
