import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { assembleEngineering } from './assembly'

for (const locale of ['en', 'ua'] as const) {
  test(`WCAG automated checks, mobile text reflow and reduced motion (${locale})`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('./?view=engineering')
    if (locale === 'ua') await page.getByRole('button', { name: 'Українська', exact: true }).click()
    await assembleEngineering(page)
    await page.getByRole('button', { name: locale === 'en' ? 'Run mission' : 'Запустити місію', exact: true }).click()
    const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    expect(scan.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([])
    await page.setViewportSize({ width: 390, height: 844 })
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
    const overflow = await page.evaluate(() => [...document.querySelectorAll('body *')]
      .filter(el => el.getBoundingClientRect().right > innerWidth + 1)
      .map(el => ({ tag: el.tagName, className: el.className, text: el.textContent?.slice(0, 80), right: el.getBoundingClientRect().right })).slice(0, 15))
    expect(overflow).toEqual([])
    await expect(page.getByTestId('verdict')).toBeVisible()
    await expect(page.getByTestId('latency-value')).toContainText(/7[.,]1/)
    await page.getByLabel(locale === 'en' ? 'Ground service' : 'Наземний сервіс', { exact: true }).selectOption('gs-network')
    await page.getByRole('button', { name: locale === 'en' ? 'Run mission' : 'Запустити місію', exact: true }).click()
    await expect(page.getByTestId('latency-value')).toContainText(/3[.,]1/)
    await page.setViewportSize({ width: 320, height: 844 })
    // Audit the disclosed content too, not just the compact control deck.
    for (const summary of await page.locator('main details > summary').all()) {
      if (!(await summary.evaluate(el => el.parentElement?.hasAttribute('open')))) await summary.click()
    }
    const narrowOverflow = await page.evaluate(() => [...document.querySelectorAll('body *')]
      .filter(el => el.getBoundingClientRect().right > innerWidth + 1)
      .map(el => ({ tag: el.tagName, className: el.className, text: el.textContent?.slice(0, 60), right: el.getBoundingClientRect().right })).slice(0, 15))
    expect(narrowOverflow).toEqual([])
    const repairedScan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    expect(repairedScan.violations.map(v => v.id)).toEqual([])
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)
    await page.screenshot({ path: testInfo.outputPath(`reflow-${locale}.png`) })
  })
}
