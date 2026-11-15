import { useMemo, useState } from 'react'
import type { EvaluationContext, Locale, MissionConfiguration, Part } from '../../engine/types'
import { evaluateMission } from '../../engine/evaluate'
import { translate } from '../../i18n'
import { formatExactValue, formatMetric, formatValue } from '../format'
import type { PartField } from '../mission-control/Spacecraft'
import CraftScene from '../orbital/CraftScene'
import PartPreview from './PartPreview'
import { completeDraft, draftOptions, missingSlots } from '../../engine/draft'
import './game.css'
import { PLAYER_TRADEOFFS } from '../../data/player/catalog'
import { OPERATIONS_TRADEOFFS } from '../../data/player/operations'
import { partShortName } from '../partLabels'

export type GameScreen = 'menu' | 'hangar' | 'missions' | 'launch' | 'debrief' | 'research' | 'expedition'
const categories = [
  ['busId', 'bus'], ['payloadId', 'payload'], ['arrayId', 'array'], ['batteryId', 'battery'],
  ['radioId', 'radio'], ['groundId', 'ground'], ['orbitId', 'orbit'], ['launcherId', 'launcher'],
] as const
function allParts(context: EvaluationContext): Record<PartField, readonly Part[]> {
  const c = context.catalog
  return { busId: c.buses, payloadId: [...c.payloads, ...(c.relayPayloads ?? [])], arrayId: c.arrays,
    batteryId: c.batteries, radioId: c.radios, groundId: c.grounds, orbitId: c.orbits, launcherId: c.launchers }
}
export function SceneMenu({ config, locale, missionName, campaignActive, motion, onMotion, onNavigate, onCampaign, onTutorial }: {
  config: MissionConfiguration; locale: Locale; missionName: string; campaignActive: boolean; motion: boolean
  onMotion: () => void; onNavigate: (screen: GameScreen) => void; onCampaign: () => void; onTutorial: () => void
}) {
  const en = locale === 'en'
  return <main className="orbital-menu" aria-labelledby="menu-title">
    <div className="menu-scene"><CraftScene config={config} locale={locale} mode="menu" motion={motion} /></div>
    <div className="menu-copy">
      <h1 id="menu-title" tabIndex={-1}>MISSION<br /><span>FORGE</span></h1>
      <nav className="menu-actions" aria-label={en ? 'Main menu' : 'Головне меню'}>
        <button className="game-primary" onClick={() => onNavigate('hangar')}>{en ? 'Customize' : 'Налаштувати'}<b aria-hidden="true">↗</b></button>
        <button onClick={onCampaign}>{campaignActive ? (en ? 'Sandbox' : 'Пісочниця') : (en ? 'Campaign' : 'Кампанія')}</button>
        <button onClick={onTutorial}>{en ? 'Tutorial' : 'Навчання'}</button>
        <button onClick={() => onNavigate('missions')}>{en ? 'Missions' : 'Місії'}</button>
        <button onClick={() => onNavigate('research')}>{en ? 'Research' : 'Дослідження'}</button>
      </nav>
      <div className="menu-current"><span>{campaignActive ? (en ? 'CAMPAIGN CONTRACT' : 'КОНТРАКТ КАМПАНІЇ') : (en ? 'CURRENT MISSION' : 'ПОТОЧНА МІСІЯ')}</span><p>{missionName}</p></div>
    </div>
    <details className="menu-bottom"><summary>{en ? 'Settings & About' : 'Налаштування й відомості'}</summary><p>{en ? 'Illustrative orbit · Earth texture: NASA Earth Observatory' : 'Ілюстративна орбіта · текстура Землі: NASA Earth Observatory'}</p>
      <button aria-pressed={!motion} onClick={onMotion}>{motion ? (en ? 'Pause orbital motion' : 'Зупинити рух орбітою') : (en ? 'Enable orbital motion' : 'Увімкнути рух орбітою')}</button></details>
  </main>
}

function stats(part: Part, locale: Locale): [string, number, string][] {
  const en = locale === 'en'
  const rows: [string, number, string][] = []
  if (!['ground', 'orbit', 'launcher'].includes(part.category)) rows.push([en ? 'Allocated mass' : 'Виділена маса', part.massKg, 'kg'])
  if ('bolW' in part) rows.push([en ? 'Peak generation · BOL' : 'Пікова генерація · BOL', part.bolW, 'W'])
  if ('nominalWh' in part) rows.push([en ? 'Nominal energy' : 'Номінальна енергія', part.nominalWh, 'Wh'], [en ? 'Discharge limit' : 'Межа розряду', part.dischargeW, 'W'])
  if ('peakW' in part) rows.push([en ? 'Peak load' : 'Пікове навантаження', part.peakW, 'W'])
  if ('lineMbps' in part) rows.push([en ? 'Configured line rate' : 'Швидкість лінії', part.lineMbps, 'Mbps'], [en ? 'Transmit DC load' : 'Споживання під час передачі', part.dcW, 'W'])
  if ('storageGB' in part) rows.push([en ? 'Storage' : 'Пам’ять', part.storageGB, 'GB'])
  if ('contactsPerDay' in part) rows.push([en ? 'Contacts per day' : 'Сеансів на добу', part.contactsPerDay, '/day'], [en ? 'Contact length' : 'Тривалість сеансу', part.lengthMin, 'min'], [en ? 'Annual operations' : 'Річна експлуатація', part.annualOpsUsd, 'USD/year'])
  if ('altitudeKm' in part) rows.push([en ? 'Altitude' : 'Висота', part.altitudeKm, 'km'], [en ? 'Inclination' : 'Нахил', part.inclinationDeg, '°'])
  if ('slotLimitKg' in part) rows.push([en ? 'Booked slot' : 'Заброньований слот', part.slotLimitKg, 'kg'], [en ? 'Adapter' : 'Адаптер', part.adapterKg, 'kg'])
  rows.push([en ? 'Engineering cost' : 'Інженерна вартість', part.costUsd, 'USD'])
  return rows
}
function compatibility(part: Part, config: MissionConfiguration, locale: Locale) {
  const en = locale === 'en'
  if (config.busId && 'busIds' in part && !part.busIds.includes(config.busId)) return en ? 'Incompatible bus' : 'Несумісна платформа'
  if (part.category === 'orbit' && part.id !== 'orb-sso-low') return en ? 'No accepted target-access fixture for this orbit.' : 'Для цієї орбіти немає прийнятої моделі доступу до цілі.'
  if (part.category === 'launcher' && config.orbitId && !part.orbitIds.includes(config.orbitId)) return en ? 'Booking does not support the selected orbit.' : 'Бронювання не підтримує вибрану орбіту.'
  return null
}
function tradeoffText(field: PartField, locale: Locale): string {
  const en = locale === 'en'
  if (field === 'arrayId') return en ? 'More generation can cost mass and USD. Peak W is not orbit-average supply.' : 'Більша генерація коштує маси й USD. Пікові Вт — не середня потужність на орбіті.'
  if (field === 'batteryId') return en ? 'Larger packs add energy and mass. Wh does not establish peak W or fix a recharge deficit.' : 'Більші батареї додають енергію й масу. Вт·год не визначають пікові Вт і не усувають дефіцит заряджання.'
  if (field === 'radioId') return en ? 'Faster downlink draws more power. More Mbps cannot create a missing contact.' : 'Швидша передача споживає більше енергії. Більше Мбіт/с не створює відсутній сеанс.'
  if (field === 'groundId') return en ? 'More contacts shorten waits. Compare setup and annual operations costs separately.' : 'Більше сеансів скорочує очікування. Порівнюйте вартість підготовки й річної експлуатації окремо.'
  if (field === 'busId') return en ? 'More storage and steadier pointing add mass and cost.' : 'Більша пам’ять і точніше наведення додають маси й вартості.'
  if (field === 'payloadId') return en ? 'Capability comes with power, data and fit constraints. Check the mission, not just the image.' : 'Можливості обмежені енергією, даними й сумісністю. Перевіряйте вимоги місії, не лише зображення.'
  if (field === 'orbitId') return en ? 'Altitude trades image scale for footprint. Target access still needs an accepted fixture.' : 'Висота змінює масштаб зображення й смугу огляду. Доступ до цілі все одно потребує прийнятої моделі.'
  return en ? 'A larger launch slot does not enlarge the spacecraft bus.' : 'Більший запусковий слот не збільшує платформу апарата.'
}
/** A few decision-relevant figures; the exact full sheet stays behind <details>. */
function keyStats(part: Part, locale: Locale): [string, number, string][] {
  const en = locale === 'en'
  const rows: [string, number, string][] = []
  if (part.category === 'array' && 'bolW' in part) rows.push([en ? 'Peak generation · BOL' : 'Пікова генерація · BOL', part.bolW, 'W'])
  if (part.category === 'battery' && 'nominalWh' in part) rows.push([en ? 'Nominal energy' : 'Номінальна енергія', part.nominalWh, 'Wh'])
  if (part.category === 'radio' && 'lineMbps' in part) rows.push([en ? 'Configured line rate' : 'Швидкість лінії', part.lineMbps, 'Mbps'])
  if (part.category === 'bus') rows.push([en ? 'Storage' : 'Пам’ять', part.storageGB, 'GB'])
  if (part.category === 'ground' && 'contactsPerDay' in part) rows.push([en ? 'Contacts per day' : 'Сеансів на добу', part.contactsPerDay, '/day'],
    [en?'Annual operations':'Річна експлуатація',part.annualOpsUsd,'USD/year'])
  if (part.category === 'payload') {
    if ('bufferGB' in part) rows.push([en ? 'Packet buffer' : 'Буфер пакетів', part.bufferGB, 'GB'])
    else rows.push([en ? 'Peak load' : 'Пікове навантаження', part.peakW, 'W'])
  }
  if (part.category === 'orbit' && 'altitudeKm' in part) rows.push([en ? 'Altitude' : 'Висота', part.altitudeKm, 'km'])
  if (part.category === 'launcher' && 'slotLimitKg' in part) rows.push(
    [en ? 'Booked slot' : 'Заброньований слот', part.slotLimitKg, 'kg'],
    [en ? 'Booking queue' : 'Черга на запуск', part.queueMonths, 'months'],
  )
  if (!['ground', 'orbit', 'launcher'].includes(part.category)) rows.push([en ? 'Allocated mass' : 'Виділена маса', part.massKg, 'kg'])
  rows.push([en ? 'Engineering cost' : 'Інженерна вартість', part.costUsd, 'USD'])
  return rows
}
/** One recognizable figure plus cost, so a tile reads without opening it. */
function tileFact(part: Part, locale: Locale): string {
  const facts: string[] = []
  if ('bolW' in part) facts.push(formatValue(part.bolW, 'W', locale))
  else if ('nominalWh' in part) facts.push(formatValue(part.nominalWh, 'Wh', locale))
  else if ('lineMbps' in part) facts.push(formatExactValue(part.lineMbps, 'Mbps', locale))
  else if ('storageGB' in part) facts.push(formatValue(part.storageGB, 'GB', locale))
  else if ('contactsPerDay' in part) facts.push(formatValue(part.contactsPerDay, '/day', locale))
  else if ('altitudeKm' in part) facts.push(formatValue(part.altitudeKm, 'km', locale))
  else if ('slotLimitKg' in part) facts.push(formatValue(part.slotLimitKg, 'kg', locale))
  else if (!['ground', 'orbit', 'launcher'].includes(part.category)) facts.push(formatValue(part.massKg, 'kg', locale))
  return facts.join(' · ')
}
function PartTile({ part, equipped, locale, warning, onEquip }: {
  part: Part; equipped: boolean; locale: Locale; warning: string | null; onEquip: () => void
}) {
  return <button type="button" className="part-card" data-part-id={part.id} aria-pressed={equipped} onClick={onEquip}>
    <span className="part-thumb" aria-hidden="true"><PartPreview part={part} /></span>
    <span className="part-tile-copy">
      <strong>{partShortName(part,locale)}</strong>
      <span className="part-tile-facts">{tileFact(part, locale)}</span>
      {warning && <span className="part-warning">{warning}</span>}
    </span>
    <span className="part-tile-mark" aria-hidden="true">{equipped ? '●' : '+'}</span>
  </button>
}
export default function LiveHangar({ config, context, locale, selectedField, onInspect, onEquip, onLaunch, motion, onClear, onRemove, notice }: {
  config: MissionConfiguration; context: EvaluationContext; locale: Locale; selectedField: PartField
  onInspect: (field: PartField) => void; onEquip: (field: PartField, id: string) => void; onLaunch: () => void; motion: boolean
  onClear?: () => void; onRemove?: (field: PartField) => void; notice?: string
}) {
  const en = locale === 'en'
  const [angle, setAngle] = useState(28)
  const groups = allParts(context)
  const parts = groups[selectedField]
  const part = parts.find(p => p.id === config[selectedField])
  const missing = missingSlots(config,context)
  const preview = useMemo(() => completeDraft(config,context) ? evaluateMission(config, context) : null, [config, context])
  const metrics = preview?.metrics ?? {}
  const subtotal = Object.entries(draftOptions(context)).reduce((sum,[field,options]) => {
    const selected = options.find(p => p.id === config[field as PartField])
    return sum + (selected?.costUsd ?? 0) + (selected && 'annualOpsUsd' in selected ? selected.annualOpsUsd * context.scenario.plannedYears : 0)
  },0) * 1.15
  const category = categories.find(([key]) => key === selectedField)![1]
  const external = ['groundId', 'orbitId', 'launcherId'].includes(selectedField)
  const findings = preview?.checks.filter(c => c.status !== 'MET').length ?? missing.length
  const blocker = preview?.checks.find(c=>c.status!=='MET')
  const feedbackKey = ['massMargin', 'powerMargin', 'budgetMargin', 'dataMargin'].find(key => {
    const metric = metrics[key]
    return metric?.kind === 'finite' && metric.value < 0
  }) ?? (selectedField === 'arrayId' ? 'powerMargin' : selectedField === 'radioId' || selectedField === 'groundId' ? 'dataMargin' : 'massMargin')
  const feedbackMetric = metrics[feedbackKey]
  const feedbackLabel = translate(locale, `resource.${feedbackKey === 'massMargin' ? 'mass' : feedbackKey === 'powerMargin' ? 'power' : feedbackKey === 'budgetMargin' ? 'budget' : 'data'}`)
  const feedbackDeficit = feedbackMetric?.kind === 'finite' && feedbackMetric.value < 0
  const marginKeys = ['massMargin', 'powerMargin', 'budgetMargin', 'dataMargin'] as const
  const relevantMargins = selectedField === 'arrayId' || selectedField === 'batteryId'
    ? ['powerMargin', 'massMargin']
    : selectedField === 'radioId' || selectedField === 'groundId' ? ['dataMargin', 'powerMargin'] : ['massMargin', 'budgetMargin']
  const visibleMargins = marginKeys.filter(key => relevantMargins.includes(key)
    || (metrics[key]?.kind === 'finite' && metrics[key].value < 0))
  const liveReading = selectedField === 'radioId' || selectedField === 'groundId'
    ? ['latencyHours', en ? 'Fixture delivery bound' : 'Модельна межа затримки']
    : selectedField === 'batteryId' ? ['batteryUsableWhEOL', en ? 'Usable energy · EOL' : 'Доступна енергія · EOL']
    : selectedField === 'busId' ? ['usableStorageGB', en ? 'Usable system storage' : 'Доступна пам’ять системи']
    : selectedField === 'payloadId' || selectedField === 'orbitId'
      ? (context.scenario.id === 'packet-relay' ? ['deliveredUsefulGBDay', en ? 'Useful return' : 'Корисне повернення']
        : ['effectiveScaleM', en ? 'Effective image scale' : 'Ефективний масштаб зображення'])
      : null
  return <main className="live-hangar" aria-labelledby="hangar-title">
    <header className="hangar-heading"><div><h1 id="hangar-title" tabIndex={-1}>{en ? 'Spacecraft hangar' : 'Ангар апарата'}</h1></div>
      <div className="build-actions"><strong data-testid="build-progress">{8-missing.length}/8</strong>
        <span data-testid="build-usd">{missing.length ? (en ? 'Selected subtotal' : 'Підсумок вибраного') : (en?'Total':'Усього')}: {formatValue(subtotal,'USD',locale)} / {formatValue(context.scenario.budgetUsd,'USD',locale)}</span>
        {context.scenarioRevision.includes(':expedition-v1:') && <span data-testid="build-schedule">
          {en ? 'Schedule' : 'Строк підготовки'}: {metrics.scheduleMonths?.kind === 'finite' ? formatValue(metrics.scheduleMonths.value, 'months', locale) : '—'} / {formatValue(context.scenario.availableMonths, 'months', locale)}
        </span>}
        <button onClick={onClear}>{en ? 'Clear Build' : 'Очистити проєкт'}</button>
        <button className="game-primary" disabled={missing.length > 0} aria-describedby="build-blocker" onClick={onLaunch}>{en ? 'Launch' : 'Запуск'} <span aria-hidden="true">↗</span></button></div></header>
    <div id="build-blocker" role="status">{notice || (missing.length ? (en ? 'Next: select ' : 'Далі виберіть ') + translate(locale,`category.${categories.find(([f])=>f===missing[0])![1]}`)
      : blocker ? blocker.checkId==='ENG-BUDGET' ? (en?'Over budget — select a cheaper part':'Перевищено бюджет — виберіть дешевшу складову')
        : `${en?'Not met':'Не виконано'}: ${translate(locale,`check.${blocker.checkId}` as Parameters<typeof translate>[1])}` : (en ? 'Ready for preflight' : 'Готово до перевірки'))}
      {missing.length > 0 && <button onClick={() => onInspect(missing[0]!)}>{en ? 'Next empty slot' : 'Наступна порожня складова'}</button>}
    </div>
    <nav className="subsystem-tabs" aria-label={en ? 'Subsystems and mission choices' : 'Підсистеми та параметри місії'}>
      {categories.map(([field, cat]) => <button key={field} data-slot={field} data-slot-state={config[field] ? 'selected' : 'empty'} aria-pressed={field === selectedField} onClick={() => onInspect(field)}><span aria-hidden="true">{config[field] ? '✓ ' : '○ '}</span>{cat === 'launcher' ? (en ? 'Launch booking' : 'Бронювання запуску') : translate(locale, `category.${cat}`)}</button>)}
    </nav>
    <div className="hangar-layout hangar-bay">
      <section className="craft-inspection" aria-label={en ? 'Live spacecraft preview' : 'Поточний вигляд апарата'}>
        <div className="inspection-label"><span>{en ? 'ASSEMBLY BAY' : 'СКЛАДАЛЬНИЙ БОКС'}</span>{selectedField === 'batteryId' && <span>{en ? 'INTERNAL CUTAWAY' : 'ВНУТРІШНІЙ РОЗРІЗ'}</span>}</div>
        <div className="bay-stage">
          <CraftScene config={config} locale={locale} mode="hangar" selectedField={selectedField} angle={angle} motion={false} onInspect={onInspect} />
          <div className="camera-controls" role="group" aria-label={en ? 'Inspect camera' : 'Камера огляду'}>
            <button onClick={() => setAngle(a => a - 45)}>{en ? 'Rotate left' : 'Обернути ліворуч'}</button>
            <button onClick={() => setAngle(28)}>{en ? 'Reset camera' : 'Скинути камеру'}</button>
            <button onClick={() => setAngle(a => a + 45)}>{en ? 'Rotate right' : 'Обернути праворуч'}</button>
          </div>
        </div>
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {`${part?.label[locale] ?? ''}. ${en ? 'Draft findings' : 'Зауваження до проєкту'}: ${findings}. ${feedbackLabel}: ${feedbackMetric ? formatMetric(feedbackMetric, locale, feedbackKey) : (en ? 'Unavailable' : 'Недоступно')}${feedbackDeficit ? (en ? ' · Deficit' : ' · Дефіцит') : ''}`}
        </p>
      </section>
      <section className="part-library part-tray" aria-labelledby="part-library-title">
        <div className="tray-heading">
          <h2 id="part-library-title">{translate(locale, `category.${category}`)}</h2>
        </div>
        <div className="part-cards">{parts.map(p => <PartTile key={p.id} part={p} equipped={config[selectedField] === p.id} locale={locale}
          warning={compatibility(p, config, locale)} onEquip={() => onEquip(selectedField, p.id)} />)}</div>
      </section>
      <aside className="part-hud" aria-label={en ? 'Installed part and live system data' : 'Установлена деталь і поточні дані системи'}>
        {part && <><span className="game-eyebrow">{external ? (en ? 'SERVICE / SELECTED' : 'СЕРВІС / ВИБРАНО') : (en ? 'INSTALLED' : 'УСТАНОВЛЕНО')}</span><h2>{part.label[locale]}</h2>
          <p className="tradeoff">{OPERATIONS_TRADEOFFS[part.id]?.[locale] ?? PLAYER_TRADEOFFS[part.id]?.[locale] ?? tradeoffText(selectedField, locale)}</p>
          <dl className="hud-stats">{keyStats(part, locale).slice(0,3).map(([label, value, unit]) => <div key={label}><dt>{label}</dt><dd>{unit === 'Mbps' ? formatExactValue(value, unit, locale) : formatValue(value, unit, locale)}</dd></div>)}</dl>
          <details className="spec-details"><summary>{en ? 'Exact part figures' : 'Точні параметри деталі'}</summary>
            {external && <p>{en ? 'Mission choice — not attached hardware.' : 'Параметр місії — не обладнання на апараті.'}</p>}
            <dl>{stats(part, locale).map(([label, value, unit]) => <div key={label}><dt>{label}</dt><dd>{formatExactValue(value, unit, locale)}</dd></div>)}</dl>
            <details><summary>{en?'All evaluator inputs & evidence':'Усі вхідні параметри й докази'}</summary>
              <pre className="catalog-inputs">{JSON.stringify(part,null,2)}</pre></details>
          </details></>}
        {!part && <p>{en ? 'Empty slot. Choose equipment below.' : 'Порожня складова. Виберіть обладнання.'}</p>}
        {part && <button onClick={() => onRemove?.(selectedField)}>{en ? 'Remove selected part' : 'Зняти вибрану деталь'}</button>}
        <details className="draft-telemetry"><summary>{en ? 'Engineering details' : 'Інженерні подробиці'}</summary>
          <p className="draft-findings">{en ? `Checks needing attention: ${findings}` : `Перевірок, що потребують уваги: ${findings}`}</p>
          {liveReading && <dl className="hud-stats"><div><dt>{liveReading[1]}</dt><dd>{metrics[liveReading[0]] ? formatMetric(metrics[liveReading[0]], locale, liveReading[0]) : (en ? 'Unavailable' : 'Недоступно')}</dd></div></dl>}
          {visibleMargins.map(key => {
            const metric = metrics[key]
            const label = translate(locale, `resource.${key === 'massMargin' ? 'mass' : key === 'powerMargin' ? 'power' : key === 'budgetMargin' ? 'budget' : 'data'}`)
            return <div key={key} className={`live-margin ${metric?.kind === 'finite' && metric.value < 0 ? 'deficit' : ''}`}>
              <p><span>{label}</span><strong>{metric ? `${metric.kind === 'finite' && metric.value >= 0 ? '+' : ''}${formatMetric(metric, locale, key)}` : (en ? 'Unavailable' : 'Недоступно')}</strong></p>
              {metric?.kind === 'finite' && <div className="honest-bar" aria-hidden="true"><span style={{ width: `${Math.min(100, Math.max(0, metric.value * 100))}%` }} /></div>}
              {metric?.kind !== 'finite' || metric.value < 0 ? <small>{metric?.kind !== 'finite' ? (en ? 'Unavailable — missing evidence' : 'Недоступно — бракує доказів') : (en ? 'Deficit' : 'Дефіцит')}</small> : null}
            </div>
          })}
          <details className="native-totals"><summary>{en ? 'All resources & demand' : 'Усі ресурси й потреби'}</summary>
            <p className="art-note">{en ? 'Live draft, not a flight report. Headroom = (capacity − demand) / capacity. Bars are capped at 0–100%; signed values are not. Power uses the worst BOL/EOL balance.' : 'Поточний проєкт, не звіт польоту. Запас = (місткість − потреба) / місткість. Смуги обмежено 0–100%; значення зі знаком — ні. Живлення — найгірший баланс BOL/EOL.'}</p>
            <dl className="system-totals">
              {marginKeys.map(key => <div key={key}><dt>{translate(locale, `resource.${key === 'massMargin' ? 'mass' : key === 'powerMargin' ? 'power' : key === 'budgetMargin' ? 'budget' : 'data'}`)}</dt><dd>{metrics[key] ? formatMetric(metrics[key], locale, key) : (en ? 'Unavailable' : 'Недоступно')}</dd></div>)}
            {([
              ['massKg', en ? 'Spacecraft incl. 15% contingency' : 'Апарат із резервом маси 15%'],
              ['totalUsd', en ? 'Mission incl. reserve & operations' : 'Місія з резервом і експлуатацією'],
              ['arrayWhOrbitEOL', en ? 'EOL generation / orbit' : 'Генерація EOL / виток'],
              ['arrayRequiredWhOrbit', en ? 'Required energy / orbit' : 'Потрібна енергія / виток'],
              ['effectiveDownlinkGBDay', en ? 'Effective return capacity' : 'Ефективна місткість передачі'],
              ['generatedGBDay', en ? 'Required stream' : 'Потрібний потік'],
            ] as const).map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{metrics[key] ? formatMetric(metrics[key], locale, key) : (en ? 'Unavailable' : 'Недоступно')}</dd></div>)}
          </dl></details>
        </details>
      </aside>
    </div>
    {!motion && <span className="sr-only">{en ? 'Stationary inspection' : 'Статичний огляд'}</span>}
  </main>
}
