import { describe, expect, it } from 'vitest'
import { DEFAULT_CONTEXT } from '../../src/data/context'
import { evaluateMission, scienceMerit } from '../../src/engine/evaluate'
import { downlinkGBDay, unionWindows } from '../../src/engine/link'
import { atLeast, atMost, finite, numberOf } from '../../src/engine/metric'
import { queue } from '../../src/engine/queue'
import { WF_A, WF_B, WF_C } from '../../src/fixtures/builds'
import { check, contextCopy, evidenceCopy as known } from './helpers'

describe('audited passing fixtures: independent reference numbers', () => {
  it.each([
    [WF_A, 18.9635, 2673750, 3.465, 2.190909090909091, .1315039418181818, 24.377998262603754, 44.79340666491266, 23.94, 40, ['DATA', 'SCHEDULE']],
    [WF_B, 19.7685, 2921000, 37.8, 3.1, .25214976, 25.57698035550739, 44.79340666491266, 76.95, 52, ['BUDGET', 'SCHEDULE']],
    [WF_C, 23.7705, 2846250, 3.465, 2.190909090909091, .1315039418181818, 24.377998262603754, 109.94745272296744, 76.95, 40, ['MASS', 'BUDGET', 'DATA', 'SCHEDULE']],
  ] as const)('preserves %j', (config, mass, cost, d, delay, peakQueue, requiredWh, eolWh, batteryWh, peakW, warnings) => {
    const report = evaluateMission(config, DEFAULT_CONTEXT)
    expect(report.validation.issues).toEqual([])
    expect(report.outcome).toBe('MODEL_PASS_PROVISIONAL')
    for (const [key, expected] of Object.entries({ massKg: mass, slotKg: mass + 2, totalUsd: cost, generatedGBDay: 3.1850496, effectiveDownlinkGBDay: d, latencyHours: delay, queuePeakGB: peakQueue, arrayRequiredWhOrbit: requiredWh, arrayWhOrbitEOL: eolWh, batteryUsableWhEOL: batteryWh, peakW, effectiveScaleM: 170.3340261624338, usableSwathKm: 104.2315704181552, deliveredUsefulGBDay: 1.91102976, scheduleMonths: 31, nativeGSDm: 166.66666666666666, jitterGroundM: 12.120342030112415, smearM: 33, trackingRateDegSec: .8089266185151104, periodMin: 94.61630047543098 })) {
      expect(numberOf(report.metrics[key]), key).toBeCloseTo(expected, 8)
    }
    expect([...report.warnings].sort()).toEqual([...warnings].sort())
    expect(report.checks).toHaveLength(26)
    expect(report.checks.every(c => c.status === 'MET')).toBe(true)
  })
})

describe('all 15 audited negative/boundary cases', () => {
  it('audit-01: decimal conversion, overhead once', () => {
    expect(downlinkGBDay(1, 1, 1)).toBe(.0075)
    expect(downlinkGBDay(1, 1, .7)).toBeCloseTo(.00525, 15)
    expect(downlinkGBDay(.0096, 20, 1)).toBeCloseTo(.00144, 12)
  })
  it('audit-02: exact D=G stable, deficit not waived by storage', () => {
    const report = evaluateMission(WF_B, DEFAULT_CONTEXT)
    const ground = DEFAULT_CONTEXT.catalog.grounds.find(g => g.id === 'gs-network')!
    const g = 3.1850496
    const service = report.service!
    const exact = queue({ ...service, effectiveCapacityGBDay: finite(g, 'GB/day') }, g, 102.4, ground, .6)
    const deficit = queue({ ...service, effectiveCapacityGBDay: finite(g - 1e-6, 'GB/day') }, g, 1e9, ground, .6)
    expect(exact.status).toBe('stable')
    const rounded = queue({ ...service, effectiveCapacityGBDay: finite(g - 1e-10, 'GB/day') }, g, 102.4, ground, .6)
    expect(rounded.status).toBe('stable')
    expect(numberOf(rounded.backlogGBDay)).toBe(0)
    expect(rounded.saturationEstimateDays.kind).toBe('not-applicable')
    expect(deficit.status).toBe('unstable')
    expect(deficit.latencyHours.kind).toBe('unknown')
  })
  it('audit-03: 24 allocated inclusive, 24.000001 fails; adapter separate', () => {
    const context = contextCopy()
    const bus = context.catalog.buses.find(b => b.id === 'bus-12u')!
    bus.massKg = 24 / 1.15 - 3 - .83 - 1.01 - .35
    expect(check(evaluateMission(WF_B, context), 'ENG-MASS').status).toBe('MET')
    bus.massKg += .000001 / 1.15
    const failed = evaluateMission(WF_B, context)
    expect(check(failed, 'ENG-MASS').status).toBe('NOT_MET')
    expect(numberOf(failed.metrics.slotKg)).toBeCloseTo(26.000001, 9)
  })
  it('audit-04: angular boundaries, separate swath/scale, improvement monotonic', () => {
    const context = contextCopy()
    const bus = context.catalog.buses.find(b => b.id === 'bus-12u')!
    const original = evaluateMission(WF_B, context)
    bus.errorDeg = .2
    const edge = evaluateMission(WF_B, context)
    expect(check(edge, 'ENG-PAYLOAD-POINTING').status).toBe('MET')
    expect(numberOf(edge.metrics.usableSwathKm)!).toBeLessThan(numberOf(original.metrics.usableSwathKm)!)
    expect(edge.metrics.nativeGSDm).toEqual(original.metrics.nativeGSDm)
    bus.errorDeg = .200001
    expect(check(evaluateMission(WF_B, context), 'ENG-PAYLOAD-POINTING').status).toBe('NOT_MET')
  })
  it('audit-05: omni has no zero-angle division but fails rate', () => {
    const report = evaluateMission({ ...WF_A, radioId: 'rf-uhf' }, DEFAULT_CONTEXT)
    expect(numberOf(report.metrics.effectiveDownlinkGBDay)).toBeCloseTo(.008316, 12)
    expect(check(report, 'ENG-LINK').status).toBe('MET')
    expect(check(report, 'ENG-DATA-RATE').status).toBe('NOT_MET')
    expect(JSON.stringify(report)).not.toMatch(/NaN|Infinity/)
  })
  it('audit-06: S/network deficit despite conditional useful proxy >1', () => {
    const report = evaluateMission({ ...WF_A, groundId: 'gs-network' }, DEFAULT_CONTEXT)
    expect(numberOf(report.metrics.effectiveDownlinkGBDay)).toBeCloseTo(1.89, 12)
    expect(1.89 * .6).toBeGreaterThan(1)
    expect(check(report, 'ENG-DATA-RATE').status).toBe('NOT_MET')
    expect(report.outcome).toBe('FAILURE')
  })
  it('audit-07: cadence fails with ample radio; network-only repair', () => {
    const report = evaluateMission({ ...WF_B, groundId: 'gs-single' }, DEFAULT_CONTEXT)
    expect(numberOf(report.metrics.latencyHours)).toBeCloseTo(7.1, 12)
    expect(check(report, 'ENG-DATA-RATE').status).toBe('MET')
    expect(check(report, 'ENG-STORAGE').status).toBe('MET')
    expect(check(report, 'WF-LATENCY').status).toBe('NOT_MET')
    expect(evaluateMission(WF_B, DEFAULT_CONTEXT).outcome).toBe('MODEL_PASS_PROVISIONAL')
  })
  it('audit-08: C larger battery exceeds CubeSat allocation', () => {
    const report = evaluateMission({ ...WF_C, batteryId: 'bat-l' }, DEFAULT_CONTEXT)
    expect(numberOf(report.metrics.massKg)).toBeCloseTo(25.507, 12)
    expect(check(report, 'ENG-MASS').reasonCode).toBe('CDS_MASS_LIMIT')
    expect(check(report, 'ENG-MASS').status).toBe('NOT_MET')
  })
  it('audit-09: repeated energy shortfall cannot be fixed by battery alone', () => {
    const report = evaluateMission({ ...WF_A, arrayId: 'arr-deploy-m' }, DEFAULT_CONTEXT)
    expect(numberOf(report.metrics.arrayWhOrbitEOL)).toBeCloseTo(19.546213817416433, 9)
    expect(check(report, 'ENG-POWER-EOL').status).toBe('NOT_MET')
    expect(check(report, 'ENG-POWER-EOL').reasonCode).toBe('POWER_DEFICIT')
    expect(check(evaluateMission({ ...WF_A, arrayId: 'arr-deploy-m', batteryId: 'bat-l' }, DEFAULT_CONTEXT), 'ENG-POWER-EOL').status).toBe('NOT_MET')
  })
  it('audit-10: bad antenna removes window service, not camera sampling', () => {
    const context = contextCopy()
    context.catalog.radios.find(r => r.id === 'rf-x')!.antenna = { kind: 'directed', errorDeg: .01 }
    const report = evaluateMission(WF_B, context)
    expect(report.service?.windows).toMatchObject({ state: 'known', value: [] })
    expect(numberOf(report.metrics.effectiveDownlinkGBDay)).toBe(0)
    expect(report.queue?.status).toBe('unstable')
    expect(report.metrics.latencyHours.kind).toBe('unbounded')
    expect(numberOf(report.metrics.nativeGSDm)).toBeCloseTo(166.666666667)
    expect(numberOf(report.metrics.deliveredUsefulGBDay)).toBe(0)
  })
  it('audit-11: missing access unknown; independent known failure dominates', () => {
    const context = contextCopy()
    context.fixture.targetGapHours = { state: 'unknown', missingEvidenceIds: ['access'] }
    const report = evaluateMission(WF_B, context)
    expect(report.outcome).toBe('UNVERIFIED')
    expect(check(report, 'WF-ACCESS').status).toBe('UNVERIFIED')
    context.scenario.budgetUsd = 1
    const failed = evaluateMission(WF_B, context)
    expect(failed.outcome).toBe('FAILURE')
    expect(check(failed, 'WF-ACCESS').status).toBe('UNVERIFIED')
    expect(check(failed, 'ENG-BUDGET').status).toBe('NOT_MET')
  })
  it('audit-12: spectral capability, not affinity or sharpness', () => {
    for (const bands of [[[.4, .7]], [[.465, .940]], []]) {
      const context = contextCopy()
      context.catalog.payloads[0].bandsMicrometers = bands as [number, number][]
      expect(check(evaluateMission(WF_B, context), 'WF-SPECTRUM').status).toBe('NOT_MET')
    }
  })
  it('audit-13: exact minima pass, zero stretch still merit70', () => {
    expect([atMost(200, 200), atLeast(90, 90), atMost(24, 24), atLeast(1, 1), atMost(6, 6)].every(Boolean)).toBe(true)
    expect(scienceMerit([{ value: 200, minimum: 200, stretch: 150, direction: 'lower', weight: .5 }, { value: 1, minimum: 1, stretch: 2, direction: 'higher', weight: .5 }])).toBe(70)
    expect(scienceMerit([{ value: 0, minimum: 1, stretch: 1, direction: 'higher', weight: 1 }])).toBe(70)
    // Test-only context: place every numeric science metric at its minimum.
    const context = contextCopy()
    const jitter = 12.120342030112415
    context.catalog.payloads[0].referenceGSDm = Math.sqrt(200 ** 2 - jitter ** 2 - 33 ** 2) * 600 / 500
    context.catalog.payloads[0].crossFovDeg = 2 * Math.atan((90 + 2 * 500 * Math.tan(.05 * Math.PI / 180)) / 1000) * 180 / Math.PI
    context.scenario.acceptedFraction = 1 / 3.1850496
    context.catalog.grounds.find(g => g.id === 'gs-network')!.processingHours = 3.9
    const report = evaluateMission(WF_B, context)
    expect(report.outcome).toBe('MODEL_PASS_PROVISIONAL')
    expect(report.counts.science.MET).toBe(7)
    expect(numberOf(report.merit)).toBeCloseTo(70, 12)
    for (const [id, limit] of [['WF-GSD', 200], ['WF-FOOTPRINT', 90], ['WF-ACCESS', 24], ['WF-DELIVERY', 1], ['WF-LATENCY', 6], ['WF-DURATION', 1]] as const) {
      expect(numberOf(check(report, id).actual)).toBeCloseTo(limit, 10)
    }
    const weighted = [
      { value: 150, minimum: 200, stretch: 150, direction: 'lower' as const, weight: .25 },
      { value: 12, minimum: 24, stretch: 12, direction: 'lower' as const, weight: .25 },
      { value: 2, minimum: 1, stretch: 2, direction: 'higher' as const, weight: .20 },
      { value: 2, minimum: 6, stretch: 2, direction: 'lower' as const, weight: .20 },
      { value: 3, minimum: 1, stretch: 3, direction: 'higher' as const, weight: .10 },
    ]
    expect(scienceMerit(weighted)).toBe(100)
    expect(scienceMerit(weighted.map(v => ({ ...v, value: Math.sqrt(v.minimum * v.stretch) })))).toBeCloseTo(85, 12)
  })
  it('audit-14: known numeric gates MET does not imply flight qualification', () => {
    const report = evaluateMission(WF_B, DEFAULT_CONTEXT)
    expect(report.outcome).toBe('MODEL_PASS_PROVISIONAL')
    expect(report.assumptions).toContain('tracking')
    expect(report.metrics.physicalObservationAgeHours.kind).toBe('unknown')
    expect(report.timelineEligible).toBe(true)
  })
  it('audit-15: disabled versus unknown tracking, all3 fail without tracking', () => {
    const context = contextCopy()
    context.fixture.tracking = { mode: 'disabled' }
    for (const config of [WF_A, WF_B, WF_C]) {
      const report = evaluateMission(config, context)
      expect(numberOf(report.metrics.smearM)).toBeCloseTo(232.9541428518612, 7)
      expect(numberOf(report.metrics.effectiveScaleM)).toBeCloseTo(286.6920179226308, 7)
      expect(check(report, 'WF-GSD').status).toBe('NOT_MET')
      expect(report.outcome).toBe('FAILURE')
    }
    context.fixture.tracking = { mode: 'unknown' }
    expect(evaluateMission(WF_B, context).outcome).toBe('UNVERIFIED')
  })
})

describe('contract and independent gates', () => {
  const failures: [string, (context: ReturnType<typeof contextCopy>) => void][] = [
    ['ENG-SLOT', c => { c.catalog.launchers[0].slotLimitKg = 1 }],
    ['ENG-LAUNCH-INTERFACE', c => { c.catalog.launchers[0].orbitIds = [] }],
    ['ENG-PAYLOAD-FIT', c => { c.catalog.payloads[0].busIds = [] }],
    ['ENG-POWER-PACKAGE-FIT', c => { c.catalog.arrays.find(a => a.id === 'arr-deploy-l')!.busIds = [] }],
    ['ENG-BUDGET', c => { c.scenario.budgetUsd = 1 }],
    ['ENG-SCHEDULE', c => { c.scenario.availableMonths = 1 }],
    ['ENG-MODES', c => { c.fixture.modePlacement = known(false) }],
    ['ENG-POWER-BOL', c => { c.catalog.arrays.find(a => a.id === 'arr-deploy-l')!.bolW = 1 }],
    ['ENG-POWER-EOL', c => { c.catalog.arrays.find(a => a.id === 'arr-deploy-l')!.annualLoss = .8 }],
    ['ENG-ECLIPSE', c => { c.catalog.batteries.find(b => b.id === 'bat-m')!.nominalWh = 1 }],
    ['ENG-PEAK-W', c => { c.catalog.batteries.find(b => b.id === 'bat-m')!.dischargeW = 1 }],
    ['ENG-PEAK-WH', c => { c.catalog.batteries.find(b => b.id === 'bat-m')!.nominalWh = 1 }],
    ['ENG-PAYLOAD-POINTING', c => { c.catalog.buses.find(b => b.id === 'bus-12u')!.errorDeg = 1 }],
    ['ENG-MOTION-PROFILE', c => { c.fixture.tracking = { mode: 'disabled' } }],
    ['ENG-LINK', c => { c.fixture.receiverCompatible = known(false) }],
    ['ENG-DATA-RATE', c => { c.catalog.radios.find(r => r.id === 'rf-x')!.lineMbps = .001 }],
    ['ENG-STORAGE', c => { c.catalog.buses.find(b => b.id === 'bus-12u')!.storageGB = .0001 }],
    ['ENG-LIFETIME', c => { c.catalog.buses.find(b => b.id === 'bus-12u')!.lifeYears = .5 }],
    ['WF-FOOTPRINT', c => { c.catalog.payloads[0].crossFovDeg = 1 }],
    ['WF-ACCESS', c => { c.fixture.targetGapHours = known(25) }],
    ['WF-DURATION', c => { c.scenario.plannedYears = .5 }],
  ]
  it.each(failures)('retains failure diagnosis for %s', (id, mutate) => {
    const context = contextCopy()
    mutate(context)
    const report = evaluateMission(WF_B, context)
    expect(report.validation.issues).toEqual([])
    expect(check(report, id).status).toBe('NOT_MET')
    expect(report.diagnostics.some(d => d.checkIds.includes(id))).toBe(true)
    expect(report.outcome).toBe('FAILURE')
  })
  it('handles N=0 without division; known failures dominate unknown link', () => {
    const context = contextCopy()
    context.catalog.grounds.find(g => g.id === 'gs-network')!.contactsPerDay = 0
    expect(evaluateMission(WF_B, context).metrics.latencyHours.kind).toBe('unbounded')
    context.fixture.linkClosure = { state: 'unknown', missingEvidenceIds: ['link'] }
    context.scenario.budgetUsd = 1
    const report = evaluateMission(WF_B, context)
    expect(report.outcome).toBe('FAILURE')
    expect(check(report, 'ENG-BUDGET').status).toBe('NOT_MET')
  })
  it('keeps storage equality separate from rate; no lossless latency on overflow', () => {
    const report = evaluateMission(WF_B, DEFAULT_CONTEXT)
    const ground = DEFAULT_CONTEXT.catalog.grounds.find(g => g.id === 'gs-network')!
    const peak = .25214976
    expect(queue(report.service!, 3.1850496, peak, ground, .6).storageStatus).toBe('MET')
    const overflow = queue(report.service!, 3.1850496, peak - 1e-6, ground, .6)
    expect(overflow.status).toBe('stable')
    expect(overflow.storageStatus).toBe('NOT_MET')
    expect(overflow.latencyHours.kind).toBe('unknown')
  })
  it('derives per-contact status from the daily boundary in the complete evaluator', () => {
    const context = contextCopy()
    const g = 3.1850496
    context.catalog.radios.find(r => r.id === 'rf-s')!.lineMbps = (g - 4e-9) / (22 * 6 * .0075 * .7)
    const report = evaluateMission(WF_A, context)
    expect(check(report, 'ENG-DATA-RATE').status).toBe('NOT_MET')
    expect(report.queue?.perContactStable).toBe('NOT_MET')
    expect(report.queue?.status).toBe('unstable')
    const d = numberOf(report.metrics.effectiveDownlinkGBDay)!
    expect(d / 22 >= g / 22 - 1e-9).toBe(true)
  })
  it('unions contacts and splits wrap-around; never doubles service', () => {
    expect(unionWindows([[1438, 1444], [0, 6], [3, 9]])).toEqual([[0, 9], [1438, 1440]])
    expect(() => unionWindows([[1, 1]])).toThrow()
  })
  it('retains nominal power attempts after link loss', () => {
    const original = evaluateMission(WF_B, DEFAULT_CONTEXT)
    const context = contextCopy()
    context.fixture.receiverCompatible = known(false)
    const failed = evaluateMission(WF_B, context)
    expect(failed.metrics.arrayRequiredWhOrbit).toEqual(original.metrics.arrayRequiredWhOrbit)
  })
  it('rejects malformed inputs and recognized deferred scenarios cannot pass', () => {
    for (const input of [null, {}, 3, { ...WF_B, busId: 'bad' }, { ...WF_B, budgetUsd: 1 }]) expect(evaluateMission(input, DEFAULT_CONTEXT).validation.kind).toBe('invalid')
    expect(evaluateMission({ ...WF_B, scenarioId: 'flood' }, DEFAULT_CONTEXT).outcome).toBe('DEFERRED')
    expect(evaluateMission({ ...WF_B, scenarioId: 'methane' }, DEFAULT_CONTEXT).outcome).toBe('DEFERRED')
  })
  it('never borrows an unsupported contact fixture', () => {
    const context = contextCopy()
    context.fixture.evenlySpaced = { state: 'unknown', missingEvidenceIds: ['contact-schedule'] }
    const report = evaluateMission(WF_B, context)
    expect(report.outcome).toBe('UNVERIFIED')
    expect(report.metrics.latencyHours.kind).toBe('unknown')
  })
  it('rejects omitted/non-finite known evidence without NaN or throwing', () => {
    for (const field of ['linkClosure', 'receiverCompatible', 'targetGapHours'] as const) {
      const context = contextCopy()
      Reflect.deleteProperty(context.fixture, field)
      const report = evaluateMission(WF_B, context)
      expect(report.validation.kind).toBe('invalid')
      expect(report.outcome).toBe('FAILURE')
      expect(JSON.stringify(report)).not.toMatch(/NaN|Infinity/)
    }
  })
  it('rejects malformed nested structures and catalog collections without throwing', () => {
    const mutations: ((c: ReturnType<typeof contextCopy>) => void)[] = [
      c => { if (c.fixture.tracking.mode === 'accepted') Reflect.deleteProperty(c.fixture.tracking, 'busIds') },
      c => { Reflect.set(c.catalog.buses.find(b => b.id === 'bus-12u')!, 'jitterArcsec', { state: 'unknown' }) },
      c => { Reflect.set(c.catalog.payloads[0].evidence, 'massKg', null) },
      c => { Reflect.set(c.catalog, 'buses', {}) },
      c => { Reflect.set(c.catalog, 'buses', [null]) },
    ]
    for (const mutate of mutations) {
      const c = contextCopy()
      mutate(c)
      expect(() => evaluateMission(WF_B, c)).not.toThrow()
      expect(evaluateMission(WF_B, c).validation.kind).toBe('invalid')
      expect(evaluateMission(WF_B, c).outcome).toBe('FAILURE')
    }
    const negative = contextCopy()
    negative.fixture.targetGapHours = known(-1)
    expect(check(evaluateMission(WF_B, negative), 'WF-ACCESS').status).toBe('UNVERIFIED')
    const antenna = contextCopy()
    Reflect.deleteProperty(antenna.catalog.radios.find(r => r.id === 'rf-x')!, 'antenna')
    expect(check(evaluateMission(WF_B, antenna), 'ENG-LINK').status).toBe('UNVERIFIED')
  })
  it('is deterministic, immutable, does not mutate context and revisions invalidate identity', () => {
    const context = contextCopy()
    const before = structuredClone(context)
    const first = evaluateMission(WF_B, context)
    expect(evaluateMission(WF_B, context)).toEqual(first)
    expect(context).toEqual(before)
    expect(Object.isFrozen(first.metrics)).toBe(true)
    context.fixtureRevision += '-next'
    expect(evaluateMission(WF_B, context).configurationKey).not.toBe(first.configurationKey)
  })
  it('gates mode placement and duty windows independently', () => {
    const context = contextCopy()
    context.fixture.modePlacement = known(false)
    expect(check(evaluateMission(WF_B, context), 'ENG-MODES').status).toBe('NOT_MET')
    context.fixture.modePlacement = known(true)
    context.catalog.payloads[0].duty = 1
    expect(check(evaluateMission(WF_B, context), 'ENG-MODES').status).toBe('NOT_MET')
  })
})
