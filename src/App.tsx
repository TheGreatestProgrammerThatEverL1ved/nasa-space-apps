import MissionApp from './ui/MissionApp'
import { DEFAULT_CONTEXT } from './data/context'
import { evaluateMission } from './engine/evaluate'
import { FIRST_MISSION } from './fixtures/builds'

export default function App() {
  return <MissionApp context={DEFAULT_CONTEXT} initialConfiguration={FIRST_MISSION} evaluate={(request: unknown) => evaluateMission(request, DEFAULT_CONTEXT)} />
}
