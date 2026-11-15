import type { Locale, MissionConfiguration } from '../engine/types'
import { MISSIONS } from '../data/scenarios'
import { CAMPAIGN_CONTRACTS, CAMPAIGN_SHOP, CAMPAIGN_UPGRADES, campaignComplete, campaignContractAvailable, campaignCredits, campaignOwnsPart, campaignPurchaseReady, type CampaignProgress } from '../campaign/progress'
import { translate } from '../i18n'
import './campaign.css'

interface Props {
  readonly active: boolean; readonly progress: CampaignProgress; readonly locale: Locale
  readonly storageError: boolean; readonly currentMissionId: string; readonly creditDelta: number | null
  readonly onToggle: () => void; readonly onBuy: (partId: string) => void
  readonly onRefund: (partId: string) => void; readonly onFit: (partId: string) => void
  readonly onChoose: (missionId: string) => void
  readonly compactBoard?: boolean
  readonly configuration: MissionConfiguration
}
const parts = MISSIONS.flatMap(m => Object.values(m.context.catalog).flat())
const partName = (id: string, locale: Locale) => parts.find(p => p.id === id)?.label[locale] ?? id
export default function CampaignPanel({ active, progress, locale, storageError, currentMissionId, creditDelta, onToggle, onBuy, onRefund, onFit, onChoose, compactBoard = false, configuration }: Props) {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key)
  const credits = campaignCredits(progress)
  const renderNode = (partId: string) => {
    const node = CAMPAIGN_UPGRADES.find(p => p.partId === partId)!
    const item = CAMPAIGN_SHOP.find(p => p.partId === partId)
    const owned = campaignOwnsPart(progress, partId)
    const ready = !item || campaignPurchaseReady(progress, partId)
    const affordable = !item || credits >= item.credits
    const fitted = configuration[node.field] === partId
    const compatible = Object.values(MISSIONS.find(m => m.id === currentMissionId)!.context.catalog).flat().some(p => p.id === partId)
    return <article className={`upgrade-node${owned ? ' is-owned' : ''}${fitted ? ' is-fitted' : ''}`} data-testid={`upgrade-${partId}`} key={partId}>
      <p className="upgrade-state">{fitted ? (locale === 'en' ? 'FITTED' : 'УСТАНОВЛЕНО') : owned ? t('campaign.owned') : !ready ? (locale === 'en' ? 'PREREQUISITE MISSING' : 'БРАКУЄ ПЕРЕДУМОВИ') : affordable ? (locale === 'en' ? 'AVAILABLE TO UNLOCK' : 'ДОСТУПНЕ ВІДКРИТТЯ') : (locale === 'en' ? 'NEED CREDITS' : 'БРАКУЄ КРЕДИТІВ')}</p>
      <h4>{partName(partId, locale)}</h4>
      {node.prerequisiteId && <p className="upgrade-parent">{locale === 'en' ? 'From: ' : 'Від: '}{partName(node.prerequisiteId, locale)}{!ready && (locale === 'en' ? ' — own this first' : ' — спершу придбайте')}</p>}
      <p>{node.tradeoff[locale]}</p>
      <p className="upgrade-price">{item ? `${item.credits} ${locale === 'en' ? 'credits' : 'кредитів'}` : (locale === 'en' ? 'Starter foundation · already owned' : 'Початкова основа · уже ваша')}</p>
      {!owned && ready && !affordable && item && <p>{locale === 'en' ? `Need ${item.credits - credits} more credits; clear a contract or refund equipment.` : `Потрібно ще ${item.credits - credits} кредитів; пройдіть контракт або поверніть обладнання.`}</p>}
      {item && <button type="button" data-testid={`unlock-${partId}`} disabled={owned || !ready || credits < item.credits} onClick={() => onBuy(partId)}>{owned ? t('campaign.owned') : translate(locale, 'campaign.buy', { credits: item.credits })}</button>}
      {owned && <div className="upgrade-actions">
        <button type="button" data-testid={`fit-${partId}`} onClick={() => onFit(partId)}>{locale === 'en' ? 'Fit on compatible design' : 'Установити в сумісний проєкт'}</button>
        {item && <button type="button" data-testid={`refund-${partId}`} onClick={() => onRefund(partId)}>{locale === 'en' ? 'Refund' : 'Повернути'} +{progress.paidParts[partId]}</button>}
      </div>}
      {owned && !compatible && <p className="upgrade-parent">{locale === 'en' ? 'Choose its compatible contract first; Fit opens mission selection.' : 'Спершу виберіть сумісний контракт; «Установити» відкриє вибір місії.'}</p>}
    </article>
  }
  return <section className="panel campaign-panel" aria-labelledby="campaign-heading">
    <div className="campaign-heading">
      <div><p className="section-kicker">{t('campaign.optional')}</p><h2 id="campaign-heading" tabIndex={-1}>{t('campaign.title')}</h2></div>
      <button type="button" className="campaign-toggle" onClick={onToggle} aria-pressed={active}>{t(active ? 'campaign.direct' : 'campaign.start')}</button>
    </div>
    {!active && <p>{t('campaign.intro')}</p>}
    {active && <>
      <div className="campaign-status" role="status">
        <strong data-testid="campaign-credits">{translate(locale, 'campaign.credits', { count: credits })}</strong>
        <span data-testid="campaign-progress">{translate(locale, 'campaign.progress', { count: progress.completedMissionIds.length, total: CAMPAIGN_CONTRACTS.length })}</span>
        {creditDelta !== null && <strong data-testid="credit-delta">{creditDelta > 0 ? '+' : ''}{creditDelta} {locale === 'en' ? 'credits this action' : 'кредитів за цю дію'}</strong>}
      </div>
      <p className="note">{t('campaign.separate')}</p>
      {!compactBoard && <><h3>{locale === 'en' ? 'Contract board' : 'Дошка контрактів'}</h3>
      <div className="contract-board">{CAMPAIGN_CONTRACTS.map(contract => {
        const mission = MISSIONS.find(m => m.id === contract.missionId)!
        const available = campaignContractAvailable(progress, contract.missionId)
        const completed = progress.completedMissionIds.includes(contract.missionId)
        const missingMissions = contract.prerequisites.filter(id => !progress.completedMissionIds.includes(id))
        const missingParts = contract.requiredParts.filter(id => !progress.unlockedPartIds.includes(id))
        return <article key={contract.missionId} className={`contract-card${currentMissionId === contract.missionId ? ' contract-selected' : ''}`}>
          <p className="section-kicker">{completed ? (locale === 'en' ? 'FIRST CLEAR RECORDED' : 'ПЕРШИЙ ПРОХІД ЗАПИСАНО') : available ? (locale === 'en' ? 'AVAILABLE' : 'ДОСТУПНО') : (locale === 'en' ? 'LOCKED • PREREQUISITES' : 'ЗАКРИТО • ПЕРЕДУМОВИ')}</p>
          <h4>{mission.title[locale]}</h4><p>{mission.subtitle[locale]}</p>
          <p>{completed ? (locale === 'en' ? 'Collected once' : 'Уже отримано один раз') : (locale === 'en' ? 'First-clear reward' : 'Нагорода за перший прохід')}: {progress.awards[contract.missionId] ?? contract.reward} {locale === 'en' ? 'credits' : 'кредитів'}</p>
          {missingMissions.length > 0 && <p>{locale === 'en' ? 'Complete first: ' : 'Спершу пройдіть: '}{missingMissions.map(id => MISSIONS.find(m => m.id === id)!.title[locale]).join(', ')}</p>}
          {missingParts.length > 0 && <p>{locale === 'en' ? 'Buy in hangar: ' : 'Купіть в ангарі: '}{missingParts.map(id => partName(id, locale)).join(', ')}</p>}
          <button type="button" disabled={!available} data-testid={`contract-${contract.missionId}`} aria-pressed={currentMissionId === contract.missionId} onClick={() => onChoose(contract.missionId)}>{locale === 'en' ? 'Choose contract' : 'Вибрати контракт'}</button>
        </article>
      })}</div></>}
      <h3 id="upgrade-heading">{locale === 'en' ? 'Upgrade tree' : 'Дерево вдосконалень'}</h3>
      <p>{locale === 'en' ? 'Eight real hardware nodes. After wildfire, choose urban or shoreline first; build the comms branch to reach relay. All four clears finish the campaign. Every purchase refunds its actual paid amount, including old saves. Retries are free.' : 'Вісім вузлів реального обладнання. Після лісової місії оберіть місто або берегову лінію; гілка зв’язку відкриє ретрансляцію. Для завершення потрібні всі чотири проходи. Кожна покупка повертає фактично сплачену суму, зокрема зі старих збережень. Повтори безплатні.'}</p>
      <div className="upgrade-tree" role="group" aria-labelledby="upgrade-heading">
        <div className="upgrade-root">{renderNode('bus-12u')}</div>
        <div className="upgrade-branches">
          {([
            { title: locale === 'en' ? 'Power' : 'Живлення', ids: ['arr-deploy-l', 'arr-deploy-xl'] },
            { title: locale === 'en' ? 'Comms → Relay' : 'Зв’язок → Ретрансляція', ids: ['rf-s', 'rf-x', 'pl-relay'] },
            { title: locale === 'en' ? 'Payload' : 'Прилад', ids: ['pl-thermal', 'pl-visible-35'] },
          ]).map(branch => <section className="upgrade-branch" key={branch.ids[0]}>
            <h4 className="upgrade-branch-title">{branch.title}</h4>
            <ol>{branch.ids.map(id => <li key={id}>{renderNode(id)}</li>)}</ol>
          </section>)}
        </div>
      </div>
      {campaignComplete(progress) && <p className="campaign-complete" data-testid="campaign-complete" role="status">{t('campaign.complete')}</p>}
    </>}
    {storageError && <p className="error-notice" role="alert">{t('campaign.storageError')}</p>}
  </section>
}
