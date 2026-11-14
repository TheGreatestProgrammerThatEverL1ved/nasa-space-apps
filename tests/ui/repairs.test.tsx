import { expect, it } from 'vitest'
import { repairDestination } from '../../src/ui/mission-control/repairs'
import type { Diagnostic } from '../../src/engine/types'
const diagnostic = (reasonCode: string, detailId = ''): Diagnostic => ({ reasonCode, detailId, repairKey: detailId, causeIds: [], checkIds: [] })
it('maps mass, power, payload, compatibility and compound/unknown evidence safely', () => {
  expect(repairDestination(diagnostic('CDS_MASS_LIMIT'))).toBe('busId')
  expect(repairDestination(diagnostic('POWER_DEFICIT'))).toBe('arrayId')
  expect(repairDestination(diagnostic('PEAK_POWER_FAIL'))).toBe('batteryId')
  expect(repairDestination(diagnostic('SCIENCE_REQUIREMENT_UNMET', 'WF-SPECTRUM'))).toBe('payloadId')
  expect(repairDestination(diagnostic('PAYLOAD_INCOMPATIBLE'))).toBe('busId')
  expect(repairDestination(diagnostic('SCIENCE_REQUIREMENT_UNMET', 'WF-LATENCY'))).toBe('groundId')
  expect(repairDestination(diagnostic('MISSING_EVIDENCE', 'WF-LATENCY'))).toBeNull()
  expect(repairDestination(diagnostic('unknown-compound'))).toBeNull()
})
