import { expect, test } from '@playwright/test'
import { assembleHangar, FIRST_PLAYER } from './assembly'
import { PLAYER_WITNESSES } from '../../src/data/player/witnesses'

for (const locale of ['en', 'ua'] as const) {
  test(`expedition failure, retry, completion and reload (${locale})`, async ({ page }) => {
    const en = locale === 'en'
    await page.addInitScript(() => {
      localStorage.setItem('mission-forge.academy.v1', 'seen')
      if (!localStorage.getItem('mission-forge.expedition.v1')) {
        localStorage.setItem('mission-forge.expedition.v1', JSON.stringify({ version: 1, seed: 38, attempts: [], legId: null }))
      }
    })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: en ? 1200 : 320, height: 850 })
    await page.goto('./?renderer=svg')
    if (!en) await page.getByRole('button', { name: 'Українська', exact: true }).click()
    const open = () => page.getByRole('button', { name: en ? 'Expedition' : 'Експедиція', exact: true }).click()
    const accept = () => page.locator('.expedition-offers article').first().getByRole('button').click()
    const back = () => page.getByRole('button', { name: en ? 'Return to expedition' : 'Повернутися до експедиції' }).click()
    const launch = () => page.getByRole('button', { name: en ? 'Launch' : 'Запуск', exact: true }).click()
    await open()
    if (!en) await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
    await expect(page.locator('.expedition-offers article')).toHaveCount(2)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
    await accept()
    await expect(page.getByTestId('build-progress')).toHaveText('0/8')
    await assembleHangar(page, FIRST_PLAYER)
    await launch()
    await expect(page.getByTestId('important-number')).toContainText(/7[.,]1/)
    await expect(page.locator('.data-handoff > summary')).toContainText(en ? 'Timing limit missed' : 'Часову межу перевищено')
    await back()
    await expect(page.locator('.expedition-status dd').nth(1)).toHaveText('2')
    await accept()
    await expect(page.getByTestId('build-progress')).toHaveText('8/8')
    await page.locator('[data-slot="groundId"]').click()
    await page.locator('[data-part-id="gs-network"]').click()
    await launch()
    await expect(page.locator('.data-handoff > summary')).toContainText(en ? 'meets the requirement' : 'відповідає вимозі')
    await back()
    for (const mission of ['packet-relay', 'visible-mapping'] as const) {
      await accept()
      await expect(page.getByTestId('build-progress')).toHaveText('0/8')
      await assembleHangar(page, { ...PLAYER_WITNESSES[mission].a, launcherId: 'lv-shared-24' })
      await launch()
      await expect(page.getByTestId('verdict')).toContainText(en ? /provisional/i : /попередн|умовн/i)
      await back()
    }
    await expect(page.locator('.expedition-status dd').nth(0)).toHaveText('3/3')
    await expect(page.locator('.expedition-status dd').nth(1)).toHaveText('3')
    await expect(page.locator('.expedition-status dd').nth(2)).toHaveText('3')
    await expect(page.getByRole('button', { name: en ? 'Start new expedition' : 'Почати нову експедицію' })).toBeVisible()
    expect(await page.evaluate(() => localStorage.getItem('mission-forge.campaign.v1'))).toBeNull()
    await page.reload()
    await page.getByRole('button', { name: 'Expedition', exact: true }).click()
    await expect(page.locator('.expedition-status dd').nth(0)).toHaveText('3/3')
  })
}
