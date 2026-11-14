/** Optional local teaching progression. Credits never enter engineering budgets. */
import type { EvaluationContext, EvaluationReport, MissionConfiguration } from '../engine/types'

export const CAMPAIGN_STORAGE_KEY = 'mission-forge.campaign.v1'
export const CAMPAIGN_REWARD = 100
export const CAMPAIGN_SHOP = [
  { partId: 'rf-x', credits: 100 },
  { partId: 'arr-deploy-xl', credits: 100 },
] as const
const MISSION_IDS = ['wildfire', 'urban-heat'] as const

export interface CampaignProgress {
  readonly version: 1
  readonly completedMissionIds: readonly string[]
  readonly unlockedPartIds: readonly string[]
}
function snapshot(completed: readonly string[], unlocked: readonly string[]): CampaignProgress {
  return Object.freeze({
    version: 1,
    completedMissionIds: Object.freeze([...new Set(completed)]),
    unlockedPartIds: Object.freeze([...new Set(unlocked)]),
  })
}
export const EMPTY_CAMPAIGN = snapshot([], [])
export function campaignCredits(progress: CampaignProgress): number {
  return progress.completedMissionIds.length * CAMPAIGN_REWARD
    - CAMPAIGN_SHOP.filter(part => progress.unlockedPartIds.includes(part.partId)).reduce((sum, part) => sum + part.credits, 0)
}
/** Invalid/future saves are ignored; never touch unrelated browser storage. */
export function parseCampaign(raw: string | null): CampaignProgress {
  if (raw === null) return EMPTY_CAMPAIGN
  try {
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object' || Array.isArray(value)) return EMPTY_CAMPAIGN
    const data = value as Record<string, unknown>
    if (data.version !== 1 || !Array.isArray(data.completedMissionIds) || !Array.isArray(data.unlockedPartIds)) return EMPTY_CAMPAIGN
    if (!data.completedMissionIds.every(id => typeof id === 'string' && MISSION_IDS.includes(id as typeof MISSION_IDS[number]))
      || !data.unlockedPartIds.every(id => typeof id === 'string' && CAMPAIGN_SHOP.some(part => part.partId === id))) return EMPTY_CAMPAIGN
    const progress = snapshot(data.completedMissionIds, data.unlockedPartIds)
    if (progress.completedMissionIds.includes('urban-heat') && !progress.completedMissionIds.includes('wildfire')) return EMPTY_CAMPAIGN
    return campaignCredits(progress) >= 0 ? progress : EMPTY_CAMPAIGN
  } catch {
    return EMPTY_CAMPAIGN
  }
}
export function campaignOwnsConfiguration(progress: CampaignProgress, configuration: MissionConfiguration): boolean {
  return CAMPAIGN_SHOP.every(part => !Object.values(configuration).includes(part.partId) || progress.unlockedPartIds.includes(part.partId))
}
/** Called only with a fresh Run report, never from rendering a retained result. */
export function awardCampaignPass(progress: CampaignProgress, report: EvaluationReport, missionId: string): CampaignProgress {
  if (report.origin !== 'evaluator' || report.outcome !== 'MODEL_PASS_PROVISIONAL'
    || report.validation.kind !== 'valid' || !report.config || report.config.scenarioId !== missionId
    || !MISSION_IDS.includes(missionId as typeof MISSION_IDS[number])
    || progress.completedMissionIds.includes(missionId)
    || missionId === 'urban-heat' && !progress.completedMissionIds.includes('wildfire')
    || !campaignOwnsConfiguration(progress, report.config)) return progress
  return snapshot([...progress.completedMissionIds, missionId], progress.unlockedPartIds)
}
export function buyCampaignPart(progress: CampaignProgress, partId: string): CampaignProgress {
  const part = CAMPAIGN_SHOP.find(candidate => candidate.partId === partId)
  if (!part || progress.unlockedPartIds.includes(partId) || campaignCredits(progress) < part.credits) return progress
  return snapshot(progress.completedMissionIds, [...progress.unlockedPartIds, partId])
}
/** Availability changes; all original numeric checks, costs and policies remain. */
export function campaignContext(context: EvaluationContext, progress: CampaignProgress): EvaluationContext {
  const available = (id: string) => !CAMPAIGN_SHOP.some(part => part.partId === id) || progress.unlockedPartIds.includes(id)
  return {
    ...context,
    catalogRevision: `${context.catalogRevision}:campaign:${[...progress.unlockedPartIds].sort().join(',') || 'starter'}`,
    catalog: {
      ...context.catalog,
      arrays: context.catalog.arrays.filter(part => available(part.id)),
      radios: context.catalog.radios.filter(part => available(part.id)),
    },
  }
}
