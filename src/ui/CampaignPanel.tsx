import type { Locale } from '../engine/types'
import { MISSIONS } from '../data/scenarios'
import { CAMPAIGN_CONTRACTS, CAMPAIGN_SHOP, campaignComplete, campaignContractAvailable, campaignCredits, type CampaignProgress } from '../campaign/progress'
import { translate } from '../i18n'

interface Props {
  readonly active: boolean; readonly progress: CampaignProgress; readonly locale: Locale
  readonly storageError: boolean; readonly currentMissionId: string; readonly creditDelta: number | null
  readonly onToggle: () => void; readonly onBuy: (partId: string) => void
  readonly onRefund: (partId: string) => void; readonly onFit: (partId: string) => void
  readonly onChoose: (missionId: string) => void
  readonly compactBoard?: boolean
}
const parts = MISSIONS.flatMap(m => [...m.context.catalog.arrays, ...m.context.catalog.radios, ...m.context.catalog.payloads, ...(m.context.catalog.relayPayloads ?? [])])
const partName = (id: string, locale: Locale) => parts.find(p => p.id === id)?.label[locale] ?? id
export default function CampaignPanel({ active, progress, locale, storageError, currentMissionId, creditDelta, onToggle, onBuy, onRefund, onFit, onChoose, compactBoard = false }: Props) {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key)
  const credits = campaignCredits(progress)
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
          <p>{locale === 'en' ? 'First-clear reward' : 'Нагорода за перший прохід'}: {contract.reward} {locale === 'en' ? 'credits' : 'кредитів'}</p>
          {missingMissions.length > 0 && <p>{locale === 'en' ? 'Complete first: ' : 'Спершу пройдіть: '}{missingMissions.map(id => MISSIONS.find(m => m.id === id)!.title[locale]).join(', ')}</p>}
          {missingParts.length > 0 && <p>{locale === 'en' ? 'Buy in hangar: ' : 'Купіть в ангарі: '}{missingParts.map(id => partName(id, locale)).join(', ')}</p>}
          <button type="button" disabled={!available} data-testid={`contract-${contract.missionId}`} aria-pressed={currentMissionId === contract.missionId} onClick={() => onChoose(contract.missionId)}>{locale === 'en' ? 'Choose contract' : 'Вибрати контракт'}</button>
        </article>
      })}</div></>}
      <h3>{locale === 'en' ? 'Equipment hangar' : 'Ангар обладнання'}</h3>
      <p>{locale === 'en' ? 'Your starter kit is already owned. Buy to unlock, then fit on a compatible contract. Optional purchases can be refunded in full; no grinding or paid retries.' : 'Початковий комплект уже ваш. Купуйте для відкриття й установлюйте в сумісному контракті. Необов’язкові покупки можна повністю повернути; без накопичувальних повторів чи платних спроб.'}</p>
      <div className="campaign-shop" role="group" aria-label={t('campaign.shop')}>{CAMPAIGN_SHOP.map(item => {
        const owned = progress.unlockedPartIds.includes(item.partId)
        return <article className="shop-card" key={item.partId}>
          <h4>{partName(item.partId, locale)}</h4><p>{item.tradeoff[locale]}</p>
          <p>{item.credits} {locale === 'en' ? 'credits • full refund available' : 'кредитів • повне повернення доступне'}</p>
          <button type="button" data-testid={`unlock-${item.partId}`} disabled={owned || credits < item.credits} onClick={() => onBuy(item.partId)}>{owned ? t('campaign.owned') : translate(locale, 'campaign.buy', { credits: item.credits })}</button>
          {owned && <div className="academy-actions">
            <button type="button" data-testid={`fit-${item.partId}`} onClick={() => onFit(item.partId)}>{locale === 'en' ? 'Fit on compatible design' : 'Установити в сумісний проєкт'}</button>
            <button type="button" data-testid={`refund-${item.partId}`} onClick={() => onRefund(item.partId)}>{locale === 'en' ? 'Refund' : 'Повернути'} +{item.credits}</button>
          </div>}
        </article>
      })}</div>
      {campaignComplete(progress) && <p className="campaign-complete" data-testid="campaign-complete" role="status">{t('campaign.complete')}</p>}
    </>}
    {storageError && <p className="error-notice" role="alert">{t('campaign.storageError')}</p>}
  </section>
}
