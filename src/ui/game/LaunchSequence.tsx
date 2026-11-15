import { useEffect } from 'react'
import type { EvaluationReport, Locale, MissionConfiguration } from '../../engine/types'
import CraftScene from '../orbital/CraftScene'
import { formatMetric } from '../format'
import './launch.css'

export default function LaunchSequence({ config, report, locale, missionName, onFinish }: {
  config: MissionConfiguration; report: EvaluationReport; locale: Locale; missionName: string; onFinish: () => void
}) {
  const en = locale === 'en'
  const hold = !report.timelineEligible
  const pass = report.outcome === 'MODEL_PASS_PROVISIONAL'
  useEffect(() => {
    // A held preflight stays visibly held until the player reviews it; only a
    // flight-eligible presentation advances automatically.
    if (hold) return
    const timer = window.setTimeout(onFinish, 2900)
    return () => window.clearTimeout(timer)
  }, [hold, onFinish])
  const first = report.checks.find(c => c.status !== 'MET')
  return <main className={`launch-sequence${hold ? ' launch-hold' : ''}`} aria-labelledby="launch-title">
    <div className="launch-craft"><CraftScene config={config} locale={locale} mode={hold ? 'hangar' : 'launch'} motion={!hold} /></div>
    <div className="launch-overlay">
      <p className="game-eyebrow">{en ? 'FROZEN RUN / PRESENTATION ONLY' : 'ЗАФІКСОВАНИЙ ЗАПУСК / ЛИШЕ ІЛЮСТРАЦІЯ'}</p>
      <h1 id="launch-title" tabIndex={-1}>{hold ? (en ? 'Preflight hold' : 'Передстартова зупинка')
        : pass ? (en ? 'Separation. Acquisition. Return.' : 'Відокремлення. Знімання. Повернення.')
          : (en ? 'Separation. Orbit. Signal check.' : 'Відокремлення. Орбіта. Перевірка сигналу.')}</h1>
      <p>{missionName}</p>
      <p className="launch-caption">{hold
        ? (en ? 'The design cannot proceed to flight. Inspect the held gate in the debrief.' : 'Проєкт не може перейти до польоту. Перевірте невиконану умову в підсумку.')
        : (en ? 'Illustrative flight sequence. The engineering result is already fixed; animation cannot change it.' : 'Ілюстративна послідовність польоту. Інженерний результат уже зафіксовано; анімація не змінює його.')}</p>
      {hold && first && <p className="hold-finding">{first.checkId}: {formatMetric(first.actual, locale, first.checkId)}</p>}
      <button className="game-primary" onClick={onFinish}>{en ? 'Skip to debrief' : 'Одразу до підсумку'}</button>
    </div>
    {!hold && <ol className="launch-stages" aria-label={en ? 'Illustrative sequence' : 'Ілюстративна послідовність'}>
      <li>{en ? '01 Separation' : '01 Відокремлення'}</li><li>{en ? '02 Earth orbit' : '02 Орбіта Землі'}</li><li>{en ? '03 Mission report' : '03 Звіт місії'}</li>
    </ol>}
  </main>
}
