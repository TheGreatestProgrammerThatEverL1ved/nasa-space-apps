import { expect, it } from 'vitest'
import {
  awardCampaignPass, buyCampaignPart, campaignContext, campaignCredits,
  EMPTY_CAMPAIGN, parseCampaign,
} from '../../src/campaign/progress'
import { DEFAULT_CONTEXT } from '../../src/data/context'
import { URBAN_MISSION } from '../../src/data/scenarios'
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
  JSON.stringify({ version: 1, completedMissionIds: ['unknown'], unlockedPartIds: [] }),
  JSON.stringify({ version: 1, completedMissionIds: [], unlockedPartIds: ['rf-x'] }),
  JSON.stringify({ version: 1, completedMissionIds: ['urban-heat'], unlockedPartIds: [] }),
  JSON.stringify({ version: 1, completedMissionIds: ['wildfire'], unlockedPartIds: ['not-a-part'] }),
])('safely handles absent, malformed or impossible save %#', raw => {
  expect(parseCampaign(raw)).toEqual(EMPTY_CAMPAIGN)
})

it('normalizes duplicate save records so they cannot mint credits', () => {
  const progress = parseCampaign(JSON.stringify({
    version: 1, completedMissionIds: ['wildfire', 'wildfire'], unlockedPartIds: ['rf-x', 'rf-x'],
  }))
  expect(progress.completedMissionIds).toEqual(['wildfire'])
  expect(progress.unlockedPartIds).toEqual(['rf-x'])
  expect(campaignCredits(progress)).toBe(0)
})
