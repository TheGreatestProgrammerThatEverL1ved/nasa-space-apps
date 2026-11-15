import { expect, test } from '@playwright/test'
import { NEW_PARTS } from '../../src/data/player/catalog'
import { assembleHangar, FIRST_PLAYER } from './assembly'

for(const renderer of ['webgl','svg'] as const)test(`all new mounted shapes and service choices render (${renderer})`,async({page})=>{
  test.setTimeout(60000)
  await page.addInitScript(()=>localStorage.setItem('mission-forge.academy.v1','seen'))
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.setViewportSize({width:1440,height:960})
  await page.goto(renderer==='svg'?'./?renderer=svg':'./')
  await page.getByRole('button',{name:'Missions',exact:true}).click()
  await page.locator('[data-mission-id="visible-mapping"]').getByRole('button').click()
  await assembleHangar(page,{...FIRST_PLAYER,scenarioId:'visible-mapping',payloadId:'pl-visible-35'})
  await expect(page.locator('.craft-scene')).toHaveAttribute('data-renderer',renderer)
  if(renderer==='webgl')await expect(page.locator('.craft-fallback')).toHaveCount(0)
  const field={bus:'busId',payload:'payloadId',array:'arrayId',battery:'batteryId',radio:'radioId',ground:'groundId'} as const
  const stage=page.locator('.craft-inspection')
  const reference={busId:'bus-12u',payloadId:'pl-visible-35',arrayId:'arr-deploy-l',
    batteryId:'bat-s',radioId:'rf-x',groundId:'gs-single'}
  for(const part of NEW_PARTS){
    const slot=field[part.category as keyof typeof field]
    await page.locator(`[data-slot="${slot}"]`).click()
    await page.locator(`[data-part-id="${reference[slot]}"]`).click()
    const before=await stage.screenshot()
    await page.locator(`[data-part-id="${part.id}"]`).click()
    await expect(page.locator('.part-hud')).toContainText(part.label.en)
    if(part.category!=='ground'){
      await expect(page.locator('.craft-scene')).toHaveAttribute(`data-${part.category}-id`,part.id)
      await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))))
      expect(before.equals(await stage.screenshot()),part.id).toBe(false)
    }else{
      // Ground remains a service preview, never a mounted mesh.
      await expect(page.locator('.part-hud > .game-eyebrow')).toContainText('SERVICE')
    }
  }
  await page.locator('[data-slot="payloadId"]').click()
  await page.locator('[data-part-id="pl-thermal-survey"]').click()
  await page.screenshot({path:`docs/screenshots/qa/installed-new-parts-${renderer}.png`,fullPage:true})
})
