import { MISSIONS } from '../scenarios'
import type { EvaluationContext, MissionDefinition, Provenance } from '../../engine/types'
import { NEW_ARRAYS, NEW_BATTERIES, NEW_BUSES, NEW_GROUNDS, NEW_PAYLOADS, NEW_RADIOS, PLAYER_PROVENANCE } from './catalog'
import { OPERATIONS_ARRAYS, OPERATIONS_BATTERIES, OPERATIONS_GROUNDS, OPERATIONS_RADIOS, PLAYER_LAUNCH_BOOKINGS } from './operations'

export const PLAYER_BALANCE_REVISION = 'player-balance-r2'
export const PLAYER_BUDGETS: Readonly<Record<string, number>> = {
  wildfire: 2850000, 'urban-heat': 2750000, 'visible-mapping': 2400000, 'packet-relay': 2500000,
}
export function playerContext(context: EvaluationContext): EvaluationContext {
  const c=context.catalog
  const extend = <T extends {readonly busIds: readonly string[]; readonly evidence:Readonly<Record<string,Provenance>>}>(p:T):T =>
    p.busIds.includes('bus-12u') ? {...p,busIds:[...p.busIds,...NEW_BUSES.map(b=>b.id)],
      evidence:{...p.evidence,busIds:PLAYER_PROVENANCE}} : p
  const relay=context.fixture.relay
  return {...context, catalogRevision:`${context.catalogRevision}:${PLAYER_BALANCE_REVISION}`,
    scenarioRevision:`${context.scenarioRevision}:${PLAYER_BALANCE_REVISION}`,
    fixtureRevision:`${context.fixtureRevision}:${PLAYER_BALANCE_REVISION}`,
    scenario:{...context.scenario,budgetUsd:PLAYER_BUDGETS[context.scenario.id ?? 'wildfire']!},
    catalog:{...c,buses:[...c.buses,...NEW_BUSES],arrays:[...c.arrays.map(extend),...NEW_ARRAYS,...OPERATIONS_ARRAYS],
      batteries:[...c.batteries,...NEW_BATTERIES,...OPERATIONS_BATTERIES],radios:[...c.radios,...NEW_RADIOS,...OPERATIONS_RADIOS],
      grounds:[...c.grounds,...NEW_GROUNDS,...(relay ? [] : OPERATIONS_GROUNDS)],
      launchers:[...c.launchers.map(extend),...PLAYER_LAUNCH_BOOKINGS],
      payloads:[...c.payloads.map(extend),...NEW_PAYLOADS.filter(p=>p.mode!=='visible-bayer' || context.scenario.id==='visible-mapping')],
      ...(c.relayPayloads ? {relayPayloads:c.relayPayloads.map(extend)} : {})},
    fixture:{...context.fixture,tracking:context.fixture.tracking.mode==='accepted'
      ? {...context.fixture.tracking,busIds:[...context.fixture.tracking.busIds,...NEW_BUSES.map(b=>b.id)],
        provenance:{...context.fixture.tracking.provenance,
          sourceRefs:[...context.fixture.tracking.provenance.sourceRefs,'docs/player-balance.md'],
          assumptionIds:[...context.fixture.tracking.provenance.assumptionIds,'synthetic-player-12u-tracking-interface']}} : context.fixture.tracking,
      ...(relay ? {relay:{...relay,egressByGround:{...relay.egressByGround,
        // Synthetic signed windows, not inferred from contacts/day. Serialization unchanged.
        'gs-regional':[[240,248],[960,968]],'gs-priority':[[150,156],[870,876]],
      }}} : {})},
  }
}
export const PLAYER_MISSIONS: readonly MissionDefinition[] = MISSIONS.map(m=>({...m,context:playerContext(m.context)}))
