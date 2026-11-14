import { describe, expect, it } from 'vitest'
import { MISSIONS, URBAN_MISSION, WILDFIRE_MISSION } from '../../src/data/scenarios'
import { DEFAULT_CONTEXT } from '../../src/data/context'
import { evaluateMission } from '../../src/engine/evaluate'
import { scienceIds, URBAN_SCIENCE, validSciencePolicy, WILDFIRE_SCIENCE } from '../../src/engine/science'
import type { EvaluationContext, SciencePolicy } from '../../src/engine/types'
import { FIRST_MISSION, WF_A, WF_B, WF_C } from '../../src/fixtures/builds'
import { check, type Mutable } from './helpers'

const urbanContext = () => structuredClone(URBAN_MISSION.context) as Mutable<EvaluationContext>
const urbanPass = URBAN_MISSION.passingConfiguration

it('defines complete bilingual scenarios and preserves audited default context identity', () => {
  expect(WILDFIRE_MISSION.context).toBe(DEFAULT_CONTEXT)
  expect(MISSIONS.map(m => m.id)).toEqual(['wildfire', 'urban-heat', 'visible-mapping'])
  for (const mission of MISSIONS) {
    for (const locale of ['en', 'ua'] as const) {
      for (const key of ['title', 'subtitle', 'brief', 'hint', 'goals', 'lesson'] as const) {
        expect(mission[key][locale].trim().length).toBeGreaterThan(0)
      }
    }
    expect(mission.sources.every(s => s.url.startsWith('https://'))).toBe(true)
    expect(evaluateMission(mission.passingConfiguration, mission.context).outcome).toBe('MODEL_PASS_PROVISIONAL')
  }
})

it('keeps WF-A/B/C passing and the single-station wildfire starter failing', () => {
  for (const build of [WF_A, WF_B, WF_C]) {
    const result = evaluateMission(build, DEFAULT_CONTEXT)
    expect(result.outcome).toBe('MODEL_PASS_PROVISIONAL')
    expect(result.checks.filter(c => c.scope === 'science').map(c => c.checkId)).toEqual(scienceIds(WILDFIRE_SCIENCE))
  }
  expect(check(evaluateMission(FIRST_MISSION, DEFAULT_CONTEXT), 'WF-LATENCY').status).toBe('NOT_MET')
})

it('makes volume repair and the cross-mission single-station tradeoff real', () => {
  const failure = evaluateMission(URBAN_MISSION.initialConfiguration, URBAN_MISSION.context)
  expect(failure.outcome).toBe('FAILURE')
  expect(failure.metrics.effectiveDownlinkGBDay).toMatchObject({ value: 1.89 })
  expect(failure.metrics.deliveredUsefulGBDay.kind).toBe('unknown')
  expect(failure.metrics.usefulUpperBoundGBDay).toMatchObject({ value: 1.134 })
  expect(check(failure, 'ENG-DATA-RATE').status).toBe('NOT_MET')
  expect(check(failure, 'UH-DELIVERY').status).toBe('NOT_MET')
  expect(check(failure, 'UH-DELIVERY').actualBasis).toBe('upper-bound')
  expect(failure.metrics.latencyHours.kind).toBe('unknown')
  const pass = evaluateMission(urbanPass, URBAN_MISSION.context)
  expect(pass.outcome).toBe('MODEL_PASS_PROVISIONAL')
  expect(pass.metrics.latencyHours).toMatchObject({ value: 7.1 })
  expect(pass.metrics.totalUsd).toMatchObject({ value: 2_662_250 })
  expect(pass.metrics.queuePeakGB).toMatchObject({ value: .78299136 })
  expect(pass.metrics.physicalObservationAgeHours.kind).toBe('unknown')
  expect(pass.checks.filter(c => c.scope === 'science').map(c => c.checkId)).toEqual(scienceIds(URBAN_SCIENCE))
  expect(evaluateMission({ ...urbanPass, scenarioId: 'wildfire' }, DEFAULT_CONTEXT).outcome).toBe('FAILURE')
  expect(evaluateMission({ ...urbanPass, radioId: 'rf-s', groundId: 'gs-service', batteryId: 'bat-s' }, URBAN_MISSION.context).outcome).toBe('MODEL_PASS_PROVISIONAL')
})

it('rejects config/context and policy/fixture identity swaps in both directions', () => {
  expect(evaluateMission(urbanPass, DEFAULT_CONTEXT).validation.kind).toBe('invalid')
  expect(evaluateMission(WF_B, URBAN_MISSION.context).validation.kind).toBe('invalid')
  for (const mutate of [
    (c: Mutable<EvaluationContext>) => { c.scenario.science = structuredClone(WILDFIRE_SCIENCE) as Mutable<SciencePolicy> },
    (c: Mutable<EvaluationContext>) => { delete c.scenario.science },
    (c: Mutable<EvaluationContext>) => { delete c.scenario.id },
    (c: Mutable<EvaluationContext>) => { delete c.fixture.scenarioId },
    (c: Mutable<EvaluationContext>) => { c.fixture.scenarioId = 'wildfire' },
    (c: Mutable<EvaluationContext>) => { c.scenario.id = 'unknown' },
  ]) {
    const context = urbanContext()
    mutate(context)
    const result = evaluateMission(urbanPass, context)
    expect(result.outcome).toBe('FAILURE')
    expect(result.validation.kind).toBe('invalid')
  }
})

describe('policy guards', () => {
  it.each([null, undefined, [], {}, { ...URBAN_SCIENCE, maxLatencyHours: NaN },
    { ...URBAN_SCIENCE, minUsefulGBDay: Infinity }, { ...URBAN_SCIENCE, maxScaleM: 0 },
    { ...URBAN_SCIENCE, spectrumMicrometers: [12, 8] },
    { ...URBAN_SCIENCE, stretch: null },
    { ...URBAN_SCIENCE, stretch: { ...URBAN_SCIENCE.stretch, latencyHours: 13 } },
  ])('fails closed for malformed policy %#', policy => {
    expect(validSciencePolicy(policy)).toBe(false)
    const context = urbanContext()
    Reflect.set(context.scenario, 'science', policy)
    expect(evaluateMission(urbanPass, context).outcome).toBe('FAILURE')
  })
})

const boundaries = [
  ['maxScaleM', 'UH-GSD', 'effectiveScaleM', 'lower'],
  ['minFootprintKm', 'UH-FOOTPRINT', 'usableSwathKm', 'higher'],
  ['maxAccessHours', 'UH-ACCESS', 'targetGapHours', 'lower'],
  ['minUsefulGBDay', 'UH-DELIVERY', 'deliveredUsefulGBDay', 'higher'],
  ['maxLatencyHours', 'UH-LATENCY', 'latencyHours', 'lower'],
  ['minYears', 'UH-DURATION', null, 'higher'],
] as const

it.each(boundaries)('compares inclusive urban %s without adding an engineering tolerance', (field, id, metric, direction) => {
  const reference = evaluateMission(urbanPass, URBAN_MISSION.context)
  const actual = metric ? reference.metrics[metric] : { kind: 'finite', value: 1 }
  if (actual.kind !== 'finite') throw new Error('expected finite fixture')
  const context = urbanContext()
  context.scenario.science![field] = actual.value
  expect(check(evaluateMission(urbanPass, context), id).status).toBe('MET')
  context.scenario.science![field] = actual.value + (direction === 'higher' ? 1e-5 : -1e-5)
  expect(check(evaluateMission(urbanPass, context), id).status).toBe('NOT_MET')
})

it('has a compliant all-minimum merit-70 urban case', () => {
  const context = urbanContext()
  const reference = evaluateMission(urbanPass, context)
  for (const [field, , metric] of boundaries) {
    const actual = metric ? reference.metrics[metric] : { kind: 'finite', value: 1 }
    if (actual.kind === 'finite') context.scenario.science![field] = actual.value
  }
  const result = evaluateMission(urbanPass, context)
  expect(result.outcome).toBe('MODEL_PASS_PROVISIONAL')
  expect(result.merit).toMatchObject({ value: 70 })
})

it.each(['access', 'tracking', 'link', 'disabled-tracking', 'failed-link', 'visible-only'] as const)('preserves engineering/evidence semantics for urban %s', mode => {
  const context = urbanContext()
  if (mode === 'access') context.fixture.targetGapHours = { state: 'unknown', missingEvidenceIds: ['city-access'] }
  if (mode === 'tracking') context.fixture.tracking = { mode: 'unknown' }
  if (mode === 'disabled-tracking') context.fixture.tracking = { mode: 'disabled' }
  if (mode === 'link') context.fixture.linkClosure = { state: 'unknown', missingEvidenceIds: ['link'] }
  if (mode === 'failed-link' && context.fixture.linkClosure.state === 'known') context.fixture.linkClosure.value = false
  if (mode === 'visible-only') context.catalog.payloads[0]!.bandsMicrometers = [[.4, .7]]
  const result = evaluateMission(urbanPass, context)
  expect(result.outcome).toBe(['disabled-tracking', 'failed-link', 'visible-only'].includes(mode) ? 'FAILURE' : 'UNVERIFIED')
  if (mode === 'failed-link') expect(result.metrics.effectiveDownlinkGBDay).toMatchObject({ value: 0 })
})

it('never makes legacy deferred scenarios playable', () => {
  for (const scenarioId of ['flood', 'methane']) {
    expect(evaluateMission({ ...WF_B, scenarioId }, DEFAULT_CONTEXT).outcome).toBe('DEFERRED')
  }
})

// Keep structural typing explicit when policies are consumed outside React.
const policy: SciencePolicy = URBAN_SCIENCE
it('validates both adopted policies', () => {
  expect(validSciencePolicy(policy)).toBe(true)
  expect(validSciencePolicy(WILDFIRE_SCIENCE)).toBe(true)
})
