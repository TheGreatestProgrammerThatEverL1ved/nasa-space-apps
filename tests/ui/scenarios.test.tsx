import { afterEach, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App'
import MissionApp from '../../src/ui/MissionApp'
import { FIRST_MISSION } from '../../src/fixtures/builds'
import { evaluateMission } from '../../src/engine/evaluate'
import { DEFAULT_CONTEXT } from '../../src/data/context'

afterEach(cleanup)

it('marks negative schedule slack as a deficit without changing the verdict', async () => {
  const context = { ...DEFAULT_CONTEXT, scenario: { ...DEFAULT_CONTEXT.scenario, availableMonths: 20 } }
  render(<MissionApp context={context} initialConfiguration={FIRST_MISSION} evaluate={r => evaluateMission(r, context)} />)
  await userEvent.setup().click(screen.getByRole('button', { name: 'Run mission' }))
  const row = screen.getByText('Schedule slack').closest('.margin-row')
  expect(row?.classList.contains('margin-negative')).toBe(true)
  expect(row?.textContent).toContain('-11')
})

it.each(['en', 'ua'] as const)('switches scenario without relabelling a report, preserving language (%s)', async locale => {
  const user = userEvent.setup()
  render(<App />)
  if (locale === 'ua') await user.click(screen.getByRole('button', { name: 'Українська' }))
  const runName = locale === 'en' ? 'Run mission' : 'Запустити місію'
  await user.click(screen.getByRole('button', { name: runName }))
  expect(screen.getByTestId('latency-value').textContent).toMatch(/7[.,]1/)
  await user.selectOptions(screen.getByLabelText(locale === 'en' ? 'Mission' : 'Місія', { exact: true }), 'urban-heat')
  expect(document.documentElement.lang).toBe(locale === 'en' ? 'en' : 'uk')
  expect(screen.queryByTestId('latency-value')).toBeNull()
  expect((screen.getByLabelText(locale === 'en' ? 'Radio package' : 'Радіопакет') as HTMLSelectElement).value).toBe('rf-s')
  await user.click(screen.getByRole('button', { name: runName }))
  expect(screen.getByTestId('requirement-UH-DELIVERY').textContent).toMatch(/1[.,]5/)
  expect(screen.queryByTestId('requirement-WF-LATENCY')).toBeNull()
  await user.selectOptions(screen.getByLabelText(locale === 'en' ? 'Radio package' : 'Радіопакет'), 'rf-x')
  expect(screen.getByTestId('stale-notice')).toBeTruthy()
  await user.click(screen.getByRole('button', { name: runName }))
  await user.selectOptions(screen.getByLabelText(locale === 'en' ? 'Ground service' : 'Наземний сервіс', { exact: true }), 'gs-single')
  await user.click(screen.getByRole('button', { name: runName }))
  expect(screen.getByTestId('verdict').textContent).toMatch(locale === 'en' ? /provisional/i : /попередн|умовн/i)
  expect(screen.getByTestId('latency-value').textContent).toMatch(/7[.,]1/)
  await user.selectOptions(screen.getByLabelText(locale === 'en' ? 'Mission' : 'Місія', { exact: true }), 'wildfire')
  expect(screen.queryByTestId('latency-value')).toBeNull()
})
