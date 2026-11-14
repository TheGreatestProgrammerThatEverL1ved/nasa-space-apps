import type { Locale } from '../engine/types'
import { CATALOG } from '../data/catalog'
import { CAMPAIGN_SHOP, campaignCredits, type CampaignProgress } from '../campaign/progress'
import { translate } from '../i18n'

interface Props {
  readonly active: boolean
  readonly progress: CampaignProgress
  readonly locale: Locale
  readonly storageError: boolean
  readonly onToggle: () => void
  readonly onBuy: (partId: string) => void
}

export default function CampaignPanel({ active, progress, locale, storageError, onToggle, onBuy }: Props) {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key)
  const credits = campaignCredits(progress)
  const complete = progress.completedMissionIds.includes('wildfire') && progress.completedMissionIds.includes('urban-heat')
  return (
    <section className="panel campaign-panel" aria-labelledby="campaign-heading">
      <div className="campaign-heading">
        <div>
          <p className="section-kicker">{t('campaign.optional')}</p>
          <h2 id="campaign-heading">{t('campaign.title')}</h2>
        </div>
        <button type="button" className="campaign-toggle" onClick={onToggle} aria-pressed={active}>
          {t(active ? 'campaign.direct' : 'campaign.start')}
        </button>
      </div>
      <p>{t('campaign.intro')}</p>
      {active && (
        <>
          <div className="campaign-status" role="status" aria-live="polite">
            <strong data-testid="campaign-credits">{translate(locale, 'campaign.credits', { count: credits })}</strong>
            <span data-testid="campaign-progress">{translate(locale, 'campaign.progress', { count: progress.completedMissionIds.length })}</span>
          </div>
          <ol className="campaign-steps">
            <li>{t('campaign.earn')}</li>
            <li>{t('campaign.unlock')}</li>
            <li>{t('campaign.redesign')}</li>
          </ol>
          <p className="note">{t('campaign.separate')}</p>
          <div className="campaign-shop" role="group" aria-label={t('campaign.shop')}>
            {CAMPAIGN_SHOP.map(item => {
              const part = [...CATALOG.arrays, ...CATALOG.radios].find(part => part.id === item.partId)!
              const owned = progress.unlockedPartIds.includes(item.partId)
              return (
                <article className="shop-card" key={item.partId}>
                  <h3>{part.label[locale]}</h3>
                  <p>{t(item.partId === 'rf-x' ? 'campaign.xTradeoff' : 'campaign.arrayTradeoff')}</p>
                  <button type="button" data-testid={`unlock-${item.partId}`} disabled={owned || credits < item.credits} onClick={() => onBuy(item.partId)}>
                    {owned ? t('campaign.owned') : translate(locale, 'campaign.buy', { credits: item.credits })}
                  </button>
                </article>
              )
            })}
          </div>
          {complete && <p className="campaign-complete" data-testid="campaign-complete" role="status">{t('campaign.complete')}</p>}
        </>
      )}
      {storageError && <p className="error-notice" role="alert">{t('campaign.storageError')}</p>}
    </section>
  )
}
