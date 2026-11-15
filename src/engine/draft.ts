import type { EvaluationContext, MissionConfiguration } from './types'

/** Player intent only. Absence is never a catalog's first item. */
export type PartField = Exclude<keyof MissionConfiguration, 'scenarioId'>
export type MissionDraft = Pick<MissionConfiguration, 'scenarioId'> & Partial<Record<PartField, string>>
export const SLOT_FIELDS = ['busId', 'payloadId', 'arrayId', 'batteryId', 'radioId', 'groundId', 'orbitId', 'launcherId'] as const
export const emptyDraft = (scenarioId: string): MissionDraft => ({ scenarioId })
export function draftOptions(context: EvaluationContext) {
  const c = context.catalog
  return { busId:c.buses, payloadId:[...c.payloads,...(c.relayPayloads ?? [])], arrayId:c.arrays, batteryId:c.batteries,
    radioId:c.radios, groundId:c.grounds, orbitId:c.orbits, launcherId:c.launchers }
}
export function sanitizeDraft(draft: MissionDraft, context: EvaluationContext): MissionDraft {
  const next = emptyDraft(draft.scenarioId)
  const options = draftOptions(context)
  for (const field of SLOT_FIELDS) if (options[field].some(p => p.id === draft[field])) next[field] = draft[field]
  return next
}
export function missingSlots(draft: MissionDraft, context: EvaluationContext): readonly PartField[] {
  const valid = sanitizeDraft(draft, context)
  return SLOT_FIELDS.filter(field => !valid[field])
}
export function completeDraft(draft: MissionDraft, context: EvaluationContext): draft is MissionConfiguration {
  return draft.scenarioId === (context.scenario.id ?? 'wildfire') && missingSlots(draft,context).length === 0
}
/** Legacy drawing/layout adapter only; blank IDs draw no hardware. Never evaluate this as a complete build. */
export function draftView(draft: MissionDraft): MissionConfiguration {
  return { scenarioId:draft.scenarioId, ...Object.fromEntries(SLOT_FIELDS.map(f => [f,draft[f] ?? ''])) } as MissionConfiguration
}
export function removeSlot(draft: MissionDraft, field: PartField): MissionDraft {
  const next = {...draft}; delete next[field]; return next
}
