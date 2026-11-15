import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
for (const locale of ['en', 'ua'] as const) {
  test(`relay ingress is not egress, real route repair (${locale})`, async ({ page }, testInfo) => {
    await page.goto('./?view=engineering')
    if (locale === 'ua') await page.getByRole('button', { name: 'Українська', exact: true }).click()
    await page.locator('#mission-picker').selectOption('packet-relay')
    const run = page.getByRole('button', { name: locale === 'en' ? 'Run mission' : 'Запустити місію', exact: true })
    await run.click()
    await expect(page.getByTestId('requirement-RL-INGRESS')).toContainText(locale === 'en' ? 'Met' : 'Виконано')
    await expect(page.getByTestId('requirement-RL-ROUTE')).toContainText(locale === 'en' ? 'Not met' : 'Не виконано')
    await page.locator('.repair-cta').click()
    await expect(page.locator('#groundId')).toBeFocused()
    await page.locator('#groundId').selectOption('gs-network')
    await run.click()
    await expect(page.getByTestId('verdict')).toContainText(locale === 'en' ? /provisional/i : /попередн|умовн/i)
    await expect(page.getByTestId('latency-value')).toContainText(/1[.,]8/)
    await expect(page.getByTestId('requirement-WF-GSD')).toHaveCount(0)
    await page.screenshot({ path: testInfo.outputPath(`relay-pass-${locale}.png`) })
    const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(scan.violations.map(v => v.id)).toEqual([])
    await page.locator('#payloadId').selectOption('pl-thermal')
    await run.click()
    await expect(page.getByTestId('requirement-RL-CAPABILITY')).toContainText(locale === 'en' ? 'Not met' : 'Не виконано')
  })
}
