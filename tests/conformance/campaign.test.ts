import { expect, it } from 'vitest'
import {
  awardCampaignPass, buyCampaignPart, campaignContext, campaignCredits,
  EMPTY_CAMPAIGN, parseCampaign, CAMPAIGN_CONTRACTS, CAMPAIGN_SHOP, CAMPAIGN_UPGRADES, campaignComplete, campaignContractAvailable, refundCampaignPart,
} from '../../src/campaign/progress'
import { DEFAULT_CONTEXT } from '../../src/data/context'
import { MISSIONS, URBAN_MISSION } from '../../src/data/scenarios'
import { evaluateMission } from '../../src/engine/evaluate'
import { FIRST_MISSION, WF_A, WF_B, WF_C } from '../../src/fixtures/builds'

const firstPass = evaluateMission(WF_A, campaignContext(DEFAULT_CONTEXT, EMPTY_CAMPAIGN))

it('starts with enough audited hardware to pass wildfire, but no free locked parts', () => {
  expect(firstPass.outcome).toBe('MODEL_PASS_PROVISIONAL')
  expect(campaignCredits(EMPTY_CAMPAIGN)).toBe(0)
  expect(evaluateMission(WF_B, campaignContext(DEFAULT_CONTEXT, EMPTY_CAMPAIGN)).validation.kind).toBe('invalid')
  expect(evaluateMission(WF_C, campaignContext(DEFAULT_CONTEXT, EMPTY_CAMPAIGN)).validation.kind).toBe('invalid')
  expect(buyCampaignPart(EMPTY_CAMPAIGN, 'rf-x')).toBe(EMPTY_CAMPAIGN)
})

it('completes earn → unlock → redesign with no repeat awards or free engineering changes', () => {
  const earned = awardCampaignPass(EMPTY_CAMPAIGN, firstPass, 'wildfire')
  expect(campaignCredits(earned)).toBe(120)
  expect(awardCampaignPass(earned, firstPass, 'wildfire')).toBe(earned)
  const purchased = buyCampaignPart(earned, 'rf-x')
  expect(campaignCredits(purchased)).toBe(20)
  expect(buyCampaignPart(purchased, 'rf-x')).toBe(purchased)
  expect(buyCampaignPart(purchased, 'arr-deploy-xl')).toBe(purchased)
  const context = campaignContext(URBAN_MISSION.context, purchased)
  const result = evaluateMission(URBAN_MISSION.passingConfiguration, context)
  expect(result.outcome).toBe('MODEL_PASS_PROVISIONAL')
  expect(result.metrics.totalUsd).toEqual(evaluateMission(URBAN_MISSION.passingConfiguration, URBAN_MISSION.context).metrics.totalUsd)
  const completed = awardCampaignPass(purchased, result, 'urban-heat')
  expect(completed.completedMissionIds).toEqual(['wildfire', 'urban-heat'])
  expect(campaignCredits(completed)).toBe(160)
  const reloaded = parseCampaign(JSON.stringify(completed))
  expect(reloaded).toEqual(completed)
  expect(awardCampaignPass(reloaded, result, 'urban-heat')).toBe(reloaded)
  expect(awardCampaignPass(reloaded, firstPass, 'wildfire')).toBe(reloaded)
})

it('keeps the alternative array purchase solvent and campaign-completable', () => {
  const earned = awardCampaignPass(EMPTY_CAMPAIGN, firstPass, 'wildfire')
  const purchased = buyCampaignPart(earned, 'arr-deploy-xl')
  expect(campaignCredits(purchased)).toBe(0)
  const result = evaluateMission({ ...WF_C, scenarioId: 'urban-heat' }, campaignContext(URBAN_MISSION.context, purchased))
  expect(result.outcome).toBe('MODEL_PASS_PROVISIONAL')
  expect(campaignCredits(awardCampaignPass(purchased, result, 'urban-heat'))).toBe(140)
})

it('does not award failures, invalid/unknown outcomes, wrong missions, locked hardware or out-of-order passes', () => {
  const failure = evaluateMission(FIRST_MISSION, DEFAULT_CONTEXT)
  const urban = evaluateMission(URBAN_MISSION.passingConfiguration, URBAN_MISSION.context)
  for (const report of [failure, { ...firstPass, outcome: 'UNVERIFIED' as const },
    { ...firstPass, validation: { kind: 'invalid' as const, issues: ['test'] } },
    evaluateMission(WF_B, DEFAULT_CONTEXT),
  ]) expect(awardCampaignPass(EMPTY_CAMPAIGN, report, 'wildfire')).toBe(EMPTY_CAMPAIGN)
  expect(awardCampaignPass(EMPTY_CAMPAIGN, firstPass, 'urban-heat')).toBe(EMPTY_CAMPAIGN)
  expect(awardCampaignPass(EMPTY_CAMPAIGN, urban, 'urban-heat')).toBe(EMPTY_CAMPAIGN)
})

it.each([null, '', 'not-json', '{}', '[]',
  JSON.stringify({ version: 2, completedMissionIds: [], unlockedPartIds: [] }),
  JSON.stringify({ version: 3, completedMissionIds: [], unlockedPartIds: [] }),
  JSON.stringify({ version: 1, completedMissionIds: ['unknown'], unlockedPartIds: [] }),
  JSON.stringify({ version: 1, completedMissionIds: [], unlockedPartIds: ['rf-x'] }),
  JSON.stringify({ version: 1, completedMissionIds: ['urban-heat'], unlockedPartIds: [] }),
  JSON.stringify({ version: 1, completedMissionIds: ['wildfire'], unlockedPartIds: ['not-a-part'] }),
])('safely handles absent, malformed or impossible save %#', raw => {
  expect(parseCampaign(raw)).toEqual(EMPTY_CAMPAIGN)
})

it('migrates every previously valid v1 inventory without changing entitlements or credit balance', () => {
  for (const completed of [[], ['wildfire'], ['wildfire', 'urban-heat']]) {
    for (const unlocked of [[], ['rf-x'], ['arr-deploy-xl'], ['rf-x', 'arr-deploy-xl']]) {
      const expected = completed.length * 100 - unlocked.length * 100
      if (expected < 0) continue
      const migrated = parseCampaign(JSON.stringify({ version: 1, completedMissionIds: completed, unlockedPartIds: unlocked }))
       expect(migrated.version).toBe(3)
      expect(migrated.completedMissionIds).toEqual(completed)
      expect(migrated.unlockedPartIds).toEqual(unlocked)
      expect(campaignCredits(migrated)).toBe(expected)
      expect(parseCampaign(JSON.stringify(migrated))).toEqual(migrated)
    }
  }
})

it('rejects stale-inventory and spoofed failure reports, including guide/direct reports', () => {
  const earned = awardCampaignPass(EMPTY_CAMPAIGN, firstPass, 'wildfire')
  const config = { ...WF_A, scenarioId: 'urban-heat' }
  const report = evaluateMission(config, campaignContext(URBAN_MISSION.context, earned))
  const purchased = buyCampaignPart(earned, 'arr-deploy-xl')
  expect(awardCampaignPass(purchased, report, 'urban-heat')).toBe(purchased)
  const failure = evaluateMission({ ...config, groundId: 'gs-network' }, campaignContext(URBAN_MISSION.context, earned))
  expect(awardCampaignPass(earned, { ...failure, outcome: 'MODEL_PASS_PROVISIONAL' }, 'urban-heat')).toBe(earned)
  expect(awardCampaignPass(EMPTY_CAMPAIGN, evaluateMission(WF_A, DEFAULT_CONTEXT), 'wildfire')).toBe(EMPTY_CAMPAIGN)
})

function legacySeeds() {
  const seeds = []
  for (const version of [1, 2]) {
    const missions = CAMPAIGN_CONTRACTS.slice(0, version === 1 ? 2 : 4).map(c => c.missionId)
    const parts = CAMPAIGN_SHOP.slice(0, version === 1 ? 2 : 4).map(p => p.partId)
    for (let count = 0; count <= missions.length; count++) for (let mask = 0; mask < 2 ** parts.length; mask++) {
      const unlockedPartIds = parts.filter((_, index) => mask & (1 << index))
      if (unlockedPartIds.length > count) continue
      seeds.push({ version, completedMissionIds: missions.slice(0, count), unlockedPartIds })
    }
  }
  return seeds
}

it('preserves EVERY valid historical v1/v2 inventory, exact balance, entitlements and settled first clears', () => {
  for (const legacy of legacySeeds()) {
    const migrated = parseCampaign(JSON.stringify(legacy))
    expect(migrated.version).toBe(3)
    expect(migrated.completedMissionIds).toEqual(legacy.completedMissionIds)
    expect(migrated.unlockedPartIds).toEqual(legacy.unlockedPartIds)
    expect(campaignCredits(migrated)).toBe(100 * (legacy.completedMissionIds.length - legacy.unlockedPartIds.length))
    expect(Object.values(migrated.awards)).toEqual(legacy.completedMissionIds.map(() => 100))
    expect(Object.values(migrated.paidParts)).toEqual(legacy.unlockedPartIds.map(() => 100))
    expect(parseCampaign(JSON.stringify(migrated))).toEqual(migrated)
    for (const id of legacy.completedMissionIds) {
      const mission = MISSIONS.find(m => m.id === id)!
      expect(awardCampaignPass(migrated, evaluateMission(mission.passingConfiguration, campaignContext(mission.context, migrated)), id)).toBe(migrated)
    }
  }
})

it('rejects historically impossible linear saves even though those branches are possible in v3', () => {
  expect(parseCampaign(JSON.stringify({ version: 2, completedMissionIds: ['wildfire', 'visible-mapping'], unlockedPartIds: [] }))).toEqual(EMPTY_CAMPAIGN)
})

it.each([
  { awards: { wildfire: 121 }, paidParts: {} },
  { awards: { wildfire: 120, 'urban-heat': 140 }, paidParts: {} },
  { awards: {}, paidParts: {} },
  { awards: { wildfire: '120' }, paidParts: {} },
  { awards: { wildfire: 120 }, paidParts: { 'rf-x': 100 } },
])('rejects malformed or unmatched v3 ledgers %#', ledger => {
  expect(parseCampaign(JSON.stringify({ version: 3, completedMissionIds: ['wildfire'], unlockedPartIds: [], ...ledger }))).toEqual(EMPTY_CAMPAIGN)
})

it('refunds the historical paid basis, charges current prices on rebuy and never grants a retroactive top-up', () => {
  const old = parseCampaign(JSON.stringify({ version: 2, completedMissionIds: ['wildfire', 'urban-heat', 'visible-mapping'], unlockedPartIds: ['arr-deploy-xl', 'rf-x', 'pl-relay'] }))
  expect(campaignCredits(old)).toBe(0)
  const refunded = refundCampaignPart(old, 'arr-deploy-xl')
  expect(campaignCredits(refunded)).toBe(100)
  expect(buyCampaignPart(refunded, 'arr-deploy-xl')).toBe(refunded) // now costs 120
  const both = refundCampaignPart(refunded, 'pl-relay')
  expect(campaignCredits(both)).toBe(200)
  const repurchased = buyCampaignPart(both, 'arr-deploy-xl')
  expect(campaignCredits(repurchased)).toBe(80)
  expect(repurchased.paidParts).toEqual({ 'rf-x': 100, 'arr-deploy-xl': 120 })
  expect(campaignCredits(refundCampaignPart(repurchased, 'arr-deploy-xl'))).toBe(200)
  expect(parseCampaign(JSON.stringify(repurchased))).toEqual(repurchased)
  expect(repurchased.awards).toEqual({ wildfire: 100, 'urban-heat': 100, 'visible-mapping': 100 })
})

it('offers eight real-ID nodes, enforces purchase ancestry and allows recoverable dependent refunds', () => {
  expect(new Set(CAMPAIGN_UPGRADES.map(p => p.partId)).size).toBe(8)
  const funded = parseCampaign(JSON.stringify({ version: 2, completedMissionIds: CAMPAIGN_CONTRACTS.map(c => c.missionId), unlockedPartIds: [] }))
  expect(buyCampaignPart(funded, 'pl-relay')).toBe(funded)
  const radio = buyCampaignPart(funded, 'rf-x')
  const relay = buyCampaignPart(radio, 'pl-relay')
  const recovered = refundCampaignPart(relay, 'rf-x')
  expect(campaignCredits(recovered)).toBe(260)
  expect(campaignComplete(recovered)).toBe(true)
  expect(campaignContractAvailable(recovered, 'packet-relay')).toBe(false)
  expect(campaignContractAvailable(buyCampaignPart(recovered, 'rf-x'), 'packet-relay')).toBe(true)
})

function clear(p: typeof EMPTY_CAMPAIGN, id: string) {
  const mission = MISSIONS.find(m => m.id === id)!
  const config = id === 'wildfire' ? WF_A : id === 'urban-heat' ? { ...WF_A, scenarioId: id } : mission.passingConfiguration
  const report = evaluateMission(config, campaignContext(mission.context, p))
  expect(report.outcome).toBe('MODEL_PASS_PROVISIONAL')
  const next = awardCampaignPass(p, report, id)
  expect(next.completedMissionIds).toContain(id)
  return next
}
it('completes two distinct contract orders, including shoreline before urban and relay before shoreline', () => {
  let mapping = buyCampaignPart(clear(EMPTY_CAMPAIGN, 'wildfire'), 'pl-visible-35')
  expect(campaignContractAvailable(mapping, 'visible-mapping')).toBe(true)
  mapping = clear(mapping, 'visible-mapping')
  // Reuse the completed mapping camera's capital for the relay branch.
  mapping = buyCampaignPart(buyCampaignPart(refundCampaignPart(mapping, 'pl-visible-35'), 'rf-x'), 'pl-relay')
  mapping = clear(clear(mapping, 'packet-relay'), 'urban-heat')
  mapping = buyCampaignPart(mapping, 'pl-visible-35')
  expect(mapping.completedMissionIds).toEqual(['wildfire', 'visible-mapping', 'packet-relay', 'urban-heat'])
  expect(campaignCredits(mapping)).toBe(300)
  let comms = buyCampaignPart(clear(EMPTY_CAMPAIGN, 'wildfire'), 'rf-x')
  comms = buyCampaignPart(clear(comms, 'urban-heat'), 'pl-relay')
  comms = clear(comms, 'packet-relay')
  comms = clear(buyCampaignPart(comms, 'pl-visible-35'), 'visible-mapping')
  expect(comms.completedMissionIds).toEqual(['wildfire', 'urban-heat', 'packet-relay', 'visible-mapping'])
  expect(campaignCredits(comms)).toBe(300)
  expect(campaignComplete(mapping) && campaignComplete(comms)).toBe(true)
})

it('proves completion from EVERY reachable fresh AND mixed historical/current buy/refund/clear ledger', () => {
  type Progress = typeof EMPTY_CAMPAIGN
  const key = (p: Progress) => JSON.stringify([Object.entries(p.awards).sort(), Object.entries(p.paidParts).sort()])
  const seeds = [EMPTY_CAMPAIGN, ...legacySeeds().map(p => parseCampaign(JSON.stringify(p)))]
  const states = new Map<string, Progress>(seeds.map(p => [key(p), p]))
  const edges = new Map<string, string[]>()
  const todo = [...states.values()]
  const reports = new Map<string, ReturnType<typeof evaluateMission>>()
  for (let index = 0; index < todo.length; index++) {
    const p = todo[index], next: Progress[] = []
    for (const item of CAMPAIGN_SHOP) next.push(buyCampaignPart(p, item.partId), refundCampaignPart(p, item.partId))
    for (const contract of CAMPAIGN_CONTRACTS) {
      if (!campaignContractAvailable(p, contract.missionId)) continue
      const mission = MISSIONS.find(m => m.id === contract.missionId)!
      const config = mission.id === 'wildfire' ? WF_A
        : mission.id === 'urban-heat' ? { ...WF_A, scenarioId: mission.id } : mission.passingConfiguration
      const context = campaignContext(mission.context, p)
      const reportKey = `${mission.id}:${[...p.unlockedPartIds].sort().join(',')}`
      if (!reports.has(reportKey)) reports.set(reportKey, evaluateMission(config, context))
      next.push(awardCampaignPass(p, reports.get(reportKey)!, mission.id))
    }
    edges.set(key(p), next.map(key))
    for (const n of next) if (!states.has(key(n))) { states.set(key(n), n); todo.push(n) }
    expect(campaignCredits(p)).toBeGreaterThanOrEqual(0)
    expect(parseCampaign(JSON.stringify(p))).toEqual(p)
  }
  const solvable = new Set([...states].filter(([, p]) => campaignComplete(p)).map(([k]) => k))
  let changed = true
  while (changed) {
    changed = false
    for (const [k, next] of edges) if (!solvable.has(k) && next.some(n => solvable.has(n))) { solvable.add(k); changed = true }
  }
  expect(states.size).toBeGreaterThan(30)
  expect(solvable.size).toBe(states.size)
  console.info(`Campaign solvency: ${states.size} reachable states; ${solvable.size} have a completion route.`)
})

it('normalizes duplicate save records so they cannot mint credits', () => {
  const progress = parseCampaign(JSON.stringify({
    version: 1, completedMissionIds: ['wildfire', 'wildfire'], unlockedPartIds: ['rf-x', 'rf-x'],
  }))
  expect(progress.completedMissionIds).toEqual(['wildfire'])
  expect(progress.unlockedPartIds).toEqual(['rf-x'])
  expect(campaignCredits(progress)).toBe(0)
})
