# Step 2 — MISSION FORGE: audited game rules

> **Preserved source record; superseded as the implementation entry point by
> [the technical rulebook](game-rules-technical.md).** The audited text below is
> retained unchanged. It remains the gameplay/engineering authority behind that
> reorganization, not a second independently maintained ruleset. Use the
> [workflow](agent-workflow.md) for current phase gates.

**Revision:** 14 November 2026, after reading both worker deliverables and checking pass-critical claims against primary sources.
**Scope:** rules and calculations only. This revision does not change `src/`.
**Authority:** this document supersedes the earlier rule set and conflicting recommendations in both research files.

## 1. Decision and honesty boundary

The original catalogue did **not** establish passing missions. In particular, a 100 m dual-band fire imager, a 12 kg SAR payload, and methane capability inferred from a generic hyperspectral camera were not verified products.

The retained prototype is therefore a **rebalanced wildfire thermal-anomaly training mission**, using a CIRC-like LWIR camera and explicitly synthetic access/contact schedules. Three different complete builds pass its numerical rules in §10.

**These are `MODEL_PASS_PROVISIONAL`, not source-validated flight designs.** Camera reference specifications are sourced; integration, prices, jitter, operating profiles, useful-data fraction, lifetime and access schedules remain provisional. Unknown real-world performance is not silently converted into a verified pass.

| Scenario | Step 2 disposition | Why |
|---|---|---|
| Wildfire training variant | Retained; 3 provisional model passes | Primary JAXA camera specifications support a more modest thermal survey. Synthetic schedules teach resource trades without claiming orbit propagation. |
| Original wildfire brief: every point of 400,000 km² daily, ≤100 m, dual-band active-fire alerts | **REBALANCE_REQUIRED / NOT VERIFIED** | No verified dual-band catalogue item or full-AOI access calculation. The training variant does not claim this original mission succeeds. |
| Coastal flood | **DEFERRED; no passing build established** | Worker SAR mass/power/data claims lack a supported integrated instrument; all-weather is a genuine hard capability requirement. |
| Methane survey/quantification | **DEFERRED; no passing build established** | Catalogue's reference hyperspectral camera is VNIR, not methane-sensitive SWIR; retrieval capability and sensitivity cannot be inferred from GSD or band count. |

This is an explicit scope/balance change, not a claim that NASA requires the new thresholds. Flood and methane must not appear as playable, solvable scenarios until they have their own fully costed passing build.

### Provenance notation

- **[V] Verified reference:** the linked primary source states that specific value. It does not certify our composite spacecraft.
- **[D] Derived:** arithmetic/geometry shown here, conditional on stated inputs.
- **[P] PROVISIONAL:** game-design assumption, synthetic fixture, estimate, unsupported value, or a composite not specified by a source.
- **UNVERIFIED:** a required capability is unknown. It is neither MET nor a flight-feasibility pass.

Provenance belongs to **individual fields**, not whole rows or documents. A product with verified mass but estimated price must show both. NASA's SoA itself cautions that manufacturer performance listings are not independently verified by NASA.

## 2. Audit of what the workers actually delivered

Read in full: `docs/research/engineering-values.md` (292 lines) and `docs/research/scenario-requirements.md` (761 lines). They contain useful references, but are **research drafts**, not ready-to-copy engineering truth.

| Worker claim / previous rule | Audit result and final decision |
|---|---|
| 3U/6U/12U have 6/12/24 kg total mass limits | **[V] with qualification.** CDS Rev 14.1 §2.2.10 Table 1 says *typical maximum* and explicitly allows mission-specific dispenser/provider evaluation (§2.2.10.1–2). Our standard-deployer game uses these as hard booked limits; they are not a universal legal definition of CubeSat. [S1] |
| 6U 12 kg and 12U 26 kg are dry buses | Reject: these consume/exceed the standard-deployer total allocations before payloads. Replacement bus masses are composite **[P]**, not vendor specifications. |
| Body-array watts validate bus housekeeping watts | Reject: generation and consumption are different quantities. The worker's engineering table rows 20/22/60/61 compare unlike quantities. New housekeeping loads are **[P]**, not “corrected NASA measurements.” |
| CIRC supports our 2 kg, 100 m, two-band fire camera | Reject. JAXA specifies **3 kg, <20 W, 8–12 µm, 640×480, 12°×9°, 33 ms exposure, <200 m at 600 km / <130 m at 400 km**. It is LWIR, not a 4 µm + 11 µm contextual detector. [S2] |
| Solar arrays 55 W / 135 W | **[V] ratings**, not orbit-average supply. NASA SoA Table 3-2 lists DHV 55 W at 67 W/kg and Pumpkin 135 W at 31 W/kg. Derived bare masses ≈0.821 / 4.355 kg. Our allocations 0.83 / 4.36 kg are **[D/P]** and still need integration validation. [S3] |
| Any array outside 30–76 W/kg is unrealistic | Reject: the same NASA table contains products outside this range. No universal catalogue rejection rule based on that envelope. |
| Batteries all need a 2–3× mass reduction | Not a universal rule. NASA lists widely differing specific energies and current limits. Our 40 Wh/0.36 kg and 120 Wh/1.01 kg allocations are **[P]**, consistent with roughly 119 Wh/kg reference packs, but not complete validated products. [S3] |
| Stored battery energy should be multiplied by sunlight fraction | Reject. Sunlight constrains **recharge**, not stored capacity. DoD, capacity retention and discharge efficiency reduce usable battery Wh. |
| S/X radio rates prove the same mass, DC power and link performance | Reject that inference. NASA lists suitable rate classes; RF output watts are not DC consumption. 5/100 Mbps are adopted **[P] system rates**, with explicit **[P] DC power, antenna/error budget and 0.70 payload efficiency**. No full RF link budget was delivered. [S4] |
| ICEYE began with a 15 kg SAR CubeSat | **False.** ICEYE's own launch release says ICEYE-X1 was **70 kg**. Its first-image release describes a >1.2 GB raw 80×40 km image acquired in 10 s at >500 km, 10×10 m resolution. No basis for claiming a proven 12 kg SAR payload from this. [S5] |
| SAR 4 bytes/m² at 10 m equals 40 kB/km² | Unit error: **4 bytes/pixel** at 10 m gives 0.04 bytes/m² = 40,000 bytes/km². 4 bytes/m² would be 4 MB/km². The worker's power-limited “~4–8 GB/day” ceiling is not validated; reject it as a hard limit. |
| UHF 9.6 kbps and 20 min/day returns ~14 MB/day | Incorrect by ~10×. It returns **1.44 decimal MB/day raw**, or 1.008 MB at η=0.70. At 12.288 kbps: 1.8432 MB raw. |
| 5 GB in 40 contact-min/day needs ~110 Mbps | Incorrect. It needs **16.667 Mbps raw / 23.810 Mbps at η=0.70**. Final conversion is §5.4. |
| 1 GB is a binary GiB / ambiguous “Mb” | Reject ambiguity: decimal SI only; Mbps means megabits/s, GB means 10⁹ bytes. |
| `max(payloadErrorLimit, antennaErrorLimit) / busError` is a pointing penalty | Wrong direction and wrong aggregation. A larger allowable error is easier, not harder. Payload and antenna have separate checks; `min` is the shared strict limit if the bus supports both in separate modes. See §5.3. |
| Poor absolute pointing necessarily blurs images | False: static error moves the footprint; time-varying jitter/smear degrades image sharpness. NASA explicitly distinguishes pointing control, knowledge and stability. [S6] Camera exposure also integrates deterministic ground-track motion: the initial recalculation omitted this and has been corrected below. |
| Reciprocal of daily imaged-area fraction is revisit | Reject. Imaging capacity does not prove access to the same point. Workers delivered no reproducible propagated AOI coverage or contact schedule; their “our simulation” claims are **unverified**, not evidence. |
| Cloud cover 15%→40% / 30%→25% is a factual correction | These are **[P] scenario choices**, not measured regional corrections without a defined AOI, season and data product. Do not inherit a global land mean as a site measurement. |
| Wildfire can ignore clouds / geostationary products fill our gaps | Reject. NASA FIRMS warns of cloud-caused missed detections. External observations are not free onboard science. No cloud exemption or uncosted data-fusion credit. [S7] |
| A small fire cannot be detected inside a 1 km pixel | False. Subpixel fire detection depends on radiance contrast, temperature, atmosphere and algorithm. Pixel size alone cannot produce fire-size sensitivity or false-alarm rate. [S7] |
| Intuition-1 validates a methane payload | Reject. Manufacturer specifies **465–940 nm**, 192 bands, 3–6 nm spectral resolution, 25 m GSD at **600 km** reference orbit. No 1.65/2.3 µm methane bands. Its values cannot be copied to a hypothetical SWIR payload. [S8] |
| Methane quantification requires ≤1 nm sampling; ≥5 nm only detects | **False.** Carbon Mapper's primary product guide and ATBD quantify emission rates with Tanager **5 nm sampling / 5.5 nm FWHM**, and EMIT **7.5 nm sampling / ~8.5 nm FWHM**. Sampling, resolution and retrieval capability are distinct. Remove this proposed hard gate. [S9] |
| EMIT is 170 km swath / 30 m GSD | Incorrect. Carbon Mapper ATBD gives **75 km / 60 m**. Tanager nadir is **18.6 km / 30 m**, not 170 km either. [S9] |
| Data returned ≥8 GB/day follows from a generic methane science requirement | **[P]**, not a NASA requirement. The worker also conflates weekly whole-AOI surveys with “covered twice over two years.” Data volume must come from a defined acquisition/product plan. |
| A min/stretch score of zero at every minimum still produces ≥70 success | Inconsistent. Passing all requirements must not become failure because all stretch scores are zero. Final scoring in §7 separates compliance from stretch merit. |
| $400k launch buys 1,000/800/500 kg to orbit classes | Reject. SpaceX advertises **$350k including 50 kg to SSO**, extra mass $7k/kg, with named plate options. We book a 50 kg slot; adapter/integration $50k is **[P]**. Full-rocket capacity is not our purchased capacity. [S10] |
| Electron $9M / 300 kg to SSO, queue months, drag lifetime | Rocket Lab's primary performance announcement distinguishes **200 kg to 500 km SSO** from **300 kg to lower orbits** [S11]. $9M pricing and queues remain **[P]**, and this option stays disabled. Mission design life is not atmospheric-decay time. |

The workers' instrument-mirror tables also contain unverified spacecraft masses, Sentinel-3 altitude errors and inconsistent swaths. Do not ship those tables wholesale. `docs/03-engineering-basis.md` was referenced in the old rules but does not exist; §11 below is the actual source register.

## 3. The retained mission, requirements and changes

### Wildfire training: “Return the heat map”

**Need:** a land-management science team wants scheduled LWIR thermal-anomaly imagery and data products for follow-up, while learning why the spacecraft, ground system and launch booking must be designed together.

**Not promised:** validated operational active-fire detections, fire radiative power, fire-size sensitivity, false-alarm performance, cloud penetration, or emergency coverage of an entire region every day.

The regional context remains **400,000 km² [P]**, but the task is a **pre-scheduled target campaign**: nominal daylit target opportunities every 24 h, each requiring a 90 km-wide footprint. This synthetic access fixture is an input to the training puzzle, not a prediction from altitude. It does not certify geographic coverage; a later geographically realistic scenario needs AOI coordinates and propagated access windows.

| ID | Hard requirement for a model pass | Minimum (inclusive) | Stretch | Verification/evidence |
|---|---|---|---|---|
| WF-SPECTRUM | Thermal measurement capability | LWIR coverage includes 8–12 µm | None | Reference instrument inspection [V]; composite integration [P] |
| WF-GSD | Conservative effective spatial scale, not a radiometric detection threshold | ≤200 m | ≤150 m | §5.3 [D], stability input [P] |
| WF-FOOTPRINT | Usable footprint spans tasked strip | ≥90 km | ≥100 km | FOV and bias geometry [D/P] |
| WF-ACCESS | Maximum gap between **scheduled geometric** target opportunities | ≤24 h | ≤12 h | Synthetic fixture [P]; unknown without a fixture is UNVERIFIED |
| WF-DELIVERY | Delivered usable products, after cloud rejection | ≥1.0 GB/day equivalent over campaign | ≥2.0 GB/day | Frames → raw data → delivery × useful fraction [D/P] |
| WF-LATENCY | Worst-case observation-product delivery bound in the fixture | ≤6 h | ≤2 h | Contact gap + service bound + processing, §5.5 [D/P] |
| WF-DURATION | Planned operations | ≥1 year | ≥3 years | Funded duration plus assumed bus/battery/orbit life [P] |

**All** engineering gates in §6 are also hard. Byte count is an explicit educational product-plan proxy, not a universal measure of scientific value; no credit for sending duplicate/padded data. The fixed frame plan includes contextual/calibration imagery. The useful-data fraction represents accepted thermal scenes, not confirmed fires.

### Changes from the earlier brief — deliberate, visible rebalancing

1. Wildfire budget **$1.6M → $3.0M [P]**, including 15% reserve and a year of ground operations. No real mission cost is asserted.
2. GSD **100 m → 200 m**, consistent with JAXA CIRC reference performance. The earlier 100 m dual-band hardware is removed, not relabelled as proven.
3. Remove the mandatory two-band contextual active-fire algorithm from this **LWIR anomaly** mission. It remains necessary to establish a suitable validated algorithm if the original active-fire scenario returns.
4. Replace “every point of the whole AOI daily” with supplied target-access fixtures. The original full-region mission stays **NOT VERIFIED**.
5. Keep cloud losses: 40% discarded scenes [P] in the training fixture. Do not promise a clear-sky revisit of 24 h.

These changes make a defensible educational prototype possible, rather than purchasing performance with arbitrary science-affinity scores. All three passes below must display the provisional badge in a future UI.

## 4. Frozen catalogue for this calculation

IDs retained where possible; values here supersede the earlier catalogue. All money, lead times, system integration allowances, duty profiles and non-reference pointing fields are **[P]**. No live vendor quotation is implied.

### 4.1 Space segment

Bus dry allocation includes structure, OBC, EPS electronics, ADCS, thermal hardware and harness, but **excludes** the selected science camera, battery, solar array and science downlink package. There is no double-counting of a second ADCS or a second structure mass.

| Bus | Dry kg [P] | Housekeeping DC W [P] | Storage GB [P] | Control-error bound ° [P] | Jitter over exposure, arcsec [P] | Max array+battery kg [P] | Cost [P] | Lead months [P] |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `bus-3u` | 3.0 | 3 | 8 | 2.0 | 100 | 1.5 | $180,000 | 8 |
| `bus-6u` | 6.5 | 6 | 32 | 0.5 | 20 | 4.5 | $430,000 | 12 |
| `bus-12u` | 12.0 | 12 | 128 | 0.05 | 5 | 10.0 | $940,000 | 18 |

The hypothetical bus tiers are **not** vendor performance packages. Their design/battery service-life assumptions are 3 years [P]. Standard booked spacecraft mass allocations are 6/12/24 kg respectively [V reference, P booked policy]. Only `bus-12u` accepts the retained camera package: its 110×180×230 mm reference housing does not fit our smaller payload bays. Package fit, deployed/stowed hardware and thermal interfaces remain integration assumptions; changing this compatibility requires a real interface drawing.

**Pass-critical tracking allocation [P]:** the retained `bus-12u` is assumed to support 1.0°/s ground-target tracking while preserving the allocated error/jitter bounds. The camera/bus adaptation is assumed to leave **≤1,000 m/s residual apparent ground motion during exposure**. Neither specification is verified for this composite spacecraft or for CIRC. These are explicit additional conditions of the model passes, included in the existing illustrative adaptation cost—not free capabilities inferred from a star tracker. Remove the tracking assumption and all three examples fail the effective-scale gate. Other bus tiers have no accepted tracking profile.

| Array | Peak BOL W | Allocated kg | Annual loss [P] | Cost [P] | Lead mo [P] | Compatible buses |
|---|---:|---:|---:|---:|---:|---|
| `arr-body` | 8 [P; reference class] | 0.15 [P] | 1% | $30,000 | 5 | 3U, 6U, 12U |
| `arr-deploy-m` | 24 [P; reference class] | 0.45 [P] | 2% | $85,000 | 8 | 3U, 6U, 12U |
| `arr-deploy-l` | 55 [V rating] | 0.83 [D/P] | 2% | $175,000 | 10 | 6U, 12U |
| `arr-deploy-xl` | 135 [V rating] | 4.36 [D/P] | 2% | $300,000 | 12 | 12U only |

The body-array value is a **total training-system rating**, not a value per U or per panel multiplied automatically by bus size. Mass includes a declared package allocation; all-in integration mass still needs checking. Geometry/incidence and EPS derating η_solar=0.85 [P] applies to every selected rating.

| Battery | Nominal Wh [P] | Allocated kg [P] | Max allowed DoD [P] | DC continuous/discharge limit W [P] | Cost [P] | Lead mo [P] |
|---|---:|---:|---:|---:|---:|---:|
| `bat-s` | 40 | 0.36 | 0.70 | 60 | $20,000 | 5 |
| `bat-m` | 120 | 1.01 | 0.75 | 120 | $45,000 | 7 |
| `bat-l` | 300 | 2.52 | 0.80 | 200 | $85,000 | 9 |

Battery capacity retention at year y: `0.95^y` [P]. Discharge efficiency 0.90 [P]; charge/discharge round-trip efficiency 0.90 [P] is used separately in array-energy sizing, not twice on the same path. These are educational lumped losses, not qualified pack tests or a cell ageing model.

| Radio package | Configured line Mbps [P] | Mass incl. antenna kg [P] | Transmitting DC W [P] | Allowed antenna pointing error ° [P] | Cost [P] | Lead mo [P] |
|---|---:|---:|---:|---:|---:|---:|
| `rf-uhf` | 0.012 | 0.10 | 2 | Omni: no angular gate | $18,000 | 5 |
| `rf-s` | 5 | 0.30 | 8 | 2.0 | $70,000 | 8 |
| `rf-x` | 100 | 0.35 | 20 | 0.5 | $210,000 | 12 |

S/X packages include the game antenna allocation and agreed ground receiver. Higher rate is **not** automatically available from frequency alone. The quoted rates assume an otherwise closing RF link; absent that explicit fixture assumption, a real link budget is UNVERIFIED. RF output power, amplifier efficiency, DC load and payload throughput are different fields.

| Retained camera: `pl-thermal` | Value | Evidence |
|---|---|---|
| Mission role / instrument class | CIRC-like uncooled LWIR thermal-anomaly imager; not CIRC flight hardware reuse | Role from JAXA [V]; adaptation [P] |
| Mass | 3 kg | CIRC reference [V], integration allocation [P] |
| Active/peak DC load | 20 W upper-bound allocation; idle incremental load 0 | CIRC <20 W [V]; switched duty and zero-idle simplification [P] |
| Spectrum | One broad 8–12 µm band | [V] |
| Detector / digitization | 640×480; game products 16 bits/pixel | Detector [V]; product depth [P] |
| GSD upper-bound reference | 200 m at 600 km | Conservative use of JAXA <200 m [V/D] |
| FOV | 12° cross-track × 9° along-track | [V] |
| Exposure | 33 ms | [V] |
| Residual ground-image motion during exposure | ≤1,000 m/s, requiring tracking/adaptation | **[P], not a CIRC reference specification** |
| Allowed absolute payload pointing error | 0.2° | [P], not inferred from detector GSD |
| Acquisition rate / duty | 0.75 full frames/s while active; 8% of time, sunlight only | [P], not CIRC flight readout/tasking performance |
| Cost / lead | $450,000 / 12 months | [P], includes adaptation and product-processing allowance |

No data-rate compression or free onboard fire classifier is assumed. The camera does not automatically provide methane or radar products. `pl-none`, visible-only and VNIR options are useful **failing** teaching choices, not alternate passes through the thermal-capability gate.

### 4.2 Orbit, ground and launch fixtures

Retained pass examples use `orb-sso-low`: **500 km circular orbit**, inclination **97.4° [P approximation]**; T calculated below; eclipse fraction conservatively **0.38 [D/P]**, close to the β=0 maximum. These are not sufficient elements to propagate a ground track.

Assumed orbital residence supports 5 years [P]; do **not** call that vendor bus design life, a promised drag lifetime, or a disposal analysis. Bus/battery service life 3 years [P] is the tighter duration input. Mission-model max supported duration is their minimum, 3 years. Orbit-design cost is included in bus development, not another unpriced charge.

`orb-vleo` 400 km, `orb-leo` 550 km, `orb-sso` 600 km and `orb-sso-high` 720 km remain conceptual alternatives but have **no validated target-access fixture**: science revisit is UNVERIFIED until one is supplied. GEO is outside this catalogue, not “impossible for all CubeSats.”

| Ground choice | Non-overlapping contacts/day N [P] | Usable length L each [P] | Payload efficiency η_link [P] | Processing hours [P] | Setup [P] | Annual ops [P] | Lead mo [P] |
|---|---:|---:|---:|---:|---:|---:|---:|
| `gs-single` | 4 | 6 min | 0.70 | 1 | $70,000 | $25,000 | 6 |
| `gs-network` | 12 | 6 min | 0.70 | 1 | $240,000 | $80,000 | 10 |
| `gs-service` | 22 | 6 min | 0.70 | 1 | $120,000 | $150,000 | 2 |

For this training calculation, contacts start **evenly spaced** over a 24 h cycle; the same cycle repeats across day boundaries. Parallel stations do not multiply data rate: overlapping contacts must be unioned. The camera's product stream is smoothed to uniform arrivals after the fixed acquisition plan; this is a **fluid-queue approximation [P]**. Real burst products, station booking conflicts, rain fade and longitude-dependent gaps require actual timestamped events.

**Synthetic target-access fixture [P]:** supplied daylit 90 km target-strip opportunities with maximum gap 24 h, plus sufficient contextual imaging to support the fixed acquisition workload. This is deliberately separate from the ground-contact fixture. A camera may have contact without observing the target and vice versa. No full-400,000-km² coverage credit is awarded.

| Launch choice | Booked capability | Cost | Queue / adapter assumptions |
|---|---|---|---|
| `lv-heavy` (rename in UI: **50 kg SSO rideshare slot**) | 50 kg including selected spacecraft and 2 kg allocated adapter/dispenser [P] | $350,000 base [V] + $50,000 adapter/integration [P] = **$400,000** | 9 months [P]; standard ≤12U deployer interface [P], 500 km delivery assumed [P], no free orbit change |
| `lv-rideshare-s` | Historical small aggregator slot; unverified provider/interface | $150,000 [P] | Disabled for passing examples until actual slot specification exists |
| `lv-dedicated` | Dedicated launcher option not validated here | $9,000,000 [P] | Disabled; no invented 300 kg-to-SSO table |

Public launch cadence “approximately every four months” is not a nine-month booking guarantee. No rocket-level kg capacity is used for a rideshare customer's slot.

## 5. Final equations

### 5.1 Units, mass and time

Use decimal SI: kg, W, Wh, seconds/minutes/hours, Mbps = 10⁶ bits/s, GB = 10⁹ bytes. Geometry input angles are degrees; convert to radians before trig. One game year = 365 days; 12 months = one year.

```
spacecraftNominalKg = busDry + payload + array + battery + radio
spacecraftAllocatedKg = spacecraftNominalKg × 1.15
slotAllocatedKg = spacecraftAllocatedKg + 2.0
massMargin = (bookedSpacecraftLimitKg − spacecraftAllocatedKg) / bookedSpacecraftLimitKg

buildMonths = max(selected component lead months)  // parallel procurement
scheduleMonths = buildMonths + 4 integration months + 9 launch-queue months
totalUsd = (bus + payload + array + battery + radio + groundSetup
            + 400000 launch + groundAnnualOps × missionYears) × 1.15
```

Both 15% factors are **our allocated mass contingency and budget reserve [P]**, not an asserted NASA universal minimum. Dry structure is already in the bus; contingency is not a second measured structure. Adapter mass is not part of the CubeSat dispenser's spacecraft mass.

### 5.2 Power, eclipse energy and peak discharge

```
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

No arbitrary minimum TX duty. Validate `obsDuty` and `txDutyWorstOrbit` in [0,1]; the payload's sunlight-only operation and non-overlapping imaging/body-antenna modes require `obsDuty*T_min + maxContactsPerOrbit*L ≤ T_min*(1−eclipseFraction)` for this conservative fixture. Ground windows and activity placement are assumed available, not derived from these durations.

```
arrayWh(y) = arrayBOLW × 0.85 × (1 − annualArrayLoss)^y × sunHours
loadWh = loadAvgWorstOrbitW × T_min / 60

// Payload OFF in eclipse. Assume radio ON throughout eclipse as a conservative upper bound.
eclipseDemandWh = (busHousekeepingW + radioDcW) × eclipseHours
arrayRequiredWh = loadWh + eclipseDemandWh × (1/0.90 − 1)
powerMargin(y) = (arrayWh(y) − arrayRequiredWh) / arrayWh(y)

usableBatteryWh(y) = nominalWh × allowedDoD × 0.95^y × 0.90
conservativePeakW = busHousekeepingW + payloadPeakW + radioDcW
```

The charging-loss term is conservatively sized to the eclipse bound; it is not a second full load term. Evaluate at BOL **and EOL**. Require generated Wh ≥ required Wh, battery usable Wh ≥ eclipse demand, and battery output limit W ≥ conservative peak W. Wh alone never proves instantaneous W capability. An additional peak-energy check uses `conservativePeakW × min(0.1, sunHours)` Wh ≤ usable battery Wh (6 min peak envelope [P]).

This is a constrained scheduled-mode model, not an electrochemical or full time-resolved state-of-charge simulation. Changing operations to image in eclipse must change eclipse demand, not just the narrative.

### 5.3 Pointing: accuracy, jitter, footprint and antenna are separate

Let `e_bus` be the allocated absolute control-error **bound**, not an unrelated 1σ star-tracker knowledge specification. Payload tolerance is `e_payload`; antenna tolerance is `e_radio`.

```
payloadPointingOk = e_bus ≤ e_payload
radioPointingOk = true for omni, otherwise e_bus ≤ e_radio

payloadErrorRatio = e_bus / e_payload
radioErrorRatio = 0 for omni, otherwise e_bus / e_radio
sharedErrorRatio = max(payloadErrorRatio, radioErrorRatio)
// Each ratio ≤1 passes; >1 fails. There is NO artificial upper penalty cap.
```

If the same bus serves both in separate modes, the equivalent allowable error is `min(e_payload, e_radio)` (ignore omni), not `max`. A bad radio beam must not degrade the camera's GSD; it fails/reduces the link instead. Payload/body-antenna slews are scheduled separately.

For near-nadir optical/IR imaging only:

```
nativeGSDm = referenceGSDm × altitudeKm / referenceAltitudeKm
staticOffsetKm = altitudeKm × tan(e_bus × π/180)
swathKm = 2 × altitudeKm × tan(crossTrackFovDeg × π/360)
usableSwathKm = max(0, swathKm − 2 × staticOffsetKm)

thetaJitterRad = exposureJitterArcsec × π/(180 × 3600)
jitterGroundM = altitudeKm × 1000 × tan(thetaJitterRad)

// First-order near-nadir reference; neglect Earth rotation for this diagnostic only.
untrackedGroundSpeedMps = 2π × R_E × 1000 / (T_min × 60)
approxTrackingRateDegSec = (untrackedGroundSpeedMps / (altitudeKm × 1000)) × 180/π
// Accepted fixture has explicit residualImageSpeedMps after tracking.
motionSmearM = residualImageSpeedMps × exposureSeconds
effectiveScaleM = sqrt(nativeGSDm² + jitterGroundM² + motionSmearM²)
```

Quadrature here is a **[P] conservative teaching proxy**, not a measured modulation-transfer function or guaranteed image resolution. `nativeGSDm` remains the sampling pitch; do not rename it true resolving power. Jitter must describe motion **during an exposure**; a rate in arcsec/s cannot be substituted without exposure-time integration. Unknown stability or residual image speed makes effective-scale verification UNVERIFIED, not zero. The assumed 5 arcsec jitter and ≤1,000 m/s residual image motion in the sample builds are **[P]**, not extracted from an absolute accuracy figure.

At 500 km, untracked speed is approximately **7,059.216 m/s** and a 33 ms exposure smears approximately **232.954 m**; the proxy effective scale is **286.692 m**, which **fails** the 200 m limit. Under the explicit tracking assumption, residual smear is **33.000 m**, giving **170.334 m**, which passes. Approximate required tracking rate is **0.808927°/s**, below the assumed 1.0°/s profile. A real implementation must validate target-ray rates, Earth rotation, jitter under commanded tracking and exposure/readout behaviour with a qualified profile; this first-order calculation is not that validation.

Do not apply optical altitude/swath equations to SAR resolution; SAR needs its own bandwidth, aperture, incidence and processing-mode model.

### 5.4 Final downlink conversion and data production

For configured **line** rate r Mbps, non-overlapping scheduled contact time t minutes/day and payload efficiency η:

```
D_GB_day = r × 10^6 × (60t) / (8 × 10^9) × η
         = r × t × 0.0075 × η
```

Efficiency is dimensionless and applied **once**. If a future specification gives net payload rate, use η=1 for that rate (do not remove coding overhead twice). If pointing or receiver compatibility fails, do not retain nominal D: the link is NOT MET, and failure simulation uses D=0.

| Sanity check | Raw GB/day (η=1) | Payload GB/day (η=0.70) |
|---|---:|---:|
| 1 Mbps, 1 min | 0.0075 | 0.00525 |
| 1 Mbps, 40 min | 0.300 | 0.210 |
| 0.0096 Mbps, 20 min | 0.001440 | 0.001008 |
| 0.012 Mbps, 20 min | 0.001800 | 0.001260 |
| 5 Mbps, 132 min | 4.950 | 3.465 |
| 100 Mbps, 72 min | 54.000 | 37.800 |

For the retained fixed-frame plan:

```
activeSecondsPerDay = 86400 × 0.08 = 6912
framesPerDay = activeSecondsPerDay × 0.75 = 5184
G_GB_day = 640 × 480 × 1 band × (16/8) bytes × 5184 / 10^9
         = 3.1850496 GB/day
```

This is uncompressed image-product volume, no padded bytes. A fixed full-frame acquisition count does not generate more pixels merely by changing altitude: the imaged ground area changes. For area-driven mapping instead, use `pixels = mappedAreaM2 / nativeGSDm²`, **not both formulas multiplied together**.

All cloudy scenes still consume acquisition, power and downlink in this simple architecture. No free onboard cloud screening/compression. Delivered useful data in the stable queue is `min(G,D) × acceptedFraction`, where acceptedFraction=0.60 [P] in this fixture. It cannot exceed acquired or returned data.

### 5.5 Queues, saturation and latency

Storage usable for science = `0.80 × busStorageGB` [P]. No finite storage makes a daily rate deficit disappear.

For the fixture's uniform arrivals and evenly spaced contacts:

```
cycleMin = 1440 / N
gapMin = cycleMin − L
contactCapacityGB = r × L × 0.0075 × η
arrivalsPerCycleGB = G / N

stableQueue = contactCapacityGB ≥ arrivalsPerCycleGB   // equivalent to D ≥ G here
maxQueueGB = G × gapMin / 1440                         // stable periodic queue
latencyBoundHours = cycleMin/60 + L/60 + processingHours
```

The latency expression is deliberately an upper bound, not mean contact spacing dressed up as a guarantee. Require `maxQueueGB ≤ usableStorageGB`, too: D≥G alone does not rule out inter-pass overflow. For N=0 and G>0, capacity is 0, latency infinite, stableQueue=false.

For arbitrary future schedules, run a timestamped queue: enqueue generated product bytes, service them FIFO during each unique compatible contact, track maximum queue and each product's arrival→delivery+processing delay. Worst gap includes day/period wrap-around.

`backlogGBDay=max(0,G−D)`. With a deficit, `usableStorageGB/backlogGBDay` is only a **fluid net-backlog estimate in days**, not the exact timestamp of first overflow. `ceil(...)` may be shown as “by approximately day N” but must not drive an exact chronological failure event; inter-contact peaks can overflow sooner. At exact capacity no data has yet been lost; overflow means queued bytes **>** capacity. An absent contact cannot be fixed by assigning an arbitrary 3/8/24 h latency label.

### 5.6 Science access, clouds and lifetime

- A supplied/propagated target-access table determines revisit; area imaged per day does **not**.
- Missing coordinates/access results yield **UNVERIFIED**. Synthetic fixture passes must say synthetic.
- Acquisition revisit, cloud-free revisit, observation→delivery latency and event→detection delay are different metrics.
- The 0.60 useful fraction is an expected campaign-equivalent fixture assumption, not a guarantee on every cloudy day or a proof of false-alarm performance.
- Supported duration is `min(assumedBusLife, assumedBatteryLife, assumedOrbitalResidence, fundedOperationsYears)`. Do not infer battery life from Wh, or drag lifetime from mission design life.
- No deterministic “deorbit on exactly day X” is claimed from a guessed orbital lifetime.

## 6. Hard pass/fail boundaries — no hidden tolerance bands

Compute using full precision; round **only for display**. Equality at the stated limit passes. Machine round-off tolerance is at most `1e-9 × max(1,abs(limit))` in that quantity's unit, not an engineering waiver.

| Check | Pass iff | Failure / non-pass state |
|---|---|---|
| Input validity | All required fields present, units/provenance known; physical masses/capacities positive, loads nonnegative, efficiencies in (0,1], duties in [0,1], compatible products | `INVALID_INPUT`; never let NaN/undefined comparisons pass |
| Standard-deployer spacecraft allocation | Allocated spacecraft kg ≤6/12/24 kg for selected booked bus | `CDS_MASS_LIMIT` (game booked policy, provider exceptions not assumed) |
| Launch slot/interface | Spacecraft+2 kg adapter ≤50 kg; requested orbit and interface in selected booking fixture | `LAUNCH_INCOMPATIBLE`; unknown orbit delivery = UNVERIFIED |
| Payload/package/array fit | Selected packages on explicit bus compatibility list; array+battery allocation ≤bus allowance | `STRUCTURE_OVERLOAD` / `PAYLOAD_INCOMPATIBLE` |
| Cost including reserve/ops | Total ≤scenario budget | `OVER_BUDGET`; equality leaves zero reserve beyond included 15% |
| Schedule | Total procurement/integration/queue ≤available months | `SCHEDULE_INFEASIBLE` |
| Mode time | All planned duties fit allowed windows as specified in §5.2 | `OPERATIONS_CONFLICT` |
| Power at BOL and EOL | Array Wh ≥required Wh at both | `POWER_DEFICIT` / `POWER_DEGRADATION` |
| Eclipse / peak | Usable EOL Wh ≥eclipse demand **and** peak-energy envelope; pack discharge W ≥peak W | `ECLIPSE_OUTAGE` / `PEAK_POWER_FAIL` |
| Payload pointing and motion | e_bus ≤e_payload, known exposure stability/residual image motion, accepted tracking-rate profile, effective scale ≤science limit, useful footprint ≥task width | `POINTING_UNSTABLE` / `SCIENCE_REQUIREMENT_UNMET`; missing stability/tracking profile = UNVERIFIED |
| Radio pointing and receiver | Compatible band/rate receiver, accepted link assumption, e_bus ≤e_radio or omni | `LINK_UNCLOSED`; NOT a camera-blur multiplier |
| Data stability / storage | D≥G and inter-contact queue peak ≤usable storage | `DATA_BOTTLENECK` / `STORAGE_SATURATED` |
| Science capability | Required thermal band actually present; no generic affinity substitution | `SCIENCE_REQUIREMENT_UNMET` |
| Scientific thresholds | Every hard `shall` inequality in §3 is MET at its minimum | `SCIENCE_REQUIREMENT_UNMET`; 1.01× a maximum fails |
| Lifetime | Planned duration ≥required duration and ≤supported/funded duration | `LIFETIME_SHORT` |

For this retained fixed-workload mission, D<G is a hard failure even if enough storage could hold the net backlog for a year: sustained return of the required product stream is part of the brief. Finite campaigns that explicitly permit delayed end-of-mission delivery need a different requirement, not an exception hidden in the engine.

**Requirement statuses:** `MET`, `NOT_MET`, `UNVERIFIED`. Partial progress may be shown numerically, but it does not satisfy a hard requirement. There is no 0.9× pass allowance or 1.5× “partial pass” for a hard maximum.

**Evidence and outcome are separate axes:**

1. Any known hard failure → `FAILURE`, with cause → explanation → repair.
2. Unknown required numerical/capability input, absent fixture, or deferred scenario → `UNVERIFIED` / `DEFERRED`, never success.
3. All hard gates pass on explicit [P] fixture values → `MODEL_PASS_PROVISIONAL`. Report any margin warnings and the provisional assumptions.
4. A source-supported mission-design claim requires actual access/link/interface/validation evidence. **None of the current builds qualifies for that claim.**

No component selector may silently use a disabled/unverified item as a solver shortcut.

## 7. Merit score and warnings, separate from feasibility

Only compute a success grade after all hard numerical gates pass. For numeric science requirements with minimum a and stretch b, define logarithmic improvement p:

```
higher-is-better: p = clamp(log(x/a) / log(b/a), 0, 1)
lower-is-better:  p = clamp(log(a/x) / log(a/b), 0, 1)
```

Special-case missing/no stretch and invalid/zero values. Score below a hard minimum never changes NOT_MET to MET. At every minimum, **compliance is already a pass**; the above is only stretch credit.

```
scienceMerit = 70 + 30 × weightedMean(p)   // among MET science requirements
```

Weights [P]: effective spatial scale .25, scheduled access gap .25, delivered useful products .20, latency .20, planned duration .10. Spectral capability and package fit are gates, not weighted loopholes. Footprint is a gate in this brief. No generic scenario-affinity score supplies missing scientific bands or retrieval skill.

Report four dimensions, no blended feasibility score:

- Science merit (as above; our game curve, not a NASA formula).
- Requirements satisfied (exact count, including evidence quality).
- Engineering margins (power, mass, battery, data, storage, schedule).
- Budget headroom after included reserve.

For provisional passes, optionally show **“success with limitations”** as an educational grade; keep `MODEL_PASS_PROVISIONAL` visible. Warnings: power<15%, spacecraft mass<10%, data<10%, budget<10%, schedule slack<6 months. Each uses `(capacity−demand)/capacity`; science lower-bound slack can use the same convention but is displayed in native units too.

A technically compliant but expensive build is not declared a science failure solely because it lacks stretch credit or cost efficiency.

## 8. Play loop and deterministic simulation

Mission brief → select payload/bus/array/battery/radio/ground/orbit/launch → inspect six resources (mass, power, budget, data, communications, time) → review gates → simulate → inspect requirements and diagnoses → revise.

NASA segments remain visible: science customer/user, space system, ground system, launch booking. Simulation is a **derived explanation** of the evaluated design, not a random success roll.

- Launch/design failures stop before flight. Failed designs can be inspected but cannot earn a passing verdict.
- Commissioning reports actual thermal band, payload pointing and product plan.
- Eclipse reports Wh demand, usable Wh and W discharge limit separately.
- Downlink reports generated vs actual payload GB, queue peak, product age and scheduled windows.
- A rate-deficit example reports estimated backlog time as an estimate; exact storage events require the queue calculation.
- Array degradation events use the first crossing of `arrayWh(y)=arrayRequiredWh`, not an arbitrary day 30 warning.
- Cloud losses reject products visibly; no invisible external feed replaces them.
- End report lists every required vs achieved quantity, all provisional inputs and a repair hint for each failure.
- Final status is based on requirements/gates, not on the number of green timeline animations.

English/Ukrainian parity, keyboard access, non-colour-only warnings, reduced motion and a text/skip path remain requirements for later implementation. Save/compare can retain named configurations with the model revision and assumption provenance. Multiplayer roles, random events, sandbox expansion and extra scenarios remain deferred; no new rule for them is needed for Step 2.

## 9. Deferred scenarios: explicit blockers, not invented passes

### Coastal flood

Retain research targets for future rebalancing: all-weather/day-night capability hard; revisit ≤3 d; GSD≤100 m, stretch25 m; delivery latency≤8 h; ≥2 years. The exact 3 GB/day product requirement and all associated money values remain **[P]**, not agency requirements.

**No passing build established.** Worker-recommended 12U dry bus 12 kg + proposed SAR 12 kg already equals 24 kg **before** radio, battery, arrays and contingency. With the small allocated packages:

```
(12 + 12 + 0.83 + 0.36 + 0.30) × 1.15 = 29.3135 kg > 24 kg
```

More importantly the purported SAR isn't a primary-source supported integrated payload. Switching from C to X band or increasing budget does not establish its peak DC power, antenna accommodation, resolution mode, tasking geometry or scene volume.

Unblock only with an explicit microsatellite bus and sourced SAR subsystem/spacecraft profile, mass/energy/current/volume budgets, propagated coastal access, real product plan and a costed launch interface. Do **not** simply add a 22 kg bus and declare the original mission solved. Costs and tightest margins cannot honestly be reported for a complete passing flood build yet.

### Methane

Future mission must specify SWIR absorption region (~1.65 or 2.3 µm), sensitivity **with probability of detection and conditions**, spatial sampling, retrieval validation, wind input/uncertainty, target-access schedule, useful-scene screening and whether it promises detection or quantification.

**No passing build established.** Intuition-1-derived VNIR hardware fails the spectral-capability gate regardless of its GSD, rate or bus. The workers' `≤1 nm` hard gate is removed as scientifically incorrect. GHGSat and Tanager are distinct instrument concepts, not interchangeable attributes of `pl-hyper`.

The research's 1,000 kg/h minimum, 60% quantified fraction, ±50% accuracy, 8 GB/day, seven-day revisit and two-year duration are **[P] candidate game requirements**, not capabilities proved by the library. Do not synthesize sensitivity/accuracy from pixel area or copy a constellation revisit to one spacecraft.

Unblock with one complete SWIR payload and validation profile, supported host, calibrated product/data plan, condition-specific retrieval performance, actual target access and a full cost roll-up. Until then costs/tightest margins of a passing methane build are **not established**.

## 10. Recalculated passing wildfire training builds

Recalculated with double-precision arithmetic and all §5 equations, including **worst-orbit** contact allocation and EOL degradation. No changes to source code were needed.

**Shared choices:** `pl-thermal` CIRC-like package; `bus-12u`; `orb-sso-low` (500 km fixture); `lv-heavy` 50 kg SSO slot; one-year operation; 36-month available schedule; $3,000,000 budget. Target-access, link closure, integration, costs, service life and **image-motion compensation/tracking** remain [P]. These are passes of the **rebalanced training brief**, not of the original full-AOI active-fire mission. There is no unconditional source-validated wildfire pass: without the accepted provisional tracking capability the three examples fail.

### 10.1 Distinct component choices

| Build | Payload | Bus | Array | Battery | Radio | Ground | Orbit | Launch |
|---|---|---|---|---|---|---|---|---|
| WF-A: modest radio / frequent service | `pl-thermal` | `bus-12u` | `arr-deploy-l` 55 W | `bat-s` 40 Wh | `rf-s` 5 Mbps | `gs-service` 22×6 min | `orb-sso-low` | `lv-heavy` |
| WF-B: fast radio / fewer contacts | `pl-thermal` | `bus-12u` | `arr-deploy-l` 55 W | `bat-m` 120 Wh | `rf-x` 100 Mbps | `gs-network` 12×6 min | `orb-sso-low` | `lv-heavy` |
| WF-C: generous power / tight mass | `pl-thermal` | `bus-12u` | `arr-deploy-xl` 135 W | `bat-m` 120 Wh | `rf-s` 5 Mbps | `gs-service` 22×6 min | `orb-sso-low` | `lv-heavy` |

These are different engineering architectures, not three differently named copies. A trades radio performance for station access; B pays for X-band/battery and network setup; C pays mass/cost for more power. C is intentionally not an “upgrade without consequences.”

### 10.2 Cost roll-up (illustrative USD [P], launch base component [V])

| Item | WF-A | WF-B | WF-C |
|---|---:|---:|---:|
| Bus | 940,000 | 940,000 | 940,000 |
| Camera/adaptation | 450,000 | 450,000 | 450,000 |
| Array | 175,000 | 175,000 | 300,000 |
| Battery | 20,000 | 45,000 | 45,000 |
| Radio package | 70,000 | 210,000 | 70,000 |
| Ground setup | 120,000 | 240,000 | 120,000 |
| Launch including adapter allowance | 400,000 | 400,000 | 400,000 |
| One year ground ops | 150,000 | 80,000 | 150,000 |
| **Subtotal** | **2,325,000** | **2,540,000** | **2,475,000** |
| 15% reserve | 348,750 | 381,000 | 371,250 |
| **Total** | **2,673,750** | **2,921,000** | **2,846,250** |
| **Remaining budget** | **326,250 (10.875%)** | **79,000 (2.633%)** | **153,750 (5.125%)** |

### 10.3 Engineering gates and tightest margins

Common orbital period **94.616300475 min**, conservatively **35.954194181 min** eclipse. All use the camera only in sunlight.

| Quantity / inclusive hard limit | WF-A | WF-B | WF-C |
|---|---:|---:|---:|
| Allocated spacecraft kg / ≤24 | 18.9635 | 19.7685 | 23.7705 |
| Spacecraft mass slack kg | 5.0365 | 4.2315 | **0.2295** |
| Spacecraft mass headroom | 20.985% | 17.631% | **0.956%** |
| Slot allocation incl. 2 kg / ≤50 | 20.9635 | 21.7685 | 25.7705 |
| Array+battery kg / ≤10 | 1.19 | 1.84 | 5.37 |
| Max contacts/orbit | 2 | 1 | 2 |
| Payload+TX time / sunlight minutes | 19.5693 / 58.6621 | 13.5693 / 58.6621 | 19.5693 / 58.6621 |
| Worst-orbit average load W | 14.614624 | 14.868280 | 14.614624 |
| Required Wh/orbit incl. charging losses | 24.377998 | 25.576980 | 24.377998 |
| Available Wh/orbit at BOL | 45.707558 | 45.707558 | 112.191278 |
| Available Wh/orbit at year 1 | 44.793407 | 44.793407 | 109.947453 |
| **EOL power margin** | **45.577%** | **42.900%** | **77.828%** |
| Eclipse demand Wh | 11.984731 | 19.175570 | 11.984731 |
| EOL usable battery Wh | 23.940000 | 76.950000 | 76.950000 |
| Peak W / battery W limit | 40 / 60 | 52 / 120 | 40 / 120 |
| Six-minute peak envelope Wh / usable Wh | 4 / 23.94 | 5.2 / 76.95 | 4 / 76.95 |
| Generated product GB/day G | 3.1850496 | 3.1850496 | 3.1850496 |
| Payload downlink GB/day D | 3.4650000 | 37.8000000 | 3.4650000 |
| D−G GB/day | **0.2799504** | 34.6149504 | **0.2799504** |
| **Data capacity headroom (D−G)/D** | **8.079%** | **91.574%** | **8.079%** |
| Backlog / saturation | 0 / never in fixture | 0 / never in fixture | 0 / never in fixture |
| Max periodic queue GB / ≤102.4 | 0.131504 | 0.252150 | 0.131504 |
| Schedule months / ≤36 | 31 | 31 | 31 |
| Supported/funded duration vs requirement | 1 yr funded, 3 yr supported / ≥1 | Same | Same |
| **Tightest resource margin** | **Data 8.079%** | **Budget 2.633%** | **Spacecraft mass 0.956%** |

All compatibility gates pass **under their stated [P] interfaces**. At neither 3U nor 6U does this camera become compatible just because a larger launch slot is selected.

### 10.4 Science/pointing gates

| Requirement / check | WF-A | WF-B | WF-C |
|---|---:|---:|---:|
| Thermal spectral capability | LWIR 8–12 µm | Same | Same |
| Native GSD at 500 km | 166.666667 m | Same | Same |
| Jitter ground displacement [P/D] | 12.120342 m | Same | Same |
| Residual image motion [P] / 33 ms smear | 1,000 m/s / 33.000000 m | Same | Same |
| Tracking rate reference / assumed supported [P] | 0.808927°/s / 1.0°/s | Same | Same |
| Effective spatial scale / ≤200 m | **170.334026 m** | Same | Same |
| Static footprint displacement | 0.436332 km | Same | Same |
| Usable swath / ≥90 km | **104.231570 km** | Same | Same |
| Payload error ratio / ≤1 | 0.05/0.2 = 0.25 | 0.25 | 0.25 |
| Antenna error ratio / ≤1 | 0.05/2 = 0.025 | 0.05/0.5 = 0.10 | 0.025 |
| Scheduled access gap / ≤24 h | 24 h **[P fixture]** | Same | Same |
| Cloud-accepted delivered products / ≥1 GB/day | **1.91102976 GB/day** | Same | Same |
| Latency upper bound / ≤6 h | **2.190909 h** | **3.100000 h** | **2.190909 h** |
| Planned duration / ≥1 yr | 1 yr | 1 yr | 1 yr |
| Numerical outcome | **MODEL_PASS_PROVISIONAL** | **MODEL_PASS_PROVISIONAL** | **MODEL_PASS_PROVISIONAL** |

At budget $3M, B can tolerate only $79,000 total additional cost; with reserve applied to all costs that is $68,695.65 additional subtotal. C has only 229.5 g of *allocated* spacecraft mass headroom, i.e. about 199.565 g of additional nominal hardware before the 1.15 factor. These are real consequences within the model, not rounded “green” indicators.

### 10.5 Negative/boundary checks

The following must remain true in later implementation:

1. 1 Mbps ×1 min ×η=1 produces exactly 0.0075 GB; no decimal/binary or bit/byte factor hidden elsewhere.
2. D=G exactly is rate-stable; D<G by more than numerical round-off is NOT MET even if the deficit is tiny.
3. Mass=24 kg exactly passes the booked spacecraft allocation; 24.000001 kg fails. Full slot mass includes adapter separately.
4. Payload error exactly 0.2° passes its angular gate, but may still fail swath or effective-scale gates. Error 0.200001° fails. Better bus error must never worsen performance.
5. Omni UHF has no 0° divide-by-zero; it still fails this product rate: 0.012×132×0.0075×0.70 = **0.008316 GB/day**.
6. A's S-band with only `gs-network`: D=**1.890 GB/day**, less than G=3.1850496; **DATA_BOTTLENECK** even though min(G,D)×0.6 could exceed 1 GB/day. Sustained workload is a separate hard requirement.
7. B's X-band with `gs-single`: D=12.6 GB/day, but latency bound **7.1 h** exceeds 6 h; more Mbps cannot fix a missing contact.
8. Give C a `bat-l`: allocated mass `(12+3+4.36+2.52+0.30)×1.15 = 25.507 kg`; **CDS_MASS_LIMIT**, despite more energy.
9. Give A a 24 W array: EOL generation is **19.546214 Wh/orbit**, below required 24.377998; **POWER_DEFICIT**. A larger battery alone cannot fix the repeated energy shortfall.
10. A radio error failure sets delivered science data to zero in the failure simulation, but does not change native camera sampling pitch.
11. Missing target-access fixture → UNVERIFIED, not `1/dailyCoverage` or one revisit/day by default.
12. Visible-only, VNIR-only and no-science payloads fail the thermal band requirement, no matter how cheap or sharp they are.
13. If all minimum hard thresholds are met exactly, the mission is compliant; zero stretch credit cannot turn it into FAILURE.
14. Known numerical gates may pass while real-world status remains provisional. Report both without hiding either.
15. Disable ground-image tracking: 33 ms ×7,059.216 m/s gives 232.954 m motion smear and **286.692018 m** effective scale; all three examples fail WF-GSD. Do not retain the former jitter-only 167.106794 m as a conservative exposure-resolution estimate.

## 11. Primary-source register and verification record

Checked 14 November 2026. **Exa was initially used to locate/read primary excerpts**, then NASA chapters were also fetched directly. An initial multi-query request encountered a free-tier 429; individual Exa requests subsequently returned the primary evidence below. Following the user's search-provider change, **SearXNG was verified working and used for all subsequent lookups**. Its test query returned JAXA/CIRC references; DuckDuckGo reported a CAPTCHA, but other results were returned. The Electron follow-up found a manufacturer announcement through SearXNG; direct full-page extraction returned 403, so the limited search-excerpt evidence is recorded as such. No Electron price was verified.

| ID | Primary source and exact fact used |
|---|---|
| S1 | Cal Poly, **CubeSat Design Specification Rev 14.1**, NASA-hosted PDF: https://www.nasa.gov/wp-content/uploads/2018/01/cubesatdesignspecificationrev14_12022-02-09.pdf — §2.2.10 Table 1, 3U 6 kg / 6U 12 kg / 12U 24 kg, plus explicit provider-dependent exceptions. |
| S2 | JAXA authors, **Development of the Compact Infrared Camera (CIRC) for Earth observation**: https://circgs.tksc.jaxa.jp/documents/2012/83533J.pdf — §4 Table 3; 3 kg, <20 W, 640×480, 8–12 µm, 12°×9°, 33 ms, <200 m@600 km and <130 m@400 km. Reference only, not qualification of our package. |
| S3 | NASA **2026 State-of-the-Art, 3.0 Power**: https://www.nasa.gov/smallsat-institute/sst-soa/power-subsystems/ — Table 3-2: DHV DSA-6U-2D-S 55 W / 67 W/kg, Pumpkin dual-articulated 135 W / 31 W/kg; Table 3-5: Optimus 119.4 Wh/kg and product current limits. Text distinguishes BOL/EOL, peak vs average ratings, and capacity vs power. |
| S4 | NASA **2026 State-of-the-Art, 9.0 Communications**: https://www.nasa.gov/smallsat-institute/sst-soa/communications/ — §§9.2.4, 9.2.7–8 and Tables 9-2/9-3: data rate, antenna gain, pointing and power must be traded; rate listings and RF output are not complete DC/system link budgets. |
| S5 | ICEYE **launch release, 12 Jan 2018**: https://www.iceye.com/newsroom/press-releases/iceye-successfully-launches-worlds-first-sar-microsatellite-and-establishes-finlands-first-commercial-satellite — 70 kg ICEYE-X1. **First image, 17 Jan 2018**: https://www.iceye.com/newsroom/press-releases/first-iceye-x1-radar-image-from-space-published — >1.2 GB raw, ~80×40 km, 10 s, >500 km, 10 m resolution. |
| S6 | NASA **GNC chapter**: https://www.nasa.gov/wp-content/uploads/2025/02/5-soa-gnc-2024.pdf and NASA **2015 SoA**, GNC/platform discussions: https://www.nasa.gov/wp-content/uploads/2017/03/small_spacecraft_technology_state_of_the_art_2015_tagged.pdf — separately specifies control accuracy, pointing knowledge and stability/rate. Does not validate our 5 arcsec exposure-jitter allocation. |
| S7 | NASA **FIRMS FAQ**: https://www.earthdata.nasa.gov/data/tools/firms/faq and **VIIRS fire hotspots description**: https://firms.modaps.eosdis.nasa.gov/content/descriptions/FIRMS_VIIRS_Firehotspots.html — clouds/missing data affect detections; 375 m active-fire pixel ≠ fire area; global NRT latency within 3 h. This is the cited service benchmark, not a universal 30 min–2 h guarantee. |
| S8 | KP Labs **Intuition-1 manufacturer mission page**: https://www.kplabs.space/projects-and-missions/intuition-1 — 465–940 nm VNIR, 192 bands, 3–6 nm spectral resolution, 25 m GSD at 600 km reference orbit. Invalidates assigning methane SWIR ability to its reference camera. |
| S9 | Carbon Mapper **Product Guide**: https://carbonmapper.org/articles/product-guide and **L3/L4 ATBD**: https://assets.carbonmapper.org/documents/L3_L4%20Algorithm%20Theoretical%20Basis%20Document_021726.pdf — Tanager 30 m, 18.6 km nadir swath, 5 nm sampling / 5.5 nm FWHM; EMIT 60 m / 75 km, 7.5 nm sampling / ~8.5 nm FWHM; emission-rate estimation uses integrated mass enhancement and wind. Tanager sensitivity 90–180 kg/h at 90% PoD is conditional on 3 m/s wind, 35° solar zenith, 25% albedo and 30 m GSD. |
| S10 | SpaceX **Smallsat Rideshare Program**: https://new.spacex.com/rideshare — $350k/50 kg to SSO, extra $7k/kg, quarter plate 50 kg included; approximate four-month SSO cadence. $400k all-in and nine-month queue are our estimates, not this page's promises. |
| S11 | Rocket Lab **Electron payload-capacity increase announcement**: https://rocketlabcorp.com/updates/rocket-lab-increases-electron-payload-capacity-enabling-interplanetary-missions-and-reusability/ — manufacturer result returned by SearXNG states 200 kg to 500 km SSO versus 300 kg to lower orbits. **Search excerpt only; full-page read blocked with HTTP 403.** No price or new game capability adopted from it. |

Systems-engineering foundation (requirements first and explicit verification): NASA **Design and Develop Science Missions** https://www.nasa.gov/wp-content/uploads/2025/04/250323-design-and-develop-science-mission.pdf . Cited for the process, not for our numbers or scoring.

### Values still provisional, including every pass-critical assumption

Bus mass/housekeeping/ADCS/jitter/storage, **ground-target tracking rate and residual image-motion compensation**, package compatibility, load timing and mode placement, camera digitization/frame rate/duty, product acceptance fraction, array incidence/EPS derating and losses, integrated component mass, battery output/cycle life and efficiency, link closure/throughput efficiency, target/contact fixtures, processing time, funded/support life, launch altitude/interface/queue/adapter, **all costs except the cited launch base**, contingency factors, science thresholds and scoring weights.

Nothing in the worker drafts upgrades these to flight-validated facts. A future estimate must not be marked [V] merely because a similar product appears somewhere in a NASA table. Source references are facts for attribution, not permission to reuse vendor graphics or protected agency insignia.

## 12. Step 2 handoff and stop

Rules, unit conventions, downlink conversion, pointing treatment, hard boundaries and the three reproducible **provisional training passes** are finalized here. The original rapid-response wildfire mission and both additional scenarios have explicit unresolved feasibility flags.

The existing source types/constants were written against the previous rule draft and **do not yet match this specification**. No `src/` files are modified as part of Step 2. Step 3 must not begin without a separate instruction.
