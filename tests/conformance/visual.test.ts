import { expect, it } from 'vitest'
import { MISSIONS } from '../../src/data/scenarios'
import { APPEARANCES, arrayTransform, batteryTransform, getAppearance, resolveCraftAppearance } from '../../src/ui/orbital/appearance'

it('maps every shipped selectable part ID and separates external mission selections', () => {
  for (const mission of MISSIONS) for (const parts of Object.values(mission.context.catalog)) {
    for (const part of parts) {
      expect(APPEARANCES[part.id], part.id).toBeDefined()
      const appearance = getAppearance(part.id)
      expect(appearance.id).toBe(part.id)
      expect(appearance.kind).toBe(['ground', 'orbit', 'launcher'].includes(part.category) ? 'external' : part.category)
    }
  }
})
it('uses genuinely different shared geometry for all array, bus, lens and antenna variants', () => {
  for (const ids of [
    ['arr-body', 'arr-deploy-m', 'arr-deploy-l', 'arr-deploy-xl'],
    ['bus-3u', 'bus-6u', 'bus-12u'], ['rf-uhf', 'rf-s', 'rf-x'],
    ['pl-thermal', 'pl-visible-8', 'pl-visible-35', 'pl-visible-70', 'pl-relay'],
  ]) {
    const params = ids.map(id => {
      const { id: _id, label: _label, short: _short, accent: _accent, ...geometry } = getAppearance(id)
      return JSON.stringify(geometry)
    })
    expect(new Set(params).size).toBe(ids.length)
  }
  expect(arrayTransform('arr-body', 'bus-12u').mount).toBe('body')
  expect(arrayTransform('arr-deploy-xl', 'bus-12u').segments).toBe(3)
})
it('cutaway pack extents and annotations match actual installed battery IDs', () => {
  const batteries = MISSIONS[0]!.context.catalog.batteries
  const extents = batteries.map(b => {
    const visual = batteryTransform(b.id, 'bus-12u')
    expect(visual.nominalWh).toBe(b.nominalWh)
    return visual.pack[0] * visual.pack[1] * visual.pack[2]
  })
  expect(extents[0]).toBeLessThan(extents[1]!)
  expect(extents[1]).toBeLessThan(extents[2]!)
})
it('unknown hardware is explicitly diagnosed without adding evaluator capability', () => {
  const config = { ...MISSIONS[0]!.initialConfiguration, arrayId: 'not-real' }
  expect(resolveCraftAppearance(config).unknownIds).toEqual(['not-real'])
  expect(getAppearance('not-real').kind).toBe('unknown')
})
