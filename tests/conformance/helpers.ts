import { DEFAULT_CONTEXT } from '../../src/data/context'
import type { EvaluationReport } from '../../src/engine/types'
export type Mutable<T> = T extends object ? { -readonly [K in keyof T]: Mutable<T[K]> } : T
export const contextCopy = () => structuredClone(DEFAULT_CONTEXT) as Mutable<typeof DEFAULT_CONTEXT>
export const check = (report: EvaluationReport, id: string) => report.checks.find(c => c.checkId === id)!
