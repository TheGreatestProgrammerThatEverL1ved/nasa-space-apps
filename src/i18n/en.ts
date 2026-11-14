/** English source dictionary. Every player-facing string lives here. */
export const en = {
  'app.documentTitle': 'MISSION FORGE — Return the Heat Map',
  'app.brand': 'MISSION FORGE',
  'app.missionName': 'Return the Heat Map',
  'app.missionType': 'Scheduled wildfire thermal-anomaly training mission',
  'app.brief':
    'Design a scheduled thermal-imaging mission for a land-management science team. Choose eight parts, run the model, and repair what fails. Training model — not operational fire detection or flight qualification.',
  'app.notPlayable': 'Flood and methane missions are not playable in this version.',
  'app.skipToControls': 'Skip to mission controls',
  'app.scenarioLabel': 'Scenario',
  'app.budgetFact': 'Budget: {budget}',
  'app.scheduleFact': 'Available: {months} months',
  'app.operationsFact': 'Planned and funded horizon: {years} year(s)',
  'app.headerNote': 'Training model · not flight qualification',
  'app.briefTitle': 'Mission brief',
  'app.language': 'Language',
  'locale.en': 'English',
  'locale.ua': 'Українська',

  'control.eyebrow': 'MISSION CONTROL / TRAINING SIMULATOR',
  'control.sequence': 'Choose parts → run the model → repair the failed gate.',
  'control.stepBrief': 'Mission brief',
  'control.stepBuild': 'Build the design',
  'control.stepRun': 'Run the model',
  'control.stepRepair': 'Repair and rerun',
  'control.telemetry': 'Resource telemetry',
  'control.margin': 'Resource headroom · after reserve',
  'control.scheduleSlack': 'Schedule slack',
  'control.details': 'Checks, resources and assumptions',
  'control.evidence': 'Sources and field-level evidence',
  'control.repairTitle': 'Repair the failed gate',
  'control.awaiting': 'Run to measure this design',
  'control.contactLesson':
    'For the starter X-band design, with a closing link and stable queue: single station 7.1 h → network 3.1 h. These are fixture bounds, not validated observation ages.',
  'control.groundAction': 'Review ground service',
  'control.goal': 'Every science and engineering gate must pass',
  'control.diagramCaption': 'Concept illustration · not a propagated orbit',

  'config.title': 'Design your mission',
  'config.intro':
    'Choose one part per category, then run the model. Any change marks the current result as out of date.',
  'config.groundHint':
    'For starter X-band hardware, a closing link and stable queue: single station 7.1 h → network 3.1 h. Try Ground service → network for the 6 h goal, then rerun all gates. Faster radio alone cannot create a contact.',
  'mission.picker': 'Choose your mission',
  'mission.select': 'Mission',
  'mission.intro': 'Same engineering. Different science priorities.',
  'mission.goals': 'Science goals · synthetic game limits',
  'mission.sources': 'Teaching notes, assumptions and primary references',
  'check.UH-SPECTRUM': 'Thermal band covers 8–12 µm',
  'check.UH-GSD': 'Effective image scale is 180 m or smaller',
  'check.UH-FOOTPRINT': 'Usable footprint is 100 km or wider',
  'check.UH-ACCESS': 'Scheduled city-target gap is 24 h or less',
  'check.UH-DELIVERY': 'Delivered useful products are at least 1.5 GB/day',
  'check.UH-LATENCY': 'Fixture delivery latency is 12 h or less',
  'check.UH-DURATION': 'Planned operations are at least 1 year',
  'repair.UH-LATENCY': 'Restore stable service first, then compare contact cadence against this mission’s 12 h fixture limit.',
  'config.run': 'Run mission',
  'config.runNote':
    'The evaluation runs locally and deterministically. Run again to check the current design.',
  'config.partsLabel': 'Mission parts',

  'category.payload': 'Payload',
  'category.bus': 'Bus',
  'category.array': 'Solar array',
  'category.battery': 'Battery',
  'category.radio': 'Radio package',
  'category.ground': 'Ground service',
  'category.orbit': 'Orbit',
  'category.launcher': 'Launch booking',

  'resources.title': 'Six resources',
  'resources.intro':
    'These summaries come from the current result. They do not replace the full gate list below.',
  'resources.awaiting': 'Run the mission to populate this resource.',
  'resources.help': 'Compare actual values with limits in the check list below.',
  'resources.stale':
    'These resource summaries describe the previous configuration. Run the mission again to refresh them.',
  'resource.mass': 'Mass',
  'resource.power': 'Power',
  'resource.budget': 'Budget',
  'resource.data': 'Data',
  'resource.communications': 'Communications',
  'resource.time': 'Time',

  'metric.massKg': 'Allocated spacecraft mass',
  'metric.arrayWhOrbitBOL': 'Array energy per orbit at start of life',
  'metric.arrayWhOrbitEOL': 'Array energy per orbit at end of life',
  'metric.arrayRequiredWhOrbit': 'Required energy per orbit',
  'metric.batteryUsableWhEOL': 'Usable battery energy at end of life',
  'metric.eclipseDemandWh': 'Eclipse energy demand',
  'metric.peakW': 'Peak power demand',
  'metric.peakWh': 'Six-minute peak energy',
  'metric.totalUsd': 'Total mission cost',
  'metric.generatedGBDay': 'Image data generated',
  'metric.effectiveDownlinkGBDay': 'Effective downlink capacity',
  'metric.queuePeakGB': 'Stable queue peak',
  'metric.deliveredUsefulGBDay': 'Delivered useful products',
  'metric.latencyHours': 'Fixture delivery latency bound',
  'metric.scheduleMonths': 'Procurement, integration and launch queue',
  'metric.effectiveScaleM': 'Effective image scale',
  'metric.usableSwathKm': 'Usable footprint width',
  'metric.merit': 'Science merit',
  'metric.actual': 'Actual',
  'metric.upperBound': 'Optimistic upper bound',
  'metric.upperBoundNote': 'Even this ceiling is below the goal. Achieved useful delivery remains unverified while the queue is unstable; this is not measured delivery.',
  'metric.limit': 'Limit',
  'metric.mustBeTrue': 'Required condition must be met',
  'metric.unavailable': 'Unavailable — evidence missing',
  'metric.unbounded': 'Unbounded',
  'metric.notApplicable': 'Not applicable',
  'metric.absent': 'Not reported',

  'unit.kg': 'kg',
  'unit.USD': 'USD',
  'unit.GBDay': 'GB/day',
  'unit.h': 'h',
  'unit.W': 'W',
  'unit.Wh': 'Wh',
  'unit.WhOrbit': 'Wh/orbit',
  'unit.m': 'm',
  'unit.km': 'km',
  'unit.months': 'months',
  'unit.GB': 'GB',
  'unit.arcsec': 'arcsec',
  'unit.deg': '°',
  'unit.years': 'years',
  'unit.points': 'points',
  'unit.min': 'min',
  'unit.mps': 'm/s',
  'unit.degSec': '°/s',
  'unit.ratio': 'ratio',

  'results.title': 'Mission result',
  'results.placeholderTitle': 'No result yet',
  'results.placeholderBody':
    'Review the six resources, then run the mission. Results are deterministic and follow your design.',
  'outcomes.failure': 'Mission needs repair',
  'outcomes.provisional': 'Provisional model pass',
  'outcomes.unverified': 'Not confirmed — evidence missing',
  'outcomes.deferred': 'Mission deferred',
  'outcomes.unknown': 'Outcome unavailable',
  'results.failureSummary': 'First finding: {requirement}. Repair direction: {repair}',
  'results.failureSummaryNoFinding':
    'Review the checks that are not met and the repair directions below.',
  'results.passSummary':
    'Every hard gate passes within this training model. This is not flight qualification.',
  'results.unverifiedSummary':
    'Required evidence is missing, so a pass cannot be established.',
  'results.deferredSummary': 'This mission is not playable in this version.',
  'results.invalidSummary':
    'The input could not be evaluated. Correct the named fields and run the mission again.',
  'results.staleNotice':
    'Design changed — the result below describes the previous configuration. Run the mission again to evaluate the current design.',
  'results.backToConfig': 'Back to configuration',
  'results.reportSource': 'Report source',
  'results.reportSourceEvaluator': 'Evaluator',
  'results.reportSourcePreview': 'Fixture preview',
  'results.evaluationError':
    'The evaluation could not complete. The previous result, if any, is unchanged.',
  'results.invalidInputTitle': 'Invalid input details',
  'results.invalidInputBody':
    'The technical identifiers below name the fields or units that need correction.',
  'results.scienceTitle': 'Science requirements',
  'results.engineeringTitle': 'Engineering checks',
  'results.scienceCounts': 'Science requirements: {met} of {total} met',
  'results.engineeringCounts': 'Engineering checks: {met} of {total} met',
  'results.countsDetail': 'Met: {met} · Not met: {notMet} · Not verified: {unverified}',
  'results.checksIntro':
    'Actual values and limits are rounded for reading only; the verdict does not change.',
  'results.ruleReference': 'Rule',
  'results.scienceEmpty': 'No science checks reported.',
  'results.engineeringEmpty': 'No engineering checks reported.',
  'check.generic': 'Requirement check',

  'status.MET': 'Met',
  'status.NOT_MET': 'Not met',
  'status.UNVERIFIED': 'Not verified',

  'check.WF-SPECTRUM': 'Thermal band covers 8–12 µm',
  'check.WF-GSD': 'Effective image scale is 200 m or smaller',
  'check.WF-FOOTPRINT': 'Usable footprint is 90 km or wider',
  'check.WF-ACCESS': 'Scheduled target-access gap is 24 h or less',
  'check.WF-DELIVERY': 'Delivered useful products are at least 1 GB/day',
  'check.WF-LATENCY': 'Fixture delivery latency is 6 h or less',
  'check.WF-DURATION': 'Planned operations are at least 1 year',
  'check.ENG-MASS': 'Allocated spacecraft mass is within the booked limit',
  'check.ENG-SLOT': 'Launch slot including adapter is within the limit',
  'check.ENG-LAUNCH-INTERFACE': 'Launch orbit and interface are compatible',
  'check.ENG-PAYLOAD-FIT': 'Payload fits the selected bus',
  'check.ENG-POWER-PACKAGE-FIT': 'Array and battery fit the bus allowance',
  'check.ENG-BUDGET': 'Total cost is within budget and reserve',
  'check.ENG-SCHEDULE': 'Procurement, integration and queue fit the schedule',
  'check.ENG-MODES': 'Imaging and transmission fit allowed operating modes',
  'check.ENG-POWER-BOL': 'Start-of-life generation covers required energy',
  'check.ENG-POWER-EOL': 'End-of-life generation covers required energy',
  'check.ENG-ECLIPSE': 'Usable battery energy covers eclipse demand',
  'check.ENG-PEAK-W': 'Battery discharge power covers peak load',
  'check.ENG-PEAK-WH': 'Usable battery energy covers the six-minute peak',
  'check.ENG-PAYLOAD-POINTING': 'Payload pointing error is within the limit',
  'check.ENG-MOTION-PROFILE': 'Tracking and image-motion evidence is accepted',
  'check.ENG-LINK': 'Science downlink closes with a compatible receiver',
  'check.ENG-DATA-RATE': 'Downlink sustains the generated stream',
  'check.ENG-STORAGE': 'Between-contact queue fits usable storage',
  'check.ENG-LIFETIME': 'Planned duration is within supported and funded life',

  'diagnostics.title': 'Diagnosis and repair',
  'diagnostics.intro':
    'Each finding names a cause and a specific repair direction. Rerun every gate after changing a part.',
  'diagnostics.empty': 'No findings reported.',
  'diagnostics.reasonLabel': 'Cause',
  'diagnostics.detailLabel': 'Affected requirement',
  'diagnostics.repairLabel': 'Repair direction',
  'diagnostics.relatedChecks': 'Related checks',
  'diagnostics.relatedCauses': 'Related causes',
  'diagnostics.detailFallback': 'Affected condition',
  'reason.generic': 'Model reason reported',
  'reason.INVALID_INPUT': 'Missing or malformed input data',
  'reason.CDS_MASS_LIMIT': 'Spacecraft mass exceeds the booked allocation',
  'reason.LAUNCH_INCOMPATIBLE': 'Launch slot, interface or orbit is incompatible',
  'reason.PAYLOAD_INCOMPATIBLE': 'Payload is incompatible with the bus',
  'reason.STRUCTURE_OVERLOAD': 'Array and battery exceed the bus allowance',
  'reason.OVER_BUDGET': 'Budget including reserve and operations is exceeded',
  'reason.SCHEDULE_INFEASIBLE': 'Procurement, integration and queue miss the deadline',
  'reason.OPERATIONS_CONFLICT': 'Imaging and transmission modes conflict',
  'reason.POWER_DEFICIT': 'Energy generation is insufficient',
  'reason.POWER_DEGRADATION': 'Energy generation falls below demand',
  'reason.ECLIPSE_OUTAGE': 'Usable battery energy cannot cover the eclipse',
  'reason.PEAK_POWER_FAIL': 'Peak power or peak energy is insufficient',
  'reason.POINTING_UNSTABLE': 'Pointing, stability or motion conditions are not met',
  'reason.LINK_UNCLOSED': 'Science downlink does not close',
  'reason.DATA_BOTTLENECK': 'Downlink capacity cannot sustain the full stream',
  'reason.STORAGE_SATURATED': 'Between-contact queue exceeds usable storage',
  'reason.SCIENCE_REQUIREMENT_UNMET': 'A science requirement is not met',
  'reason.LIFETIME_SHORT': 'Planned duration exceeds supported or funded life',
  'reason.MISSING_EVIDENCE': 'Required evidence is missing',

  'repair.INVALID_INPUT':
    'Correct the named field, unit or identifier; do not substitute zero or invented performance.',
  'repair.CDS_MASS_LIMIT':
    'Reduce package mass or use a compatible allocation; a larger rocket slot does not enlarge a CubeSat bay.',
  'repair.LAUNCH_INCOMPATIBLE':
    'Select a supported booking with its adapter and compatible orbit; unknown delivery needs evidence.',
  'repair.PAYLOAD_INCOMPATIBLE':
    'Choose a compatible package; reassess mass, power and cost after the change.',
  'repair.STRUCTURE_OVERLOAD':
    'Choose an array and battery within the bus allowance; then recheck mass and energy.',
  'repair.OVER_BUDGET':
    'Reduce cost while retaining the required science and delivery; do not silently drop operations.',
  'repair.SCHEDULE_INFEASIBLE':
    'Reduce lead-time demand with accepted choices; do not erase integration and launch queue time.',
  'repair.OPERATIONS_CONFLICT':
    'Use an accepted operating profile; reducing the workload is not a free repair.',
  'repair.POWER_DEFICIT':
    'Improve compatible generation or reduce the approved load; a larger battery alone cannot recharge itself.',
  'repair.POWER_DEGRADATION':
    'Check array degradation and end-of-life required energy; improve generation rather than only storage.',
  'repair.ECLIPSE_OUTAGE':
    'Increase usable energy or reduce the approved eclipse load, then recheck mass and recharge.',
  'repair.PEAK_POWER_FAIL':
    'Select a battery with enough usable energy and discharge power; Wh alone does not prove W.',
  'repair.POINTING_UNSTABLE':
    'Use an accepted pointing and tracking profile; do not invent stability or residual-motion performance.',
  'repair.LINK_UNCLOSED':
    'While the science link fails, useful science downlink is zero. Restore a compatible receiver, antenna pointing and link-closure conditions, then re-evaluate.',
  'repair.DATA_BOTTLENECK':
    'Increase accepted rate or unique contact time; extra memory only delays a growing backlog.',
  'repair.STORAGE_SATURATED':
    'Improve contact cadence or compatible storage, and separately resolve any sustained deficit.',
  'repair.SCIENCE_REQUIREMENT_UNMET':
    'Fix the named science requirement; for slow delivery improve cadence and processing, not only Mbps.',
  'repair.LIFETIME_SHORT':
    'Fund the required operations within budget and supported duration; capacity is not service life.',
  'repair.MISSING_EVIDENCE':
    'Supply the missing access, tracking, link or interface evidence; an invented value is not a repair.',
  'repair.WF-LATENCY':
    'More Mbps cannot create a missing contact; try more frequent ground contacts.',
  'repair.WF_LATENCY':
    'More Mbps cannot create a missing contact; try more frequent ground contacts.',
  'repair.MORE_CONTACTS':
    'More Mbps cannot create a missing contact; try more frequent ground contacts.',
  'repair.REPAIR_WF_LATENCY':
    'More Mbps cannot create a missing contact; try more frequent ground contacts.',
  'repair.generic':
    'Review the named check and choose a compatible part or approved operating profile, then run the mission again.',

  'warnings.title': 'Model warnings',
  'warnings.intro': 'Warnings flag tight margins. They do not change the verdict.',
  'warnings.empty': 'No warning thresholds crossed.',
  'warning.generic': 'A resource margin is below an audited warning threshold.',
  'warning.budget': 'Budget headroom is below the audited 10% warning threshold.',
  'warning.mass': 'Spacecraft mass headroom is below the audited 10% warning threshold.',
  'warning.data': 'Data headroom is below the audited 10% warning threshold.',
  'warning.power': 'Power margin is below the audited 15% warning threshold.',
  'warning.schedule': 'Schedule slack is below six months.',

  'assumptions.title': 'Provisional assumptions',
  'assumptions.intro':
    'These assumptions keep the training model reproducible. A provisional pass is not flight qualification.',
  'assumptions.baseline':
    'Nominal passing-fixture assumptions — not established conditions for this report; see the evaluated checks above.',
  'assumptions.tracking':
    'Accepted provisional 1.0°/s ground-target tracking with image-motion compensation.',
  'assumptions.link': 'A closing science downlink and a compatible receiver are assumed.',
  'assumptions.access':
    'Scheduled target access comes from the synthetic fixture; it is not propagated geography.',
  'assumptions.cost':
    'Prices, integration and launch queue are game assumptions, not vendor quotes.',
  'assumptions.life':
    'One funded year; bus, battery and orbit support are provisional.',
  'assumptions.cloud':
    '40% of scenes are discarded for cloud after consuming imaging and downlink; 60% are accepted.',
  'assumptions.recordsTitle': 'Additional assumption records',
  'assumptions.recordsEmpty': 'No additional assumption identifiers reported.',

  'evidence.title': 'Evidence and source details',
  'evidence.intro':
    'These technical identifiers help audit the report. Display rounding does not change any gate.',
  'evidence.modelRevision': 'Model revision',
  'evidence.contractRevision': 'Contract revision',
  'evidence.configurationKey': 'Configuration key',
  'evidence.validation': 'Input validation',
  'evidence.valid': 'Valid',
  'evidence.invalid': 'Invalid',
  'evidence.sources': 'Sources',
  'evidence.noSources': 'No source references reported.',
  'evidence.serviceState': 'Link service state',
  'evidence.queueStatus': 'Queue status',
  'evidence.timelineEligible': 'Timeline eligible',
  'evidence.yes': 'Yes',
  'evidence.no': 'No',
  'evidence.unknown': 'Unknown',
  'evidence.notReported': 'Not reported',
  'evidence.provenance': 'Provenance',
  'evidence.physicalAge': 'Physical observation-to-product age',
  'evidence.physicalAgeUnknown': 'Unknown — evidence missing',
  'evidence.notAGate': 'This is not an additional hard gate.',
  'evidence.roundingNote':
    'Full-precision values stay in the report; display is rounded for reading only.',
  'provenance.verified-reference': 'Verified reference',
  'provenance.derived': 'Derived',
  'provenance.provisional': 'Provisional',
  'sources.openPrimary': 'Open primary source {id}: {title} (opens in a new tab)',
  'sources.ruleReference': 'Technical rule §{section}',
  'sources.ruleReferenceUnknown': 'Technical rulebook reference',
  'boundary.ambiguous':
    'Near boundary: the rounded actual equals the rounded limit, so the displayed comparison is not decisive.',
  'boundary.detailTitle': 'Show full-precision actual and limit',
  'boundary.exactActual': 'Unrounded actual',
  'boundary.exactLimit': 'Unrounded limit',
  'fieldEvidence.title': 'Field-level provenance',
  'fieldEvidence.intro':
    'Each technical field below carries its own provenance from the configuration evaluated at Run. A provisional field is not a flight-qualification claim.',
  'fieldEvidence.stale':
    'This provenance belongs to the report snapshot described above. Run the mission again to evaluate the current configuration.',
  'fieldEvidence.assumptions': 'Assumptions',
  'fieldEvidence.noFields': 'No field-level provenance reported.',
  'service.available': 'Available',
  'service.unavailable': 'Unavailable',
  'service.unknown': 'Unknown',
  'queue.stable': 'Stable',
  'queue.unstable': 'Unstable',
  'queue.unverified': 'Unverified',

  'latency.short':
    'Analytical fixture latency bound — smoothed arrivals; not validated observation age.',
  'latency.detailTitle': 'What the latency bound means',
  'latency.detail':
    'Synthetic ground contacts repeat evenly over 24 hours; image products are smoothed into uniform queue arrivals. This is the training model’s delivery bound, not a measurement or proof of physical observation-to-product age.',
  'latency.basis': 'Metric basis: synthetic-smoothed-periodic-bound.',
  'latency.unknownAge':
    'Physical observation-to-product age: unknown. This is not an additional hard gate.',
} as const

export type MessageKey = keyof typeof en
