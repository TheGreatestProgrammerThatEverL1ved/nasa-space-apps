import type { Locale } from '../engine/types'
import { en, type MessageKey } from './en'
import { ua } from './ua'

export type { MessageKey }

/** Both dictionaries expose the same compile-time key set. */
export const MESSAGES: Readonly<Record<Locale, Readonly<Record<MessageKey, string>>>> = {
  en,
  ua,
}

export type MessageValues = Readonly<Record<string, string | number>>

export function hasMessage(key: string): key is MessageKey {
  return Object.prototype.hasOwnProperty.call(en, key)
}

export function translate(locale: Locale, key: MessageKey, values?: MessageValues): string {
  const template = MESSAGES[locale][key] ?? en[key]
  if (!values) return template
  return template.replace(/\{([A-Za-z0-9_-]+)\}/g, (match, name: string) => {
    const value = values[name]
    return value === undefined ? match : String(value)
  })
}

/** Dynamic report keys (warnings, assumptions, provenance) may be unknown. */
export function translateOptional(
  locale: Locale,
  key: string,
  fallback: string,
  values?: MessageValues,
): string {
  return hasMessage(key) ? translate(locale, key, values) : fallback
}

/** `ua` is the game's locale key; browsers use the standard `uk` tag. */
export function localeTag(locale: Locale): string {
  return locale === 'ua' ? 'uk-UA' : 'en-US'
}

export function htmlLang(locale: Locale): string {
  return locale === 'ua' ? 'uk' : 'en'
}
