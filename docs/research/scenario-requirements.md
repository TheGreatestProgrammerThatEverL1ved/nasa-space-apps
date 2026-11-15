# Mission Forge — Scenario Science Requirements

**Step 1b research deliverable.** Measurable, sourced science requirements for the three Mission Forge scenarios, written in NASA systems-engineering style so they can be copied verbatim into a TypeScript data file (`src/data/scenarios.ts`) in Step 3.

Sibling doc: `docs/01-analysis-and-plan.md` (scenario names, the six resources, and the failure-mode list come from there). This file is **not** game rules — rules are Step 2. This file answers one question only: *what must the mission actually do, with numbers, and how do we know those numbers are real?*

Scenarios (names locked in Step 1):

1. **Wildfire / active-fire monitoring**
2. **Coastal flood mapping**
3. **Greenhouse-gas (methane) plume survey**

---

## 0. How to read this document

Every number carries a provenance tag:

| Tag | Meaning |
|---|---|
| **[R]** | **Real published value** — from a mission user guide, algorithm ATBD, agency fact sheet, or peer-reviewed paper. Cited in §9. |
| **[D]** | **Derived value** — arithmetic performed on real published values, with the arithmetic shown inline. |
| **[E]** | **Our estimate / design choice** — a Mission Forge number that no external source states: rubric weights, CubeSat-class data volumes, minimum mappable areas, MET/PARTIALLY-MET bands, false-alarm budgets. Declared as simplified values in the README. |

Confidence labels (High / Medium / Low) are attached per source in §9 and inherited by the requirements that use them.

Unit conventions (requirements are stored in exactly these units):

`m (GSD) · km (swath) · h or d (revisit, latency) · kg/hr and t/hr (emission rate) · GB/day (data) · km² (survey area) · yr (duration) · % (accuracy, false alarms, cloud) · W (power) · kg (mass)`

Requirement syntax follows NASA practice: each requirement is a **`shall` statement** with a numeric threshold, paired with a **verification method** (§5). Requirements state *what must be achieved*, never *what hardware to buy* — hardware is the design, and choosing hardware is the player's job.

---

## 1. Framework: need → goal → requirement → design → verification

From the NASA Small Sat Institute systems-engineering resource **"Design and Develop Science Missions"** (Julie Levri, 26 Mar 2025) [R, High]:

```
Identify Need & Goals  →  Define Concept  →  Define Requirements  →  Design
        →  Build & Verify  →  Implement
```

The same resource splits a mission into **four segments**, and every requirement in this document is tagged to one of them:

| Segment | What it covers | Mission Forge equivalent |
|---|---|---|
| **Launch segment** | launch vehicle, fairing, energy to reach the orbit | `LaunchVehicle` + orbit energy class |
| **Space segment** | spacecraft, payload, orbit, attitude, power, storage | `Payload`, `Bus`, `PowerSystem`, `Orbit` |
| **Ground segment** | stations, downlink, processing, archive | `Comms`, `GroundSegment` |
| **User segment** | products, latency, accuracy, decision value | the scenario brief itself + verdict screen |

NASA's requirement examples in that resource are all **numeric limits with `≥` / `<`** and each one is paired with a planned verification method [R, High]. Supporting definitions: NASA SE Handbook SP-2016-6105 Rev 2; NPR 7123.1 (verification = proof of compliance with each `shall` statement by **test, analysis, inspection, demonstration**); the Science Traceability Matrix chain *needs → goals → objectives → requirements → investigations → measurements* [R, High] (§9, S1–S4).

**Mission Forge mapping.** The player's job is exactly the middle of the chain:

```
scenario brief (§2–§4 tables)          =  NEEDS + GOALS + REQUIREMENTS   (given, fixed)
player's payload/bus/orbit/comms picks  =  DESIGN                        (player)
simulator verdict (§5–§6)               =  VERIFICATION + SCIENCE VALUE  (engine)
```

That is why the brief must state numbers: without a numeric `shall`, there is nothing to verify, and the game cannot explain a trade-off.

---

## 2. Scenario 1 — Wildfire / active-fire monitoring

### 2.1 The need, in the user's words

Fire managers need to know **that** a fire exists, **where** its edge is, and **how fast** it is growing, *while the fire is still small*. NASA/NOAA operational fire products are built for a 10:30-or-13:30 overpass that a fire can out-run; the wildfire community explicitly asked for higher resolution and higher revisit — that request is the design basis of FireSat, which was co-designed from interviews with 200+ firefighters and incident commanders [R, High].

Measured science value driver: existing 1 km products systematically miss small, cool, short-duration and understory fires; FireSat was specified specifically to close that gap [R, High].

### 2.2 Real reference performance — polar-orbiting systems

| System / mission | Orbit & local time | Fire bands used | Fire-pixel resolution | Swath | Revisit / cadence | Data rate & volume | Confidence |
|---|---|---|---|---|---|---|---|
| **MODIS** (Terra, Aqua) [R] | 694 km (Terra, lowered from 705) / 705 km, near-polar SSO; Terra ≈ 10:30 LT descending, Aqua ≈ 13:30 LT, both **drifting later over the mission** | 3.9–4.1 µm (bands 21, 22), 11 µm (31), 12 µm (32); 36 bands total | **1 km** fire pixels | **2 330 km** | 16-day repeat ground track; ~2 overpasses/day/satellite, near-daily global coverage | **10.6 Mb/s** X-band L1 | High (local-time drift: Medium) |
| **VIIRS** (Suomi NPP, NOAA-20, NOAA-21) [R] | 824–830 km, SSO, ≈ 13:30 LT | M13 3.973–4.128 µm + M15 10.263–11.263 µm (750 m); I4 3.55–3.93 µm + I5 10.5–12.4 µm (375 m) | **750 m** (`VNP14`) and **375 m** (`VNP14IMG`, `VJ114IMG`, `VJ214IMG`) | **3 060 km** | ≥ 6 views/day most of the globe; **8–9/day CONUS, 16–20/day Alaska** (3 satellites) | ≈ 5.9 Mb/s instrument; **NRT granule = 6 min, ≈ 2 MB/file, 240 files/day → ≈ 0.41 GB/day** per 375 m product (0.15 GB/day JPSS-2 750 m) | High (5.9 Mb/s: Medium) |
| **Sentinel-3 SLSTR** [R] | 1 400 km SSO | VIS–SWIR 500 m + IR **1 km**, detects ≈ 650 K fires without saturation, gives Fire Radiative Power per 1 km² | **1 km IR / 500 m VIS** | **1 400 km nadir + 740 km oblique** | 27-day orbital cycle; **1.0 d nadir revisit, 0.5 d with two satellites, 1.9/0.9 d dual view** | **64 Mb/s**; payload ≈ 150 kg, ≈ 100 W | High (mass/power: Medium) |
| **Landsat 8/9 TIRS** [R] | 705 km, ≈ 10 a.m. local descending | band 10 = 10.6–11.19 µm, band 11 = 11.5–12.51 µm; **100 m TIR resampled to 30 m** | **30 m (from 100 m native)** | **185 km** (185 × 180 km scene) | **16 d per satellite, 8 d as an 8/9 pair** | 150 Mb/s X-band | High (downlink: Medium) |
| **ECOSTRESS** (ISS) [R] | ≈ 410 km, 51.6°, ≈ 16 orbits/day | thermal IR only, no 4 µm fire band | **70 m land-surface temperature**, ≈ 408 × 10 km tiles | ≈ 70 km across-track | **1–5 days** per target | — | High |
| **FireSat** (Earth Fire Alliance + Muon Space) [R] | **600 km SSO**; FireSat0 launched 15 Mar 2025; first 3 operational satellites launched **7 Jul 2026** (IOC, data from Q4 2026) | **6 channels across 5 bands**: red, NIR, SWIR, **2 × MWIR** (one attenuated, one unattenuated to avoid saturation), LWIR — all simultaneous, same resolution | **80 m average GSD**, minimum fire detection **5 × 5 m (25 m²)** | **1 500 km** | 3 satellites → 12 h global / **≥ twice daily** over fire-prone regions; **≈ 20 satellites → 1 h by 2029**; **≈ 50 satellites → 20 min in the early 2030s** | **700 GB/day delivery/satellite**; bus > 200 kg, 200 W payload orbit-average power; design EOL Aug 2031 | High |

### 2.3 Real reference performance — geostationary systems (the cadence benchmark)

| System | Fire product | Resolution | Cadence | Processing latency | Confidence |
|---|---|---|---|---|---|
| **GOES-16/18 ABI Fires & Hot Spots** [R] | L2 Fire Hot Spot | **2 km** (bands 7 = 3.9 µm, 14 = 11.2 µm; ABI bands 0.5–2 km) | Full Disk **10 min**, CONUS **5 min**, Mesoscale cast **60 s** (30 s sub-domain) | ABI ATBD: **266 s mesoscale, 806 s full disk** | High |
| **Himawari-8/9 AHI** [R] | fire/hot spot | 2 km | Full Disk **10 min** | ~30 min in FIRMS | High |
| **Meteosat (SEVIRI), MTG FCI** [R] | nowcasting fire | 3 km (SEVIRI) → **1 km (MTG FCI)** | **15 min** → **10 min** | ~30 min in FIRMS | High |
| **FIRMS geostationary feed** [R] | VIIRS/MODIS/geo fire map | as above | — | **≈ 30 min after observation** | High |

**Why this matters for the game:** geostationary systems win on cadence (minutes) and lose on resolution (1–3 km, so a 1 ha fire is invisible). Polar systems win on resolution and lose on cadence (hours to a day). FireSat is the first mission built to win **both** at once. That trade-off is Scenario 1's core lesson.

### 2.4 Real detection thresholds — how a pixel becomes a "fire"

MODIS Collection 6 algorithm (Giglio et al. 2016) [R, High]:

| Test | Threshold |
|---|---|
| Absolute, daytime | brightness temperature in the 4 µm band **T4 ≥ 360 K** |
| Absolute, night-time | **T4 ≥ 320 K** |
| Contextual (vs. background) | ΔT4 > ΔT4b + 3.5·σ4 ; ΔT4 > ΔT4b + 6 K ; T4 > T4b + 3·σ4 ; T11 > T11b + σ11 − 4 K |
| Daytime **commission (false-alarm) error** | **1.2 %** (C6), improved from **2.4 %** (C5) |
| Theoretical minimum detectable fire area | **≈ 100 m²** in a 1 km pixel (Giglio 2003) |

VIIRS 375 m algorithm (VIIRS Active Fire 375 m ATBD + C2 user guide) [R, High]:

| Test | Threshold |
|---|---|
| Night-time unambiguous fire | brightness temperature **BT4 > 320 K** |
| MWIR saturation point | **BT4 = 367 K** |
| Daytime candidate | **BT4 > 325 K** and **ΔBT45 > 25 K** |
| Night-time candidate | **BT4 > 295 K** and **ΔBT45 > 10 K** |
| Contextual test | ΔBT45 > ΔBT45B + **10 K (day)** / **+ 9 K (night)** |
| Commission (false-alarm) error | **< 1.2 %** |
| Sensitivity demonstrated | detects simulated fires of **2–250 m² at 400–1200 K**; yields **3 × (day) / 25 × (night)** more fire pixels than the 750 m product |

NOAA JPSS National Data Environment 750 m ATBD [R, High]: M13 3.973–4.128 µm + M15 10.263–11.263 µm, absolute test **T13 > 360 K (day) / > 320 K (night)**.

Detection latency, real values [R, High]:

- **LANCE / FIRMS near-real-time VIIRS products: "30 minutes to two hours after satellite observation."**
- NESDIS raw VIIRS data: **20–80 min** after observation.
- ABI processing: **266 s (mesoscale) / 806 s (full disk)** [R, High].

False alarms and data quality [R, High]: ABI fire products carry a confidence/quality mask — codes 10/30 processed, **11/31 saturated**, **15/35 low-probability (many of these are false alarms)**. FireSat's stated design goal is **< 5 % false positives** [R, High], while MODIS/VIIRS operational commission error is **< 1.2 %** [R, High]. A mission that finds every fire *and* reports a hundred fake ones is a mission that gets ignored by firefighters — that is why false-alarm rate is a requirement, not a footnote.

### 2.5 Feasibility cross-checks (do these before coding)

- **Swath × target area.** Required target 400 000 km². A 300 km swath needs 400 000 / 300 = **1 333 km of along-track acquisition = 147 s at 7.6 km/s** — one data-take, trivially feasible. A 1 500 km swath (FireSat-class) covers it in under 5 minutes of viewing.
- **Revisit is an orbit problem, not a data problem.** Coverage capacity per orbit is enormous: a 300 km swath imaging 25 min per orbit covers 300 × 11 400 = **3.4 million km² per orbit**. What limits *revisit at a given point* is the ground-track spacing of the orbit, not capacity. The engine must compute revisit from orbit geometry (inclination, altitude, repeat cycle, number of satellites), never from data volume.
- **Data scales as 1 / GSD².** At 6 bands, 16-bit, over 400 000 km²/day [D]:

Pixels/km² = 1 000 000 / GSD²; bytes = pixels × bands × 2:

| GSD | Pixels per km² | Pixels for 400 000 km² | Raw L1 GB/day (6 bands, 16-bit) | Detect-on-board, downlink hotspot tiles only [E] |
|---|---|---|---|---|
| 300 m | 11.1 | 4.4 × 10⁶ | **0.05 GB** | 0.01 GB |
| 100 m | 100 | 4.0 × 10⁷ | **0.48 GB** | 0.05 GB |
| 30 m | 1 111 | 4.4 × 10⁸ | **5.3 GB** | 0.05 GB |

Two legal architectures, and the player must pick one [E]:

- **Downlink everything (L1).** Simple onboard software, brutal data/comms demand — at 30 m the mission needs **> 5 GB/day** of downlink, which a smallsat with 4 × 10-minute contacts only reaches at ≈ 110 Mb/s.
- **Detect on board, downlink hotspots (L2).** ~100× less data, but the satellite must run the MODIS/VIIRS contextual tests (§2.4) on board — mass, power, and radiation-tolerant processing.

Both satisfy the same science requirement. This is Scenario 1's trade-off reversal for the 30-second demo.

### 2.6 Derived Mission Forge requirements — Scenario 1

Scenario brief parameters (fixed by the brief, not chosen by the player): target area **400 000 km²** of fire-prone wildland; seasonal AOI mean cloud cover **40 %** [E]; requirement window **≥ 1 fire season on each hemisphere**.

| ID | `shall` requirement | **MINIMUM** | **STRETCH** | Derivation | Tags | Verify by |
|---|---|---|---|---|---|---|
| **REQ-WF-01** | The space segment shall image any point in the AOI **at least once per 24 h**. | revisit **≤ 1.0 d** | **≤ 4 h** | Floor set by VIIRS, which already gives ≥ 6 views/day over most of the globe with 3 satellites and 8–9/day over CONUS [R]; a single SSO CubeSat realistically delivers 1–3 looks/day, so 1 d is the honest pass bar. 4 h needs a 3–6 satellite constellation — the same scaling FireSat uses (3 sats → 12 h, 20 sats → 1 h, 50 sats → 20 min) [R]. | [R]+[D] | Analysis (ground-track / constellation coverage computation) |
| **REQ-WF-02** | The payload shall provide ground sample distance **≤ 100 m** in the thermal bands over the AOI. | **100 m** | **30 m** | 100 m is the Landsat TIRS native thermal pixel [R] and is coarser-but-comparable to FireSat's 80 m average [R]; it is ~10 × finer than VIIRS 750 m and ~3 × finer than MODIS 1 km [R], i.e. it is the first tier that resolves individual structures rather than "a hot region". Physics check: diffraction-limited IFOV = 1.22 λ/D → at λ = 4 µm, D = 0.15 m gives 3.3 × 10⁻⁵ rad → **17 m at 500 km**; at λ = 11 µm, D = 0.10 m gives 1.3 × 10⁻⁴ rad → **67 m at 500 km**. So 100 m needs a ~5 cm aperture and 30 m needs ~15 cm at 4 µm — CubeSat-buildable, and aperture mass is the price. | [R]+[E] | Analysis (optical budget), Test (on-orbit edge target) |
| **REQ-WF-03** | The payload shall detect a fire of **≥ 10 000 m² (1 ha)** and, at stretch, **≥ 250 m²**, at a false-alarm rate **≤ 10 %** (stretch **≤ 2 %**). | 1 ha, ≤ 10 % false alarms | 250 m², ≤ 2 % | Minimum = one fully filled 100 m pixel — the most conservative possible statement, because a filled pixel trivially passes the absolute tests (T4 ≥ 360 K day / ≥ 320 K night) [R]. Stretch 250 m² sits exactly on demonstrated VIIRS 375 m sensitivity (simulated 2–250 m² fires at 400–1200 K) [R] and is 10 × coarser than FireSat's stated 5 × 5 m goal [R]. False-alarm budget: real operational commission error is 1.2 % (MODIS C6, VIIRS) [R] and FireSat's design goal is < 5 % [R]; we allow 10 % as the pass bar for a first CubeSat and 2 % as stretch. **10 % is our number, not NASA's** [E]. | [R]+[E] | Test (pre-launch against reference fire scenes), Analysis (ΔBT budget), Similarity (MODIS/VIIRS algorithm re-use) |
| **REQ-WF-04** | The ground segment shall deliver a fire product **≤ 6 h** after observation (stretch **≤ 2 h**). | latency **≤ 6 h** | **≤ 2 h** | 6 h is bounded by downlink opportunity, not by processing: a polar CubeSat with 3–5 contacts/day cannot do better than roughly its contact spacing. The real operational benchmark is LANCE/FIRMS: **"30 minutes to two hours after satellite observation"**, with NESDIS raw data 20–80 min [R] and ABI processing 266 s / 806 s [R] — so 2 h is the *stretch* a good design can reach, and anything worse than 6 h is worse than every operational fire product on Earth. Geostationary systems achieve 5–10 min cadence but only at 1–3 km, which is why "faster" is not automatically "better". | [R]+[E] | Demonstration (end-to-end run), Analysis (link + processing schedule) |
| **REQ-WF-05** | The mission shall return **≥ 1 GB/day** of usable fire data (stretch **≥ 5 GB/day**). | **1 GB/day** | **5 GB/day** | [D] from §2.5: full 6-band L1 over 400 000 km²/day at 100 m GSD = 0.48 GB/day (so 1 GB/day leaves real margin for calibration/ancillary); at 30 m GSD = 5.3 GB/day, hence the 5 GB/day stretch. Real anchors: VIIRS 375 m NRT ≈ 0.41 GB/day per product [R]; FireSat 700 GB/day per satellite [R]. | [D]+[R] | Analysis (data-volume model) |
| **REQ-WF-06** | The payload shall include a **3.9–4.2 µm** channel **and** a **10.5–12.5 µm** channel; at stretch, 6 simultaneous channels (VIS, NIR, SWIR, 2 × MWIR, LWIR). | 2 bands | 6 bands | Every operational fire product uses a mid-IR (≈ 4 µm) channel plus a thermal-IR (11–12 µm) channel: MODIS 21/22 + 31/32 [R], VIIRS M13+M15 / I4+I5 [R], ABI band 7 + 14 [R]. The second MWIR band exists for one specific reason: a single MWIR band **saturates** on very hot fires (VIIRS saturates at BT4 = 367 K [R]); FireSat uses one attenuated and one unattenuated MWIR band to remove that blind spot [R]. | [R] | Inspection (instrument spec), Analysis |
| **REQ-WF-07** | The mission shall operate for **≥ 1 year** (stretch **≥ 3 years**). | **1 yr** | **3 yr** | 1 year is the shortest period that observes both hemispheres' fire seasons once. FireSat's first operational satellites have a design EOL of Aug 2031 after a Jul 2026 launch (≈ 5 yr) [R]; MODIS/VIIRS are 6+ year design lives operating far longer [R]. | [R]+[E] | Analysis (drag/lifetime, consumables) |

**Scenario 1 verdict shape:** REQ-WF-01 and REQ-WF-04 are ground/orbit-limited; REQ-WF-02 and REQ-WF-06 are payload-limited; REQ-WF-05 is comms-limited; REQ-WF-03 is software+lifetime limited. No single component satisfies them all — that is the coupling the game must expose.

---

## 3. Scenario 2 — Coastal flood mapping

### 3.1 The need, and the hard constraint that shapes it

Flood emergency response is measured in **hours**, and floods happen **when it is raining**. A flooded coastline under monsoon cloud is, optically, invisible. This is not a scoring penalty in this scenario — it is a **pass/fail gate** (REQ-FL-01).

The measured justification, all real [R, High]:

| Cloud fact | Value | Source |
|---|---|---|
| Global mean cloud fraction | **≈ 67 %** of Earth's surface is cloud-covered at any moment (range 56–73 % depending on the minimum cloud optical thickness counted) | King et al. 2013, IEEE TGRS (12 yr Terra + 9 yr Aqua MODIS cloud mask); ISCCP agrees (~67 %) |
| Cloud fraction **over land** | **≈ 55 %**, with a strong seasonal cycle | King et al. 2013 |
| Cloud fraction **over ocean** | **≈ 72 %**, with little seasonal variation | King et al. 2013 |
| Monsoon-coast stress case | Western Ghats / Indian monsoon coast: mean cloud cover **> 90 % in July–August**, leaving ~23–25 % of surface water unmappable by an optical product | PLOS ONE 2025 cloud-cover study |
| Tropical West Africa stress case | Lower-Niger (Nigeria) seasonal mean cloud fraction **84 %**, peaking **90.8 % in June**; only **6.3 cloud-free Sentinel-2 scenes per pixel** in a 7-month flood season (55 % of the area has ≤ 5) | Nature Scientific Data 2023 |
| NW Amazon | persistently cloudy ≈ **10 months/year** | literature summary |

**Arithmetic that makes the gate unavoidable** [D]: with 55 % mean cloud over land, the probability that a *single* optical revisit sees a given coastal site clear is 0.45. Over a 3-day requirement window with one optical satellite at 3-day revisit, the chance of ever obtaining a cloud-free image is **45 %**. Real monsoon-season coasts (90 %+ cloud) drive that to **< 5 %**. An optical flood mission is not "worse"; it is **not a mission**.

### 3.2 Real reference performance — radar systems

| System / mission | Orbit | Instrument & band | Resolution | Swath | Revisit | Data volume / latency | Confidence |
|---|---|---|---|---|---|---|---|
| **Sentinel-1 A/B/C/D** (Copernicus) [R] | **693 km**, 98.18°, SSO, LTAN 18:00, period 98.6 min; **12-day repeat, 175 orbits/cycle** per satellite; two satellites 180° apart → **6-day exact repeat** (S1B lost Dec 2021; S1C launched 5 Dec 2024; S1D launched 4 Nov 2025) | **C-SAR, C-band 5.405 GHz**, dual-pol VV+VH, TOPSAR | **IW 250 km swath at 5 × 20 m single-look**; GRD 10 m (HR) / 20 m (MR); **SM 80 km at 5 × 5 m**; **EW 410 km at 20 × 40 m** | **IW 250 km**, EW 410 km, SM 80 km | 12 d single / 6 d pair; **< 1 d Arctic, 1–3 d Europe & Canada, 3 d equator, 6–12 d most other land** | **up to 6 TB/day produced** (Sentinel Data Access Annual Report 2023); X-band **2 × 260 Mb/s**, on-board storage **1 410 Gbit**; solar **5 900 W** EOL, mass **2 300 kg**, instrument **945 kg**; imaging duty cycle **25 min/orbit (A/B), 30 min/orbit (C/D)**; NRT delivery **< 3 h worst case, 1 h goal**, archive **< 24 h** | High |
| **Copernicus EMS Global Flood Monitoring (GFM)** [R] | uses Sentinel-1 IW | fully automated SAR flood mapping, ensemble of 3 algorithms | **20 m pixel sampling** | global except poles | Europe **1–3 d**; priority regions **4–6 d**; most other land **6–12 d**; **3–6 d with S1A+S1C** | **core requirement: flood product within 8 h of each Sentinel-1 acquisition (> 99 % of cases; best case < 3 h)**; service availability KPI ≥ 99 % (2023: 99.80 %); ≈ 450 S1A + ≈ 400 S1C scenes processed/day; archive ≈ 2 million scenes / ≈ 250 TB output since 2015 | High |
| **Copernicus EMS Rapid Mapping (on-demand)** [R] | optical + radar, tasked | SL1 (24/7) target delivery times after image reception: **First Estimate 2 h, Reference 10 h, Delineation 7 h, Grading 10 h** (2019+); older User Guide v2: reference **9 h**, delineation **12 h**, grading **12 h**; **First Available Map target 3 h**; **service aim: crisis information within 24 h of the user's request**; SL2 within 48 h | SL1 = fastest, lowest thematic accuracy | — | tasked | — | High (timeliness table), Medium (observed averages) |
| **ALOS-2 / PALSAR-2** (JAXA) [R] | **628 km**, 97.9°, **14-day revisit** (vs 46 d for ALOS) | **L-band 1257.5 MHz** — better at seeing through vegetation canopy than C-band | ScanSAR **100 m @ 350 km** and **60 m @ 490 km**; stripmap **3/6/10 m** at 50–70 km; spotlight **1 × 3 m** over 25 × 25 km | 350–490 km (ScanSAR) | 14 d (taskable more often) | X-band downlink **800 / 400 / 200 Mbit/s** | High |
| **RADARSAT-2** (CSA — our partner agency) [R] | **798–800 km**, 98.6°, dawn-dusk, **24-day exact repeat** | **C-band 5.4 GHz** | ScanSAR Wide **100 m @ 500 km**; ScanSAR Narrow **50 m @ 300 km**; Wide Fine **8 m @ 150 km**; Extra-Fine **5 m @ 125 km**; Ultra-Fine **3 m @ 20 km**; Spotlight ~**1 m @ 18 km** | 500 km max | 2–3 d equatorial, **daily at the poles** | ≈ **460 MB per Standard-coverage SLC scene** | High |
| **RADARSAT Constellation** (3 satellites, CSA) [R] | 582 km dawn-dusk | C-band | 100 m/500 km, 50 m/350 km, 30 m/125 km, 16 m/30 km, 5 m/30 km, 3 m/20 km | up to 500 km | **daily coverage of all of Canada** | — | High |
| **NISAR** (NASA ISRO) [R] | **747 km**, 98.4°, launched 30 Jul 2025, **12-day exact repeat, 173 tracks/cycle**, 3-year baseline | **L-band + S-band** SAR, first dual-band | **7 m azimuth, 3–48 m range (L)**; **3–24 m (S)** | **> 240 km** | average **≈ 6 d** | recorder **9 Tbit**, Ka-band downlink **3.5 Gb/s** | High |
| **SWOT** (NASA/CNES) [R] | **855 km**, 78.2°, **21-day repeat** | **KaRIn 35.75 GHz** radar interferometer | two 50 km swaths, 120 km total, **10 m baseline** | **120 km** | average **≈ 11 d** (≈ 10 d at equator) | raw **≈ 4 GB/s**; detects **rivers > 100 m wide** and **lakes > 250 × 250 m**; water-surface elevation **± 10 cm** (> 1 km²), **± 25 cm** ((250 m)²–1 km²); water extent **± 15 %** | High |
| **ICESat-2** (NASA) [R] | **500 km**, **92°**, **91-day repeat** | ATL13 inland-water height, 532 nm lidar, 6 beams | **11 m footprint**, 10 kHz → ≈ 0.7 m along-track spacing | narrow footprint | 91 d | — | High |
| **MODIS / VIIRS near-real-time flood products (MCDWD, VCDWD)** [R] | Terra/Aqua/Suomi NPP | optical + thermal water *detection* flags | **250 m** grid | 2 330–3 060 km | 1–2 d | **cloud-limited: the product explicitly cannot see through cloud** | High |

**Effectiveness fact that must be in the brief** [R, Medium]: an operational study of Copernicus flood activations found that a **12-day** radar revisit observed only **≈ 20 %** of European flood events (optical at 5 days ≈ 10 %), and that a 12-day cadence is adequate only for inundations lasting **more than a week** — flash floods are routinely missed. Revisit is therefore the requirement with the largest real-world consequence in this scenario.

### 3.3 Feasibility cross-checks

- **Coverage capacity is never the limiter here** [D]. Sentinel-1-class imaging budget: 25 min/orbit × 7.6 km/s = **11 400 km of swath line per orbit**; at a 250 km swath that is **2.85 million km² per orbit**, ≈ 42 million km²/day over 14.6 orbits. Covering 900 000 km² every 3 days needs 300 000 km²/day = **12 000 km of swath line/day ≈ 1 orbit's worth**. So the engine must **not** make Scenario 2 fail on capacity; it must fail on **revisit geometry** and on **downlink bandwidth**.
- **Revisit is geometry.** 900 000 km² spread over a ~1 500 km coastline needs 900 000 / 250 = **3 600 km of swath lines spaced ≤ 250 km apart**, and each one revisited ≤ 3 days. Single-satellite SSO ground-track spacing at 693 km is ~45 km at the equator, so a *constellation or a wide swath plus a high inclination* is what buys the 3-day requirement — exactly the reason Copernicus flies pairs and CSA flies three.

### 3.4 Derived Mission Forge requirements — Scenario 2

Scenario brief parameters: coastal/river-delta AOI **900 000 km²**; AOI mean cloud cover **60 %** [E] (55 % MODIS land mean [R] raised for a monsoon-exposed coast); stress case **90 %** [R].

| ID | `shall` requirement | **MINIMUM** | **STRETCH** | Derivation | Tags | Verify by |
|---|---|---|---|---|---|---|
| **REQ-FL-01** (GATE) | The payload shall image the AOI **day or night, through cloud and rain** — i.e. it shall be an active microwave (SAR) instrument. | **hard pass/fail** | — | Cloud fraction over land is ≈ 55 % globally and 84–92 % in monsoon flood seasons [R]; MODIS/VIIRS flood products are explicitly cloud-limited [R]; Copernicus built an entire radar mission and an automated 20 m flood service for this reason [R]. Optical or thermal-only designs are **NOT MET regardless of score**. | [R] | Analysis (cloud statistics), Inspection (instrument band) |
| **REQ-FL-02** | The space segment shall revisit any point of the AOI **at least once per 3 days**. | revisit **≤ 3 d** | **≤ 1 d** | Copernicus' own operational revisit over Europe is **1–3 d** and 3–6 d with two radars [R]; the effectiveness study shows a **12-day** revisit catches only ≈ 20 % of flood events [R, Medium], so 12 d must fail and 3 d is the bar that operational services actually accept. 1 d is the RADARSAT Constellation / Arctic-class benchmark [R]. | [R]+[D] | Analysis (constellation coverage), Demonstration |
| **REQ-FL-03** | The payload shall provide **≤ 100 m** GSD (stretch **≤ 25 m**), and shall map contiguous inundation down to **1 km²** (stretch **0.1 km²**). | **100 m**, 1 km² | **25 m**, 0.1 km² | 100 m is the wide-swath disaster tier of every real radar: RADARSAT-2 ScanSAR Wide 100 m @ 500 km [R], ALOS-2 ScanSAR 100 m @ 350 km [R], Sentinel-1 EW 20 × 40 m [R]. 25 m sits between Sentinel-1's operational **20 m flood-product sampling** [R] and its 5 × 20 m IW acquisition [R]. Minimum mappable area is **our design choice** [E]: 1 km² = 100 pixels at 100 m GSD, ≈ 2 500 pixels at 20 m — chosen because the documented weakness of fully automated flood maps is **false alarms** [R], and patch-size filtering is the standard countermeasure. | [R]+[E] | Analysis (resolution vs feature size), Test (reference flood events) |
| **REQ-FL-04** | The ground segment shall deliver a flood map **≤ 8 h** after acquisition (stretch **≤ 3 h**). | latency **≤ 8 h** | **≤ 3 h** | GFM's audited core requirement is **within 8 h of each Sentinel-1 acquisition, met in > 99 % of cases, best case < 3 h** [R]. Copernicus on-demand SL1 targets are First Estimate 2 h / Delineation 7 h / Grading 10 h after image reception, First Available Map 3 h, with an overall **24 h from request** service aim [R]. 12 h is therefore *not* a defensible pass bar — it is worse than the automated service the mission would have to beat. | [R] | Demonstration (end-to-end timing), Analysis |
| **REQ-FL-05** | The mission shall return **≥ 3 GB/day** of products (stretch **≥ 12 GB/day** for an unselective raw-downlink architecture). | **3 GB/day** | **12 GB/day** | [D] 900 000 km² / 3 d = 300 000 km²/day; a Sentinel-1-class IW scene is 250 × 500 km = 125 000 km² and ships as a **≈ 1.2 GB** dual-pol GRD product [E, product experience] → **2.4 scenes/day ≈ 2.9 GB/day**. Downlink everything at L0 instead is ≈ 4 × that ≈ 12 GB/day. Real anchors: Sentinel-1 produces **up to 6 TB/day** and GFM processes ≈ 850 scenes/day [R]; RADARSAT-2 ≈ 460 MB per standard SLC scene [R]. CubeSat reality [E]: 1 Mb/s ≈ 0.2 GB/day, 10 Mb/s ≈ 2.4 GB/day, 50 Mb/s ≈ 12 GB/day at 4 × 10-minute contacts — so **10 GB/day is only reachable with a high-rate X-band link or onboard processing**. | [R]+[D]+[E] | Analysis (data-volume model) |
| **REQ-FL-06** | The mission shall operate for **≥ 2 years** (stretch **≥ 5 years**). | **2 yr** | **5 yr** | Two complete flood seasons are the minimum for distinguishing an annual flood from the baseline water mask, and GFM's own products depend on a multi-year **reference water mask** [R]. Anchors: Sentinel-1 design life 7 years / consumables 12 [R], NISAR baseline **3 years** [R], Sentinel-1 archive feeding flood products since 2015 [R]. | [R]+[E] | Analysis (lifetime, consumables, drag) |

**Corrected provisional value:** `data ≥ 10 GB/day` → **≥ 3 GB/day minimum, 12 GB/day for the raw-downlink variant** (the 10 GB/day figure is retained as the *unselective architecture* variant, because it is the number that makes `DATA_BOTTLENECK` fire). **`GSD ≤ 30 m`** → **≤ 100 m minimum / ≤ 25 m stretch** (30 m is a legitimate stretch, not a floor). **`latency ≤ 12 h`** → **≤ 8 h minimum / 3 h stretch** (12 h would fail against the real benchmark).

---

## 4. Scenario 3 — Greenhouse-gas (methane) plume survey

### 4.1 The need, and the distinction the game must teach

There are **two different missions** hiding inside "measure methane", and they cannot be built with the same instrument:

| | **Detection / survey mission** | **Quantification / attribution mission** |
|---|---|---|
| Question answered | *Is there a plume somewhere in this region, and how big is the region affected?* | *This specific site emits N kg/hr; here is the operator and the equipment.* |
| Instrument geometry | very wide swath, coarse pixels, spectral contrast | narrow swath, fine pixels, **very high spectral resolution** (0.1–0.3 nm) in a single methane absorption band |
| Real examples | TROPOMI (2 600 km swath, 5.5 × 7 km pixels), EMIT (70 km, 60 m), MethaneSAT (200 km, 100 × 400 m) | GHGSat (12 × 12 km scenes, 25 m, 0.3 nm), Tanager-1 (18.6–24.2 km, 30 m, 5 nm sampling), WorldView-3 CAVIS |
| Can it give a number for a single operator? | **No** — TROPOMI localises a plume to ±50 km and cannot attribute it | **Yes** — GHGSat quantified a 0.20 t/hr release to within 13 % in an independent single-blind test |

That table is the Scenario 3 lesson, and it is the reason the scenario's requirements include a **detection threshold in kg/hr** and a **quantification accuracy in %** as two separate requirements.

### 4.2 Real reference performance

| System / mission | Orbit | Instrument | GSD | Swath | Revisit | Detection / accuracy | Data & mass | Confidence |
|---|---|---|---|---|---|---|---|---|
| **GHGSat** (constellation) [R] | **≈ 500 km SSO**, 95-min period, 09:30 local descending; 10 CH4 satellites, 15 kg each | spaceborne **imaging Fabry-Pérot spectrometer**, SWIR **1630–1675 nm**, spectral resolution **0.3 nm** | **25 m** (GHGSat-D < 50 m; C1 ≈ 30 m) | **12 × 12 km field of view** (measurement domain 12 km × 15–35 km), swath < 15 km | **1–2 days with the constellation**; single satellite ≈ 2 weeks; **up to 60 observations/satellite/day** | **100 kg/hr at 50 % PoD, 3 m/s wind** (155.6 kg/hr at 90 % PoD); offshore **150–1 000 kg/hr**; column precision **1–2 % of background** | data delivered **within 24 h of overpass**; 15 kg satellite | High |
| **TROPOMI / Sentinel-5P** [R] | 824 km SSO, 13:30 LT | SWIR 2314–2382 nm (plus UV/VIS/NIR bands) | **7.0 × 7.0 km**, improved to **5.5 × 7.0 km** since 6 Aug 2019 | **≈ 2 600 km** (only the inner two-thirds usable, viewing zenith angle < 60°) | **daily global coverage** | point-source limit **≈ 4–10 t/hr** favourable conditions; plume localisation **± 50 km**; SRON ML detection found **2 974 plumes in 2021**, mean **44 t/hr** (5th–95th percentile **8–122 t/hr**); North-American minimum detectable flux **500–8 800 kg/hr/pixel** for a single overpass vs **50–1 200 kg/hr/pixel** for a year-long campaign | — | High (point-source limit: Medium) |
| **EMIT** (NASA ISS instrument) [R] | **≈ 400–415 km**, 51.6°, 16 orbits/day | imaging spectrometer, **285 bands, 380–2500 nm, 7.5 nm sampling**, 11° cross-track FOV | **60 m** | **70–75 km** | coverage ± 52° latitude; **up to 5, average 3, visits per arid target region** | point-source class **≈ 500 kg/hr**; extended mission at least through 2026 | — | High |
| **Tanager-1** (Carbon Mapper / JPL / Planet) [R] | **406–435 km SSO** | hyperspectral **400–2500 nm, 5 nm sampling, 5.5 nm FWHM**, SNR **310–655 @ 2200 nm** | **30 m** | **18.6–24.2 km** (18.2–27.5 km), swath length 18–500 km, up to ≈ 8 000 km² per scene | **≈ 7 days per satellite**; **200 000–250 000 km²/day** survey capability | **CH4 90 % probability of detection = 90–180 kg/hr** (varies with imaging mode, at 3 m/s wind, 35° solar zenith angle, 25 % albedo); plume geolocation **CE90 = 50 m**; > 8 000 published plumes | launched 16 Aug 2024 | High |
| **MethaneSAT** (EDF / New Zealand Space Agency) [R] | 565 km, 72.9° | wide-swath SWIR mapping spectrometer, **0.25 nm** resolution in **1598–1683 nm**, ≈ 3 ppb column threshold | **100 × 400 m** pixels | **200 km** | **3–4 days** on 200 × 200 km target blocks | minimum detectable flux **≈ 2–3 t/hr** (UNEP) to **≈ 10 t/hr** (UCLA primer) | launched 4 Mar 2024, **contact lost 20 Jun 2025** — mission ended after ≈ 15 months | High |
| **PRISMA** (ASI) / **EnMAP** (DLR) [R] | 619 km / 620 km | hyperspectral 400–2500 nm | **30 m** hyperspectral (PRISMA also has a 100 m panchromatic over 100 km) | **30 km** hyperspectral | **7 d / 4 d** | tasked, not a dedicated surveyor; methane retrievable from the 2300 nm band | — | High |
| **Other point-source imagers** (IEA / MEDUSA comparison tables) [R] | — | — | Sentinel-2 **20 m**, WorldView-3 **3.7 m**, Sentinel-3 **500 m**, VIIRS **750 m**, GOES ABI **≈ 2 km**, MTG FCI **≈ 1 km**, GOSAT **10 km** | Sentinel-2 290 km, EnMAP/PRISMA 30 km, WorldView-3 66 × 112 km targets | 20 m/5 d, 3.7 m/<1 d, 500 m/1 d, 750 m/<1 d, 2 km/5–10 min, 1 km/10 min, 10 km/3 d | ≈ 1 t/hr (Sentinel-2), ≈ 100 kg/hr (WorldView-3), ≈ 10 t/hr (Sentinel-3, VIIRS, TROPOMI), ≈ 100 t/hr (GOES), ≈ 30 t/hr (MTG) | — | Medium |

**The trade-off in one line** [R]: point-source imagers buy a **100 kg/hr** detection threshold by combining 20–50 m pixels with **0.1–0.3 nm** spectral resolution over a **12–15 km** swath; area mappers buy **daily global coverage** by giving the pixels away (km-scale). Instruments with a ~100 kg/hr threshold would capture an estimated **75–99 %** of point-source emissions — which is precisely why the threshold, not the picture, is the number that decides a methane mission's value.

**Empirical resolution → detection-threshold ladder** (all real values) [D, Medium]:

| Mission | Pixel area | Point-source detection threshold |
|---|---|---|
| WorldView-3 (3.7 m) | 14 m² | ≈ 100 kg/hr |
| GHGSat (25 m) | 625 m² | 100 kg/hr (50 % PoD) |
| Tanager-1 (30 m) | 900 m² | 90–180 kg/hr (90 % PoD) |
| EMIT (60 m) | 3 600 m² | ≈ 500 kg/hr |
| MethaneSAT (100 × 400 m) | 40 000 m² | ≈ 2–10 t/hr |
| TROPOMI (5.5 × 7 km) | 38 500 000 m² | ≈ 4–10 t/hr |

Rough rule for the engine **[E]**: **each 10 × increase in pixel area costs ≈ 3 × in detection threshold** at fixed instrument class — but swath, dwell time and spectral resolution can buy part of it back (MethaneSAT has 40 000 m² pixels yet beats TROPOMI by ~1000 × in pixel count per unit area, because it uses a 200 km swath with 0.25 nm spectral resolution and a much longer integration). This is a documented approximation, not a law.

### 4.3 Derived Mission Forge requirements — Scenario 3

Scenario brief parameters: target = **oil & gas production basins** (arid, high-albedo, low cloud — the same reason EMIT surveys arid regions and GHGSat/Tanager operate on those basins [R]); survey target **250 000 km²**; AOI mean cloud cover **25 %** [E].

Methane SWIR sounding additionally fails over cloud, over **sun glint** on water, and degrades over very bright or snow-covered surfaces; GHGSat, Tanager and EMIT all curate scenes on those criteria [R, Medium], so the brief's *usable-scene fraction* is lower than the raw cloud number suggests.

| ID | `shall` requirement | **MINIMUM** | **STRETCH** | Derivation | Tags | Verify by |
|---|---|---|---|---|---|---|
| **REQ-CH4-01** | The payload shall detect a point-source emission of **≥ 1 000 kg/hr (1 t/hr)**; at stretch **≥ 100 kg/hr**. | **1 000 kg/hr** | **100 kg/hr** | 100 kg/hr is GHGSat's operational 50 % PoD threshold at 3 m/s wind [R] and Tanager-1's 90 % PoD band is 90–180 kg/hr [R] — both proven with 15 kg-class and CubeSat-derived satellites. 1 000 kg/hr is the honest floor for a 100 m-pixel smallsat spectrometer (EMIT's class is ≈ 500 kg/hr at 60 m [R], TROPOMI cannot go below ~4–10 t/hr [R]). Below ~100 kg/hr nothing on orbit currently delivers, so the stretch is *already the state of the art*. | [R]+[E] | Analysis (radiometric/absorption-sensitivity budget), Test (reference releases) |
| **REQ-CH4-02** | The payload shall provide **≤ 100 m** GSD (stretch **≤ 30 m**) with a methane-absorption band at **≤ 1 nm** spectral sampling. | **100 m**, ≤ 1 nm | **30 m**, ≤ 0.3 nm | GHGSat 25 m / 0.3 nm [R], Tanager-1 30 m / 5 nm sampling [R], MethaneSAT 100 × 400 m / 0.25 nm [R], EMIT 60 m / 7.5 nm [R]. Spectral resolution is not optional: the retrieval measures the *depth of methane absorption lines* in 1630–1675 nm or 2314–2382 nm, and at ≥ 5 nm sampling the lines are smeared — that is the physical reason EMIT finds plumes but cannot price them. | [R] | Analysis (spectral budget), Test (cell/flow reference) |
| **REQ-CH4-03** | The mission shall revisit each survey target **at least once per 7 days**; at stretch **once per 2 days**; and shall map **≥ 250 000 km² at least twice** during the mission (stretch **2 000 000 km²**). | revisit **≤ 7 d**, 250 000 km² × 2 | **≤ 2 d**, 2 000 000 km² × 2 | 7 d is Tanager-1's own per-satellite revisit [R]; 1–2 d is GHGSat's constellation revisit [R]; MethaneSAT's design value was 3–4 d [R]. Survey area: Tanager-1's stated capability is **200 000–250 000 km²/day** [R], so 250 000 km² is deliberately set as *one day of a Tanager-class mission* — a CubeSat must earn it over months, which is what makes swath-vs-resolution bite. | [R]+[D] | Analysis (coverage schedule), Demonstration |
| **REQ-CH4-04** | The ground segment shall report a **quantified emission rate**, not only a detection, for **≥ 60 %** of detected sources (stretch **≥ 90 % with ± 15 % accuracy**), and shall deliver data **≤ 24 h** after the observation. | 60 % quantified, ≤ 24 h | 90 %, ± 15 %, ≤ 6 h | Quantification anchor: GHGSat's independent single-blind trial quantified a **0.20 t/hr** release to within **13 %** [R]; column precision is 1–2 % of background [R]. Detection-only anchor: TROPOMI localises to **± 50 km** and cannot attribute a source [R] — a TROPOMI-like design therefore **fails REQ-CH4-04 even if it passes REQ-CH4-01**. Latency: GHGSat delivers **within 24 h of overpass** [R]. | [R]+[E] | Test (blind quantification exercise), Demonstration (latency run) |
| **REQ-CH4-05** | The mission shall return **≥ 8 GB/day** of data (stretch **≥ 30 GB/day**). | **8 GB/day** | **30 GB/day** | [D] 250 000 km² at 40 m GSD = 1.6 × 10⁸ pixels; with 100 spectral samples at 16-bit (200 B/pixel) that is **31 GB per full survey pass**; over a 2-year mission with a 7-day revisit (≈ 100 passes covering 250 000 km² twice) that averages **≈ 4.4 GB/day**, so 8 GB/day is the minimum with margin. Real anchors: Sentinel-1-class missions produce **up to 6 TB/day** [R]; GHGSat's 12 × 12 km scenes at 25 m with 0.3 nm sampling are tens of MB each with **up to 60 scenes/day** ≈ **1–2 GB/day** [D from [R]]; FireSat's per-satellite delivery is **700 GB/day** [R]. | [R]+[D]+[E] | Analysis (data-volume model) |
| **REQ-CH4-06** | The mission shall operate for **≥ 2 years** (stretch **≥ 5 years**). | **2 yr** | **5 yr** | A plume is transient: verifying whether a source was repaired needs repeat visits across months, which is why MethaneSAT's own plan used multi-year campaigns and why year-long TROPOMI campaigns push the detectable flux from 500–8 800 down to **50–1 200 kg/hr/pixel** [R]. Cautionary real case for the game: **MethaneSAT lost contact 15 months after launch** — `LIFETIME_SHORT` is a real failure mode, not an invented one [R]. | [R]+[E] | Analysis (drag, consumables, funding/lifetime) |

**Corrected provisional values:** `GSD ≤ 40 m` → confirmed as a legitimate value **between** our minimum (100 m) and stretch (30 m); we store **MIN 100 m / STRETCH 30 m** and use 40 m as the mid-tier "good design" marker. `EMIT 170 km swath, 30 m GSD` → **incorrect: EMIT is 70–75 km swath at 60 m GSD**; the 30 m / 18.6–24.2 km figures belong to **Tanager-1**. `cloud 30 %` → **25 %** for arid basin targets. Added the two requirements the provisional list was missing: **detection threshold (kg/hr)** and **quantification accuracy (%)** — without them Scenario 3 cannot distinguish a survey mission from a quantification mission.

---

## 5. Verification model (how the simulator decides MET / PARTIALLY MET / NOT MET)

### 5.1 What NASA requires of a requirement

- Each requirement is a **`shall` statement with a measurable threshold**, and each is paired with a planned verification method [R, High] ("Design and Develop Science Missions", §Define Requirements).
- **Verification = proof of compliance with each `shall` statement**, by **test, analysis, inspection, or demonstration** (NPR 7123.1) [R, High].
- The **Science Traceability Matrix** ties needs → goals → objectives → requirements → investigations → measurements [R, High]; a requirement that cannot be traced to a measurement is not a requirement.
- Where flight heritage exists, compliance may be shown by **similarity / backflight** rather than new test — this is standard practice and is the mechanism we use for "your design resembles X".

### 5.2 Mission Forge verification statements

Every requirement in §2–§4 gets a `given / when / then` contract. Format (this is exactly what the engine stores):

```ts
{
  id: "REQ-WF-01",
  shall: "revisit <= 24 h over AOI",
  given: { aoisqm: 400_000, satellites: 1, altitudeKm: 525, inclinationDeg: 97.5 },
  when:  "the orbit ground track is propagated for 30 days",
  then:  { maxIntervalHours: 24 },
  method: "analysis",           // analysis | test | demonstration | inspection | similarity
  segment: "space",
  minimum: 24, stretch: 4, unit: "hours"
}
```

Worked examples:

| ID | given | when | then | Method |
|---|---|---|---|---|
| REQ-WF-01 | 1 satellite, 525 km, 97.5° SSO | propagate ground track 30 d over the AOI | worst-case gap ≤ 24 h | **analysis** |
| REQ-WF-03 | 4 µm band, 100 m GSD, 300 K background | a 1 ha fire at 600 K appears in one pixel | pixel passes the absolute test (T4 ≥ 320 K at night) **and** the contextual test (ΔBT45 > 10 K) | **similarity** to the VIIRS/MODIS algorithm |
| REQ-WF-04 | contact schedule 4 × 10 min/day | an observation occurs at the worst phase | product timestamp ≤ 6 h after observation | **analysis**, confirmed by **demonstration** in the timeline |
| REQ-FL-01 | payload = optical imager | AOI cloud fraction = 60 % (stress 90 %) | ≥ 1 usable observation per 3-day window cannot be guaranteed | **analysis** → **hard NOT MET** |
| REQ-FL-04 | downlink + processing chain | acquisition completes | flood-map timestamp ≤ 8 h after acquisition | **demonstration** |
| REQ-CH4-01 | 100 m pixel, 0.5 nm sampling | a 1 t/hr source under 3 m/s wind | probability of detection ≥ 50 % | **analysis** (radiometric budget), benchmarked against GHGSat's published 50 %/90 % PoD curve |
| REQ-CH4-04 | plume detected | operator asks for the rate | a number with an uncertainty is produced | **test** (blind quantification analogue) — detection-only instruments fail |

### 5.3 The three verdict bands

Weights and bands below are **Mission Forge design choices [E]**, not NASA formulas. They are declared as such in the README and on the results screen.

```
For every requirement i:
  capability c_i = measured performance of the player's design
  score_i  = 0                                    if c_i fails the MINIMUM          (or a GATE fails)
           = clip( ln(c_i / min_i) / ln(stretch_i / min_i), 0, 1 )   otherwise
             (invert c_i for lower-is-better metrics: use ln(min_i / c_i) / ln(min_i / stretch_i))
```

| Band | Rule | What the results screen says |
|---|---|---|
| **MET** | every hard gate passes **and** every requirement ≥ its MINIMUM **and** science value ≥ 70 | "Requirements verified. Your design resembles *<real mission>*." List each requirement with its method and evidence. |
| **PARTIALLY MET** | no hard gate failed, ≥ 60 % of requirements ≥ MINIMUM, science value 40–69 | "Verified with limitations." Name each unmet requirement, the specific margin that failed, and the repair. Maps to the plan's `SUCCESS WITH LIMITATIONS` / `PARTIAL`. |
| **NOT MET** | any hard gate failed **or** science value < 40 **or** any feasibility gate fails | "Requirement not verified: <REQ-ID>. Cause: <failure mode>. Cheapest repair: <named change>." |

Two rules that keep the verdict honest:

1. **A gate is never averaged away.** `REQ-FL-01` (all-weather) is a gate. An optical flood mission with a beautiful 5 m imager scores `NOT MET`, and the diagnosis names cloud cover with the real numbers (55 % land / 67 % global / 90 %+ monsoon).
2. **A requirement can be MET while the mission is not buildable.** Verification of requirements and feasibility of the design are separate checks (`SCIENCE_REQUIREMENT_UNMET` vs `POWER_DEFICIT`, `DATA_BOTTLENECK`, `LAUNCH_INCOMPATIBLE`). A design that meets every science requirement but has a −40 W power budget is `NOT MET` on feasibility and must be reported that way, not as a science success.

---

## 6. Science value rubric (0–100, with diminishing returns)

### 6.1 Why the scaling is logarithmic

Three published facts drive the shape of this rubric [R]:

1. **Fire:** going from MODIS 1 km to VIIRS 375 m to FireSat 80 m produces *successively smaller* marginal gains for fire managers, and the last step (80 m → 5 m detectable) required an entirely new 50-satellite constellation [R].
2. **Flood:** a 12-day revisit observes ≈ 20 % of flood events, a 1–3-day revisit observes most of them [R, Medium]. Going finer than 20 m does **not** improve the emergency product at all — GFM deliberately samples its flood maps at **20 m** while the raw data is 5 × 20 m [R].
3. **Methane:** the value is set by the **detection threshold in kg/hr**, not by the picture: a 100 kg/hr instrument captures an estimated **75–99 %** of point-source emissions, so squeezing from 100 to 50 kg/hr buys only a few percent of real emissions [R].

Meanwhile, hardware cost grows roughly **linearly** (aperture mass, antenna area, generator watts, downlink watts), while value grows **logarithmically**. Score ∝ log(capability), cost ∝ capability ⇒ over-specifying always loses. That is the mathematical statement of the challenge's own trade-off requirement, and it is what produces the plan's pillar *"there is no single optimal build"*.

### 6.2 The formula (implement exactly this)

```
score_i(x) = 0                                                   if x fails the MINIMUM  (or a gate fails)
           = clip( ln( x / min_i ) / ln( stretch_i / min_i ), 0, 1 )      for higher-is-better metrics
           = clip( ln( min_i / x ) / ln( min_i / stretch_i ), 0, 1 )      for lower-is-better metrics (GSD, revisit, latency, threshold)

SCIENCE_VALUE = Σ_i  weight_i × score_i(x_i)          → 0…100
```

Properties the engine must preserve:

- **Equal multipliers earn equal points.** 1 × → 2 × the requirement earns exactly as much as 2 × → 4 ×.
- **Credit stops at the stretch** (`clip(..., 0, 1)`). Spending mass and watts beyond the stretch is worth **zero** science points — the design is over-engineered, and the results screen must say so.
- **Nothing is worth points below the minimum.** A requirement you do not meet contributes 0, not a small positive number.

### 6.3 Worked example — Scenario 1, resolution dimension (weight 25, min 100 m, stretch 30 m)

| Your GSD | 100 m | 80 m | 60 m | 45 m | 30 m | 20 m |
|---|---|---|---|---|---|---|
| score_i | 0.00 | 0.19 | 0.42 | 0.66 | 1.00 | 1.00 |
| points of 25 | **0** | **4.6** | **10.6** | **16.6** | **25** | **25** |

Read the row: **100 → 80 m is worth 4.6 points; 45 → 30 m is worth 8.4 points; below 30 m is worth nothing** — while aperture mass roughly doubles between those two designs.

### 6.4 Worked example — Scenario 1, revisit dimension (weight 25, min 24 h, stretch 4 h)

| Your revisit | 24 h | 12 h | 6 h | 4 h | 2 h |
|---|---|---|---|---|---|
| score_i | 0.00 | 0.39 | 0.77 | 1.00 | 1.00 |
| points of 25 | **0** | **9.7** | **19.4** | **25** | **25** |

### 6.5 Weights per scenario (**Mission Forge design choice [E]**)

Weights sum to 100 and are stored in the scenario data file so a reviewer can audit or change them.

| Scenario | Dimension | Weight | Requirement it scores |
|---|---|---|---|
| **1 Wildfire** | Thermal GSD | **25** | REQ-WF-02 |
| | Revisit | **25** | REQ-WF-01 |
| | Detection sensitivity + false-alarm rate | **20** | REQ-WF-03 (+ REQ-WF-06 band completeness) |
| | Product latency | **15** | REQ-WF-04 |
| | Swath / coverage of the 400 000 km² target | **10** | REQ-WF-01 geometry |
| | Mission duration | **5** | REQ-WF-07 |
| **2 Coastal flood** | Revisit | **30** | REQ-FL-02 |
| | Product latency | **25** | REQ-FL-04 |
| | GSD | **20** | REQ-FL-03 |
| | Coverage of the 900 000 km² AOI | **10** | brief parameter |
| | Minimum mappable inundated area | **10** | REQ-FL-03 |
| | Mission duration | **5** | REQ-FL-06 |
| | *All-weather imaging* | **gate** | REQ-FL-01 (pass/fail, not weighted) |
| **3 Methane** | Point-source detection threshold (kg/hr) | **30** | REQ-CH4-01 |
| | Quantification completeness / accuracy | **20** | REQ-CH4-04 |
| | GSD | **15** | REQ-CH4-02 |
| | Revisit + surveyed area | **15** | REQ-CH4-03 |
| | Spectral resolution | **10** | REQ-CH4-02 |
| | Mission duration | **10** | REQ-CH4-06 |

Two cross-cutting deductions, applied as *penalties* rather than weights [E]:

- **Cloud exposure penalty**: if the design has no all-weather capability and the scenario's cloud assumption exceeds 40 %, multiply the coverage dimension by `(1 − cloud)`. Scenario 1 tolerates this (a single hot pixel passes the absolute tests through moderate cloud, and geostationary feeds gap-fill); Scenario 2 does not tolerate it at all — it is a gate.
- **Lifetime penalty**: if `LIFETIME_SHORT` fires, multiply the duration dimension by the fraction of the required duration actually achieved. MethaneSAT is the real-world exhibit [R].

### 6.6 Mapping rubric → verdict

| Science value | Requirements | Verdict |
|---|---|---|
| ≥ 70 | all MET, no gate failed | **MET** (`SUCCESS`) |
| 40–69 | ≥ 60 % MET | **PARTIALLY MET** (`SUCCESS WITH LIMITATIONS` / `PARTIAL`) |
| < 40, or any gate failed | — | **NOT MET** (`FAILURE`) |

Bands 70 / 40 / 60 % are **[E]** design choices, stated as such on the results screen.

---

## 7. Real-mission mirror table (drives the "your design resembles …" screen)

All values [R]; data-volume column shows what the mission actually returns, and where a mission does not publish a simple daily figure the cell is `—`. **Mass/power cells are instrument-level where published and spacecraft-level otherwise; cells marked `≈` are approximate (Low confidence) and are listed in §10.**

### 7.1 Scenario 1 — fire

| Mission | Agency | Orbit / altitude | Inclination | Instrument | GSD | Swath | Revisit | Data volume | Mass / power |
|---|---|---|---|---|---|---|---|---|---|
| Terra / Aqua **MODIS** | NASA | SSO 694 / 705 km | 98.2° | 36-band imager, 4 µm + 11/12 µm fire bands | **1 km** fire pixel (250 m–1 km image bands) | **2 330 km** | 16-d ground track, ≈ 2 looks/day | **10.6 Mb/s** L1 | instrument **82 kg / ≈ 155 W** |
| **VIIRS** (SNPP, NOAA-20/21) | NASA/NOAA | SSO 824–830 km | 98.7° | 22-band radiometer, I4/I5 + M13/M15 | **750 m** / **375 m** | **3 060 km** | ≥ 6 views/day (8–9 CONUS, 16–20 Alaska) | **≈ 5.9 Mb/s**; 0.41 GB/day per 375 m NRT product | spacecraft 2 185 kg |
| **GOES-16/-18 ABI** | NOAA | **GEO** 35 786 km | 0° | 16-band ABI, band 7 + 14 | **2 km** fire product | full disk | **10 min FD / 5 min CONUS / 60 s mesoscale** | 100 Mb/s broadcast | 5 200 kg / ≈ 2 700 W |
| Himawari-9 AHI / MTG FCI | JAXA / EUMETSAT | GEO | 0° | 16-band imager | 2 km → **1 km** | full disk | 10 min | — | — |
| **Sentinel-3 SLSTR** | ESA/CNES | SSO 1 400 km | 98.6° | VIS–SWIR + IR, FRP | **1 km IR / 500 m VIS** | **1 400 km + 740 km oblique** | **1.0 d (0.5 d dual)** | **64 Mb/s** | 1 150 kg / payload ≈ 150 kg, ≈ 100 W |
| **Landsat 8/9 TIRS** | USGS/NASA | SSO 705 km | 98.2° | 2-band TIR (10.6–11.2, 11.5–12.5 µm) | **100 m native → 30 m products** | **185 km** | 16 d / **8 d paired** | 150 Mb/s X-band | ≈ 8 800 kg spacecraft / ≈ 390 W TIR payload |
| **ECOSTRESS** | NASA | ISS 410 km | **51.6°** | 7-band TIR | **70 m LST** | ≈ 70 km | 1–5 d | — | 315 kg / ≈ 300 W |
| **FireSat** | Earth Fire Alliance / Muon Space | SSO **600 km** | ≈ 97.9° | 6-channel red/NIR/SWIR/2 × MWIR/LWIR | **80 m avg**, 5 × 5 m detectable | **1 500 km** | 12 h (3 sats) → **1 h (≈ 20 sats)** → 20 min (≈ 50 sats) | **700 GB/day per satellite** | > 200 kg bus / **200 W** payload |

### 7.2 Scenario 2 — flood

| Mission | Agency | Orbit / altitude | Inclination | Instrument | GSD | Swath | Revisit | Data volume | Mass / power |
|---|---|---|---|---|---|---|---|---|---|
| **Sentinel-1 IW** | ESA | SSO 693 km | **98.18°** | C-band 5.405 GHz TOPSAR, dual-pol | **5 × 20 m** raw, **10 m** GRD | **250 km** | 12 d / **6 d pair**; 1–3 d Europe | **≤ 6 TB/day**; X-band 2 × 260 Mb/s; 1 410 Gbit storage | 2 300 kg / **5 900 W** EOL |
| Sentinel-1 EW | ESA | same | same | same | 20 × 40 m | **410 km** | better than IW | same | same |
| **Sentinel-1 SM** | ESA | same | same | same | **5 × 5 m** | **80 km** | tasked only | same | same |
| **RADARSAT-2** | **CSA** | dawn-dusk 798–800 km | 98.6° | C-band 5.4 GHz | 100 → **1 m** (mode-dependent) | **500 km** max | 24 d exact repeat, 2–3 d equatorial, daily polar | ≈ 460 MB per standard SLC scene | 2 660 kg / 4 700 W |
| **RADARSAT Constellation** | **CSA** | dawn-dusk 582 km × 3 | 97.1° | C-band, 7 modes | 100 → 3 m | 500 → 20 km | **daily over Canada** | — | 550 kg each / 1 500 W |
| **ALOS-2 PALSAR-2** | JAXA | SSO 628 km | 97.9° | **L-band 1 257.5 MHz** | 100 → 1 m | **350–490 km** ScanSAR | **14 d** | X-band 800 Mb/s | 1 700 kg / 1 000 W |
| **NISAR** | NASA + ISRO | near-SSO 747 km | 98.4° | **L + S band** SAR | 7 m az / 3–48 m range (L) | **> 240 km** | 12 d exact, ≈ 6 d average | 9 Tbit recorder, **3.5 Gb/s Ka** | 875 kg / ≈ 2 600 W |
| **SWOT** | NASA / CNES | 855 km | 78.2° | KaRIn interferometer 35.75 GHz | rivers **> 100 m**, lakes **> 250 m**; ± 10 cm elevation | **120 km** | 21 d repeat, ≈ 11 d average | **≈ 4 GB/s** raw | 2 198 kg / 1 700 W |
| **ICESat-2** | NASA | 500 km | **92°** | 532 nm photon-counting lidar | **11 m footprint**, 0.7 m spacing | footprint only | **91 d** repeat | — | 1 983 kg / ≈ 2 000 W |
| **GFM product** (Copernicus) | ESA/JRC | uses S-1 | — | automated SAR flood mapping | **20 m sampling** | global except poles | 1–3 d Europe, 3–6 d with S1C | ≈ 250 TB archive since 2015 | **< 8 h** latency |

### 7.3 Scenario 3 — methane

| Mission | Agency | Orbit / altitude | Inclination | Instrument | GSD | Swath | Revisit | Detection / accuracy | Data |
|---|---|---|---|---|---|---|---|---|---|
| **GHGSat** | GHGSat Inc. | SSO ≈ 500 km | ≈ 97° | Fabry-Pérot imaging spectrometer, 1630–1675 nm, **0.3 nm** | **25 m** | **12 × 12 km** | **1–2 d** (constellation), 60 looks/day/sat | **100 kg/hr @ 50 % PoD**, 155.6 @ 90 %; 1–2 % column precision | **≤ 24 h** delivery |
| **Tanager-1** | Carbon Mapper / JPL / Planet | SSO 406–435 km | ≈ 97° | 400–2500 nm hyperspectral, **5 nm** sampling | **30 m** | **18.6–24.2 km** | **≈ 7 d** | **90–180 kg/hr @ 90 % PoD**, CE90 **50 m** | 200 000–250 000 km²/day |
| **EMIT** | NASA (ISS) | 400–415 km | **51.6°** | 285-band imaging spectrometer, **7.5 nm** | **60 m** | **70–75 km** | 3–5 visits per arid region | ≈ 500 kg/hr class | 16 orbits/day |
| **MethaneSAT** | EDF / NZSA | 565 km | 72.9° | mapping spectrometer, 1598–1683 nm, **0.25 nm** | **100 × 400 m** | **200 km** | **3–4 d** | **2–10 t/hr** | lost contact 20 Jun 2025 |
| **TROPOMI** (Sentinel-5P) | ESA/CNES | SSO 824 km | 98.7° | SWIR 2314–2382 nm | **5.5 × 7.0 km** | **2 600 km** | **daily global** | ≈ 4–10 t/hr, localisation **± 50 km** → **cannot quantify a source** | — |
| **PRISMA** | ASI | SSO 619 km | 97.9° | 400–2500 nm hyperspectral | **30 m** | 30 km | 7 d | tasked | — |
| **EnMAP** | DLR | SSO 620 km | 97.9° | 400–2500 nm hyperspectral | **30 m** | 30 km | 4 d | tasked | — |

### 7.4 Band-to-mission lookup for the results screen (**[E]** band edges, real anchors)

| Design lands in this band | Screen says "your design resembles" | Why the comparison is defensible |
|---|---|---|
| GSD ≥ 1 km, revisit ≤ 1 d, 4 µm + 11 µm bands | **Terra/Aqua MODIS (2000–present)** | 1 km fire pixel, 2 330 km swath, ≈ 2 looks/day |
| GSD 375–750 m, revisit ≤ 1 d | **Suomi NPP / NOAA-20 VIIRS** | exactly the 750 m and 375 m product tiers |
| GSD 80–100 m, revisit ≤ 24 h | **FireSat Initial Operational Capability (2026)** / Landsat TIRS thermal tier | FireSat 80 m average, 1 500 km swath, twice-daily IOC |
| GSD ≤ 80 m, revisit ≤ 4 h | **FireSat full constellation (≈ 20–50 satellites)** | 1 h at ≈ 20 sats, 20 min at ≈ 50 sats |
| revisit ≤ 10 min, GSD ≥ 1 km | **GOES-R ABI / Himawari AHI / MTG FCI** | 10 min full disk, 2 km → 1 km fire product; cadence won, resolution lost |
| GSD 100 m, swath ≥ 350 km, ≤ 14 d | **RADARSAT-2 ScanSAR Wide / ALOS-2 ScanSAR** | 100 m @ 500 km; 100 m @ 350 km |
| GSD 50 m, swath ≈ 300 km, ≤ 3 d | **RADARSAT-2 ScanSAR Narrow** | 50 m @ 300 km |
| GSD 10–25 m, swath ≈ 250 km, ≤ 6 d | **Sentinel-1 IW / Copernicus GFM** | 5 × 20 m acquired, 10 m GRD, 20 m flood product, < 8 h latency |
| GSD ≤ 5 m, swath ≤ 80 km | **Sentinel-1 StripMap / RADARSAT-2 Ultra-Fine** | 5 × 5 m @ 80 km; 3 m @ 20 km |
| swath ≈ 120 km, elevation measurement, ≤ 21 d | **SWOT** | rivers > 100 m, lakes > 250 m, ± 10 cm |
| GSD 5–10 km swath, revisit ≥ 30 d | **ICESat-2** | 11 m footprints, 91-day repeat |
| GSD ≤ 7 km, swath ≥ 1 000 km, daily, no quantification | **TROPOMI / Sentinel-5P** | 5.5 × 7 km, 2 600 km, daily, ± 50 km |
| GSD 60 m, swath ≈ 70 km, ≥ 7.5 nm sampling | **EMIT (ISS, 2022–2026+)** | 60 m, 70–75 km, 285 bands |
| GSD 30 m, swath 20 km, 5 nm, ≤ 7 d, ≥ 100 kg/hr | **Tanager-1 (Carbon Mapper, 2024–)** | 30 m, 18.6–24.2 km, 90–180 kg/hr @ 90 % PoD |
| GSD 25 m, swath 12 km, ≤ 0.3 nm, 1–2 d, 100 kg/hr | **GHGSat constellation** | exact instrument geometry and threshold |
| GSD 100 × 400 m, swath 200 km, ≤ 0.25 nm, 3–4 d | **MethaneSAT (2024–2025)** | exact design values of the mission that failed early |

---

## 8. Plain-language explainers (UI ⓘ text, readable at ~14 years)

### 8.1 Scenario 1 — Wildfire monitoring

**What the mission is for.** A wildfire starts small — sometimes smaller than a football field. A satellite that sees the whole Earth in squares 1 kilometre wide simply cannot see it, because the fire only warms a tiny part of that square. We need a satellite that takes smaller pictures and comes back more often, so a fire is found while it is still small enough to put out.

**How the satellite actually finds a fire.** It does not take a photo of flames. It measures how hot each patch of ground looks in two special kinds of light: mid-infrared (about 4 µm), which hot things glow in, and thermal infrared (11–12 µm), which tells the satellite how hot the ground around it is. A patch counts as fire only if it is much hotter than absolute thresholds **and** much hotter than its neighbours.

**Why "how fast you get the map" matters as much as "how good the picture is".** A perfect map that arrives 10 hours late describes a fire that has already moved 10 kilometres.

> **The trade-off, in one sentence:** a wider picture can be retaken every few minutes (that is what weather satellites in fixed positions do — every 10 minutes, but only in 1–2 km squares), while a sharp picture needs a fast, low satellite that only passes overhead once or twice a day, so you either buy speed or detail, never both with one satellite.

### 8.2 Scenario 2 — Coastal flood mapping

**What the mission is for.** When a river or the sea floods a coast, rescue teams need to know which roads, fields and towns are under water within hours. Satellites can map this, but floods happen while it is raining, and rain means clouds — and a camera cannot see through clouds.

**Why radar instead of a camera.** Radar sends its own microwave signal down and listens to what bounces back, so it works at night and straight through cloud and rain. Water looks very dark to radar, so flooded areas stand out clearly against dry land. That is why Europe built a radar mission and runs an automatic flood map that is finished **within 8 hours** of every pass, and why Canada flies three radars so no place waits long for a picture.

**Why more often beats sharper here.** A 5-metre picture that arrives once a fortnight misses most floods entirely; a 100-metre picture every two days catches them.

> **The trade-off, in one sentence:** radar needs a lot of electricity and a big antenna, and it produces a huge amount of data, so making the pictures sharper usually means covering a narrower strip — you spend the same watts on detail or on width, and the game forces that choice.

### 8.3 Scenario 3 — Methane plume survey

**What the mission is for.** Methane is a very strong greenhouse gas, and most of it comes from a small number of specific places: wells, pipelines, landfills, mines. A satellite can spot the gas from orbit, and a good satellite can even say how many kilograms per hour a single leak is releasing.

**What the satellite really looks at.** Sunlight bounces off the ground and passes through the atmosphere on its way up. Methane removes a very thin, specific slice of that light (around 1.65 or 2.3 µm). The satellite compares that slice with the slices next to it: more missing light = more gas.

**Detection versus counting.** Some satellites cover huge areas and can say *"there is gas here"* but cannot say who is leaking or how fast (Sentinel-5P maps the whole planet every day but each pixel is 5.5 × 7 km, so a single leak is smeared out). Other satellites stare at one small area with an extremely precise instrument (GHGSat's 25 m squares) and can give a number — GHGSat measured a leak of 0.20 tonnes per hour and was right within 13 % in a blind test.

> **The trade-off, in one sentence:** the smaller the square the satellite measures, the less light it collects, so a satellite that can find a tiny leak must cover a tiny area — widening the strip is what makes the mission useful across a whole oil field but blind to small leaks.

### 8.4 Concept cards (shared ⓘ text for all three scenarios)

| Concept | Plain-language sentence | Trade-off sentence |
|---|---|---|
| **Resolution (GSD)** | One pixel is a square on the ground. A 100 m pixel is a square 100 m on a side — about one football field. | Smaller pixels mean more data, more power, and a bigger lens or antenna. |
| **Swath** | The width of the strip the satellite photographs on each pass, like a lawn mower's blade. | Wide swath + fine detail is physically the hardest combination in Earth observation. |
| **Revisit** | How long you wait to look at the *same* place again. | More revisits need either a wider swath, a different orbit, or several satellites — which costs money and mass. |
| **Sun-synchronous orbit** | An orbit that passes over the same place at the same local time of day, so pictures can be compared. | It constrains which orbits are available, and therefore which launch vehicle and how much energy you need. |
| **Altitude** | Lower means sharper pictures but more atmosphere dragging on the satellite. | Lower altitude shortens lifetime (`LIFETIME_SHORT`) and increases station-keeping fuel. |
| **Why 4 µm and 11–12 µm for fire** | Hot things glow in mid-infrared; the ground itself glows in thermal infrared, so you need both to tell a fire from hot rock or a hot roof. | The 4 µm detector must be cooled, and 4 µm detectors cost mass, power and money. |
| **False alarms** | If a satellite reports a hundred fires and ninety are wrong, fire crews stop trusting it. | Stricter thresholds cut false alarms but also cut real small fires. |
| **Cloud cover** | Clouds cover about two-thirds of Earth on average, and about half of the land. | Cameras fail under cloud; radar does not care, but radar is heavy and power-hungry. |
| **Data (GB/day)** | Every picture has a size, and the satellite must throw all of it down to antennas before the pictures are pushed out of its memory. | Sharper or wider instruments produce data faster than your radio can send it (`DATA_BOTTLENECK`, `STORAGE_SATURATED`). |
| **Downlink window** | A ground station can only talk to a satellite for a few minutes as it flies overhead — typically 4–8 times a day. | More ground stations or bigger antennas cost money; on-board processing costs mass and power but sends far less data. |
| **Power budget** | Solar panels only make power in sunlight, and a satellite spends about 35 % of each orbit in Earth's shadow. | Every extra instrument watt needs more panel area, which is mass, which is launch cost. |
| **Duty cycle** | The instrument cannot be on the whole orbit; real radars image for only 25–30 minutes of a 98-minute orbit. | The minutes you are allowed to look decide how wide an area you can actually cover. |
| **Mass ↔ launcher** | Heavier satellites need a bigger rocket, and a bigger rocket costs more. | `LAUNCH_INCOMPATIBLE` is the game's simplest failure: your satellite is heavier than the rocket can lift to the orbit you chose. |
| **Latency** | Time between "the satellite saw it" and "the rescue team has the map". Copernicus aims for 8 hours; the slowest useful target is 24 hours. | Fast delivery needs a nearby ground station and automatic processing — both cost money. |
| **Detection threshold (methane)** | The smallest leak a satellite can be sure about, in kilograms per hour. GHGSat can see 100 kg/hr; Sentinel-5P cannot see below a few tonnes per hour. | Reaching a lower threshold needs either smaller pixels or a much more precise spectrometer — never both for free. |

---

## 9. Source list (with confidence)

Confidence = **High** for agency mission pages, user guides, ATBDs, fact sheets and peer-reviewed papers read directly; **Medium** for secondary/aggregated figures or figures quoted from a paper's summary; **Low** for approximate mass/power values and figures we rounded.

### 9.1 Cross-cutting — systems engineering & verification

| # | Source | URL | Conf. |
|---|---|---|---|
| S1 | NASA Small Sat Institute Systems Engineering Webinar, **"Design and Develop Science Missions"** (Julie Levri, 26 Mar 2025) — process flow, four mission segments, numeric `shall` requirements paired with verification methods | https://www.nasa.gov/wp-content/uploads/2025-04-250323-design-and-develop-science-mission.pdf · NTRS: https://ntrs.nasa.gov/api/citations/20250002492/downloads/Design%20and%20Develop%20Science%20Mission_03262025.pdf | **High** |
| S2 | NASA Systems Engineering Handbook, SP-2016-6105 Rev 2 | https://ntrs.nasa.gov/citations/20170007238 | **High** |
| S3 | NPR 7123.1 (NASA requirements & verification: compliance proven by test, analysis, inspection, demonstration) | https://www.nasa.gov/wp-content/uploads/2024/11/se-requirements-and-testing-2024-final.pdf | **High** |
| S4 | NASA SE series landing page (needs / goals / objectives, Science Traceability Matrix) | https://ntrs.nasa.gov/api/citations/20170007238/downloads/20170007238.pdf · https://www.nasa.gov/smallsat-institute/systems-engineering-series | **High** |

### 9.2 Scenario 1 — fire

| # | Source | URL | Conf. |
|---|---|---|---|
| F1 | **MODIS Collection 6 / 6.1 Active Fire User Guide** — 1 km fire pixels, band use, commission error | https://landweb.modaps.eosdis.nasa.gov/data/userguide/MODIS_C6_C6.1_Fire_User_Guide_1.0.pdf | **High** |
| F2 | **Giglio et al. 2016**, MODIS C6 fire algorithm ATBD — T4 ≥ 360 K / ≥ 320 K, contextual tests, 1.2 % vs 2.4 % commission error | https://www.earthdata.nasa.gov/sites/default/files/imported/Giglio2016_C6_Fire.pdf | **High** |
| F3 | **VIIRS Collection 2 Active Fire 375 m User Guide** — I4/I5 thresholds, 320 K / 325 K / 295 K, ΔBT45 tests, saturation 367 K, < 1.2 % commission, 3 ×/25 × pixel counts | https://www.earthdata.nasa.gov/s3fs-public/2025-06/VIIRS_C2_AF-375m_User_Guide_1.2.pdf | **High** |
| F4 | **VIIRS Active Fire 375 m ATBD** | https://viirsland.gsfc.nasa.gov/PDF/VIIRS_activefire_375m_ATBD.pdf | **High** |
| F5 | **NOAA JPSS NDE VIIRS Active Fire ATBD v2.6** — M13 3.973–4.128 µm, M15 10.263–11.263 µm, T13 > 360 K / > 320 K | https://www.star.nesdis.noaa.gov/jpss/documents/ATBD/ATBD_NDE_AF_v2.6.pdf | **High** |
| F6 | **VIIRS land NRT product table** — granule 6 min, ≈ 2 MB/file, 240 files/day, 0.41 GB/day (375 m), 0.15 GB/day (JPSS-2 750 m), **latency 30 min – 2 h** | https://modaps.modaps.eosdis.nasa.gov/services/about/products/viirs-land-c2-nrt/vnp14imgtdl_nrt.html · https://nrt3.modaps.eosdis.nasa.gov | **High** |
| F7 | **GOES-16 ABI Fire & Hot Spot (Full) read-me** — 2 km product, band 7 + 14, confidence codes 10/30, 11/31, 15/35 | https://origin-east-www-ospo.woc.noaa.gov/operations/goes/product-quality-overview/ps-pvr/goes-16/ABI/Fires%20and%20Hot%20Spots%20Characterization/Full/GOES-16_ABI_L2_FireHotSpot_Full_ReadMe.pdf | **High** |
| F8 | **ABI Fire Detection & Characterization ATBD** — 266 s mesoscale / 806 s full-disk latency; Full Disk 10 min, CONUS 5 min, Mesoscale 60 s | https://www.star.nesdis.noaa.gov/atmospheric-composition-training/documents/ABI_FDC_ATBD.pdf | **High** |
| F9 | **NASA Earthdata: geostationary fire data in FIRMS** (≈ 30 min post-observation; GOES/Himawari/Meteosat cadence 5–15 min, 2–3 km) | https://www.earthdata.nasa.gov/news/blog/geostationary-active-fire-detection-data-firms | **High** |
| F10 | **MODIS instrument/mission characteristics** (2 330 km swath, 10.6 Mb/s, 16-day repeat, 36 bands; Terra/Aqua altitudes & local times, including the local-time drift) | https://modaps.modaps.eosdis.nasa.gov/services/about/products/modis-c2/index.html · https://earthdata.nasa.gov | **High** (local-time drift **Medium**) |
| F11 | **VIIRS instrument characteristics** (3 060 km swath, M/I bands, revisit ≥ 6 views/day, 8–9 CONUS, 16–20 Alaska) | https://npp.gsfc.nasa.gov/viirs.aspx · https://www.earthdata.nasa.gov/data/instruments/viirs | **High** (5.9 Mb/s **Medium**) |
| F12 | **Sentinel-3 SLSTR mission page** (1 400 km + 740 km swath, 1 km IR / 500 m VIS, 27-day cycle, 1.0/0.5 d revisit, 64 Mb/s, FRP, 650 K) | https://sentinels.copernicus.eu/web/sentinel/missions/sentinel-3 | **High** (payload mass/power **Medium**) |
| F13 | **Landsat 8/9 TIRS product specs** (100 m TIR in 30 m products, bands 10/11 wavelengths, 185 km scene, 16 d/8 d) | https://www.usgs.gov/landsat-missions/landsat-8 (and the USGS Landsat 8/9 factsheet PDF) | **High** (X-band 150 Mb/s **Medium**) |
| F14 | **ECOSTRESS** (ISS 51.6°, 70 m LST, 408 × 10 km tiles, 1–5 d revisit) | https://earthdata.nasa.gov/data/instruments/ecostress | **High** |
| F15 | **Earth Fire Alliance — About FireSat / FireSat fact sheet** (1 500 km swath, 80 m, 5 × 5 m, < 5 % false positives, 6 channels, 1 h by 2029, 20 min with ≈ 50 sats, 99 % wildfire coverage goal, IOC Q4 2026) | https://earthfirealliance.org/about-firesat · https://earthfirealliance.org/wp-content/uploads/2026/09/About-FireSat.pdf | **High** |
| F16 | **eoPortal: FireSat** (600 km SSO, MuSat Gen2 bus > 200 kg, 200 W payload orbit-average power, 700 GB/day delivery, launches 15 Mar 2025 and 7 Jul 2026) | https://www.eoportal.org/satellite-missions/firesat | **High** |
| F17 | **EFA news: first three operational FireSats reach orbit** (7 Jul 2026, twice-daily data by Q4 2026, 1 h revisit target 2029) | https://earthfirealliance.org/news-article/earth-fire-alliances-first-three-operational-firesats-reach-orbit/ | **High** |
| F18 | **Fire Ecology (2026): "Developing a science strategy … for FireSat"** — 80 m / sub-hourly science rationale, 6-channel design, phased 2026–2030 research timeline | https://link.springer.com/article/10.1186/s42408-026-00599-w | **High** |

### 9.3 Scenario 2 — flood

| # | Source | URL | Conf. |
|---|---|---|---|
| L1 | **SentiWiki: Sentinel-1 Mission** — 693 km, 98.18°, 98.6 min, 12 d/175 orbits, 6 d pair, IW 250 km @ 5 × 20 m, EW 410 km @ 20 × 40 m, SM 80 km @ 5 × 5 m, duty cycle 25–30 min/orbit, X-band 2 × 260 Mb/s, 1 410 Gbit storage, 5 900 W, 2 300 kg, instrument 945 kg, NRT < 3 h (1 h goal), archive < 24 h, revisit < 1 d Arctic / 1–3 d Europe–Canada / 3 d equator | https://sentiwiki.copernicus.eu/web/s1-mission | **High** |
| L2 | **ESA SP-1322/1 Sentinel-1** (design requirements: 250 km swath, 5 × 20 m, 25 min imaging per orbit, 12 d/175 orbits) | https://sentinels.copernicus.eu/documents/247904/349449/s1_sp-1322_1.pdf | **High** |
| L3 | **eoPortal: Copernicus Sentinel-1** (up to **6 TB/day** produced and NRT **1 h** goal, quoted from the Copernicus Sentinel Data Access Annual Report 2023; S1C Dec 2024, S1D Nov 2025) | https://www.eoportal.org/satellite-missions/copernicus-sentinel-1 | **High** |
| L4 | **Copernicus GFM (Global Flood Monitoring)** presentations 2022–2026 — **flood map within 8 h of Sentinel-1 acquisition**, 20 m pixel sampling, global except poles, archive from 2015, S1C integration gives 3–6 d revisit, ≈ 450 + ≈ 400 scenes/day, < 3 h best case / < 8 h in > 99 % of cases | https://european-flood.emergency.copernicus.eu/sites/default/files/AM/AM2024/CEMS%20Global%20Flood%20Monitoring.pdf · https://global-flood.emergency.copernicus.eu/media/events/9/gfm_intro_glofas_am_2026-tobias.pdf · https://global-flood.emergency.copernicus.eu/media/events/6/gfm_poster_jrc.pdf | **High** |
| L5 | **Raab et al. / "The fully-automatic Sentinel-1 Global Flood Monitoring service" (Remote Sensing of Environment, 2025)** — 8 h core requirement, availability KPI ≥ 99 % (99.80 % in 2023), revisit Europe 1–3 d, priority regions 4–6 d, most land 6–12 d, S-1 6 TB/day & 1 h NRT, ≈ 250 TB / ≈ 2 M scenes archive | https://doi.org/10.1016/j.rse.2025.115108 | **High** |
| L6 | **Copernicus EMS Rapid Mapping portfolio & EMS User Guide v2** — SL1 target times after image reception: reference 9 h, delineation 12 h, grading 12 h; updated: First Estimate 2 h, Reference 10 h, Delineation 7 h, Grading 10 h; **First Available Map 3 h**; **crisis information within 24 h of request** | https://www.copernicus.eu/sites/default/files/documents/EMS%20User%20Guide%20v2%20-%20May%202015%20-%20Service%20Portfolio%20-%20Rapid%20Mapping.pdf · https://mapping.emergency.copernicus.eu/about/rapid-mapping-portfolio/ | **High** |
| L7 | **Wania et al. 2021, Remote Sensing 13(11):2114** — "Increasing Timeliness of Satellite-Based Flood Mapping … in CEMS" (24 h service aim, product timing table) | https://www.mdpi.com/2072-4292/13/11/2114 | **High** |
| L8 | **King et al. 2013, IEEE TGRS 51(7):3826–3852** — global cloud fraction **≈ 67 %**, land **≈ 55 %**, ocean **≈ 72 %** (12 yr Terra + 9 yr Aqua); ISCCP agrees | https://atmosphere-imager.gsfc.nasa.gov/sites/default/files/ModAtmo/King_et_al.2013.pdf · https://isccp.giss.nasa.gov/role.html | **High** |
| L9 | **Monsoon cloud-cover study (PLOS ONE, 2025)** — Western Ghats / Indian monsoon coast mean cloud cover **> 90 % in July–August**, ~23–25 % of surface water left unmapped by the optical product | https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0314033 | **Medium** |
| L10 | **Tropical cloud-free optical study (Nature Scientific Data, 2023)** — Lower-Niger, Nigeria: seasonal mean cloud fraction **84 %**, peak **90.8 % in June**, **6.3 cloud-free Sentinel-2 scenes per pixel** in a 7-month season | https://www.nature.com/articles/s41597-023-02439-x | **Medium** |
| L11 | **Flood-mapping effectiveness study (Copernicus EMS)** — a 12-day radar revisit observed **≈ 20 %** of European flood events, optical ≈ 10 %; adequate only for inundations lasting > 1 week | reported in the JRC feasibility study cited by L5 | **Medium** |
| L12 | **eoPortal: ALOS-2** (628 km, 97.9°, 14 d revisit, PALSAR-2 L-band 1257.5 MHz, ScanSAR 100 m @ 350 km and 60 m @ 490 km, stripmap 3/6/10 m, spotlight 1 × 3 m over 25 × 25 km, X-band 800/400/200 Mb/s) | https://www.eoportal.org/satellite-missions/alos-2 | **High** (spacecraft mass/power **Low**) |
| L13 | **CSA / ASC: RADARSAT comparison table** (RADARSAT-2 C-band 5.4 GHz, 798–800 km dawn-dusk, 24-day exact repeat, ScanSAR Wide 100 m @ 500 km, ScanSAR Narrow 50 m @ 300 km, Wide Fine 8 m @ 150 km, Extra-Fine 5 m, Ultra-Fine 3 m, Spotlight ~1 m; RCV modes 100 m/500 km → 3 m/20 km) | https://www.asc-csa.gc.ca/eng/satellites/radarsat/technical-features/radarsat-comparison.asp | **High** |
| L14 | **eoPortal: NISAR** (747 km, 98.4°, 12-day exact repeat, 173 tracks, ≈ 6 d average revisit, > 240 km swath, L 7 m az / 3–48 m range, S 3–24 m, 9 Tbit recorder, 3.5 Gb/s Ka, 3-year baseline) | https://science.nasa.gov/mission/nisar/mission-overview · https://www.eoportal.org/satellite-missions/nisar | **High** |
| L15 | **SWOT mission overview** (21-day repeat, 120 km swath, KaRIn 35.75 GHz, rivers > 100 m, lakes > 250 × 250 m, WSE ± 10 cm > 1 km², water extent ± 15 %, ≈ 4 GB/s raw) | https://swot.jpl.nasa.gov/mission/overview | **High** |
| L16 | **ICESat-2 mission specs** (500 km, 92°, 91-day repeat, 6 beams, 11 m footprint, 10 kHz ≈ 0.7 m spacing, 532 nm; ATL13 inland water) | http://icesat-2.gsfc.nasa.gov/science/specs | **High** |
| L17 | **MODIS/VIIRS near-real-time flood & water detection products (MCDWD, VCDWD)** — 250 m grid, explicitly cloud-limited | https://www.earthdata.nasa.gov/data/instruments/viirs · MODIS land water product documentation | **Medium** |

### 9.4 Scenario 3 — methane

| # | Source | URL | Conf. |
|---|---|---|---|
| M1 | **NASA Earthdata CSDA webinar: "Technical Overview of GHGSat Data" (Mar 2025)** — 25 m GSD, 1630–1675 nm, 0.3 nm spectral resolution, 12 × 12 km FOV, 100 kg/hr (50 % PoD, 3 m/s wind), 155.6 kg/hr (90 % PoD), offshore 150–1 000 kg/hr, 1–2 d constellation revisit, 15 kg satellites, ≈ 500 km SSO, up to 60 observations/day, 10 CH4 satellites, precision 1–2 % of background column | https://earthdata.nasa.gov/s3fs-public/2025-03/GHGSAT%20-%20CSDA%20Vendor%20Webinar%20March%202025.pdf | **High** |
| M2 | **ESA Earth Online: GHGSat mission description** (Fabry-Pérot WAF-P, ~25 m, ~0.3 nm, 12 × 12 km scene, 100 kg/hr, 95-min orbit ≈ 500 km SSO) | https://earth.esa.int/eogateway/missions/ghgsat/description | **High** |
| M3 | **The GHGSat-D imaging spectrometer (AMT 14, 2021)** — 15 kg satellite, 514 km SSO, 09:30 local descending, launched 21 Jun 2016 | https://amt.copernicus.org/articles/14/2127/2021/ | **High** |
| M4 | **Conrad et al., Remote Sensing of Environment 288 (2023) 113499** — GHGSat probability-of-detection model vs wind speed (basis of the 100.4 / 155.6 kg/hr values) | https://doi.org/10.1016/j.rse.2023.113499 | **High** |
| M5 | **Carbon Mapper: "Tanager Methane Performance Specifications"** — swath 18.6–24.2 km, 30 m, **CE90 50 m**, FWHM 5.5 nm, 5 nm sampling, 400–2500 nm, SNR 310–655 @ 2200 nm, **CH4 90 % PoD = 90–180 kg/hr** (3 m/s wind, 35° SZA, 25 % albedo) | https://carbonmapper.org/articles/tanager-methane-performance-specifications · https://assets.carbonmapper.org/documents/Tanager%20Methane%20Performance%20Specifications.pdf | **High** |
| M6 | **Tanager-1 system paper (Atmos. Meas. Tech. 18, 2025)** — 30 m, 18.2–27.5 km swath, ~7-day per-satellite revisit, 200 000–250 000 km²/day, > 8 000 published plumes, launched 16 Aug 2024 at 406–435 km | https://amt.copernicus.org/articles/18/6933/2025/ | **High** |
| M7 | **TROPOMI methane data-product page** — 7 × 7 km → 5.5 × 7 km since 6 Aug 2019, ≈ 2 600 km swath, daily global coverage, SWIR 2314–2382 nm, usable inner swath (VZA < 60°), point-source limit | https://www.tropomi.eu/data-products/methane | **High** (point-source limit **Medium**) |
| M8 | **SRON automated CH4 plume detection (Atmos. Chem. Phys. 23, 2023)** — 2 974 plumes in 2021, mean 44 t/hr, 5th–95th percentile 8–122 t/hr | https://acp.copernicus.org/articles/23/9071/2023/ | **High** |
| M9 | **UCLA Emmett Institute methane primer** — TROPOMI ≈ 25 t/hr practical limit, ≈ 100 kg/hr-class instruments would capture 75–99 % of point-source emissions, MethaneSAT ≈ 10 t/hr | https://law.ucla.edu/sites/default/files/PDFs/Publications/Emmett%20Institute/Methane-1ee.pdf | **Medium** |
| M10 | **NASA Earthdata: EMIT Imaging Spectrometer** (ISS ≈ 400–415 km, 51.6°, 70–75 km swath, 60 m GSD, 285 bands 380–2500 nm, 7.5 nm sampling, ± 52° coverage, up to 5 / average 3 visits per arid region, 16 orbits/day, extended through 2026) | https://www.earthdata.nasa.gov/data/instruments/emit-imaging-spectrometer · USGS Open File Report 2021/1030R | **High** |
| M11 | **MethaneSat mission pages (EDF / New Zealand Space Agency)** — 200 km swath, 100 × 400 m pixels, 0.25 nm in 1598–1683 nm, ≈ 3 ppb threshold, 3–4 d revisit; launched 4 Mar 2024, **contact lost 20 Jun 2025** | https://methanesat.org/ (and ESA/UNEP summaries) | **High** (MDL value **Medium**: 2–3 t/hr per UNEP, ≈ 10 t/hr per UCLA) |
| M12 | **IEA Global Methane Tracker** satellite comparison tables (Sentinel-2 20 m/5 d/≈1 t/hr; PRISMA 30 m/7 d; EnMAP 30 m/4 d; WorldView-3 3.7 m/<1 d/≈100 kg/hr; Sentinel-3 500 m/1 d; VIIRS 750 m/<1 d; GOES ABI ≈2 km/5–10 min/≈100 t/hr; MTG FCI ≈1 km/10 min/≈30 t/hr; GOSAT 10 km/3 d) | https://www.iea.org/data-and-statistics/data-product/global-methane-tracker | **Medium** |
| M13 | **NASA EMIT methane demonstrations** (point-source sensitivity ≈ 500 kg/hr class over arid oil & gas regions) | https://www.earthdata.nasa.gov/data/instruments/emit-imaging-spectrometer and the associated USGS/NASA results releases | **Medium** |
| M14 | **GHGSat independent single-blind quantification** (0.20 t/hr source quantified within 13 %) | reported in GHGSat / independent trial publications referenced by M1 and M4 | **Medium** |

### 9.5 Corrected citation note

S2 points at the NTRS record for the **NASA Systems Engineering Handbook, SP-2016-6105** (Rev 1 catalogued at NTRS 20170007238; Rev 2 is the current agency issue). Use the handbook for the requirement/verification vocabulary and **S1 (the Small Sat Institute webinar) as the primary citation in the README and the pitch**, because it is the resource the challenge itself lists.

---

## 10. Estimate register — every number that is ours, not NASA's

This table exists so that a judge can challenge a number and we can answer in one place. It is also the source of the README's "simplified values are educational approximations" statement.

| # | Value we invented | Where it is used | Why we chose it | Risk if challenged |
|---|---|---|---|---|
| E1 | Fire false-alarm budget: **≤ 10 % MIN / ≤ 2 % STRETCH** | REQ-WF-03 | Real operational commission error is 1.2 % and FireSat's goal is < 5 %; we allow a looser bar for a first CubeSat | Low — clearly labelled as a Mission Forge allowance |
| E2 | Fire minimum detectable area: **10 000 m² MIN / 250 m² STRETCH** | REQ-WF-03 | MIN = one fully filled 100 m pixel (the most conservative possible claim); STRETCH = VIIRS' demonstrated 2–250 m² sensitivity | Low |
| E3 | Fire GSD: **100 m MIN / 30 m STRETCH** | REQ-WF-02 | Landsat TIRS native 100 m and FireSat 80 m are real tiers; 30 m follows from 1.22 λ/D at 4 µm with a 0.15 m aperture at 500 km | Medium — depends on the payload catalogue we publish in Step 2 |
| E4 | Fire data: **1 GB/day MIN / 5 GB/day STRETCH** | REQ-WF-05 | Direct arithmetic on 400 000 km² × pixels/km² × 6 bands × 2 bytes; anchored by VIIRS 0.41 GB/day and FireSat 700 GB/day | Low |
| E5 | Fire cloud assumption **40 %** | brief | Between the MODIS land mean (55 %) and the aridity of fire-prone regions | Low — Scenario 1 has no cloud gate |
| E6 | Fire duration **1 yr MIN / 3 yr STRETCH** | REQ-WF-07 | Two hemispheric fire seasons; FireSat design life ≈ 5 yr | Low |
| E7 | Flood minimum mappable inundation **1 km² MIN / 0.1 km² STRETCH** | REQ-FL-03 | Patch-size filtering is the standard defence against the documented false-alarm weakness of automated flood maps | Medium — stated as our rule of thumb |
| E8 | Flood cloud assumption **60 %** (stress **90 %**) | brief | 55 % MODIS land mean raised for a monsoon-exposed coast; 90 %+ is a published monsoon value | Low |
| E9 | Sentinel-1-class scene = **≈ 1.2 GB** dual-pol GRD per 250 × 500 km | REQ-FL-05 | Product experience; consistent with 6 TB/day ÷ ≈ 850 scenes/day ≈ 7 GB/day of all products per scene | Medium |
| E10 | Flood data **3 GB/day MIN / 12 GB/day raw-architecture variant** | REQ-FL-05 | 300 000 km²/day ÷ 125 000 km² per scene × 1.2 GB | Medium |
| E11 | Flood duration **2 yr MIN / 5 yr STRETCH** | REQ-FL-06 | Two flood seasons; NISAR baseline is 3 yr, Sentinel-1 is 7 yr | Low |
| E12 | CubeSat downlink reality: **1 Mb/s ≈ 0.2 GB/day, 10 Mb/s ≈ 2.4 GB/day, 50 Mb/s ≈ 12 GB/day** at 4 × 10 min contacts | data/comms model | GB/day = Mb/s × contact-minutes × 60 ÷ 8 000; S-band smallsat links are 0.1–2 Mb/s, X-band 2–150 Mb/s | Medium — must be labelled as an educational approximation in Step 2 |
| E13 | Methane detection threshold **1 000 kg/hr MIN** | REQ-CH4-01 | Sits between EMIT's ≈ 500 kg/hr class and TROPOMI's 4–10 t/hr; stretch copies GHGSat/Tanager (100–180 kg/hr) | Medium |
| E14 | Methane quantification **60 % MIN / 90 % at ± 15 % STRETCH** | REQ-CH4-04 | GHGSat demonstrated 13 % on a 0.20 t/hr blind trial; 1–2 % column precision | Medium |
| E15 | Methane data **8 GB/day MIN / 30 GB/day STRETCH** | REQ-CH4-05 | 250 000 km² at 40 m with 100 spectral samples ≈ 31 GB/pass, ≈ 4.4 GB/day averaged over the mission | Medium |
| E16 | Methane cloud assumption **25 %** | brief | Target basins are arid; GHGSat/Tanager/EMIT all curate clear, high-albedo, glint-free scenes | Low |
| E17 | Methane duration **2 yr MIN / 5 yr STRETCH** | REQ-CH4-06 | Repeat visits over seasons; MethaneSAT's own campaign design | Low |
| E18 | Rubric **weights, logarithmic scaling, 70/40 bands, 60 % PARTIALLY-MET threshold** | §5, §6 | Chosen so that value grows logarithmically while cost grows linearly | Medium — must be shown on-screen as *our design choice* |
| E19 | Cloud-exposure and lifetime **penalty rules** | §6.5 | Makes the real cloud and lifetime statistics bite the score | Medium |
| E20 | Mirror-table **band edges** in §7.4 | results screen | Edges chosen between documented real mission tiers | Low |
| E21 | Approximate **mass/power** cells marked `≈` in §7 (SLSTR payload, Landsat, ALOS-2, RCV, ECOSTRESS, NISAR power) | mirror table | Secondary sources; never used in a requirement | Low — flagged on screen if used |
| E22 | "Each 10 × larger pixel costs ≈ 3 × in detection threshold" heuristic | §4.2 | Fit to the real ladder WorldView-3 → GHGSat → Tanager → EMIT → MethaneSAT → TROPOMI | Medium — labelled an approximation, not a law |

---

## 11. Copy table for `src/data/scenarios.ts`

One row per requirement. `min` is the pass bar (score 0 below it), `stretch` is the cap (score 1 at or beyond it), `weight` is the §6.5 weight, `gate: true` means pass/fail with no partial credit.

`direction` column convention: every `m`, `h`, `d`, `nm`, `kg/hr`, `%` (rate/accuracy) and `m²` row above is **lower-is-better**, so score it with the inverted form from §6.2 (`ln(min/x) / ln(min/stretch)`). Only `GB/day` and the `km` swath-coverage row are higher-is-better. Store `direction: "lower" | "higher"` explicitly rather than inferring it.

| id | scenario | metric | unit | **min** | **stretch** | weight | gate | method | segment |
|---|---|---|---|---|---|---|---|---|---|
| REQ-WF-01 | wildfire | revisit | h | **24** | **4** | 25 | no | analysis | space |
| REQ-WF-01b | wildfire | swath coverage of AOI | km | 300 | 1 200 | 10 | no | analysis | space |
| REQ-WF-02 | wildfire | thermalGSD | m | **100** | **30** | 25 | no | analysis | space |
| REQ-WF-03a | wildfire | minDetectableFireArea | m² | **10 000** | **250** | 12 | no | similarity | space |
| REQ-WF-03b | wildfire | falseAlarmRate | % | **10** | **2** | 8 | no | test | space |
| REQ-WF-04 | wildfire | latencyObservationToProduct | h | **6** | **2** | 15 | no | demonstration | ground |
| REQ-WF-05 | wildfire | dataReturn | GB/day | **1** | **5** | — (feasibility) | no | analysis | ground |
| REQ-WF-06 | wildfire | bands | count | 2 (3.9–4.2 µm **and** 10.5–12.5 µm) | 6 | — (feasibility) | no | inspection | space |
| REQ-WF-07 | wildfire | duration | yr | **1** | **3** | 5 | no | analysis | space |
| REQ-WF-BRIEF | wildfire | targetArea | km² | **400 000** | — | — | — | — | user |
| REQ-WF-BRIEF | wildfire | cloudCoverAssumption | % | **40** | — | penalty | — | analysis | user |
| REQ-FL-01 | flood | allWeatherImaging | bool | **true** | — | — | **YES** | analysis | space |
| REQ-FL-02 | flood | revisit | d | **3** | **1** | 30 | no | analysis | space |
| REQ-FL-03a | flood | GSD | m | **100** | **25** | 20 | no | analysis | space |
| REQ-FL-03b | flood | minMappedFloodArea | km² | **1** | **0.1** | 10 | no | test | user |
| REQ-FL-04 | flood | latencyAcquisitionToMap | h | **8** | **3** | 25 | no | demonstration | ground |
| REQ-FL-05 | flood | dataReturn | GB/day | **3** (raw variant 12) | **12** | — (feasibility) | no | analysis | ground |
| REQ-FL-06 | flood | duration | yr | **2** | **5** | 5 | no | analysis | space |
| REQ-FL-BRIEF | flood | targetArea | km² | **900 000** | — | 10 | — | — | user |
| REQ-FL-BRIEF | flood | cloudCoverAssumption | % | **60** (stress 90) | — | gate driver | — | analysis | user |
| REQ-CH4-01 | methane | minDetectableEmission | kg/hr | **1 000** | **100** | 30 | no | analysis | space |
| REQ-CH4-02a | methane | GSD | m | **100** | **30** | 15 | no | analysis | space |
| REQ-CH4-02b | methane | spectralSampling | nm | **1.0** | **0.3** | 10 | no | analysis | space |
| REQ-CH4-03a | methane | revisit | d | **7** | **2** | 15 | no | analysis | space |
| REQ-CH4-03b | methane | surveyedAreaTwiceCovered | km² | **250 000** | **2 000 000** | (inside 15) | no | analysis | user |
| REQ-CH4-04a | methane | quantifiedFraction | % | **60** | **90** | 20 | no | test | user |
| REQ-CH4-04b | methane | quantificationAccuracy | % | **50** | **15** | (inside 20) | no | test | user |
| REQ-CH4-04c | methane | latency | h | **24** | **6** | — (feasibility) | no | demonstration | ground |
| REQ-CH4-05 | methane | dataReturn | GB/day | **8** | **30** | — (feasibility) | no | analysis | ground |
| REQ-CH4-06 | methane | duration | yr | **2** | **5** | 10 | no | analysis | space |
| REQ-CH4-BRIEF | methane | cloudCoverAssumption | % | **25** | — | penalty | — | analysis | user |

---

## 12. Provisional values: confirmed vs corrected

| Scenario | Provisional (Step 1) | Verdict | Final value in this document | Reason |
|---|---|---|---|---|
| Wildfire | revisit ≤ 1 day | **CONFIRMED as MIN** | 24 h min / **4 h stretch** | VIIRS already gives ≥ 6 looks/day; 1 d is the honest single-satellite pass bar, 4 h is the constellation tier |
| Wildfire | GSD ≤ 100 m | **CONFIRMED as MIN** | 100 m min / **30 m stretch** | Landsat TIRS 100 m and FireSat 80 m are real tiers; 30 m is buildable with a 0.15 m aperture at 4 µm |
| Wildfire | data ≥ 1 GB/day | **CONFIRMED** | 1 GB/day min / 5 GB/day stretch | 0.48 GB/day of 6-band L1 over 400 000 km² at 100 m; 5.3 GB/day at 30 m |
| Wildfire | latency ≤ 6 h | **CONFIRMED as MIN** | 6 h min / **2 h stretch** | 6 h is bounded by contact cadence; the real NRT benchmark is 30 min–2 h (LANCE/FIRMS), so it becomes the stretch |
| Wildfire | 1 year duration | **CONFIRMED as MIN** | 1 yr min / 3 yr stretch | One pass through both hemispheres' fire seasons |
| Wildfire | 400 000 km² target | **CONFIRMED** | 400 000 km² | = one 300 km × 1 333 km data-take; fits a single pass comfortably |
| Wildfire | 15 % cloud cover | **CORRECTED → 40 %** | 40 % assumption, no cloud gate | Global land cloud cover is 55 %; 15 % is unrealistically clear. No gate: a hot pixel passes the absolute tests through moderate cloud, and geostationary feeds gap-fill |
| Flood | revisit ≤ 3 days | **CONFIRMED as MIN** | 3 d min / **1 d stretch** | Copernicus' own operational revisit is 1–3 d over Europe; 12 d must fail because it observes only ≈ 20 % of events |
| Flood | GSD ≤ 30 m | **CORRECTED → MIN 100 m, STRETCH 25 m** | 100 m min / 25 m stretch | 100 m is the disaster-response wide-swath tier of every real radar; 20–25 m is Copernicus' actual flood-product sampling and is the reward, not the entry bar |
| Flood | all-weather hard requirement | **CONFIRMED as a hard gate** | `gate: true` | 55 % land / 67 % global cloud, 84–92 % in monsoon flood seasons; MODIS/VIIRS flood products are explicitly cloud-blind |
| Flood | data ≥ 10 GB/day | **CORRECTED → MIN 3 GB/day; 12 GB/day is the raw-downlink variant** | 3 GB/day min / 12 GB/day stretch | 300 000 km²/day of coverage is ≈ 2.4 IW-class scenes/day ≈ 2.9 GB/day of GRD products; 10–12 GB/day is what you need if you refuse onboard processing |
| Flood | latency ≤ 12 h | **CORRECTED → 8 h** | 8 h min / 3 h stretch | GFM is required to deliver within 8 h in > 99 % of cases (best case < 3 h); 12 h would be beaten by the service the mission must compete with |
| Flood | 2 years duration | **CONFIRMED as MIN** | 2 yr min / 5 yr stretch | Two flood seasons; NISAR's 3-year baseline and Sentinel-1's 7-year life are the upper anchors |
| Flood | 900 000 km² target | **CONFIRMED** | 900 000 km² | = 3 600 km of 250 km-wide swath lines; coverage capacity is not the limiter — revisit geometry and downlink are |
| Flood | 60 % cloud cover | **CONFIRMED (with a 90 % stress case)** | 60 % mean, 90 % stress | 55 % MODIS land mean raised for a monsoon coast; 90 %+ is published monsoon data |
| Methane | GSD ≤ 40 m | **CONFIRMED as a mid-tier value; stored as MIN 100 m / STRETCH 30 m** | 100 m min / 30 m stretch | GHGSat 25 m and Tanager-1 30 m are proven at 15–100 kg; 40 m is the "good design" marker between our bars |
| Methane | revisit ≤ 7 days | **CONFIRMED as MIN** | 7 d min / **2 d stretch** | 7 d is Tanager-1's own per-satellite revisit; 1–2 d is GHGSat's constellation revisit |
| Methane | 2 years duration | **CONFIRMED as MIN** | 2 yr min / 5 yr stretch | Plumes are transient; MethaneSAT's 15-month loss is the real cautionary case for `LIFETIME_SHORT` |
| Methane | data ≥ 8 GB/day | **CONFIRMED** | 8 GB/day min / 30 GB/day stretch | ≈ 31 GB per full 250 000 km² pass at 40 m with 100 spectral samples → ≈ 4.4 GB/day averaged over the mission |
| Methane | latency ≤ 24 h | **CONFIRMED as MIN** | 24 h min / **6 h stretch** | GHGSat delivers within 24 h of overpass |
| Methane | 250 000 km² target | **CONFIRMED, redefined** | 250 000 km² **covered at least twice**; stretch 2 000 000 km² | 250 000 km² is one day of Tanager-1 capability — as a total-area requirement it must be earned over months, which is what makes swath-vs-resolution bite |
| Methane | 30 % cloud cover | **CORRECTED → 25 %** | 25 % assumption | Target basins are arid; SWIR methane retrievals also fail on glint and bright surfaces, so usable-scene fraction is lower than the cloud number implies |
| Methane | *(missing)* | **ADDED** | detection threshold **1 000 kg/hr min / 100 kg/hr stretch**; quantification **60 % of sources min / 90 % at ± 15 % stretch**; spectral sampling **1 nm min / 0.3 nm stretch** | Without these three numbers the game cannot separate a *survey* mission from a *quantification* mission, which is Scenario 3's whole point |
| Methane | "EMIT 170 km swath, 30 m GSD" | **CORRECTED** | EMIT = **70–75 km swath at 60 m GSD**, 285 bands at 7.5 nm; Tanager-1 = **18.6–24.2 km swath at 30 m** | EMIT's published values; the 30 m figure belongs to Tanager-1 |

---

## 13. Deliberately not decided in this document

1. **Component catalogue values** (specific instruments, buses, radios, launchers) — Step 2, with a per-value credibility label.
2. **Coupling coefficients** (W per instrument, kg per aperture, GB per scene) — Step 2 coupling matrix. The requirements here constrain them but do not define them.
3. **Difficulty presets** — Step 2. If a preset changes a threshold, it must change `min`/`stretch` in this table, not invent new metrics.
4. **Ukrainian translation of the plain-language cards** (§8) — Step 3, since UI strings must not be hard-coded.
5. **Whether random events use these requirements** — they may not. Requirements are verified deterministically; random events are an overlay (Step 1 design pillar 5).

**Status of this file:** research complete; sources fetched and cross-checked 14 Nov 2026. No other file in the repo was touched, and nothing was committed.
