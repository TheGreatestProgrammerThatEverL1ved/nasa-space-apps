import type { MissionConfiguration } from '../engine/types'

const shared = {
  scenarioId: 'wildfire', payloadId: 'pl-thermal', busId: 'bus-12u',
  orbitId: 'orb-sso-low', launcherId: 'lv-heavy',
}
export const WF_A: MissionConfiguration = { ...shared, arrayId: 'arr-deploy-l', batteryId: 'bat-s', radioId: 'rf-s', groundId: 'gs-service' }
export const WF_B: MissionConfiguration = { ...shared, arrayId: 'arr-deploy-l', batteryId: 'bat-m', radioId: 'rf-x', groundId: 'gs-network' }
export const WF_C: MissionConfiguration = { ...shared, arrayId: 'arr-deploy-xl', batteryId: 'bat-m', radioId: 'rf-s', groundId: 'gs-service' }
export const FIRST_MISSION: MissionConfiguration = { ...WF_B, groundId: 'gs-single' }
