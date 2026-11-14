/** Shared contract v1. Single owner: Sol integrator. No React or runtime logic. */
export type Locale = 'en' | 'ua'
export type Labels = Readonly<Record<Locale, string>>
export type Status = 'MET' | 'NOT_MET' | 'UNVERIFIED'
export type Outcome = 'FAILURE' | 'UNVERIFIED' | 'DEFERRED' | 'MODEL_PASS_PROVISIONAL'
export type Provenance = {
  readonly kind: 'verified-reference' | 'derived' | 'provisional'
  readonly sourceRefs: readonly string[]
  readonly assumptionIds: readonly string[]
}
export type Evidence<T> =
  | { readonly state: 'known'; readonly value: T; readonly provenance: Provenance }
  | { readonly state: 'unknown'; readonly missingEvidenceIds: readonly string[] }
export type Metric =
  | { readonly kind: 'finite'; readonly value: number; readonly unit: string; readonly provenance: Provenance }
  | { readonly kind: 'unknown' | 'unbounded' | 'not-applicable'; readonly unit: string; readonly reason: string }
export type Category = 'payload' | 'bus' | 'array' | 'battery' | 'radio' | 'ground' | 'orbit' | 'launcher'
export interface PartBase {
  readonly id: string
  readonly category: Category
  readonly label: Labels
  readonly massKg: number
  readonly costUsd: number
  readonly leadMonths: number
  /** Individual numeric/capability fields each have a provenance entry. */
  readonly evidence: Readonly<Record<string, Provenance>>
}
export interface Bus extends PartBase {
  readonly category: 'bus'
  readonly housekeepingW: number
  readonly storageGB: number
  readonly errorDeg: number
  readonly jitterArcsec: Evidence<number>
  readonly powerPackageLimitKg: number
  readonly spacecraftLimitKg: number
  readonly lifeYears: number
}
export interface ArrayPart extends PartBase {
  readonly category: 'array'
  readonly bolW: number
  readonly annualLoss: number
  readonly busIds: readonly string[]
}
export interface Battery extends PartBase {
  readonly category: 'battery'
  readonly nominalWh: number
  readonly dod: number
  readonly dischargeW: number
  readonly lifeYears: number
}
export interface Radio extends PartBase {
  readonly category: 'radio'
  readonly lineMbps: number
  readonly dcW: number
  readonly antenna: { readonly kind: 'omni' } | { readonly kind: 'directed'; readonly errorDeg: number }
}
export interface Payload extends PartBase {
  readonly category: 'payload'
  readonly activeW: number
  readonly peakW: number
  readonly bandsMicrometers: readonly (readonly [number, number])[]
  readonly widthPixels: number
  readonly heightPixels: number
  readonly bitsPerPixel: number
  readonly framesPerSecond: number
  readonly duty: number
  readonly referenceGSDm: number
  readonly referenceAltitudeKm: number
  readonly crossFovDeg: number
  readonly alongFovDeg: number
  readonly exposureSeconds: number
  readonly errorLimitDeg: number
  readonly busIds: readonly string[]
}
export interface Ground extends PartBase {
  readonly category: 'ground'
  readonly contactsPerDay: number
  readonly lengthMin: number
  readonly efficiency: number
  readonly processingHours: number
  readonly annualOpsUsd: number
}
export interface Orbit extends PartBase {
  readonly category: 'orbit'
  readonly altitudeKm: number
  readonly inclinationDeg: number
  readonly eclipseFraction: number
  readonly residenceYears: number
}
export interface Launcher extends PartBase {
  readonly category: 'launcher'
  readonly slotLimitKg: number
  readonly adapterKg: number
  readonly orbitIds: readonly string[]
  readonly busIds: readonly string[]
  readonly queueMonths: number
}
export type Part = Bus | ArrayPart | Battery | Radio | Payload | Ground | Orbit | Launcher
export interface Catalog {
  readonly buses: readonly Bus[]
  readonly arrays: readonly ArrayPart[]
  readonly batteries: readonly Battery[]
  readonly radios: readonly Radio[]
  readonly payloads: readonly Payload[]
  readonly grounds: readonly Ground[]
  readonly orbits: readonly Orbit[]
  readonly launchers: readonly Launcher[]
}
export interface MissionConfiguration {
  readonly scenarioId: string
  readonly payloadId: string
  readonly busId: string
  readonly arrayId: string
  readonly batteryId: string
  readonly radioId: string
  readonly groundId: string
  readonly orbitId: string
  readonly launcherId: string
}
export type Tracking =
  | { readonly mode: 'accepted'; readonly busIds: readonly string[]; readonly maxRateDegSec: number; readonly residualSpeedMps: number; readonly provenance: Provenance }
  | { readonly mode: 'disabled' }
  | { readonly mode: 'unknown' }
/** Scenario science policy. All limits are explicit teaching choices, not flight requirements. */
export interface SciencePolicy {
  readonly prefix: string
  readonly spectrumMicrometers: readonly [number, number]
  readonly maxScaleM: number
  readonly minFootprintKm: number
  readonly maxAccessHours: number
  readonly minUsefulGBDay: number
  readonly maxLatencyHours: number
  readonly minYears: number
  readonly stretch: {
    readonly scaleM: number
    readonly accessHours: number
    readonly usefulGBDay: number
    readonly latencyHours: number
    readonly years: number
  }
}
export interface MissionDefinition {
  readonly id: string
  readonly title: Labels
  readonly subtitle: Labels
  readonly brief: Labels
  readonly lesson: Labels
  readonly hint: Labels
  readonly goals: Labels
  readonly context: EvaluationContext
  readonly initialConfiguration: MissionConfiguration
  readonly passingConfiguration: MissionConfiguration
  readonly sources: readonly { readonly title: string; readonly url: string; readonly scope: Labels }[]
}
export interface EvaluationContext {
  readonly modelRevision: string
  readonly contractRevision: string
  readonly catalogRevision: string
  readonly scenarioRevision: string
  readonly fixtureRevision: string
  readonly catalog: Catalog
  readonly scenario: {
    /** Absent only for backwards-compatible audited wildfire contexts. */
    readonly id?: string
    readonly science?: SciencePolicy
    readonly budgetUsd: number
    readonly availableMonths: number
    readonly plannedYears: number
    readonly fundedYears: number
    readonly acceptedFraction: number
  }
  readonly fixture: {
    /** Required for newly added scenarios; legacy absence denotes audited wildfire. */
    readonly scenarioId?: string
    readonly targetGapHours: Evidence<number>
    readonly targetOrbitIds: readonly string[]
    readonly receiverCompatible: Evidence<boolean>
    readonly linkClosure: Evidence<boolean>
    readonly evenlySpaced: Evidence<boolean>
    readonly modePlacement: Evidence<boolean>
    readonly tracking: Tracking
  }
}
export interface CheckResult {
  /** An insufficient ceiling can prove failure without proving achieved delivery. */
  readonly actualBasis?: 'upper-bound'
  readonly checkId: string
  readonly scope: 'science' | 'engineering'
  readonly status: Status
  readonly actual: Metric
  readonly operator: '<=' | '>=' | 'true'
  readonly limit: number
  readonly reasonCode: string
  readonly ruleRef: string
  readonly prerequisiteIds: readonly string[]
}
export interface Diagnostic {
  readonly reasonCode: string
  readonly detailId: string
  readonly checkIds: readonly string[]
  readonly causeIds: readonly string[]
  readonly repairKey: string
}
export interface ServiceWindow {
  readonly startMin: number
  readonly endMin: number
  readonly rateGBMin: number
  readonly capacityGB: number
}
export interface LinkService {
  readonly state: 'available' | 'unavailable' | 'unknown'
  readonly contactFixtureId: string
  readonly nominalCapacityGBDay: Metric
  readonly effectiveCapacityGBDay: Metric
  readonly windows: Evidence<readonly ServiceWindow[]>
  readonly reasonIds: readonly string[]
}
export interface QueueResult {
  readonly status: 'stable' | 'unstable' | 'unverified'
  /** Derived from authoritative daily D >= G; never retoleranced per contact. */
  readonly perContactStable: Status
  readonly peakGB: Metric
  readonly backlogGBDay: Metric
  readonly latencyHours: Metric
  readonly usefulGBDay: Metric
  readonly storageStatus: Status
  readonly saturationEstimateDays: Metric
}
export interface Counts { readonly MET: number; readonly NOT_MET: number; readonly UNVERIFIED: number; readonly total: number }
export interface EvaluationReport {
  readonly origin: 'evaluator'
  readonly configurationKey: string
  readonly config: MissionConfiguration | null
  readonly modelRevision: string
  readonly contractRevision: string
  readonly validation: { readonly kind: 'valid' | 'invalid'; readonly issues: readonly string[] }
  readonly outcome: Outcome
  readonly checks: readonly CheckResult[]
  readonly metrics: Readonly<Record<string, Metric>>
  readonly counts: { readonly science: Counts; readonly engineering: Counts }
  readonly diagnostics: readonly Diagnostic[]
  readonly warnings: readonly string[]
  readonly assumptions: readonly string[]
  readonly sources: readonly string[]
  readonly service: LinkService | null
  readonly queue: QueueResult | null
  readonly merit: Metric
  readonly timelineEligible: boolean
}
export type ReportProvider = (request: unknown) => EvaluationReport
export interface GeometryResult {
  readonly periodMin: number
  readonly nativeGSDm: number
  readonly staticOffsetKm: number
  readonly swathKm: number
  readonly usableSwathKm: number
  readonly untrackedSpeedMps: number
  readonly trackingRateDegSec: number
  readonly jitterGroundM: Metric
  readonly smearM: Metric
  readonly effectiveScaleM: Metric
  readonly motionStatus: Status
}
export interface PowerResult {
  readonly contactsPerOrbit: number
  readonly sunlightMin: number
  readonly activityMin: number
  readonly avgLoadW: number
  readonly requiredWh: number
  readonly bolWh: number
  readonly eolWh: number
  readonly eclipseDemandWh: number
  readonly usableBatteryWh: number
  readonly peakW: number
  readonly peakWh: number
}
