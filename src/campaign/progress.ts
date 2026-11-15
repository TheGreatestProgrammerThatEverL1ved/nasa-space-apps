/** Local progression only. Credits never alter engineering USD or evaluator gates. */
import type { EvaluationContext, EvaluationReport, Labels, MissionConfiguration } from '../engine/types'
import { MISSIONS } from '../data/scenarios'
import { configurationKey, evaluateMission } from '../engine/evaluate'

/** Retain the old key; migrate in memory, write v3 on the next progress change. */
export const CAMPAIGN_STORAGE_KEY = 'mission-forge.campaign.v1'
export const CAMPAIGN_CONTRACTS = [
  { missionId: 'wildfire', prerequisites: [], requiredParts: [], reward: 120 },
  { missionId: 'urban-heat', prerequisites: ['wildfire'], requiredParts: [], reward: 140 },
  { missionId: 'visible-mapping', prerequisites: ['wildfire'], requiredParts: ['pl-visible-35'], reward: 180 },
  { missionId: 'packet-relay', prerequisites: ['wildfire'], requiredParts: ['pl-relay', 'rf-x'], reward: 200 },
] as const
type ShopItem = {
  readonly partId: string; readonly field: Exclude<keyof MissionConfiguration, 'scenarioId'>
  readonly credits: number; readonly tradeoff: Labels; readonly prerequisiteId: string
}
export const CAMPAIGN_SHOP: readonly ShopItem[] = [
  { partId: 'rf-x', field: 'radioId', prerequisiteId: 'rf-s', credits: 100, tradeoff: {
    en: 'Fast downlink: enables the two-hop relay and cheaper urban single-station service. Higher radio load and engineering cost.',
    ua: 'Швидка передача: відкриває дволінійну ретрансляцію й дешевшу одну станцію для міста. Вищі навантаження радіо та інженерна вартість.',
  } },
  { partId: 'arr-deploy-xl', field: 'arrayId', prerequisiteId: 'arr-deploy-l', credits: 120, tradeoff: {
    en: '135 W power alternative: supports the WF-C / urban S-band kit. More energy but tight mass and higher USD cost. Optional; refundable if you need credits for later payloads.',
    ua: 'Альтернатива 135 Вт: підтримує комплект WF-C / міський S-діапазон. Більше енергії, але мала масова межа й вища вартість USD. Необов’язкова; можна повернути для фінансування наступних приладів.',
  } },
  { partId: 'pl-visible-35', field: 'payloadId', prerequisiteId: 'pl-thermal', credits: 100, tradeoff: {
    en: 'Unlocks Trace the Shoreline. The 35 mm visible analogue balances corridor width and detail; it cannot replace a thermal or relay payload.',
    ua: 'Відкриває «Окресліть берегову лінію». Видимий аналог 35 мм збалансовує ширину й деталі; не замінює тепловий чи ретрансляційний прилад.',
  } },
  { partId: 'pl-relay', field: 'payloadId', prerequisiteId: 'rf-x', credits: 140, tradeoff: {
    en: 'Receive/store package for Carry the Signal. Needs owned X-band as well; no camera or optical geometry. Refund an optional purchase if necessary.',
    ua: 'Пакет приймання/зберігання для «Доставте сигнал». Також потрібен власний X-діапазон; без камери й оптичної геометрії. За потреби поверніть необов’язкову покупку.',
  } },
]
export const CAMPAIGN_FOUNDATIONS = [
  { partId: 'bus-12u', field: 'busId', prerequisiteId: null, tradeoff: {
    en: '12U platform: fits the thermal camera and supports every shipped passing kit. Smaller buses remain free teaching choices.',
    ua: 'Платформа 12U: вміщує теплову камеру й підтримує всі наявні прохідні комплекти. Менші платформи лишаються безплатними навчальними варіантами.',
  } },
  { partId: 'arr-deploy-l', field: 'arrayId', prerequisiteId: 'bus-12u', tradeoff: {
    en: '55 W foundation: light deployable wings for the starter and X-band kits. Compare generation against load before fitting.',
    ua: 'Основа 55 Вт: легкі розкладні крила для початкового комплекту й X-діапазону. Перед установленням порівняйте генерацію з навантаженням.',
  } },
  { partId: 'rf-s', field: 'radioId', prerequisiteId: 'bus-12u', tradeoff: {
    en: '5 Mbps foundation: passes wildfire with frequent service. A faster radio cannot create missing ground contacts.',
    ua: 'Основа 5 Мбіт/с: проходить лісову місію з частим обслуговуванням. Швидше радіо не створює відсутніх наземних контактів.',
  } },
  { partId: 'pl-thermal', field: 'payloadId', prerequisiteId: 'bus-12u', tradeoff: {
    en: 'LWIR foundation: enables wildfire and urban heat. Visible mapping and packet relay need different payloads.',
    ua: 'Теплова основа LWIR: для лісової та міської місій. Видиме картографування й передавання пакетів потребують інших приладів.',
  } },
] as const
export const CAMPAIGN_UPGRADES = [...CAMPAIGN_FOUNDATIONS, ...CAMPAIGN_SHOP]
export interface CampaignProgress {
  readonly version: 3
  readonly completedMissionIds: readonly string[]
  readonly unlockedPartIds: readonly string[]
  /** Per-ID settled amounts, not today's price table. No retroactive award top-ups. */
  readonly awards: Readonly<Record<string, number>>
  readonly paidParts: Readonly<Record<string, number>>
}
function snapshot(completed: readonly string[], unlocked: readonly string[], awards: Readonly<Record<string, number>>, paidParts: Readonly<Record<string, number>>): CampaignProgress {
  return Object.freeze({ version: 3, completedMissionIds: Object.freeze([...new Set(completed)]), unlockedPartIds: Object.freeze([...new Set(unlocked)]),
    awards: Object.freeze({ ...awards }), paidParts: Object.freeze({ ...paidParts }) })
}
export const EMPTY_CAMPAIGN = snapshot([], [], {}, {})
export function campaignCredits(progress: CampaignProgress): number {
  return progress.completedMissionIds.reduce((sum, id) => sum + progress.awards[id]!, 0)
    - progress.unlockedPartIds.reduce((sum, id) => sum + progress.paidParts[id]!, 0)
}
export function campaignOwnsPart(progress: CampaignProgress, partId: string): boolean {
  return CAMPAIGN_FOUNDATIONS.some(p => p.partId === partId) || progress.unlockedPartIds.includes(partId)
}
export function campaignPurchaseReady(progress: CampaignProgress, partId: string): boolean {
  const item = CAMPAIGN_SHOP.find(p => p.partId === partId)
  return !!item && campaignOwnsPart(progress, item.prerequisiteId)
}
export function campaignPrerequisitesMet(progress: CampaignProgress, missionId: string): boolean {
  const contract = CAMPAIGN_CONTRACTS.find(c => c.missionId === missionId)
  return !!contract && contract.prerequisites.every(id => progress.completedMissionIds.includes(id))
}
export function campaignContractAvailable(progress: CampaignProgress, missionId: string): boolean {
  const contract = CAMPAIGN_CONTRACTS.find(c => c.missionId === missionId)
  return !!contract && campaignPrerequisitesMet(progress, missionId) && contract.requiredParts.every(id => progress.unlockedPartIds.includes(id))
}
export function campaignComplete(progress: CampaignProgress): boolean {
  return CAMPAIGN_CONTRACTS.every(c => progress.completedMissionIds.includes(c.missionId))
}
/** Historical v1/v2 used a LINEAR 100-credit economy. Never validate it against today's tree. */
export function parseCampaign(raw: string | null): CampaignProgress {
  if (raw === null) return EMPTY_CAMPAIGN
  try {
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object' || Array.isArray(value)) return EMPTY_CAMPAIGN
    const data = value as Record<string, unknown>
    if (![1, 2, 3].includes(data.version as number) || !Array.isArray(data.completedMissionIds) || !Array.isArray(data.unlockedPartIds)) return EMPTY_CAMPAIGN
    const missionIds: readonly string[] = data.version === 1 ? ['wildfire', 'urban-heat'] : CAMPAIGN_CONTRACTS.map(c => c.missionId)
    const partIds: readonly string[] = data.version === 1 ? ['rf-x', 'arr-deploy-xl'] : CAMPAIGN_SHOP.map(p => p.partId)
    if (!data.completedMissionIds.every(id => typeof id === 'string' && missionIds.includes(id))
      || !data.unlockedPartIds.every(id => typeof id === 'string' && partIds.includes(id))) return EMPTY_CAMPAIGN
    const completed = [...new Set(data.completedMissionIds)] as string[]
    const unlocked = [...new Set(data.unlockedPartIds)] as string[]
    let awards: Readonly<Record<string, number>>, paidParts: Readonly<Record<string, number>>
    if (data.version !== 3) {
      const historicalOrder = ['wildfire', 'urban-heat', 'visible-mapping', 'packet-relay']
      if (!completed.every(id => historicalOrder.slice(0, historicalOrder.indexOf(id)).every(previous => completed.includes(previous)))) return EMPTY_CAMPAIGN
      awards = Object.fromEntries(completed.map(id => [id, 100]))
      paidParts = Object.fromEntries(unlocked.map(id => [id, 100]))
    } else {
      const validLedger = (ledger: unknown, ids: readonly string[], current: (id: string) => number): ledger is Record<string, number> =>
        !!ledger && typeof ledger === 'object' && !Array.isArray(ledger)
        && Object.keys(ledger).length === ids.length
        && ids.every(id => Object.hasOwn(ledger, id) && [100, current(id)].includes((ledger as Record<string, number>)[id]!))
      if (!validLedger(data.awards, completed, id => CAMPAIGN_CONTRACTS.find(c => c.missionId === id)!.reward)
        || !validLedger(data.paidParts, unlocked, id => CAMPAIGN_SHOP.find(p => p.partId === id)!.credits)) return EMPTY_CAMPAIGN
      awards = data.awards; paidParts = data.paidParts
    }
    const progress = snapshot(completed, unlocked, awards, paidParts)
    if (!progress.completedMissionIds.every(id => campaignPrerequisitesMet(progress, id))) return EMPTY_CAMPAIGN
    return campaignCredits(progress) >= 0 ? progress : EMPTY_CAMPAIGN
  } catch { return EMPTY_CAMPAIGN }
}
export function campaignOwnsConfiguration(progress: CampaignProgress, configuration: MissionConfiguration): boolean {
  return CAMPAIGN_SHOP.every(p => !Object.values(configuration).includes(p.partId) || progress.unlockedPartIds.includes(p.partId))
}
/** Call only on fresh player Run. Rebind/re-evaluate against the CURRENT inventory to reject stale or spoofed reports. */
export function awardCampaignPass(progress: CampaignProgress, report: EvaluationReport, missionId: string): CampaignProgress {
  if (report.origin !== 'evaluator' || report.outcome !== 'MODEL_PASS_PROVISIONAL'
    || report.validation.kind !== 'valid' || !report.config || report.config.scenarioId !== missionId
    || progress.completedMissionIds.includes(missionId) || !campaignContractAvailable(progress, missionId)
    || !campaignOwnsConfiguration(progress, report.config)) return progress
  const mission = MISSIONS.find(m => m.id === missionId)
  if (!mission) return progress
  const context = campaignContext(mission.context, progress)
  if (report.configurationKey !== configurationKey(report.config, context)) return progress
  const current = evaluateMission(report.config, context)
  if (current.outcome !== 'MODEL_PASS_PROVISIONAL' || current.validation.kind !== 'valid') return progress
  const reward = CAMPAIGN_CONTRACTS.find(c => c.missionId === missionId)!.reward
  return snapshot([...progress.completedMissionIds, missionId], progress.unlockedPartIds, { ...progress.awards, [missionId]: reward }, progress.paidParts)
}
export function buyCampaignPart(progress: CampaignProgress, partId: string): CampaignProgress {
  const part = CAMPAIGN_SHOP.find(p => p.partId === partId)
  if (!part || !campaignPurchaseReady(progress, partId) || progress.unlockedPartIds.includes(partId) || campaignCredits(progress) < part.credits) return progress
  return snapshot(progress.completedMissionIds, [...progress.unlockedPartIds, partId], progress.awards, { ...progress.paidParts, [partId]: part.credits })
}
/** Full refund is deliberate reversible progression; no allowed purchase order can soft-lock the campaign. */
export function refundCampaignPart(progress: CampaignProgress, partId: string): CampaignProgress {
  if (!CAMPAIGN_SHOP.some(p => p.partId === partId) || !progress.unlockedPartIds.includes(partId)) return progress
  const paidParts = Object.fromEntries(Object.entries(progress.paidParts).filter(([id]) => id !== partId))
  return snapshot(progress.completedMissionIds, progress.unlockedPartIds.filter(id => id !== partId), progress.awards, paidParts)
}
export function campaignContext(context: EvaluationContext, progress: CampaignProgress): EvaluationContext {
  const available = (id: string) => !CAMPAIGN_SHOP.some(p => p.partId === id) || progress.unlockedPartIds.includes(id)
  return { ...context, catalogRevision: `${context.catalogRevision}:campaign:${[...progress.unlockedPartIds].sort().join(',') || 'starter'}`,
    catalog: { ...context.catalog, arrays: context.catalog.arrays.filter(p => available(p.id)), radios: context.catalog.radios.filter(p => available(p.id)),
      payloads: context.catalog.payloads.filter(p => available(p.id)),
      ...(context.catalog.relayPayloads ? { relayPayloads: context.catalog.relayPayloads.filter(p => available(p.id)) } : {}),
    } }
}
