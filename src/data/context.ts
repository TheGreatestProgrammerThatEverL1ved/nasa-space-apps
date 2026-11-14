/**
 * Frozen shared scenario and fixture snapshot, technical rulebook §10.
 * Revisions are explicit so a report can never mix catalog/scenario/fixture
 * snapshots silently. All fixture values remain provisional [P].
 */
import { CONTRACT_REVISION, MODEL_REVISION } from '../engine/constants'
import type {
  EvaluationContext,
  Evidence,
  Provenance,
  Tracking,
} from '../engine/types'
import { CATALOG } from './catalog'
import { ruleRef } from './ruleRefs'
import type { RuleSection } from './ruleRefs'

const CATALOG_REVISION = 'catalog-step2-2026-11-14'
const SCENARIO_REVISION = 'scenario-wildfire-step2-2026-11-14'
const FIXTURE_REVISION = 'fixture-step2-2026-11-14'

const fixtureProvenance = (
  section: RuleSection,
  ...assumptionIds: string[]
): Provenance => ({
  kind: 'provisional',
  sourceRefs: [ruleRef(section)],
  assumptionIds,
})

const known = <T>(value: T, provenance: Provenance): Evidence<T> => ({
  state: 'known',
  value,
  provenance,
})

const TRACKING: Tracking = {
  mode: 'accepted',
  busIds: ['bus-12u'],
  maxRateDegSec: 1.0,
  residualSpeedMps: 1000,
  provenance: fixtureProvenance('3.1', 'tracking'),
}

export const DEFAULT_CONTEXT: EvaluationContext = {
  modelRevision: MODEL_REVISION,
  contractRevision: CONTRACT_REVISION,
  catalogRevision: CATALOG_REVISION,
  scenarioRevision: SCENARIO_REVISION,
  fixtureRevision: FIXTURE_REVISION,
  catalog: CATALOG,
  scenario: {
    budgetUsd: 3_000_000,
    availableMonths: 36,
    plannedYears: 1,
    fundedYears: 1,
    acceptedFraction: 0.6,
  },
  fixture: {
    targetGapHours: known(24, fixtureProvenance('4.1', 'synthetic-access')),
    targetOrbitIds: ['orb-sso-low'],
    receiverCompatible: known(true, fixtureProvenance('3.4', 'receiver-compatible')),
    linkClosure: known(true, fixtureProvenance('3.4', 'link-closure')),
    evenlySpaced: known(true, fixtureProvenance('4.2', 'synthetic-contacts')),
    modePlacement: known(true, fixtureProvenance('5.2', 'mode-placement')),
    tracking: TRACKING,
  },
}
