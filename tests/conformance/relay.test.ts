import { expect, it } from 'vitest'
import { RELAY_CONTEXT, RELAY_MISSION } from '../../src/data/missions/relay'
import { evaluateMission } from '../../src/engine/evaluate'
import { relayPowerWindows } from '../../src/engine/relay'
import type { EvaluationContext } from '../../src/engine/types'
import { check, type Mutable } from './helpers'
const context = () => structuredClone(RELAY_CONTEXT) as Mutable<EvaluationContext>
const pass = RELAY_MISSION.passingConfiguration

it('closes a genuinely two-hop route with exact FIFO, buffer and delay arithmetic', () => {
  const result = evaluateMission(pass, RELAY_CONTEXT)
  expect(result.outcome).toBe('MODEL_PASS_PROVISIONAL')
  expect(result.relay?.ingressStatus).toBe('MET')
  expect(result.relay?.deliveredGBDay).toMatchObject({ value: 1 })
  expect(result.relay?.peakBufferGB).toMatchObject({ value: .5 })
  expect((result.relay!.worstDelayHours as { value: number }).value).toBeCloseTo(1 + (50 + .5 / .525) / 60, 12)
  expect((result.service!.effectiveCapacityGBDay as { value: number }).value).toBeCloseTo(6.3, 12)
  expect(result.checks.some(c => /GSD|FOOTPRINT|SPECTRUM|MOTION-PROFILE|PAYLOAD-POINTING/.test(c.checkId))).toBe(false)
  expect(result.metrics.effectiveScaleM.kind).toBe('not-applicable')
})
it('keeps same viable ingress/hardware but fails with no contracted egress', () => {
  const failed = evaluateMission(RELAY_MISSION.initialConfiguration, RELAY_CONTEXT)
  expect(failed.outcome).toBe('FAILURE')
  expect(failed.relay?.ingressStatus).toBe('MET')
  expect(check(failed, 'RL-ROUTE').status).toBe('NOT_MET')
  expect(failed.relay?.deliveredGBDay).toMatchObject({ value: 0 })
  expect(failed.relay?.worstDelayHours.kind).toBe('unbounded')
})
it('has no target-access, cloud, optical tracking or image-jitter dependency', () => {
  const c = context()
  c.fixture.tracking = { mode: 'disabled' }
  c.fixture.targetGapHours = { state: 'unknown', missingEvidenceIds: ['not-optical'] }
  c.catalog.buses.find(b => b.id === 'bus-12u')!.jitterArcsec = { state: 'unknown', missingEvidenceIds: ['not-optical'] }
  c.scenario.acceptedFraction = 0
  expect(evaluateMission(pass, c).outcome).toBe('MODEL_PASS_PROVISIONAL')
  expect(evaluateMission(pass, c).relay?.deliveredGBDay).toMatchObject({ value: 1 })
})
it('distinguishes unknown hop evidence from known ingress failure and missing egress schedule', () => {
  const c = context()
  c.fixture.relay!.ingressClosure = { state: 'unknown', missingEvidenceIds: ['ingress'] }
  expect(evaluateMission(pass, c).outcome).toBe('UNVERIFIED')
  c.fixture.relay!.ingressClosure = { state: 'known', value: false, provenance: { kind: 'provisional', sourceRefs: [], assumptionIds: ['test'] } }
  c.fixture.linkClosure = { state: 'unknown', missingEvidenceIds: ['egress'] }
  expect(evaluateMission(pass, c).outcome).toBe('FAILURE')
  expect(check(evaluateMission(pass, c), 'RL-INGRESS').status).toBe('NOT_MET')
  const missing = context()
  delete missing.fixture.relay!.egressByGround['gs-network']
  expect(evaluateMission(pass, missing).outcome).toBe('UNVERIFIED')
})
it('rejects an optical payload, rate deficit and finite-buffer overflow', () => {
  expect(check(evaluateMission({ ...pass, payloadId: 'pl-thermal' }, RELAY_CONTEXT), 'RL-CAPABILITY').status).toBe('NOT_MET')
  expect(check(evaluateMission({ ...pass, radioId: 'rf-s' }, RELAY_CONTEXT), 'ENG-DATA-RATE').status).toBe('NOT_MET')
  const c = context()
  c.catalog.relayPayloads![0].bufferGB = .49
  const result = evaluateMission(pass, c)
  expect(check(result, 'ENG-STORAGE').status).toBe('NOT_MET')
  expect(result.relay?.deliveredGBDay.kind).toBe('unknown')
  expect(result.relay?.worstDelayHours.kind).toBe('unknown')
})
it('buffer and delay equality pass, tiny meaningful excesses fail', () => {
  const c = context()
  c.catalog.relayPayloads![0].bufferGB = .5
  const baseline = evaluateMission(pass, c)
  const delay = baseline.relay!.worstDelayHours
  if (delay.kind !== 'finite') throw new Error('missing delay')
  c.scenario.relay!.maxDelayHours = delay.value
  expect(evaluateMission(pass, c).outcome).toBe('MODEL_PASS_PROVISIONAL')
  c.scenario.relay!.maxDelayHours -= .000001
  expect(check(evaluateMission(pass, c), 'RL-DELAY').status).toBe('NOT_MET')
  c.catalog.relayPayloads![0].bufferGB = .499999
  expect(check(evaluateMission(pass, c), 'ENG-STORAGE').status).toBe('NOT_MET')
})
it('handles day-wrap and overlapping egress without double-counting service', () => {
  const c = context()
  c.fixture.relay!.egressByGround['gs-network'] = [[0, 6], [0, 6], [720, 726]]
  c.scenario.relay!.maxDelayHours = 12
  const result = evaluateMission(pass, c)
  expect(result.outcome).toBe('MODEL_PASS_PROVISIONAL')
  expect((result.service!.effectiveCapacityGBDay as { value: number }).value).toBeCloseTo(6.3, 12)
  expect(result.relay?.peakBufferGB).toMatchObject({ value: .5 })
  expect((result.relay!.worstDelayHours as { value: number }).value).toBeCloseTo(1 + (590 + .5 / .525) / 60, 10)
  expect(relayPowerWindows([[1438, 1440], [0, 4]], 95).txMinutesPerOrbit).toBe(6)
})
it('ingress capacity cannot be rescued by nominal downlink; receive/TX overlap fails modes', () => {
  const c = context()
  c.catalog.relayPayloads![0].ingressMbps = 1
  expect(check(evaluateMission(pass, c), 'RL-INGRESS').status).toBe('NOT_MET')
  c.catalog.relayPayloads![0].ingressMbps = 20
  c.fixture.relay!.egressByGround['gs-network'] = [[125, 131], [845, 851]]
  expect(check(evaluateMission(pass, c), 'ENG-MODES').status).toBe('NOT_MET')
})
it.each(['fixture', 'policy', 'nan', 'duplicate', 'bad-shape'] as const)('fails closed for malformed relay %s', mode => {
  const c = context()
  if (mode === 'fixture') delete c.fixture.relay
  if (mode === 'policy') Reflect.set(c.scenario, 'relay', { minDeliveredGBDay: 1, maxDelayHours: NaN, minYears: 1 })
  if (mode === 'nan') c.fixture.relay!.ingress[0].gb = NaN
  if (mode === 'duplicate') c.catalog.relayPayloads!.push(c.catalog.relayPayloads![0])
  if (mode === 'bad-shape') Reflect.set(c.fixture.relay!, 'egressByGround', [])
  expect(evaluateMission(pass, c).validation.kind).toBe('invalid')
  expect(evaluateMission(pass, c).outcome).toBe('FAILURE')
})
it.each([undefined, null, {}, [null]])('does not throw for malformed imaging catalog alongside relay catalog %#', payloads => {
  const c = context()
  Reflect.set(c.catalog, 'payloads', payloads)
  const result = evaluateMission(pass, c)
  expect(result.validation.kind).toBe('invalid')
  expect(result.outcome).toBe('FAILURE')
})
it.each([
  { state: 'known', value: true, provenance: {} },
  { state: 'known', value: true, provenance: true },
  { state: 'unknown', missingEvidenceIds: [123] },
])('fails closed for malformed ingress evidence %#', evidence => {
  const c = context()
  Reflect.set(c.fixture.relay!, 'ingressClosure', evidence)
  expect(evaluateMission(pass, c).validation.kind).toBe('invalid')
  expect(evaluateMission(pass, c).outcome).toBe('FAILURE')
})
