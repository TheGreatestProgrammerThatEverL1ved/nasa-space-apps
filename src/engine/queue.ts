import type { Ground, LinkService, QueueResult } from './types'
import { atLeast, atMost, finite, numberOf, unavailable, unknown } from './metric'

export function queue(service: LinkService, generatedGBDay: number, usableStorageGB: number, ground: Ground, acceptedFraction: number): QueueResult {
  const d = numberOf(service.effectiveCapacityGBDay)
  const blank = {
    status: 'unverified', perContactStable: 'UNVERIFIED',
    peakGB: unknown('GB'), backlogGBDay: unknown('GB/day'), latencyHours: unknown('h'),
    usefulGBDay: unknown('GB/day'), storageStatus: 'UNVERIFIED', saturationEstimateDays: unknown('day'),
  } as const
  if (d === undefined || !Number.isFinite(generatedGBDay)) return blank
  // One authoritative decision in GB/day. Do not independently tolerate G/N.
  const stable = atLeast(d, generatedGBDay)
  const backlog = Math.max(0, generatedGBDay - d)
  const noService = d === 0 && generatedGBDay > 0
  const peak = stable && ground.contactsPerDay > 0
    ? finite(generatedGBDay * Math.max(0, 1440 / ground.contactsPerDay - ground.lengthMin) / 1440, 'GB')
    : unavailable('not-applicable', 'GB', 'no-stable-periodic-peak')
  const storageStatus = peak.kind === 'finite'
    ? (atMost(peak.value, usableStorageGB) ? 'MET' : 'NOT_MET') : 'UNVERIFIED'
  const lossless = stable && storageStatus === 'MET'
  return {
    status: stable ? 'stable' : 'unstable',
    perContactStable: stable ? 'MET' : 'NOT_MET',
    peakGB: peak, storageStatus,
    backlogGBDay: finite(backlog, 'GB/day'),
    latencyHours: noService ? unavailable('unbounded', 'h', 'no-service')
      : lossless ? finite(24 / ground.contactsPerDay + ground.lengthMin / 60 + ground.processingHours, 'h')
        : unknown('h', 'lossless-stable-bound-unsupported'),
    usefulGBDay: noService ? finite(0, 'GB/day') : lossless ? finite(Math.min(generatedGBDay, d) * acceptedFraction, 'GB/day') : unknown('GB/day', 'lossless-delivery-unsupported'),
    saturationEstimateDays: backlog > 0 ? finite(usableStorageGB / backlog, 'day') : unavailable('not-applicable', 'day', 'no-net-backlog'),
  }
}
