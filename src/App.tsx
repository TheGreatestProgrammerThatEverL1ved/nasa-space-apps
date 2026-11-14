import MissionApp from './ui/MissionApp'
import { useState } from 'react'
import { MISSIONS } from './data/scenarios'
import { evaluateMission } from './engine/evaluate'
import type { Locale } from './engine/types'

export default function App() {
  const [missionId, setMissionId] = useState('wildfire')
  const [locale, setLocale] = useState<Locale>('en')
  const [pickerWasUsed, setPickerWasUsed] = useState(false)
  const mission = MISSIONS.find(candidate => candidate.id === missionId) ?? MISSIONS[0]!
  return <MissionApp key={mission.id} context={mission.context}
    initialConfiguration={mission.initialConfiguration}
    evaluate={request => evaluateMission(request, mission.context)}
    mission={mission} missions={MISSIONS} onMissionChange={id => { setPickerWasUsed(true); setMissionId(id) }}
    focusMissionPicker={pickerWasUsed}
    locale={locale} onLocaleChange={setLocale} />
}
