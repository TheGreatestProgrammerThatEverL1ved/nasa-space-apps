import type { EvaluationContext, Evidence, MissionConfiguration, Part } from './types'
import { validSciencePolicy } from './science'

export const CONFIG_KEYS = ['scenarioId', 'payloadId', 'busId', 'arrayId', 'batteryId', 'radioId', 'groundId', 'orbitId', 'launcherId'] as const
export function parseRequest(request: unknown): { config: MissionConfiguration | null; issues: string[] } {
  if (!request || typeof request !== 'object' || Array.isArray(request)) return { config: null, issues: ['configuration'] }
  const object = request as Record<string, unknown>
  const issues = [
    ...CONFIG_KEYS.filter(key => typeof object[key] !== 'string' || object[key] === ''),
    ...Object.keys(object).filter(key => !CONFIG_KEYS.includes(key as typeof CONFIG_KEYS[number])),
  ]
  return {
    // Preserve individually valid selections so malformed ground data cannot
    // erase an independently established mass/budget failure.
    config: Object.fromEntries(CONFIG_KEYS.map(key => [key, typeof object[key] === 'string' ? object[key] : ''])) as unknown as MissionConfiguration,
    issues,
  }
}

export function validatePart(part: Part): string[] {
  const issues: string[] = []
  const fields: Record<Part['category'], readonly string[]> = {
    bus: ['housekeepingW', 'storageGB', 'errorDeg', 'powerPackageLimitKg', 'spacecraftLimitKg', 'lifeYears'],
    payload: ['activeW', 'peakW', 'widthPixels', 'heightPixels', 'bitsPerPixel', 'framesPerSecond', 'duty', 'referenceGSDm', 'referenceAltitudeKm', 'crossFovDeg', 'alongFovDeg', 'exposureSeconds', 'errorLimitDeg'],
    array: ['bolW', 'annualLoss'], battery: ['nominalWh', 'dod', 'dischargeW', 'lifeYears'],
    radio: ['lineMbps', 'dcW'], ground: ['contactsPerDay', 'lengthMin', 'efficiency', 'processingHours', 'annualOpsUsd'],
    orbit: ['altitudeKm', 'inclinationDeg', 'eclipseFraction', 'residenceYears'],
    launcher: ['slotLimitKg', 'adapterKg', 'queueMonths'],
  }
  for (const key of ['massKg', 'costUsd', 'leadMonths', ...(fields[part.category] ?? [])]) {
    const value = (part as unknown as Record<string, unknown>)[key]
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) issues.push(`${part.id}.${key}`)
  }
  for (const [key, value] of Object.entries(part)) {
    if (typeof value === 'number' && (!Number.isFinite(value) || value < 0)) issues.push(`${part.id}.${key}`)
    if (key !== 'id' && key !== 'label' && key !== 'category' && key !== 'evidence' && !part.evidence?.[key]) issues.push(`${part.id}.evidence.${key}`)
  }
  if (['bus', 'payload', 'array', 'battery', 'radio'].includes(part.category) && part.massKg <= 0) issues.push(`${part.id}.massKg`)
  const positive = ['storageGB', 'spacecraftLimitKg', 'slotLimitKg', 'nominalWh', 'dischargeW', 'bolW', 'lineMbps', 'altitudeKm', 'referenceAltitudeKm', 'referenceGSDm', 'widthPixels', 'heightPixels', 'exposureSeconds']
  for (const key of positive) if (key in part && (part as unknown as Record<string, number>)[key] <= 0) issues.push(`${part.id}.${key}`)
  if (part.category === 'ground' && (!Number.isInteger(part.contactsPerDay) || (part.contactsPerDay > 0 && part.lengthMin <= 0) || part.lengthMin > 1440 || part.contactsPerDay * part.lengthMin > 1440 || part.efficiency <= 0 || part.efficiency > 1)) issues.push(`${part.id}.contacts-or-efficiency`)
  if (part.category === 'payload' && (part.duty > 1 || part.errorLimitDeg <= 0 || part.crossFovDeg <= 0 || part.crossFovDeg >= 180)) issues.push(`${part.id}.payload-domain`)
  if (part.category === 'battery' && (part.dod <= 0 || part.dod > 1)) issues.push(`${part.id}.dod`)
  if (part.category === 'array' && part.annualLoss >= 1) issues.push(`${part.id}.annualLoss`)
  if (part.category === 'orbit' && part.eclipseFraction > 1) issues.push(`${part.id}.eclipseFraction`)
  if (part.category === 'bus' && (!validEvidence(part.jitterArcsec, 'number') || part.jitterArcsec.state === 'known' && part.jitterArcsec.value < 0)) issues.push(`${part.id}.jitterArcsec`)
  if (part.category === 'radio' && (!part.antenna || !['directed', 'omni'].includes(part.antenna.kind) || part.antenna.kind === 'directed' && (!Number.isFinite(part.antenna.errorDeg) || part.antenna.errorDeg <= 0))) issues.push(`${part.id}.antenna`)
  if (part.category === 'payload' && !validBands(part.bandsMicrometers)) issues.push(`${part.id}.bandsMicrometers`)
  if (part.category === 'payload' && part.mode !== undefined && part.mode !== 'visible-bayer') issues.push(`${part.id}.mode`)
  if ('busIds' in part && (!Array.isArray(part.busIds) || !part.busIds.every(id => typeof id === 'string'))) issues.push(`${part.id}.busIds`)
  if (!part.evidence || typeof part.evidence !== 'object' || Object.values(part.evidence).some(value => !validProvenance(value))) issues.push(`${part.id}.evidence`)
  return issues
}
export function validBands(bands: unknown): bands is readonly (readonly [number, number])[] {
  return Array.isArray(bands) && bands.every(pair => Array.isArray(pair) && pair.length === 2 && pair.every(x => typeof x === 'number' && Number.isFinite(x) && x > 0) && pair[0] <= pair[1])
}
export function validateContext(context: EvaluationContext): string[] {
  const issues: string[] = []
  for (const key of ['modelRevision', 'contractRevision', 'catalogRevision', 'scenarioRevision', 'fixtureRevision'] as const) {
    if (typeof context?.[key] !== 'string' || !context[key]) issues.push(key)
  }
  if (!Array.isArray(context?.fixture?.targetOrbitIds) || !context.fixture.targetOrbitIds.every(id => typeof id === 'string')) issues.push('fixture.targetOrbitIds')
  for (const [key, category] of COLLECTIONS) {
    const rows = context?.catalog?.[key]
    if (!Array.isArray(rows)) { issues.push(`catalog.${key}`); continue }
    const ids = new Set<string>()
    for (const row of rows) {
      if (!recordShape(row, category)) { issues.push(`catalog.${key}.record`); continue }
      if (ids.has(row.id)) issues.push(`catalog.${key}.duplicate-id`)
      ids.add(row.id)
      issues.push(...validatePart(row))
    }
  }
  for (const key of ['budgetUsd', 'availableMonths', 'plannedYears', 'fundedYears', 'acceptedFraction'] as const) {
    const value = context?.scenario?.[key]
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) issues.push(`scenario.${key}`)
  }
  if (context?.scenario?.acceptedFraction > 1) issues.push('scenario.acceptedFraction')
  const scenario = context?.scenario
  const id = scenario?.id
  const policy = scenario?.science
  if (id !== undefined && !['wildfire', 'urban-heat', 'visible-mapping'].includes(id)) issues.push('scenario.id')
  if (policy !== undefined && !validSciencePolicy(policy)) issues.push('scenario.science')
  if (id === 'urban-heat' && (!validSciencePolicy(policy) || policy.prefix !== 'UH')) issues.push('scenario.science')
  if (id === 'visible-mapping' && (!validSciencePolicy(policy) || policy.prefix !== 'VM')) issues.push('scenario.science')
  if ((id === 'wildfire' || id === undefined) && policy !== undefined && (!validSciencePolicy(policy) || policy.prefix !== 'WF')) issues.push('scenario.science')
  if (id === undefined && policy !== undefined) issues.push('scenario.id')
  if ((context?.fixture?.scenarioId ?? 'wildfire') !== (id ?? 'wildfire')) issues.push('fixture.scenarioId')
  for (const key of ['receiverCompatible', 'linkClosure', 'evenlySpaced', 'modePlacement'] as const) {
    if (!validEvidence(context?.fixture?.[key], 'boolean')) issues.push(`fixture.${key}`)
  }
  if (!validEvidence(context?.fixture?.targetGapHours, 'number')) issues.push('fixture.targetGapHours')
  const tracking = context?.fixture?.tracking
  if (!validTracking(tracking)) issues.push('tracking')
  const gap = context?.fixture?.targetGapHours
  if (gap?.state === 'known' && (!Number.isFinite(gap.value) || gap.value <= 0)) issues.push('targetGapHours')
  return issues
}
function validEvidence(value: unknown, type: 'boolean' | 'number'): boolean {
  if (!value || typeof value !== 'object') return false
  const e = value as { state?: string; value?: unknown; missingEvidenceIds?: unknown; provenance?: unknown }
  if (e.state === 'unknown') return Array.isArray(e.missingEvidenceIds) && e.missingEvidenceIds.length > 0 && e.missingEvidenceIds.every(id => typeof id === 'string')
  return e.state === 'known' && typeof e.value === type && (type !== 'number' || Number.isFinite(e.value)) && validProvenance(e.provenance)
}
function validProvenance(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const p = value as Record<string, unknown>
  return ['verified-reference', 'derived', 'provisional'].includes(p.kind as string)
    && Array.isArray(p.sourceRefs) && p.sourceRefs.every(x => typeof x === 'string')
    && Array.isArray(p.assumptionIds) && p.assumptionIds.every(x => typeof x === 'string')
}
const COLLECTIONS = [
  ['buses', 'bus'], ['arrays', 'array'], ['batteries', 'battery'], ['payloads', 'payload'],
  ['radios', 'radio'], ['grounds', 'ground'], ['orbits', 'orbit'], ['launchers', 'launcher'],
] as const
function recordShape(value: unknown, category: string): value is Part {
  if (!value || typeof value !== 'object') return false
  const row = value as Record<string, unknown>
  return typeof row.id === 'string' && row.category === category
}
function validTracking(value: EvaluationContext['fixture']['tracking'] | undefined): boolean {
  if (!value) return false
  if (value.mode === 'disabled' || value.mode === 'unknown') return true
  return value.mode === 'accepted' && Array.isArray(value.busIds) && value.busIds.every(id => typeof id === 'string')
    && [value.maxRateDegSec, value.residualSpeedMps].every(Number.isFinite) && value.maxRateDegSec > 0 && value.residualSpeedMps >= 0 && validProvenance(value.provenance)
}
/** Invalid prerequisites become explicitly unknown, not optimistic defaults.
 * Their original validation issues remain on the report. */
export function normalizeContext(context: EvaluationContext): EvaluationContext {
  const missing = { state: 'unknown', missingEvidenceIds: ['invalid-context-prerequisite'] } as const
  const boolean = (value: Evidence<boolean> | undefined) => validEvidence(value, 'boolean') ? value! : missing
  const raw = context?.fixture
  const tracking = raw?.tracking
  const scenario = context?.scenario
  const catalog = context?.catalog
  const rows = (key: keyof EvaluationContext['catalog'], category: string) => {
    const value = catalog?.[key]
    return Array.isArray(value) ? value.filter(row => recordShape(row, category)) : []
  }
  return {
    modelRevision: context?.modelRevision ?? 'invalid', contractRevision: context?.contractRevision ?? 'invalid',
    catalogRevision: context?.catalogRevision ?? 'invalid', scenarioRevision: context?.scenarioRevision ?? 'invalid', fixtureRevision: context?.fixtureRevision ?? 'invalid',
    catalog: {
      buses: rows('buses', 'bus').map(b => !validEvidence((b as EvaluationContext['catalog']['buses'][number]).jitterArcsec, 'number') ? { ...b, jitterArcsec: missing } : b) as EvaluationContext['catalog']['buses'],
      arrays: rows('arrays', 'array') as EvaluationContext['catalog']['arrays'],
      batteries: rows('batteries', 'battery') as EvaluationContext['catalog']['batteries'],
      payloads: rows('payloads', 'payload') as EvaluationContext['catalog']['payloads'],
      radios: rows('radios', 'radio') as EvaluationContext['catalog']['radios'],
      grounds: rows('grounds', 'ground') as EvaluationContext['catalog']['grounds'],
      orbits: rows('orbits', 'orbit') as EvaluationContext['catalog']['orbits'],
      launchers: rows('launchers', 'launcher') as EvaluationContext['catalog']['launchers'],
    },
    scenario: {
      ...(scenario && 'id' in scenario ? { id: scenario.id } : {}),
      ...(scenario && 'science' in scenario ? { science: scenario.science } : {}),
      budgetUsd: scenario?.budgetUsd ?? NaN, availableMonths: scenario?.availableMonths ?? NaN,
      plannedYears: scenario?.plannedYears ?? NaN, fundedYears: scenario?.fundedYears ?? NaN, acceptedFraction: scenario?.acceptedFraction ?? NaN,
    },
    fixture: {
      ...(raw && 'scenarioId' in raw ? { scenarioId: raw.scenarioId } : {}),
      receiverCompatible: boolean(raw?.receiverCompatible), linkClosure: boolean(raw?.linkClosure),
      evenlySpaced: boolean(raw?.evenlySpaced), modePlacement: boolean(raw?.modePlacement),
      targetGapHours: validEvidence(raw?.targetGapHours, 'number') && (raw.targetGapHours.state !== 'known' || raw.targetGapHours.value > 0) ? raw.targetGapHours : missing,
      targetOrbitIds: Array.isArray(raw?.targetOrbitIds) ? raw.targetOrbitIds : [],
      tracking: validTracking(tracking) ? tracking : { mode: 'unknown' },
    },
  }
}
