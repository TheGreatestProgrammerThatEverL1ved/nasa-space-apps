/**
 * Player catalog revision 1. Fictional integrated engineering packages.
 * No vendor performance or qualification is claimed. Audited catalog is untouched.
 */
import { CATALOG } from '../catalog'
import { VISIBLE_PAYLOADS } from '../missions/visible'
import type { Part, Provenance, Labels } from '../../engine/types'

const labels = (en: string, ua: string): Labels => ({ en, ua })
export const PLAYER_PROVENANCE: Provenance = { kind: 'provisional', sourceRefs: ['docs/player-balance.md'],
  assumptionIds: ['fictional-player-hardware-r1', 'synthetic-engineering-allocation', 'integration-unverified'] }
const provenance=PLAYER_PROVENANCE
/** Even inherited numbers describe the fictional package, not the reference product. */
export function fictional<T extends Part>(base: T, changes: Partial<T>): T {
  const part = { ...base, ...changes }
  return { ...part, evidence: Object.fromEntries(Object.keys(part)
    .filter(key => !['id', 'category', 'label', 'evidence'].includes(key)).map(key => [key, provenance])),
    ...('jitterArcsec' in part ? { jitterArcsec: { state: 'known', value: part.id === 'bus-12u-vault' ? 3 : 7, provenance } } : {}),
  } as T
}
const bus = CATALOG.buses[2]!
const array = CATALOG.arrays[2]!
const battery = CATALOG.batteries[1]!
const radio = CATALOG.radios[1]!
const ground = CATALOG.grounds[1]!
export const NEW_BUSES = [
  fictional(bus, { id:'bus-12u-light', label:labels('12U skeletal bus','Полегшена платформа 12U'), massKg:9.8, costUsd:820000,
    housekeepingW:10, storageGB:64, errorDeg:.06, powerPackageLimitKg:7 }),
  fictional(bus, { id:'bus-12u-vault', label:labels('12U storage vault','Платформа-сховище 12U'), massKg:12.7, costUsd:1100000,
    housekeepingW:13, storageGB:256, errorDeg:.035 }),
]
const busIds = ['bus-6u','bus-12u',...NEW_BUSES.map(p=>p.id)]
export const NEW_ARRAYS = [
  fictional(array, {id:'arr-fold-40',label:labels('40 W fan wings','Віялові крила 40 Вт'),massKg:.64,costUsd:130000,bolW:40,busIds}),
  fictional(array, {id:'arr-fold-75',label:labels('75 W accordion wings','Крила-гармошки 75 Вт'),massKg:1.28,costUsd:235000,bolW:75,busIds}),
]
export const NEW_BATTERIES = [
  fictional(battery, {id:'bat-pack-80',label:labels('80 Wh twin pack','Подвійний блок 80 Вт·год'),massKg:.7,costUsd:33000,nominalWh:80,dischargeW:90}),
  fictional(battery, {id:'bat-pack-180',label:labels('180 Wh stacked pack','Ярусний блок 180 Вт·год'),massKg:1.6,costUsd:65000,nominalWh:180,dod:.78,dischargeW:160}),
]
export const NEW_RADIOS = [
  fictional(radio, {id:'rf-s-burst',label:labels('12 Mbps S-band horn','S-рупор 12 Мбіт/с'),massKg:.42,costUsd:115000,lineMbps:12,dcW:12}),
  fictional(radio, {id:'rf-x-eco',label:labels('50 Mbps compact X-band','Компактний X-діапазон 50 Мбіт/с'),massKg:.28,costUsd:150000,lineMbps:50,dcW:12,
    antenna:{kind:'directed',errorDeg:.5}}),
]
export const NEW_GROUNDS = [
  fictional(ground, {id:'gs-regional',label:labels('Regional long windows','Регіональні довгі сеанси'),costUsd:155000,annualOpsUsd:65000,contactsPerDay:8,lengthMin:8,processingHours:.8}),
  fictional(ground, {id:'gs-priority',label:labels('Priority processing','Пріоритетна обробка'),costUsd:300000,annualOpsUsd:95000,contactsPerDay:16,lengthMin:6,efficiency:.75,processingHours:.4}),
]
export const NEW_PAYLOADS = [
  fictional(CATALOG.payloads[0]!, {id:'pl-thermal-survey',label:labels('Wide LWIR survey camera','Ширококутна оглядова LWIR-камера'),massKg:3.4,costUsd:540000,
    activeW:22,peakW:24,widthPixels:800,referenceGSDm:180,crossFovDeg:14, busIds:busIds.filter(id=>id!=='bus-6u')}),
  fictional(VISIBLE_PAYLOADS[1], {id:'pl-visible-strip',label:labels('Wide visible strip camera','Широкосмугова видима камера'),massKg:.48,costUsd:175000,
    widthPixels:2560,referenceGSDm:55,crossFovDeg:2*Math.atan(2560*55/(2*650000))*180/Math.PI,
    busIds:['bus-3u',...busIds]}),
]
export const NEW_PARTS: readonly Part[] = [...NEW_BUSES,...NEW_ARRAYS,...NEW_BATTERIES,...NEW_RADIOS,...NEW_GROUNDS,...NEW_PAYLOADS]
export const PLAYER_TRADEOFFS: Readonly<Record<string, Labels>> = {
  'bus-12u-light': labels('Less mass and housekeeping; half the reference storage.','Менша маса й споживання; удвічі менше пам’яті за основу.'),
  'bus-12u-vault': labels('Twice the storage and steadier pointing; heavier and expensive.','Удвічі більше пам’яті й точніше наведення; більші маса й ціна.'),
  'arr-fold-40': labels('Light fan wings; recharge margin is tight with fast radios.','Легкі віялові крила; малий запас заряджання зі швидким радіо.'),
  'arr-fold-75': labels('More recharge headroom; extra hinges, mass and USD.','Більший запас заряджання; більше шарнірів, маси й USD.'),
  'bat-pack-80': labels('Lighter than 120 Wh; less eclipse reserve.','Легший за 120 Вт·год; менший запас на тінь.'),
  'bat-pack-180': labels('More eclipse energy and discharge power; adds mass.','Більше енергії в тіні й потужності розряду; додає маси.'),
  'rf-s-burst': labels('Faster S-band makes regional service viable; draws more than 5 Mbps.','Швидший S-діапазон підтримує регіональний сервіс; споживає більше за 5 Мбіт/с.'),
  'rf-x-eco': labels('Lower DC load than 100 Mbps; takes twice as long per batch.','Менше споживання за 100 Мбіт/с; пакет передається вдвічі довше.'),
  'gs-regional': labels('Cheaper long windows; longer waits. Relay timing is explicitly contracted.','Дешевші довгі сеанси; довше очікування. Час ретрансляції задано явно.'),
  'gs-priority': labels('Faster processing; higher setup and annual fees.','Швидша обробка; вищі початкові й річні платежі.'),
  'pl-thermal-survey': labels('Wider, finer thermal plan; more bytes, load and USD.','Ширший і детальніший тепловий план; більше даних, споживання й USD.'),
  'pl-visible-strip': labels('Wider corridor with more pixels; more data and USD.','Ширша смуга з більшою кількістю пікселів; більше даних і USD.'),
}
