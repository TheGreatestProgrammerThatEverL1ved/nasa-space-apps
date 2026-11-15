import { CATALOG } from '../catalog'
import type { ArrayPart, Battery, Ground, Labels, Launcher, Radio } from '../../engine/types'
import { fictional, NEW_BUSES } from './catalog'

const rideshare = CATALOG.launchers[0]!
const station = CATALOG.grounds[1]!
const buses = [...rideshare.busIds, ...NEW_BUSES.map(part => part.id)]

export const PLAYER_LAUNCH_BOOKINGS: readonly Launcher[] = [
  fictional(rideshare, {
    id: 'lv-shared-24',
    label: { en: 'Economy 24 kg rideshare', ua: 'Економний спільний слот 24 кг' },
    costUsd: 355_000, slotLimitKg: 24, adapterKg: 2.5, queueMonths: 13, busIds: buses,
  }),
  fictional(rideshare, {
    id: 'lv-express-30',
    label: { en: 'Express 30 kg rideshare', ua: 'Пріоритетний спільний слот 30 кг' },
    costUsd: 475_000, slotLimitKg: 30, adapterKg: 2, queueMonths: 4, busIds: buses,
  }),
]

export const OPERATIONS_GROUNDS: readonly Ground[] = [
  fictional(station, {
    id: 'gs-fast-local',
    label: { en: 'Fast local processing', ua: 'Швидка локальна обробка' },
    costUsd: 195_000, annualOpsUsd: 80_000, contactsPerDay: 6, lengthMin: 8, processingHours: 0.25,
  }),
  fictional(station, {
    id: 'gs-leased-nights',
    label: { en: 'Leased low-cost contacts', ua: 'Орендовані бюджетні сеанси' },
    costUsd: 95_000, annualOpsUsd: 45_000, contactsPerDay: 5, lengthMin: 10, processingHours: 1.25,
  }),
]

export const OPERATIONS_ARRAYS: readonly ArrayPart[] = [
  fictional(CATALOG.arrays[2]!, {
    id: 'arr-rigid-62',
    label: { en: '62 W rigid wings', ua: 'Жорсткі крила 62 Вт' },
    massKg: 1.1, bolW: 62, costUsd: 205_000, annualLoss: 0.02, busIds: buses,
  }),
]

export const OPERATIONS_BATTERIES: readonly Battery[] = [
  fictional(CATALOG.batteries[1]!, {
    id: 'bat-pulse-105',
    label: { en: '105 Wh high-discharge pack', ua: 'Блок 105 Вт·год з високою потужністю' },
    massKg: 1.02, nominalWh: 105, dischargeW: 145, costUsd: 51_000,
  }),
  fictional(CATALOG.batteries[1]!, {
    id: 'bat-reserve-145',
    label: { en: '145 Wh reserve pack', ua: 'Резервний блок 145 Вт·год' },
    massKg: 1.3, nominalWh: 145, dischargeW: 76, costUsd: 50_000,
  }),
]

export const OPERATIONS_RADIOS: readonly Radio[] = [
  fictional(CATALOG.radios[1]!, {
    id: 'rf-s-efficient',
    label: { en: '8 Mbps low-power S-band', ua: 'Малопотужний S-діапазон 8 Мбіт/с' },
    massKg: 0.38, lineMbps: 8, dcW: 8, costUsd: 102_000,
  }),
]

export const OPERATIONS_PARTS = [
  ...PLAYER_LAUNCH_BOOKINGS, ...OPERATIONS_GROUNDS, ...OPERATIONS_ARRAYS, ...OPERATIONS_BATTERIES, ...OPERATIONS_RADIOS,
]

export const OPERATIONS_TRADEOFFS: Readonly<Record<string, Labels>> = {
  'lv-shared-24': {
    en: 'Lower price, smaller booked mass and a longer queue.',
    ua: 'Нижча ціна, менша допустима маса й довша черга.',
  },
  'lv-express-30': {
    en: 'A shorter queue costs more and leaves less room than the 50 kg booking.',
    ua: 'Коротша черга коштує дорожче й залишає менший запас маси, ніж слот на 50 кг.',
  },
  'gs-fast-local': {
    en: 'Quick processing with fewer contacts than a full network.',
    ua: 'Швидка обробка, але сеансів менше, ніж у повній мережі.',
  },
  'gs-leased-nights': {
    en: 'Low setup and operating fees, with longer waits between contacts.',
    ua: 'Невисокі витрати на підготовку й роботу, але довше чекати між сеансами.',
  },
  'arr-rigid-62': {
    en: 'Stable generation over the mission, with more mass and cost than the 55 W array.',
    ua: 'Стабільніша генерація впродовж місії, але більші маса й ціна, ніж у батареї 55 Вт.',
  },
  'bat-pulse-105': {
    en: 'More peak discharge power, with less stored energy than the 145 Wh pack.',
    ua: 'Більша пікова потужність розряду, але менший запас енергії, ніж у блока 145 Вт·год.',
  },
  'bat-reserve-145': {
    en: 'More eclipse reserve than the 105 Wh pack, with less peak power.',
    ua: 'Більший запас на час затемнення, ніж у блока 105 Вт·год, але менша пікова потужність.',
  },
  'rf-s-efficient': {
    en: 'Draws less power than the 12 Mbps S-band package, with less throughput.',
    ua: 'Споживає менше, ніж комплект S-діапазону 12 Мбіт/с, але передає повільніше.',
  },
}
