/**
 * Playable mission definitions. Data only: no React, evaluator, or runtime logic.
 *
 * Wildfire is the audited Step 2 mission and keeps DEFAULT_CONTEXT unchanged.
 * Urban heat reuses the physical catalog, tracking profile, 60% acceptance,
 * $3M budget and 36-month schedule, with its own synthetic city access fixture.
 * Its science limits are explicit synthetic game choices, not flight
 * requirements, and no payload capability is added.
 */
import { DEFAULT_CONTEXT } from './context'
import { URBAN_SCIENCE } from '../engine/science'
import type { EvaluationContext, Evidence, MissionDefinition } from '../engine/types'
import { FIRST_MISSION, WF_B } from '../fixtures/builds'

/**
 * The audit fixture contract carries an access gap but no swath width. The 100 km
 * city strip is therefore an explicit synthetic assumption, not a propagated
 * orbit or coverage result. Cloning the known gap keeps the shared 24 h value
 * while attaching urban-only assumptions to its provenance.
 */
const urbanGap = DEFAULT_CONTEXT.fixture.targetGapHours
const URBAN_TARGET_GAP: Evidence<number> =
  urbanGap.state === 'known'
    ? {
        ...urbanGap,
        provenance: {
          ...urbanGap.provenance,
          assumptionIds: [
            ...urbanGap.provenance.assumptionIds,
            'synthetic-urban-100km-strip',
            'synthetic-urban-daylit-access',
            'synthetic-urban-schedulable-opportunities',
          ],
        },
      }
    : urbanGap

/**
 * The physical fixture values are unchanged. The distinct revision marks a
 * separate evaluation snapshot so wildfire and urban reports cannot be mixed.
 */
const URBAN_CONTEXT: EvaluationContext = {
  ...DEFAULT_CONTEXT,
  scenarioRevision: 'scenario-urban-heat-2026-11-14',
  fixtureRevision: 'fixture-urban-heat-2026-11-14',
  scenario: {
    ...DEFAULT_CONTEXT.scenario,
    id: 'urban-heat',
    science: URBAN_SCIENCE,
  },
  fixture: {
    ...DEFAULT_CONTEXT.fixture,
    scenarioId: 'urban-heat',
    targetGapHours: URBAN_TARGET_GAP,
  },
}

export const WILDFIRE_MISSION: MissionDefinition = {
  id: 'wildfire',
  title: { en: 'Return the Heat Map', ua: 'Поверніть теплову карту' },
  hint: {
    en: 'With starter X-band hardware, a closing link and stable queue: single station 7.1 h → network 3.1 h. Change Ground service, then rerun every gate.',
    ua: 'Для початкового X-діапазонного обладнання, замкненої лінії та стабільної черги: одна станція 7,1 год → мережа 3,1 год. Змініть наземний сервіс і перевірте всі умови знову.',
  },
  subtitle: {
    en: 'Scheduled wildfire thermal-anomaly training mission',
    ua: 'Навчальна місія планового теплового обстеження пожеж',
  },
  brief: {
    en: 'A land-management team needs scheduled thermal-anomaly imagery. Build a spacecraft and get the images home within the 6 h fixture bound. This is target-campaign training, not operational fire detection, whole-region coverage or flight qualification.',
    ua: 'Команді землекористування потрібні планові знімки теплових аномалій. Складіть апарат і доставте зображення в межах модельних 6 год. Це навчальна кампанія обраних цілей, а не оперативне виявлення пожеж, покриття всього регіону чи льотна кваліфікація.',
  },
  lesson: {
    en: 'The audited wildfire gate is ≤6 h. A single X-band station carries 12.6 GB/day, far above the 3.185 GB/day the camera generates, but four contacts per day give 24/4 + 6 min + 1 h = 7.1 h latency — a miss. The 12-contact network gives 3.1 h and passes. In wildfire, contact cadence and processing, not raw bandwidth, set the delivery bound.',
    ua: 'Аудитована межа для пожеж — ≤6 год. Одна X-діапазонна станція забезпечує 12,6 ГБ/добу, що значно перевищує 3,185 ГБ/добу, які генерує камера, але чотири сеанси на добу дають затримку 24/4 + 6 хв + 1 год = 7,1 год — це не проходить. Мережа з 12 сеансами дає 3,1 год і проходить. У місії пожеж межу доставки визначають частота сеансів і обробка, а не сама пропускна здатність.',
  },
  goals: {
    en: 'LWIR 8–12 µm; effective scale ≤200 m; usable footprint ≥90 km; target access ≤24 h; useful products ≥1.0 GB/day; latency ≤6 h; duration ≥1 year. These are synthetic game limits.',
    ua: 'LWIR 8–12 мкм; ефективний масштаб ≤200 м; корисна смуга огляду ≥90 км; доступ до цілі ≤24 год; корисні продукти ≥1,0 ГБ/добу; затримка ≤6 год; тривалість ≥1 рік. Це синтетичні ігрові межі.',
  },
  context: DEFAULT_CONTEXT,
  initialConfiguration: FIRST_MISSION,
  passingConfiguration: WF_B,
  sources: [
    {
      title: 'JAXA Compact Infrared Camera (CIRC) technical document 83533J',
      url: 'https://circgs.tksc.jaxa.jp/documents/2012/83533J.pdf',
      scope: {
        en: 'Adopted: CIRC as a spaceborne LWIR thermal-camera class reference for this mission concept. Not adopted: CIRC measured performance, calibration, pointing, or flight heritage; our integrated payload is a CIRC-like teaching model, not CIRC, and is not flight-qualified.',
        ua: 'Використано: CIRC як класовий орієнтир для космічної LWIR-тепловізійної камери в концепції місії. Не використано: виміряні характеристики, калібрування, наведення чи льотну спадщину CIRC; наш інтегрований прилад — CIRC-подібна навчальна модель, а не CIRC, і не має льотної кваліфікації.',
      },
    },
    {
      title: 'NASA/JPL ECOSTRESS — Las Vegas street heat',
      url: 'https://www.nasa.gov/missions/ecostress/nasas-ecostress-sees-las-vegas-streets-turn-up-the-heat/',
      scope: {
        en: 'Adopted: thermal remote sensing maps surface-temperature patterns that can differ from air temperature, and urban heat is uneven across a city. Not adopted: ECOSTRESS is not our CIRC-like payload; no ECOSTRESS resolution, temperature accuracy, emissivity correction, street-scale detail, or alerting capability is transferred.',
        ua: 'Використано: теплове дистанційне зондування картує простори температури поверхні, які можуть відрізнятися від температури повітря, а міський нагрів нерівномірний. Не використано: ECOSTRESS не є нашим CIRC-подібним приладом; його роздільність, точність температури, виправлення випромінювальної здатності, вулична деталізація чи функції оповіщення не переносяться.',
      },
    },
  ],
}

export const URBAN_MISSION: MissionDefinition = {
  id: 'urban-heat',
  hint: {
    en: 'S-band/network cannot sustain the image stream. Try X-band, then compare a single station: its 7.1 h bound can meet this 12 h brief when the link closes and the queue is stable.',
    ua: 'S-діапазон/мережа не витримує потоку знімків. Спробуйте X-діапазон, потім порівняйте одну станцію: її межа 7,1 год може відповідати цій місії з межею 12 год за замкненої лінії та стабільної черги.',
  },
  title: { en: 'Urban Heat Map', ua: 'Теплова карта міста' },
  subtitle: {
    en: 'Scheduled city-scale thermal-pattern screening',
    ua: 'Планове міське тепловізійне обстеження',
  },
  brief: {
    en: 'Help an urban planning team screen broad thermal patterns, not individual streets. Return enough useful imagery within a 12 h fixture bound. No air-temperature, calibrated surface-temperature, health-risk or heatwave-alert capability is claimed. All targets, schedules and science limits are synthetic teaching choices.',
    ua: 'Допоможіть міським планувальникам дослідити великомасштабні теплові структури, а не окремі вулиці. Поверніть достатньо корисних знімків у межах модельних 12 год. Вимірювання температури повітря, каліброваної температури поверхні, ризиків для здоров’я чи оповіщення про спеку не заявляються. Цілі, розклади й наукові межі — синтетичні навчальні рішення.',
  },
  lesson: {
    en: 'S-band/network returns 5 × 72 × 0.0075 × 0.70 = 1.890 GB/day: below the 3.185 GB/day stream, with only 1.134 GB/day useful after rejection. Try X-band, then compare ground costs. X-band/single returns 12.6 GB/day and 1.911 GB/day useful, with a 7.1 h bound: acceptable here (≤12 h), not for wildfire (≤6 h). Frequent S-band service is another approach. Urban uses a separate synthetic daylit 100 km city strip with assumed schedulable opportunities every 24 h; this is not a propagated orbit or coverage proof.',
    ua: 'S-діапазон/мережа повертає 5 × 72 × 0,0075 × 0,70 = 1,890 ГБ/добу: менше за потік 3,185 ГБ/добу, лише 1,134 ГБ/добу корисних даних після відбракування. Спробуйте X-діапазон, потім порівняйте вартість наземних сервісів. X-діапазон/одна станція дає 12,6 ГБ/добу та 1,911 ГБ/добу корисних даних із межею 7,1 год: тут це прийнятно (≤12 год), але не для пожеж (≤6 год). Частий сервіс із S-діапазоном — інший підхід. Міська місія має окрему синтетичну денну смугу 100 км з припущеними плановими можливостями кожні 24 год; це не розрахована орбіта чи доказ покриття.',
  },
  goals: {
    en: 'LWIR 8–12 µm; effective scale ≤180 m; usable footprint ≥100 km; target access ≤24 h; useful products ≥1.5 GB/day; latency ≤12 h; duration ≥1 year. The 100 km footprint is an explicit synthetic daylit city-strip assumption with all opportunities assumed schedulable, not orbit or coverage proof. All numeric limits are synthetic game choices.',
    ua: 'LWIR 8–12 мкм; ефективний масштаб ≤180 м; корисна смуга огляду ≥100 км; доступ до цілі ≤24 год; корисні продукти ≥1,5 ГБ/добу; затримка ≤12 год; тривалість ≥1 рік. Смуга 100 км — явне синтетичне припущення про денну міську смугу з планованими можливостями, а не доказ орбіти чи покриття. Усі числові межі — синтетичні ігрові рішення.',
  },
  context: URBAN_CONTEXT,
  initialConfiguration: {
    ...FIRST_MISSION,
    scenarioId: 'urban-heat',
    radioId: 'rf-s',
    groundId: 'gs-network',
  },
  passingConfiguration: {
    ...FIRST_MISSION,
    scenarioId: 'urban-heat',
  },
  sources: [
    {
      title: 'JAXA Compact Infrared Camera (CIRC) technical document 83533J',
      url: 'https://circgs.tksc.jaxa.jp/documents/2012/83533J.pdf',
      scope: {
        en: 'Adopted: CIRC as a spaceborne LWIR thermal-camera class reference for the shared camera concept. Not adopted: CIRC measured performance, calibration, pointing, or flight heritage; the same CIRC-like teaching payload is used and no urban-specific capability is added.',
        ua: 'Використано: CIRC як класовий орієнтир для космічної LWIR-тепловізійної камери в спільній концепції. Не використано: виміряні характеристики, калібрування, наведення чи льотну спадщину CIRC; використовується той самий CIRC-подібний навчальний прилад, і жодної міської специфічної спроможності не додано.',
      },
    },
    {
      title: 'NASA/JPL ECOSTRESS — Las Vegas street heat',
      url: 'https://www.nasa.gov/missions/ecostress/nasas-ecostress-sees-las-vegas-streets-turn-up-the-heat/',
      scope: {
        en: 'Adopted: surface-temperature patterns can differ from air temperature and vary within a city, which motivates mapping relative thermal patterns. Not adopted: ECOSTRESS is not our CIRC-like payload; no ECOSTRESS resolution, accuracy, emissivity correction, street-scale detail, or heatwave alerting is claimed.',
        ua: 'Використано: простори температури поверхні можуть відрізнятися від температури повітря й нерівномірні в межах міста, що вмотивовує картування відносних теплових структур. Не використано: ECOSTRESS не є нашим CIRC-подібним приладом; його роздільність, точність, виправлення випромінювальної здатності, вулична деталізація чи оповіщення про спеки не заявляються.',
      },
    },
  ],
}

export const MISSIONS: readonly MissionDefinition[] = [WILDFIRE_MISSION, URBAN_MISSION]
