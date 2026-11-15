import type { Page } from '@playwright/test'
import { SLOT_FIELDS } from '../../src/engine/draft'
import type { MissionConfiguration } from '../../src/engine/types'
import { FIRST_MISSION, WF_A } from '../../src/fixtures/builds'

export const FIRST_PLAYER = {...FIRST_MISSION,busId:'bus-12u-light'}
export const STARTER_PASS = {...WF_A,busId:'bus-12u-light'}
export async function assembleEngineering(page:Page,config:MissionConfiguration=FIRST_PLAYER) {
  for(const field of SLOT_FIELDS)await page.locator(`#${field}`).selectOption(config[field])
}
export async function assembleHangar(page:Page,config:MissionConfiguration=FIRST_PLAYER) {
  for(const field of SLOT_FIELDS){
    await page.locator(`[data-slot="${field}"]`).click()
    await page.locator(`[data-part-id="${config[field]}"]`).click()
  }
}
export async function assembleTraining(page:Page) {
  for(const field of SLOT_FIELDS)await page.locator(`[data-guide-slot="${field}"]`).selectOption(FIRST_MISSION[field])
}
export async function discloseReport(page:Page) {
  const report=page.locator('details.full-report')
  if(await report.count() && !(await report.getAttribute('open')!==null))await report.locator(':scope > summary').click()
}
