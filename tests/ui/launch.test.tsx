import { useState } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MissionApp from '../../src/ui/MissionApp'
import type { GameScreen } from '../../src/ui/game/GameScreens'
import { DEFAULT_CONTEXT } from '../../src/data/context'
import { WF_A } from '../../src/fixtures/builds'
import { evaluateMission } from '../../src/engine/evaluate'

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); localStorage.removeItem('mission-forge.academy.v1') })
it('settles a frozen player launch once; locale, skip and returning cannot repeat callbacks', async () => {
  localStorage.setItem('mission-forge.academy.v1', 'seen')
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
  const provider = vi.fn((config: unknown) => evaluateMission(config, DEFAULT_CONTEXT))
  const settle = vi.fn()
  function Harness() {
    const [view, setView] = useState<GameScreen>('hangar')
    return <MissionApp context={DEFAULT_CONTEXT} initialConfiguration={WF_A} evaluate={provider} onReport={settle}
      game={{ screen: view, onNavigate: setView, campaignActive: false, onCampaign() {} }} />
  }
  render(<Harness />)
  const launch = screen.getByRole('button', { name: 'Launch' })
  fireEvent.click(launch)
  fireEvent.click(launch)
  expect(settle).toHaveBeenCalledTimes(1)
  expect(provider).toHaveBeenCalledTimes(1)
  expect(settle.mock.calls[0]![0].config.arrayId).toBe('arr-deploy-l')
  fireEvent.click(screen.getByRole('button', { name: 'Українська' }), { detail: 2 })
  expect(document.documentElement.lang).toBe('en')
  await userEvent.click(screen.getByRole('button', { name: 'Українська' }))
  await userEvent.click(screen.getByRole('button', { name: 'Одразу до підсумку' }))
  expect(screen.getByTestId('verdict').textContent).toMatch(/попередн|умовн/i)
  expect(screen.getByText('ДАНІ ПОВЕРНУТО · ПОПЕРЕДНІЙ РЕЗУЛЬТАТ МОДЕЛІ')).toBeTruthy()
  expect(settle).toHaveBeenCalledTimes(1)
  expect(provider).toHaveBeenCalledTimes(1)
  await userEvent.click(screen.getByRole('button', { name: '← Головне меню' }))
  await userEvent.click(screen.getByRole('button', { name: 'Останній підсумок' }))
  expect(settle).toHaveBeenCalledTimes(1)
})
