import type { Locale, Metric } from '../engine/types'
import { localeTag, translate, type MessageKey } from '../i18n'

/** Empty strings mark units that are intentionally not displayed. */
const UNIT_MESSAGE_KEYS: Readonly<Record<string, MessageKey | ''>> = {
  kg: 'unit.kg',
  USD: 'unit.USD',
  'GB/day': 'unit.GBDay',
  'GB': 'unit.GB',
  h: 'unit.h',
  W: 'unit.W',
  Wh: 'unit.Wh',
  'Wh/orbit': 'unit.WhOrbit',
  m: 'unit.m',
  km: 'unit.km',
  month: 'unit.months',
  months: 'unit.months',
  arcsec: 'unit.arcsec',
  deg: 'unit.deg',
  '°': 'unit.deg',
  year: 'unit.years',
  years: 'unit.years',
  points: 'unit.points',
  min: 'unit.min',
  'm/s': 'unit.mps',
  '°/s': 'unit.degSec',
  ratio: 'unit.ratio',
  true: '',
  '': '',
}

type NumberStyle = {
  readonly minimumFractionDigits?: number
  readonly maximumFractionDigits: number
}

function styleFor(key: string | undefined, unit: string): NumberStyle {
  if (key === 'latencyHours' || key === 'WF-LATENCY') {
    return { minimumFractionDigits: 1, maximumFractionDigits: 1 }
  }
  switch (unit) {
    case 'USD':
      return { maximumFractionDigits: 0 }
    case 'kg':
    case 'GB/day':
    case 'GB':
      return { maximumFractionDigits: 3 }
    case 'h':
    case 'min':
    case 'year':
    case 'years':
      return { maximumFractionDigits: 1 }
    case 'm':
    case 'km':
    case 'W':
    case 'Wh':
    case 'Wh/orbit':
    case 'm/s':
    case '°/s':
      return { maximumFractionDigits: 2 }
    case 'month':
    case 'months':
    case '':
    case 'true':
      return { maximumFractionDigits: 0 }
    default:
      return { maximumFractionDigits: 2 }
  }
}

export function formatNumber(
  value: number,
  locale: Locale,
  key?: string,
  unit = '',
): string {
  if (!Number.isFinite(value)) return translate(locale, 'metric.unavailable')
  return new Intl.NumberFormat(localeTag(locale), styleFor(key, unit)).format(value)
}

export function formatUnit(unit: string, locale: Locale): string {
  const key = UNIT_MESSAGE_KEYS[unit]
  if (key === undefined) return unit
  return key ? translate(locale, key) : ''
}

export function formatValue(
  value: number,
  unit: string,
  locale: Locale,
  key?: string,
): string {
  if (!Number.isFinite(value)) return translate(locale, 'metric.unavailable')
  if (unit === 'ratio') {
    return new Intl.NumberFormat(localeTag(locale), {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value)
  }
  const number = formatNumber(value, locale, key, unit)
  const label = formatUnit(unit, locale)
  return label ? `${number} ${label}` : number
}

export function formatMetric(metric: Metric, locale: Locale, key?: string): string {
  switch (metric.kind) {
    case 'finite':
      return formatValue(metric.value, metric.unit, locale, key)
    case 'unknown':
      return translate(locale, 'metric.unavailable')
    case 'unbounded':
      return translate(locale, 'metric.unbounded')
    case 'not-applicable':
      return translate(locale, 'metric.notApplicable')
  }
}

export function formatLimit(
  limit: number,
  unit: string,
  locale: Locale,
  key?: string,
): string {
  return formatValue(limit, unit, locale, key)
}
