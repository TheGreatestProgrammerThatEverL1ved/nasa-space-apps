import { expect, it } from 'vitest'
import {
  awardCampaignPass, buyCampaignPart, campaignContext, campaignCredits,
  EMPTY_CAMPAIGN, parseCampaign, CAMPAIGN_CONTRACTS, CAMPAIGN_SHOP, campaignComplete, campaignContractAvailable, refundCampaignPart,
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
  expect(campaignCredits(earned)).toBe(100)
  expect(awardCampaignPass(earned, firstPass, 'wildfire')).toBe(earned)
  const purchased = buyCampaignPart(earned, 'rf-x')
  expect(campaignCredits(purchased)).toBe(0)
  expect(buyCampaignPart(purchased, 'rf-x')).toBe(purchased)
  expect(buyCampaignPart(purchased, 'arr-deploy-xl')).toBe(purchased)
  const context = campaignContext(URBAN_MISSION.context, purchased)
  const result = evaluateMission(URBAN_MISSION.passingConfiguration, context)
  expect(result.outcome).toBe('MODEL_PASS_PROVISIONAL')
  expect(result.metrics.totalUsd).toEqual(evaluateMission(URBAN_MISSION.passingConfiguration, URBAN_MISSION.context).metrics.totalUsd)
  const completed = awardCampaignPass(purchased, result, 'urban-heat')
  expect(completed.completedMissionIds).toEqual(['wildfire', 'urban-heat'])
  expect(campaignCredits(completed)).toBe(100)
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
  expect(campaignCredits(awardCampaignPass(purchased, result, 'urban-heat'))).toBe(100)
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
      expect(migrated.version).toBe(2)
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

it('proves completion is reachable from EVERY reachable allowed purchase/refund state', () => {
  type Progress = typeof EMPTY_CAMPAIGN
  const key = (p: Progress) => JSON.stringify([[...p.completedMissionIds].sort(), [...p.unlockedPartIds].sort()])
  const states = new Map<string, Progress>([[key(EMPTY_CAMPAIGN), EMPTY_CAMPAIGN]])
  const edges = new Map<string, string[]>()
  const todo = [EMPTY_CAMPAIGN]
  for (let index = 0; index < todo.length; index++) {
    const p = todo[index], next: Progress[] = []
    for (const item of CAMPAIGN_SHOP) next.push(buyCampaignPart(p, item.partId), refundCampaignPart(p, item.partId))
    for (const contract of CAMPAIGN_CONTRACTS) {
      if (!campaignContractAvailable(p, contract.missionId)) continue
      const mission = MISSIONS.find(m => m.id === contract.missionId)!
      const config = mission.id === 'wildfire' ? WF_A
        : mission.id === 'urban-heat' ? { ...WF_A, scenarioId: mission.id } : mission.passingConfiguration
      const context = campaignContext(mission.context, p)
      next.push(awardCampaignPass(p, evaluateMission(config, context), mission.id))
    }
    edges.set(key(p), next.map(key))
    for (const n of next) if (!states.has(key(n))) { states.set(key(n), n); todo.push(n) }
    expect(campaignCredits(p)).toBeGreaterThanOrEqual(0)
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
