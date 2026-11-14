import { expect, it } from 'vitest'
import { CATALOG } from '../../src/data/catalog'
import { DEFAULT_CONTEXT } from '../../src/data/context'
import { validatePart } from '../../src/engine/validate'

it('keeps field-level evidence and bilingual labels on every complete selectable item', () => {
  for (const part of Object.values(CATALOG).flat()) {
    expect(validatePart(part), part.id).toEqual([])
    expect(part.label.en.trim()).not.toBe('')
    expect(part.label.ua.trim()).not.toBe('')
    for (const field of Object.keys(part).filter(k => !['id', 'category', 'label', 'evidence'].includes(k))) {
      expect(part.evidence[field], `${part.id}.${field}`).toBeDefined()
      expect(part.evidence[field].sourceRefs.length).toBeGreaterThan(0)
      expect(part.evidence[field].sourceRefs.some((ref: string) => /#\d+\.\d+/.test(ref))).toBe(false)
    }
  }
})
it('does not promote reference fields into composite flight qualification', () => {
  for (const b of CATALOG.buses) {
    expect(b.evidence.spacecraftLimitKg.kind).toBe('provisional')
    expect(b.evidence.spacecraftLimitKg.sourceRefs).toContain('S1')
  }
  const array = CATALOG.arrays.find(a => a.id === 'arr-deploy-l')!
  expect(array.evidence.bolW.kind).toBe('verified-reference')
  expect(array.evidence.costUsd.kind).toBe('provisional')
  const camera = CATALOG.payloads[0]
  expect(camera.evidence.massKg.kind).toBe('provisional')
  expect(camera.evidence.massKg.sourceRefs).toContain('S2')
  expect(camera.evidence.bandsMicrometers.kind).toBe('verified-reference')
  expect(camera.evidence.framesPerSecond.kind).toBe('provisional')
  expect(CATALOG.payloads.map(p => p.id)).toEqual(['pl-thermal'])
  expect(CATALOG.orbits.map(p => p.id)).toEqual(['orb-sso-low'])
  expect(CATALOG.launchers.map(p => p.id)).toEqual(['lv-heavy'])
  expect(DEFAULT_CONTEXT.fixture.tracking.mode).toBe('accepted')
  expect(DEFAULT_CONTEXT.fixture.targetGapHours.state).toBe('known')
})
