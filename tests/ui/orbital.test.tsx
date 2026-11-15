import { afterEach, beforeEach, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App'

beforeEach(() => localStorage.setItem('mission-forge.academy.v1', 'seen'))
afterEach(() => { cleanup(); localStorage.removeItem('mission-forge.academy.v1') })
it('menu → hangar → real part swap → menu keeps the same spacecraft and locale', async () => {
  const user = userEvent.setup()
  const { container } = render(<App />)
  await user.click(screen.getByRole('button', { name: /Customize/ }))
  await user.click(container.querySelector<HTMLButtonElement>('[data-part-id="arr-deploy-xl"]')!)
  expect(container.querySelector('.craft-scene')?.getAttribute('data-array-id')).toBe('arr-deploy-xl')
  expect(container.querySelector('.part-hud')?.textContent).toContain('4.36 kg')
  await user.click(screen.getByRole('button', { name: 'Українська' }))
  await user.click(screen.getByRole('button', { name: '← Головне меню' }))
  expect(container.querySelector('.craft-scene')?.getAttribute('data-array-id')).toBe('arr-deploy-xl')
  expect(document.documentElement.lang).toBe('uk')
  expect(screen.queryByRole('combobox')).toBeNull()
})
