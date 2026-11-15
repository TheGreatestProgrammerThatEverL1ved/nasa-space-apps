import { PLAYER_MISSIONS } from '../data/player/missions'
import { configurationKey, evaluateMission } from '../engine/evaluate'
import type { EvaluationContext, EvaluationReport } from '../engine/types'

export const EXPEDITION_KEY = 'mission-forge.expedition.v1'
export const EXPEDITION_STAGES = 3
export const STARTING_SUPPLIES = 3

type Profile = 'economy' | 'priority'
const EXPEDITION_MISSION_IDS = ['wildfire', 'urban-heat', 'visible-mapping', 'packet-relay'] as const
export interface ExpeditionLeg {
  readonly id: string
  readonly missionId: string
  readonly profile: Profile
  readonly budgetUsd: number
  readonly months: number
  readonly points: number
}
export interface ExpeditionRun {
  readonly version: 1
  readonly seed: number
  readonly attempts: readonly { readonly legId: string; readonly passed: boolean }[]
  readonly legId: string | null
}

export function createExpedition(seed: number): ExpeditionRun {
  return { version: 1, seed: seed >>> 0, attempts: [], legId: null }
}

export function expeditionSummary(run: ExpeditionRun) {
  const clears = run.attempts.filter(a => a.passed)
  const supplies = STARTING_SUPPLIES - (run.attempts.length - clears.length)
  return {
    stage: clears.length,
    supplies,
    points: clears.reduce((sum, entry) => sum + (entry.legId.endsWith(':priority') ? 2 : 1), 0),
    complete: clears.length === EXPEDITION_STAGES,
    exhausted: supplies === 0,
  }
}

export function expeditionOffers(run: ExpeditionRun): readonly ExpeditionLeg[] {
  const status = expeditionSummary(run)
  if (status.complete || status.exhausted) return []
  let random = run.seed
  const order = [...EXPEDITION_MISSION_IDS]
  for (let i = order.length - 1; i > 0; i--) {
    random = (Math.imul(random, 1664525) + 1013904223) >>> 0
    const j = Math.floor(random / 2 ** 32 * (i + 1))
    const selected = order[j]!
    order[j] = order[i]!
    order[i] = selected
  }
  const mission = PLAYER_MISSIONS.find(candidate => candidate.id === order[status.stage])!
  const { budgetUsd, availableMonths } = mission.context.scenario
  return [
    { id: `${status.stage}:${mission.id}:economy`, missionId: mission.id, profile: 'economy',
      budgetUsd: budgetUsd - 50_000, months: availableMonths, points: 1 },
    { id: `${status.stage}:${mission.id}:priority`, missionId: mission.id, profile: 'priority',
      budgetUsd, months: 27, points: 2 },
  ]
}

export function chooseExpeditionLeg(run: ExpeditionRun, legId: string): ExpeditionRun {
  if (run.legId === legId || !expeditionOffers(run).some(leg => leg.id === legId)) return run
  return { ...run, legId }
}

export function expeditionContext(context: EvaluationContext, run: ExpeditionRun, leg: ExpeditionLeg): EvaluationContext {
  return {
    ...context,
    scenarioRevision: `${context.scenarioRevision}:expedition-v1:${run.seed}:${leg.id}:run-${run.attempts.length}`,
    scenario: { ...context.scenario, budgetUsd: leg.budgetUsd, availableMonths: leg.months },
  }
}

/** Record one frozen evaluator result against the accepted contract and attempt. */
export function settleExpeditionLeg(
  run: ExpeditionRun,
  report: EvaluationReport,
  base: EvaluationContext,
): ExpeditionRun {
  const leg = expeditionOffers(run).find(offer => offer.id === run.legId)
  if (!leg || report.origin !== 'evaluator' || report.validation.kind !== 'valid' ||
    !report.config || report.config.scenarioId !== leg.missionId) return run
  const context = expeditionContext(base, run, leg)
  if (report.configurationKey !== configurationKey(report.config, context)) return run
  const evaluated = evaluateMission(report.config, context)
  if (evaluated.validation.kind !== 'valid' || evaluated.outcome !== report.outcome ||
    (evaluated.outcome !== 'FAILURE' && evaluated.outcome !== 'MODEL_PASS_PROVISIONAL')) return run
  return {
    ...run,
    legId: null,
    attempts: [...run.attempts, { legId: leg.id, passed: evaluated.outcome === 'MODEL_PASS_PROVISIONAL' }],
  }
}

export function readExpedition(raw: string | null): ExpeditionRun | null {
  try {
    const saved = JSON.parse(raw ?? 'null')
    if (saved?.version !== 1 || !Number.isInteger(saved.seed) || saved.seed < 0 || saved.seed > 0xffff_ffff ||
      !Array.isArray(saved.attempts) || saved.attempts.length > EXPEDITION_STAGES + STARTING_SUPPLIES - 1) return null
    let run = createExpedition(saved.seed)
    for (const attempt of saved.attempts) {
      const leg = expeditionOffers(run).find(offer => offer.id === attempt?.legId)
      if (!leg || typeof attempt.passed !== 'boolean') return null
      run = { ...run, attempts: [...run.attempts, { legId: leg.id, passed: attempt.passed }] }
    }
    if (saved.legId === null) return run
    if (typeof saved.legId !== 'string' || !expeditionOffers(run).some(leg => leg.id === saved.legId)) return null
    return chooseExpeditionLeg(run, saved.legId)
  } catch {
    return null
  }
}
