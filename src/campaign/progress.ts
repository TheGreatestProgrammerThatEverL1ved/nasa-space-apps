/** Local progression only. Credits never alter engineering USD or evaluator gates. */
import type { EvaluationContext, EvaluationReport, Labels, MissionConfiguration } from '../engine/types'
import { MISSIONS } from '../data/scenarios'
import { configurationKey, evaluateMission } from '../engine/evaluate'

/** Retain the old key; parse v1 in place, write normalized v2 on the next progress change. */
export const CAMPAIGN_STORAGE_KEY = 'mission-forge.campaign.v1'
export const CAMPAIGN_REWARD = 100
export const CAMPAIGN_CONTRACTS = [
  { missionId: 'wildfire', prerequisites: [], requiredParts: [], reward: 100 },
  { missionId: 'urban-heat', prerequisites: ['wildfire'], requiredParts: [], reward: 100 },
  { missionId: 'visible-mapping', prerequisites: ['urban-heat'], requiredParts: ['pl-visible-35'], reward: 100 },
  { missionId: 'packet-relay', prerequisites: ['visible-mapping'], requiredParts: ['pl-relay', 'rf-x'], reward: 100 },
] as const
type ShopItem = {
  readonly partId: string; readonly field: Exclude<keyof MissionConfiguration, 'scenarioId'>
  readonly credits: number; readonly tradeoff: Labels
}
export const CAMPAIGN_SHOP: readonly ShopItem[] = [
  { partId: 'rf-x', field: 'radioId', credits: 100, tradeoff: {
    en: 'Fast downlink: enables the two-hop relay and cheaper urban single-station service. Higher radio load and engineering cost.',
    ua: 'Швидка передача: відкриває дволінійну ретрансляцію й дешевшу одну станцію для міста. Вищі навантаження радіо та інженерна вартість.',
  } },
  { partId: 'arr-deploy-xl', field: 'arrayId', credits: 100, tradeoff: {
    en: '135 W power alternative: supports the WF-C / urban S-band kit. More energy but tight mass and higher USD cost. Optional; refundable if you need credits for later payloads.',
    ua: 'Альтернатива 135 Вт: підтримує комплект WF-C / міський S-діапазон. Більше енергії, але мала масова межа й вища вартість USD. Необов’язкова; можна повернути для фінансування наступних приладів.',
  } },
  { partId: 'pl-visible-35', field: 'payloadId', credits: 100, tradeoff: {
    en: 'Unlocks Trace the Shoreline. The 35 mm visible analogue balances corridor width and detail; it cannot replace a thermal or relay payload.',
    ua: 'Відкриває «Окресліть берегову лінію». Видимий аналог 35 мм збалансовує ширину й деталі; не замінює тепловий чи ретрансляційний прилад.',
  } },
  { partId: 'pl-relay', field: 'payloadId', credits: 100, tradeoff: {
    en: 'Receive/store package for Carry the Signal. Needs owned X-band as well; no camera or optical geometry. Refund an optional purchase if necessary.',
    ua: 'Пакет приймання/зберігання для «Доставте сигнал». Також потрібен власний X-діапазон; без камери й оптичної геометрії. За потреби поверніть необов’язкову покупку.',
  } },
]
export interface CampaignProgress {
  readonly version: 2
  readonly completedMissionIds: readonly string[]
  readonly unlockedPartIds: readonly string[]
}
function snapshot(completed: readonly string[], unlocked: readonly string[]): CampaignProgress {
  return Object.freeze({ version: 2, completedMissionIds: Object.freeze([...new Set(completed)]), unlockedPartIds: Object.freeze([...new Set(unlocked)]) })
}
export const EMPTY_CAMPAIGN = snapshot([], [])
export function campaignCredits(progress: CampaignProgress): number {
  return CAMPAIGN_CONTRACTS.filter(c => progress.completedMissionIds.includes(c.missionId)).reduce((sum, c) => sum + c.reward, 0)
    - CAMPAIGN_SHOP.filter(p => progress.unlockedPartIds.includes(p.partId)).reduce((sum, p) => sum + p.credits, 0)
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
/** v1 entitlements and derived credit balance are unchanged; invalid/future saves stay ignored. */
export function parseCampaign(raw: string | null): CampaignProgress {
  if (raw === null) return EMPTY_CAMPAIGN
  try {
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object' || Array.isArray(value)) return EMPTY_CAMPAIGN
    const data = value as Record<string, unknown>
    if (![1, 2].includes(data.version as number) || !Array.isArray(data.completedMissionIds) || !Array.isArray(data.unlockedPartIds)) return EMPTY_CAMPAIGN
    const missionIds: readonly string[] = data.version === 1 ? ['wildfire', 'urban-heat'] : CAMPAIGN_CONTRACTS.map(c => c.missionId)
    const partIds: readonly string[] = data.version === 1 ? ['rf-x', 'arr-deploy-xl'] : CAMPAIGN_SHOP.map(p => p.partId)
    if (!data.completedMissionIds.every(id => typeof id === 'string' && missionIds.includes(id))
      || !data.unlockedPartIds.every(id => typeof id === 'string' && partIds.includes(id))) return EMPTY_CAMPAIGN
    const progress = snapshot(data.completedMissionIds, data.unlockedPartIds)
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
  return snapshot([...progress.completedMissionIds, missionId], progress.unlockedPartIds)
}
export function buyCampaignPart(progress: CampaignProgress, partId: string): CampaignProgress {
  const part = CAMPAIGN_SHOP.find(p => p.partId === partId)
  if (!part || progress.unlockedPartIds.includes(partId) || campaignCredits(progress) < part.credits) return progress
  return snapshot(progress.completedMissionIds, [...progress.unlockedPartIds, partId])
}
/** Full refund is deliberate reversible progression; no allowed purchase order can soft-lock the campaign. */
export function refundCampaignPart(progress: CampaignProgress, partId: string): CampaignProgress {
  if (!CAMPAIGN_SHOP.some(p => p.partId === partId) || !progress.unlockedPartIds.includes(partId)) return progress
  return snapshot(progress.completedMissionIds, progress.unlockedPartIds.filter(id => id !== partId))
}
export function campaignContext(context: EvaluationContext, progress: CampaignProgress): EvaluationContext {
  const available = (id: string) => !CAMPAIGN_SHOP.some(p => p.partId === id) || progress.unlockedPartIds.includes(id)
  return { ...context, catalogRevision: `${context.catalogRevision}:campaign:${[...progress.unlockedPartIds].sort().join(',') || 'starter'}`,
    catalog: { ...context.catalog, arrays: context.catalog.arrays.filter(p => available(p.id)), radios: context.catalog.radios.filter(p => available(p.id)),
      payloads: context.catalog.payloads.filter(p => available(p.id)),
      ...(context.catalog.relayPayloads ? { relayPayloads: context.catalog.relayPayloads.filter(p => available(p.id)) } : {}),
    } }
}
