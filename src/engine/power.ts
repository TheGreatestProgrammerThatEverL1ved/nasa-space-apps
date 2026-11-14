/** Pure worst-orbit power budget. Source: technical rules §§5.2–5.3. */
import { EARTH_RADIUS_KM, MU_KM3_S2 } from './constants'
import type {
  ArrayPart,
  Battery,
  Bus,
  Ground,
  Orbit,
  Payload,
  PowerResult,
  Radio,
} from './types'

const SOLAR_DERATE = 0.85
const DISCHARGE_EFFICIENCY = 0.90
const CAPACITY_RETENTION = 0.95
const PEAK_ENVELOPE_HOURS = 0.1

const orbitalPeriodMin = (altitudeKm: number): number =>
  (2 * Math.PI * Math.sqrt((EARTH_RADIUS_KM + altitudeKm) ** 3 / MU_KM3_S2)) / 60

export function power(
  bus: Bus,
  payload: Payload,
  array: ArrayPart,
  battery: Battery,
  radio: Radio,
  ground: Ground,
  orbit: Orbit,
  years: number,
): PowerResult {
  const periodMin = orbitalPeriodMin(orbit.altitudeKm)
  const sunHours = (periodMin * (1 - orbit.eclipseFraction)) / 60
  const eclipseHours = (periodMin * orbit.eclipseFraction) / 60
  const contactsPerOrbit = Math.ceil((ground.contactsPerDay * periodMin) / 1440)
  const txDutyWorstOrbit = (contactsPerOrbit * ground.lengthMin) / periodMin
  const avgLoadW =
    bus.housekeepingW + payload.activeW * payload.duty + radio.dcW * txDutyWorstOrbit
  const arrayWh = (y: number): number =>
    array.bolW * SOLAR_DERATE * (1 - array.annualLoss) ** y * sunHours
  const loadWh = (avgLoadW * periodMin) / 60
  const eclipseDemandWh = (bus.housekeepingW + radio.dcW) * eclipseHours
  const chargeLossWh = eclipseDemandWh * (1 / DISCHARGE_EFFICIENCY - 1)
  const requiredWh = loadWh + chargeLossWh
  const usableBatteryWh =
    battery.nominalWh *
    battery.dod *
    CAPACITY_RETENTION ** years *
    DISCHARGE_EFFICIENCY
  const peakW = bus.housekeepingW + payload.peakW + radio.dcW
  const peakWh = peakW * Math.min(PEAK_ENVELOPE_HOURS, sunHours)

  return {
    contactsPerOrbit,
    sunlightMin: sunHours * 60,
    activityMin: payload.duty * periodMin + contactsPerOrbit * ground.lengthMin,
    avgLoadW,
    requiredWh,
    bolWh: arrayWh(0),
    eolWh: arrayWh(years),
    eclipseDemandWh,
    usableBatteryWh,
    peakW,
    peakWh,
  }
}
