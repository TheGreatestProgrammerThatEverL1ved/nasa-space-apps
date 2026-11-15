import MissionApp, { type MissionHandle } from './ui/MissionApp'
import { useRef, useState } from 'react'
import { PLAYER_MISSIONS } from './data/player/missions'
import { MISSIONS as REFERENCE_MISSIONS } from './data/scenarios'
import { evaluateMission } from './engine/evaluate'
import type { EvaluationReport, Locale } from './engine/types'
import { emptyDraft, sanitizeDraft, draftView, type MissionDraft } from './engine/draft'
import CampaignPanel from './ui/CampaignPanel'
import ResearchScreen from './ui/research/ResearchScreen'
import { translate } from './i18n'
import type { GameScreen } from './ui/game/GameScreens'
import ExpeditionBoard from './ui/game/ExpeditionBoard'
import { chooseExpeditionLeg, createExpedition, EXPEDITION_KEY, expeditionContext, expeditionOffers,
  readExpedition, settleExpeditionLeg, type ExpeditionLeg, type ExpeditionRun } from './campaign/expedition'
import {
  awardCampaignPass, buyCampaignPart, campaignComplete, campaignContext, campaignContractAvailable,
  campaignCredits, CAMPAIGN_CONTRACTS, CAMPAIGN_UPGRADES, campaignOwnsPart, CAMPAIGN_STORAGE_KEY,
  EMPTY_CAMPAIGN, parseCampaign, refundCampaignPart, type CampaignProgress,
} from './campaign/progress'

function readCampaign(): { progress: CampaignProgress; storageError: boolean } {
  try { return { progress: parseCampaign(localStorage.getItem(CAMPAIGN_STORAGE_KEY)), storageError: false } }
  catch { return { progress: EMPTY_CAMPAIGN, storageError: true } }
}
function loadExpedition() {
  try { return readExpedition(localStorage.getItem(EXPEDITION_KEY)) }
  catch { return null }
}
export default function App({ presentation }: { presentation?: 'orbital' | 'engineering' } = {}) {
  const engineering = presentation === 'engineering' || new URLSearchParams(window.location.search).get('view') === 'engineering'
  const reference = engineering && new URLSearchParams(window.location.search).get('catalog')==='reference'
  const MISSIONS=reference ? REFERENCE_MISSIONS : PLAYER_MISSIONS
  const [missionId, setMissionId] = useState('wildfire')
  const [screen, setScreen] = useState<GameScreen>('menu')
  const [locale, setLocale] = useState<Locale>('en')
  const [pickerWasUsed, setPickerWasUsed] = useState(false)
  const [campaignActive, setCampaignActive] = useState(false)
  const [campaign, setCampaign] = useState(readCampaign)
  const [expedition, setExpedition] = useState(loadExpedition)
  const [expeditionStorageError, setExpeditionStorageError] = useState(false)
  const [expeditionFlight, setExpeditionFlight] = useState<{ run: ExpeditionRun; leg: ExpeditionLeg } | null>(null)
  const [creditDelta, setCreditDelta] = useState<number | null>(null)
  const [refundedDrafts, setRefundedDrafts] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, MissionDraft>>({})
  const missionRef = useRef<MissionHandle>(null)
  const mission = MISSIONS.find(m => m.id === (expeditionFlight?.leg.missionId ?? missionId)) ?? MISSIONS[0]!
  const context = expeditionFlight ? expeditionContext(mission.context, expeditionFlight.run, expeditionFlight.leg)
    : campaignActive ? campaignContext(mission.context, campaign.progress) : mission.context
  const saveExpedition = (run: ExpeditionRun) => {
    setExpedition(run)
    try { localStorage.setItem(EXPEDITION_KEY, JSON.stringify(run)); setExpeditionStorageError(false) }
    catch { setExpeditionStorageError(true) }
  }
  const acceptLeg = (id: string) => {
    if (!expedition) return
    const leg = expeditionOffers(expedition).find(offer => offer.id === id)
    if (!leg) return
    const run = chooseExpeditionLeg(expedition, id)
    saveExpedition(run)
    setExpeditionFlight({ run, leg })
    setScreen('hangar')
  }
  const navigateGame = (next: GameScreen) => {
    if (expeditionFlight && next === 'hangar' && !expedition?.legId) next = 'expedition'
    if (expeditionFlight && ['menu', 'missions', 'expedition'].includes(next)) {
      setExpeditionFlight(null)
    }
    setScreen(next)
  }
  const saveProgress = (progress: CampaignProgress) => {
    setCreditDelta(campaignCredits(progress) - campaignCredits(campaign.progress))
    if (progress === campaign.progress) return
    let storageError = false
    try { localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(progress)) }
    catch { storageError = true }
    setCampaign({ progress, storageError })
  }
  const onReport = (report: EvaluationReport) => {
    if (expeditionFlight && expedition) {
      const next = settleExpeditionLeg(expedition, report, mission.context)
      if (next !== expedition) saveExpedition(next)
    } else if (campaignActive && !reference) saveProgress(awardCampaignPass(campaign.progress, report, mission.id))
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
    setRefundedDrafts(false)
    const next = buyCampaignPart(campaign.progress, partId)
    saveProgress(next)
  }
  const refund = (partId: string) => {
    const next = refundCampaignPart(campaign.progress, partId)
    saveProgress(next)
    if (next !== campaign.progress) {
      setRefundedDrafts(true)
      setDrafts(previous => Object.fromEntries(Object.entries(previous).map(([key,draft]) => [key,
        key.startsWith('campaign:') ? Object.fromEntries(Object.entries(draft).filter(([,value]) => value !== partId)) as MissionDraft : draft])))
      fit(partId, true, next)
    }
  }
  const campaignMissions = campaignActive ? MISSIONS.filter(m => m.id === mission.id || campaignContractAvailable(campaign.progress, m.id)) : MISSIONS
  const remaining = CAMPAIGN_CONTRACTS.filter(c => !campaign.progress.completedMissionIds.includes(c.missionId))
  const nextContract = remaining.find(c => campaignContractAvailable(campaign.progress, c.missionId)) ?? remaining[0]
  const nextMission = MISSIONS.find(m => m.id === nextContract?.missionId)
  const nextAvailable = nextContract && campaignContractAvailable(campaign.progress, nextContract.missionId)
  const draftKey = expeditionFlight
    ? `expedition:${expeditionFlight.run.seed}:${expeditionFlight.leg.id}`
    : `${campaignActive ? 'campaign' : 'direct'}:${mission.id}`
  const initialConfiguration = drafts[draftKey] ?? emptyDraft(mission.id)
  // A refunded part is not silently kept selected when returning to a saved draft.
  const safeInitial = sanitizeDraft(initialConfiguration, context)
  return <>{reference && <p role="status">Internal audited reference tooling · not player balance / Внутрішні аудитовані еталони · не ігровий баланс</p>}
    <MissionApp ref={missionRef} key={draftKey}
    context={context} initialConfiguration={safeInitial}
    evaluate={request => evaluateMission(request, context)}
    mission={mission} missions={engineering ? campaignMissions : MISSIONS} onMissionChange={chooseMission}
    focusMissionPicker={pickerWasUsed} onReport={onReport}
    expeditionPanel={<ExpeditionBoard run={expedition} locale={locale} storageError={expeditionStorageError}
      onChoose={acceptLeg} onStart={() => saveExpedition(createExpedition(crypto.getRandomValues(new Uint32Array(1))[0]!))} />}
    expeditionNavigation={expeditionFlight ? () => navigateGame('expedition') : undefined}
    onDraftChange={config => { setDrafts(previous => ({ ...previous, [draftKey]: config })) }}
    researchPanel={<ResearchScreen active={campaignActive} progress={campaign.progress} locale={locale}
      storageError={campaign.storageError} refundedDrafts={refundedDrafts}
      onBuy={buy} onRefund={refund} onBack={() => setScreen('menu')}
      onCampaign={() => { setCampaignActive(true); setMissionId('wildfire'); setCreditDelta(null) }} />}
    debriefAction={expeditionFlight ? undefined : campaignActive ? <div className="debrief-next">
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
    campaignPanel={reference ? undefined : <CampaignPanel active={campaignActive} progress={campaign.progress} locale={locale}
      storageError={campaign.storageError} currentMissionId={missionId} creditDelta={creditDelta}
      configuration={draftView(safeInitial)}
      onChoose={chooseMission} onFit={id => fit(id)} onRefund={refund}
      compactBoard={!engineering}
      onToggle={() => { setCampaignActive(!campaignActive); setMissionId('wildfire'); setPickerWasUsed(true); setCreditDelta(null) }}
      onBuy={buy} />}
    game={engineering ? undefined : { screen, onNavigate: navigateGame, campaignActive, onCampaign: () => {
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
          missingParts.length ? `${locale === 'en' ? 'Unlock in Research: ' : 'Відкрийте в дослідженнях: '}${missingParts.map(id => all.find(p => p.id === id)?.label[locale] ?? id).join(', ')}` : '',
        ].filter(Boolean).join('. ') }
    }) }}
    locale={locale} onLocaleChange={setLocale} /></>
}
