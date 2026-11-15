import MissionApp, { type MissionHandle } from './ui/MissionApp'
import { useRef, useState } from 'react'
import { MISSIONS } from './data/scenarios'
import { evaluateMission } from './engine/evaluate'
import { WF_A } from './fixtures/builds'
import type { EvaluationReport, Locale, MissionConfiguration } from './engine/types'
import CampaignPanel from './ui/CampaignPanel'
import { translate } from './i18n'
import type { GameScreen } from './ui/game/GameScreens'
import {
  awardCampaignPass, buyCampaignPart, campaignComplete, campaignContext, campaignContractAvailable,
  campaignCredits, CAMPAIGN_CONTRACTS, CAMPAIGN_UPGRADES, campaignOwnsPart, CAMPAIGN_STORAGE_KEY,
  EMPTY_CAMPAIGN, parseCampaign, refundCampaignPart, type CampaignProgress,
} from './campaign/progress'

function readCampaign(): { progress: CampaignProgress; storageError: boolean } {
  try { return { progress: parseCampaign(localStorage.getItem(CAMPAIGN_STORAGE_KEY)), storageError: false } }
  catch { return { progress: EMPTY_CAMPAIGN, storageError: true } }
}
export default function App({ presentation }: { presentation?: 'orbital' | 'engineering' } = {}) {
  const engineering = presentation === 'engineering' || new URLSearchParams(window.location.search).get('view') === 'engineering'
  const [missionId, setMissionId] = useState('wildfire')
  const [screen, setScreen] = useState<GameScreen>('menu')
  const [locale, setLocale] = useState<Locale>('en')
  const [pickerWasUsed, setPickerWasUsed] = useState(false)
  const [campaignActive, setCampaignActive] = useState(false)
  const [campaign, setCampaign] = useState(readCampaign)
  const [creditDelta, setCreditDelta] = useState<number | null>(null)
  const [drafts, setDrafts] = useState<Record<string, MissionConfiguration>>({})
  const missionRef = useRef<MissionHandle>(null)
  const mission = MISSIONS.find(m => m.id === missionId) ?? MISSIONS[0]!
  const context = campaignActive ? campaignContext(mission.context, campaign.progress) : mission.context
  const saveProgress = (progress: CampaignProgress) => {
    setCreditDelta(campaignCredits(progress) - campaignCredits(campaign.progress))
    if (progress === campaign.progress) return
    let storageError = false
    try { localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(progress)) }
    catch { storageError = true }
    setCampaign({ progress, storageError })
  }
  const onReport = (report: EvaluationReport) => {
    if (campaignActive) saveProgress(awardCampaignPass(campaign.progress, report, mission.id))
  }
  const chooseMission = (id: string) => {
    if (campaignActive && !campaignContractAvailable(campaign.progress, id)) return
    setPickerWasUsed(true); setMissionId(id); setCreditDelta(null)
    setScreen('hangar')
  }
  const fit = (partId: string, refund = false, progress = campaign.progress) => {
    const item = CAMPAIGN_UPGRADES.find(p => p.partId === partId)
    if (!item || !refund && !campaignOwnsPart(progress, partId)) return
    missionRef.current?.fitEquipment({ partId, field: item.field, refund }, campaignContext(mission.context, progress))
  }
  const buy = (partId: string) => {
    const next = buyCampaignPart(campaign.progress, partId)
    saveProgress(next)
    if (next !== campaign.progress) fit(partId, false, next)
  }
  const refund = (partId: string) => {
    const next = refundCampaignPart(campaign.progress, partId)
    saveProgress(next)
    if (next !== campaign.progress) fit(partId, true, next)
  }
  const campaignMissions = campaignActive ? MISSIONS.filter(m => m.id === mission.id || campaignContractAvailable(campaign.progress, m.id)) : MISSIONS
  const remaining = CAMPAIGN_CONTRACTS.filter(c => !campaign.progress.completedMissionIds.includes(c.missionId))
  const nextContract = remaining.find(c => campaignContractAvailable(campaign.progress, c.missionId)) ?? remaining[0]
  const nextMission = MISSIONS.find(m => m.id === nextContract?.missionId)
  const nextAvailable = nextContract && campaignContractAvailable(campaign.progress, nextContract.missionId)
  const draftKey = `${campaignActive ? 'campaign' : 'direct'}:${mission.id}`
  const initialConfiguration = drafts[draftKey] ?? (campaignActive && mission.id === 'wildfire' ? WF_A : mission.initialConfiguration)
  // A refunded part is not silently kept selected when returning to a saved draft.
  const safeInitial = { ...initialConfiguration }
  const defaults = { payloadId: [...context.catalog.payloads, ...(context.catalog.relayPayloads ?? [])], busId: context.catalog.buses, arrayId: context.catalog.arrays, batteryId: context.catalog.batteries, radioId: context.catalog.radios, groundId: context.catalog.grounds, orbitId: context.catalog.orbits, launcherId: context.catalog.launchers }
  const availableIds = new Set(Object.values(defaults).flatMap(parts => parts.map(p => p.id)))
  for (const field of Object.keys(defaults) as (keyof typeof defaults)[]) if (!availableIds.has(safeInitial[field])) safeInitial[field] = defaults[field][0]?.id ?? ''
  return <MissionApp ref={missionRef} key={`${mission.id}:${campaignActive ? 'campaign' : 'direct'}`}
    context={context} initialConfiguration={safeInitial}
    evaluate={request => evaluateMission(request, context)}
    mission={mission} missions={engineering ? campaignMissions : MISSIONS} onMissionChange={chooseMission}
    focusMissionPicker={pickerWasUsed} onReport={onReport}
    onDraftChange={config => { setDrafts(previous => ({ ...previous, [draftKey]: config })) }}
    debriefAction={campaignActive ? <div className="debrief-next">
      <p>{creditDelta !== null && creditDelta > 0 ? `+${creditDelta} ${locale === 'en' ? 'credits • First clear collected.' : 'кредитів • Перший прохід зараховано.'}`
        : (locale === 'en' ? 'No additional reward. First-clear awards are collected once.' : 'Без додаткової нагороди. Перший прохід оплачується один раз.')}</p>
      <p>{campaignComplete(campaign.progress) ? translate(locale, 'campaign.complete')
        : `${locale === 'en' ? 'Next objective' : 'Наступна мета'}: ${nextMission?.title[locale] ?? ''}. ${!nextAvailable ? (locale === 'en' ? 'Unlock the required equipment on the contract board; full refunds keep credits available.' : 'Відкрийте потрібне обладнання на дошці контрактів; повні повернення зберігають доступність кредитів.') : ''}`}</p>
      <button type="button" onClick={() => {
        if (nextAvailable && nextContract) chooseMission(nextContract.missionId)
        else if (!engineering) setScreen('missions')
        else { const target = document.getElementById('campaign-heading'); target?.focus(); target?.scrollIntoView?.({ block: 'start' }) }
      }}>{nextAvailable ? (locale === 'en' ? 'Choose next contract' : 'Вибрати наступний контракт') : (locale === 'en' ? 'Open contract board / hangar' : 'Відкрити дошку контрактів / ангар')}</button>
      {!engineering && !campaignComplete(campaign.progress) && <button onClick={() => setScreen('missions')}>{locale === 'en' ? 'Choose a different branch / upgrades' : 'Інша гілка / вдосконалення'}</button>}
    </div> : <div className="debrief-next"><button onClick={() => {
      if (!engineering) setScreen('missions')
      else { const target = document.getElementById('mission-picker'); target?.focus(); target?.scrollIntoView?.({ block: 'center' }) }
    }}>{locale === 'en' ? 'Choose another mission' : 'Вибрати іншу місію'}</button></div>}
    campaignPanel={<CampaignPanel active={campaignActive} progress={campaign.progress} locale={locale}
      storageError={campaign.storageError} currentMissionId={missionId} creditDelta={creditDelta}
      configuration={safeInitial}
      onChoose={chooseMission} onFit={id => fit(id)} onRefund={refund}
      compactBoard={!engineering}
      onToggle={() => { setCampaignActive(!campaignActive); setMissionId('wildfire'); setPickerWasUsed(true); setCreditDelta(null) }}
      onBuy={buy} />}
    game={engineering ? undefined : { screen, onNavigate: setScreen, campaignActive, onCampaign: () => {
      setCampaignActive(!campaignActive); setMissionId('wildfire'); setPickerWasUsed(true); setCreditDelta(null)
      setScreen(campaignActive ? 'menu' : 'missions')
    }, contracts: CAMPAIGN_CONTRACTS.map(contract => {
      const missingMissions = contract.prerequisites.filter(id => !campaign.progress.completedMissionIds.includes(id))
      const missingParts = contract.requiredParts.filter(id => !campaign.progress.unlockedPartIds.includes(id))
      const all = MISSIONS.flatMap(m => Object.values(m.context.catalog).flat())
      return { missionId: contract.missionId, available: campaignContractAvailable(campaign.progress, contract.missionId),
        completed: campaign.progress.completedMissionIds.includes(contract.missionId), reward: campaign.progress.awards[contract.missionId] ?? contract.reward,
        reason: [
          missingMissions.length ? `${locale === 'en' ? 'Complete first: ' : 'Спершу пройдіть: '}${missingMissions.map(id => MISSIONS.find(m => m.id === id)?.title[locale]).join(', ')}` : '',
          missingParts.length ? `${locale === 'en' ? 'Buy equipment below: ' : 'Купіть обладнання нижче: '}${missingParts.map(id => all.find(p => p.id === id)?.label[locale] ?? id).join(', ')}` : '',
        ].filter(Boolean).join('. ') }
    }) }}
    locale={locale} onLocaleChange={setLocale} />
}
