import { chromium } from 'playwright-core'
import { mkdir,writeFile } from 'node:fs/promises'
const browser=await chromium.launch({channel:'chrome',headless:true})
await mkdir('docs/screenshots/qa',{recursive:true})
const all=[]
for(const locale of ['en','ua'])for(const [viewport,width,text] of [['desktop',1440,100],['phone',390,100],['reflow',320,200]]){
  const en=locale==='en'
  const page=await browser.newPage({viewport:{width,height:960},reducedMotion:'reduce'})
  await page.addInitScript(()=>localStorage.setItem('mission-forge.academy.v1','seen'))
  await page.goto(process.env.BASELINE_URL ?? 'http://127.0.0.1:4174/nasa-space-apps/')
  await page.locator('.craft-scene[data-renderer="webgl"]').waitFor()
  await page.locator('.craft-fallback').waitFor({state:'detached'})
  if(text===200)await page.evaluate(()=>document.documentElement.style.fontSize='200%')
  if(!en)await page.getByRole('button',{name:'Українська',exact:true}).click()
  const counts={}
  for(const screen of ['menu','hangar','debrief','missions','research']){
    if(screen==='hangar')await page.getByRole('button',{name:en?'Customize':'Налаштувати',exact:true}).click()
    if(screen==='debrief')await page.getByRole('button',{name:en?'Launch':'Запуск',exact:true}).click()
    if(screen==='missions'||screen==='research'){
      await page.getByRole('button',{name:en?'← Main menu':'← Головне меню',exact:true}).click()
      await page.getByRole('button',{name:screen==='missions'?(en?'Missions':'Місії'):(en?'Campaign':'Кампанія'),exact:true}).click()
    }
    if(screen==='hangar'){
      await page.locator('.craft-scene').scrollIntoViewIfNeeded()
      await page.locator('.craft-scene[data-renderer="webgl"]').waitFor()
      await page.locator('.craft-fallback').waitFor({state:'detached'})
    }
    counts[screen]=await page.locator('p').evaluateAll(nodes=>nodes.filter(p=>p.checkVisibility()
      &&!p.closest('.sr-only')&&!p.classList.contains('sr-only')&&!p.closest('details:not([open])')).length)
    await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0)})
    await page.screenshot({path:`docs/screenshots/qa/before-${screen}-${viewport}-${locale}.png`,fullPage:true})
  }
  all.push({sha:'2e92cb49a6be256d32128d2433697fa79eaa5bd2',locale,viewport,width,text,counts})
  await page.close()
}
await writeFile('docs/screenshots/qa/baseline-counts.json',JSON.stringify(all,null,2)+'\n')
console.log(JSON.stringify(all,null,2))
await browser.close()
