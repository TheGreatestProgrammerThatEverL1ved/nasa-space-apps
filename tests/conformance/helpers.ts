import { DEFAULT_CONTEXT } from '../../src/data/context'
import type { EvaluationReport, Evidence } from '../../src/engine/types'
import { known } from '../../src/engine/metric'
export type Mutable<T> = T extends object ? { -readonly [K in keyof T]: Mutable<T[K]> } : T
export const contextCopy = () => structuredClone(DEFAULT_CONTEXT) as Mutable<typeof DEFAULT_CONTEXT>
export const check = (report: EvaluationReport, id: string) => report.checks.find(c => c.checkId === id)!
export const evidenceCopy = <T>(value: T) => structuredClone(known(value)) as Mutable<Evidence<T>>
