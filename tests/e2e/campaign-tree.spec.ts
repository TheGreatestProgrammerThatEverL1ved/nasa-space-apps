import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { assembleHangar, FIRST_PLAYER, STARTER_PASS } from './assembly'

for(const locale of ['en','ua'] as const) {
  test(`Research supports legitimate mapping-first / comms-first campaign (${locale})`,async({page})=>{
    const en=locale==='en',errors:string[]=[]
    page.on('pageerror',e=>errors.push(e.message))
    await page.addInitScript(()=>localStorage.setItem('mission-forge.academy.v1','seen'))
    await page.emulateMedia({reducedMotion:'reduce'})
    await page.goto('./?renderer=svg')
    if(!en)await page.getByRole('button',{name:'Українська',exact:true}).click()
    await page.getByRole('button',{name:en?'Campaign':'Кампанія',exact:true}).click()
    const board=async()=>{
      await page.getByRole('button',{name:en?'← Main menu':'← Головне меню',exact:true}).click()
      await page.getByRole('button',{name:en?'Missions':'Місії',exact:true}).click()
    }
    const research=()=>page.getByRole('button',{name:en?'Research':'Дослідження',exact:true}).click()
    const buy=async(id:string)=>{
      await page.locator(`[data-research-id="${id}"]`).focus()
      await page.keyboard.press('Enter')
      await expect(page.locator(`[data-research-id="${id}"]`)).toHaveAttribute('data-state','owned')
    }
    const clear=async(id:string)=>{
      await page.locator(`[data-mission-id="${id}"]`).getByRole('button').click()
      await expect(page.getByTestId('build-progress')).toHaveText('0/8')
      const config=id==='wildfire'||id==='urban-heat'?{...STARTER_PASS,scenarioId:id}
        :{...FIRST_PLAYER,scenarioId:id,payloadId:id==='visible-mapping'?'pl-visible-35':'pl-relay',
          radioId:id==='packet-relay'?'rf-x':'rf-s',groundId:'gs-network'}
      await assembleHangar(page,config)
      await page.getByRole('button',{name:en?'Launch':'Запуск',exact:true}).click()
      await expect(page.getByTestId('verdict')).toContainText(en?/provisional/i:/попередн|умовн/i)
    }
    await research()
    await expect(page.locator('[data-research-id]')).toHaveCount(12)
    await expect(page.locator('[data-research-id="pl-relay"]')).toHaveAttribute('data-state','unavailable')
    await board();await clear('wildfire')
    await research()
    if(en){
      await buy('pl-visible-35');await board();await clear('visible-mapping')
      await research()
      await page.locator('[data-research-id="pl-visible-35"]').focus()
      await page.getByTestId('research-refund-pl-visible-35').click()
      await expect(page.getByTestId('build-progress')).toHaveText('7/8')
      await research();await buy('rf-x');await buy('pl-relay')
      await board();await clear('packet-relay');await board();await clear('urban-heat')
      await research();await buy('pl-visible-35')
    }else{
      await buy('rf-x');await board();await clear('urban-heat')
      await research();await buy('pl-relay');await board();await clear('packet-relay')
      await research();await buy('pl-visible-35');await board();await clear('visible-mapping')
      await research()
    }
    await expect(page.getByTestId('research-wallet')).toHaveText(en?'300 credits':'300 кредитів')
    const ledger=await page.evaluate(()=>JSON.parse(localStorage.getItem('mission-forge.campaign.v1')!))
    expect(ledger.completedMissionIds).toEqual(en?['wildfire','visible-mapping','packet-relay','urban-heat']:['wildfire','urban-heat','packet-relay','visible-mapping'])
    expect(ledger.version).toBe(3)
    const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()
    expect(scan.violations.map(v=>v.id)).toEqual([])
    await page.reload()
    if(!en)await page.getByRole('button',{name:'Українська',exact:true}).click()
    await page.getByRole('button',{name:en?'Campaign':'Кампанія',exact:true}).click()
    await research()
    await expect(page.getByTestId('research-wallet')).toHaveText(en?'300 credits':'300 кредитів')
    expect(errors).toEqual([])
  })
}
test('Research historical refund basis and current rebuy price survive reload',async({page})=>{
  await page.addInitScript(()=>{localStorage.setItem('mission-forge.academy.v1','seen')})
  await page.goto('./?renderer=svg')
  await page.evaluate(()=>localStorage.setItem('mission-forge.campaign.v1',JSON.stringify({version:2,
    completedMissionIds:['wildfire','urban-heat','visible-mapping','packet-relay'],
    unlockedPartIds:['rf-x','arr-deploy-xl','pl-visible-35','pl-relay']})))
  await page.reload()
  await page.getByRole('button',{name:'Campaign',exact:true}).click()
  await page.getByRole('button',{name:'Research',exact:true}).click()
  const inspect=async(id:string)=>page.locator(`[data-research-id="${id}"]`).focus()
  await inspect('pl-relay')
  await expect(page.getByTestId('research-refund-pl-relay')).toContainText('+100')
  await page.getByTestId('research-refund-pl-relay').click()
  await expect(page.getByTestId('research-wallet')).toHaveText('100 credits')
  await expect(page.locator('[data-research-id="pl-relay"]')).toHaveAttribute('data-state','unavailable')
  await inspect('arr-deploy-xl');await page.getByTestId('research-refund-arr-deploy-xl').click()
  await inspect('pl-relay');await page.keyboard.press('Enter')
  await expect(page.getByTestId('research-wallet')).toHaveText('60 credits')
  await expect(page.getByTestId('research-refund-pl-relay')).toContainText('+140')
  await page.reload()
  await page.getByRole('button',{name:'Campaign',exact:true}).click()
  await page.getByRole('button',{name:'Research',exact:true}).click()
  await inspect('pl-relay');await page.getByTestId('research-refund-pl-relay').click()
  await expect(page.getByTestId('research-wallet')).toHaveText('200 credits')
})
