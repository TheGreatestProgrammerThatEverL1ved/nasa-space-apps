import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MissionGallery from '../../src/ui/game/MissionGallery'
import { MISSIONS } from '../../src/data/scenarios'

afterEach(cleanup)
it.each(['en', 'ua'] as const)('shows four distinct Earth cards and chooses the actual context (%s)', async locale => {
  const choose = vi.fn()
  const { container } = render(<MissionGallery missions={MISSIONS} locale={locale} selectedMissionId="wildfire" onChoose={choose} />)
  expect(screen.getAllByRole('img')).toHaveLength(4)
  const pictures = [...container.querySelectorAll('.mission-gallery-art svg')].map(el => el.innerHTML)
  expect(new Set(pictures).size).toBe(4)
  const urban = container.querySelector('[data-mission-id="urban-heat"]')!
  await userEvent.click(within(urban as HTMLElement).getByRole('button'))
  expect(choose).toHaveBeenCalledWith('urban-heat')
})
it('does not offer a dead replay button for a cleared/current but unavailable contract', () => {
  const { container } = render(<MissionGallery missions={MISSIONS} locale="en" selectedMissionId="visible-mapping" onChoose={vi.fn()}
    contracts={[{ missionId: 'visible-mapping', available: false, completed: true, reward: 100, reason: 'Buy the refunded visible camera.' }]} />)
  const card = container.querySelector('[data-mission-id="visible-mapping"]')!
  const button = within(card as HTMLElement).getByRole('button') as HTMLButtonElement
  expect(button.disabled).toBe(true)
  expect(button.textContent).toContain('Locked')
  expect(card.textContent).toContain('Buy the refunded visible camera.')
})
