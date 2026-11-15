import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { assembleEngineering, FIRST_PLAYER } from './assembly'
for (const locale of ['en', 'ua'] as const) {
  test(`visible lens tradeoff and capability repair (${locale})`, async ({ page }, testInfo) => {
    await page.goto('./?view=engineering')
    if (locale === 'ua') await page.getByRole('button', { name: 'Українська', exact: true }).click()
    await page.locator('#mission-picker').selectOption('visible-mapping')
    await assembleEngineering(page,{...FIRST_PLAYER,scenarioId:'visible-mapping',payloadId:'pl-visible-8',radioId:'rf-s',groundId:'gs-network'})
    const run = page.getByRole('button', { name: locale === 'en' ? 'Run mission' : 'Запустити місію', exact: true })
    await run.click()
    await expect(page.getByTestId('requirement-VM-GSD')).toContainText(locale === 'en' ? 'Not met' : 'Не виконано')
    await page.locator('.repair-cta').click()
    await expect(page.locator('#payloadId')).toBeFocused()
    await page.locator('#payloadId').selectOption('pl-visible-35')
    await run.click()
    await expect(page.getByTestId('verdict')).toContainText(locale === 'en' ? /provisional/i : /попередн|умовн/i)
    await page.screenshot({ path: testInfo.outputPath(`visible-pass-${locale}.png`) })
    const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(scan.violations.map(v => v.id)).toEqual([])
    await page.locator('#payloadId').selectOption('pl-visible-70')
    await run.click()
    await expect(page.getByTestId('requirement-VM-FOOTPRINT')).toContainText(/80/)
    await expect(page.getByTestId('verdict')).toContainText(locale === 'en' ? /repair/i : /ремонт|виправ|невда|не відповідає/i)
    await page.locator('#payloadId').selectOption('pl-thermal')
    await run.click()
    await expect(page.getByTestId('requirement-VM-SPECTRUM')).toContainText(locale === 'en' ? 'Not met' : 'Не виконано')
  })
}
