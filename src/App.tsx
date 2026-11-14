import MissionApp from './ui/MissionApp'
import { useState } from 'react'
import { MISSIONS } from './data/scenarios'
import { evaluateMission } from './engine/evaluate'
import { WF_A } from './fixtures/builds'
import type { EvaluationReport, Locale } from './engine/types'
import CampaignPanel from './ui/CampaignPanel'
import {
  awardCampaignPass, buyCampaignPart, campaignContext, CAMPAIGN_STORAGE_KEY,
  EMPTY_CAMPAIGN, parseCampaign, type CampaignProgress,
} from './campaign/progress'

function readCampaign(): { progress: CampaignProgress; storageError: boolean } {
  try { return { progress: parseCampaign(localStorage.getItem(CAMPAIGN_STORAGE_KEY)), storageError: false } }
  catch { return { progress: EMPTY_CAMPAIGN, storageError: true } }
}

export default function App() {
  const [missionId, setMissionId] = useState('wildfire')
  const [locale, setLocale] = useState<Locale>('en')
  const [pickerWasUsed, setPickerWasUsed] = useState(false)
  const [campaignActive, setCampaignActive] = useState(false)
  const [campaign, setCampaign] = useState(readCampaign)
  const mission = MISSIONS.find(candidate => candidate.id === missionId) ?? MISSIONS[0]!
  const context = campaignActive ? campaignContext(mission.context, campaign.progress) : mission.context
  const saveProgress = (progress: CampaignProgress) => {
    if (progress === campaign.progress) return
    let storageError = false
    try { localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(progress)) }
    catch { storageError = true }
    setCampaign({ progress, storageError })
  }
  const onReport = (report: EvaluationReport) => {
    if (campaignActive) saveProgress(awardCampaignPass(campaign.progress, report, mission.id))
  }
  const campaignMissions = campaignActive && !campaign.progress.completedMissionIds.includes('wildfire') ? [MISSIONS[0]!] : MISSIONS
  return <MissionApp key={`${mission.id}:${campaignActive ? campaign.progress.unlockedPartIds.join(',') : 'direct'}`}
    context={context}
    initialConfiguration={campaignActive && mission.id === 'wildfire' ? WF_A : mission.initialConfiguration}
    evaluate={request => evaluateMission(request, context)}
    mission={mission} missions={campaignMissions} onMissionChange={id => { setPickerWasUsed(true); setMissionId(id) }}
    focusMissionPicker={pickerWasUsed}
    onReport={onReport}
    campaignPanel={<CampaignPanel active={campaignActive} progress={campaign.progress} locale={locale}
      storageError={campaign.storageError}
      onToggle={() => { setCampaignActive(!campaignActive); setMissionId('wildfire'); setPickerWasUsed(true) }}
      onBuy={partId => { saveProgress(buyCampaignPart(campaign.progress, partId)); setPickerWasUsed(true) }} />}
    locale={locale} onLocaleChange={setLocale} />
}
