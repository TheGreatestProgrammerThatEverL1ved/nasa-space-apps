import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_CONTEXT } from '../../data/context'
import { WILDFIRE_MISSION } from '../../data/scenarios'
import { evaluateMission } from '../../engine/evaluate'
import type { EvaluationReport, Locale } from '../../engine/types'
import { FIRST_MISSION } from '../../fixtures/builds'
import CraftScene from '../orbital/CraftScene'
import { ContactStrip } from '../mission-control/Spacecraft'
import { formatLimit, formatMetric, formatNumber, formatValue } from '../format'
import './academy.css'

const KEY = 'mission-forge.academy.v1'
function isSeen() { try { return localStorage.getItem(KEY) === 'seen' } catch { return false } }
const GUIDED_GROUNDS = DEFAULT_CONTEXT.catalog.grounds.filter(g => g.id === 'gs-single' || g.id === 'gs-network')
const copy = {
  en: {
    help: 'Help / Academy', title: 'Flight Academy', close: 'Close help', replay: 'Start / replay guided mission',
    offer: 'New commander? Learn by flying a short mission: run, discover the bottleneck, repair and retry.',
    start: 'Start guided mission', skip: 'Skip tutorial', intro: '01 / Your first contract', guided: 'Guided training mission',
    firstRun: 'First-run tutorial', contract: 'Training contract', bound: 'Delivery bound', setup: 'setup',
    contacts: 'contacts/day', processing: 'processing',
    preview: 'Live preview — rerun to commit every gate. A passing preview is not a report.',
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
    start: 'Почати навчальну місію', skip: 'Пропустити навчання', intro: '01 / Ваш перший контракт', guided: 'Навчальна місія',
    firstRun: 'Навчання першого запуску', contract: 'Навчальний контракт', bound: 'Межа доставки', setup: 'налаштування',
    contacts: 'сеансів/добу', processing: 'обробка',
    preview: 'Живий попередній перегляд — повторіть запуск, щоб зафіксувати всі умови. Попередній прохід не є звітом.',
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

export default function Academy({ locale, onLocaleChange, replaySignal = 0, compact = false, autoStart = false, onFirstRunExit, onOpenChange }: {
  locale: Locale; onLocaleChange: (locale: Locale) => void; replaySignal?: number; compact?: boolean
  autoStart?: boolean; onFirstRunExit?: () => void
  onOpenChange?: (open: boolean) => void
}) {
  const c = copy[locale]
  const [start] = useState(() => { const seen = isSeen(); return { offered: !seen, auto: autoStart && !seen } })
  const [offered, setOffered] = useState(start.offered)
  const [open, setOpen] = useState(start.auto)
  const [guided, setGuided] = useState(start.auto)
  const [autoFlow, setAutoFlow] = useState(start.auto)
  const [ground, setGround] = useState('gs-single')
  const [report, setReport] = useState<EvaluationReport | null>(null)
  const [dirty, setDirty] = useState(false)
  const [contractChosen, setContractChosen] = useState(!compact)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const helpRef = useRef<HTMLButtonElement>(null)
  const flowRef = useRef<HTMLDivElement>(null)
  const lastReplay = useRef(0)
  const returnRef = useRef<HTMLElement | null>(null)
  const config = useMemo(() => ({ ...FIRST_MISSION, groundId: ground }), [ground])
  const preview = useMemo(() => compact ? evaluateMission(config, DEFAULT_CONTEXT) : null, [compact, config])
  const visible = compact && dirty && preview ? preview : report
  const shownPass = visible?.outcome === 'MODEL_PASS_PROVISIONAL'
  const passed = !dirty && report?.outcome === 'MODEL_PASS_PROVISIONAL'
  const limit = preview?.checks.find(check => check.checkId === 'WF-LATENCY')?.limit
  const remember = () => { setOffered(false); try { localStorage.setItem(KEY, 'seen') } catch { /* Guide remains usable without persistence. */ } }
  const reset = () => { setGuided(true); setGround('gs-single'); setReport(null); setDirty(false); setAutoFlow(false); setContractChosen(!compact) }
  const show = (guide: boolean) => {
    returnRef.current = document.activeElement as HTMLElement
    setGuided(guide); setOpen(true); setAutoFlow(false)
    if (guide) { setGround('gs-single'); setReport(null); setDirty(false); setContractChosen(!compact) }
  }
  const close = () => {
    const exitAuto = autoFlow
    remember(); setAutoFlow(false); setOpen(false)
    // Close and restore synchronously: a deferred rAF can steal focus from the
    // user's next keyboard action and accidentally replay the tutorial.
    dialogRef.current?.close?.()
    if (exitAuto) onFirstRunExit?.()
    const target = returnRef.current
    const restore = target && target !== document.body && target.isConnected && !target.closest('.academy-offer') ? target : helpRef.current
    restore?.focus()
  }
  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) { if (!dialog.open) dialog.showModal?.(); headingRef.current?.focus() }
    else if (dialog.open) dialog.close?.()
  }, [open])
  useLayoutEffect(() => { onOpenChange?.(open) }, [open, onOpenChange])
  useLayoutEffect(() => {
    if (!report) return
    headingRef.current?.focus()
    if (flowRef.current) flowRef.current.scrollTop = 0
  }, [report])
  useEffect(() => {
    if (replaySignal === lastReplay.current) return
    lastReplay.current = replaySignal
    returnRef.current = document.activeElement as HTMLElement
    setGuided(true); setOpen(true); setGround('gs-single'); setReport(null); setDirty(false); setAutoFlow(false); setContractChosen(!compact)
  }, [replaySignal, compact])
  useEffect(() => {
    const helpShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (event.key !== '?' || event.ctrlKey || event.metaKey || event.altKey
        || target?.closest('input, select, textarea, [contenteditable="true"]') || dialogRef.current?.open) return
      event.preventDefault()
      returnRef.current = document.activeElement as HTMLElement
      setGuided(false); setOpen(true); setAutoFlow(false)
    }
    document.addEventListener('keydown', helpShortcut)
    return () => document.removeEventListener('keydown', helpShortcut)
  }, [])
  const run = () => {
    if (compact && !contractChosen) return
    setReport(evaluateMission(config, DEFAULT_CONTEXT))
    setDirty(false)
  }
  const selectGround = (id: string) => {
    if (id === ground) return
    setGround(id)
    if (report) setDirty(true)
  }
  const exitLabel = guided ? (report?.outcome === 'MODEL_PASS_PROVISIONAL' ? c.back : c.skip) : c.close
  const step = passed ? 3 : report ? 2 : 1
  const glossary = <details><summary>{c.glossary}</summary>
    <dl className="academy-glossary">
      <div><dt>{c.margins}</dt><dd>{c.marginsBody}</dd></div>
      <div><dt>{c.fixtures}</dt><dd>{c.fixturesBody}</dd></div>
      <div><dt>{c.verdicts}</dt><dd>{c.verdictsBody}</dd></div>
      <div><dt>{c.credits}</dt><dd>{c.creditsBody}</dd></div>
    </dl>
  </details>
  return <>
    <button className="help-entry" ref={helpRef} aria-keyshortcuts="?" title={locale === 'en' ? 'Help shortcut: ?' : 'Клавіша допомоги: ?'} onClick={() => show(false)}>{c.help}</button>
    {offered && !compact && <section className="academy-offer" aria-label={c.title}>
      <p>{c.offer}</p><button onClick={() => show(true)}>{c.start}</button><button onClick={remember}>{c.skip}</button>
    </section>}
    <dialog ref={dialogRef} className={`academy-dialog${compact ? ' academy-guide' : ''}`} aria-labelledby="academy-title" onCancel={event => { event.preventDefault(); close() }}>
      <header className="academy-head">
        {compact && guided && <p className="academy-kicker">{autoFlow ? c.firstRun : c.guided}</p>}
        <div className="academy-title"><h2 id="academy-title" tabIndex={-1} ref={headingRef}>{c.title}</h2></div>
        <div className="academy-lang" role="group" aria-label={locale === 'en' ? 'Guide language' : 'Мова навчання'}>
          <button aria-pressed={locale === 'en'} onClick={() => onLocaleChange('en')}>English</button>
          <button aria-pressed={locale === 'ua'} onClick={() => onLocaleChange('ua')}>Українська</button>
        </div>
        <button className="academy-exit" onClick={close}>{compact ? exitLabel : c.close}</button>
      </header>
      {compact ? (guided ? <div className="academy-shell">
        <div className="academy-stage">{open && <CraftScene config={config} locale={locale} mode="hangar" />}</div>
        <div className="academy-flow" ref={flowRef}>
          <ol className="academy-progress">
            {[c.intro, c.repair, c.done].map((label, index) => <li key={label} aria-current={step === index + 1 ? 'step' : undefined}>{label}</li>)}
          </ol>
          <h3>{passed ? c.done : report ? c.repair : c.intro}</h3>
          {!report && <>
            <article className="academy-contract" aria-label={c.contract}>
              <p className="academy-kicker">{c.contract}</p>
              <h3>{WILDFIRE_MISSION.title[locale]}</h3>
              <p className="academy-subtitle">{WILDFIRE_MISSION.subtitle[locale]}</p>
              <p>{WILDFIRE_MISSION.brief[locale]}</p>
              <p className="academy-hint">{WILDFIRE_MISSION.hint[locale]}</p>
              {limit !== undefined && <p className="academy-bound">{c.bound}: <strong>≤ {formatLimit(limit, 'h', locale)}</strong></p>}
              <button type="button" data-guide-mission="wildfire" aria-pressed={contractChosen} onClick={() => setContractChosen(true)}>
                {contractChosen ? (locale === 'en' ? 'Training contract selected' : 'Навчальний контракт вибрано') : (locale === 'en' ? 'Accept this training contract' : 'Прийняти цей навчальний контракт')}
              </button>
            </article>
            <p>{c.goal}</p><p>{c.parts}</p>
          </>}
          {visible && <div className="academy-result" data-state={shownPass ? 'pass' : 'miss'} role="status">
            <p>{compact && dirty ? c.preview : shownPass ? c.pass : c.miss}</p>
            <strong data-testid="guide-latency">{formatMetric(visible.metrics.latencyHours!, locale, 'latencyHours')}</strong>
            <ContactStrip report={visible} locale={locale} stale={compact && dirty} />
          </div>}
          {report && <div className="academy-grounds" role="group" aria-label={c.ground}>
            {GUIDED_GROUNDS.map(g => <button type="button" key={g.id} data-guide-part={g.id} aria-pressed={ground === g.id} onClick={() => selectGround(g.id)}>
              <strong>{g.label[locale]}</strong>
              <span>{formatNumber(g.contactsPerDay, locale)} {c.contacts} · {formatValue(g.lengthMin, 'min', locale)} · {formatValue(g.processingHours, 'h', locale)} {c.processing}</span>
              <small>{formatValue(g.costUsd, 'USD', locale)} {c.setup}</small>
            </button>)}
          </div>}
          <p className="academy-note">{c.noReward}</p>
          {!passed && <div className="academy-actions"><button className="guide-primary" disabled={!contractChosen} onClick={run}>{report ? c.retry : c.run}</button></div>}
          {glossary}
        </div>
      </div> : <div className="academy-flow academy-alone">
        <p>{c.saved}</p>
        <div className="academy-actions"><button className="guide-primary" onClick={reset}>{c.replay}</button></div>
        {glossary}
      </div>) : <>
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
        </> : <><p>{c.saved}</p><button className="guide-primary" onClick={reset}>{c.replay}</button></>}
        {glossary}
      </>}
    </dialog>
  </>
}
