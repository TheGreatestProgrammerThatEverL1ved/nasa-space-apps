import { describe, expect, it } from 'vitest'
import { DEFAULT_CONTEXT } from '../../src/data/context'
import { evaluateMission } from '../../src/engine/evaluate'
import { FIRST_MISSION, WF_B, WF_C } from '../../src/fixtures/builds'
import { known, numberOf } from '../../src/engine/metric'
import { downlinkGBDay } from '../../src/engine/link'
import { queue } from '../../src/engine/queue'
import { check, contextCopy } from './helpers'

describe('M1 real evaluator', () => {
  it('fails 7.1 h, repairs only ground to 3.1 h', () => {
    const failed = evaluateMission(FIRST_MISSION, DEFAULT_CONTEXT)
    expect(failed.validation.issues).toEqual([])
    expect(failed.origin).toBe('evaluator')
    expect(failed.outcome).toBe('FAILURE')
    expect(failed.checks.filter(c => c.status === 'NOT_MET').map(c => c.checkId)).toEqual(['WF-LATENCY'])
    expect(numberOf(failed.metrics.latencyHours)).toBeCloseTo(7.1, 12)
    expect(numberOf(failed.metrics.effectiveDownlinkGBDay)).toBeCloseTo(12.6, 12)
    expect(numberOf(failed.metrics.queuePeakGB)).toBeCloseTo(.78299136, 12)
    expect(numberOf(failed.metrics.totalUsd)).toBe(2662250)
    const fixed = evaluateMission(WF_B, DEFAULT_CONTEXT)
    expect(fixed.outcome).toBe('MODEL_PASS_PROVISIONAL')
    expect(numberOf(fixed.metrics.latencyHours)).toBeCloseTo(3.1, 12)
    expect(numberOf(fixed.metrics.effectiveDownlinkGBDay)).toBeCloseTo(37.8, 12)
    expect(numberOf(fixed.metrics.deliveredUsefulGBDay)).toBe(1.91102976)
    expect(fixed.counts.science).toEqual({ MET: 7, NOT_MET: 0, UNVERIFIED: 0, total: 7 })
    expect(fixed.counts.engineering).toEqual({ MET: 19, NOT_MET: 0, UNVERIFIED: 0, total: 19 })
    expect([...fixed.warnings].sort()).toEqual(['BUDGET', 'SCHEDULE'])
  })
  it('removes all queue service for a known failed receiver', () => {
    const report = evaluateMission(WF_B, { ...DEFAULT_CONTEXT, fixture: { ...DEFAULT_CONTEXT.fixture, receiverCompatible: known(false) } })
    expect(report.outcome).toBe('FAILURE')
    expect(report.service?.windows).toMatchObject({ state: 'known', value: [] })
    expect(numberOf(report.metrics.nominalDownlinkGBDay)).toBeCloseTo(37.8)
    expect(numberOf(report.metrics.effectiveDownlinkGBDay)).toBe(0)
    expect(numberOf(report.metrics.backlogGBDay)).toBe(3.1850496)
    expect(report.metrics.latencyHours.kind).toBe('unbounded')
    expect(numberOf(report.metrics.deliveredUsefulGBDay)).toBe(0)
    expect(numberOf(report.metrics.nativeGSDm)).toBeCloseTo(166.666666667)
  })
  it('preserves unknown-link evidence without nominal service', () => {
    const report = evaluateMission(WF_B, { ...DEFAULT_CONTEXT, fixture: { ...DEFAULT_CONTEXT.fixture, linkClosure: { state: 'unknown', missingEvidenceIds: ['link'] } } })
    expect(report.outcome).toBe('UNVERIFIED')
    expect(report.metrics.effectiveDownlinkGBDay.kind).toBe('unknown')
    expect(report.service?.windows.state).toBe('unknown')
    expect(report.queue?.status).toBe('unverified')
  })
  it('uses daily tolerance once near the stability boundary', () => {
    const g = DEFAULT_CONTEXT.catalog.grounds.find(g => g.id === 'gs-service')!
    const generated = 3.1850496
    const d = generated - 4e-9 // >3.185e-9 GB/day tolerance, <22e-9 per-contact aggregate.
    expect(d / 22 >= generated / 22 - 1e-9).toBe(true) // independent per-contact tolerance would disagree.
    const base = evaluateMission(WF_B, DEFAULT_CONTEXT).service!
    const result = queue({ ...base, effectiveCapacityGBDay: { ...base.effectiveCapacityGBDay, kind: 'finite', value: d, unit: 'GB/day', provenance: { kind: 'provisional', sourceRefs: ['test'], assumptionIds: [] } } }, generated, 102.4, g, .6)
    expect(result.status).toBe('unstable')
    expect(result.perContactStable).toBe('NOT_MET')
    expect(result.peakGB.kind).toBe('not-applicable')
    expect(downlinkGBDay(1, 1, 1)).toBe(.0075)
  })
  it('rejects nested non-finite bands and omitted required fields without passing', () => {
    const context = contextCopy()
    context.catalog.payloads[0].bandsMicrometers = [[8, 12], [NaN, NaN]]
    const report = evaluateMission(WF_B, context)
    expect(report.validation.kind).toBe('invalid')
    expect(report.outcome).toBe('FAILURE')
    expect(report.metrics.generatedGBDay).toBeUndefined()
    const missing = contextCopy()
    Reflect.deleteProperty(missing.catalog.payloads[0], 'framesPerSecond')
    expect(evaluateMission(WF_B, missing).validation.kind).toBe('invalid')
  })
  it('returns an invalid report rather than throwing for zero-length contacts', () => {
    const context = contextCopy()
    context.catalog.grounds.find(g => g.id === 'gs-network')!.lengthMin = 0
    expect(evaluateMission(WF_B, context).validation.kind).toBe('invalid')
  })
  it('retains known mass failure when ground selection is malformed', () => {
    const { groundId: _ground, ...request } = { ...WF_C, batteryId: 'bat-l' }
    const report = evaluateMission(request, DEFAULT_CONTEXT)
    expect(report.validation.kind).toBe('invalid')
    expect(check(report, 'ENG-MASS').status).toBe('NOT_MET')
    expect(report.diagnostics.some(d => d.reasonCode === 'CDS_MASS_LIMIT')).toBe(true)
  })
  it('uses one payload duty for generation, power and mode placement', () => {
    const context = contextCopy()
    context.catalog.payloads[0].duty = .6
    expect(check(evaluateMission(WF_B, context), 'ENG-MODES').status).toBe('NOT_MET')
  })
  it('keeps untracked physics but does not claim an accepted tracking profile', () => {
    const context = contextCopy()
    context.fixture.tracking = { mode: 'disabled' }
    const report = evaluateMission(WF_B, context)
    expect(numberOf(report.metrics.effectiveScaleM)).toBeCloseTo(286.692018, 6)
    expect(check(report, 'ENG-MOTION-PROFILE').status).toBe('NOT_MET')
    expect(check(report, 'WF-GSD').status).toBe('NOT_MET')
  })
})
