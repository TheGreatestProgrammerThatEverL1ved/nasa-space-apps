import type { EvaluationContext, MissionConfiguration, Part } from './types'

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
  const positive = ['storageGB', 'spacecraftLimitKg', 'nominalWh', 'dischargeW', 'referenceAltitudeKm', 'referenceGSDm', 'widthPixels', 'heightPixels', 'exposureSeconds']
  for (const key of positive) if (key in part && (part as unknown as Record<string, number>)[key] <= 0) issues.push(`${part.id}.${key}`)
  if (part.category === 'ground' && (!Number.isInteger(part.contactsPerDay) || (part.contactsPerDay > 0 && part.lengthMin <= 0) || part.lengthMin > 1440 || part.contactsPerDay * part.lengthMin > 1440 || part.efficiency <= 0 || part.efficiency > 1)) issues.push(`${part.id}.contacts-or-efficiency`)
  if (part.category === 'payload' && (part.duty > 1 || part.errorLimitDeg <= 0 || part.crossFovDeg <= 0 || part.crossFovDeg >= 180)) issues.push(`${part.id}.payload-domain`)
  if (part.category === 'battery' && (part.dod <= 0 || part.dod > 1)) issues.push(`${part.id}.dod`)
  if (part.category === 'array' && part.annualLoss >= 1) issues.push(`${part.id}.annualLoss`)
  if (part.category === 'orbit' && part.eclipseFraction > 1) issues.push(`${part.id}.eclipseFraction`)
  if (part.category === 'bus' && (!part.jitterArcsec || !['known', 'unknown'].includes(part.jitterArcsec.state) || part.jitterArcsec.state === 'known' && (!Number.isFinite(part.jitterArcsec.value) || part.jitterArcsec.value < 0))) issues.push(`${part.id}.jitterArcsec`)
  if (part.category === 'radio' && (!part.antenna || !['directed', 'omni'].includes(part.antenna.kind) || part.antenna.kind === 'directed' && (!Number.isFinite(part.antenna.errorDeg) || part.antenna.errorDeg <= 0))) issues.push(`${part.id}.antenna`)
  if (part.category === 'payload' && !validBands(part.bandsMicrometers)) issues.push(`${part.id}.bandsMicrometers`)
  if ('busIds' in part && (!Array.isArray(part.busIds) || !part.busIds.every(id => typeof id === 'string'))) issues.push(`${part.id}.busIds`)
  return issues
}
export function validBands(bands: unknown): bands is readonly (readonly [number, number])[] {
  return Array.isArray(bands) && bands.every(pair => Array.isArray(pair) && pair.length === 2 && pair.every(x => typeof x === 'number' && Number.isFinite(x) && x > 0) && pair[0] <= pair[1])
}
export function validateContext(context: EvaluationContext): string[] {
  const issues: string[] = []
  for (const [key, value] of Object.entries(context.scenario)) {
    if (!Number.isFinite(value) || value < 0) issues.push(`scenario.${key}`)
  }
  if (context.scenario.acceptedFraction > 1) issues.push('scenario.acceptedFraction')
  const tracking = context.fixture.tracking
  if (tracking.mode === 'accepted' && (![tracking.maxRateDegSec, tracking.residualSpeedMps].every(Number.isFinite) || tracking.maxRateDegSec <= 0 || tracking.residualSpeedMps < 0)) issues.push('tracking')
  const gap = context.fixture.targetGapHours
  if (gap.state === 'known' && (!Number.isFinite(gap.value) || gap.value <= 0)) issues.push('targetGapHours')
  return issues
}
