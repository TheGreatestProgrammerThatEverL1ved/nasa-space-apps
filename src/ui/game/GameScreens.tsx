import { useMemo, useState } from 'react'
import type { EvaluationContext, Locale, MissionConfiguration, Part } from '../../engine/types'
import { evaluateMission } from '../../engine/evaluate'
import { translate } from '../../i18n'
import { formatExactValue, formatMetric } from '../format'
import type { PartField } from '../mission-control/Spacecraft'
import CraftScene from '../orbital/CraftScene'
import './game.css'

export type GameScreen = 'menu' | 'hangar' | 'control' | 'missions' | 'launch' | 'debrief'
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
      <p className="game-eyebrow">{en ? 'EARTH ORBIT / MISSION DESIGN' : 'ОРБІТА ЗЕМЛІ / ПРОЄКТУВАННЯ МІСІЙ'}</p>
      <h1 id="menu-title" tabIndex={-1}>MISSION<br /><span>FORGE</span></h1>
      <p className="menu-tagline">{en ? 'Build with purpose. Bring it home.' : 'Створіть із метою. Поверніть дані додому.'}</p>
      <nav className="menu-actions" aria-label={en ? 'Main menu' : 'Головне меню'}>
        <button className="game-primary" onClick={() => onNavigate('hangar')}><span>01</span>{en ? 'Customize' : 'Налаштувати'}<b aria-hidden="true">↗</b></button>
        <button onClick={onCampaign}><span>02</span>{campaignActive ? (en ? 'Sandbox' : 'Пісочниця') : (en ? 'Campaign' : 'Кампанія')}</button>
        <button onClick={onTutorial}><span>03</span>{en ? 'Tutorial' : 'Навчання'}</button>
        <button onClick={() => onNavigate('missions')}><span>04</span>{en ? 'Missions' : 'Місії'}</button>
      </nav>
      <div className="menu-current"><span>{campaignActive ? (en ? 'CAMPAIGN CONTRACT' : 'КОНТРАКТ КАМПАНІЇ') : (en ? 'CURRENT MISSION' : 'ПОТОЧНА МІСІЯ')}</span><p>{missionName}</p></div>
    </div>
    <div className="menu-bottom"><p>{en ? 'Illustrative orbit · Earth texture: NASA Earth Observatory' : 'Ілюстративна орбіта · текстура Землі: NASA Earth Observatory'}</p>
      <button aria-pressed={!motion} onClick={onMotion}>{motion ? (en ? 'Pause orbital motion' : 'Зупинити рух орбітою') : (en ? 'Enable orbital motion' : 'Увімкнути рух орбітою')}</button></div>
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
  if ('busIds' in part && !part.busIds.includes(config.busId)) return en ? 'Does not fit the selected bus. Equip to inspect the failed fit gate.' : 'Не підходить вибраній платформі. Установіть, щоб перевірити невідповідність.'
  if (part.category === 'orbit' && part.id !== 'orb-sso-low') return en ? 'No accepted target-access fixture for this orbit.' : 'Для цієї орбіти немає прийнятої моделі доступу до цілі.'
  if (part.category === 'launcher' && part.id !== 'lv-heavy') return en ? 'Booking/interface unverified — cannot pass preflight.' : 'Бронювання/інтерфейс не перевірено — передстартовий контроль не пройде.'
  return null
}
export default function LiveHangar({ config, context, locale, selectedField, onInspect, onEquip, onLaunch, motion }: {
  config: MissionConfiguration; context: EvaluationContext; locale: Locale; selectedField: PartField
  onInspect: (field: PartField) => void; onEquip: (field: PartField, id: string) => void; onLaunch: () => void; motion: boolean
}) {
  const en = locale === 'en'
  const [angle, setAngle] = useState(28)
  const groups = allParts(context)
  const parts = groups[selectedField]
  const part = parts.find(p => p.id === config[selectedField])
  const preview = useMemo(() => evaluateMission(config, context), [config, context])
  const category = categories.find(([key]) => key === selectedField)![1]
  const feedbackKey = ['massMargin', 'powerMargin', 'budgetMargin', 'dataMargin'].find(key => {
    const metric = preview.metrics[key]
    return metric?.kind === 'finite' && metric.value < 0
  }) ?? (selectedField === 'arrayId' ? 'powerMargin' : selectedField === 'radioId' || selectedField === 'groundId' ? 'dataMargin' : 'massMargin')
  const feedbackMetric = preview.metrics[feedbackKey]
  const feedbackLabel = translate(locale, `resource.${feedbackKey === 'massMargin' ? 'mass' : feedbackKey === 'powerMargin' ? 'power' : feedbackKey === 'budgetMargin' ? 'budget' : 'data'}`)
  return <main className="live-hangar" aria-labelledby="hangar-title">
    <header className="hangar-heading"><div><p className="game-eyebrow">{en ? 'ASSEMBLY / LIVE DESIGN' : 'СКЛАДАННЯ / ПОТОЧНИЙ ПРОЄКТ'}</p><h1 id="hangar-title" tabIndex={-1}>{en ? 'Spacecraft hangar' : 'Ангар апарата'}</h1></div>
      <button className="game-primary" onClick={onLaunch}>{en ? 'Launch' : 'Запуск'} <span aria-hidden="true">↗</span></button></header>
    <nav className="subsystem-tabs" aria-label={en ? 'Subsystems and mission choices' : 'Підсистеми та параметри місії'}>
      {categories.map(([field, cat]) => <button key={field} aria-pressed={field === selectedField} onClick={() => onInspect(field)}>{cat === 'launcher' ? (en ? 'Launch booking' : 'Бронювання запуску') : translate(locale, `category.${cat}`)}</button>)}
    </nav>
    <div className="hangar-layout">
      <section className="part-library" aria-labelledby="part-library-title"><p className="game-eyebrow">{en ? 'EQUIPMENT LIBRARY' : 'КАТАЛОГ ОБЛАДНАННЯ'}</p>
        <h2 id="part-library-title">{translate(locale, `category.${category}`)}</h2>
        <p className="library-hint">{en ? 'Choose a card to equip immediately.' : 'Виберіть картку для негайного встановлення.'}</p>
        <div className="selection-feedback" aria-live="polite" aria-atomic="true">
          <strong>{part?.label[locale]}</strong>
          <p>{part && stats(part, locale).slice(0, 2).map(([label, value, unit]) => `${label}: ${formatExactValue(value, unit, locale)}`).join(' · ')}</p>
          <p>{en ? 'Live draft findings' : 'Зауваження до проєкту'}: {preview.checks.filter(c => c.status !== 'MET').length}.
            {' '}{feedbackLabel}: {feedbackMetric ? formatMetric(feedbackMetric, locale, feedbackKey) : (en ? 'Unavailable' : 'Недоступно')}{feedbackMetric?.kind === 'finite' && feedbackMetric.value < 0 ? (en ? ' · Deficit' : ' · Дефіцит') : ''}</p>
        </div>
        <div className="part-cards">{parts.map(p => <button key={p.id} className="part-card" data-part-id={p.id} aria-pressed={config[selectedField] === p.id} onClick={() => onEquip(selectedField, p.id)}>
          <span className="part-card-top"><code>{p.id}</code><span aria-hidden="true">{config[selectedField] === p.id ? '●' : '+'}</span></span>
          <strong>{p.label[locale]}</strong><span className="part-summary">{stats(p, locale).slice(0, 2).map(([label, value, unit]) => `${label}: ${formatExactValue(value, unit, locale)}`).join(' · ')}</span>
          {compatibility(p, config, locale) && <span className="part-warning">{compatibility(p, config, locale)}</span>}
        </button>)}</div>
      </section>
      <section className="craft-inspection" aria-label={en ? 'Live spacecraft preview' : 'Поточний вигляд апарата'}>
        <div className="inspection-label"><span>{en ? 'ORBITAL SYSTEM / SCHEMATIC' : 'ОРБІТАЛЬНА СИСТЕМА / СХЕМА'}</span><span>{selectedField === 'batteryId' ? (en ? 'INTERNAL CUTAWAY' : 'ВНУТРІШНІЙ РОЗРІЗ') : '01 / 01'}</span></div>
        {['groundId', 'orbitId', 'launcherId'].includes(selectedField) ? <div className={`mission-choice-preview choice-${selectedField}`}>
          <svg viewBox="0 0 500 280" aria-hidden="true">
            {selectedField === 'groundId' ? <><path d="M0 240Q250 160 500 240" fill="#1b4051"/>{Array.from({ length: part && 'contactsPerDay' in part ? (part.contactsPerDay > 4 ? 3 : 1) : 1 }, (_, i) => <g key={i} transform={`translate(${130 + i * 110} 150)`}><path d="M-38 -30Q0 35 38 -30Z" fill="#d7e2e9"/><path d="M0 0v70M-20 70h40M0 -8L22 -60" stroke="#8ccfed" strokeWidth="5"/><circle cx="22" cy="-60" r="5" fill="#ffac69"/></g>)}</>
              : selectedField === 'orbitId' ? <><circle cx="250" cy="170" r="75" fill="#24628d"/><ellipse cx="250" cy="160" rx="170" ry="95" fill="none" stroke="#84d6ff" strokeWidth="2" transform="rotate(-25 250 160)"/><circle cx="395" cy="80" r="10" fill="#f4b075"/></>
              : <><path d="M220 220V78L250 26l30 52v142Z" fill="#d7e2e9"/><path d="M220 160l-30 60h30m60-60 30 60h-30" fill="#5089ad"/><path d="M230 225l20 38 20-38" fill="#f4b075"/><path d="M220 110h60M220 145h60" stroke="#12283d" strokeWidth="5"/></>}
          </svg><p>{part?.label[locale]}</p><small>{en ? 'Mission selection — not an attached spacecraft part' : 'Параметр місії — не деталь на апараті'}</small>
        </div> : <CraftScene config={config} locale={locale} mode="hangar" selectedField={selectedField} angle={angle} motion={false} onInspect={onInspect} />}
        {!['groundId', 'orbitId', 'launcherId'].includes(selectedField) && <div className="camera-controls" role="group" aria-label={en ? 'Inspect camera' : 'Камера огляду'}>
          <button onClick={() => setAngle(a => a - 45)}>{en ? 'Rotate left' : 'Обернути ліворуч'}</button>
          <button onClick={() => setAngle(28)}>{en ? 'Reset camera' : 'Скинути камеру'}</button>
          <button onClick={() => setAngle(a => a + 45)}>{en ? 'Rotate right' : 'Обернути праворуч'}</button>
        </div>}
        <div className="viewport-slots" role="group" aria-label={en ? 'Spacecraft attachment slots' : 'Місця встановлення деталей'}>
          {categories.slice(0, 5).map(([field, cat]) => <button key={field} aria-pressed={field === selectedField} onClick={() => onInspect(field)}>{translate(locale, `category.${cat}`)}</button>)}
        </div>
        <p className="art-note">{en ? 'Illustrative hardware, not a qualification or capability claim.' : 'Ілюстративне обладнання, не твердження про кваліфікацію чи можливості.'}</p>
      </section>
      <aside className="part-hud" aria-label={en ? 'Installed part and live system data' : 'Установлена деталь і поточні дані системи'}>
        {part && <><p className="game-eyebrow">{en ? 'INSTALLED' : 'УСТАНОВЛЕНО'}</p><h2>{part.label[locale]}</h2>
          <dl>{stats(part, locale).map(([label, value, unit]) => <div key={label}><dt>{label}</dt><dd>{formatExactValue(value, unit, locale)}</dd></div>)}</dl>
          <p className="tradeoff">{selectedField === 'arrayId' ? (en ? 'More generation can cost mass and USD. Peak W is not orbit-average supply.' : 'Більша генерація коштує маси й USD. Пікові Вт — не середня потужність на орбіті.')
            : selectedField === 'batteryId' ? (en ? 'Larger packs add energy and mass. Wh does not establish peak W or fix a recharge deficit.' : 'Більші батареї додають енергію й масу. Вт·год не визначають пікові Вт і не усувають дефіцит заряджання.')
            : selectedField === 'radioId' || selectedField === 'groundId' ? (en ? 'Rate and contact cadence are separate constraints. More Mbps cannot create a contact.' : 'Швидкість і частота сеансів — різні обмеження. Більше Мбіт/с не створює сеанс.')
            : (en ? 'Every choice is re-evaluated against fit, resources and mission requirements.' : 'Кожен вибір перевіряється за сумісністю, ресурсами й вимогами місії.')}</p></>}
        <div className="draft-telemetry"><h3>{en ? 'Live draft · not a flight report' : 'Поточний проєкт · не звіт польоту'}</h3>
          <details className="native-totals"><summary>{en ? 'Resource totals & demand' : 'Підсумки ресурсів і потреби'}</summary><dl className="system-totals">
            {([
              ['massKg', en ? 'Spacecraft incl. 15% contingency' : 'Апарат із резервом маси 15%'],
              ['totalUsd', en ? 'Mission incl. reserve & operations' : 'Місія з резервом і експлуатацією'],
              ['arrayWhOrbitEOL', en ? 'EOL generation / orbit' : 'Генерація EOL / виток'],
              ['arrayRequiredWhOrbit', en ? 'Required energy / orbit' : 'Потрібна енергія / виток'],
              ['effectiveDownlinkGBDay', en ? 'Effective return capacity' : 'Ефективна місткість передачі'],
              ['generatedGBDay', en ? 'Required stream' : 'Потрібний потік'],
            ] as const).map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{preview.metrics[key] ? formatMetric(preview.metrics[key], locale, key) : (en ? 'Unavailable' : 'Недоступно')}</dd></div>)}
          </dl></details>
          {(['massMargin', 'powerMargin', 'budgetMargin', 'dataMargin'] as const).map(key => {
            const metric = preview.metrics[key]
            const label = translate(locale, `resource.${key === 'massMargin' ? 'mass' : key === 'powerMargin' ? 'power' : key === 'budgetMargin' ? 'budget' : 'data'}`)
            return <div key={key} className={`live-margin ${metric?.kind === 'finite' && metric.value < 0 ? 'deficit' : ''}`}>
              <p><span>{label}</span><strong>{metric ? `${metric.kind === 'finite' && metric.value >= 0 ? '+' : ''}${formatMetric(metric, locale, key)}` : (en ? 'Unavailable' : 'Недоступно')}</strong></p>
              {metric?.kind === 'finite' && <div className="honest-bar" aria-hidden="true"><span style={{ width: `${Math.min(100, Math.max(0, metric.value * 100))}%` }} /></div>}
              <small>{metric?.kind !== 'finite' ? (en ? 'Unavailable — missing evidence' : 'Недоступно — бракує доказів') : metric.value < 0 ? (en ? 'Deficit' : 'Дефіцит') : (en ? 'Headroom / capacity' : 'Запас / місткість')}</small>
            </div>
          })}
          <p className="art-note">{en ? 'Bars: (capacity − demand) / capacity; capped at 0–100%. Signed values remain above. Power uses the worst BOL/EOL balance.' : 'Смуги: (місткість − потреба) / місткість; межі 0–100%. Значення зі знаком наведено вище. Живлення — найгірший баланс BOL/EOL.'}</p>
        </div>
      </aside>
    </div>
    {!motion && <span className="sr-only">{en ? 'Stationary inspection' : 'Статичний огляд'}</span>}
  </main>
}
