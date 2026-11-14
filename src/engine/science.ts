/** Pure teaching policy. Wildfire values are frozen by the Step 2 audit. */
import type { SciencePolicy } from './types'

export const WILDFIRE_SCIENCE: SciencePolicy = Object.freeze({
  prefix: 'WF', spectrumMicrometers: Object.freeze([8, 12] as const),
  maxScaleM: 200, minFootprintKm: 90, maxAccessHours: 24,
  minUsefulGBDay: 1, maxLatencyHours: 6, minYears: 1,
  stretch: Object.freeze({ scaleM: 150, accessHours: 12, usefulGBDay: 2, latencyHours: 2, years: 3 }),
})

/** Synthetic urban-planning game limits; not NASA requirements or retrieval accuracy. */
export const URBAN_SCIENCE: SciencePolicy = Object.freeze({
  prefix: 'UH', spectrumMicrometers: Object.freeze([8, 12] as const),
  maxScaleM: 180, minFootprintKm: 100, maxAccessHours: 24,
  minUsefulGBDay: 1.5, maxLatencyHours: 12, minYears: 1,
  stretch: Object.freeze({ scaleM: 150, accessHours: 12, usefulGBDay: 2, latencyHours: 6, years: 3 }),
})

/** Daylit clear-scene visible corridor mapping. Synthetic educational limits. */
export const VISIBLE_SCIENCE: SciencePolicy = Object.freeze({
  prefix: 'VM', spectrumMicrometers: Object.freeze([.45, .69] as const),
  maxScaleM: 60, minFootprintKm: 80, maxAccessHours: 24,
  minUsefulGBDay: .4, maxLatencyHours: 12, minYears: 1,
  stretch: Object.freeze({ scaleM: 45, accessHours: 12, usefulGBDay: .5, latencyHours: 6, years: 3 }),
})

export function scienceIds(policy: Pick<SciencePolicy, 'prefix'>): readonly string[] {
  return ['SPECTRUM', 'GSD', 'FOOTPRINT', 'ACCESS', 'DELIVERY', 'LATENCY', 'DURATION']
    .map(suffix => `${policy.prefix}-${suffix}`)
}
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
function positive(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}
export function validSciencePolicy(value: unknown): value is SciencePolicy {
  if (!record(value) || typeof value.prefix !== 'string' || !/^[A-Z][A-Z0-9]{0,7}$/.test(value.prefix)) return false
  const band = value.spectrumMicrometers
  if (!Array.isArray(band) || band.length !== 2 || !positive(band[0]) || !positive(band[1]) || band[0] > band[1]) return false
  const { maxScaleM, minFootprintKm, maxAccessHours, minUsefulGBDay, maxLatencyHours, minYears, stretch } = value
  if (!positive(maxScaleM) || !positive(minFootprintKm) || !positive(maxAccessHours)
    || !positive(minUsefulGBDay) || !positive(maxLatencyHours) || !positive(minYears) || !record(stretch)) return false
  const { scaleM, accessHours, usefulGBDay, latencyHours, years } = stretch
  return positive(scaleM) && scaleM <= maxScaleM
    && positive(accessHours) && accessHours <= maxAccessHours
    && positive(usefulGBDay) && usefulGBDay >= minUsefulGBDay
    && positive(latencyHours) && latencyHours <= maxLatencyHours
    && positive(years) && years >= minYears
}
