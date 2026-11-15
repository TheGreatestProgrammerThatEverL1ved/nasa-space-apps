import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App'
import ResearchScreen from '../../src/ui/research/ResearchScreen'
import { CAMPAIGN_STORAGE_KEY, EMPTY_CAMPAIGN, parseCampaign } from '../../src/campaign/progress'
import { PLAYER_MISSIONS } from '../../src/data/player/missions'
import { SLOT_FIELDS } from '../../src/engine/draft'
import { assemble } from './assemble'
import { WF_A } from '../../src/fixtures/builds'

afterEach(()=>{cleanup();localStorage.clear();window.history.replaceState({},'','/')})
const funded=()=>parseCampaign(JSON.stringify({version:2,completedMissionIds:PLAYER_MISSIONS.map(m=>m.id),unlockedPartIds:[]}))
it.each(['en','ua'] as const)('all eight actual controls start empty for all missions and mode caches stay separate (%s)',async locale=>{
  const user=userEvent.setup()
  localStorage.setItem(CAMPAIGN_STORAGE_KEY,JSON.stringify(parseCampaign(JSON.stringify({version:2,
    completedMissionIds:PLAYER_MISSIONS.map(m=>m.id),unlockedPartIds:['rf-x','pl-visible-35','pl-relay']}))))
  render(<App presentation="engineering"/>)
  if(locale==='ua')await user.click(screen.getByRole('button',{name:'Українська'}))
  for(const campaign of [false,true]){
    if(campaign)await user.click(screen.getByRole('button',{name:locale==='en'?'Play campaign':'Грати кампанію'}))
    for(const m of PLAYER_MISSIONS){
      await user.selectOptions(document.getElementById('mission-picker')!,m.id)
      for(const f of SLOT_FIELDS)expect((document.getElementById(f) as HTMLSelectElement).value).toBe('')
      expect((document.querySelector('.run-button') as HTMLButtonElement).disabled).toBe(true)
      await user.selectOptions(document.getElementById('busId')!,'bus-12u-light')
    }
  }
  await user.selectOptions(document.getElementById('mission-picker')!,'wildfire')
  expect((document.getElementById('busId') as HTMLSelectElement).value).toBe('bus-12u-light')
  await user.click(screen.getByRole('button',{name:locale==='en'?'Clear Build':'Очистити проєкт'}))
  for(const f of SLOT_FIELDS)expect((document.getElementById(f) as HTMLSelectElement).value).toBe('')
  await user.selectOptions(document.getElementById('mission-picker')!,'urban-heat')
  expect((document.getElementById('busId') as HTMLSelectElement).value).toBe('bus-12u-light')
})
it('empty orbital craft draws no installed hardware, assembly is explicit, removal/clear and navigation restore only intent',async()=>{
  localStorage.setItem('mission-forge.academy.v1','seen')
  const user=userEvent.setup()
  const {container}=render(<App/>)
  await user.click(screen.getByRole('button',{name:/Customize/}))
  expect(screen.getByTestId('build-progress').textContent).toBe('0/8')
  expect(container.querySelector<HTMLButtonElement>('.build-actions .game-primary')!.disabled).toBe(true)
  expect(container.querySelector('[data-hardware]')).toBeNull()
  for(const field of SLOT_FIELDS){
    await user.click(container.querySelector<HTMLButtonElement>(`[data-slot="${field}"]`)!)
    await user.click(container.querySelector<HTMLButtonElement>(`[data-part-id="${WF_A[field]}"]`)!)
  }
  expect(screen.getByTestId('build-progress').textContent).toBe('8/8')
  await user.click(screen.getByRole('button',{name:'Remove selected part'}))
  expect(screen.getByTestId('build-progress').textContent).toBe('7/8')
  await user.click(screen.getByRole('button',{name:'← Main menu'}))
  await user.click(screen.getByRole('button',{name:/Customize/}))
  expect(screen.getByTestId('build-progress').textContent).toBe('7/8')
  await user.click(screen.getByRole('button',{name:'Clear Build'}))
  expect(screen.getByTestId('build-progress').textContent).toBe('0/8')
})
it('Research has 12 inspectable icon nodes, eight purchases, status cues and preview-before-touch-activation',async()=>{
  const user=userEvent.setup(),buy=vi.fn(),refund=vi.fn()
  const {container}=render(<ResearchScreen active progress={funded()} locale="en" onCampaign={()=>{}} onBack={()=>{}} onBuy={buy} onRefund={refund}/>)
  expect(container.querySelectorAll('[data-research-id]')).toHaveLength(12)
  const node=container.querySelector<HTMLButtonElement>('[data-research-id="rf-x"]')!
  await user.hover(node)
  expect(screen.getByTestId('research-price').textContent).toBe('100 credits')
  expect(node.dataset.state).toBe('buyable')
  expect(container.querySelector('[data-research-id="bus-12u"]')?.getAttribute('data-state')).toBe('owned')
  expect(container.querySelector('[data-research-id="pl-relay"]')?.getAttribute('data-state')).toBe('unavailable')
  // jsdom lacks PointerEvent; define only the event shape needed by React.
  const touch=new Event('pointerdown',{bubbles:true})
  Object.defineProperty(touch,'pointerType',{value:'touch'})
  fireEvent(node,touch);fireEvent.click(node)
  expect(buy).not.toHaveBeenCalled()
  expect(screen.getByTestId('research-price').textContent).toBe('100 credits')
  fireEvent(node,touch);fireEvent.click(node)
  expect(buy).toHaveBeenCalledWith('rf-x')
  buy.mockClear()
  await user.click(container.querySelector('[data-research-id="pl-relay"]')!)
  await user.click(container.querySelector('[data-research-id="bus-12u"]')!)
  expect(buy).not.toHaveBeenCalled()
})
it('purchase never equips; refund removes the equipped slot without substituting it',async()=>{
  localStorage.setItem(CAMPAIGN_STORAGE_KEY,JSON.stringify(funded()))
  const user=userEvent.setup()
  render(<App presentation="engineering"/>)
  await user.click(screen.getByRole('button',{name:'Play campaign'}))
  await assemble(user,WF_A)
  await user.click(screen.getByTestId('unlock-rf-x'))
  expect((document.getElementById('radioId') as HTMLSelectElement).value).toBe('rf-s')
  await user.selectOptions(document.getElementById('radioId')!,'rf-x')
  await user.click(screen.getByTestId('refund-rf-x'))
  expect((document.getElementById('radioId') as HTMLSelectElement).value).toBe('')
  expect((document.querySelector('.run-button') as HTMLButtonElement).disabled).toBe(true)
  expect(screen.getByText(/Refunded equipment removed/)).toBeTruthy()
  expect(EMPTY_CAMPAIGN.completedMissionIds).toHaveLength(0)
})
it('clearly labelled audited reference tooling cannot enter Campaign or award player credits',async()=>{
  window.history.replaceState({},'','/?view=engineering&catalog=reference')
  const user=userEvent.setup()
  render(<App/>)
  expect(screen.getByText(/Internal audited reference tooling/)).toBeTruthy()
  expect(screen.queryByRole('button',{name:'Play campaign'})).toBeNull()
  await assemble(user,WF_A)
  await user.click(screen.getByRole('button',{name:'Run mission'}))
  expect(screen.getByTestId('verdict').textContent).toMatch(/provisional/i)
  expect(localStorage.getItem(CAMPAIGN_STORAGE_KEY)).toBeNull()
})
