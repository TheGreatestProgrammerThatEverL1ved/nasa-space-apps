import { useEffect, useRef, useState } from 'react'
import { DEFAULT_CONTEXT } from '../../data/context'
import { evaluateMission } from '../../engine/evaluate'
import type { EvaluationReport, Locale } from '../../engine/types'
import { FIRST_MISSION } from '../../fixtures/builds'
import { ContactStrip } from '../mission-control/Spacecraft'
import { formatMetric } from '../format'

const KEY = 'mission-forge.academy.v1'
const copy = {
  en: {
    help: 'Help / Academy', title: 'Flight Academy', close: 'Close help', replay: 'Start / replay guided mission',
    offer: 'New commander? Learn by flying a short mission: run, discover the bottleneck, repair and retry.',
    start: 'Start guided mission', skip: 'Skip tutorial', intro: '01 / Your first contract',
    goal: 'A land-management team needs thermal images back within 6 hours. Your starter spacecraft is assembled. Can it return the images in time?',
    parts: 'The bus holds and points the spacecraft. The payload is the camera that collects the required light. Solar panels replenish energy; the battery supplies shadow periods. The ground service decides when your radio can send images home.',
    run: 'Launch guided simulation', retry: 'Run repaired design', repair: '02 / Repair the real bottleneck',
    miss: 'The radio is fast enough, but four ground contacts per day leave too much waiting. 7.1 hours misses the 6 hour requirement. Select the ground network below, then run again.',
    ground: 'Guided ground service', done: '03 / Mission returned',
    pass: '3.1 hours meets the 6 hour limit. You changed a real input and every gate was evaluated again. This is a provisional training-model pass, not flight qualification.',
    noReward: 'Guided state is separate from your design and campaign. Tutorial launches never award credits.',
    back: 'Return to my design', glossary: 'Commander’s field guide', saved: 'You can replay this any time from Help.',
    margins: 'Resource margins', marginsBody: 'Headroom after demand: a negative margin means a deficit. Bigger batteries do not fix a repeating energy deficit. Changing one part may break mass, power or cost.',
    fixtures: 'Fixture assumptions', fixturesBody: 'Targets and contact times are synthetic teaching schedules, not propagated orbital coverage. Clouds still consume acquisition and downlink resources.',
    verdicts: 'Verdicts', verdictsBody: 'Failure means a known gate misses. Unverified means required evidence is missing. Provisional pass means every model gate passes under named assumptions.',
    credits: 'Credits versus USD', creditsBody: 'Campaign credits unlock equipment. Engineering USD pays for the designed mission. They never substitute for each other. Retries and guide runs cost no credits.',
    unexpected: 'This design has other findings. Restore the ground network and rerun; all gates still apply.',
  },
  ua: {
    help: 'Допомога / Академія', title: 'Льотна академія', close: 'Закрити допомогу', replay: 'Почати / повторити навчальну місію',
    offer: 'Новий командир? Навчіться на короткій місії: запуск, пошук обмеження, ремонт і повтор.',
    start: 'Почати навчальну місію', skip: 'Пропустити навчання', intro: '01 / Ваш перший контракт',
    goal: 'Команді землекористування потрібні теплові знімки за 6 годин. Початковий апарат уже складено. Чи поверне він знімки вчасно?',
    parts: 'Платформа тримає й наводить апарат. Корисний прилад — камера, що збирає потрібне випромінювання. Панелі поповнюють енергію, акумулятор живить у тіні. Наземний сервіс визначає, коли радіо може передати знімки додому.',
    run: 'Запустити навчальну симуляцію', retry: 'Перевірити виправлений проєкт', repair: '02 / Виправте справжнє обмеження',
    miss: 'Радіо досить швидке, але чотири сеанси на добу змушують довго чекати. 7,1 год перевищує межу 6 год. Виберіть наземну мережу нижче й запустіть знову.',
    ground: 'Навчальний наземний сервіс', done: '03 / Дані повернуто',
    pass: '3,1 год відповідає межі 6 год. Ви змінили справжній вхідний параметр, і всі умови перевірено знову. Це попередній прохід навчальної моделі, не льотна кваліфікація.',
    noReward: 'Навчальний стан відокремлено від вашого проєкту й кампанії. Навчальні запуски ніколи не дають кредитів.',
    back: 'Повернутися до мого проєкту', glossary: 'Довідник командира', saved: 'Навчання можна повторити з Допомоги будь-коли.',
    margins: 'Запаси ресурсів', marginsBody: 'Запас після покриття потреб: від’ємний запас означає дефіцит. Більший акумулятор не усуває повторюваний дефіцит енергії. Заміна деталі може порушити масу, живлення чи вартість.',
    fixtures: 'Модельні припущення', fixturesBody: 'Цілі й сеанси — синтетичні навчальні розклади, не розраховане орбітальне покриття. Хмарні знімки все одно витрачають ресурси знімання й передачі.',
    verdicts: 'Результати', verdictsBody: 'Невдача означає відому невиконану умову. Неперевірено — бракує потрібних доказів. Попередній прохід — усі умови моделі виконано за вказаних припущень.',
    credits: 'Кредити та USD', creditsBody: 'Кредити кампанії відкривають обладнання. Інженерні USD оплачують спроєктовану місію. Вони не замінюють одне одного. Повтори й навчальні запуски не коштують кредитів.',
    unexpected: 'Проєкт має інші зауваження. Поверніть наземну мережу й повторіть; усі умови залишаються чинними.',
  },
} as const

export default function Academy({ locale, onLocaleChange }: { locale: Locale; onLocaleChange: (locale: Locale) => void }) {
  const c = copy[locale]
  const [offered, setOffered] = useState(() => { try { return localStorage.getItem(KEY) !== 'seen' } catch { return true } })
  const [open, setOpen] = useState(false)
  const [guided, setGuided] = useState(false)
  const [ground, setGround] = useState('gs-single')
  const [report, setReport] = useState<EvaluationReport | null>(null)
  const [dirty, setDirty] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const helpRef = useRef<HTMLButtonElement>(null)
  const returnRef = useRef<HTMLElement | null>(null)
  const remember = () => { setOffered(false); try { localStorage.setItem(KEY, 'seen') } catch { /* Guide remains usable without persistence. */ } }
  const show = (guide: boolean) => {
    returnRef.current = document.activeElement as HTMLElement
    setGuided(guide); setOpen(true)
    if (guide) { setGround('gs-single'); setReport(null); setDirty(false) }
  }
  const close = () => {
    remember(); setOpen(false)
    // The first-run offer may disappear; then use the persistent Help entry.
    requestAnimationFrame(() => (returnRef.current?.isConnected ? returnRef.current : helpRef.current)?.focus())
  }
  useEffect(() => {
    const dialog = dialogRef.current
    if (open) { dialog?.showModal?.(); headingRef.current?.focus() }
    else dialog?.close?.()
  }, [open])
  useEffect(() => {
    const helpShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (event.key !== '?' || event.ctrlKey || event.metaKey || event.altKey
        || target?.closest('input, select, textarea, [contenteditable="true"]') || dialogRef.current?.open) return
      event.preventDefault()
      returnRef.current = document.activeElement as HTMLElement
      setGuided(false); setOpen(true)
    }
    document.addEventListener('keydown', helpShortcut)
    return () => document.removeEventListener('keydown', helpShortcut)
  }, [])
  const run = () => {
    setReport(evaluateMission({ ...FIRST_MISSION, groundId: ground }, DEFAULT_CONTEXT))
    setDirty(false)
    requestAnimationFrame(() => headingRef.current?.focus())
  }
  const passed = !dirty && report?.outcome === 'MODEL_PASS_PROVISIONAL'
  return <>
    <button className="help-entry" ref={helpRef} aria-keyshortcuts="?" title={locale === 'en' ? 'Help shortcut: ?' : 'Клавіша допомоги: ?'} onClick={() => show(false)}>{c.help}</button>
    {offered && <section className="academy-offer" aria-label={c.title}>
      <p>{c.offer}</p><button onClick={() => show(true)}>{c.start}</button><button onClick={remember}>{c.skip}</button>
    </section>}
    <dialog ref={dialogRef} className="academy-dialog" aria-labelledby="academy-title" onCancel={event => { event.preventDefault(); close() }}>
      <header><h2 id="academy-title" tabIndex={-1} ref={headingRef}>{c.title}</h2>
        <button onClick={close}>{c.close}</button>
        <div role="group" aria-label={locale === 'en' ? 'Guide language' : 'Мова навчання'}>
          <button aria-pressed={locale === 'en'} onClick={() => onLocaleChange('en')}>English</button>{' '}
          <button aria-pressed={locale === 'ua'} onClick={() => onLocaleChange('ua')}>Українська</button>
        </div>
      </header>
      {guided ? <>
        <h3>{passed ? c.done : report ? c.repair : c.intro}</h3>
        <p>{c.goal}</p><p>{c.parts}</p>
        {report && <div className="guide-result" role="status">
          <p>{passed ? c.pass : c.miss}</p>
          <strong data-testid="guide-latency">{formatMetric(report.metrics.latencyHours!, locale, 'latencyHours')}</strong>
          {dirty && <p>{locale === 'en' ? 'Design changed — rerun to verify.' : 'Проєкт змінено — перевірте знову.'}</p>}
          <ContactStrip report={report} locale={locale} stale={dirty} />
        </div>}
        {report && !passed && <><label htmlFor="guide-ground">{c.ground}</label>
          <select id="guide-ground" value={ground} onChange={e => { setGround(e.currentTarget.value); setDirty(true) }}>
            {DEFAULT_CONTEXT.catalog.grounds.map(g => <option key={g.id} value={g.id}>{g.label[locale]}</option>)}
          </select></>}
        <p className="note">{c.noReward}</p>
        <div className="academy-actions">{!passed && <button className="guide-primary" onClick={run}>{report ? c.retry : c.run}</button>}
          <button onClick={close}>{passed ? c.back : c.skip}</button></div>
      </> : <><p>{c.saved}</p><button className="guide-primary" onClick={() => { setGuided(true); setGround('gs-single'); setReport(null); setDirty(false) }}>{c.replay}</button></>}
      <details><summary>{c.glossary}</summary>
        <dl className="academy-glossary">
          <div><dt>{c.margins}</dt><dd>{c.marginsBody}</dd></div>
          <div><dt>{c.fixtures}</dt><dd>{c.fixturesBody}</dd></div>
          <div><dt>{c.verdicts}</dt><dd>{c.verdictsBody}</dd></div>
          <div><dt>{c.credits}</dt><dd>{c.creditsBody}</dd></div>
        </dl>
      </details>
    </dialog>
  </>
}
