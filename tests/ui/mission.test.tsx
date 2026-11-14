import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MissionApp from '../../src/ui/MissionApp'
import { DEFAULT_CONTEXT } from '../../src/data/context'
import { evaluateMission } from '../../src/engine/evaluate'
import { FIRST_MISSION } from '../../src/fixtures/builds'
import type { MissionConfiguration } from '../../src/engine/types'

afterEach(cleanup)

it('keeps an immutable evaluated snapshot, marks edits stale and preserves them across language changes', async () => {
  const user = userEvent.setup()
  const provider = vi.fn((request: unknown) => evaluateMission(request, DEFAULT_CONTEXT))
  render(<MissionApp context={DEFAULT_CONTEXT} initialConfiguration={FIRST_MISSION} evaluate={provider} />)
  await user.click(screen.getByRole('button', { name: 'Run mission' }))
  expect(provider).toHaveBeenCalledTimes(1)
  const firstSnapshot = provider.mock.calls[0][0] as MissionConfiguration
  expect(firstSnapshot.groundId).toBe('gs-single')
  await user.selectOptions(screen.getByLabelText('Ground service', { exact: true }), 'gs-network')
  expect(screen.getByTestId('stale-notice')).toBeTruthy()
  expect(provider).toHaveBeenCalledTimes(1)
  expect(firstSnapshot.groundId).toBe('gs-single')
  await user.click(screen.getByRole('button', { name: 'Українська' }))
  expect(document.documentElement.lang).toBe('uk')
  expect((screen.getByLabelText('Наземний сервіс', { exact: true }) as HTMLSelectElement).value).toBe('gs-network')
  expect(screen.getByTestId('stale-notice')).toBeTruthy()
  await user.click(screen.getByRole('button', { name: 'Запустити місію' }))
  expect(provider).toHaveBeenCalledTimes(2)
  expect(provider.mock.results[1].value.outcome).toBe('MODEL_PASS_PROVISIONAL')
  expect(screen.queryByTestId('stale-notice')).toBeNull()
})
