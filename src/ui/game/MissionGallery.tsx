import type { Locale, MissionDefinition } from '../../engine/types'
import './gallery.css'

export type MissionContract = {
  readonly missionId: string
  readonly available: boolean
  readonly completed: boolean
  readonly reward: number
  readonly reason: string
}

export type MissionGalleryProps = {
  missions: readonly MissionDefinition[]
  locale: Locale
  selectedMissionId: string
  onChoose: (id: string) => void
  contracts?: readonly MissionContract[]
}

/** All current scenarios target Earth. Add a destination entry before adding a non-Earth mission. */
const DESTINATIONS = {
  earth: {
    label: { en: 'Earth orbit', ua: 'Орбіта Землі' },
    note: {
      en: 'Every current scenario is an Earth-orbit training mission. No Moon or planetary targets are present.',
      ua: 'Кожен наявний сценарій — навчальна місія на орбіті Землі. Місячних чи планетних цілей немає.',
    },
  },
} as const
type DestinationKey = keyof typeof DESTINATIONS
const DESTINATION_BY_MISSION: Partial<Record<string, DestinationKey>> = {
  wildfire: 'earth',
  'urban-heat': 'earth',
  'visible-mapping': 'earth',
  'packet-relay': 'earth',
}

function firstSentence(text: string) {
  const end = text.search(/\.\s/)
  return end < 0 ? text : text.slice(0, end + 1)
}

function countLabel(count: number, locale: Locale) {
  if (locale === 'en') return `${count} ${count === 1 ? 'mission' : 'missions'}`
  const mod10 = count % 10
  const mod100 = count % 100
  const word = mod10 === 1 && mod100 !== 11 ? 'місія' : mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14) ? 'місії' : 'місій'
  return `${count} ${word}`
}

function MissionArt({ mission, locale }: { mission: MissionDefinition; locale: Locale }) {
  const en = locale === 'en'
  const id = mission.id
  const label = `${id}-art-title`
  const description = `${id}-art-desc`
  if (id === 'wildfire') return <svg viewBox="0 0 320 180" role="img" aria-labelledby={`${label} ${description}`}>
    <title id={label}>{mission.title[locale]}</title>
    <desc id={description}>{en ? 'Dusk hills, a wildfire thermal anomaly and a satellite in Earth orbit.' : 'Пагорби в сутінках, теплова аномалія пожежі та супутник на орбіті Землі.'}</desc>
    <defs>
      <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#061225" /><stop offset="1" stopColor="#5b2c22" /></linearGradient>
      <linearGradient id={`${id}-ridge`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#183247" /><stop offset="1" stopColor="#091523" /></linearGradient>
      <radialGradient id={`${id}-heat`}><stop stopColor="#ffe29a" /><stop offset=".45" stopColor="#ff8b3d" stopOpacity=".75" /><stop offset="1" stopColor="#ff5a2a" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width="320" height="180" fill={`url(#${id}-sky)`} />
    <g fill="#d7ecff" opacity=".8"><circle cx="26" cy="28" r="1.2" /><circle cx="62" cy="52" r=".8" /><circle cx="286" cy="26" r="1" /><circle cx="248" cy="48" r=".7" /><circle cx="112" cy="20" r=".9" /></g>
    <path d="M0 126Q42 92 92 116t96-12 132 22v54H0Z" fill={`url(#${id}-ridge)`} />
    <path d="M0 148q55-22 106-4t106-2 108 18v20H0Z" fill="#0b1927" />
    <g fill="#2a5c6e" opacity=".55"><path d="M18 142h52l-8 9H24Z" /><path d="M104 150h58l-9 10h-42Z" /><path d="M230 146h58l-8 9h-44Z" /></g>
    <ellipse cx="218" cy="132" rx="42" ry="18" fill={`url(#${id}-heat)`} />
    <path d="M218 140c-11-5-8-15 2-19 0 6 5 7 5 12 4-4 5-9 3-14 10 7 8 19-10 21Z" fill="#ffc46b" />
    <g stroke="#ffd18f" strokeWidth="1" opacity=".65"><path d="M198 132h-12M238 126h12M214 116v-8" /></g>
    <path d="M14 58q70-34 136 12" fill="none" stroke="#7fd3ff" strokeDasharray="4 5" opacity=".65" />
    <g transform="translate(154 66) rotate(18)">
      <rect x="-14" y="-7" width="28" height="14" rx="2" fill="#d7e7f2" />
      <path d="M-34-9h20v18h-20zM14-9h20v18H14z" fill="#4f9bc4" stroke="#9bdcff" strokeWidth="1" />
      <path d="M0 7v9l-11 10h22L0 16Z" fill="#ffb36f" opacity=".9" />
      <path d="M-8 14h16l24 60h-64Z" fill="#8fe3ff" opacity=".12" />
    </g>
    <g stroke="#ffd08e" strokeWidth="1" opacity=".35"><path d="M56 180 116 96M120 180 150 94M184 180 184 96M248 180 218 96" /></g>
  </svg>
  if (id === 'urban-heat') return <svg viewBox="0 0 320 180" role="img" aria-labelledby={`${label} ${description}`}>
    <title id={label}>{mission.title[locale]}</title>
    <desc id={description}>{en ? 'Night city blocks with hot roofs and a satellite thermal scan.' : 'Нічні міські квартали з гарячими дахами та тепловим скануванням із супутника.'}</desc>
    <defs>
      <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#071528" /><stop offset="1" stopColor="#18314a" /></linearGradient>
      <linearGradient id={`${id}-heat`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffd98d" /><stop offset=".55" stopColor="#ff884a" /><stop offset="1" stopColor="#d9473f" /></linearGradient>
      <radialGradient id={`${id}-glow`}><stop stopColor="#ff9a55" stopOpacity=".42" /><stop offset="1" stopColor="#ff6b3d" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width="320" height="180" fill={`url(#${id}-sky)`} />
    <g fill="#d7ecff" opacity=".7"><circle cx="34" cy="28" r="1" /><circle cx="84" cy="18" r=".7" /><circle cx="132" cy="34" r=".9" /><circle cx="292" cy="22" r="1.1" /><circle cx="262" cy="50" r=".7" /></g>
    <path d="M0 116h320v64H0Z" fill="#071625" />
    <ellipse cx="156" cy="104" rx="108" ry="38" fill={`url(#${id}-glow)`} />
    <g fill="#12314a" stroke="#2b5a78"><rect x="16" y="84" width="52" height="70" rx="2" /><rect x="76" y="102" width="40" height="52" rx="2" /><rect x="124" y="72" width="58" height="82" rx="2" /><rect x="190" y="94" width="44" height="60" rx="2" /><rect x="242" y="80" width="62" height="74" rx="2" /></g>
    <g fill={`url(#${id}-heat)`} opacity=".9"><rect x="24" y="92" width="36" height="18" rx="3" /><rect x="84" y="110" width="24" height="12" rx="2" /><rect x="132" y="80" width="42" height="16" rx="3" /><rect x="198" y="102" width="28" height="12" rx="2" /><rect x="250" y="88" width="46" height="18" rx="3" /></g>
    <g fill="#ffe3a3" opacity=".55"><rect x="28" y="120" width="6" height="6" /><rect x="44" y="120" width="6" height="6" /><rect x="90" y="132" width="5" height="5" /><rect x="140" y="114" width="6" height="6" /><rect x="156" y="114" width="6" height="6" /><rect x="204" y="126" width="5" height="5" /><rect x="260" y="118" width="6" height="6" /><rect x="278" y="118" width="6" height="6" /></g>
    <path d="M0 134h320M66 116v64M178 116v64M236 116v64" stroke="#3a7596" strokeWidth="2" />
    <g transform="translate(258 38)">
      <rect x="-16" y="-7" width="32" height="14" rx="2" fill="#d8eaf5" />
      <path d="M-42-9h20v18h-20zM22-9h20v18H22z" fill="#397fa5" stroke="#8adcff" />
      <path d="M-8 7h16L-18 52h52Z" fill="#ffcf8a" opacity=".2" />
    </g>
  </svg>
  if (id === 'visible-mapping') return <svg viewBox="0 0 320 180" role="img" aria-labelledby={`${label} ${description}`}>
    <title id={label}>{mission.title[locale]}</title>
    <desc id={description}>{en ? 'A daylit coastline, an 80 km mapping corridor and a visible-light camera satellite.' : 'Денне узбережжя, 80-кілометрова смуга картування та супутник із камерою видимого світла.'}</desc>
    <defs>
      <linearGradient id={`${id}-sea`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#0d3f5e" /><stop offset="1" stopColor="#082034" /></linearGradient>
      <linearGradient id={`${id}-land`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#416b4d" /><stop offset="1" stopColor="#263f35" /></linearGradient>
      <linearGradient id={`${id}-corridor`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#b9f1ff" stopOpacity=".38" /><stop offset="1" stopColor="#6ed7ff" stopOpacity=".08" /></linearGradient>
    </defs>
    <rect width="320" height="180" fill={`url(#${id}-sea)`} />
    <g stroke="#75c6e8" strokeWidth="1" opacity=".35"><path d="M0 30q28 8 56 0t56 0 56 0 56 0 56 0M0 50q28 8 56 0t56 0 56 0 56 0 56 0M0 70q28 8 56 0t56 0 56 0 56 0 56 0" fill="none" /></g>
    <path d="M0 96q48-14 92 0t96 0 132-12v96H0Z" fill={`url(#${id}-land)`} />
    <path d="M0 96q48-14 92 0t96 0 132-12" fill="none" stroke="#f2d99e" strokeWidth="2" />
    <g fill="#355c42" stroke="#527a56" strokeWidth=".7"><path d="M28 132h46v20H28Z" /><path d="M90 142h42v22H90Z" /><path d="M150 126h56v20h-56Z" /><path d="M224 138h52v24h-52Z" /></g>
    <path d="M32 166q38-24 78-8t70-10 80-18" fill="none" stroke="#90c9d8" strokeWidth="3" opacity=".7" />
    <path d="M44 58 288 104l-24 56L12 112Z" fill={`url(#${id}-corridor)`} stroke="#a8edff" strokeWidth="1.5" strokeDasharray="5 4" />
    <g stroke="#bdf2ff" strokeWidth=".7" opacity=".55"><path d="M64 76 40 112M104 84 80 120M144 92 120 128M184 100 160 136M224 108 200 144M264 116 240 152" /></g>
    <g transform="translate(70 36) rotate(9)">
      <rect x="-12" y="-6" width="24" height="12" rx="2" fill="#dcecf5" />
      <path d="M-30-8h16v16h-16zM14-8h16v16H14z" fill="#4f93b5" stroke="#a8edff" />
      <path d="M-6 6h12L-18 48h48Z" fill="#c7f4ff" opacity=".18" />
    </g>
  </svg>
  /* packet-relay is the current fallback scene; add an explicit branch before any new mission id. */
  return <svg viewBox="0 0 320 180" role="img" aria-labelledby={`${label} ${description}`}>
    <title id={label}>{mission.title[locale]}</title>
    <desc id={description}>{en ? 'Two ground stations linked by an Earth-orbit store-and-forward relay satellite.' : 'Дві наземні станції, з’єднані супутником-ретранслятором на орбіті Землі.'}</desc>
    <defs>
      <radialGradient id={`${id}-earth`} cx=".42" cy=".28" r=".85"><stop stopColor="#2f86b4" /><stop offset=".58" stopColor="#123d5d" /><stop offset="1" stopColor="#061523" /></radialGradient>
      <marker id={`${id}-arrow`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0 6 3 0 6Z" fill="#8fe3ff" /></marker>
    </defs>
    <rect width="320" height="180" fill="#040b16" />
    <g fill="#d7ecff" opacity=".8"><circle cx="30" cy="24" r="1" /><circle cx="72" cy="42" r=".7" /><circle cx="118" cy="20" r=".9" /><circle cx="218" cy="24" r=".8" /><circle cx="282" cy="38" r="1" /><circle cx="250" cy="62" r=".6" /></g>
    <circle cx="160" cy="252" r="146" fill={`url(#${id}-earth)`} />
    <circle cx="160" cy="252" r="147" fill="none" stroke="#7fd3ff" strokeOpacity=".5" strokeWidth="1.5" />
    <g fill="none" stroke="#d9f4ff" strokeWidth="2" opacity=".4"><path d="M52 142q38-20 76-2t66 0" /><path d="M182 132q28-10 58 2" /></g>
    <g><path d="M34 148l22-14 14 7-18 10Z" fill="#d8e8f2" /><path d="M56 149v24M46 173h20" stroke="#8fb6cc" strokeWidth="3" /><circle cx="56" cy="148" r="3" fill="#ffb36f" /></g>
    <g><path d="M244 148l22-14 14 7-18 10Z" fill="#d8e8f2" /><path d="M266 149v24M256 173h20" stroke="#8fb6cc" strokeWidth="3" /><circle cx="266" cy="148" r="3" fill="#ffb36f" /></g>
    <g transform="translate(160 58)">
      <rect x="-16" y="-8" width="32" height="16" rx="2" fill="#dcecf5" />
      <path d="M-44-9h22v18h-22zM22-9h22v18H22z" fill="#397fa5" stroke="#8adcff" />
      <path d="M-8 8h16l-10 15h-6Z" fill="#ffcb8c" />
    </g>
    <path d="M58 146Q92 40 154 56" fill="none" stroke="#8fe3ff" strokeWidth="1.5" strokeDasharray="5 4" markerEnd={`url(#${id}-arrow)`} />
    <path d="M166 58Q230 44 264 146" fill="none" stroke="#8fe3ff" strokeWidth="1.5" strokeDasharray="5 4" markerEnd={`url(#${id}-arrow)`} />
    <g fill="#ffcf8a" stroke="#ffb36f" strokeWidth="1"><rect x="96" y="82" width="10" height="8" rx="1" /><rect x="112" y="76" width="10" height="8" rx="1" /><rect x="198" y="78" width="10" height="8" rx="1" /><rect x="214" y="86" width="10" height="8" rx="1" /></g>
  </svg>
}

export function MissionGallery({ missions, locale, selectedMissionId, onChoose, contracts }: MissionGalleryProps) {
  const en = locale === 'en'
  const groups = (Object.keys(DESTINATIONS) as DestinationKey[]).map(key => ({
    key,
    ...DESTINATIONS[key],
    missions: missions.filter(mission => DESTINATION_BY_MISSION[mission.id] === key),
  })).filter(group => group.missions.length > 0)
  return <main className="mission-gallery" aria-labelledby="missions-title">
    <header className="mission-gallery-header">
      <p className="mission-gallery-eyebrow">{en ? 'EARTH ORBIT / MISSION SELECT' : 'ОРБІТА ЗЕМЛІ / ВИБІР МІСІЇ'}</p>
      <h1 id="missions-title" tabIndex={-1}>{en ? 'Mission gallery' : 'Галерея місій'}</h1>
      <p className="mission-gallery-intro">{en
        ? 'Compare the brief, goals and contract before you assemble. All scenarios in this gallery share one Earth-orbit destination.'
        : 'Порівняйте опис, цілі й контракт перед складанням. Усі сценарії в цій галереї мають одне призначення — орбіту Землі.'}</p>
      <p className="art-note">{en ? 'Original illustrations — not observations, propagated coverage or flight-qualified hardware.' : 'Оригінальні ілюстрації — не спостереження, розраховане покриття чи льотно кваліфіковане обладнання.'}</p>
    </header>
    {groups.map(group => <section key={group.key} className="mission-gallery-group" aria-labelledby={`destination-${group.key}`}>
      <div className="mission-gallery-group-head">
        <div><p className="mission-gallery-eyebrow">{en ? 'DESTINATION' : 'ПРИЗНАЧЕННЯ'}</p><h2 id={`destination-${group.key}`}>{group.label[locale]}</h2></div>
        <p>{group.note[locale]}</p>
        <span className="mission-gallery-count">{countLabel(group.missions.length, locale)}</span>
      </div>
      <div className="mission-gallery-grid">
        {group.missions.map(mission => {
          const current = mission.id === selectedMissionId
          const contract = contracts?.find(item => item.missionId === mission.id)
          const status = contract?.completed ? 'completed' : contract ? (contract.available ? 'available' : 'locked') : null
          const locked = Boolean(contract && !contract.available)
          const action = locked ? (en ? 'Locked' : 'Заблоковано')
            : current ? (en ? 'Continue mission' : 'Продовжити місію')
            : contract?.completed ? (en ? 'Replay mission' : 'Повторити місію')
            : (en ? 'Assemble mission' : 'Зібрати місію')
          return <article key={mission.id} className="mission-card" data-mission-id={mission.id} aria-labelledby={`${mission.id}-title`} aria-current={current ? 'true' : undefined}>
            <div className="mission-gallery-art"><MissionArt mission={mission} locale={locale} /></div>
            <div className="mission-gallery-body">
              <div className="mission-gallery-status">
                {current && <span className="mission-gallery-pill current">{en ? 'Current mission' : 'Поточна місія'}</span>}
                {status && <span className={`mission-gallery-pill ${status}`}>{status === 'completed' ? (en ? 'Cleared' : 'Пройдено') : status === 'available' ? (en ? 'Contract open' : 'Контракт доступний') : (en ? 'Locked' : 'Заблоковано')}</span>}
              </div>
              <h3 id={`${mission.id}-title`}>{mission.title[locale]}</h3>
              <p className="mission-gallery-premise">{mission.subtitle[locale]}</p>
              <p className="mission-gallery-objective"><strong>{en ? 'Objective' : 'Завдання'}</strong> {firstSentence(mission.brief[locale])}</p>
              <div className="mission-gallery-goals"><h4>{en ? 'Goals and limits' : 'Цілі та межі'}</h4><p>{mission.goals[locale]}</p></div>
              <details className="mission-gallery-brief"><summary>{en ? 'Full mission brief' : 'Повний опис місії'}</summary><p>{mission.brief[locale]}</p></details>
              {contract?.reason && <p className="mission-gallery-contract">{contract.reason}</p>}
              {contract && <p className="mission-gallery-reward"><span>{contract.completed ? (en ? 'Collected once · replay pays 0' : 'Уже отримано · повтор дає 0') : (en ? 'First-clear reward' : 'Нагорода за перше проходження')}</span><strong>{`${contract.reward} ${en ? 'credits' : 'кредитів'}`}</strong></p>}
              <button className={`mission-gallery-action${current ? ' is-current' : ''}`} type="button" disabled={locked} onClick={() => onChoose(mission.id)}>
                {action}<span aria-hidden="true">↗</span>
              </button>
            </div>
          </article>
        })}
      </div>
    </section>)}
  </main>
}

export default MissionGallery
