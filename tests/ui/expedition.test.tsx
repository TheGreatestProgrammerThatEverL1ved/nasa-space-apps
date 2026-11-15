import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import App from '../../src/App'
import { createExpedition, EXPEDITION_KEY, expeditionSummary, readExpedition } from '../../src/campaign/expedition'
import { FIRST_MISSION } from '../../src/fixtures/builds'
import { PLAYER_WITNESSES } from '../../src/data/player/witnesses'
import { SLOT_FIELDS } from '../../src/engine/draft'
import type { MissionConfiguration } from '../../src/engine/types'

afterEach(() => {
  cleanup()
  localStorage.clear()
  window.history.replaceState({}, '', '/')
})

it.each(['en', 'ua'] as const)('plays an expedition through failure, repair, and reload (%s)', locale => {
  const en = locale === 'en'
  localStorage.setItem('mission-forge.academy.v1', 'seen')
  localStorage.setItem(EXPEDITION_KEY, JSON.stringify(createExpedition(38)))
  window.history.replaceState({}, '', '/?renderer=svg')
  const { container, unmount } = render(<App />)
  if (!en) fireEvent.click(screen.getByRole('button', { name: 'Українська' }))
  const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))
  const open = () => click(en ? 'Expedition' : 'Експедиція')
  const choose = () => fireEvent.click(container.querySelector('.expedition-offers button')!)
  const launch = () => {
    click(en ? 'Launch' : 'Запуск')
    const skip = screen.queryByRole('button', { name: /skip|пропустити/i })
    const held = screen.queryByRole('button', { name: /view debrief|переглянути підсумок/i })
    if (held ?? skip) fireEvent.click((held ?? skip)!)
  }
  const back = () => click(en ? 'Return to expedition' : 'Повернутися до експедиції')
  const part = (slot: string, id: string) => {
    fireEvent.click(container.querySelector(`[data-slot="${slot}"]`)!)
    fireEvent.click(container.querySelector(`[data-part-id="${id}"]`)!)
  }
  const assemble = (build: MissionConfiguration) => SLOT_FIELDS.forEach(slot => part(slot, build[slot]))
  const progress = () => expeditionSummary(readExpedition(localStorage.getItem(EXPEDITION_KEY))!)
  open()
  choose()
  expect(screen.getByTestId('build-progress').textContent).toBe('0/8')
  assemble({ ...FIRST_MISSION, busId: 'bus-12u-light' })
  launch()
  expect(screen.getByTestId('important-number').textContent).toMatch(/7[.,]1/)
  expect(container.querySelector('.data-handoff summary')?.textContent).toContain(en ? 'Timing limit missed' : 'Часову межу перевищено')
  expect(progress()).toMatchObject({ supplies: 2, stage: 0 })
  back()
  choose()
  expect(screen.getByTestId('build-progress').textContent).toBe('8/8')
  part('groundId', 'gs-network')
  launch()
  expect(container.querySelector('.data-handoff summary')?.textContent).toContain(en ? 'meets the requirement' : 'відповідає вимозі')
  back()
  for (const mission of ['packet-relay', 'visible-mapping'] as const) {
    choose()
    expect(screen.getByTestId('build-progress').textContent).toBe('0/8')
    assemble({ ...PLAYER_WITNESSES[mission].a, launcherId: 'lv-shared-24' })
    launch()
    back()
  }
  expect(progress()).toMatchObject({ supplies: 2, stage: 3, complete: true, points: 3 })
  expect(localStorage.getItem('mission-forge.campaign.v1')).toBeNull()
  unmount()
  render(<App />)
  click('Expedition')
  expect(screen.getByRole('heading', { name: 'Expedition complete' })).toBeTruthy()
})
