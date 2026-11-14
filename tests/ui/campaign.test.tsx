import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App'
import { CAMPAIGN_STORAGE_KEY } from '../../src/campaign/progress'

beforeEach(() => localStorage.removeItem(CAMPAIGN_STORAGE_KEY))
afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.removeItem(CAMPAIGN_STORAGE_KEY) })

it.each(['en', 'ua'] as const)('earns once, buys audited X-band, persists and completes the campaign (%s)', async locale => {
  const user = userEvent.setup()
  const view = render(<App />)
  if (locale === 'ua') await user.click(screen.getByRole('button', { name: 'Українська' }))
  await user.click(screen.getByRole('button', { name: locale === 'en' ? 'Play campaign' : 'Грати кампанію' }))
  const runName = locale === 'en' ? 'Run mission' : 'Запустити місію'
  expect((screen.getByLabelText(locale === 'en' ? 'Radio package' : 'Радіопакет') as HTMLSelectElement).value).toBe('rf-s')
  expect(screen.getByTestId('unlock-rf-x').getAttribute('disabled')).not.toBeNull()
  await user.click(screen.getByRole('button', { name: runName }))
  expect(screen.getByTestId('campaign-credits').textContent).toMatch(/100/)
  await user.click(screen.getByRole('button', { name: runName }))
  expect(screen.getByTestId('campaign-credits').textContent).toMatch(/100/)
  await user.click(screen.getByTestId('unlock-rf-x'))
  expect(screen.getByTestId('campaign-credits').textContent).toMatch(/^0 /)
  expect(screen.getByTestId('unlock-rf-x').getAttribute('disabled')).not.toBeNull()
  view.unmount()
  render(<App />)
  // Direct play remains the primary reload entry; progress is retained separately.
  await user.click(screen.getByRole('button', { name: 'Play campaign' }))
  expect(screen.getByTestId('campaign-credits').textContent).toMatch(/^0 /)
  expect(screen.getByTestId('unlock-rf-x').getAttribute('disabled')).not.toBeNull()
  if (locale === 'ua') await user.click(screen.getByRole('button', { name: 'Українська' }))
  await user.selectOptions(screen.getByLabelText(locale === 'en' ? 'Mission' : 'Місія', { exact: true }), 'urban-heat')
  await user.selectOptions(screen.getByLabelText(locale === 'en' ? 'Radio package' : 'Радіопакет'), 'rf-x')
  await user.selectOptions(screen.getByLabelText(locale === 'en' ? 'Ground service' : 'Наземний сервіс', { exact: true }), 'gs-single')
  await user.click(screen.getByRole('button', { name: runName }))
  expect(screen.getByTestId('campaign-complete')).toBeTruthy()
  expect(screen.getByTestId('campaign-credits').textContent).toMatch(/100/)
  await user.click(screen.getByRole('button', { name: runName }))
  expect(screen.getByTestId('campaign-credits').textContent).toMatch(/100/)
})

it('warns honestly when local saving fails, while keeping the in-memory pass', async () => {
  const user = userEvent.setup()
  render(<App />)
  await user.click(screen.getByRole('button', { name: 'Play campaign' }))
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
  await user.click(screen.getByRole('button', { name: 'Run mission' }))
  expect(screen.getByRole('alert').textContent).toMatch(/may not survive reload/)
  expect(screen.getByTestId('campaign-credits').textContent).toMatch(/100/)
  expect(screen.getByTestId('verdict').textContent).toMatch(/provisional/i)
})
