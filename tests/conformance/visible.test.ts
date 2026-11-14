import { expect, it } from 'vitest'
import { VISIBLE_CONTEXT, VISIBLE_MISSION, VISIBLE_PAYLOADS } from '../../src/data/missions/visible'
import { DEFAULT_CONTEXT } from '../../src/data/context'
import { evaluateMission } from '../../src/engine/evaluate'
import { WF_B } from '../../src/fixtures/builds'
import type { EvaluationContext } from '../../src/engine/types'
import { check, type Mutable } from './helpers'

const run = (payloadId: string) => evaluateMission({ ...VISIBLE_MISSION.passingConfiguration, payloadId }, VISIBLE_CONTEXT)
it('has a distinct lens choice: wide fails detail, medium passes, long fails width', () => {
  expect(check(run('pl-visible-8'), 'VM-GSD').status).toBe('NOT_MET')
  expect(check(run('pl-visible-70'), 'VM-FOOTPRINT').status).toBe('NOT_MET')
  const pass = run('pl-visible-35')
  expect(pass.outcome).toBe('MODEL_PASS_PROVISIONAL')
  expect(pass.metrics.effectiveScaleM).toMatchObject({ kind: 'finite' })
  expect((pass.metrics.effectiveScaleM as { value: number }).value).toBeCloseTo(47.72923847831441, 9)
  expect((pass.metrics.usableSwathKm as { value: number }).value).toBeCloseTo(93.65041207555566, 9)
  expect((pass.metrics.generatedGBDay as { value: number }).value).toBeCloseTo(.86973087744, 12)
  expect((pass.metrics.deliveredUsefulGBDay as { value: number }).value).toBeCloseTo(.521838526464, 12)
  expect(pass.metrics.latencyHours).toMatchObject({ value: 3.1 })
})
it('enforces both directions of the visible/thermal capability gate', () => {
  expect(check(run('pl-thermal'), 'VM-SPECTRUM').status).toBe('NOT_MET')
  const context = { ...DEFAULT_CONTEXT, catalog: { ...DEFAULT_CONTEXT.catalog, payloads: [...DEFAULT_CONTEXT.catalog.payloads, ...VISIBLE_PAYLOADS] } }
  expect(check(evaluateMission({ ...WF_B, payloadId: 'pl-visible-35' }, context), 'WF-SPECTRUM').status).toBe('NOT_MET')
})
it('requires full mosaic service, missing link remains unverified, and equality is inclusive', () => {
  const config = VISIBLE_MISSION.passingConfiguration
  const bottleneck = evaluateMission({ ...config, groundId: 'gs-single' }, VISIBLE_CONTEXT)
  expect(check(bottleneck, 'ENG-DATA-RATE').status).toBe('NOT_MET')
  expect(bottleneck.metrics.latencyHours.kind).toBe('unknown')
  const context = structuredClone(VISIBLE_CONTEXT) as Mutable<EvaluationContext>
  context.fixture.linkClosure = { state: 'unknown', missingEvidenceIds: ['link'] }
  expect(evaluateMission(config, context).outcome).toBe('UNVERIFIED')
  context.fixture.linkClosure = structuredClone(VISIBLE_CONTEXT.fixture.linkClosure) as Mutable<EvaluationContext['fixture']['linkClosure']>
  const scale = run('pl-visible-35').metrics.effectiveScaleM
  if (scale.kind !== 'finite') throw new Error('missing scale')
  context.scenario.science!.maxScaleM = scale.value
  expect(check(evaluateMission(config, context), 'VM-GSD').status).toBe('MET')
  context.scenario.science!.maxScaleM -= .000001
  expect(check(evaluateMission(config, context), 'VM-GSD').status).toBe('NOT_MET')
})
it('rejects missing policy and cross-scenario fixture identity', () => {
  const context = structuredClone(VISIBLE_CONTEXT) as Mutable<EvaluationContext>
  delete context.scenario.science
  expect(evaluateMission(VISIBLE_MISSION.passingConfiguration, context).validation.kind).toBe('invalid')
  context.scenario.science = structuredClone(VISIBLE_CONTEXT.scenario.science) as Mutable<NonNullable<EvaluationContext['scenario']['science']>>
  context.fixture.scenarioId = 'urban-heat'
  expect(evaluateMission(VISIBLE_MISSION.passingConfiguration, context).outcome).toBe('FAILURE')
})
