/** Explicit assembly recipes for QA, never initial player drafts. */
import type { MissionConfiguration } from '../../engine/types'
const build = (scenarioId:string, busId:string,payloadId:string,arrayId:string,batteryId:string,radioId:string,groundId:string):MissionConfiguration =>
  ({scenarioId,busId,payloadId,arrayId,batteryId,radioId,groundId,orbitId:'orb-sso-low',launcherId:'lv-heavy'})
export const PLAYER_WITNESSES = {
  wildfire: {
    a:build('wildfire','bus-12u-light','pl-thermal-survey','arr-fold-75','bat-pack-80','rf-s-burst','gs-regional'),
    b:build('wildfire','bus-12u-light','pl-thermal','arr-deploy-l','bat-pack-180','rf-x-eco','gs-priority'),
  },
  'urban-heat': {
    a:build('urban-heat','bus-12u-light','pl-thermal-survey','arr-fold-75','bat-pack-80','rf-s-burst','gs-regional'),
    b:build('urban-heat','bus-12u-light','pl-thermal','arr-deploy-l','bat-s','rf-x','gs-single'),
  },
  'visible-mapping': {
    a:build('visible-mapping','bus-12u-light','pl-visible-strip','arr-fold-40','bat-s','rf-s','gs-regional'),
    b:build('visible-mapping','bus-12u-vault','pl-visible-35','arr-deploy-l','bat-pack-80','rf-s-burst','gs-single'),
  },
  'packet-relay': {
    a:build('packet-relay','bus-12u-light','pl-relay','arr-fold-40','bat-pack-80','rf-x-eco','gs-regional'),
    b:build('packet-relay','bus-12u-light','pl-relay','arr-deploy-l','bat-pack-180','rf-x-eco','gs-priority'),
  },
} as const
export const PLAYER_FAILURES = {
  wildfire: {
    budget:{...PLAYER_WITNESSES.wildfire.a,busId:'bus-12u-vault'},
    technical:{...PLAYER_WITNESSES.wildfire.a,groundId:'gs-single'},
  },
  'urban-heat': {
    budget:{...PLAYER_WITNESSES['urban-heat'].a,busId:'bus-12u-vault'},
    technical:{...PLAYER_WITNESSES['urban-heat'].a,radioId:'rf-uhf'},
  },
  'visible-mapping': {
    budget:{...PLAYER_WITNESSES['visible-mapping'].b,groundId:'gs-priority'},
    technical:{...PLAYER_WITNESSES['visible-mapping'].a,payloadId:'pl-visible-8'},
  },
  'packet-relay': {
    budget:{...PLAYER_WITNESSES['packet-relay'].a,busId:'bus-12u-vault'},
    technical:{...PLAYER_WITNESSES['packet-relay'].a,groundId:'gs-single'},
  },
} as const
