import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { assembleHangar, FIRST_PLAYER } from './assembly'
import { PLAYER_WITNESSES } from '../../src/data/player/witnesses'
import { SLOT_FIELDS } from '../../src/engine/draft'
import { formatValue } from '../../src/ui/format'

async function expectReflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
  const clipped = await page.locator('button, summary').evaluateAll(elements => elements
    .filter(element => element.checkVisibility() && !element.closest('details:not([open]) *:not(summary)'))
    .filter(element => element.scrollWidth > element.clientWidth + 1)
    .map(element => element.textContent))
  expect(clipped).toEqual([])
}

for (const locale of ['en', 'ua'] as const) {
  const en = locale === 'en'
  for (const profile of ['economy', 'priority'] as const) {
    test(`final playtest: ${profile} retry, double-click and permanent wallet (${locale})`, async ({ page }, testInfo) => {
      const errors: string[] = []
      page.on('pageerror', error => errors.push(error.message))
      await page.addInitScript(() => {
        localStorage.setItem('mission-forge.academy.v1', 'seen')
        if (!localStorage.getItem('mission-forge.campaign.v1')) {
          localStorage.setItem('mission-forge.campaign.v1', JSON.stringify({
            version: 3, completedMissionIds: ['wildfire'], unlockedPartIds: ['rf-x'],
            awards: { wildfire: 120 }, paidParts: { 'rf-x': 100 },
          }))
        }
        if (!localStorage.getItem('mission-forge.expedition.v1')) {
          localStorage.setItem('mission-forge.expedition.v1', JSON.stringify({ version: 1, seed: 38, attempts: [], legId: null }))
        }
      })
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.setViewportSize({ width: en ? 1200 : 320, height: 850 })
      await page.goto('./?renderer=svg')
      if (!en) {
        await page.getByRole('button', { name: 'Українська', exact: true }).click()
        await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
      }
      const campaign = await page.evaluate(() => localStorage.getItem('mission-forge.campaign.v1'))
      const run = () => page.evaluate(() => JSON.parse(localStorage.getItem('mission-forge.expedition.v1')!))
      const open = () => page.getByRole('button', { name: en ? 'Expedition' : 'Експедиція', exact: true }).click()
      const back = () => page.getByRole('button', { name: en ? 'Return to expedition' : 'Повернутися до експедиції' }).click()
      const accept = (index: number) => page.locator('.expedition-offers article').nth(index).getByRole('button').click()
      const launch = () => page.getByRole('button', { name: en ? 'Launch' : 'Запуск', exact: true }).dblclick()
      const activateCampaign = async () => {
        await page.getByRole('button', { name: en ? 'Campaign' : 'Кампанія', exact: true }).click()
        await page.getByRole('button', { name: en ? '← Main menu' : '← Головне меню', exact: true }).click()
      }
      // Expedition must be isolated even when entered from an active Campaign.
      await activateCampaign()
      await open()
      const offers = page.locator('.expedition-offers article')
      await expect(offers.nth(0)).toContainText(en ? '+1 point and +1 supply (up to 3)' : '+1 бал і +1 спроба (до 3)')
      await expect(offers.nth(1)).toContainText(en ? '+2 points' : '+2 бали')
      await expect(offers.nth(0)).toContainText(en ? '36 months' : '36 міс.')
      await expect(offers.nth(1)).toContainText(en ? '27 months' : '27 міс.')
      await expectReflow(page)
      await page.screenshot({ path: testInfo.outputPath('offers.png'), fullPage: true })
      await accept(0)
      await assembleHangar(page, FIRST_PLAYER)
      const accepted = await run()
      await page.reload()
      if (!en) {
        await page.getByRole('button', { name: 'Українська', exact: true }).click()
        await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
      }
      await activateCampaign()
      await open()
      await expect(offers.nth(0).getByRole('button')).toHaveText(en ? 'Resume build' : 'Продовжити збирання')
      await expect(page.locator('.expedition-status dd')).toHaveText(['0/3', '3', '0'])
      expect(await run()).toEqual(accepted)
      await accept(0)
      // Reload retains the accepted contract, not the tab-local active draft.
      await expect(page.getByTestId('build-progress')).toHaveText('0/8')
      await assembleHangar(page, FIRST_PLAYER)
      await launch()
      await expect(page.getByTestId('verdict')).toContainText(en ? /repair|failure/i : /виправ|невда|не відповідає/i)
      await expect(page.locator('.data-handoff > summary')).toContainText(en ? 'Timing limit missed' : 'Часову межу перевищено')
      await page.locator('.data-handoff > summary').click()
      await expect(page.locator('.data-handoff')).toContainText(en ? 'Land management team' : 'Команда управління територіями')
      await expect(page.locator('.data-handoff')).toContainText(en ? 'Thermal anomaly imagery' : 'Знімки теплових аномалій')
      await expect(page.locator('.data-handoff')).toContainText('7.1')
      await expect(page.locator('.data-handoff')).toContainText(en ? 'Resolve the mission checks' : 'Виконайте вимоги місії')
      await expectReflow(page)
      await page.screenshot({ path: testInfo.outputPath('failed-handoff.png'), fullPage: true })
      await back()
      await expect(page.locator('.expedition-status dd')).toHaveText(['0/3', '2', '0'])
      expect((await run()).attempts).toEqual([{ legId: '0:wildfire:economy', passed: false }])
      expect(await page.evaluate(() => localStorage.getItem('mission-forge.campaign.v1'))).toBe(campaign)
      await accept(profile === 'economy' ? 0 : 1)
      const config = { ...PLAYER_WITNESSES.wildfire.a, launcherId: profile === 'economy' ? 'lv-shared-24' : 'lv-express-30' }
      await assembleHangar(page, config)
      await expect(page.locator('#build-blocker')).toHaveText(en ? 'Ready for preflight' : 'Готово до перевірки')
      await expect(page.getByTestId('build-schedule')).toContainText(
        `${formatValue(profile === 'economy' ? 35 : 26, 'months', locale)} / ${formatValue(profile === 'economy' ? 36 : 27, 'months', locale)}`)
      await expectReflow(page)
      await launch()
      await expect(page.getByTestId('verdict')).toContainText(en ? /provisional/i : /попередн|умовн/i)
      await expect(page.locator('.data-handoff > summary')).toContainText(en ? 'meets the requirement' : 'відповідає вимозі')
      await page.locator('.data-handoff > summary').click()
      await expect(page.locator('.data-handoff')).toContainText(en ? 'Prioritize areas for follow-up' : 'Визначити пріоритетні ділянки')
      await expectReflow(page)
      await page.screenshot({ path: testInfo.outputPath('passing-handoff.png'), fullPage: true })
      const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
      expect(scan.violations.map(violation => violation.id)).toEqual([])
      const settled = await run()
      expect(settled.attempts).toEqual([
        { legId: '0:wildfire:economy', passed: false },
        { legId: `0:wildfire:${profile}`, passed: true },
      ])
      await back()
      const summary = ['1/3', profile === 'economy' ? '3' : '2', profile === 'economy' ? '1' : '2']
      await expect(page.locator('.expedition-status dd')).toHaveText(summary)
      await page.locator('.expedition-history > summary').click()
      await expect(page.locator('.expedition-history li')).toHaveCount(2)
      expect(await page.evaluate(() => localStorage.getItem('mission-forge.campaign.v1'))).toBe(campaign)
      await page.reload()
      if (!en) await page.getByRole('button', { name: 'Українська', exact: true }).click()
      await open()
      await expect(page.locator('.expedition-status dd')).toHaveText(summary)
      expect(await run()).toEqual(settled)
      expect(await page.evaluate(() => localStorage.getItem('mission-forge.campaign.v1'))).toBe(campaign)
      expect(errors).toEqual([])
      console.info('FINAL_EXPEDITION', JSON.stringify({ locale, profile, summary, attempts: settled.attempts, campaignUnchanged: true }))
    })
  }

  test(`final playtest: launch bookings and Research preserve draft (${locale})`, async ({ page }, testInfo) => {
    await page.addInitScript(() => localStorage.setItem('mission-forge.academy.v1', 'seen'))
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: en ? 1440 : 320, height: 900 })
    await page.goto('./?renderer=svg')
    if (!en) {
      await page.getByRole('button', { name: 'Українська', exact: true }).click()
      await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
    }
    await page.getByRole('button', { name: en ? 'Customize' : 'Налаштувати', exact: true }).click()
    await assembleHangar(page, { ...PLAYER_WITNESSES.wildfire.a, launcherId: 'lv-shared-24' })
    // Inspect the same build with each booking before launching.
    const totals: string[] = []
    for (const [id, price, queue] of [['lv-shared-24', 355_000, 13], ['lv-express-30', 475_000, 4]] as const) {
      const tile = page.locator(`[data-part-id="${id}"]`)
      await tile.click()
      const inspector = page.locator('.part-hud')
      await expect(inspector.locator('.hud-stats').first()).toContainText(formatValue(price, 'USD', locale))
      await expect(inspector.locator('.hud-stats').first()).toContainText(formatValue(queue, 'months', locale))
      totals.push(await page.getByTestId('build-usd').innerText())
      await expectReflow(page)
      await page.screenshot({ path: testInfo.outputPath(`${id}.png`), fullPage: true })
      await expect(tile.locator('.part-warning')).toHaveCount(0)
    }
    expect(totals[0]).not.toBe(totals[1])
    const config = { ...PLAYER_WITNESSES.wildfire.a, launcherId: 'lv-express-30' }
    await page.getByRole('button', { name: en ? '← Main menu' : '← Головне меню', exact: true }).click()
    await page.getByRole('button', { name: en ? 'Research' : 'Дослідження', exact: true }).click()
    await expect(page.getByTestId('research-wallet')).toHaveText(en ? '0 credits' : '0 кредитів')
    const locked = page.locator('[data-research-id="rf-x"]')
    await locked.focus()
    await page.keyboard.press('Enter')
    await expect(locked).toHaveAttribute('data-state', 'unavailable')
    await expectReflow(page)
    await page.screenshot({ path: testInfo.outputPath('research.png'), fullPage: true })
    const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(scan.violations.map(violation => ({ id: violation.id, targets: violation.nodes.map(node => node.target) }))).toEqual([])
    if (!en) {
      const inspector = page.locator('#research-inspector')
      await locked.focus()
      // Reach the inspector with Tab, not a pointer or programmatic focus.
      for (let index = 0; index < 12 && !await inspector.evaluate(element => element === document.activeElement); index++) {
        await page.keyboard.press('Tab')
      }
      await expect(inspector).toBeFocused()
      await page.keyboard.press('End')
      await expect.poll(() => inspector.evaluate(element => element.scrollTop)).toBeGreaterThan(0)
    }
    await page.getByRole('button', { name: en ? 'Back' : 'Назад', exact: true }).click()
    await page.getByRole('button', { name: en ? 'Customize' : 'Налаштувати', exact: true }).click()
    await expect(page.getByTestId('build-progress')).toHaveText('8/8')
    for (const field of SLOT_FIELDS) {
      await page.locator(`[data-slot="${field}"]`).click()
      await expect(page.locator(`[data-part-id="${config[field]}"]`)).toHaveAttribute('aria-pressed', 'true')
    }
    await page.getByRole('button', { name: en ? 'Launch' : 'Запуск', exact: true }).click()
    await expect(page.getByTestId('verdict')).toContainText(en ? /provisional/i : /попередн|умовн/i)
    console.info('FINAL_HANGAR', JSON.stringify({ locale, totals, draftPreserved: true }))
  })
}
