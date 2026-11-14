# MISSION FORGE — technical game rules

> **Post-M4 scope note:** this document preserves the audited **wildfire** mechanics. Newly authorized urban heat policy is separate in [the scenario supplement](scenario-expansion.md); optional credits/unlocks are specified in [Mission Campaign](mission-campaign.md). Neither changes the wildfire thresholds or the preserved source record.

**Model authority:** audited Step 2, **14 November 2026**. **Active mission: Return the Heat Map.**

This is the canonical implementation-facing reorganization of the [preserved audited source](02-game-rules.md), not a rebalanced model. Read [the workflow](agent-workflow.md) for authorization and ownership; [the player guide](game-rules-player.md) omits implementation detail. Questions explicitly marked **Planning question** are unresolved, not permission to invent rules.

## 1. Scope, evidence, and inputs

Design a complete mission for a land-management science team: scheduled LWIR thermal-anomaly imagery and follow-up products. The mission teaches coupled space, ground, launch, and science-user decisions.

The **400,000 km² [P]** region is context only. The task is a **pre-scheduled target campaign**, not daily coverage of every point. It promises neither operational active-fire detections, fire radiative power, fire-size sensitivity, false-alarm performance, cloud penetration, nor emergency full-region coverage.

The original ≤100 m, dual-band, whole-region daily active-fire brief is **REBALANCE_REQUIRED / NOT VERIFIED**. Coastal flood and methane are **DEFERRED**, with no established passing build. They must not be playable solvable missions. No free external observations, cloud exemptions, generic science-affinity shortcuts, multiplayer, random events, difficulty rebalancing, or sandbox expansion are adopted.

### Field-level provenance

| Label | Meaning |
|---|---|
| **[V] Verified reference** | A primary source states this particular field. It does not certify our composite spacecraft; NASA SoA listings are not NASA-independent qualification. |
| **[D] Derived** | Reproducible arithmetic/geometry, conditional on named inputs. Preserve those input assumptions. |
| **[P] Provisional** | Synthetic fixture, estimate, game-design choice, composite allocation, or unsupported performance. |
| **UNVERIFIED** | Required evidence/capability is unknown, not zero and not MET. |

Keep provenance and source IDs on individual fields, not one credibility tag per component. A verified panel rating does not verify its integrated mass, price, or orbit-average power. None of the current builds is a source-validated flight design.

### Inputs and units

- Select one payload, bus, solar array, battery, radio package, ground option, orbit, and launch booking. Keep the model revision and assumptions with a configuration/result.
- Shared reference fixture: **$3,000,000 [P]** budget; **36 months [P]** available; **one year [P]** planned/funded operations. Include ground setup and annual operations. No hidden orbit-design charge: it is included in bus development.
- Units: kg, W DC, Wh, seconds/minutes/hours, km altitude/swath, m spatial scale, degrees control/FOV, arcsec exposure jitter, µm spectrum, USD, months, years. Convert angles to radians for trig; **1 year = 365 days; 12 months = 1 year**.
- Decimal SI only: **Mbps = 10⁶ bits/s; GB = 10⁹ bytes**. Never substitute GiB or ambiguous “Mb”.
- Validate required fields, finite numerical inputs, IDs, units, provenance, compatibility, positive physical masses/capacities, nonnegative loads, efficiencies in **(0,1]**, and duties in **[0,1]**. Do not let undefined/NaN comparisons pass.

**Planning question — controls:** Step 2 fixes the example budget, schedule, workload, and one-year run but does not define player-editable duration/budget controls or difficulty presets. Which remain fixed scenario inputs? Impact: UI inputs, funded-duration cost, EOL evaluation, and score fixtures. Do not introduce alternative thresholds by default.

**Planning question — invalid versus unknown:** §6 of the audit names missing required fields `INVALID_INPUT`, while its evidence rule says unknown required numerical inputs are `UNVERIFIED`. Planning must distinguish malformed/omitted configuration from an explicitly unknown evidence field, and choose the representation of invalid input without allowing a pass. Impact: validation/result contract and precedence. Retain known hard failures even when other evidence is unknown.

## 2. Science requirements and fixed product plan

Every minimum is **inclusive**, and every science requirement plus every engineering gate is hard.

| ID | Required measurement or outcome | Minimum | Stretch | Evidence |
|---|---|---|---|---|
| `WF-SPECTRUM` | Thermal capability | LWIR includes **8–12 µm** | None | Reference [V, S2]; integration [P] |
| `WF-GSD` | Conservative effective spatial scale, not fire-detection sensitivity | **≤200 m** | ≤150 m | Geometry [D]; jitter/tracking [P] |
| `WF-FOOTPRINT` | Usable footprint across tasked strip | **≥90 km** | ≥100 km | FOV/bias geometry [D/P] |
| `WF-ACCESS` | Maximum gap between scheduled geometric target opportunities | **≤24 h** | ≤12 h | Supplied synthetic fixture [P] |
| `WF-DELIVERY` | Delivered usable products, campaign-equivalent after cloud rejection | **≥1.0 GB/day** | ≥2.0 GB/day | Fixed frames → delivery × acceptance [D/P] |
| `WF-LATENCY` | Worst-case observation-to-product delivery bound | **≤6 h** | ≤2 h | Contact/service/processing bound [D/P] |
| `WF-DURATION` | Planned operations | **≥1 year** | ≥3 years | Funded and supported life [P] |

Byte count is an educational product-plan proxy, not universal scientific value. No duplicate/padded-data credit. The fixed plan includes contextual/calibration images. **40% scenes discarded; 60% accepted [P]** means expected campaign-equivalent useful thermal scenes, not confirmed fires or guaranteed clear data every day.

The deliberate audit changes were budget **$1.6M → $3.0M**, spatial limit **100 m → 200 m**, removal of mandatory two-band active-fire algorithm from this LWIR anomaly mission, replacement of full-AOI daily coverage by target-access fixtures, and retention of 40% cloud loss. These are game choices, not NASA requirements.

## 3. Frozen component catalog

IDs below supersede older constants/catalogs. Unless explicitly [V] or [D], **all fields in these tables are [P]**, including price, lead time, compatibility, DC system loads, operational profiles, lifetime, and non-reference pointing.

### 3.1 Bus

Dry allocation includes structure, OBC, EPS electronics, ADCS, thermal hardware, and harness; **excludes camera, battery, array, and science downlink**. Do not count a second structure/ADCS.

| ID | Dry kg | Housekeeping W | Storage GB | Absolute control-error bound ° | Exposure jitter arcsec | Max array+battery kg | USD | Lead mo | Booked spacecraft kg |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `bus-3u` | 3.0 | 3 | 8 | 2.0 | 100 | 1.5 | 180,000 | 8 | 6 |
| `bus-6u` | 6.5 | 6 | 32 | 0.5 | 20 | 4.5 | 430,000 | 12 | 12 |
| `bus-12u` | 12.0 | 12 | 128 | 0.05 | 5 | 10.0 | 940,000 | 18 | 24 |

Booked 6/12/24 kg uses CDS **typical maximum** reference values [V, S1] as hard game policy [P], not a universal legal CubeSat definition. Provider-specific exceptions are not assumed.

All tiers assume **3-year bus/battery service life [P]**. **Only `bus-12u` accepts `pl-thermal`**: its **110×180×230 mm** reference housing does not fit our smaller payload bays. Integration, deployed/stowed hardware, and thermal interfaces remain assumptions; changing compatibility requires an interface drawing.

**Pass-critical tracking [P]:** `bus-12u` is assumed to support **1.0°/s** ground-target tracking while retaining its stated control/jitter bounds. Camera adaptation leaves **≤1,000 m/s** residual apparent ground-image motion during exposure. Neither is a verified CIRC/composite specification. They are included in the illustrative adaptation cost, not free star-tracker capabilities. Other buses have no accepted tracking profile. Without tracking all three example builds fail effective scale.

### 3.2 Arrays

| ID | Peak BOL W | Allocated kg | Annual loss | USD | Lead mo | Buses |
|---|---:|---:|---:|---:|---:|---|
| `arr-body` | 8 [P; reference class] | 0.15 [P] | 1% | 30,000 | 5 | 3U, 6U, 12U |
| `arr-deploy-m` | 24 [P; reference class] | 0.45 [P] | 2% | 85,000 | 8 | 3U, 6U, 12U |
| `arr-deploy-l` | 55 [V, S3] | 0.83 [D/P] | 2% | 175,000 | 10 | 6U, 12U |
| `arr-deploy-xl` | 135 [V, S3] | 4.36 [D/P] | 2% | 300,000 | 12 | 12U only |

S3 reference bare masses: **55/67 ≈0.821 kg**, **135/31 ≈4.355 kg**. Allocations still need integration validation. The body rating is **total**, not per U/panel. Apply incidence/EPS derating **η_solar=0.85 [P]** to every rating; peak BOL W is not orbit-average supply. No universal 30–76 W/kg rejection envelope is adopted.

### 3.3 Batteries

| ID | Nominal Wh | Allocated kg | Allowed DoD | Continuous/discharge W limit | USD | Lead mo |
|---|---:|---:|---:|---:|---:|---:|
| `bat-s` | 40 | 0.36 | 0.70 | 60 | 20,000 | 5 |
| `bat-m` | 120 | 1.01 | 0.75 | 120 | 45,000 | 7 |
| `bat-l` | 300 | 2.52 | 0.80 | 200 | 85,000 | 9 |

Capacity retention **0.95^y**, discharge efficiency **0.90**, and charge/discharge round-trip efficiency **0.90** are separate lumped [P] assumptions. Apply them on the paths in §5, not twice to the same energy. Do not multiply stored capacity by sunlight fraction or infer cycle life from Wh.

### 3.4 Science downlink packages

| ID | Configured line Mbps | kg incl. antenna | Transmitting DC W | Allowed antenna error ° | USD | Lead mo |
|---|---:|---:|---:|---|---:|---:|
| `rf-uhf` | 0.012 | 0.10 | 2 | Omni; no angular gate | 18,000 | 5 |
| `rf-s` | 5 | 0.30 | 8 | 2.0 | 70,000 | 8 |
| `rf-x` | 100 | 0.35 | 20 | 0.5 | 210,000 | 12 |

S/X packages include antenna allocation and agreed ground receiver. Adopted rates and DC loads are [P] systems, not vendor link budgets inferred from S4 rate listings. Frequency alone does not supply rate. RF output W ≠ DC W ≠ payload throughput. An otherwise closing link is an **explicit fixture assumption**; without it the real link is UNVERIFIED.

### 3.5 Retained payload: `pl-thermal`

| Field | Adopted value | Field provenance |
|---|---|---|
| Instrument class | CIRC-like uncooled LWIR anomaly camera, not reused CIRC flight hardware | Reference class [V, S2]; adaptation [P] |
| Mass | **3 kg** | CIRC reference [V, S2]; allocated integrated package [P] |
| Active/peak DC | **20 W** upper bound; **0** incremental idle load | CIRC **<20 W** [V, S2]; switched duty/zero idle [P] |
| Spectrum | **One broad 8–12 µm band** | [V, S2] |
| Detector | **640×480** | [V, S2] |
| Product digitization | **16 bits/pixel** | [P] |
| Conservative GSD reference | **200 m at 600 km** | Conservative use of CIRC <200 m [V/D, S2] |
| FOV | **12° cross-track ×9° along-track** | [V, S2] |
| Exposure | **33 ms =0.033 s** | [V, S2] |
| Residual image speed | **≤1,000 m/s** after assumed tracking | [P], not CIRC specification |
| Allowed absolute payload error | **0.2°** | [P], not inferred from pixel size |
| Full-frame rate while active | **0.75 frames/s** | [P] |
| Acquisition duty | **8% of total time, sunlight only** | [P] |
| Price/lead | **$450,000 /12 months**, including adaptation/product processing allowance | [P] |

No compression, onboard fire classifier, free cloud screening, methane, or radar capability is inferred. `pl-none`, visible-only, and VNIR-only options are **failing teaching choices**, not thermal alternatives.

**Planning question — incomplete teaching catalog:** the audit mentions those failing choices but does not freeze full cost/mass/load/lead fields for them (nor a complete SAR or SWIR instrument). Which failing options should be exposed, with what explicit allocations? Impact: selectable catalog and positive-mass validation for `pl-none`. Do not invent a costed passing payload or import rejected research values; known absence of LWIR still fails the spectral gate.

## 4. Fixture definitions

### 4.1 Orbit and target access

`orb-sso-low`: **500 km circular**, **97.4° inclination [P approximation]**, eclipse fraction **0.38 [D/P]**, period computed in §5. These are not enough orbital elements to propagate a ground track.

Assumed orbital residence is **5 years [P]**, distinct from drag/disposal prediction. With **3-year bus and battery service lives**, unfunded model support is **3 years**. Funded operations further limit actual supported duration.

`orb-vleo` **400 km**, `orb-leo` **550 km**, `orb-sso` **600 km**, and `orb-sso-high` **720 km** are conceptual alternatives with **no validated target-access fixtures**. Their science revisit is UNVERIFIED, not calculated from altitude or imaging capacity. GEO is outside this catalog, not impossible for every CubeSat.

**Target fixture [P]:** nominal daylit **90 km** target-strip opportunities with maximum scheduled geometric gap **24 h**, plus enough contextual imaging for the fixed workload. Target opportunities and ground contacts are different inputs. No full-400,000-km² coverage credit, 24 h cloud-free revisit, or event-to-detection guarantee follows.

### 4.2 Ground contacts and arrivals

| ID | Non-overlapping contacts/day N | Length L min each | Payload efficiency η_link | Processing h | Setup USD | Annual ops USD | Lead mo |
|---|---:|---:|---:|---:|---:|---:|---:|
| `gs-single` | 4 | 6 | 0.70 | 1 | 70,000 | 25,000 | 6 |
| `gs-network` | 12 | 6 | 0.70 | 1 | 240,000 | 80,000 | 10 |
| `gs-service` | 22 | 6 | 0.70 | 1 | 120,000 | 150,000 | 2 |

All [P]. Contact starts are **evenly spaced over 24 h**, repeating across day boundaries. Union overlapping windows; parallel stations never multiply the radio rate. Smooth the fixed camera stream to uniform arrivals: this is a **fluid-queue approximation**, not actual burst timestamps. Real scheduling conflicts, rain fade, and longitude-dependent gaps need timestamped events.

**Planning question — timeline phase:** Step 2 specifies gaps and a periodic fluid queue, not absolute epochs for target acquisitions, contacts, launch, or commissioning. What display-only epoch/labels should explain the fixture? Impact: visualization and exact event times. Do not invent a propagated schedule or exact overflow day, or change analytical evaluator verdicts.

### 4.3 Launch booking

| ID | Adopted capability | Cost | Queue/interface |
|---|---|---|---|
| `lv-heavy` | UI label **50 kg SSO rideshare slot**; total slot **50 kg**, including allocated **2 kg** adapter/dispenser [P] | **$350,000 base [V, S10] +$50,000 integration [P] =$400,000** | **9 months [P]**; standard ≤12U interface and **500 km** delivery assumed [P]; no free orbit change |
| `lv-rideshare-s` | Historical aggregator slot, provider/interface unverified | $150,000 [P] | Disabled for passes pending actual booking specification |
| `lv-dedicated` | Dedicated option not validated | $9,000,000 [P] | Disabled; no invented 300 kg-to-SSO capacity table |

Full-rocket capacity is not purchased slot capacity. S10's approximate four-month SSO cadence is not a nine-month booking guarantee. Never silently use disabled/unverified items as solver shortcuts.

## 5. Equations in dependency order

Use full precision for comparisons; round **only for display**. Equality passes. Machine round-off allowance is at most **`1e-9 × max(1,abs(limit))`**, in that quantity's unit, never an engineering tolerance band.

### 5.1 Mass, procurement, budget, and duration

```text
spacecraftNominalKg = busDry + payload + array + battery + radio
spacecraftAllocatedKg = spacecraftNominalKg × 1.15
slotAllocatedKg = spacecraftAllocatedKg + 2.0
massMargin = (bookedSpacecraftLimitKg − spacecraftAllocatedKg) / bookedSpacecraftLimitKg

buildMonths = max(selected component lead months)   // parallel procurement
scheduleMonths = buildMonths + 4 integration months + 9 launch-queue months
totalUsd = (bus + payload + array + battery + radio + groundSetup
            + 400000 launch + groundAnnualOps × missionYears) × 1.15

supportedDurationYears = min(assumedBusLife, assumedBatteryLife,
                             assumedOrbitalResidence, fundedOperationsYears)
```

Both **15%** factors are game mass contingency/budget reserve [P], not universal NASA minima. Structure is already in bus dry mass. The adapter is **outside** the spacecraft allocation but inside the slot allocation. Lifetime is not inferred from battery energy or guessed decay; do not schedule deorbit on an invented exact day.

### 5.2 Orbit and scheduled modes

```text
R_E = 6378.137 km; mu = 398600.4418 km³/s²
T_min = 2π × sqrt((R_E + altitudeKm)³ / mu) / 60
sunHours = T_min × (1 − eclipseFraction) / 60
eclipseHours = T_min × eclipseFraction / 60
obsDuty = 0.08
maxContactsPerOrbit = ceil(N × T_min / 1440)
txDutyWorstOrbit = maxContactsPerOrbit × L / T_min
loadAvgWorstOrbitW = busHousekeepingW + payloadActiveW × obsDuty
                    + radioDcW × txDutyWorstOrbit
```

No arbitrary minimum TX duty. Validate duties in [0,1]. Sunlight-only payload and non-overlapping imaging/body-antenna modes require:

```text
obsDuty × T_min + maxContactsPerOrbit × L ≤ T_min × (1 − eclipseFraction)
```

Ground windows and mode placement are assumed available, not established by this duration check.

### 5.3 Energy, degradation, eclipse, and peaks

Evaluate at **BOL (y=0) and EOL (y=planned years)**:

```text
arrayWh(y) = arrayBOLW × 0.85 × (1 − annualArrayLoss)^y × sunHours
loadWh = loadAvgWorstOrbitW × T_min / 60
eclipseDemandWh = (busHousekeepingW + radioDcW) × eclipseHours
arrayRequiredWh = loadWh + eclipseDemandWh × (1/0.90 − 1)
powerMargin(y) = (arrayWh(y) − arrayRequiredWh) / arrayWh(y)
usableBatteryWh(y) = nominalWh × allowedDoD × 0.95^y × 0.90
conservativePeakW = busHousekeepingW + payloadPeakW + radioDcW
peakEnvelopeWh = conservativePeakW × min(0.1, sunHours)
```

Payload is **OFF in eclipse**; radio **ON for all eclipse** is a conservative energy upper bound, not an actual assertion that every orbit has an eclipse-long contact. The charging-loss term sizes losses against that bound, not a second full load. The peak sum is also conservative despite separate normal operating modes.

Require generated Wh ≥required Wh at BOL/EOL, usable EOL battery Wh ≥eclipse demand **and** peak envelope, and battery discharge W limit ≥peak W. The **0.1 h /six-minute** peak envelope is [P]. Wh never proves instantaneous W. This is not a full state-of-charge/electrochemical simulation; changing eclipse imaging requires changing its load model.

### 5.4 Pointing, footprint, jitter, and tracking

Absolute control-error **bound** `e_bus` is not a star-tracker knowledge 1σ. Payload and radio tolerance checks are separate:

```text
payloadPointingOk = e_bus ≤ e_payload
radioPointingOk = true for omni, otherwise e_bus ≤ e_radio
payloadErrorRatio = e_bus / e_payload
radioErrorRatio = 0 for omni, otherwise e_bus / e_radio
sharedErrorRatio = max(payloadErrorRatio, radioErrorRatio)
```

Each ratio ≤1 passes; no upper penalty cap. Equivalent strict tolerance for separate shared-bus modes is `min(e_payload,e_radio)` ignoring omni, **not max**. Radio failure does not blur the camera.

For near-nadir optical/IR only:

```text
nativeGSDm = referenceGSDm × altitudeKm / referenceAltitudeKm
staticOffsetKm = altitudeKm × tan(e_bus × π/180)
swathKm = 2 × altitudeKm × tan(crossTrackFovDeg × π/360)
usableSwathKm = max(0, swathKm − 2 × staticOffsetKm)
thetaJitterRad = exposureJitterArcsec × π/(180 × 3600)
jitterGroundM = altitudeKm × 1000 × tan(thetaJitterRad)
untrackedGroundSpeedMps = 2π × R_E × 1000 / (T_min × 60)
approxTrackingRateDegSec = (untrackedGroundSpeedMps / (altitudeKm × 1000)) × 180/π
motionSmearM = residualImageSpeedMps × exposureSeconds
effectiveScaleM = sqrt(nativeGSDm² + jitterGroundM² + motionSmearM²)
```

Static error displaces footprint; exposure jitter and deterministic image motion degrade sharpness. Quadrature is a **[P] teaching proxy**, not a measured MTF or guaranteed resolving power. Native GSD remains sampling pitch. An arcsec/s jitter rate needs exposure integration; it cannot be substituted for exposure jitter.

Unknown stability/residual speed/profile → UNVERIFIED, not zero. At 500 km, the first-order rate **0.808927°/s** is below the assumed **1.0°/s** profile; it neglects Earth rotation. Real target-ray rates, jitter under tracking, exposure/readout behavior, and integration still need qualified validation. Do not apply optical altitude/swath equations to SAR.

**Planning question — tracking representation:** how will the contract distinguish an accepted [P] tracking profile, unknown profile, and explicit no-tracking diagnostic? Impact: no-tracking must use the untracked speed and fail WF-GSD; unknown must not masquerade as a known failure or zero smear. A rate check alone does not validate residual speed or jitter.

### 5.5 Product generation and downlink

For configured **line** rate r Mbps, unique scheduled contact t minutes/day, payload efficiency η:

```text
D_GB_day = r × 10^6 × (60t) / (8 × 10^9) × η
         = r × t × 0.0075 × η
activeSecondsPerDay = 86400 × 0.08 = 6912
framesPerDay = 6912 × 0.75 = 5184
G_GB_day = 640 × 480 × 1 × (16/8) × 5184 / 10^9 = 3.1850496
deliveredUsefulGBDay = min(G,D) × 0.60
```

Apply efficiency **once**. A future net payload-rate specification uses η=1, not repeated overhead. A pointing/receiver incompatibility gives `LINK_UNCLOSED` and **D=0 in failure simulation**, not nominal capacity. Missing link evidence is UNVERIFIED.

| r Mbps; t min/day | Raw GB/day, η=1 | Payload GB/day, η=0.70 |
|---|---:|---:|
| 1; 1 | 0.0075 | 0.00525 |
| 1; 40 | 0.300 | 0.210 |
| 0.0096; 20 | 0.001440 | 0.001008 |
| 0.012; 20 | 0.001800 | 0.001260 |
| 5; 132 | 4.950 | 3.465 |
| 100; 72 | 54.000 | 37.800 |

All cloudy frames still consume acquisition, power, and downlink; rejection occurs after return. Fixed full frames do not gain pixels with altitude. For a future area-driven product use `pixels=mappedAreaM2/nativeGSDm²` **instead of**, not multiplied by, the frame formula.

### 5.6 Queue, storage, and delivery latency

```text
usableStorageGB = 0.80 × busStorageGB
cycleMin = 1440 / N
gapMin = cycleMin − L
contactCapacityGB = r × L × 0.0075 × η
arrivalsPerCycleGB = G / N
stableQueue = contactCapacityGB ≥ arrivalsPerCycleGB   // equivalently D ≥ G
maxQueueGB = G × gapMin / 1440                         // stable periodic queue only
latencyBoundHours = cycleMin/60 + L/60 + processingHours
backlogGBDay = max(0,G−D)
```

Require **both** D≥G and maxQueue≤usable storage. A finite memory does not cure a sustained deficit. Even if `min(G,D)×0.60 ≥1`, D<G fails this mission's fixed workload. N=0 with G>0 gives D=0, infinite latency, and unstable queue; do not divide by zero. Do not present a finite latency bound as verified when its stable-service assumptions fail.

The latency expression is a conservative bound, not mean contact spacing. Include wrap-around between days. With deficit, `usableStorageGB/backlogGBDay` is only a **fluid net-backlog estimate in days**. A ceiling may be labelled “by approximately day N,” never an exact overflow timestamp; between-contact peaks may overflow earlier. Queue **equal** to storage has lost no bytes; overflow is **>** capacity.

**Planning question — observation versus smoothed arrival:** the audit labels the bound observation→product, but it smooths sunlight-only acquisitions into uniform queue arrivals without defining their timestamp mapping or any pre-queue delay. How should that mapping be represented? Impact: the fixture's stated analytical latency remains reproducible, but exact physical observation ages are not established. Do not quietly label queue-arrival ages as validated observation ages, or change the 6 h requirement/sample bounds.

**Planning question — initialization and data loss:** the equations describe stable periodic operation, not an initial queue/epoch or an overflow drop/overwrite/acquisition-stop policy. How should explanatory output describe startup and lost products? Impact: exact chronological events and partial returned-data displays. No such policy may rescue a failed gate; retain the published steady-state examples and label deficit timing as estimated.

For future arbitrary schedules, enqueue timestamped bytes, service FIFO in each unique compatible window, record peak queue and every observation→delivery+processing delay. Such an extension must not silently replace this fixture with guessed geographic evidence.

## 6. Hard gates, reason codes, and outcome precedence

| Gate | Pass condition | Reason/non-pass |
|---|---|---|
| Input validity | §1 validity and explicit compatible products | `INVALID_INPUT`; see invalid/unknown question |
| Spacecraft allocation | Allocated kg ≤selected **6/12/24 kg** | `CDS_MASS_LIMIT` |
| Launch | Spacecraft+**2 kg** ≤**50 kg**, booked orbit/interface match | `LAUNCH_INCOMPATIBLE`; unknown delivery UNVERIFIED |
| Package fit | Explicit compatibility; array+battery ≤bus allowance | `PAYLOAD_INCOMPATIBLE` / `STRUCTURE_OVERLOAD` |
| Budget | Total incl. reserve/ops ≤**$3M** | `OVER_BUDGET` |
| Schedule | Procurement+integration+queue ≤**36 mo** | `SCHEDULE_INFEASIBLE` |
| Modes | Duties fit allowed windows (§5.2) | `OPERATIONS_CONFLICT` |
| Energy | Generation ≥required at BOL and EOL | `POWER_DEFICIT` / `POWER_DEGRADATION` |
| Eclipse/peak | EOL usable Wh covers eclipse and peak envelope; pack W covers peak W | `ECLIPSE_OUTAGE` / `PEAK_POWER_FAIL` |
| Payload pointing/motion | Absolute error ≤**0.2°**, known stability/residual motion, accepted tracking profile, scale ≤**200 m**, footprint ≥**90 km** | `POINTING_UNSTABLE` / `SCIENCE_REQUIREMENT_UNMET`; missing profile/stability UNVERIFIED |
| Radio/receiver | Accepted closing-link assumption, compatible receiver/rate, angular gate or omni | `LINK_UNCLOSED` |
| Data/storage | D≥G; stable periodic peak queue ≤usable storage | `DATA_BOTTLENECK` / `STORAGE_SATURATED` |
| Thermal capability | Actual **8–12 µm** LWIR coverage | `SCIENCE_REQUIREMENT_UNMET` |
| Science | Every §2 minimum MET, not merely close | `SCIENCE_REQUIREMENT_UNMET` |
| Duration | Planned ≥required and ≤supported/funded | `LIFETIME_SHORT` |

At the budget limit, no headroom remains **beyond the included 15% reserve**. Warn on tight margins but do not manufacture hidden tolerances: 1.01× a hard maximum fails; no 0.9× pass or 1.5× partial-pass band.

Requirement states: **`MET`, `NOT_MET`, `UNVERIFIED`**. Numerical partial progress is not compliance. Evidence and outcome are separate axes:

1. Any **known hard failure → `FAILURE`**, even with unknowns elsewhere. Retain every cause, explanation, and repair.
2. Otherwise, unknown required numerical/capability evidence or absent fixture → **`UNVERIFIED`**; a deferred scenario → **`DEFERRED`**, never success.
3. All hard gates pass on explicit [P] fixtures → **`MODEL_PASS_PROVISIONAL`**, with assumptions and warnings.
4. A source-supported mission-design claim needs real access/link/interface/validation evidence. **No current build qualifies.**

**Planning question — reason-code detail/counting:** Step 2 groups some conditions under paired codes without specifying exact diagnostic subcodes/order, including peak-energy versus peak-W failures and scale versus absolute pointing. How will all failed/unknown checks and the exact requirement-count denominator be represented without duplication? Impact: shared contract, diagnostics, localization, test assertions. Do not add hard gates or let count/ordering change outcome precedence. A combined malformed/deferred request likewise must never become success.

## 7. Diagnostics and repairs

Always report **actual quantity + required limit + evidence → cause → plain-language consequence → specific repair direction**. Rerun all gates after a repair: no change is guaranteed free.

| Reason | Explanation and repair direction |
|---|---|
| `INVALID_INPUT` | Missing/malformed design data prevents valid arithmetic. Correct the named field/unit/ID; do not default unknown performance to zero. |
| `CDS_MASS_LIMIT` | Contingency-inclusive spacecraft exceeds its booked dispenser allocation. Reduce nominal package mass or use a compatible allocation; a larger rocket slot alone does not enlarge a CubeSat bay. |
| `LAUNCH_INCOMPATIBLE` | Purchased slot/interface/orbit is wrong or over capacity. Select a supported booking, including adapter; unknown delivery needs evidence. |
| `PAYLOAD_INCOMPATIBLE` / `STRUCTURE_OVERLOAD` | Package does not fit or array+battery exceeds bus allowance. Choose compatible packages; reassess resulting mass/power/cost. |
| `OVER_BUDGET` | Reserve and funded ground operations exceed budget. Reduce cost while retaining required science and delivery, not by silently dropping ops. |
| `SCHEDULE_INFEASIBLE` | Longest procurement plus integration and queue misses deadline. Reduce lead-time demand using accepted choices; do not erase integration/queue. |
| `OPERATIONS_CONFLICT` | Imaging and TX do not fit allowed mode windows. Use an accepted operational profile; reducing workload is not a free fix to the fixed brief. |
| `POWER_DEFICIT` / `POWER_DEGRADATION` | Repeated BOL or EOL energy deficit. Improve compatible generation or an explicitly approved load plan; a bigger battery alone cannot recharge itself. |
| `ECLIPSE_OUTAGE` | Usable EOL Wh cannot cover shadow load. Increase compatible usable storage/reduce approved shadow load, then recheck mass and recharge. |
| `PEAK_POWER_FAIL` | Pack W or peak-energy envelope insufficient. Select adequate discharge/usable-energy capability; Wh alone is not W. |
| `POINTING_UNSTABLE` | Accepted payload pointing/stability/motion conditions not met. Use a compatible accepted profile; do not confuse static bias with blur or invent tracking performance. |
| `LINK_UNCLOSED` | Radio pointing/receiver/link fails. Restore compatible receiver/pointing/link conditions; simulated science downlink is zero, while native camera sampling is unchanged. |
| `DATA_BOTTLENECK` | Return rate cannot sustain all produced frames. Increase accepted rate or unique contact time; extra memory only delays net backlog. |
| `STORAGE_SATURATED` | Between-contact queue exceeds usable memory. Improve contact cadence or compatible storage, and separately resolve any sustained deficit. |
| `SCIENCE_REQUIREMENT_UNMET` | Name the failed WF requirement: band, scale, footprint, access, useful products, latency, or duration. For slow delivery, improve cadence/processing, not only Mbps. No sharp VNIR image substitutes for LWIR. |
| `LIFETIME_SHORT` | Planned/funded/supported years fail duration. Fund required ops within budget and remain within assumed bus/battery/orbit support; capacity is not service life. |
| UNVERIFIED evidence | Name missing access, tracking, link, or interface evidence. Supply the fixture/profile/evidence; do not pretend an invented value is a repair. |

## 8. Merit and warnings are not feasibility

Compute a success grade **only after all hard numerical gates pass**. For minimum a and stretch b:

```text
higher-is-better p = clamp(log(x/a) / log(b/a), 0, 1)
lower-is-better  p = clamp(log(a/x) / log(a/b), 0, 1)
scienceMerit = 70 + 30 × weightedMean(p)   // among MET science requirements
```

Special-case missing/no stretch and invalid/zero values. Zero stretch credit at every minimum is already compliant, merit **70**, never failure.

Weights [P]: effective scale **.25**, scheduled access gap **.25**, delivered useful products **.20**, latency **.20**, planned duration **.10**. Spectrum and fit are gates; footprint is a gate, **not weighted** despite its listed stretch. No generic affinity/retrieval score.

Report **four separate dimensions**, never blended feasibility: science merit; exact requirement counts with evidence quality; engineering margins (power, mass, battery, data, storage, schedule); budget headroom after reserve. “Success with limitations” is optional educational wording only while keeping `MODEL_PASS_PROVISIONAL` visible.

Warnings are strict **below**: power **15%**, spacecraft mass **10%**, data **10%**, budget **10%**, schedule slack **6 months**. Margins use `(capacity−demand)/capacity`; also show native-unit slack. Expensive or low-stretch but compliant is not a science failure.

**Planning question — display margins:** the audit gives the capacity-margin convention and BOL/EOL checks but does not fully prescribe battery summary selection, minimum BOL/EOL warning display, zero-capacity display, or multiple-warning ordering. Define safe display semantics during planning; do not change gates or the explicit sample data-headroom denominator **D**, not G.

## 9. Timeline semantics and interaction requirements

Mission brief → select parts → inspect **mass, power, budget, data, communications, time** → review gates → run → inspect requirement results/diagnoses → revise/retry.

The deterministic timeline is a **derived explanation of the evaluator result**. It consumes that result; it does not recalculate a competing verdict or roll random success.

- Design/launch failures stop before flight. Failed designs remain inspectable but cannot earn a pass.
- Commissioning explains actual thermal band, pointing, and fixed product plan.
- Eclipse explains demand Wh, usable Wh, and discharge W separately.
- Downlink explains generated versus actual payload GB, scheduled contacts, queue peak, and product-age bounds.
- Deficit saturation timing is labelled an estimate unless timestamped queue evidence supports an exact event.
- Array degradation uses the **first crossing of `arrayWh(y)=arrayRequiredWh`**, not an arbitrary day-30 failure. Equality itself passes.
- Clouds visibly reject products; no invisible feed fills gaps.
- Final report lists required versus achieved values, evidence/provisional assumptions, and a repair for every failure. Green animations never override gates.

**Planning question — design/flight presentation:** Step 2 requires preflight stops but does not enumerate every reason's timeline phase or timestamp. Which failures prevent launch, and which appear as educational counterfactuals? Impact: presentation only; verdict is already fixed by evaluator gates, and estimated failures must not acquire invented exact dates.

Later UI must support **English primary + Ukrainian toggle/parity**, keyboard access, non-colour-only warnings, reduced motion, and a text/skip path. This kickoff produces English source documentation; localization is implementation work. Named save/compare configurations may retain revision/provenance later; they do not expand current gameplay.

## 10. Reproducible conditional passing builds

Shared: `pl-thermal`, `bus-12u`, `orb-sso-low` **500 km**, `lv-heavy`; **1 year**, **36 months**, **$3M**. Assumptions include target/contact schedules, closing link, integration, cost, life, and **tracking/image-motion compensation**. Every result below is **`MODEL_PASS_PROVISIONAL`**, not the original full-region active-fire mission or flight qualification.

| Build | Array | Battery | Radio | Ground | Tradeoff |
|---|---|---|---|---|---|
| **WF-A** | `arr-deploy-l` 55 W | `bat-s` 40 Wh | `rf-s` 5 Mbps | `gs-service` 22×6 min | Modest radio, frequent service |
| **WF-B** | `arr-deploy-l` 55 W | `bat-m` 120 Wh | `rf-x` 100 Mbps | `gs-network` 12×6 min | Faster radio, fewer contacts |
| **WF-C** | `arr-deploy-xl` 135 W | `bat-m` 120 Wh | `rf-s` 5 Mbps | `gs-service` 22×6 min | More power, tight mass |

### 10.1 Complete cost roll-up (illustrative USD [P], launch base [V])

| Item | WF-A | WF-B | WF-C |
|---|---:|---:|---:|
| Bus | 940,000 | 940,000 | 940,000 |
| Camera/adaptation | 450,000 | 450,000 | 450,000 |
| Array | 175,000 | 175,000 | 300,000 |
| Battery | 20,000 | 45,000 | 45,000 |
| Radio | 70,000 | 210,000 | 70,000 |
| Ground setup | 120,000 | 240,000 | 120,000 |
| Launch incl. adapter | 400,000 | 400,000 | 400,000 |
| One-year ground ops | 150,000 | 80,000 | 150,000 |
| Subtotal | 2,325,000 | 2,540,000 | 2,475,000 |
| 15% reserve | 348,750 | 381,000 | 371,250 |
| **Total** | **2,673,750** | **2,921,000** | **2,846,250** |
| **Remaining /headroom** | **326,250 /10.875%** | **79,000 /2.633%** | **153,750 /5.125%** |

### 10.2 Engineering outputs

Common **T=94.616300475 min**, eclipse **35.954194181 min**; camera sunlight only.

| Quantity /inclusive limit | WF-A | WF-B | WF-C |
|---|---:|---:|---:|
| Allocated spacecraft kg /≤24 | 18.9635 | 19.7685 | 23.7705 |
| Mass slack kg | 5.0365 | 4.2315 | **0.2295** |
| Spacecraft mass headroom | 20.985% | 17.631% | **0.956%** |
| Slot kg incl. adapter /≤50 | 20.9635 | 21.7685 | 25.7705 |
| Array+battery kg /≤10 | 1.19 | 1.84 | 5.37 |
| Max contacts/orbit | 2 | 1 | 2 |
| Payload+TX min /sunlit min | 19.5693 /58.6621 | 13.5693 /58.6621 | 19.5693 /58.6621 |
| Worst-orbit average load W | 14.614624 | 14.868280 | 14.614624 |
| Required Wh/orbit incl. charge loss | 24.377998 | 25.576980 | 24.377998 |
| Available BOL Wh/orbit | 45.707558 | 45.707558 | 112.191278 |
| Available year-1 Wh/orbit | 44.793407 | 44.793407 | 109.947453 |
| **EOL power margin** | **45.577%** | **42.900%** | **77.828%** |
| Eclipse demand Wh | 11.984731 | 19.175570 | 11.984731 |
| EOL usable battery Wh | 23.940000 | 76.950000 | 76.950000 |
| Peak W /pack W limit | 40 /60 | 52 /120 | 40 /120 |
| Six-minute peak Wh /usable Wh | 4 /23.94 | 5.2 /76.95 | 4 /76.95 |
| Generated G GB/day | 3.1850496 | 3.1850496 | 3.1850496 |
| Downlink D GB/day | 3.4650000 | 37.8000000 | 3.4650000 |
| D−G GB/day | 0.2799504 | 34.6149504 | 0.2799504 |
| **Data headroom (D−G)/D** | **8.079%** | **91.574%** | **8.079%** |
| Backlog /saturation in fixture | 0 /never | 0 /never | 0 /never |
| Max periodic queue GB /≤102.4 | 0.131504 | 0.252150 | 0.131504 |
| Schedule months /≤36 | 31 | 31 | 31 |
| Duration | 1 yr funded, 3 yr unfunded support | Same | Same |
| **Tightest resource margin** | **Data 8.079%** | **Budget 2.633%** | **Mass 0.956%** |

Here “3 yr support” describes bus/battery/orbit capability before the one-year funding limit; §5.1 supported funded duration is **one year**. All compatibility gates pass only under stated [P] interfaces. A larger launch slot never makes the camera fit 3U/6U.

### 10.3 Science and pointing outputs

| Quantity /limit | WF-A | WF-B | WF-C |
|---|---:|---:|---:|
| Spectrum | LWIR 8–12 µm | Same | Same |
| Native GSD at 500 km | 166.666667 m | Same | Same |
| Exposure jitter displacement | 12.120342 m | Same | Same |
| Residual speed /33 ms smear | 1,000 m/s /33.000000 m | Same | Same |
| Rate reference /assumed support | 0.808927°/s /1.0°/s | Same | Same |
| Effective scale /≤200 m | **170.334026 m** | Same | Same |
| Static offset | 0.436332 km | Same | Same |
| Usable swath /≥90 km | **104.231570 km** | Same | Same |
| Payload error ratio /≤1 | 0.05/0.2 =0.25 | 0.25 | 0.25 |
| Radio error ratio /≤1 | 0.05/2 =0.025 | 0.05/0.5 =0.10 | 0.025 |
| Scheduled access /≤24 h | 24 h [P] | Same | Same |
| Useful products /≥1 GB/day | **1.91102976 GB/day** | Same | Same |
| Latency bound /≤6 h | **2.190909 h** | **3.100000 h** | **2.190909 h** |
| Planned duration /≥1 yr | 1 yr | 1 yr | 1 yr |
| Outcome | `MODEL_PASS_PROVISIONAL` | `MODEL_PASS_PROVISIONAL` | `MODEL_PASS_PROVISIONAL` |

Expected warnings: A **data and schedule**; B **budget and schedule**; C **mass, data, budget, and schedule**. All have five months schedule slack, below six; warnings do not negate the passes.

B's $79,000 additional total-cost tolerance is **$68,695.65 subtotal** before reserve. C's **229.5 g allocated** mass slack allows approximately **199.565 g nominal** added hardware. Do not round either into a comfortable green margin.

### 10.4 All 15 required negative/boundary checks

1. **1 Mbps ×1 min, η=1 →0.0075 GB exactly.** No binary or bit/byte factor elsewhere.
2. **D=G** is rate-stable. D<G beyond permitted round-off is NOT MET, however small the deficit.
3. **Allocated mass=24 kg passes; 24.000001 kg fails.** Adapter is added separately for full slot mass.
4. **Payload error=0.2° passes its angular gate**, but may fail scale/swath; **0.200001° fails**. Better bus error never worsens performance.
5. Omni UHF has no 0° divide-by-zero. With 132 min/day it still fails the stream: **0.012×132×0.0075×0.70 =0.008316 GB/day**.
6. A with `gs-network`: **D=1.890 GB/day <G=3.1850496 →DATA_BOTTLENECK**, even though useful delivery could exceed 1 GB/day.
7. B with `gs-single`: **D=12.6 GB/day**, but **7.1 h latency >6 h**. Faster radio cannot create a missing contact.
8. C with `bat-l`: **(12+3+4.36+2.52+0.30)×1.15 =25.507 kg →CDS_MASS_LIMIT**, despite increased energy.
9. A with 24 W array: EOL **19.546214 Wh/orbit <24.377998 required →POWER_DEFICIT**. Bigger battery alone cannot fix repeated energy deficit.
10. Radio error failure sets delivered science to **zero** in failure simulation; native camera sampling pitch is unchanged.
11. Missing target-access fixture →**UNVERIFIED**, not reciprocal daily coverage or one revisit/day by default.
12. Visible-only, VNIR-only, and no-science payloads **fail thermal capability**, regardless of price/sharpness.
13. All minimum hard thresholds met exactly →compliant; **zero stretch credit cannot make FAILURE**.
14. Known numerical gates can pass while real-world status remains **provisional**. Report both axes.
15. Disable tracking: **7,059.216 m/s ×0.033 s ≈232.954 m** smear, **286.692018 m** effective scale →all examples **fail WF-GSD**. The former jitter-only **167.106794 m** is not a conservative exposure-scale estimate.

## 11. Source register and limitations

The register preserves the audited source's **14 November 2026** verification record, not a claim that every external URL was re-fetched during this documentation phase. Source IDs here match the preserved audit. The absent historical `docs/03-engineering-basis.md` is not the register.

| ID | Primary source and exact adopted/reference fact |
|---|---|
| **S1** | Cal Poly, [CubeSat Design Specification Rev 14.1](https://www.nasa.gov/wp-content/uploads/2018/01/cubesatdesignspecificationrev14_12022-02-09.pdf), §2.2.10 Table 1: typical 3U/6U/12U **6/12/24 kg**, with mission/provider exceptions (§2.2.10.1–2). |
| **S2** | JAXA authors, [Development of the Compact Infrared Camera (CIRC) for Earth observation](https://circgs.tksc.jaxa.jp/documents/2012/83533J.pdf), §4 Table 3: **3 kg, <20 W, 8–12 µm, 640×480, 12°×9°, 33 ms, <200 m@600 km /<130 m@400 km**. Reference camera, not our composite qualification. |
| **S3** | NASA [2026 SoA, 3.0 Power](https://www.nasa.gov/smallsat-institute/sst-soa/power-subsystems/), Table 3-2: **DHV 55 W /67 W/kg; Pumpkin 135 W /31 W/kg**. Table 3-5: **Optimus 119.4 Wh/kg**, current limits; BOL/EOL, peak/average and capacity/power distinctions. |
| **S4** | NASA [2026 SoA, 9.0 Communications](https://www.nasa.gov/smallsat-institute/sst-soa/communications/), §§9.2.4, 9.2.7–8, Tables 9-2/9-3: rate/antenna/pointing/power trades, not complete system link/DC budgets. |
| **S5** | ICEYE [12 Jan 2018 launch release](https://www.iceye.com/newsroom/press-releases/iceye-successfully-launches-worlds-first-sar-microsatellite-and-establishes-finlands-first-commercial-satellite): **70 kg** X1, not 15 kg. [17 Jan first-image release](https://www.iceye.com/newsroom/press-releases/first-iceye-x1-radar-image-from-space-published): **>1.2 GB, ~80×40 km, 10 s, >500 km, 10 m**. No validated 12 kg SAR payload inferred. |
| **S6** | NASA [GNC chapter](https://www.nasa.gov/wp-content/uploads/2025/02/5-soa-gnc-2024.pdf) and [2015 SoA](https://www.nasa.gov/wp-content/uploads/2017/03/small_spacecraft_technology_state_of_the_art_2015_tagged.pdf): control accuracy, knowledge, and stability are distinct. Neither verifies our exposure jitter/tracking allocation. |
| **S7** | NASA [FIRMS FAQ](https://www.earthdata.nasa.gov/data/tools/firms/faq) and [VIIRS fire hotspots](https://firms.modaps.eosdis.nasa.gov/content/descriptions/FIRMS_VIIRS_Firehotspots.html): cloud misses; **375 m fire pixel ≠fire area**, global NRT within **3 h**, not universal 30 min–2 h. Pixel size alone does not determine fire sensitivity. |
| **S8** | KP Labs [Intuition-1](https://www.kplabs.space/projects-and-missions/intuition-1): **465–940 nm VNIR, 192 bands, 3–6 nm resolution, 25 m@600 km**. Not methane SWIR capability. |
| **S9** | Carbon Mapper [Product Guide](https://carbonmapper.org/articles/product-guide) and [L3/L4 ATBD](https://assets.carbonmapper.org/documents/L3_L4%20Algorithm%20Theoretical%20Basis%20Document_021726.pdf): Tanager **30 m, 18.6 km, 5 nm sampling /5.5 nm FWHM**; EMIT **60 m, 75 km, 7.5 nm /~8.5 nm**. Both can quantify with retrieval/wind; no ≤1 nm universal gate. Tanager **90–180 kg/h at 90% PoD** is conditional on **3 m/s wind, 35° solar zenith, 25% albedo, 30 m**. |
| **S10** | SpaceX [Smallsat Rideshare](https://new.spacex.com/rideshare): **$350k including 50 kg to SSO**, **$7k/kg extra**, quarter plate, approximate four-month cadence. Does not verify our integration allowance, queue, or altitude/interface. |
| **S11** | Rocket Lab [Electron payload increase](https://rocketlabcorp.com/updates/rocket-lab-increases-electron-payload-capacity-enabling-interplanetary-missions-and-reusability/): **200 kg to 500 km SSO versus 300 kg to lower orbits**. Audit had **search excerpt only; direct HTTP 403**. No price or new playable capability adopted. |

Process reference: NASA [Design and Develop Science Missions](https://www.nasa.gov/wp-content/uploads/2025/04/250323-design-and-develop-science-mission.pdf), requirements-first systems engineering and explicit verification, **not** our numerical thresholds or merit formula.

Audit research was not wholesale source truth: rejected battery sunlight scaling, unsupported dry-bus masses/housekeeping, rate-to-DC inferences, full-AOI access claims, cloud exemptions, spectral-affinity methane, fictitious SAR scaling, blended partial-pass scores, rocket-capacity slot tables, and unit errors. Examples: 9.6 kbps for 20 min is **1.44 decimal MB raw /1.008 MB at η=.70**; 5 GB in 40 min needs **16.667 Mbps raw /23.810 Mbps at η=.70**. SAR **4 bytes/pixel at 10 m** is **40,000 bytes/km²**, not 4 bytes/m² (which would be **4 MB/km²**).

Every pass-critical [P] field remains provisional: bus mass/load/storage/ADCS/jitter, tracking rate/residual motion, compatibility/thermal/packaging integration, mode timing, digitization/frame rate/duty, acceptance, solar derating/degradation/integrated mass, pack limits/life/efficiency, link closure/efficiency, access/contact fixtures, processing, support/funding, booking/queue/adapter, all non-base-launch costs, contingency, science thresholds, and weights. A similar NASA-listed product never upgrades a composite assumption to [V].

Deferred flood needs a complete supported SAR/host with mass/energy/current/volume budgets, coastal access, products and launch interface; merely raising budget/bus mass is insufficient. The prior **(12+12+0.83+0.36+0.30)×1.15 =29.3135 kg >24 kg** already fails before validating the instrument. Deferred methane needs complete SWIR (~**1.65 or 2.3 µm**) retrieval hardware and condition-specific sensitivity/PoD, wind/uncertainty, scene acceptance, access, host and cost. Candidate research requirements are not capabilities proved by a VNIR catalog. See the preserved audit §9 for the deferred research record; do not turn those targets into active gates.

References attribute facts, not permission to reuse vendor graphics or protected agency insignia; do not imply NASA endorsement.
