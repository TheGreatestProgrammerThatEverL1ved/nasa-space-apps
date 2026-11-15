import type { EvaluationReport, Labels, Locale } from '../../engine/types'
import { formatExactValue } from '../format'
import './expedition.css'

const RECIPIENTS: Record<string, { name: Labels; product: Labels; use: Labels; check: string }> = {
  wildfire: {
    name: { en: 'Land management team', ua: 'Команда управління територіями' },
    product: { en: 'Thermal anomaly imagery', ua: 'Знімки теплових аномалій' },
    use: { en: 'Prioritize areas for follow-up with other evidence.', ua: 'Визначити пріоритетні ділянки для перевірки за іншими даними.' },
    check: 'WF-LATENCY',
  },
  'urban-heat': {
    name: { en: 'City heat-planning team', ua: 'Міська команда адаптації до спеки' },
    product: { en: 'Surface temperature patterns', ua: 'Розподіл температури поверхні' },
    use: { en: 'Identify areas for ground measurements and shade studies.', ua: 'Знайти ділянки для наземних вимірювань і досліджень затінення.' },
    check: 'UH-LATENCY',
  },
  'visible-mapping': {
    name: { en: 'Coastal survey team', ua: 'Команда моніторингу узбережжя' },
    product: { en: 'Visible imagery of the coastal corridor', ua: 'Знімки прибережної смуги у видимому діапазоні' },
    use: { en: 'Flag sections for a repeat field survey.', ua: 'Позначити ділянки для повторного польового обстеження.' },
    check: 'VM-LATENCY',
  },
  'packet-relay': {
    name: { en: 'Remote instrument team', ua: 'Команда віддаленого приладу' },
    product: { en: 'Relayed measurement packets', ua: 'Ретрансльовані пакети вимірювань' },
    use: { en: 'Check which measurements arrived before the deadline.', ua: 'Перевірити, які вимірювання надійшли вчасно.' },
    check: 'RL-DELAY',
  },
}

export default function DataHandoff({ report, locale }: { report: EvaluationReport; locale: Locale }) {
  const recipient = report.config && RECIPIENTS[report.config.scenarioId]
  if (!recipient) return null
  const en = locale === 'en'
  const delay = report.checks.find(check => check.checkId === recipient.check)
  const status = delay?.status === 'NOT_MET' ? (en ? 'Timing limit missed' : 'Часову межу перевищено')
    : delay?.status === 'MET' && report.outcome === 'MODEL_PASS_PROVISIONAL'
      ? (en ? 'Model delivery meets the requirement' : 'Доставка за моделлю відповідає вимозі')
      : (en ? 'Handoff not established' : 'Передачу даних не підтверджено')
  return <details className="data-handoff">
    <summary>{en ? 'Data handoff' : 'Передача даних'} · {status}</summary>
    <dl>
      <div><dt>{en ? 'Recipient' : 'Отримувач'}</dt><dd>{recipient.name[locale]}</dd></div>
      <div><dt>{en ? 'Product' : 'Продукт'}</dt><dd>{recipient.product[locale]}</dd></div>
      {delay?.actual.kind === 'finite' && <div><dt>{en ? 'Model time / limit' : 'Час за моделлю / межа'}</dt>
        <dd>{formatExactValue(delay.actual.value, 'h', locale)} / {formatExactValue(delay.limit, 'h', locale)}</dd></div>}
    </dl>
    <p>{report.outcome === 'MODEL_PASS_PROVISIONAL' ? recipient.use[locale]
      : (en ? 'Resolve the mission checks before relying on this product.' : 'Виконайте вимоги місії, перш ніж покладатися на ці дані.')}</p>
  </details>
}
