/** Pure pointing, footprint, jitter, and tracking geometry. Source: technical rules §5.4. */
import { EARTH_RADIUS_KM, MU_KM3_S2 } from './constants'
import { atMost, finite, unknown } from './metric'
import type { Bus, GeometryResult, Metric, Orbit, Payload, Status, Tracking } from './types'

const DEG = Math.PI / 180
const ARCSEC = Math.PI / (180 * 3600)

const orbitalPeriodMin = (altitudeKm: number): number =>
  (2 * Math.PI * Math.sqrt((EARTH_RADIUS_KM + altitudeKm) ** 3 / MU_KM3_S2)) / 60

const jitterMetric = (bus: Bus, altitudeKm: number): Metric =>
  bus.jitterArcsec.state === 'known'
    ? finite(altitudeKm * 1000 * Math.tan(bus.jitterArcsec.value * ARCSEC), 'm')
    : unknown('m', bus.jitterArcsec.missingEvidenceIds.join(',') || 'exposure-jitter')

const scaleMetric = (nativeGSDm: number, jitter: Metric, smear: Metric): Metric => {
  if (jitter.kind !== 'finite') {
    return unknown('m', jitter.kind === 'unknown' ? jitter.reason : 'exposure-jitter')
  }
  if (smear.kind !== 'finite') {
    return unknown('m', smear.kind === 'unknown' ? smear.reason : 'image-motion')
  }
  return finite(
    Math.sqrt(nativeGSDm ** 2 + jitter.value ** 2 + smear.value ** 2),
    'm',
  )
}

const motion = (
  tracking: Tracking,
  busId: string,
  requiredRateDegSec: number,
  untrackedSpeedMps: number,
  exposureSeconds: number,
): { readonly smear: Metric; readonly status: Status } => {
  if (tracking.mode === 'disabled') {
    return { smear: finite(untrackedSpeedMps * exposureSeconds, 'm'), status: 'NOT_MET' }
  }
  if (tracking.mode === 'unknown') {
    return { smear: unknown('m', 'tracking-profile-unknown'), status: 'UNVERIFIED' }
  }
  if (!tracking.busIds.includes(busId)) {
    return { smear: unknown('m', 'tracking-profile-not-accepted'), status: 'UNVERIFIED' }
  }
  if (!atMost(requiredRateDegSec, tracking.maxRateDegSec)) {
    return { smear: unknown('m', 'tracking-rate-unsupported'), status: 'NOT_MET' }
  }
  return {
    smear: finite(tracking.residualSpeedMps * exposureSeconds, 'm'),
    status: 'MET',
  }
}

export function geometry(
  bus: Bus,
  payload: Payload,
  orbit: Orbit,
  tracking: Tracking,
): GeometryResult {
  const altitudeKm = orbit.altitudeKm
  const periodMin = orbitalPeriodMin(altitudeKm)
  const nativeGSDm = (payload.referenceGSDm * altitudeKm) / payload.referenceAltitudeKm
  const staticOffsetKm = altitudeKm * Math.tan(bus.errorDeg * DEG)
  const swathKm = 2 * altitudeKm * Math.tan((payload.crossFovDeg * DEG) / 2)
  const usableSwathKm = Math.max(0, swathKm - 2 * staticOffsetKm)
  const untrackedSpeedMps = (2 * Math.PI * EARTH_RADIUS_KM * 1000) / (periodMin * 60)
  const trackingRateDegSec = (untrackedSpeedMps / (altitudeKm * 1000)) * (180 / Math.PI)
  const jitterGroundM = jitterMetric(bus, altitudeKm)
  const { smear, status: motionStatus } = motion(
    tracking,
    bus.id,
    trackingRateDegSec,
    untrackedSpeedMps,
    payload.exposureSeconds,
  )

  return {
    periodMin,
    nativeGSDm,
    staticOffsetKm,
    swathKm,
    usableSwathKm,
    untrackedSpeedMps,
    trackingRateDegSec,
    jitterGroundM,
    smearM: smear,
    effectiveScaleM: scaleMetric(nativeGSDm, jitterGroundM, smear),
    motionStatus,
  }
}
