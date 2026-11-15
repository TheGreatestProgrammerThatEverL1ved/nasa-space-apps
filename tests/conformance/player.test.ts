import { expect, it } from 'vitest'
import { PLAYER_MISSIONS } from '../../src/data/player/missions'
import { PLAYER_FAILURES, PLAYER_WITNESSES } from '../../src/data/player/witnesses'
import { NEW_PARTS } from '../../src/data/player/catalog'
import { evaluateMission } from '../../src/engine/evaluate'
import type { EvaluationReport } from '../../src/engine/types'
import { SLOT_FIELDS, completeDraft, emptyDraft, removeSlot, sanitizeDraft } from '../../src/engine/draft'
import { awardCampaignPass, buyCampaignPart, campaignContext, campaignCredits, EMPTY_CAMPAIGN, parseCampaign, refundCampaignPart, CAMPAIGN_SHOP, CAMPAIGN_UPGRADES } from '../../src/campaign/progress'
import { WF_A } from '../../src/fixtures/builds'
import { hasAppearance } from '../../src/ui/orbital/appearance'
import { MISSIONS } from '../../src/data/scenarios'

const value=(r:EvaluationReport,key:string)=>{
  const m=r.metrics[key]; if(m?.kind!=='finite')throw Error(`Missing ${key}`);return m.value
}

it('ships 35 unique selectable IDs, 12 additions, six pairs, all with evaluator coverage and appearances',()=>{
  const parts=new Map(PLAYER_MISSIONS.flatMap(m=>Object.values(m.context.catalog).flat()).map(p=>[p.id,p]))
  expect(parts.size).toBeGreaterThanOrEqual(35)
  expect(new Set(NEW_PARTS.map(p=>p.id)).size).toBe(12)
  for(const category of ['bus','payload','array','battery','radio','ground'])expect(NEW_PARTS.filter(p=>p.category===category)).toHaveLength(2)
  const exercised=new Set(Object.values(PLAYER_WITNESSES).flatMap(w=>[...Object.values(w.a),...Object.values(w.b)]))
  for(const p of NEW_PARTS) {
    expect(parts.has(p.id)).toBe(true);expect(exercised.has(p.id)).toBe(true);expect(hasAppearance(p.id)).toBe(true)
    expect(p.label.en).not.toBe(p.label.ua)
    expect(Object.values(p.evidence).every(e=>e.kind==='provisional')).toBe(true)
  }
  expect(CAMPAIGN_UPGRADES).toHaveLength(12);expect(CAMPAIGN_SHOP).toHaveLength(8)
  for(const m of MISSIONS){
    expect(m.context.scenario.budgetUsd).toBe(3000000)
    expect(m.context.catalog.buses.some(p=>p.id==='bus-12u-light')).toBe(false)
    expect(m.context.catalog.launchers[0]!.busIds).not.toContain('bus-12u-vault')
  }
})
it.each(PLAYER_MISSIONS)('proves passes, Pareto choices and repairable failures for $id',mission=>{
    const id=mission.id as keyof typeof PLAYER_WITNESSES
    const witnesses=PLAYER_WITNESSES[id]
    const reports=Object.values(witnesses).map(config=>evaluateMission(config,mission.context))
    for(const r of reports)expect(r.outcome).toBe('MODEL_PASS_PROVISIONAL')
    expect(SLOT_FIELDS.filter(f=>witnesses.a[f]!==witnesses.b[f]).length).toBeGreaterThanOrEqual(2)
    const [a,b]=reports as [EvaluationReport,EvaluationReport]
    if(id==='urban-heat') {
      expect(value(a,'totalUsd')).toBeGreaterThan(value(b,'totalUsd'))
      expect(value(a,'effectiveScaleM')).toBeLessThan(value(b,'effectiveScaleM'))
    } else {
      expect(value(a,'totalUsd')).toBeLessThan(value(b,'totalUsd'))
      if(id==='visible-mapping')expect(value(a,'usableStorageGB')).toBeLessThan(value(b,'usableStorageGB'))
      else expect(value(a,'latencyHours')).toBeGreaterThan(value(b,'latencyHours'))
    }
    const failures=PLAYER_FAILURES[id]
    const budget=evaluateMission(failures.budget,mission.context)
    expect(budget.validation.kind).toBe('valid')
    expect(budget.checks.filter(c=>c.status!=='MET').map(c=>c.checkId)).toEqual(['ENG-BUDGET'])
    const repair=id==='visible-mapping' ? witnesses.b : witnesses.a
    expect(SLOT_FIELDS.filter(f=>repair[f]!==failures.budget[f]).length).toBeLessThanOrEqual(2)
    const technical=evaluateMission(failures.technical,mission.context)
    expect(technical.validation.kind).toBe('valid')
    expect(technical.outcome).toBe('FAILURE')
    expect(value(technical,'totalUsd')).toBeLessThanOrEqual(mission.context.scenario.budgetUsd)
    expect(technical.checks.find(c=>c.checkId==='ENG-BUDGET')?.status).toBe('MET')
    expect(technical.checks.some(c=>c.status==='NOT_MET')).toBe(true)
    console.info(JSON.stringify({mission:id,cap:mission.context.scenario.budgetUsd,passes:reports.map(r=>({cost:value(r,'totalUsd'),latency:value(r,'latencyHours')})),
      budget:value(budget,'totalUsd'),technical:value(technical,'totalUsd'),failures:technical.checks.filter(c=>c.status!=='MET').map(c=>c.checkId)}))
})
it('rejects every missing slot in all four player contexts and in both inventories',()=>{
  for(const mission of PLAYER_MISSIONS) {
    for(const context of [mission.context,campaignContext(mission.context,EMPTY_CAMPAIGN)]) {
      expect(completeDraft(emptyDraft(mission.id),context)).toBe(false)
      const full=PLAYER_WITNESSES[mission.id as keyof typeof PLAYER_WITNESSES].a
      for(const field of SLOT_FIELDS) {
        const partial=removeSlot(full,field)
        expect(completeDraft(partial,context)).toBe(false)
        expect(evaluateMission(partial,context).outcome).not.toBe('MODEL_PASS_PROVISIONAL')
      }
      expect(sanitizeDraft({...emptyDraft(mission.id),radioId:'missing'},context)).toEqual(emptyDraft(mission.id))
    }
  }
})
it.each([false,true])('completes the player campaign at fresh / historical minimum capital (%s)',historical=>{
  let p=historical ? parseCampaign(JSON.stringify({version:1,completedMissionIds:['wildfire'],unlockedPartIds:[]})) : EMPTY_CAMPAIGN
  for(const m of PLAYER_MISSIONS) {
    for(const item of CAMPAIGN_SHOP)p=refundCampaignPart(p,item.partId)
    if(m.id==='visible-mapping')p=buyCampaignPart(p,'pl-visible-35')
    if(m.id==='packet-relay'){p=buyCampaignPart(p,'rf-x');p=buyCampaignPart(p,'pl-relay')}
    const config=m.id==='wildfire'||m.id==='urban-heat' ? {...WF_A,scenarioId:m.id}
      : {...m.passingConfiguration,busId:'bus-12u-light'}
    const r=evaluateMission(config,campaignContext(m.context,p))
    expect(r.outcome).toBe('MODEL_PASS_PROVISIONAL')
    p=awardCampaignPass(p,r,m.id)
    expect(p.completedMissionIds).toContain(m.id)
    expect(parseCampaign(JSON.stringify(p))).toEqual(p)
  }
  expect(p.completedMissionIds).toHaveLength(4)
})
it('preserves capital across every affordable optional buy/refund; purchases do not affect engineering values',()=>{
  const earned=parseCampaign(JSON.stringify({version:3,completedMissionIds:['wildfire','urban-heat'],unlockedPartIds:[],awards:{wildfire:120,'urban-heat':140},paidParts:{}}))
  for(const item of CAMPAIGN_SHOP){
    const funded=buyCampaignPart(earned,item.prerequisiteId)
    const before=campaignCredits(funded)+Object.values(funded.paidParts).reduce((a,b)=>a+b,0)
    const bought=buyCampaignPart(funded,item.partId)
    expect(bought.unlockedPartIds).toContain(item.partId)
    expect(campaignCredits(bought)+Object.values(bought.paidParts).reduce((a,b)=>a+b,0)).toBe(before)
    expect(refundCampaignPart(bought,item.partId)).toEqual(funded)
  }
})
it('reproduces every budget-only witness with legitimately earned later Campaign inventory',()=>{
  // These are settled genuine clears, not arbitrary free balances.
  let earned=EMPTY_CAMPAIGN
  for(const m of PLAYER_MISSIONS){
    if(m.id==='visible-mapping')earned=buyCampaignPart(earned,'pl-visible-35')
    if(m.id==='packet-relay'){earned=buyCampaignPart(earned,'rf-x');earned=buyCampaignPart(earned,'pl-relay')}
    const config=m.id==='wildfire'||m.id==='urban-heat'?{...WF_A,scenarioId:m.id}
      :{...m.passingConfiguration,busId:'bus-12u-light'}
    earned=awardCampaignPass(earned,evaluateMission(config,campaignContext(m.context,earned)),m.id)
  }
  expect(earned.completedMissionIds).toHaveLength(4)
  for(const m of PLAYER_MISSIONS){
    let p=earned
    for(const item of CAMPAIGN_SHOP)p=refundCampaignPart(p,item.partId)
    const config=PLAYER_FAILURES[m.id as keyof typeof PLAYER_FAILURES].budget
    const acquire=(id:string)=>{
      const item=CAMPAIGN_SHOP.find(part=>part.partId===id)
      if(!item)return
      acquire(item.prerequisiteId);p=buyCampaignPart(p,id)
      expect(p.unlockedPartIds).toContain(id)
    }
    for(const id of Object.values(config))acquire(id)
    const r=evaluateMission(config,campaignContext(m.context,p))
    expect(r.checks.filter(c=>c.status!=='MET').map(c=>c.checkId)).toEqual(['ENG-BUDGET'])
  }
})
