import { EXPEDITION_STAGES, expeditionOffers, expeditionSummary, type ExpeditionRun } from '../../campaign/expedition'
import { PLAYER_MISSIONS } from '../../data/player/missions'
import type { Locale } from '../../engine/types'
import { formatNumber } from '../format'
import './expedition.css'

export default function ExpeditionBoard({ run, locale, storageError, onStart, onChoose }: {
  run: ExpeditionRun | null
  locale: Locale
  storageError: boolean
  onStart: () => void
  onChoose: (id: string) => void
}) {
  const en = locale === 'en'
  const status = run ? expeditionSummary(run) : null
  return <main className="expedition" aria-labelledby="expedition-title">
    <h1 id="expedition-title" tabIndex={-1}>{en ? 'Expedition' : 'Експедиція'}</h1>
    {storageError && <p role="alert">{en ? 'Could not save on this device.' : 'Не вдалося зберегти на цьому пристрої.'}</p>}
    {status && <dl className="expedition-status">
      <div><dt>{en ? 'Contracts cleared' : 'Виконано контрактів'}</dt><dd>{status.stage}/{EXPEDITION_STAGES}</dd></div>
      <div><dt>{en ? 'Retry supplies' : 'Запас спроб'}</dt><dd>{status.supplies}</dd></div>
      <div><dt>{en ? 'Points' : 'Бали'}</dt><dd>{status.points}</dd></div>
    </dl>}
    <p>{en ? 'Clear three contracts. A failed launch uses one supply.'
      : 'Виконайте три контракти. Невдалий запуск витрачає одну спробу.'}</p>
    {status?.complete && <h2>{en ? 'Expedition complete' : 'Експедицію завершено'}</h2>}
    {status?.exhausted && <h2>{en ? 'Supplies exhausted' : 'Запас спроб вичерпано'}</h2>}
    {(!run || status?.complete || status?.exhausted) ?
      <button className="game-primary" onClick={onStart}>{en ? 'Start new expedition' : 'Почати нову експедицію'}</button> :
      <div className="expedition-offers">
        {expeditionOffers(run).map(leg => <article key={leg.id}>
          <h2>{leg.profile === 'economy' ? (en ? 'Economy contract' : 'Економний контракт') : (en ? 'Priority contract' : 'Пріоритетний контракт')}</h2>
          <p>{PLAYER_MISSIONS.find(mission => mission.id === leg.missionId)?.title[locale]}</p>
          <dl>
            <div><dt>{en ? 'Cap' : 'Бюджет'}</dt><dd>{formatNumber(leg.budgetUsd, locale)} USD</dd></div>
            <div><dt>{en ? 'Schedule' : 'Строк підготовки'}</dt><dd>{leg.months} {en ? 'months' : 'міс.'}</dd></div>
            <div><dt>{en ? 'Reward' : 'Нагорода'}</dt><dd>{leg.profile === 'economy'
              ? (en ? '+1 point and +1 supply (up to 3)' : '+1 бал і +1 спроба (до 3)')
              : (en ? '+2 points' : '+2 бали')}</dd></div>
          </dl>
          <button className="game-primary" onClick={() => onChoose(leg.id)}>{run.legId === leg.id
            ? (en ? 'Resume build' : 'Продовжити збирання') : (en ? 'Accept contract' : 'Прийняти контракт')}</button>
        </article>)}
      </div>}
    {run && run.attempts.length > 0 && <details className="expedition-history">
      <summary>{en ? 'Run history' : 'Історія експедиції'}</summary>
      <small>{en ? 'Seed' : 'Зерно'} {run.seed}</small>
      <ol>{run.attempts.map(({ legId, passed }, index) => {
        const [, missionId, profile] = legId.split(':')
        const mission = PLAYER_MISSIONS.find(candidate => candidate.id === missionId)
        return <li key={index}>{mission?.title[locale]} · {profile === 'priority'
          ? (en ? 'Priority' : 'Пріоритетний') : (en ? 'Economy' : 'Економний')} · {passed
          ? (en ? 'Cleared' : 'Виконано') : (en ? 'Failed' : 'Невдало')}</li>
      })}</ol>
    </details>}
  </main>
}
