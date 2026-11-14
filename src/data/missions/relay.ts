import { DEFAULT_CONTEXT } from '../context'
import { FIRST_MISSION } from '../../fixtures/builds'
import type { EvaluationContext, MissionDefinition, Provenance, RelayPayload } from '../../engine/types'
const url = 'https://www.nasa.gov/communicating-with-missions/delay-disruption-tolerant-networking/'
const provisional: Provenance = { kind: 'provisional', sourceRefs: [url, 'docs/nonthermal-missions.md'], assumptionIds: ['synthetic-earth-relay', 'both-hops-assumed-closed', 'receive-buffer-package-allocation'] }
const values = { mode: 'packet-relay' as const, massKg: .6, costUsd: 150000, leadMonths: 10,
  activeW: 4, peakW: 6, duty: .12, ingressMbps: 20, bufferGB: 2, busIds: ['bus-6u', 'bus-12u'] }
export const RELAY_PAYLOAD: RelayPayload = {
  id: 'pl-relay', category: 'payload', label: { en: 'Packet receive / store package', ua: 'Пакет приймання / зберігання' }, ...values,
  evidence: Object.fromEntries(Object.keys(values).map(key => [key, provisional])),
}
export const RELAY_CONTEXT: EvaluationContext = {
  ...DEFAULT_CONTEXT, catalogRevision: `${DEFAULT_CONTEXT.catalogRevision}:relay-1`,
  scenarioRevision: 'earth-packet-relay-1', fixtureRevision: 'earth-relay-two-hop-1',
  catalog: { ...DEFAULT_CONTEXT.catalog, relayPayloads: [RELAY_PAYLOAD] },
  scenario: { ...DEFAULT_CONTEXT.scenario, id: 'packet-relay', acceptedFraction: 1, relay: { minDeliveredGBDay: 1, maxDelayHours: 4, minYears: 1 } },
  fixture: { ...DEFAULT_CONTEXT.fixture, scenarioId: 'packet-relay',
    relay: {
      ingressClosure: { state: 'known', value: true, provenance: provisional }, ingressEfficiency: .7,
      ingress: [{ startMin: 120, endMin: 130, gb: .5 }, { startMin: 840, endMin: 850, gb: .5 }],
      egressByGround: { 'gs-single': [], 'gs-network': [[180, 186], [900, 906]], 'gs-service': [[180, 186], [540, 546], [900, 906], [1260, 1266]] },
    },
  },
}
const initial = { ...FIRST_MISSION, scenarioId: 'packet-relay', payloadId: 'pl-relay' }
export const RELAY_MISSION: MissionDefinition = {
  id: 'packet-relay', title: { en: 'Carry the Signal', ua: 'Доставте сигнал' },
  subtitle: { en: 'Earth-orbit two-hop packet relay', ua: 'Дволінійна пакетна ретрансляція на орбіті Землі' },
  brief: {
    en: 'A remote sensor team hands you two 0.5 GB batches per day. Receive them, store them safely and deliver every byte within 4 hours after ingress completes. Your starter has a viable ingress but no contracted egress windows. A camera cannot replace the receive/store package. All schedules, hardware allocations and links are synthetic teaching fixtures, not a real network booking.',
    ua: 'Віддалена команда датчиків передає два пакети по 0,5 ГБ на добу. Прийміть їх, безпечно збережіть і доставте кожен байт за 4 години після завершення приймання. Початковий проєкт має працездатний вхід, але не має заброньованих вихідних сеансів. Камера не замінить пакет приймання/зберігання. Усі розклади, маси й лінії — синтетичні навчальні моделі, не справжнє бронювання мережі.',
  },
  goals: { en: 'Relay payload; viable ingress and contracted egress; ≥1 GB/day delivered; ≤4 h ingress-completion-to-product delay; no buffer overflow; one year. No optical scale, spectrum, swath or thermal checks apply.', ua: 'Прилад ретрансляції; працездатний вхід і заброньований вихід; доставка ≥1 ГБ/добу; ≤4 год від завершення приймання до продукту; без переповнення буфера; рік. Оптичний масштаб, спектр, смуга й теплові перевірки не застосовуються.' },
  hint: { en: 'Keep the same X-band hardware and select Ground service → network. Ingress alone is not a complete route. More storage cannot create a missing egress.', ua: 'Збережіть те саме X-діапазонне обладнання й виберіть Наземний сервіс → мережа. Сам вхід — не повний маршрут. Більший буфер не створює відсутнього виходу.' },
  lesson: { en: 'Synthetic ingress: 02:00–02:10 and 14:00–14:10, 0.5 GB each, 20 Mbps ×70% receiver capacity. Network egress: 03:00–03:06 and 15:00–15:06, selected radio ×70%. FIFO stores a whole batch at ingress end, then serializes it into egress. X-band transfers 0.5 GB in 0.95238 min; with 50 min wait and 1 h processing the delay is 1.84921 h. Camera geometry and cloud rejection are not used.', ua: 'Синтетичний вхід: 02:00–02:10 і 14:00–14:10, по 0,5 ГБ, приймач 20 Мбіт/с ×70%. Вихід мережі: 03:00–03:06 і 15:00–15:06, вибране радіо ×70%. FIFO зберігає цілий пакет наприкінці приймання, потім передає через вихід. X-діапазон передає 0,5 ГБ за 0,95238 хв; з очікуванням 50 хв і обробкою 1 год затримка становить 1,84921 год. Геометрія камери й хмарне відбракування не використовуються.' },
  context: RELAY_CONTEXT, initialConfiguration: initial, passingConfiguration: { ...initial, groundId: 'gs-network' },
  sources: [{ title: 'NASA SCaN — Delay / Disruption Tolerant Networking', url,
    scope: { en: 'Conceptual store-and-forward rationale only: nodes store data until the next node is available. No NASA hardware throughput, reliability, flight certification or real contact geometry is transferred.', ua: 'Лише обґрунтування зберігання з пересиланням: вузол зберігає дані, доки наступний стане доступним. Пропускна здатність, надійність, льотна сертифікація NASA чи реальна геометрія не переносяться.' } }],
}
