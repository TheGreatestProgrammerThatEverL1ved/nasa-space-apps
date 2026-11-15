import { expect, it } from 'vitest'
import { chooseExpeditionLeg, createExpedition, expeditionContext, expeditionOffers,
  expeditionSummary, readExpedition, settleExpeditionLeg } from '../../src/campaign/expedition'
import { OPERATIONS_PARTS } from '../../src/data/player/operations'
import { PLAYER_MISSIONS } from '../../src/data/player/missions'
import { PLAYER_FAILURES, PLAYER_WITNESSES } from '../../src/data/player/witnesses'
import { evaluateMission } from '../../src/engine/evaluate'
import { hasAppearance } from '../../src/ui/orbital/appearance'

const findMission = (id: string) => PLAYER_MISSIONS.find(mission => mission.id === id)!
const witness = (id: string) => PLAYER_WITNESSES[id as keyof typeof PLAYER_WITNESSES].a
const reject = (id: string) => PLAYER_FAILURES[id as keyof typeof PLAYER_FAILURES].technical
const seeds = Array.from({ length: 64 }, (_, i) => Math.imul(123_456_789, i))

it('generates repeatable but varied missions and keeps all eight catalog additions playable', () => {
  expect(expeditionOffers(createExpedition(7))).toEqual(expeditionOffers(createExpedition(7)))
  expect(new Set(seeds.map(seed => expeditionOffers(createExpedition(seed))[0]!.missionId)).size).toBe(4)
  const mission = findMission('wildfire')
  const base = witness(mission.id)
  const used = new Set(PLAYER_MISSIONS.flatMap(m => Object.values(m.context.catalog).flat().map(p => p.id)))
  expect(used.size).toBe(43)
  for (const part of OPERATIONS_PARTS) {
    expect(used.has(part.id)).toBe(true)
    expect(hasAppearance(part.id)).toBe(true)
    expect(Object.values(part.evidence).every(e => e.kind === 'provisional')).toBe(true)
    const field = { launcher: 'launcherId', ground: 'groundId', array: 'arrayId', battery: 'batteryId', radio: 'radioId' }[part.category]
    expect(field).toBeDefined()
    const report = evaluateMission({ ...base, [field!]: part.id }, mission.context)
    expect(report.validation.kind).toBe('valid')
    expect(report.outcome).not.toBe('UNVERIFIED')
  }
  const costly = evaluateMission({ ...base, launcherId: 'lv-express-30' }, mission.context)
  const slow = evaluateMission({ ...base, launcherId: 'lv-shared-24' }, mission.context)
  const metric = (r: typeof slow, key: string) => {
    const value = r.metrics[key]
    return value?.kind === 'finite' ? value.value : NaN
  }
  expect(metric(slow, 'totalUsd')).toBeLessThan(metric(costly, 'totalUsd'))
  expect(metric(slow, 'scheduleMonths')).toBeGreaterThan(metric(costly, 'scheduleMonths'))
})

it('has a passing loadout for both offers for every mission', () => {
  for (const mission of PLAYER_MISSIONS) {
    const seed = seeds.find(i => expeditionOffers(createExpedition(i)).some(x => x.missionId === mission.id))
    expect(seed).toBeDefined()
    const run = createExpedition(seed!)
    const old = PLAYER_WITNESSES[mission.id as keyof typeof PLAYER_WITNESSES]
    for (const leg of expeditionOffers(run)) {
      const context = expeditionContext(mission.context, run, leg)
      const candidates = [old.a, old.b, mission.passingConfiguration].flatMap(build =>
        context.catalog.launchers.map(launcher => ({ ...build, launcherId: launcher.id })))
      const reports = candidates.map(config => evaluateMission(config, context))
      expect(reports.some(r => r.outcome === 'MODEL_PASS_PROVISIONAL'),
        `${leg.id}: ${JSON.stringify(reports.map(r => r.checks.filter(c => c.status !== 'MET')
          .map(c => [c.checkId, c.actual.kind === 'finite' ? c.actual.value : c.actual.kind, c.limit])))}`).toBe(true)
    }
  }
})

it('awards either a supply refill or the higher score after a failed attempt', () => {
  const run = createExpedition(38)
  const [economy, priority] = expeditionOffers(run)
  const mission = findMission('wildfire')
  const first = chooseExpeditionLeg(run, economy!.id)
  const failed = evaluateMission(reject(mission.id), expeditionContext(mission.context, first, economy!))
  const retry = settleExpeditionLeg(first, failed, mission.context)
  expect(expeditionSummary(retry)).toMatchObject({ supplies: 2, points: 0 })
  for (const leg of [economy!, priority!]) {
    const accepted = chooseExpeditionLeg(retry, leg.id)
    const context = expeditionContext(mission.context, accepted, leg)
    const config = { ...witness(mission.id), launcherId: leg.profile === 'economy' ? 'lv-shared-24' : 'lv-express-30' }
    const report = evaluateMission(config, context)
    expect(report.outcome).toBe('MODEL_PASS_PROVISIONAL')
    const result = settleExpeditionLeg(accepted, report, mission.context)
    expect(expeditionSummary(result)).toMatchObject({
      stage: 1, supplies: leg.profile === 'economy' ? 3 : 2, points: leg.points,
    })
    expect(readExpedition(JSON.stringify(result))).toEqual(result)
  }
})

it('advances only on an accepted evaluated leg, rejects duplicates and round-trips saves', () => {
  let run = createExpedition(7)
  while (!expeditionSummary(run).complete) {
    const leg = expeditionOffers(run)[0]!
    run = chooseExpeditionLeg(run, leg.id)
    expect(readExpedition(JSON.stringify(run))).toEqual(run)
    const m = findMission(leg.missionId)
    const base = witness(m.id)
    const context = expeditionContext(m.context, run, leg)
    const options = [base, PLAYER_WITNESSES[m.id as keyof typeof PLAYER_WITNESSES].b, m.passingConfiguration]
      .flatMap(config => context.catalog.launchers.map(launcher => ({ ...config, launcherId: launcher.id })))
    const report = options.map(config => evaluateMission(config, context)).find(r => r.outcome === 'MODEL_PASS_PROVISIONAL')!
    expect(report).toBeDefined()
    expect(settleExpeditionLeg(run, evaluateMission(base, m.context), m.context)).toBe(run)
    run = settleExpeditionLeg(run, report, m.context)
    expect(settleExpeditionLeg(run, report, m.context)).toBe(run)
  }
  expect(expeditionSummary(run)).toMatchObject({ points: 3, supplies: 3, complete: true })
  expect(readExpedition(JSON.stringify(run))).toEqual(run)
  expect(expeditionOffers(run)).toEqual([])
})

it('exhausts the run after three failures and cannot replay a result across attempts', () => {
  let run = createExpedition(12)
  const leg = expeditionOffers(run)[0]!
  const m = findMission(leg.missionId)
  for (let attempt = 0; attempt < 3; attempt++) {
    run = chooseExpeditionLeg(run, leg.id)
    const report = evaluateMission(reject(m.id), expeditionContext(m.context, run, leg))
    run = settleExpeditionLeg(run, report, m.context)
    expect(expeditionSummary(run).supplies).toBe(2 - attempt)
    expect(settleExpeditionLeg(chooseExpeditionLeg(run, leg.id), report, m.context).attempts).toHaveLength(attempt + 1)
  }
  expect(expeditionSummary(run)).toMatchObject({ exhausted: true, stage: 0 })
  expect(readExpedition(JSON.stringify(run))).toEqual(run)
  expect(readExpedition(JSON.stringify({ ...run, legId: leg.id }))).toBeNull()
})
