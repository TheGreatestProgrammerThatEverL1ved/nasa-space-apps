import type { Evidence, Metric, Provenance, Status } from './types'

export const MODEL_BASIS: Provenance = {
  kind: 'derived', sourceRefs: ['docs/game-rules-technical.md#5'],
  assumptionIds: ['synthetic-access', 'synthetic-contacts', 'tracking', 'integration', 'costs', 'life', 'link'],
}
export const finite = (value: number, unit = ''): Metric => Number.isFinite(value)
  ? { kind: 'finite', value, unit, provenance: MODEL_BASIS }
  : unknown(unit, 'non-finite-result')
export const unknown = (unit = '', reason = 'missing-evidence'): Metric => ({ kind: 'unknown', unit, reason })
export const unavailable = (kind: 'unbounded' | 'not-applicable', unit: string, reason: string): Metric => ({ kind, unit, reason })
export const numberOf = (metric: Metric): number | undefined => metric.kind === 'finite' ? metric.value : undefined
export const tolerance = (limit: number) => 1e-9 * Math.max(1, Math.abs(limit))
export const atLeast = (actual: number, limit: number) => actual >= limit - tolerance(limit)
export const atMost = (actual: number, limit: number) => actual <= limit + tolerance(limit)
export const compare = (actual: Metric, operator: '<=' | '>=' | 'true', limit: number): Status => {
  if (actual.kind === 'unbounded') return operator === '>=' ? 'MET' : 'NOT_MET'
  if (actual.kind !== 'finite') return 'UNVERIFIED'
  return (operator === '<=' ? atMost(actual.value, limit)
    : operator === '>=' ? atLeast(actual.value, limit) : actual.value === 1) ? 'MET' : 'NOT_MET'
}
export const truth = (evidence: Evidence<boolean>): Metric => evidence.state === 'known'
  ? finite(evidence.value ? 1 : 0) : unknown('', evidence.missingEvidenceIds.join(','))
export const known = <T>(value: T): Evidence<T> => ({ state: 'known', value, provenance: MODEL_BASIS })
