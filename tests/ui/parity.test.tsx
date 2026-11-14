import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MESSAGES } from '../../src/i18n'
import MissionApp from '../../src/ui/MissionApp'
import { DEFAULT_CONTEXT } from '../../src/data/context'
import { evaluateMission } from '../../src/engine/evaluate'
import { FIRST_MISSION } from '../../src/fixtures/builds'
import { formatExactValue, formatMetric } from '../../src/ui/format'
import { finite, unknown, unavailable } from '../../src/engine/metric'
import { contextCopy, evidenceCopy } from '../conformance/helpers'

afterEach(cleanup)
it('has identical dictionary keys and interpolation parameters, with no empty translations', () => {
  expect(Object.keys(MESSAGES.ua).sort()).toEqual(Object.keys(MESSAGES.en).sort())
  for (const key of Object.keys(MESSAGES.en) as (keyof typeof MESSAGES.en)[]) {
    expect(MESSAGES.ua[key].trim().length, key).toBeGreaterThan(0)
    const parameters = (s: string) => [...s.matchAll(/\{([A-Za-z0-9_-]+)\}/g)].map(m => m[1]).sort()
    expect(parameters(MESSAGES.ua[key]), key).toEqual(parameters(MESSAGES.en[key]))
  }
})
it('formats actual locale decimals and non-finite states without leaking numbers', () => {
  expect(formatMetric(finite(7.1, 'h'), 'en', 'latencyHours')).toContain('7.1')
  expect(formatMetric(finite(7.1, 'h'), 'ua', 'latencyHours')).toContain('7,1')
  for (const metric of [unknown('h'), unavailable('unbounded', 'h', 'test'), unavailable('not-applicable', 'h', 'test')]) {
    expect(formatMetric(metric, 'en')).not.toMatch(/undefined|NaN|Infinity|null/)
    expect(formatMetric(metric, 'ua')).not.toMatch(/undefined|NaN|Infinity|null/)
  }
})
it.each(['modelRevision', 'contractRevision', 'catalogRevision', 'scenarioRevision', 'fixtureRevision'] as const)('invalidates old reports when %s changes without a selection edit', async revision => {
  const user = userEvent.setup()
  const { rerender } = render(<MissionApp context={DEFAULT_CONTEXT} initialConfiguration={FIRST_MISSION} evaluate={r => evaluateMission(r, DEFAULT_CONTEXT)} />)
  await user.click(screen.getByRole('button', { name: 'Run mission' }))
  const nextContext = { ...DEFAULT_CONTEXT, [revision]: `${DEFAULT_CONTEXT[revision]}-next` }
  rerender(<MissionApp context={nextContext} initialConfiguration={FIRST_MISSION} evaluate={r => evaluateMission(r, nextContext)} />)
  expect(screen.getByTestId('stale-notice')).toBeTruthy()
})
it('retains evaluated field evidence after draft edits and catalog changes', async () => {
  const user = userEvent.setup()
  const context = structuredClone(DEFAULT_CONTEXT)
  const { rerender } = render(<MissionApp context={context} initialConfiguration={FIRST_MISSION} evaluate={r => evaluateMission(r, context)} />)
  await user.click(screen.getByRole('button', { name: 'Run mission' }))
  const evidence = screen.getByRole('region', { name: 'Field-level provenance' })
  const original = evidence.textContent
  await user.selectOptions(screen.getByLabelText('Ground service', { exact: true }), 'gs-network')
  expect(evidence.textContent).toContain('Single ground station')
  const next = structuredClone(context)
  Reflect.set(next.catalog.grounds[0], 'label', { en: 'Changed later catalog', ua: 'Змінено' })
  Reflect.set(next, 'catalogRevision', `${context.catalogRevision}-changed`)
  rerender(<MissionApp context={next} initialConfiguration={FIRST_MISSION} evaluate={r => evaluateMission(r, next)} />)
  expect(evidence.textContent).not.toContain('Changed later catalog')
  expect(evidence.textContent).toContain('Single ground station')
  expect(original).not.toBe('')
  expect(within(evidence).getAllByRole('link').every(a => a.getAttribute('href')?.startsWith('https://'))).toBe(true)
})
it('exposes full double precision for rounded boundary comparisons', () => {
  expect(formatExactValue(24.000001, 'kg', 'en')).toContain('24.000001')
  expect(formatExactValue(Number.NaN, 'kg', 'en')).not.toContain('NaN')
})
it('marks the retained report stale if a rerun throws', async () => {
  const user = userEvent.setup()
  const evaluate = vi.fn((r: unknown) => evaluateMission(r, DEFAULT_CONTEXT))
  render(<MissionApp context={DEFAULT_CONTEXT} initialConfiguration={FIRST_MISSION} evaluate={evaluate} />)
  await user.click(screen.getByRole('button', { name: 'Run mission' }))
  evaluate.mockImplementationOnce(() => { throw new Error('test provider failure') })
  await user.click(screen.getByRole('button', { name: 'Run mission' }))
  expect(screen.getByTestId('stale-notice')).toBeTruthy()
  expect(screen.getByTestId('latency-value').textContent).toContain('7.1')
})
for (const locale of ['en', 'ua'] as const) {
  it(`keeps units on unknown limits and exposes near-boundary failures (${locale})`, async () => {
    const context = contextCopy()
    context.fixture.targetGapHours = { state: 'unknown', missingEvidenceIds: ['access'] }
    context.catalog.buses.find(b => b.id === 'bus-12u')!.massKg = 24.000001 / 1.15 - 3 - .83 - 1.01 - .35
    const user = userEvent.setup()
    render(<MissionApp context={context} initialConfiguration={FIRST_MISSION} evaluate={r => evaluateMission(r, context)} />)
    if (locale === 'ua') await user.click(screen.getByRole('button', { name: 'Українська' }))
    await user.click(screen.getByRole('button', { name: locale === 'en' ? 'Run mission' : 'Запустити місію' }))
    expect(screen.getByTestId('requirement-WF-ACCESS').textContent).toContain(locale === 'en' ? '24 h' : '24 год')
    const mass = screen.getByTestId('requirement-ENG-MASS')
    expect(mass.textContent).toContain(MESSAGES[locale]['boundary.ambiguous'])
    expect(mass.textContent).toMatch(/24\.00000/)
  })
  it.each(['failed-link', 'unknown-link', 'disabled-tracking'] as const)(`labels baseline assumptions as non-established for %s (${locale})`, async mode => {
    const context = contextCopy()
    if (mode === 'failed-link') context.fixture.receiverCompatible = evidenceCopy(false)
    if (mode === 'unknown-link') context.fixture.linkClosure = { state: 'unknown', missingEvidenceIds: ['test-link'] }
    if (mode === 'disabled-tracking') context.fixture.tracking = { mode: 'disabled' }
    const user = userEvent.setup()
    render(<MissionApp context={context} initialConfiguration={{ ...FIRST_MISSION, groundId: 'gs-network' }} evaluate={r => evaluateMission(r, context)} />)
    if (locale === 'ua') await user.click(screen.getByRole('button', { name: 'Українська' }))
    await user.click(screen.getByRole('button', { name: locale === 'en' ? 'Run mission' : 'Запустити місію' }))
    const assumptions = screen.getByRole('region', { name: MESSAGES[locale]['assumptions.title'] })
    expect(assumptions.textContent).toMatch(locale === 'en' ? /nominal|baseline/i : /номінальн|базов/i)
    expect(assumptions.textContent).toMatch(locale === 'en' ? /not established|not confirmed/i : /не підтвердж|не встановлен/i)
    const report = evaluateMission({ ...FIRST_MISSION, groundId: 'gs-network' }, context)
    expect(report.outcome).toBe(mode === 'unknown-link' ? 'UNVERIFIED' : 'FAILURE')
    if (mode === 'failed-link') {
      const repair = MESSAGES[locale]['repair.LINK_UNCLOSED']
      expect(repair).toMatch(locale === 'en' ? /while|failed/i : /поки|несправ|не працю/i)
      expect(repair).not.toMatch(/then zero|після.*нуль/i)
    }
  })
}
