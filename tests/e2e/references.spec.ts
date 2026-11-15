import { expect, test } from '@playwright/test'

for (const locale of ['en', 'ua'] as const) {
  test(`all three audited builds remain provisional in the real UI (${locale})`, async ({ page }) => {
    await page.goto('./?view=engineering')
    if (locale === 'ua') await page.getByRole('button', { name: 'Українська', exact: true }).click()
    for (const [array, battery, radio, ground, latency] of [
      ['arr-deploy-l', 'bat-s', 'rf-s', 'gs-service', /2[.,]2/],
      ['arr-deploy-l', 'bat-m', 'rf-x', 'gs-network', /3[.,]1/],
      ['arr-deploy-xl', 'bat-m', 'rf-s', 'gs-service', /2[.,]2/],
    ] as const) {
      await page.locator('#arrayId').selectOption(array)
      await page.locator('#batteryId').selectOption(battery)
      await page.locator('#radioId').selectOption(radio)
      await page.locator('#groundId').selectOption(ground)
      await page.getByRole('button', { name: locale === 'en' ? 'Run mission' : 'Запустити місію', exact: true }).click()
      await expect(page.getByTestId('verdict')).toContainText(locale === 'en' ? /provisional/i : /попередн|умовн/i)
      await expect(page.getByTestId('latency-value')).toContainText(latency)
      await expect(page.getByTestId('report-origin')).toContainText(/evaluator|обчислювач/i)
      await expect(page.getByTestId('stale-notice')).toHaveCount(0)
    }
  })
}
