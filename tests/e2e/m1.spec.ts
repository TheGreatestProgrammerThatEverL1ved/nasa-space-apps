import { expect, test, type Locator, type Page } from '@playwright/test'

async function tabTo(page: Page, target: Locator) {
  for (let i = 0; i < 70; i++) {
    if (await target.evaluate(el => el === document.activeElement)) return
    await page.keyboard.press('Tab')
  }
  await expect(target).toBeFocused()
}

for (const locale of ['en', 'ua'] as const) {
  test(`M1 real keyboard failure → network repair (${locale})`, async ({ page }, testInfo) => {
    const errors: string[] = []
    const failedAssets: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('response', response => {
      if (response.status() >= 400) failedAssets.push(`${response.status()} ${response.url()}`)
    })
    await page.goto('./')
    if (locale === 'ua') {
      const toggle = page.getByRole('button', { name: 'Українська', exact: true })
      await tabTo(page, toggle)
      await page.keyboard.press('Enter')
    }
    await expect(page.locator('html')).toHaveAttribute('lang', locale === 'ua' ? 'uk' : 'en')
    const run = page.getByRole('button', { name: locale === 'en' ? 'Run mission' : 'Запустити місію', exact: true })
    await tabTo(page, run)
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('latency-value')).toContainText(/7[.,]1/)
    await expect(page.getByTestId('verdict')).toContainText(locale === 'en' ? /repair/i : /ремонт|виправ|невда|не відповідає/i)
    await expect(page.getByTestId('requirement-WF-LATENCY')).toContainText(/6/)
    await expect(page.getByTestId('report-origin')).toContainText(/evaluator|обчислювач/i)
    await expect(page.getByTestId('verdict')).toBeFocused()
    const ground = page.getByLabel(locale === 'en' ? 'Ground service' : 'Наземний сервіс', { exact: true })
    await tabTo(page, ground)
    await expect(ground).toHaveValue('gs-single')
    await page.keyboard.press('ArrowDown')
    await expect(ground).toHaveValue('gs-network')
    await expect(page.getByTestId('stale-notice')).toBeVisible()
    await tabTo(page, run)
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('latency-value')).toContainText(/3[.,]1/)
    await expect(page.getByTestId('verdict')).toContainText(locale === 'en' ? /provisional/i : /попередн|умовн/i)
    await expect(page.getByTestId('stale-notice')).toHaveCount(0)
    expect(errors).toEqual([])
    expect(failedAssets).toEqual([])
    await page.screenshot({ path: testInfo.outputPath(`repaired-${locale}.png`) })
    await page.reload()
    // Reload intentionally starts a new unsaved design in the primary language.
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByLabel('Ground service', { exact: true })).toHaveValue('gs-single')
    expect(failedAssets).toEqual([])
  })
}
