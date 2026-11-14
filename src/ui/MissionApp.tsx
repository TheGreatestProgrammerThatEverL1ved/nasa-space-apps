import { useEffect, useRef, useState, type ChangeEvent, type MouseEvent } from 'react'
import type {
  Category,
  CheckResult,
  Diagnostic,
  EvaluationContext,
  EvaluationReport,
  Labels,
  Locale,
  MissionConfiguration,
  Outcome,
  Part,
  Provenance,
  ReportProvider,
  Status,
} from '../engine/types'
import {
  hasMessage,
  htmlLang,
  translate,
  translateOptional,
  type MessageKey,
} from '../i18n'
import {
  formatExactValue,
  formatLimit,
  formatMetric,
  formatNumber,
  formatUnit,
  formatValue,
} from './format'
import '../App.css'

export interface MissionAppProps {
  readonly context: EvaluationContext
  readonly initialConfiguration: MissionConfiguration
  readonly evaluate: ReportProvider
}

type PartField = Exclude<keyof MissionConfiguration, 'scenarioId'>
type SelectOption = { readonly id: string; readonly label: Labels }
type SelectField = {
  readonly key: PartField
  readonly category: Category
  readonly options: readonly SelectOption[]
}
type ResourceMetric = { readonly key: string; readonly labelKey: MessageKey }
type ResourceSection = {
  readonly titleKey: MessageKey
  readonly metrics: readonly ResourceMetric[]
}

const CATEGORY_MESSAGE: Readonly<Record<Category, MessageKey>> = {
  payload: 'category.payload',
  bus: 'category.bus',
  array: 'category.array',
  battery: 'category.battery',
  radio: 'category.radio',
  ground: 'category.ground',
  orbit: 'category.orbit',
  launcher: 'category.launcher',
}

const OUTCOME_MESSAGE: Readonly<Record<Outcome, MessageKey>> = {
  FAILURE: 'outcomes.failure',
  UNVERIFIED: 'outcomes.unverified',
  DEFERRED: 'outcomes.deferred',
  MODEL_PASS_PROVISIONAL: 'outcomes.provisional',
}

const STATUS_MESSAGE: Readonly<Record<Status, MessageKey>> = {
  MET: 'status.MET',
  NOT_MET: 'status.NOT_MET',
  UNVERIFIED: 'status.UNVERIFIED',
}

const SERVICE_MESSAGE = {
  available: 'service.available',
  unavailable: 'service.unavailable',
  unknown: 'service.unknown',
} as const satisfies Record<'available' | 'unavailable' | 'unknown', MessageKey>

const QUEUE_MESSAGE = {
  stable: 'queue.stable',
  unstable: 'queue.unstable',
  unverified: 'queue.unverified',
} as const satisfies Record<'stable' | 'unstable' | 'unverified', MessageKey>

const CORE_ASSUMPTIONS: readonly MessageKey[] = [
  'assumptions.tracking',
  'assumptions.link',
  'assumptions.access',
  'assumptions.cost',
  'assumptions.life',
  'assumptions.cloud',
]

const KNOWN_ASSUMPTION_CODES = new Set([
  'synthetic-access',
  'synthetic-contacts',
  'tracking',
  'link',
  'integration',
  'costs',
  'life',
  'cloud-rejection',
])

const RESOURCE_SECTIONS: readonly ResourceSection[] = [
  {
    titleKey: 'resource.mass',
    metrics: [{ key: 'massKg', labelKey: 'metric.massKg' }],
  },
  {
    titleKey: 'resource.power',
    metrics: [
      { key: 'arrayWhOrbitBOL', labelKey: 'metric.arrayWhOrbitBOL' },
      { key: 'arrayWhOrbitEOL', labelKey: 'metric.arrayWhOrbitEOL' },
      { key: 'arrayRequiredWhOrbit', labelKey: 'metric.arrayRequiredWhOrbit' },
      { key: 'batteryUsableWhEOL', labelKey: 'metric.batteryUsableWhEOL' },
      { key: 'eclipseDemandWh', labelKey: 'metric.eclipseDemandWh' },
      { key: 'peakW', labelKey: 'metric.peakW' },
      { key: 'peakWh', labelKey: 'metric.peakWh' },
    ],
  },
  {
    titleKey: 'resource.budget',
    metrics: [{ key: 'totalUsd', labelKey: 'metric.totalUsd' }],
  },
  {
    titleKey: 'resource.data',
    metrics: [
      { key: 'generatedGBDay', labelKey: 'metric.generatedGBDay' },
      { key: 'deliveredUsefulGBDay', labelKey: 'metric.deliveredUsefulGBDay' },
      { key: 'effectiveScaleM', labelKey: 'metric.effectiveScaleM' },
      { key: 'usableSwathKm', labelKey: 'metric.usableSwathKm' },
    ],
  },
  {
    titleKey: 'resource.communications',
    metrics: [
      { key: 'effectiveDownlinkGBDay', labelKey: 'metric.effectiveDownlinkGBDay' },
      { key: 'queuePeakGB', labelKey: 'metric.queuePeakGB' },
      { key: 'latencyHours', labelKey: 'metric.latencyHours' },
    ],
  },
  {
    titleKey: 'resource.time',
    metrics: [{ key: 'scheduleMonths', labelKey: 'metric.scheduleMonths' }],
  },
]

function selectFields(context: EvaluationContext): readonly SelectField[] {
  const catalog = context.catalog
  return [
    { key: 'payloadId', category: 'payload', options: catalog.payloads },
    { key: 'busId', category: 'bus', options: catalog.buses },
    { key: 'arrayId', category: 'array', options: catalog.arrays },
    { key: 'batteryId', category: 'battery', options: catalog.batteries },
    { key: 'radioId', category: 'radio', options: catalog.radios },
    { key: 'groundId', category: 'ground', options: catalog.grounds },
    { key: 'orbitId', category: 'orbit', options: catalog.orbits },
    { key: 'launcherId', category: 'launcher', options: catalog.launchers },
  ]
}

type SelectedPart = {
  readonly key: PartField
  readonly part: Part
}

/**
 * Evidence snapshot captured at Run. Field provenance must describe the
 * evaluated context and configuration, never the edited draft or a later
 * catalog revision.
 */
type ReportSnapshot = {
  readonly revision: string
  readonly context: EvaluationContext
  readonly parts: readonly SelectedPart[]
}

const SOURCE_REGISTER: Readonly<
  Record<string, { readonly url: string; readonly label: string }>
> = {
  S1: {
    url: 'https://www.nasa.gov/wp-content/uploads/2018/01/cubesatdesignspecificationrev14_12022-02-09.pdf',
    label: 'CubeSat Design Specification Rev 14.1',
  },
  S2: {
    url: 'https://circgs.tksc.jaxa.jp/documents/2012/83533J.pdf',
    label: 'JAXA CIRC development',
  },
  S3: {
    url: 'https://www.nasa.gov/smallsat-institute/sst-soa/power-subsystems/',
    label: 'NASA 2026 SoA: Power',
  },
  S4: {
    url: 'https://www.nasa.gov/smallsat-institute/sst-soa/communications/',
    label: 'NASA 2026 SoA: Communications',
  },
  S5: {
    url: 'https://www.iceye.com/newsroom/press-releases/iceye-successfully-launches-worlds-first-sar-microsatellite-and-establishes-finlands-first-commercial-satellite',
    label: 'ICEYE launch release',
  },
  S6: {
    url: 'https://www.nasa.gov/wp-content/uploads/2025/02/5-soa-gnc-2024.pdf',
    label: 'NASA GNC chapter',
  },
  S7: {
    url: 'https://www.earthdata.nasa.gov/data/tools/firms/faq',
    label: 'NASA FIRMS FAQ',
  },
  S8: {
    url: 'https://www.kplabs.space/projects-and-missions/intuition-1',
    label: 'KP Labs Intuition-1',
  },
  S9: {
    url: 'https://carbonmapper.org/articles/product-guide',
    label: 'Carbon Mapper product guide',
  },
  S10: {
    url: 'https://new.spacex.com/rideshare',
    label: 'SpaceX Smallsat Rideshare',
  },
  S11: {
    url: 'https://rocketlabcorp.com/updates/rocket-lab-increases-electron-payload-capacity-enabling-interplanetary-missions-and-reusability/',
    label: 'Rocket Lab Electron payload increase',
  },
}

/** Mirrors the rulebook anchors used by the frozen catalog and fixtures. */
const RULE_SECTIONS: Readonly<Record<string, string>> = {
  '31-bus': '3.1',
  '32-arrays': '3.2',
  '33-batteries': '3.3',
  '34-science-downlink-packages': '3.4',
  '35-retained-payload-pl-thermal': '3.5',
  '41-orbit-and-target-access': '4.1',
  '42-ground-contacts-and-arrivals': '4.2',
  '43-launch-booking': '4.3',
  '52-orbit-and-scheduled-modes': '5.2',
}

const PROVENANCE_MESSAGE: Readonly<Record<Provenance['kind'], MessageKey>> = {
  'verified-reference': 'provenance.verified-reference',
  derived: 'provenance.derived',
  provisional: 'provenance.provisional',
}

function contextRevisionKey(context: EvaluationContext): string {
  return JSON.stringify([
    context.modelRevision,
    context.contractRevision,
    context.catalogRevision,
    context.scenarioRevision,
    context.fixtureRevision,
  ])
}

function selectedParts(
  config: MissionConfiguration,
  context: EvaluationContext,
): readonly SelectedPart[] {
  const catalog = context.catalog
  const groups: readonly { readonly key: PartField; readonly parts: readonly Part[] }[] = [
    { key: 'payloadId', parts: catalog.payloads },
    { key: 'busId', parts: catalog.buses },
    { key: 'arrayId', parts: catalog.arrays },
    { key: 'batteryId', parts: catalog.batteries },
    { key: 'radioId', parts: catalog.radios },
    { key: 'groundId', parts: catalog.grounds },
    { key: 'orbitId', parts: catalog.orbits },
    { key: 'launcherId', parts: catalog.launchers },
  ]
  const selected: SelectedPart[] = []
  for (const group of groups) {
    const part = group.parts.find((candidate) => candidate.id === config[group.key])
    if (part) selected.push({ key: group.key, part })
  }
  return selected
}

function isSafeHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

function isRuleRef(sourceRef: string): boolean {
  return sourceRef.startsWith('docs/game-rules-technical.md#')
}

function ruleSection(sourceRef: string): string | null {
  if (!isRuleRef(sourceRef)) return null
  const anchor = sourceRef.slice('docs/game-rules-technical.md#'.length)
  return RULE_SECTIONS[anchor] ?? null
}

function SourceReference({
  sourceRef,
  locale,
}: {
  readonly sourceRef: string
  readonly locale: Locale
}) {
  const source = SOURCE_REGISTER[sourceRef]
  if (source && isSafeHttpsUrl(source.url)) {
    return (
      <a
        className="source-link"
        href={source.url}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={translate(locale, 'sources.openPrimary', {
          id: sourceRef,
          title: source.label,
        })}
      >
        <span className="source-id">{sourceRef}</span>
        {' — '}
        {source.label}
      </a>
    )
  }
  const section = ruleSection(sourceRef)
  if (section) {
    return (
      <span className="rule-reference">
        {translate(locale, 'sources.ruleReference', { section })}
      </span>
    )
  }
  if (isRuleRef(sourceRef)) {
    return (
      <span className="rule-reference">
        {translate(locale, 'sources.ruleReferenceUnknown')}
      </span>
    )
  }
  return <code>{sourceRef}</code>
}

/** The same rounded text for actual and limit hides the real comparison. */
function hasRoundedBoundary(check: CheckResult, locale: Locale): boolean {
  if (check.operator === 'true' || check.actual.kind !== 'finite') return false
  const actual = formatValue(check.actual.value, check.actual.unit, locale, check.checkId)
  const limit = formatValue(check.limit, check.actual.unit, locale, check.checkId)
  return actual === limit
}

function repairText(locale: Locale, diagnostic: Diagnostic): string {
  // Only the known latency failure gets the cadence repair. An UNVERIFIED
  // latency uses MISSING_EVIDENCE and must ask for evidence, not contacts.
  if (diagnostic.repairKey === 'WF-LATENCY') {
    return translate(locale, 'repair.WF-LATENCY')
  }
  const candidates = [`repair.${diagnostic.repairKey}`, `repair.${diagnostic.reasonCode}`]
  for (const key of candidates) {
    if (hasMessage(key)) return translate(locale, key)
  }
  return translate(locale, 'repair.generic')
}

function reasonText(locale: Locale, diagnostic: Diagnostic): string {
  return translateOptional(
    locale,
    `reason.${diagnostic.reasonCode}`,
    translate(locale, 'reason.generic'),
  )
}

function detailText(locale: Locale, diagnostic: Diagnostic): string {
  return translateOptional(
    locale,
    `check.${diagnostic.detailId}`,
    translate(locale, 'diagnostics.detailFallback'),
  )
}

function warningText(locale: Locale, code: string): string {
  const normalized = code.toLowerCase().replace(/[^a-z0-9-]/g, '')
  return translateOptional(
    locale,
    `warning.${normalized}`,
    translate(locale, 'warning.generic'),
  )
}

function summaryText(report: EvaluationReport, locale: Locale): string {
  if (report.validation.kind === 'invalid') return translate(locale, 'results.invalidSummary')
  switch (report.outcome) {
    case 'FAILURE': {
      const first = report.diagnostics[0]
      if (!first) return translate(locale, 'results.failureSummaryNoFinding')
      return translate(locale, 'results.failureSummary', {
        requirement: detailText(locale, first),
        repair: repairText(locale, first),
      })
    }
    case 'UNVERIFIED':
      return translate(locale, 'results.unverifiedSummary')
    case 'DEFERRED':
      return translate(locale, 'results.deferredSummary')
    case 'MODEL_PASS_PROVISIONAL':
      return translate(locale, 'results.passSummary')
    default:
      return translate(locale, 'outcomes.unknown')
  }
}

function checkActualText(check: CheckResult, locale: Locale): string {
  if (check.operator === 'true') {
    if (check.status === 'UNVERIFIED') return translate(locale, 'metric.unavailable')
    return translate(locale, STATUS_MESSAGE[check.status])
  }
  return formatMetric(check.actual, locale, check.checkId)
}

function checkLimitText(check: CheckResult, locale: Locale): string {
  if (check.operator === 'true') return translate(locale, 'metric.mustBeTrue')
  // Every Metric variant carries its unit, including unknown and unbounded
  // actuals. Dropping it would make the printed limit ambiguous.
  const relation = check.operator === '<=' ? '≤' : '≥'
  return `${relation} ${formatLimit(check.limit, check.actual.unit, locale, check.checkId)}`
}

function latencyQuantity(
  metric: EvaluationReport['metrics'][string] | undefined,
  locale: Locale,
) {
  if (!metric) {
    return <span data-testid="latency-value">{translate(locale, 'metric.unavailable')}</span>
  }
  if (metric.kind !== 'finite') {
    return <span data-testid="latency-value">{formatMetric(metric, locale, 'latencyHours')}</span>
  }
  return (
    <>
      <span data-testid="latency-value">{formatValue(metric.value, '', locale, 'latencyHours')}</span>{' '}
      <span>{formatUnit(metric.unit, locale)}</span>
    </>
  )
}

export default function MissionApp({
  context,
  initialConfiguration,
  evaluate,
}: MissionAppProps) {
  const [locale, setLocale] = useState<Locale>('en')
  const [draft, setDraft] = useState<MissionConfiguration>(() => ({ ...initialConfiguration }))
  const [report, setReport] = useState<EvaluationReport | null>(null)
  const [snapshot, setSnapshot] = useState<ReportSnapshot | null>(null)
  const [stale, setStale] = useState(false)
  const [evaluationError, setEvaluationError] = useState(false)
  const [runSignal, setRunSignal] = useState(0)
  const resultHeadingRef = useRef<HTMLHeadingElement>(null)
  const groundRef = useRef<HTMLSelectElement>(null)

  const t = (key: MessageKey) => translate(locale, key)
  const fields = selectFields(context)

  useEffect(() => {
    document.documentElement.lang = htmlLang(locale)
    document.title = translate(locale, 'app.documentTitle')
  }, [locale])

  useEffect(() => {
    if (runSignal === 0) return
    resultHeadingRef.current?.focus()
  }, [runSignal])

  // A report only describes the five revision strings it was computed under.
  // Staleness is derived during render; no effect writes state on a context
  // change. The report, language and Run-time evidence snapshot are preserved.
  const revisionChanged =
    snapshot !== null && snapshot.revision !== contextRevisionKey(context)
  const isStale = stale || revisionChanged

  const handleSelect = (field: PartField, event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.currentTarget.value
    if (draft[field] === value) return
    setDraft((previous) => ({ ...previous, [field]: value }) as MissionConfiguration)
    if (report) setStale(true)
  }

  const handleRun = () => {
    setEvaluationError(false)
    try {
      const next = evaluate(draft)
      // Snapshot the evaluated context and configuration together, so later
      // edits or catalog revisions cannot rewrite this report's provenance.
      const evaluatedContext = structuredClone(context)
      const evaluatedConfig = next.config ?? { ...draft }
      setSnapshot({
        revision: contextRevisionKey(evaluatedContext),
        context: evaluatedContext,
        parts: selectedParts(evaluatedConfig, evaluatedContext),
      })
      setReport(next)
      setStale(false)
    } catch {
      setEvaluationError(true)
      // The old report survives, but it can no longer be presented as current.
      if (report) setStale(true)
    } finally {
      setRunSignal((value) => value + 1)
    }
  }

  const backToConfiguration = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    groundRef.current?.focus()
    groundRef.current?.scrollIntoView?.({ block: 'center' })
  }

  const scienceChecks = report?.checks.filter((check) => check.scope === 'science') ?? []
  const engineeringChecks =
    report?.checks.filter((check) => check.scope === 'engineering') ?? []
  const extraAssumptions =
    report?.assumptions.filter((assumption) => !KNOWN_ASSUMPTION_CODES.has(assumption)) ?? []
  // Field provenance comes only from the report's Run-time snapshot.
  const provenanceParts = snapshot?.parts ?? []

  const renderCheck = (check: CheckResult) => (
    <li
      key={check.checkId}
      className={`check-item check-${check.status.toLowerCase().replace('_', '-')}`}
      data-testid={`requirement-${check.checkId}`}
    >
      <div className="check-heading">
        <h4>
          {translateOptional(locale, `check.${check.checkId}`, t('check.generic'))}
        </h4>
        <span className={`status-badge status-${check.status.toLowerCase().replace('_', '-')}`}>
          {t(STATUS_MESSAGE[check.status])}
        </span>
      </div>
      <dl className="check-values">
        <div>
          <dt>{t('metric.actual')}</dt>
          <dd>{checkActualText(check, locale)}</dd>
        </div>
        <div>
          <dt>{t('metric.limit')}</dt>
          <dd>{checkLimitText(check, locale)}</dd>
        </div>
      </dl>
      {check.actual.kind === 'finite' && hasRoundedBoundary(check, locale) && (
        <div className="boundary-note">
          <p>{t('boundary.ambiguous')}</p>
          <details>
            <summary>{t('boundary.detailTitle')}</summary>
            <dl className="check-values boundary-values">
              <div>
                <dt>{t('boundary.exactActual')}</dt>
                <dd>{formatExactValue(check.actual.value, check.actual.unit, locale)}</dd>
              </div>
              <div>
                <dt>{t('boundary.exactLimit')}</dt>
                <dd>{formatExactValue(check.limit, check.actual.unit, locale)}</dd>
              </div>
            </dl>
          </details>
        </div>
      )}
      {check.checkId === 'WF-LATENCY' && check.actual.kind === 'finite' && (
        <p className="latency-short">{t('latency.short')}</p>
      )}
      <p className="check-technical">
        <span>{t('results.ruleReference')}: </span>
        <code>{check.ruleRef}</code>
        <span className="technical-separator"> · </span>
        <code>{check.reasonCode}</code>
      </p>
    </li>
  )

  return (
    <div className="mission-shell">
      <a className="skip-link" href="#mission-controls">
        {t('app.skipToControls')}
      </a>

      <header className="mission-header">
        <div className="mission-identity">
          <p className="brand">{t('app.brand')}</p>
          <h1>{t('app.missionName')}</h1>
          <p className="mission-type">{t('app.missionType')}</p>
        </div>
        <div className="locale-switch" role="group" aria-label={t('app.language')}>
          <button
            type="button"
            className={locale === 'en' ? 'locale-active' : undefined}
            aria-pressed={locale === 'en'}
            onClick={() => setLocale('en')}
          >
            {t('locale.en')}
          </button>
          <button
            type="button"
            className={locale === 'ua' ? 'locale-active' : undefined}
            aria-pressed={locale === 'ua'}
            onClick={() => setLocale('ua')}
          >
            {t('locale.ua')}
          </button>
        </div>
      </header>

      <main>
        <section className="panel brief-panel" aria-labelledby="brief-heading">
          <h2 id="brief-heading">{t('app.briefTitle')}</h2>
          <p>{t('app.brief')}</p>
          <ul className="fact-list">
            <li>
              <span className="fact-label">{t('app.scenarioLabel')}:</span> {t('app.missionName')}
            </li>
            <li>
              {translate(locale, 'app.budgetFact', {
                budget: formatValue(context.scenario.budgetUsd, 'USD', locale),
              })}
            </li>
            <li>
              {translate(locale, 'app.scheduleFact', {
                months: formatNumber(context.scenario.availableMonths, locale),
              })}
            </li>
            <li>
              {translate(locale, 'app.operationsFact', {
                years: formatNumber(context.scenario.plannedYears, locale),
              })}
            </li>
          </ul>
          <p className="warning-text">{t('app.notPlayable')}</p>
          <p className="note">{t('app.headerNote')}</p>
        </section>

        <section
          id="mission-controls"
          className="panel"
          aria-labelledby="config-heading"
          tabIndex={-1}
        >
          <h2 id="config-heading">{t('config.title')}</h2>
          <p>{t('config.intro')}</p>
          <div
            className="select-grid"
            role="group"
            aria-label={t('config.partsLabel')}
          >
            {fields.map((field) => (
              <div className="field" key={field.key}>
                <label htmlFor={field.key}>{t(CATEGORY_MESSAGE[field.category])}</label>
                <select
                  id={field.key}
                  ref={field.key === 'groundId' ? groundRef : undefined}
                  value={draft[field.key]}
                  aria-describedby={field.key === 'groundId' ? 'ground-hint' : undefined}
                  onChange={(event) => handleSelect(field.key, event)}
                >
                  {field.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label[locale]}
                    </option>
                  ))}
                </select>
                {field.key === 'groundId' && (
                  <p id="ground-hint" className="field-hint">
                    {t('config.groundHint')}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="run-row">
            <button
              type="button"
              className="run-button"
              aria-describedby="run-note"
              onClick={handleRun}
            >
              {t('config.run')}
            </button>
          </div>
          <p id="run-note" className="note">
            {t('config.runNote')}
          </p>
        </section>

        <section className="panel resources-panel" aria-labelledby="resources-heading">
          <h2 id="resources-heading">{t('resources.title')}</h2>
          <p>{t('resources.intro')}</p>
          {isStale && report && (
            <p className="stale-hint">{t('resources.stale')}</p>
          )}
          <div className="resource-grid">
            {RESOURCE_SECTIONS.map((section) => (
              <article className="resource-card" key={section.titleKey}>
                <h3>{t(section.titleKey)}</h3>
                {report ? (
                  <dl>
                    {section.metrics.map((metric) => (
                      <div key={metric.key}>
                        <dt>{t(metric.labelKey)}</dt>
                        <dd>
                          {metric.key === 'latencyHours' ? (
                            latencyQuantity(report.metrics[metric.key], locale)
                          ) : report.metrics[metric.key] ? (
                            formatMetric(report.metrics[metric.key], locale, metric.key)
                          ) : (
                            t('metric.absent')
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p>{t('resources.awaiting')}</p>
                )}
                {section.titleKey === 'resource.communications' &&
                  report?.metrics.latencyHours?.kind === 'finite' && (
                    <div className="latency-note">
                      <p>{t('latency.short')}</p>
                      <details>
                        <summary>{t('latency.detailTitle')}</summary>
                        <p>{t('latency.detail')}</p>
                        <p>{t('latency.basis')}</p>
                        <p>
                          {t('evidence.physicalAge')}: {t('evidence.physicalAgeUnknown')}.{' '}
                          {t('evidence.notAGate')}
                        </p>
                      </details>
                    </div>
                  )}
              </article>
            ))}
          </div>
          <p className="note">{t('resources.help')}</p>
        </section>

        <section
          id="mission-result"
          className={`panel results-panel${isStale ? ' is-stale' : ''}`}
          aria-labelledby="result-heading"
        >
          <h2
            id="result-heading"
            ref={resultHeadingRef}
            tabIndex={-1}
            data-testid="verdict"
            aria-describedby="verdict-summary"
          >
            {report ? t(OUTCOME_MESSAGE[report.outcome]) : t('results.placeholderTitle')}
          </h2>

          {isStale && report && (
            <p className="stale-notice" data-testid="stale-notice" role="status">
              {t('results.staleNotice')}
            </p>
          )}

          {evaluationError && (
            <p className="error-notice" role="alert">
              {t('results.evaluationError')}
            </p>
          )}

          <p id="verdict-summary">
            {report ? summaryText(report, locale) : t('results.placeholderBody')}
          </p>

          {report && (
            <>
              <p className="report-meta">
                <span>{t('results.reportSource')}: </span>
                <span data-testid="report-origin">
                  {report.origin === 'evaluator'
                    ? t('results.reportSourceEvaluator')
                    : t('results.reportSourcePreview')}
                </span>
              </p>

              {report.validation.kind === 'invalid' && (
                <div className="invalid-input" role="group" aria-labelledby="invalid-input-title">
                  <h3 id="invalid-input-title">{t('results.invalidInputTitle')}</h3>
                  <p>{t('results.invalidInputBody')}</p>
                  <ul>
                    {[...new Set(report.validation.issues)].map((issue) => (
                      <li key={issue}>
                        <code>{issue}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <a className="back-link" href="#mission-controls" onClick={backToConfiguration}>
                {t('results.backToConfig')}
              </a>

              <section className="result-section" aria-labelledby="science-heading">
                <h3 id="science-heading">{t('results.scienceTitle')}</h3>
                <p>
                  {translate(locale, 'results.scienceCounts', {
                    met: formatNumber(report.counts.science.MET, locale),
                    total: formatNumber(report.counts.science.total, locale),
                  })}
                </p>
                <p>
                  {translate(locale, 'results.countsDetail', {
                    met: formatNumber(report.counts.science.MET, locale),
                    notMet: formatNumber(report.counts.science.NOT_MET, locale),
                    unverified: formatNumber(report.counts.science.UNVERIFIED, locale),
                  })}
                </p>
                <p className="note">{t('results.checksIntro')}</p>
                {scienceChecks.length > 0 ? (
                  <ul className="check-list">{scienceChecks.map(renderCheck)}</ul>
                ) : (
                  <p>{t('results.scienceEmpty')}</p>
                )}
              </section>

              <section className="result-section" aria-labelledby="engineering-heading">
                <h3 id="engineering-heading">{t('results.engineeringTitle')}</h3>
                <p>
                  {translate(locale, 'results.engineeringCounts', {
                    met: formatNumber(report.counts.engineering.MET, locale),
                    total: formatNumber(report.counts.engineering.total, locale),
                  })}
                </p>
                <p>
                  {translate(locale, 'results.countsDetail', {
                    met: formatNumber(report.counts.engineering.MET, locale),
                    notMet: formatNumber(report.counts.engineering.NOT_MET, locale),
                    unverified: formatNumber(report.counts.engineering.UNVERIFIED, locale),
                  })}
                </p>
                {engineeringChecks.length > 0 ? (
                  <ul className="check-list">{engineeringChecks.map(renderCheck)}</ul>
                ) : (
                  <p>{t('results.engineeringEmpty')}</p>
                )}
              </section>

              <section className="result-section" aria-labelledby="diagnostics-heading">
                <h3 id="diagnostics-heading">{t('diagnostics.title')}</h3>
                <p>{t('diagnostics.intro')}</p>
                {report.diagnostics.length > 0 ? (
                  <ul className="diagnostic-list">
                    {report.diagnostics.map((diagnostic, index) => (
                      <li key={`${diagnostic.reasonCode}-${diagnostic.detailId}-${index}`}>
                        <dl>
                          <div>
                            <dt>{t('diagnostics.reasonLabel')}</dt>
                            <dd>
                              {reasonText(locale, diagnostic)} <code>{diagnostic.reasonCode}</code>
                            </dd>
                          </div>
                          <div>
                            <dt>{t('diagnostics.detailLabel')}</dt>
                            <dd>{detailText(locale, diagnostic)}</dd>
                          </div>
                          <div>
                            <dt>{t('diagnostics.repairLabel')}</dt>
                            <dd className="repair-text">{repairText(locale, diagnostic)}</dd>
                          </div>
                          {diagnostic.checkIds.length > 0 && (
                            <div>
                              <dt>{t('diagnostics.relatedChecks')}</dt>
                              <dd>
                                {[...new Set(diagnostic.checkIds)].map((id) => (
                                  <code key={id}>{id}</code>
                                ))}
                              </dd>
                            </div>
                          )}
                          {diagnostic.causeIds.length > 0 && (
                            <div>
                              <dt>{t('diagnostics.relatedCauses')}</dt>
                              <dd>
                                {[...new Set(diagnostic.causeIds)].map((id) => (
                                  <code key={id}>{id}</code>
                                ))}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>{t('diagnostics.empty')}</p>
                )}
              </section>

              <section className="result-section" aria-labelledby="warnings-heading">
                <h3 id="warnings-heading">{t('warnings.title')}</h3>
                <p>{t('warnings.intro')}</p>
                {report.warnings.length > 0 ? (
                  <ul className="warning-list">
                    {report.warnings.map((warning, index) => (
                      <li key={`${warning}-${index}`}>
                        {warningText(locale, warning)}
                        {!hasMessage(
                          `warning.${warning.toLowerCase().replace(/[^a-z0-9-]/g, '')}`,
                        ) && (
                          <>
                            {' '}
                            <code>{warning}</code>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>{t('warnings.empty')}</p>
                )}
              </section>

              <section className="result-section" aria-labelledby="assumptions-heading">
                <h3 id="assumptions-heading">{t('assumptions.title')}</h3>
                <p>{t('assumptions.intro')}</p>
                <p id="assumption-baseline" className="assumption-scope">
                  {t('assumptions.baseline')}
                </p>
                <ul className="assumption-list" aria-describedby="assumption-baseline">
                  {CORE_ASSUMPTIONS.map((key) => (
                    <li key={key}>{t(key)}</li>
                  ))}
                </ul>
                {extraAssumptions.length > 0 && (
                  <details>
                    <summary>{t('assumptions.recordsTitle')}</summary>
                    <ul>
                      {extraAssumptions.map((assumption, index) => (
                        <li key={`${assumption}-${index}`}>
                          <code>{assumption}</code>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </section>

              <section className="result-section" aria-labelledby="evidence-heading">
                <h3 id="evidence-heading">{t('evidence.title')}</h3>
                <p>{t('evidence.intro')}</p>
                <dl className="evidence-list">
                  <div>
                    <dt>{t('evidence.modelRevision')}</dt>
                    <dd>
                      <code>{report.modelRevision}</code>
                    </dd>
                  </div>
                  <div>
                    <dt>{t('evidence.contractRevision')}</dt>
                    <dd>
                      <code>{report.contractRevision}</code>
                    </dd>
                  </div>
                  <div>
                    <dt>{t('evidence.configurationKey')}</dt>
                    <dd>
                      <code>{report.configurationKey}</code>
                    </dd>
                  </div>
                  <div>
                    <dt>{t('evidence.validation')}</dt>
                    <dd>
                      {report.validation.kind === 'valid'
                        ? t('evidence.valid')
                        : t('evidence.invalid')}
                    </dd>
                  </div>
                  <div>
                    <dt>{t('evidence.serviceState')}</dt>
                    <dd>
                      {report.service
                        ? t(SERVICE_MESSAGE[report.service.state])
                        : t('evidence.notReported')}
                    </dd>
                  </div>
                  <div>
                    <dt>{t('evidence.queueStatus')}</dt>
                    <dd>
                      {report.queue
                        ? t(QUEUE_MESSAGE[report.queue.status])
                        : t('evidence.notReported')}
                    </dd>
                  </div>
                  <div>
                    <dt>{t('evidence.timelineEligible')}</dt>
                    <dd>{report.timelineEligible ? t('evidence.yes') : t('evidence.no')}</dd>
                  </div>
                  <div>
                    <dt>{t('metric.merit')}</dt>
                    <dd>{formatMetric(report.merit, locale, 'merit')}</dd>
                  </div>
                  <div>
                    <dt>{t('evidence.sources')}</dt>
                    <dd>
                      {report.sources.length > 0 ? (
                        <ul className="source-list">
                          {report.sources.map((source, index) => (
                            <li key={`${source}-${index}`}>
                              <SourceReference sourceRef={source} locale={locale} />
                            </li>
                          ))}
                        </ul>
                      ) : (
                        t('evidence.noSources')
                      )}
                    </dd>
                  </div>
                </dl>
                <p className="note">{t('evidence.roundingNote')}</p>
              </section>

              <section className="result-section" aria-labelledby="field-evidence-heading">
                <h3 id="field-evidence-heading">{t('fieldEvidence.title')}</h3>
                <p>{t('fieldEvidence.intro')}</p>
                {isStale && <p className="note">{t('fieldEvidence.stale')}</p>}
                {provenanceParts.length > 0 ? (
                  <div className="field-evidence-grid">
                    {provenanceParts.map(({ key, part }) => (
                      <article className="field-evidence-card" key={key}>
                        <h4>{part.label[locale]}</h4>
                        <p className="field-evidence-category">
                          {t(CATEGORY_MESSAGE[part.category])}
                        </p>
                        {Object.keys(part.evidence).length > 0 ? (
                          <dl className="field-evidence-list">
                            {Object.entries(part.evidence).map(([field, provenance]) => (
                              <div key={field}>
                                <dt>
                                  <code>{field}</code>
                                </dt>
                                <dd>
                                  <span
                                    className={`provenance-kind provenance-${provenance.kind}`}
                                  >
                                    {t(PROVENANCE_MESSAGE[provenance.kind])}
                                  </span>
                                  {provenance.sourceRefs.length > 0 && (
                                    <ul className="source-list">
                                      {provenance.sourceRefs.map((sourceRef) => (
                                        <li key={sourceRef}>
                                          <SourceReference
                                            sourceRef={sourceRef}
                                            locale={locale}
                                          />
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  {provenance.assumptionIds.length > 0 && (
                                    <p className="assumption-ids">
                                      <span>{t('fieldEvidence.assumptions')}: </span>
                                      {provenance.assumptionIds.map((assumptionId) => (
                                        <code key={assumptionId}>{assumptionId}</code>
                                      ))}
                                    </p>
                                  )}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        ) : (
                          <p>{t('fieldEvidence.noFields')}</p>
                        )}
                      </article>
                    ))}
                  </div>
                ) : (
                  <p>{t('fieldEvidence.noFields')}</p>
                )}
              </section>
            </>
          )}
        </section>
      </main>
    </div>
  )
}
