import { useRef, useState } from 'react'
import type { Locale } from '../../engine/types'
import { PLAYER_MISSIONS as MISSIONS } from '../../data/player/missions'
import { CAMPAIGN_SHOP, CAMPAIGN_UPGRADES, campaignCredits, campaignOwnsPart, campaignPurchaseReady, type CampaignProgress } from '../../campaign/progress'
import './research.css'
import { partShortName } from '../partLabels'
import { translate } from '../../i18n'

export interface ResearchProps {
  active:boolean; progress:CampaignProgress; locale:Locale
  onCampaign:()=>void; onBack:()=>void; onBuy:(id:string)=>void; onRefund:(id:string)=>void
  storageError?:boolean; refundedDrafts?:boolean
}
const icons: Record<string,string> = {busId:'▣',arrayId:'☀',batteryId:'▤',radioId:'◉',payloadId:'⬡'}
export default function ResearchScreen({active,progress,locale,onCampaign,onBack,onBuy,onRefund,storageError,refundedDrafts}:ResearchProps) {
  const en=locale==='en'
  const [selected,setSelected]=useState('bus-12u')
  const touch=useRef(false)
  const keyboard=useRef(false)
  const armed=useRef<string|null>(null)
  const wallet=campaignCredits(progress)
  const parts=MISSIONS.flatMap(m=>Object.values(m.context.catalog).flat())
  const name=(id:string)=>parts.find(p=>p.id===id)?.label[locale] ?? id
  const node=CAMPAIGN_UPGRADES.find(n=>n.partId===selected)!
  const item=CAMPAIGN_SHOP.find(n=>n.partId===selected)
  const status=(id:string) => campaignOwnsPart(progress,id) ? 'owned'
    : active && campaignPurchaseReady(progress,id) && wallet >= (CAMPAIGN_SHOP.find(n=>n.partId===id)?.credits ?? Infinity) ? 'buyable' : 'unavailable'
  const reason=(id:string) => {
    const n=CAMPAIGN_UPGRADES.find(p=>p.partId===id)!
    const shop=CAMPAIGN_SHOP.find(p=>p.partId===id)
    return status(id)==='owned' ? (en?'Owned — equip separately in Customize.':'Ваше — установіть окремо в ангарі.')
      : !active ? (en?'Sandbox preview. Enter Campaign to buy.':'Огляд у пісочниці. Перейдіть до кампанії для покупки.')
      : !campaignPurchaseReady(progress,id) ? `${en?'Requires':'Потрібно'}: ${name(n.prerequisiteId!)}`
      : `${en?'Need':'Бракує'} ${Math.max(0,(shop?.credits ?? 0)-wallet)} ${en?'credits':'кредитів'}`
  }
  const inspect=(id:string)=>{if(selected!==id)armed.current=null;setSelected(id)}
  const renderNode=(id:string, descendants=true): React.ReactNode => {
    const n=CAMPAIGN_UPGRADES.find(p=>p.partId===id)!
    const state=status(id)
    return <li key={id} data-parent={n.prerequisiteId ?? ''}><button data-research-id={id} data-state={state}
      aria-pressed={selected===id} aria-describedby={selected===id?'research-inspector':undefined}
      onPointerEnter={event=>{if(event.pointerType!=='touch' && !keyboard.current)inspect(id)}}
      onPointerMove={event=>{if(event.pointerType!=='touch' && (event.movementX || event.movementY)){keyboard.current=false;inspect(id)}}}
      onFocus={()=>{keyboard.current=true;inspect(id)}}
      onKeyDown={()=>{keyboard.current=true;touch.current=false}}
      onPointerDown={event=>{keyboard.current=false;touch.current=event.pointerType==='touch'}}
      onClick={()=>{
        inspect(id)
        if(touch.current && (armed.current!==id || selected!==id)) {
          armed.current=id
          document.getElementById('research-inspector')?.scrollIntoView?.({block:'nearest'})
          return
        }
        armed.current=null
        if(state==='buyable')onBuy(id)
      }}>
      <span className="research-icon" aria-hidden="true">{icons[n.field] ?? '◇'}</span>
      <span className="research-name">{partShortName(parts.find(p=>p.id===id)!,locale)}</span>
      <span className="research-state">{state==='owned'?'✓':state==='buyable'?'+':'×'} {state==='owned'?(en?'Owned':'Ваше'):state==='buyable'?(en?'Buy':'Купити'):(en?'Locked':'Закрито')}</span>
    </button>{descendants && CAMPAIGN_UPGRADES.some(child=>child.prerequisiteId===id) &&
      <ol>{CAMPAIGN_UPGRADES.filter(child=>child.prerequisiteId===id).map(child=>renderNode(child.partId))}</ol>}</li>
  }
  return <main className="research-screen" aria-labelledby="research-title">
    <header><h1 id="research-title" tabIndex={-1}>{en?'Research':'Дослідження'}</h1>
      <strong data-testid="research-wallet">{wallet} {en?'credits':'кредитів'}</strong>
      <button onClick={onBack}>{en?'Back':'Назад'}</button>
      {!active && <button onClick={onCampaign}>{en?'Enter Campaign':'Перейти до кампанії'}</button>}
    </header>
    {storageError && <p role="alert">{translate(locale,'campaign.storageError')}</p>}
    <div className="research-layout"><div className="research-map" aria-label={en?'Connected equipment map':'Пов’язана карта обладнання'}>
      <ol className="research-root">{renderNode('bus-12u',false)}</ol>
      <div className="research-branches">{([
        ['arrayId',en?'Power':'Живлення'],['radioId',en?'Communications':'Зв’язок'],
        ['payloadId',en?'Instruments':'Прилади'],['batteryId',en?'Storage':'Накопичення'],
      ] as const).map(([field,title])=><section key={field}><h2>{title}</h2><ol>{CAMPAIGN_UPGRADES.filter(n=>n.field===field && n.prerequisiteId==='bus-12u').map(n=>renderNode(n.partId))}</ol></section>)}</div>
    </div><aside id="research-inspector" className="research-inspector" aria-live="polite">
      <h2>{name(selected)}</h2><dl>
        <div><dt>{en?'Price':'Ціна'}</dt><dd data-testid="research-price">{item?.credits ?? 0} {en?'credits':'кредитів'}</dd></div>
        <div><dt>{en?'Effect':'Дія'}</dt><dd>{node.tradeoff[locale]}</dd></div>
        {node.prerequisiteId && <div><dt>{en?'Prerequisite':'Передумова'}</dt><dd>{name(node.prerequisiteId)}</dd></div>}
      </dl>
      <p role="status">{status(selected)==='buyable' ? (en?'Available. Activate this node to buy once.':'Доступно. Активуйте вузол для однієї покупки.') : reason(selected)}</p>
      {refundedDrafts && <p role="status">{en?'Refunded equipment cleared from Campaign drafts. Select replacements in Customize.':'Повернуте обладнання знято з проєктів кампанії. Виберіть заміни в ангарі.'}</p>}
      {item && status(selected)==='owned' && <button data-testid={`research-refund-${selected}`} onClick={()=>onRefund(selected)}>{en?'Refund':'Повернути'} +{progress.paidParts[selected]}</button>}
    </aside></div>
  </main>
}
