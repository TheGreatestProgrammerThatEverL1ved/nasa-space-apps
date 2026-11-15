/**
 * Presentation-only appearance registry for the orbital preview.
 * Never used by the evaluator; no physics, thresholds or catalog data changes.
 * Every id below is a selectable id from the frozen catalog. Values are visual
 * parameters, not flight claims. `nominalWh`/`focalMm` only annotate the drawing.
 */
import type { Labels, MissionConfiguration } from '../../engine/types'

export type Vec3 = readonly [number, number, number]

export interface AppearanceBase {
  readonly id: string
  readonly label: Labels
  readonly short: string
  readonly accent: string
}

export interface BusAppearance extends AppearanceBase {
  readonly kind: 'bus'
  readonly units: 3 | 6 | 12
  /** Visual proportions (x width, y height, z depth), not metres. */
  readonly size: Vec3
  readonly railColor: string
  readonly goldFoil: boolean
  readonly radiatorCells: number
  readonly bands: number
}

export interface ArrayAppearance extends AppearanceBase {
  readonly kind: 'array'
  readonly mount: 'body' | 'deploy'
  readonly span: number
  readonly chord: number
  readonly segments: number
  readonly rows: number
  readonly cols: number
  readonly yoke: number
}

export interface BatteryAppearance extends AppearanceBase {
  readonly kind: 'battery'
  /** Mirrors the frozen catalog for the cut-away annotation only. */
  readonly nominalWh: number
  /** Visual pack extent (x, y, z) before bus-bay clamping. */
  readonly pack: Vec3
}

export interface RadioAppearance extends AppearanceBase {
  readonly kind: 'radio'
  readonly band: 'UHF' | 'S' | 'X'
  readonly antenna: 'whip' | 'dish-small' | 'dish-large'
  readonly mast: number
  readonly dishRadius: number
  readonly coils: number
}

export interface PayloadAppearance extends AppearanceBase {
  readonly kind: 'payload'
  readonly optics: 'thermal' | 'visible' | 'relay'
  readonly barrelLength: number
  readonly barrelRadius: number
  readonly rings: number
  readonly lensTone: string
  readonly focalMm?: number
  readonly buffer?: Vec3
}

export interface ExternalAppearance extends AppearanceBase {
  readonly kind: 'external'
  readonly role: 'ground' | 'orbit' | 'launcher'
  readonly note: Labels
}

export interface UnknownAppearance extends AppearanceBase {
  readonly kind: 'unknown'
  readonly note: Labels
}

export type Appearance =
  | BusAppearance
  | ArrayAppearance
  | BatteryAppearance
  | RadioAppearance
  | PayloadAppearance
  | ExternalAppearance
  | UnknownAppearance

const en = (value: string): Labels => ({ en: value, ua: value })

export const UNKNOWN_APPEARANCE: UnknownAppearance = {
  kind: 'unknown',
  id: 'unknown',
  label: { en: 'Unrecognized hardware', ua: 'Невідоме обладнання' },
  short: '?',
  accent: '#d9663a',
  note: {
    en: 'Id absent from the appearance registry; neutral schematic shown.',
    ua: 'Ідентифікатор відсутній у реєстрі вигляду; показано нейтральну схему.',
  },
}

export const APPEARANCES: Readonly<Record<string, Appearance>> = {
  'bus-3u': {
    kind: 'bus', id: 'bus-3u', units: 3,
    label: { en: '3U bus', ua: 'Платформа 3U' }, short: '3U', accent: '#5fd0c1',
    size: [0.62, 0.62, 1.1], railColor: '#8d9aa4', goldFoil: true, radiatorCells: 3, bands: 2,
  },
  'bus-6u': {
    kind: 'bus', id: 'bus-6u', units: 6,
    label: { en: '6U bus', ua: 'Платформа 6U' }, short: '6U', accent: '#f8bc74',
    size: [0.8, 0.8, 1.36], railColor: '#9aa6ae', goldFoil: true, radiatorCells: 5, bands: 2,
  },
  'bus-12u': {
    kind: 'bus', id: 'bus-12u', units: 12,
    label: { en: '12U bus', ua: 'Платформа 12U' }, short: '12U', accent: '#7db8e8',
    size: [1.02, 1.02, 1.74], railColor: '#b6c2c9', goldFoil: false, radiatorCells: 7, bands: 3,
  },
  'arr-body': {
    kind: 'array', id: 'arr-body', mount: 'body',
    label: { en: 'Body-mounted solar array', ua: 'Навісна сонячна батарея' }, short: 'BODY',
    accent: '#6f93a8', span: 0, chord: 0, segments: 0, rows: 6, cols: 4, yoke: 0,
  },
  'arr-deploy-m': {
    kind: 'array', id: 'arr-deploy-m', mount: 'deploy',
    label: { en: 'Medium deployable solar array', ua: 'Середня розсувна сонячна батарея' }, short: 'M',
    accent: '#79c7d8', span: 0.95, chord: 0.62, segments: 1, rows: 3, cols: 5, yoke: 0.18,
  },
  'arr-deploy-l': {
    kind: 'array', id: 'arr-deploy-l', mount: 'deploy',
    label: { en: 'Large deployable solar array', ua: 'Велика розсувна сонячна батарея' }, short: 'L',
    accent: '#8fb3e0', span: 1.55, chord: 0.7, segments: 2, rows: 3, cols: 7, yoke: 0.22,
  },
  'arr-deploy-xl': {
    kind: 'array', id: 'arr-deploy-xl', mount: 'deploy',
    label: { en: 'Extra-large deployable solar array', ua: 'Надвелика розсувна сонячна батарея' }, short: 'XL',
    accent: '#f0c987', span: 2.25, chord: 0.8, segments: 3, rows: 3, cols: 9, yoke: 0.26,
  },
  'bat-s': {
    kind: 'battery', id: 'bat-s', nominalWh: 40,
    label: { en: 'Small battery', ua: 'Мала батарея' }, short: 'BAT-S', accent: '#7fd2b8',
    pack: [0.18, 0.11, 0.25],
  },
  'bat-m': {
    kind: 'battery', id: 'bat-m', nominalWh: 120,
    label: { en: 'Medium battery', ua: 'Середня батарея' }, short: 'BAT-M', accent: '#f2c368',
    pack: [0.23, 0.14, 0.32],
  },
  'bat-l': {
    kind: 'battery', id: 'bat-l', nominalWh: 300,
    label: { en: 'Large battery', ua: 'Велика батарея' }, short: 'BAT-L', accent: '#f2995c',
    pack: [0.32, 0.2, 0.47],
  },
  'rf-uhf': {
    kind: 'radio', id: 'rf-uhf', band: 'UHF', antenna: 'whip',
    label: { en: 'UHF downlink package', ua: 'UHF-комплект передавання' }, short: 'UHF',
    accent: '#9bcf7f', mast: 0.72, dishRadius: 0, coils: 3,
  },
  'rf-s': {
    kind: 'radio', id: 'rf-s', band: 'S', antenna: 'dish-small',
    label: { en: 'S-band downlink package', ua: 'S-діапазонний комплект передавання' }, short: 'S',
    accent: '#7fb9e8', mast: 0.34, dishRadius: 0.22, coils: 1,
  },
  'rf-x': {
    kind: 'radio', id: 'rf-x', band: 'X', antenna: 'dish-large',
    label: { en: 'X-band downlink package', ua: 'X-діапазонний комплект передавання' }, short: 'X',
    accent: '#f0b07a', mast: 0.42, dishRadius: 0.33, coils: 1,
  },
  'pl-thermal': {
    kind: 'payload', id: 'pl-thermal', optics: 'thermal',
    label: { en: 'LWIR thermal-anomaly camera', ua: 'Тепловізійна LWIR-камера' }, short: 'LWIR',
    accent: '#f0a24b', barrelLength: 0.52, barrelRadius: 0.21, rings: 3, lensTone: '#f0a24b',
  },
  'pl-visible-8': {
    kind: 'payload', id: 'pl-visible-8', optics: 'visible', focalMm: 8,
    label: { en: 'Visible Bayer camera • 8 mm', ua: 'Видима Bayer-камера • 8 мм' }, short: 'VIS 8',
    accent: '#7fd2e8', barrelLength: 0.3, barrelRadius: 0.13, rings: 2, lensTone: '#7fd2e8',
  },
  'pl-visible-35': {
    kind: 'payload', id: 'pl-visible-35', optics: 'visible', focalMm: 35,
    label: { en: 'Visible Bayer camera • 35 mm', ua: 'Видима Bayer-камера • 35 мм' }, short: 'VIS 35',
    accent: '#7fd2e8', barrelLength: 0.42, barrelRadius: 0.12, rings: 3, lensTone: '#8fe3c8',
  },
  'pl-visible-70': {
    kind: 'payload', id: 'pl-visible-70', optics: 'visible', focalMm: 70,
    label: { en: 'Visible Bayer camera • 70 mm', ua: 'Видима Bayer-камера • 70 мм' }, short: 'VIS 70',
    accent: '#7fd2e8', barrelLength: 0.62, barrelRadius: 0.105, rings: 4, lensTone: '#a9d7ff',
  },
  'pl-relay': {
    kind: 'payload', id: 'pl-relay', optics: 'relay',
    label: { en: 'Packet receive / store package', ua: 'Пакет приймання / зберігання' }, short: 'RELAY',
    accent: '#f0c060', barrelLength: 0.2, barrelRadius: 0.16, rings: 1, lensTone: '#f0c060',
    buffer: [0.5, 0.34, 0.38],
  },
  'gs-single': {
    kind: 'external', id: 'gs-single', role: 'ground', short: 'GS',
    label: { en: 'Single ground station', ua: 'Одна наземна станція' }, accent: '#8fae9b',
    note: { en: 'Ground segment: not mounted on the spacecraft.', ua: 'Наземний сегмент: не встановлюється на апарат.' },
  },
  'gs-network': {
    kind: 'external', id: 'gs-network', role: 'ground', short: 'NET',
    label: { en: 'Ground station network', ua: 'Мережа наземних станцій' }, accent: '#8fae9b',
    note: { en: 'Ground segment: not mounted on the spacecraft.', ua: 'Наземний сегмент: не встановлюється на апарат.' },
  },
  'gs-service': {
    kind: 'external', id: 'gs-service', role: 'ground', short: 'SVC',
    label: { en: 'Ground station service', ua: 'Сервіс наземних станцій' }, accent: '#8fae9b',
    note: { en: 'Ground segment: not mounted on the spacecraft.', ua: 'Наземний сегмент: не встановлюється на апарат.' },
  },
  'orb-sso-low': {
    kind: 'external', id: 'orb-sso-low', role: 'orbit', short: 'SSO',
    label: { en: '500 km Sun-synchronous orbit', ua: 'Сонячно-синхронна орбіта 500 км' }, accent: '#6f9fd8',
    note: { en: 'Orbit selection: drawn as the Earth limb only.', ua: 'Вибір орбіти: показано лише краєм Землі.' },
  },
  'lv-heavy': {
    kind: 'external', id: 'lv-heavy', role: 'launcher', short: 'LV',
    label: { en: '50 kg SSO rideshare slot', ua: 'Слот rideshare 50 кг на SSO' }, accent: '#d99a6c',
    note: { en: 'Launch booking: shown only as a plume in launch mode.', ua: 'Бронювання запуску: показано лише факелом у режимі запуску.' },
  },
}

export function hasAppearance(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(APPEARANCES, id)
}

export function getAppearance(id: string | undefined): Appearance {
  if (!id) return UNKNOWN_APPEARANCE
  return APPEARANCES[id] ?? UNKNOWN_APPEARANCE
}

export const DEFAULT_BUS = APPEARANCES['bus-3u'] as BusAppearance
export const DEFAULT_ARRAY = APPEARANCES['arr-body'] as ArrayAppearance
export const DEFAULT_BATTERY = APPEARANCES['bat-s'] as BatteryAppearance
export const DEFAULT_RADIO = APPEARANCES['rf-uhf'] as RadioAppearance
export const DEFAULT_PAYLOAD = APPEARANCES['pl-thermal'] as PayloadAppearance

export function getBusAppearance(id?: string): BusAppearance {
  const found = getAppearance(id)
  return found.kind === 'bus' ? found : DEFAULT_BUS
}
export function getArrayAppearance(id?: string): ArrayAppearance {
  const found = getAppearance(id)
  return found.kind === 'array' ? found : DEFAULT_ARRAY
}
export function getBatteryAppearance(id?: string): BatteryAppearance {
  const found = getAppearance(id)
  return found.kind === 'battery' ? found : DEFAULT_BATTERY
}
export function getRadioAppearance(id?: string): RadioAppearance {
  const found = getAppearance(id)
  return found.kind === 'radio' ? found : DEFAULT_RADIO
}
export function getPayloadAppearance(id?: string): PayloadAppearance {
  const found = getAppearance(id)
  return found.kind === 'payload' ? found : DEFAULT_PAYLOAD
}

export interface CraftAppearance {
  readonly bus: BusAppearance
  readonly array: ArrayAppearance
  readonly battery: BatteryAppearance
  readonly radio: RadioAppearance
  readonly payload: PayloadAppearance
  readonly unknownIds: readonly string[]
}

export type CraftConfig = Pick<
  MissionConfiguration,
  'busId' | 'arrayId' | 'batteryId' | 'radioId' | 'payloadId'
>

export function resolveCraftAppearance(config: CraftConfig): CraftAppearance {
  const ids = [config.busId, config.arrayId, config.batteryId, config.radioId, config.payloadId]
  return {
    bus: getBusAppearance(config.busId),
    array: getArrayAppearance(config.arrayId),
    battery: getBatteryAppearance(config.batteryId),
    radio: getRadioAppearance(config.radioId),
    payload: getPayloadAppearance(config.payloadId),
    unknownIds: ids.filter(id => id !== '' && !hasAppearance(id)),
  }
}

/** Shared typed bus transform used by both the 3D scene and the SVG fallback. */
export interface BusTransform {
  readonly size: Vec3
  readonly half: Vec3
  readonly batteryBay: Vec3
  readonly wingY: number
  readonly wingRootX: number
  readonly radioX: number
  readonly radioZ: number
  readonly payloadBaseY: number
}

export function busTransform(id?: string): BusTransform {
  const bus = getBusAppearance(id)
  const [w, h, d] = bus.size
  return {
    size: bus.size,
    half: [w / 2, h / 2, d / 2],
    batteryBay: [w * 0.62, h * 0.56, d * 0.62],
    wingY: h * 0.08,
    wingRootX: w / 2 + 0.04,
    radioX: -w * 0.42,
    radioZ: d * 0.32,
    payloadBaseY: h / 2 + 0.03,
  }
}

/** Wing layout shared by both renderers so geometry stays in lock-step. */
export interface WingLayout {
  readonly mount: 'body' | 'deploy'
  readonly span: number
  readonly chord: number
  readonly segments: number
  readonly rows: number
  readonly cols: number
  readonly yoke: number
  readonly rootX: number
  readonly wingY: number
}

export function arrayTransform(arrayId?: string, busId?: string): WingLayout {
  const array = getArrayAppearance(arrayId)
  const bus = busTransform(busId)
  return {
    mount: array.mount,
    span: array.span,
    chord: array.chord,
    segments: array.segments,
    rows: array.rows,
    cols: array.cols,
    yoke: array.yoke,
    rootX: bus.wingRootX,
    wingY: bus.wingY,
  }
}

/** Battery cut-away transform: pack clamped to the actual bus bay. */
export interface BatteryTransform {
  readonly pack: Vec3
  readonly half: Vec3
  readonly anchorY: number
  readonly explodeX: number
  readonly nominalWh: number
}

export function batteryTransform(batteryId?: string, busId?: string): BatteryTransform {
  const battery = getBatteryAppearance(batteryId)
  const bus = busTransform(busId)
  const pack: Vec3 = [
    Math.min(battery.pack[0], bus.batteryBay[0] * 0.82),
    Math.min(battery.pack[1], bus.batteryBay[1] * 0.8),
    Math.min(battery.pack[2], bus.batteryBay[2] * 0.82),
  ]
  return {
    pack,
    half: [pack[0] / 2, pack[1] / 2, pack[2] / 2],
    anchorY: 0,
    explodeX: bus.half[0] + pack[0] / 2 + 0.26,
    nominalWh: battery.nominalWh,
  }
}

export interface PayloadTransform {
  readonly baseY: number
  readonly barrelLength: number
  readonly barrelRadius: number
  readonly rings: number
}

export function payloadTransform(payloadId?: string, busId?: string): PayloadTransform {
  const payload = getPayloadAppearance(payloadId)
  const bus = busTransform(busId)
  return {
    baseY: bus.payloadBaseY,
    barrelLength: payload.barrelLength,
    barrelRadius: payload.barrelRadius,
    rings: payload.rings,
  }
}

/** Deterministic PRNG for stars, so both renderers share the same sky. */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface Star {
  readonly x: number
  readonly y: number
  readonly r: number
  readonly a: number
}

export const STARFIELD: readonly Star[] = (() => {
  const random = createRandom(20261115)
  return Array.from({ length: 150 }, () => ({
    x: random(),
    y: random(),
    r: 0.35 + random() * 1.5,
    a: 0.2 + random() * 0.75,
  }))
})()

/**
 * Original, deliberately schematic equirectangular landmasses.
 * Coordinates live in a 1000 x 500 box; the 3D texture and SVG share them.
 * Not a cartographic dataset: no real coastline accuracy is claimed.
 */
export const EARTH_SCHEMATIC = {
  width: 1000,
  height: 500,
  land: [
    // North America
    'M112 152 C96 128 104 96 132 84 C158 72 188 70 214 82 C236 92 246 112 240 132 C234 152 214 160 202 176 C192 190 196 208 184 220 C172 232 150 232 138 218 C126 204 132 186 120 172 C112 162 116 158 112 152Z',
    // South America
    'M232 262 C250 256 268 266 276 284 C284 302 278 320 268 338 C258 356 250 378 238 392 C228 404 216 402 210 388 C204 374 208 356 204 340 C200 324 206 306 214 290 C220 276 224 266 232 262Z',
    // Africa
    'M444 176 C466 160 498 158 520 168 C542 178 552 200 548 224 C544 248 532 270 522 292 C512 314 500 336 484 348 C468 360 450 352 442 334 C434 316 438 296 432 278 C426 260 420 240 424 220 C428 200 432 184 444 176Z',
    // Eurasia
    'M478 104 C514 82 562 72 612 76 C662 80 706 72 748 82 C790 92 828 108 852 130 C876 152 872 174 848 182 C824 190 792 182 768 190 C744 198 728 214 704 218 C680 222 656 212 632 216 C608 220 590 234 568 228 C546 222 532 204 512 204 C492 204 478 216 462 210 C446 204 442 186 452 172 C462 158 458 122 478 104Z',
    // Australia
    'M776 316 C800 304 830 302 850 312 C870 322 876 344 864 362 C852 380 826 388 802 382 C778 376 762 358 762 340 C762 332 768 322 776 316Z',
    // Greenland
    'M298 84 C316 70 338 70 352 82 C366 94 366 114 352 128 C338 142 316 142 302 130 C288 118 286 96 298 84Z',
    // Antarctica (schematic cap)
    'M60 466 C180 452 320 456 440 462 C560 468 700 452 820 458 C900 462 950 470 960 486 L60 486Z',
  ],
  islands: [
    'M846 196 C856 188 866 192 870 202 C874 212 866 222 856 220 C846 218 840 206 846 196Z',
    'M552 312 C560 304 570 306 574 316 C578 326 572 340 562 344 C552 348 546 336 548 326 C549 320 548 316 552 312Z',
    'M452 128 C458 122 466 124 468 132 C470 140 462 146 456 142 C450 138 448 132 452 128Z',
    'M882 386 C892 378 902 382 906 392 C910 402 900 410 892 406 C884 402 878 392 882 386Z',
    'M618 300 C626 296 634 300 634 308 C634 316 624 320 618 314 C612 308 612 304 618 300Z',
  ],
} as const

export type CraftMode = 'menu' | 'hangar' | 'launch'

export const MODE_WORD: Readonly<Record<CraftMode, Labels>> = {
  menu: { en: 'MISSION SELECT', ua: 'ВИБІР МІСІЇ' },
  hangar: { en: 'HANGAR', ua: 'АНГАР' },
  launch: { en: 'LAUNCH', ua: 'ЗАПУСК' },
}

export const RENDERER_WORD: Readonly<Record<'webgl' | 'svg', Labels>> = {
  webgl: en('LIVE 3D'),
  svg: { en: 'SCHEMATIC', ua: 'СХЕМА' },
}
