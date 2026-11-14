import { DEFAULT_CONTEXT } from '../context'
import { VISIBLE_SCIENCE } from '../../engine/science'
import { FIRST_MISSION } from '../../fixtures/builds'
import type { EvaluationContext, MissionDefinition, Payload, Provenance } from '../../engine/types'

const source = 'https://gomspace.com/product/nanocam-c1u/'
const provisional: Provenance = { kind: 'provisional', sourceRefs: [source, 'docs/nonthermal-missions.md'], assumptionIds: ['visible-educational-analogue', 'integrated-allocation', 'synthetic-daylit-clear-scene-plan'] }
const verified: Provenance = { kind: 'verified-reference', sourceRefs: [source], assumptionIds: [] }
const derived: Provenance = { kind: 'derived', sourceRefs: [source], assumptionIds: ['conservative-sampling-upper-bound', 'near-nadir-flat-ground'] }
function camera(lens: 8 | 35 | 70, referenceGSDm: number): Payload {
  const values = {
    mode: 'visible-bayer' as const, massKg: lens === 70 ? .4 : .3, costUsd: lens === 70 ? 160_000 : 120_000,
    leadMonths: 10, activeW: 2, peakW: 3, bandsMicrometers: [[.4, .75]] as const,
    widthPixels: 2048, heightPixels: 1536, bitsPerPixel: 16, framesPerSecond: .02, duty: .08,
    referenceGSDm, referenceAltitudeKm: 650,
    crossFovDeg: 2 * Math.atan(2048 * referenceGSDm / (2 * 650000)) * 180 / Math.PI,
    alongFovDeg: 2 * Math.atan(1536 * referenceGSDm / (2 * 650000)) * 180 / Math.PI,
    exposureSeconds: .001, errorLimitDeg: .2, busIds: ['bus-3u', 'bus-6u', 'bus-12u'],
  }
  return {
    id: `pl-visible-${lens}`, category: 'payload',
    label: { en: `Visible Bayer camera • ${lens} mm analogue`, ua: `Видима Bayer-камера • аналог ${lens} мм` },
    ...values,
    evidence: Object.fromEntries(Object.keys(values).map(key => [key,
      ['widthPixels', 'heightPixels', 'bandsMicrometers', 'referenceAltitudeKm'].includes(key) ? verified
        : ['crossFovDeg', 'alongFovDeg', 'referenceGSDm'].includes(key) ? derived : provisional])),
  }
}
export const VISIBLE_PAYLOADS = [camera(8, 260), camera(35, 60), camera(70, 30)] as const
export const VISIBLE_CONTEXT: EvaluationContext = {
  ...DEFAULT_CONTEXT,
  catalogRevision: `${DEFAULT_CONTEXT.catalogRevision}:visible-1`,
  scenarioRevision: 'visible-corridor-1', fixtureRevision: 'visible-daylit-corridor-1',
  catalog: { ...DEFAULT_CONTEXT.catalog, payloads: [...DEFAULT_CONTEXT.catalog.payloads, ...VISIBLE_PAYLOADS] },
  scenario: { ...DEFAULT_CONTEXT.scenario, id: 'visible-mapping', science: VISIBLE_SCIENCE },
  fixture: { ...DEFAULT_CONTEXT.fixture, scenarioId: 'visible-mapping',
    targetGapHours: { state: 'known', value: 24, provenance: provisional } },
}
const initial = { ...FIRST_MISSION, scenarioId: 'visible-mapping', payloadId: 'pl-visible-8', radioId: 'rf-s', groundId: 'gs-network' }
export const VISIBLE_MISSION: MissionDefinition = {
  id: 'visible-mapping',
  title: { en: 'Trace the Shoreline', ua: 'Окресліть берегову лінію' },
  subtitle: { en: 'Daylit visible-light corridor mapping', ua: 'Денне картування смуги у видимому світлі' },
  brief: {
    en: 'A coastal mapping team needs clear-scene images of visible shoreline and land-cover boundaries across an 80 km corridor. Choose a visible camera lens: wide views lose detail; very long lenses miss corridor width. No water-quality retrieval, calibrated reflectance, cloud penetration or thermal measurement is claimed.',
    ua: 'Картографам узбережжя потрібні безхмарні знімки видимих меж берегів і типів поверхні у смузі 80 км. Виберіть об’єктив видимої камери: широкий огляд втрачає деталі, надто довгий — ширину смуги. Визначення якості води, каліброване відбиття, проникнення крізь хмари чи теплові виміри не заявляються.',
  },
  goals: { en: 'Visible Bayer mode; effective scale ≤60 m; usable footprint ≥80 km; scheduled access ≤24 h; useful products ≥0.4 GB/day; delivery ≤12 h; 1 year. All limits and schedules are provisional teaching choices.', ua: 'Видимий режим Bayer; ефективний масштаб ≤60 м; корисна смуга ≥80 км; плановий доступ ≤24 год; корисні дані ≥0,4 ГБ/добу; доставка ≤12 год; 1 рік. Усі межі й розклади — попередні навчальні рішення.' },
  hint: { en: 'Try the 35 mm analogue: enough detail without losing the 80 km corridor. The 8 mm is too coarse; the 70 mm is too narrow. Rerun all engineering gates.', ua: 'Спробуйте аналог 35 мм: досить деталей зі збереженням смуги 80 км. 8 мм — надто грубо, 70 мм — надто вузько. Перевірте всі інженерні умови знову.' },
  lesson: { en: 'Historical NanoCam C1U is discontinued. We use a provisional analogue, conservative lens sampling bounds, a 1 ms exposure assumption and accepted tracking. 10-bit Bayer samples are stored in 16-bit words, not three full RGB planes. Synthetic batch acquisition produces 0.870 GB/day before 40% rejection. No vendor flight performance is transferred to our integrated model.', ua: 'Історичну NanoCam C1U знято з продажу. Використано попередній аналог, консервативні межі дискретизації, припущення експозиції 1 мс і прийнятий супровід. 10-бітові відліки Bayer зберігаються у 16-бітових словах, а не трьох повних RGB-площинах. Синтетичне пакетне знімання генерує 0,870 ГБ/добу до відбракування 40%. Льотні характеристики виробника не переносяться на інтегровану модель.' },
  context: VISIBLE_CONTEXT, initialConfiguration: initial, passingConfiguration: { ...initial, payloadId: 'pl-visible-35' },
  sources: [
    { title: 'GomSpace historical NanoCam C1U', url: source, scope: { en: '2048×1536, 10-bit Bayer, 400–750 nm; <260/<60/<30 m at 650 km for 8/35/70 mm. From 169/277 g reference, not our allocation. Discontinued.', ua: '2048×1536, 10-біт Bayer, 400–750 нм; <260/<60/<30 м на 650 км для 8/35/70 мм. Від 169/277 г у джерелі, не наша маса. Знято з продажу.' } },
    { title: 'NASA Landsat spectral bands and applications', url: 'https://science.nasa.gov/mission/landsat/spectral-bands-and-applications/', scope: { en: 'Visible versus thermal sensor selection only. No Landsat calibration, bands or retrieval accuracy transferred.', ua: 'Лише вибір видимого чи теплового сенсора. Калібрування, діапазони й точність відновлення Landsat не переносяться.' } },
  ],
}
