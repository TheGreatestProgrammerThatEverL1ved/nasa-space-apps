import type { Diagnostic } from '../../engine/types'
import type { PartField } from './Spacecraft'

/** Known causes take the player to the actual affected control, never a radio-only guess. */
export function repairDestination(diagnostic?: Diagnostic): PartField | null {
  if (!diagnostic || diagnostic.reasonCode === 'MISSING_EVIDENCE' || diagnostic.reasonCode === 'INVALID_INPUT') return null
  const id = diagnostic.detailId
  if (id === 'RL-CAPABILITY') return 'payloadId'
  if (diagnostic.reasonCode === 'RELAY_EGRESS_DEFICIT' || id === 'RL-DELAY') return 'groundId'
  if (diagnostic.reasonCode === 'RELAY_INGRESS_UNCLOSED') return 'payloadId'
  if (/-SPECTRUM$|-GSD$|-FOOTPRINT$/.test(id)) return 'payloadId'
  if (/-LATENCY$|-ACCESS$/.test(id)) return 'groundId'
  const destinations: Readonly<Record<string, PartField>> = {
    CDS_MASS_LIMIT: 'busId', PAYLOAD_INCOMPATIBLE: 'busId', STRUCTURE_OVERLOAD: 'arrayId',
    LAUNCH_INCOMPATIBLE: 'launcherId', OVER_BUDGET: 'groundId', SCHEDULE_INFEASIBLE: 'busId',
    POWER_DEFICIT: 'arrayId', POWER_DEGRADATION: 'arrayId', ECLIPSE_OUTAGE: 'batteryId',
    PEAK_POWER_FAIL: 'batteryId', POINTING_UNSTABLE: 'busId', LINK_UNCLOSED: 'radioId',
    DATA_BOTTLENECK: 'radioId', STORAGE_SATURATED: 'busId', OPERATIONS_CONFLICT: 'groundId',
    LIFETIME_SHORT: 'batteryId',
  }
  return destinations[diagnostic.reasonCode] ?? null
}
