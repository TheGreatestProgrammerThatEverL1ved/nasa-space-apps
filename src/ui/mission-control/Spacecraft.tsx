import type { EvaluationContext, EvaluationReport, Locale, MissionConfiguration } from '../../engine/types'
import { translate } from '../../i18n'
import { formatNumber } from '../format'
import './flight-deck.css'

export type PartField = Exclude<keyof MissionConfiguration, 'scenarioId'>
const slots = [
  ['busId', 'bus', 'buses'], ['payloadId', 'payload', 'payloads'],
  ['arrayId', 'array', 'arrays'], ['batteryId', 'battery', 'batteries'],
  ['radioId', 'radio', 'radios'], ['groundId', 'ground', 'grounds'],
] as const

export function Spacecraft({ config, context, locale, onInspect }: {
  config: MissionConfiguration; context: EvaluationContext; locale: Locale
  onInspect: (field: PartField) => void
}) {
  const array = context.catalog.arrays.find(p => p.id === config.arrayId)
  return <section className="spacecraft-bay" aria-label={locale === 'en' ? 'Spacecraft hangar' : 'Ангар апарата'}>
    <div className="bay-heading">
      <span>{locale === 'en' ? 'YOUR SPACECRAFT' : 'ВАШ АПАРАТ'}</span>
      <span>{locale === 'en' ? 'Draft • inspect a subsystem' : 'Чернетка • огляньте підсистему'}</span>
    </div>
    <svg viewBox="0 0 680 300" role="img" aria-label={locale === 'en' ? 'Conceptual spacecraft with bus, camera, solar wings and antenna. Not to scale.' : 'Концептуальний апарат із платформою, камерою, сонячними крилами й антеною. Не в масштабі.'}>
      <defs><pattern id="solar-cells" width="24" height="26" patternUnits="userSpaceOnUse"><rect width="22" height="24" fill="#244b67" stroke="#8fb7cc" strokeWidth=".6" /></pattern></defs>
      <ellipse cx="340" cy="163" rx="286" ry="111" fill="none" stroke="#577286" strokeDasharray="4 9" />
      <g transform={`translate(340 145) scale(${array && array.bolW > 55 ? 1.15 : 1}) translate(-340 -145)`}>
        <path d="M75 92 L262 76 L262 196 L75 222Z M418 76 L605 92 L605 222 L418 196Z" fill="url(#solar-cells)" stroke="#a5c3d2" strokeWidth="3" />
      </g>
      <path d="M270 65 L364 42 L415 78 L415 205 L321 230 L270 195Z" fill="#d1d6d8" stroke="#f3e4c8" strokeWidth="3" />
      <path d="M321 99 L415 78 L415 205 L321 230Z" fill="#768c9c" stroke="#c4d5dc" strokeWidth="2" />
      <path d="M270 65 L321 99 L321 230 L270 195Z" fill="#a7b9c3" />
      <path d="M321 99 L321 230 M270 129 L321 161 L415 138" fill="none" stroke="#354b5c" strokeWidth="4" />
      <circle cx="351" cy="181" r="26" fill="#172d40" stroke="#f8bc74" strokeWidth="7" />
      <circle cx="351" cy="181" r="12" fill="#82b2c4" />
      <path d="M371 48 L402 14 M387 30 L427 36" stroke="#f8bc74" strokeWidth="5" />
      <text x="36" y="266" fill="#d7e7ed" fontSize="14">{locale === 'en' ? 'SOLAR POWER' : 'СОНЯЧНЕ ЖИВЛЕННЯ'}</text>
      <text x="290" y="272" fill="#f8bc74" fontSize="14">{locale === 'en' ? 'PAYLOAD' : 'ПРИЛАД'}</text>
      <text x="475" y="45" fill="#d7e7ed" fontSize="14">{locale === 'en' ? 'RADIO LINK' : 'РАДІОЛІНІЯ'}</text>
    </svg>
    <p className="bay-caption">{locale === 'en' ? 'Original schematic, not a flight layout. Select a slot to inspect and fit parts.' : 'Оригінальна схема, не льотне компонування. Виберіть слот для огляду й заміни деталей.'}</p>
    <div className="subsystem-slots">{slots.map(([field, category, group]) => {
      const part = context.catalog[group].find(p => p.id === config[field])
      const effect = part && ('bolW' in part ? `${formatNumber(part.bolW, locale)} W BOL` : 'nominalWh' in part ? `${part.nominalWh} Wh` : 'lineMbps' in part ? `${part.lineMbps} Mbps` : 'contactsPerDay' in part ? `${part.contactsPerDay} ${locale === 'en' ? 'contacts/day' : 'сеансів/добу'}` : `${formatNumber(part.massKg, locale)} ${locale === 'en' ? 'kg' : 'кг'}`)
      return <button type="button" key={field} onClick={() => onInspect(field)}>
        <span>{translate(locale, `category.${category}`)}</span>
        <strong>{part?.label[locale] ?? '—'}</strong><small>{effect}</small>
      </button>
    })}</div>
  </section>
}

export function ContactStrip({ report, locale, stale }: { report: EvaluationReport; locale: Locale; stale: boolean }) {
  const windows = report.service?.windows
  if (windows?.state !== 'known') return null
  return <figure className="contact-strip">
    <figcaption>{locale === 'en' ? 'Recorded contact fixture • 24 hours, repeating' : 'Зафіксована модель сеансів • 24 години, повторюється'}{stale ? (locale === 'en' ? ' • stale report' : ' • застарілий звіт') : ''}</figcaption>
    <svg viewBox="0 0 1000 52" role="img" aria-label={`${windows.value.length} ${locale === 'en' ? 'synthetic contact windows per day, evenly spaced; not geographic predictions' : 'синтетичних сеансів на добу, рівномірно; не географічний прогноз'}`}>
      <rect x="0" y="12" width="1000" height="18" rx="4" fill="#c9d6db" />
      {windows.value.map(w => <rect key={w.startMin} x={w.startMin / 1440 * 1000} y="8" width={Math.max(2, (w.endMin - w.startMin) / 1440 * 1000)} height="26" fill="#a64708" />)}
      <text x="0" y="50" fontSize="13">00:00</text><text x="480" y="50" fontSize="13">12:00</text><text x="958" y="50" fontSize="13">24:00</text>
    </svg>
    <p>{locale === 'en' ? `${windows.value.length} opportunities to return data. Empty spans are waits, not a slow radio. Latency is valid only with a closing link and stable service.` : `${windows.value.length} можливостей повернути дані. Порожні проміжки — очікування, а не повільне радіо. Затримка чинна лише за замкненої лінії та стабільного обслуговування.`}</p>
  </figure>
}
