# Engineering values — verified against real sources

Research date: 2026-11-14. Purpose: check every provisional number in `docs/02-game-rules.md` §5.1–5.8 against real-world sources and propose corrected single game values. Nothing here is a claim that any specific vendor quote is exact; it is a trade-study calibration.

**Confidence rule (applies to every number):**
- **High** — primary source: NASA (CubeSat 101, CubeSat Design Specification, Small Spacecraft Technology State-of-the-Art 2026), ESA/eoPortal mission pages, manufacturer datasheets/spec pages, mission fact sheets, launch-provider pricing pages.
- **Medium** — reputable secondary: peer-reviewed papers (SPIE etc.), industry surveys (NewSpace IAC papers), EO data vendors/aggregators (satsearch, carrier-space), Wikipedia-checked mission summaries used only when corroborated.
- **Low** — engineering estimate or educational approximation derived by us (geometry, energy budgets, orbit simulations, duty-cycle assumptions). Derived numbers are always labeled and the method is shown.

---

## 1. Corrections to our provisional library

Verdict against §5.1–5.8 as written. `our value` = current value in `docs/02-game-rules.md`.

| our component id | our value | realistic value | verdict | confidence | source |
|---|---|---|---|---|---|
| bus-3u dry mass | 4.0 kg | 3U total mass limit 6.0 kg; typical 3U bus ~1.5–4 kg | OK (conservative) | High | CDS Rev 14.1 Table 1; SOA 2026 §6 |
| bus-6u dry mass | 12.0 kg | 6U bus dry 4.5–7.5 kg; **12.0 kg is the CDS total S/C limit, not a bus dry mass** | **too pessimistic / rule-breaking** (bus alone would consume the whole 6U allowance) | High | CDS Table 1; SOA Table 2-2 (NanoAvionics M6P dry 4.5 kg, max S/C 16 kg); GOMspace 6U bus ~6.0 kg, old Premium bus 7.5 + payload 4.5 |
| bus-6u baseline W | 15 W | 6U body-mounted 19.2–27.8 W; 6U deployable 55–57.6 W | too pessimistic | High | SOA 2026 Table 3-2 |
| bus-12u dry mass | 26.0 kg | 12U total limit 24.0 kg (CDS); typical 12U bus ~8–12 kg | **too pessimistic / rule-breaking** (exceeds the CubeSat standard it claims to be) | High | CDS Table 1; GOMspace 12U bus ~8 kg |
| bus-12u baseline W | 26 W | 12U body-mounted 19.5–24.4 W (12U body is *worse* per U than 6U) | OK; deployables do the real work | High | SOA 2026 Table 3-2 |
| bus-3u/6u/12u pointing | 2.0 / 0.5 / 0.05 ° | magnetorquers ~1–2°, wheels ~0.1–1°, star trackers 0.02°–0.008° | OK (matches real tiers) | High | SOA §5: CubeStar 0.02°; NanoAvionics ST-1 8″≈0.022°; Blue Canyon 6U ±0.002° |
| bus storage 8/32/96 GB | 8/32/96 GB | real CubeSat payload storage: 8 GB (C1U era) up to 500 GB (iSIM-170 upgradable), ICEYE-class TB-scale | OK; 96 GB is conservative for 12U | High/Medium | Satlantis datasheets; Intuition-1 (7 GB raw scenes) |
| arr-body 5 W @ 0.4 kg @ 0.12 m² | 5 W | 3U body-mounted 8.1–8.5 W at ~0.1 kg (74–76 W/kg); 6U body 19–28 W | too pessimistic (W), too heavy (mass) | High | SOA Table 3-2 (NPC SP3X 8.1 W/76 W/kg; XO-PANEL 3U 8.1 W; Emxys 8.2 W/66 W/kg; endurosat 8.4 W/side) |
| arr-deploy-m 18 W @ 1.2 kg @ 0.45 m² | 18 W | 3U deployable 21.6–22.5 W at ~0.3 kg (SP3X Deployable 75 W/kg); 6U deployable 55–57.6 W at ~0.75 kg | too pessimistic | High | SOA Table 3-2 |
| arr-deploy-l 45 W @ 2.8 kg @ 1.1 m² | 45 W | 6U deployable 55–70 W at 0.7–1.0 kg; Blue Canyon 6U–12U arrays 48–118 W | too pessimistic (W), too heavy (mass) | High | SOA Table 3-2 (DHV DSA-6U-2D-S 55 W; SP6X Deployable 57.6 W) |
| arr-deploy-xl 90 W @ 5.2 kg @ 2.2 m² | 90 W | Pumpkin single-wing 220 W @ ~5 kg (44 W/kg), dual-articulated 135 W @ ~4.4 kg (31 W/kg) | roughly OK as a 12U-only tier, but under-labeled (real 90–220 W for similar mass) | High | SOA Table 3-2 |
| battery specific energy (bat-s 40 Wh/0.9 kg = 44 Wh/kg) | 44–63 Wh/kg | CubeSat packs 57–250 Wh/kg (GOMspace BP8 177 Wh/kg ≈ 100 Wh/0.57 kg; BP4 ≈ 50 Wh/0.3 kg; ISISPACE PBP 156–160; Clyde OPTIMUS 30 Wh/288 g, 40 Wh/360 g, 80 Wh/720 g) | **masses 2–3× too heavy** | High | SOA 2026 §3 + Table 3-3; AAC Clyde product pages |
| rf-uhf 0.012 Mbps @ 0.4 kg | 12.288 kbps @ 0.4 kg | rate OK (9.6–38.4 kbps real); mass too high (GOMspace NanoCom AX100 = 24.5 g; UHF antenna ~12–90 g) | OK rate / too heavy mass | High | SOA Table 9-3; GOMspace nanoPLUGHF 12 g |
| rf-s 1.0 Mbps @ 1.1 kg @ 8 W | 1 Mbps | 0.064–25 Mbps real (IQ SLINK-PHY 64 kbps–4 Mbps/275 g; Clyde PULSAR-DATA 7.5 Mbps/1 W/100 g; EnduroSat ≤20 Mbps/250 g; CUBECOM STXG2 25 Mbps/137 g) | too pessimistic rate, too heavy mass | High | SOA Table 9-3 |
| rf-x 20 Mbps @ 2.6 kg @ 25 W | 20 Mbps | 25 Mbps–2.5 Gbps real at 0.14–0.30 kg (Clyde PULSAR-DATA X 50 Mbps/2 W/130 g; SkyLabs NANOcast <1 Gbps/164 g; CUBECOM XTXG2 2.5 Gbps/137 g; EnduroSat ≤1.5 Gbps/270 g; Syrlinks EWC27 1.4 Gbps/235 g) | too pessimistic rate, too heavy mass; 25 W draw is a fair system-level number (TX 2 W + SDR + steered antenna) | High | SOA Table 9-3; §9 text (ISARA >100 Mbps Ka on 3U) |
| rf pointing 2° (S) / 5° (X steered) | 2/5 ° | OK: higher gain ⇒ tighter pointing; omni UHF ~0°, patch S ~ beamwide, X steered needs ~1–5° | OK | High | SOA §9 (explicit: gain vs pointing trade) |
| gs-single 4 contacts/day | 4 | our orbit sim: mid-latitude single station, SSO 500–600 km, 10° mask → 3.3–4.0 contacts/day, ~20–28 contact-min/day | OK | Low (derived, method in §4) |
| gs-single $70 k capex | $70 000 | 3–5 m commercial smallsat station hardware: Isara Ka dishes $55 k (4.9 m) – $100 k (9.3 m); KSATLITE-class 3.7 m X/S stations | OK as hardware-only; real total (site, mount, LNA/BUC, licenses, ops) is 2–4× hardware | Medium | SOA §11.4/11.5; Isara published quote; KSATLITE description |
| gs-network 10 contacts/day | 10 | our sim: 4-station global network → ~27 contacts/day, ~165 contact-min/day (polar sites are the multiplier: one Svalbard-like site ≈ 10–11 passes/day alone) | OK but under-modeled; polar sites dominate | Low (derived) |
| gs-service 22 contacts/day | 22 | plausible: KSAT operates 100+ KSATLITE antennas; AWS Ground Station 5.4 m antennas in ~12+ regions; ATLAS 34 sites/51 antennas | OK | High | SOA §11.4 |
| pl-visible 0.8 kg, 30 m GSD, 100 km swath, 2 GB/day | — | Physically consistent: 30 m GSD @500 km = 60 µrad IFOV → small aperture (tens of cm or less), mass ≤1–2 kg is fair. Anchors: GOMspace C1U-class 47 m @450 km in 1U; teaching example: 10 m/px needed a 3U with Schneider lens | OK | Medium |
| pl-thermal 2.4 kg, 60 m LWIR @500 km, avg 26 W | 60 m | uncooled microbolometer CubeSat TIR: **~200 m GSD fits 3U; ~100 m is the hard edge** (SPIE study); 60 m at 2.4 kg is beyond published uncooled CubeSat capability; uncooled cameras draw ~10–20 W avg, not 26 W avg | **too optimistic (GSD), too pessimistic (avg power)** | Medium | SPIE 10.1117/12.2064910 (Raytheon uncooled TIR for CubeSats); JAXA CIRC wildfire microbolometer 640×480 |
| pl-hyper 4.5 kg, 30 m GSD, **120 km swath**, 22 GB/day | 120 km | real 30 m-class hyperspectral swaths: Intuition-1 (6U, 25 m, **40 km**, 192 bands, 7 GB/scene); PRISMA (570 kg) 64 km; EnMAP (980 kg) 29 km | **too optimistic (swath 3–4× real)**; 22 GB/day acquisition only plausible if swath were as claimed | Medium/High | Intuition-1; eoPortal PRISMA/EnMAP |
| pl-hyper pointing 0.05° | 0.05° | OK: hyperspectral pushbroom needs ~0.01–0.05° → star tracker bus | OK | High | SOA §5 |
| pl-sar “small **C-band** SAR” 9 kg, 130 W peak, **46 GB/day** | C-band | real small SAR is **X-band** (ICEYE 15 kg first-gen → 85 kg gen2 → 120 kg gen4 with 345 W solar, 1.4 kWh battery, 3.2–4 kW *radiated* peak); 46 GB/day implies ICEYE-class power + ≥370 Mbps sustained downlink | **band wrong; GB/day too optimistic ~10× for a 12U-class power budget** (derivation §4.4) | High | ICEYE specs (eoPortal/ESA eogateway); SOA §9 |
| pl-sar GSD 10 m, swath 25 km @ 9 kg | 10 m | defensible for 12U-class X-band (ICEYE gen-2 3 m/30 km needs 85 kg; 10 m at ~10 kg scales correctly) | OK (GSD/swath), Low (mass) | Medium | ICEYE |
| orbits periods 92.6/95.6/96.5/99.0 min | — | sim: 92.4 (400 km), 95.5 (550), 96.5 (600), 99.0 (720) | OK | Low/High | Kepler (checked numerically) |
| orbits eclipse 0.35–0.40 | — | umbra fraction: 0.39 (400 km), 0.37 (550), 0.37 (600), 0.36 (720); max single eclipse ~35–36 min | OK; VLEO/LEO slightly under-stated | Low | formula asin(Re/(Re+h))/π, numerically evaluated |
| orbits contact min/pass 8/9/11/13 | 8–13 | single-station sim with 10° mask: **max pass 6–8.4 min** at 400–600 km; 13 min only with 0° mask at higher altitude | too optimistic | Low (derived) |
| orb-sso passes/day 7 | 7 | for a *target region* (not a station): 2–6 imaging passes/day are typical for 100–150 km swath at 500–600 km SSO; reliable daily revisit of a whole 400 000 km² region needs ~≥100 km swath — the game’s value is a coverage proxy and is defensible | OK as gameplay proxy; label it “over target area” | Low | derived from ground-track node spacing 360°/14.2–14.9 earth-relative tracks/day ≈ 24–25° ≈ 2 700–2 800 km at equator, bunching near max latitude |
| orb-sso drag lifetime 10 yr (600 km) | 10 | NanoAvionics quotes “5-year CubeSat lifetime at 600 km SSO”, 7 yr at 750 km; 400 km is 1–3 yr (solar-cycle dependent), not guaranteed 1.0 | 600 km too optimistic; 400 km OK-to-optimistic depending on cycle | Medium | NanoAvionics M6P platform page (via SOA 2026 §2) |
| orb-geo unavailable | unavailable | Correct: CubeSats do not fly to GEO operationally as EO missions; energy class 4 justified | OK | High | CDS scope (CubeSat = LEO standard); SOA §2 |
| lv-rideshare-s $150 k, 8 kg, 14 mo | $150 k | SpaceX direct: “as low as $350 k for 50 kg to SSO”, extra $7 k/kg (2026 tool: $7 000/kg; 2027: $7 500/kg); small CubeSat slots via aggregators historically ~$40–120 k per 3U; SSO cadence ≈ every 4 months | OK (slot pricing inside historical range); note 8 kg alone doesn’t buy a SpaceX plate ($350 k min) | High | new.spacex.com/rideshare; carrier-space price table 2023–2027 |
| lv-dedicated $1.1 M for 300 kg to class-2 | $1.1 M | dedicated smallsat launch is ~$7.5–12.5 M (Rocket Lab Electron; $7.5 M quoted in IAC-2025 survey, Rocket Lab previously listed ~$12 M), Firefly Alpha ~$16.5 M class | **too optimistic by ~10×** | Medium | newspace.im IAC-2025 small-launcher survey; vendor announcements |
| lv-heavy $2.4 M for 12U to SSO | $2.4 M | a 24 kg 12U on SpaceX rideshare ≈ $350–520 k (1/4 plate 50 kg included + extras); even full plate 300 kg is $350 k base + $7 k/kg | **too pessimistic ~4–6×** | High | new.spacex.com/rideshare |
| gate STRUCTURE_OVERLOAD (array+battery ≤ bus allowance) | — | real deployable arrays on 6U weigh 0.7–4.4 kg (Pumpkin up to 5 kg wings exist on bigger buses); the gate concept matches reality | OK | High | SOA Table 3-2 |

### 1.1 Recommended single game values (adopt these)

| id | new value(s) | why (anchor) | confidence |
|---|---|---|---|
| `bus-3u` | dry 3.0 kg; baseline 8 W; storage 8 GB; pointing 2.0°; array+battery limit 1.5 kg | SP3X 8.1 W panel; 3U limit 6.0 kg total leaves ~2.5 kg payload | High |
| `bus-6u` | dry 6.5 kg; baseline 20 W; storage 32 GB; pointing 0.5°; limit 4.5 kg | GOMspace 6U bus ~6.0 kg; M6P 4.5 kg dry/16 kg max; 6U body arrays 19–28 W | High |
| `bus-12u` | dry 12.0 kg; baseline 24 W body; storage 128 GB; pointing 0.05° (star tracker); limit 10 kg | CDS 12U limit 24.0 kg; GOMspace 12U ~8 kg + real 12U missions carry bigger buses; CubeStar-class ADCS mass ~1–2 kg | High |
| `arr-body` | 8 W; 0.15 kg; 0.12 m² | SP3X/XO-PANEL/Emxys 8.1–8.5 W 3U panels | High |
| `arr-deploy-m` | 24 W; 0.45 kg; 0.45 m² | SP3X Deployable 21.6–22.5 W at 75 W/kg | High |
| `arr-deploy-l` | 55 W; 1.0 kg; 1.0 m² | SP6X Deployable 57.6 W, DHV 55 W | High |
| `arr-deploy-xl` | 135 W; 3.5 kg; 2.2 m²; 12U-only | Pumpkin dual-articulated 135 W @31 W/kg | High |
| `bat-s` | 40 Wh; 0.3 kg | OPTIMUS 40 Wh/360 g; BP4 ≈50 Wh | High |
| `bat-m` | 120 Wh; 0.8 kg | Clyde modules stack (30/40/80 Wh @111–119 Wh/kg) | High |
| `bat-l` | 300 Wh; 1.9 kg | packs up to 250 Wh/kg (SOA range) | High |
| `rf-uhf` | 0.012 Mbps; 0.10 kg; 2 W | AX100 24.5 g + 12–30 g antenna | High |
| `rf-s` | 5 Mbps; 0.30 kg; 8 W | PULSAR-DATA 7.5 Mbps/1 W/100 g class | High |
| `rf-x` | 100 Mbps; 0.35 kg; 20 W | PULSAR-DATA X 50 Mbps/2 W; CUBECOM/SkyLabs up to Gbps; 20 W = TX+SDR+steer | High |
| `gs-single` | 4 contacts/day, 20 min/day; 24 h latency → **8 h** | sim (mid-lat station); UHF/S store-and-forward | Low |
| `gs-network` | 12 contacts/day, 90 min/day | 3–4 station mix incl. one polar (sim: 24 contacts/152 min with home+2 polar) | Low |
| `gs-service` | 22 contacts/day, 165 min/day | 4-station equivalent; AWS/KSAT/ATLAS networks real | Low |
| `pl-visible` | keep; GSD 30 m, swath 100 km, 0.8 kg, 2 GB/day | geometry-consistent; C1U 47 m anchor | Medium |
| `pl-thermal` | mass 2.0 kg; **GSD 100 m at 500 km (limit-case value)**; swath 120 km; avg 14 W; peak 30 W; 3 GB/day | SPIE study: 200 m fits 3U comfortably, 100 m is the published stretch limit — keep 100 m so the wildfire scenario gate (≤100 m) stays solvable but is labeled “frontier hardware”; a 200 m variant could be added as the honest safe option | Medium |
| `pl-hyper` | mass 5.5 kg; GSD 25 m; **swath 35 km**; 6 GB/day; pointing 0.05° | Intuition-1: 6U, 25 m, 40 km, 192 bands, 7 GB/scene raw, onboard crop to 70 MB | High |
| `pl-sar` | **X-band**; mass 12 kg (12U-only); avg 25 W; peak 150 W; **8 GB/day**; GSD 10 m; swath 25 km | ICEYE scaling: 15 kg first-gen → 85 kg gen2 3 m; power-limited imaging budget (derivation §4.4) gives GBs/day, not tens | High/Medium |
| `orb-vleo` | period 92.4; eclipse 0.39; passes 4; contact 6 min; lifetime 1.5 yr | sim; solar-cycle caveat | Low |
| `orb-leo` | period 95.5; eclipse 0.37; passes 4; contact 7 min; lifetime 4 yr | sim + vendor lifetime anchors | Low/Medium |
| `orb-sso` | period 96.5; eclipse 0.37; passes 6; contact 7 min; lifetime 6 yr | sim; NanoAvionics 5 yr @600 km SSO | Medium |
| `orb-sso-high` | period 99.0; eclipse 0.36; passes 8; contact 8 min; lifetime 12 yr | NanoAvionics 7 yr @750 km; 720 km consistent | Medium |
| `lv-rideshare-s` | 8 kg / 3U: $120 000–150 000, 12–14 mo | aggregator slot reality; SpaceX plate minimums noted in UI | High |
| `lv-dedicated` | 300 kg: **$9 000 000** | Electron class pricing ($7.5–12.5 M) | Medium |
| `lv-heavy` | 12U rideshare: **$400 000**, 9 mo | SpaceX 1/4-plate $350 k + adapter/extras | High |

---

## 2. Reference tables by research area

### 2.1 Mass limits, structure, buses

| item | value | confidence | source |
|---|---|---|---|
| CDS max S/C mass | 1U 2.00, 1.5U 3.00, 2U 4.00, 3U 6.00, 6U 12.00, 12U 24.00 kg; >limit requires mission-by-mission approval | High | CDS Rev 14.1 Table 1 |
| “Classic” 1U assumption | 1.0–1.33 kg; 10×10×11 cm | High | CubeSat 101 |
| Project reserve rule | ≥10 % mass/power/schedule reserve | High | CubeSat 101 |
| CubeSat structure mass | 1U 0.118; 1.5U 0.142–0.25; 2U 0.220; 3U 0.352; 6U 0.916–1.94; 12U 1.84 kg | High | SOA 2026 Table 6-1 |
| Standard dims | 3U 100×100×340.5 mm; 6U 100×226.3×366; 12U 226.3×226.3×366 mm | High | SOA Table 6-1 (CDS-compatible variants exist) |
| NanoAvionics M6P (6U) | bus dry 4.5 kg; max S/C 16 kg (over CDS, approved-class missions); payload 7–7.5 kg; payload power 13–18 W sun-pointing; uplink 1 Mbps; downlink 3 Mbps (Light) / 140 Mbps X (Mid/Max); pointing 4.31°/4.40° (Light/Mid, magnetorquers only) vs 0.01°/0.014° (Max, star tracker) | High | SOA Table 2-2 (M6P row) |
| GOMspace nanosat bus | 6U ~6.0 kg; 8U ~6.5; 12U ~8.0; 16U ~8.5 kg | High | SOA §2 (GOMspace row) |
| GOMspace 6U Premium (legacy) | bus 7.5 kg + max payload 4.5 kg = 12 kg total | Medium | GOMspace datasheet PDF (image-only; corroborated by product literature) |
| Clyde Intuition-1 (6U) | 12 kg, 10×20×30 cm, launched Transporter-9, 535 km / 97.5° | High | mission record (Wikipedia-checked launch data) |
| Blue Canyon XB 6U | payload volume 4U; pointing ±0.002° (1σ, 2 star trackers); 50+ CubeSats flown; LEO lifetime claim >5 yr | High | bluecanyontech.com |
| Hosted-payload class (upper bound of “bus”) | GOMspace hosted: 150 W payload power, 0.070°/0.056° pointing | High | SOA Table 2-1 |
| 3U peak-power range of 3U-class buses | 8–400 W (standard to advanced) | High | SOA Table 2-3 |

### 2.2 Power — solar, batteries, MPPT

| item | value | confidence | source |
|---|---|---|---|
| 3U body-mounted panels | NPC SP3X 8.1 W (76 W/kg); XO-PANEL 3U 8.1 W; Emxys 8.2 W (66 W/kg); endurosat solarSideGen2 8.4 W/side (up to 24 W/side); 2NDSpace CORE-03 8.54 W | High | SOA Table 3-2 |
| 6U body-mounted | SP6X-class 19.2–27.8 W (74 W/kg class); SatRev typical 36 W | High | SOA Table 3-2 |
| 12U body-mounted | 19.5–24.4 W (body area per U worsens) | High | SOA Table 3-2 |
| 3U deployable | SP3X Deployable 21.6–22.5 W @75 W/kg; Blue Canyon 28–42 W | High | SOA Table 3-2 |
| 6U deployable | SP6X Deployable 57.6 W; DHV DSA-6U-2D-S 55 W; Blue Canyon 48–118 W | High | SOA Table 3-2 |
| 12U-class deployable | 2NDSpace DROP-12 ~40–70 W/kg class; Pumpkin DCSA 220 W (44 W/kg), 350 W-class wings; Pumpkin dual-articulated 135 W @31 W/kg | High | SOA Table 3-2 |
| GOMspace deployable (DSP) | 1.2 W/cell in LEO, up to 18 W/wing, 163 mm wing span on 6U | High | SOA §3 (GOMspace) |
| Array specific power envelope | 30–76 W/kg across commercial CubeSat products | High | SOA Table 3-2 (spread of rows) |
| Li-ion cell specific energy | 150–270 Wh/kg (lab 450–500) | High | SOA §3 |
| CubeSat pack specific energy | 57–250 Wh/kg: GOMspace BP8 177, BP4 168.8, ISISPACE PBP 156–160, Saft VES16 91, Clyde OPTIMUS 119.4 | High | SOA §3 Table 3-3 |
| Clyde OPTIMUS modules | 30 Wh/288 g; 40 Wh/360 g; 80 Wh/720 g | High | aac-clyde.space battery page |
| GOMspace pack math | BP8 = 8 cells × 3.7 V × ~3.4 Ah ≈ 100 Wh @ ~0.57 kg (derived from cited 177 Wh/kg) | Low (derived from High inputs) | SOA Table 3-3 |
| Big-Sat scale reference | ICEYE gen4 spec: 1.4 kWh battery, 345 W peak solar | High | ICEYE published gen4 spec |
| OBC idle/active examples | EnduroSat OBC I 0.2/1.5 W; OBC II <1/6 W; Clyde Kryten-M3 0.4 W; Sirius 1.3 W | High | SOA Table 8-4 |
| Eclipse sizing rule | LEO eclipse max ~35–36 min; battery must cover eclipse load with DoD limits (typ. daily-cycle DoD ≤60–80 %, packs rated 3000+ cycles) | High/High | SOA §3 (DoD/cycle guidance) |

### 2.3 ADCS

| item | value | confidence | source |
|---|---|---|---|
| Star trackers | CubeSpace CubeStar: 47 g, 0.271 W, FOV 59.4°, 0.02°; NanoAvionics ST-1 108 g/1.2 W/8″; Arcsec Twinkle 40 g; Berlin Space ST200 40 g/0.65 W/30″ — “among the most expensive smallsat components” | High | SOA §5 tables |
| Reaction wheels | CubeSpace CubeWheel CW0017 60 g/0.85 W → CW5000 1.084 kg; NanoAvionics RWO 137 g/3.25 W; Rocket Lab RW3-0.06 235 g/23.4 W (big-vehicle part) | High | SOA §5 tables |
| Magnetorquers | CubeSpace CubeTorquer 16.5–54 g each; ISISPACE 3-axis board 196 g/1.2 W; NanoAvionics MTQ3X 205 g/0.4 W; Clyde MTQ800 395 g/3 W | High | SOA §5 tables |
| Pointing tiers (real products) | magnetorquer-only detumbled ~degrees (M6P Light 4.31°); 3-wheel ~0.1–1°; star-tracker class 0.008–0.05° (CubeStar 0.02°, M6P Max 0.01°, BCT 0.002°) | High | SOA Tables 2-2/2-3 + §5 |
| Sun sensors/coarse modes | 15° to 0.003° span across Table 2-3 3U-class platforms | High | SOA Table 2-3 |
| Rate capability note | cheap trackers track ~0.3 °/s; expensive ~3 °/s | High | SOA §5 |

### 2.4 Comms (space segment) + spectrum reality

| item | value | confidence | source |
|---|---|---|---|
| UHF CubeSat radios | 9.6–38.4 kbps, 24.5–158 g @ ~30 dBm (AX100 24.5 g; AstroDev Helium-100 38.4 kbps/78 g; ISISPACE TRXVU; EnduroSat UHF II) | High | SOA Table 9-3 |
| S-band | 64 kbps–25 Mbps (SLINK-PHY 0.064–4 Mbps/275 g; PULSAR-DATA STX 7.5 Mbps/1 W/100 g; SkyLabs <4 Mbps; CUBECOM STXG2 25 Mbps/137 g; EnduroSat ≤20 Mbps/250 g) | High | SOA Table 9-3 |
| X-band | 25 Mbps–6.3 Gbps (CUBECOM XTXG2 2.5 Gbps/137 g; EnduroSat ≤1.5 Gbps/270 g, SDR class ≤6 Gbps/<2.5 kg; Satlab SRX-8 <1 Gbps/300 g/33 dBm; SkyLabs NANOcast <1 Gbps/164 g; Clyde 50 Mbps/2 W/130 g; Tethers SWIFT 25 Mbps/300 g; Syrlinks EWC27 1.4 Gbps/235 g; CUBECOM µHDTRX-X 1.5 Gbps/250 g) | High | SOA Tables 9-3 + extended transmitter table |
| Ka-band | SpaceMicro microKaTx-300 1 Gbps/1 kg/2 W; ISARA 3U demonstrated **>100 Mbps Ka** with deployable reflectarray | High | SOA §9 |
| TT&C vs downlink split | CubeSats mostly UHF/VHF for TT&C; EO downlink shifted to S/X/Ka; gain ↑ ⇒ pointing gets harder (explicit trade in §9); TechEdSat WiFi demo 1 Mbps | High | SOA §9 |
| Space antennas | UHF turnstile 30–90 g; S patch ~49–62 g (~6 dBi); GOMspace nanoPLUGHF UHF 12 g (210×120×8 mm); MarCO X reflectarray; ISARA >100 Mbps Ka reflectarray on 3U | High | SOA Table 9-2; GOMspace datasheet |
| Ground antenna prices | Isara Ka dishes: 4.9 m $55 k; 7.3 m $75 k; 9.3 m $100 k (published quote); KSATLITE 3.7 m X/S (S uplink) | High | SOA §11.4.1 + Isara |
| Network sizes | KSAT: 100+ KSATLITE + polar 7.3–13 m S/X assets (Svalbard, TrollSat, Punta Arenas, Inuvik, Singapore); ATLAS 34 sites/51 antennas; AWS 5.4 m antennas, per-minute booking, Managed/Dedicated options, data straight to S3 | High | SOA §11.4 (tables + AWS subsection) |

### 2.5 Payloads (EO class anchors)

| payload | specs | confidence | source |
|---|---|---|---|
| Satlantis iSIM-90 | <6 kg (some pages <4 kg), VNIR PAN+MS, GSD 1.65–2 m @500 km, swath 13–23.5 km (SWIR 8.2 km); designed for 12/16U; flown heritage Q4-2021 | High | satlantis.com product page; satsearch datasheet |
| Satlantis iSIM-170 | 15 kg, 0.8 m GSD @500 km, swath 7.5–15 km, 17 W + heating, 500 GB onboard storage | High | satsearch datasheet |
| Satlantis Nova-class for microSats | “40 kg class targeted for miniSats”; SWIR GSD ~4 m @500 km; HORACIO bus (Nova-10-15 host): 22 kg payload allowance, 36 kg max S/C | Medium/High | Satlantis GWF presentation PDF; eoPortal HORACIO |
| PlanetScope (SuperDove) | 8-band, 3–3.7 m GSD, ~24.6×16.4 km frames @475 km; >600 Dove/SuperDove 3U-class sats give daily global land coverage; constellation collects 140–150 M km² range | High | ESA eogateway PlanetScope; Planet docs; newspace.im |
| Intuition-1 (KP Labs/Clyde, 6U) | hyperspectral 470–900 nm, 192 bands, 25 m GSD, 40 km swath; **7 GB raw per image; ~100 GB/day estimated raw; onboard AI crop reduces to 70 MB per image / 300 MB per day downlinked** | High | Intuition-1 mission record |
| PRISMA (ASI, 570 kg) | hyperspectral VNIR+SWIR, 30 m GSD, 64 km swath, X-band 150 Mbps; acquisition ~1 450 GB/day; 446 GB onboard storage | High | eoPortal PRISMA |
| EnMAP (DLR, 980 kg) | 30 m GSD, 29 km swath, 217 bands, X-band 150 Mbps, 12-day revisit (single sat, global) | High | eoPortal/EnMAP site |
| EMIT (NASA, ISS) | imaging spectrometer dirtmapping; ~700 GB/day acquisition scale via ISS relays | Medium | NASA EMIT mission pages |
| GHGSat-D “Claire” (15 kg, 6U-derived) | methane hot-spot imager: **<50 m GSD, 15 km swath**, 12×12 km FOV, >200 000 pixels per frame, 5.4 kg spectrometer, 20×30×42 cm | High | eoPortal GHGSat |
| GHGSat-C1 “Iris” | ~16 kg on SFL NEMO bus; ~25–30 m methane GSD, swath <15 km; VIS imager <20 m GSD/<35 km swath; 512–550 km; peak ~50 W | Medium | eoPortal GHGSat-C |
| ICEYE first gen (X1A/X1B/X2) | **world-first commercial SAR CubeSats, ~15 kg class, X-band 9.65 GHz** (X2 launched Dec-2018) | High | ICEYE/ESA eogateway |
| ICEYE gen2 (current fleet) | 85 kg; antenna 3.2×0.4 m; peak radiated 3.2–4 kW; downlink 140 Mbps → 500 Mbps gen3 → up to 700 Mbps; strip 30 km @3 m, spot 5 km @1 m, scan 100 km <15 m; **15 imaging orbits/day; SLC strip scene 2.9–3.4 GB**; equator-mean revisit 20 h (constellation); repeat 1–22 days single-sat | High | ICEYE specs (eoPortal/ESA/iceye.com) |
| Capella-class commercial X-SAR | first-gen ~165 kg, 1 m, 10–25 km imaging | Medium | vendor specs (archive pages) |
| Uncooled LWIR for CubeSats (study) | 4th-gen 1920×1200 microbolometers: MODIS/VIIRS-class ~200 m fits 3U w/ multiple imagers; ~100 m land resolution is the stretch limit; cryogenic-free | Medium | SPIE 10.1117/12.2064910 (Raytheon) |
| JAXA CIRC | 640×480 uncooled microbolometer IR camera demonstrator **for wildfire detection** — direct mirror for our `pl-thermal` | Medium | JAXA CIRC development paper |
| Fire-detection reality check | operational active-fire products (MODIS/VIIRS) work at 375 m–1 km; a 100 m-class CubeSat IR pass is more than enough to detect fire lines | High | NASA/USGS fire product documentation (MODIS/VIIRS 1 km & 375 m thermal) |

### 2.6 Ground segment & data delivery

| item | value | confidence | source |
|---|---|---|---|
| Single-station contacts (simulated) | mid-lat 45°: 3.3–4.0/day, 20–28 min/day @500–600 km; polar 78°: 10.7–11.0/day, 67–81 min/day; equator: 2.3–3.0/day | Low (our sim; method §4.1) |
| Network contacts (simulated) | home+1 polar: 14/day, 87 min; home+2 polar: 24/day, 152 min; +equatorial: 27/day, 165 min | Low (our sim) |
| Max pass length | 6–8.4 min @400–600 km with 10° elevation mask | Low (our sim) |
| GSaaS models | AWS (per-minute antenna access, DAS dedicated antennas, direct-to-S3); ATLAS Freedom scheduling (VPN, set-and-forget); KSAT capacity/“data as a service”; Leaf Space build/host/operate options | High | SOA §11.4.2 (AWS/ATLAS subsections), §11.4.1 (KSAT) |
| Ops cost reality | owned station ops ≈ site + ops staff + maintenance; service = per-minute or per-GB capacity fees (no public flat rate — treat as quote-driven) | High (models) / no precise numbers claimed | SOA §11.4; vendor pages |
| Latency to product | ground-only latency (contact→S3) is minutes with cloud ground stations; end-to-end “data usable” latency adds processing/calibration → our 3–8 h tier values are defensible for a CubeSat pipeline | Low (design guidance) |
| Store-and-forward norm | most CubeSat EO data is scheduled, recorded, downlinked at next available pass, processed in cloud; latency targets must include storage backlog rules (our DATA_BOTTLENECK gate matches real practice) | High | SOA §11.3/11.4; Intuition-1 (7 GB→70 MB onboard crop as a latency/data hack) |
| UHF-only reality | at 9.6 kbps, 20 min/day of contact returns **≈14 MB/day max**; 1 GB/day of science data with UHF needs ~1.5 days of continuous contact | — (math) | derived §4.3 |

### 2.7 Launch (CubeSat-compatible)

| item | value | confidence | source |
|---|---|---|---|
| SpaceX rideshare (SSO) | “as low as $350 k for 50 kg to SSO”, extra $7 k/kg; plates: 1/4 (50 kg), 1/2 (100 kg), full (200 kg), XL (300 kg); SSO cadence ~every 4 months; rebooking fee 5–10 % | High | new.spacex.com/rideshare |
| SpaceX $/kg by year | 2023 $5 500; 2024 $6 000; 2025 $6 500; 2026 $7 000; 2027 $7 500 | Medium | carrier-space.com (booked from SpaceX rideshare API, Oct-2026) |
| Rocket Lab Electron | 70+ launches by Aug-2025; breakeven since 2023; dedicated price quoted **$7.5 M/flight** in IAC-2025 survey (Rocket Lab’s earlier public list price ~$12 M); capacity ~300 kg to 500 km SSO | Medium | newspace.im IAC-2025 survey; Rocket Lab |
| Firefly Alpha | 6 flights by 2025, listed company 2025; dedicated price class ~$16 M; SSO capacity ~600 kg class | Medium | newspace.im IAC-2025 survey |
| Small-launcher market reality | many dedicated smallsat startups failed/dormant (Astra, ABL, Terran-1 cancelled 2023); “no dedicated small-launch market” claims imprecise — dedicated launch is real but expensive; undersold by rideshare & tugs | High | IAC-2025 survey |
| CubeSat rideshare history for smalls | 3U-class slots historically bought at ~$40–120 k via aggregators (Transporter-era manifests); direct SpaceX now enforces plate minimums | Medium | carrier-space + mission records |
| Adapter/mass overheads | CDS-compatible deployers add mass+cost (vendor separation systems are priced add-ons in SpaceX’s tool) | High | SpaceX Payload User’s Guide V11 §1.4 (referenced by carrier-space summary) |

---

## 3. Derived sanity rules (implement in the game engine)

### 3.1 Solar W per U
- Body-mounted: 3U ≈ 2.7–3 W/U; 6U ≈ 3–4.6 W/U; **12U ≈ 1.6–2 W/U (worse)** — body area scales as U^(2/3). [High: SOA Table 3-2]
- Deployables: 3U ≈ 7.5 W/U; 6U ≈ 9.2 W/U; 12U wings 30–70 W total; Pumpkin-scale 135–350 W only on 12U+. [High]
- Array specific power must stay within 30–76 W/kg. Any game array heavier than W/30 kg is unrealistic.

### 3.2 Battery Wh per U and energy accounting
- Pack specific energy band: 57–250 Wh/kg; **use ~110–150 Wh/kg as default packing mass model.** [High: SOA §3]
- Usable energy per orbit: `E_usable(Wh) = Wh_nominal × DoD_cycle × (0.75 charge efficiency) × sunlit_fraction` with sunlit ≈ 0.63 at 500–600 km (1−eclipse). Daily-cycle DoD should be held ≤60 % unless the battery is “deep-cycle” class. [Low: engineering rule]
- Worked: 6U with 120 Wh pack, 55 W deployable array: sunlit charge 55 W×0.63×96.5 min ≈ 56 Wh/orbit → payload energy budget ≈ 40 Wh/orbit. **This is the number that decides payload duty cycle.**

### 3.3 Duty cycles (and why peak power is the trap)
- Optical pushbroom: acquisition happens in ~1–5 min target windows per orbit; imaging duty ≈ 5–20 % of orbit. [Low: operational rule; matches “targeted tasking” norm in SOA §11 ops text]
- SAR: burst imaging is energy-limited. 12U bus, 150 W peak, 24 W body array @600 km: charge ≈ 24×0.63×96.5 min ≈ 24 Wh/orbit ⇒ SAR transmit ≤ ~6 min/day without deployables; with `arr-deploy-l` (55 W): ~55 Wh/orbit ⇒ ~9 min/day. At 25 km swath × 7.5 km/s: 9 min ⇒ ~100 000 km²/day ⇒ (X-band SLC 4 B/m² at 10 m GSD = 40 KB/km²) **≈ 4 GB/day raw**. Anything larger than ~8 GB/day for a 12U SAR implies ICEYE-class 85–120 kg power systems. [Low derivation on High anchors]

### 3.4 Data volume formulas (Mbps ↔ GB/day ↔ imagery)
- Downlink: `GB/day = rate_Mbps × 0.0075 × contact_min_per_day` (1 Mbps × 60 s = 7.5 MB). Worked: X 100 Mbps × 87 min (home+1 polar) = 65 GB/day; UHF 0.012288 Mbps × 20 min = 0.014 GB/day. **[math]**
- Optical raw: `bytes/km² = (1e6 / GSD_m²) × bands × bytes_per_pixel`; visible 8-band 12-bit: 30 m → ~14 MB per 1 000 km² (30 m, 8 band). Hyperspectral 200 bands 12-bit @25 m: ~416 MB per 1 000 km². SAR SLC 10 m I/Q 16-bit: 40 KB/km². **[math]**
- Scene sanity: Intuition-1 7 GB/image (25 m, 40 km swath, 192 bands) reproduces with the formula at ~110 km along-track — good calibration check. **[High anchor]**
- Acquisition-vs-downlink rule: a satellite can acquire far more than it can downlink (PRISMA 1 450 GB/day acquisition but 150 Mbps X downlink and 446 GB storage). Game gate `DATA_BOTTLENECK` must compare **GB/day acquired vs rate × contacts**, not payload GB/day alone. [High anchor]

### 3.5 Orbits and coverage
- Period: `T = 2π√(a³/μ)` — 92.4/95.5/96.5/99.0 min at 400/550/600/720 km. Eclipse fraction ≈ `asin(Re/(Re+h))/π` = 0.39/0.37/0.37/0.36. Nodal precession for SSO ≈ 1°/day (J2). [High: standard astrodynamics; values our sim reproduces]
- Revisit rule: successive ground tracks are ~24–25° apart in longitude (14.2–14.9 earth-relative tracks/day at 500–600 km → ≈ 2 700–2 800 km at the equator) → **single-sat daily revisit of a broad region requires swath ≥ ~150–200 km at 500–600 km, or target region inside the latitude band where ground tracks bunch near max latitude.** Planet proves the constellation alternative: 600+ sats for daily global. ICEYE proves the middle path: tens of sats → 20 h mean revisit. [High anchors]
- Contact geometry: single 10°-mask station sees a 500 km SSO bird 3–4×/day (mid-lat), ~11×/day from a polar site; a 4-station mix yields 24–27 contacts/150–165 min per day. [Low: our sim]
- Drag lifetime: use vendor anchors — 600 km SSO ≈ 5 yr CubeSat (NanoAvionics), 750 km ≈ 7 yr; scale downward for lower altitudes; solar-cycle caveat (Cycle 25 max 2024–2026 → thermosphere still inflated late 2020s). [Medium]

### 3.6 Structure & harness share
- Structure-only mass ≈ 0.35 kg (3U), 0.9–1.9 kg (6U), 1.8+ kg (12U). [High]
- Harness + deployer + margins ≈ 10–20 % of bus dry. [Low: engineering estimate]
- Rule that keeps CDS honest: `bus_dry + payload + battery + array ≤ CDS form-factor limit` (6 kg/12 kg/24 kg) **or** the mission must be flagged as an “over-limit approved class” (like M6P at 16 kg) and priced accordingly. Recommend the game enforce CDS limits for the 3U/6U/12U catalog and expose the over-limit path only as a scenario exception.

---

## 4. Method appendix for the derived values

- Orbit simulation: circular Keplerian orbits, inclination 97.8° (SSO), Earth rotation 7.2921159e-5 rad/s, ground stations at latitudes 45°/78°/0°/−78°, elevation mask 10°, step 5 s, 3 days; contact defined as any continuous window >0.4 min. Contact-minute totals are geometric maxima (no horizon losses, no rain, no scheduling conflicts).
- Ground-track spacing: 15.05 earth-relative orbits/day for SSO → 360°/15.05 ≈ 23.9° node spacing; bunching toward ±inclination limit computed from sin-latitude mapping.
- Energy and data formulas in §3 are algebra; anchors are the cited High values (panel W, Wh/kg, radio Mbps, SLC GB/scene).

---

## 5. Numbers we must NOT claim as precise

1. **Prices** ($150 k slot, $70 k station, vendor cost columns): real quotes move yearly (SpaceX $/kg rises $500/yr 2023→2027), depend on adapters, I&T, integration fees. Label every money value in the game as “illustrative, 2024–2026 typicals.”
2. **Launch queue months** — real queues swing with vehicle reliability (Electron cadence 16/yr; SSO Transporter ~every 4 months but slots sell ahead). Use ranges, not certainty.
3. **Drag lifetime years** — solar-cycle dependent (Cycle 25 activity elevated through late 2020s); never promise a specific deorbit year at 400–550 km.
4. **Constellation revisit promises** — 20 h (ICEYE), daily (Planet) are *constellation* products with tens-to-hundreds of satellites; do not imply a single CubeSat achieves them.
5. **Exact GHGSat/ICEYE data rates per day** — vendors publish GSD/swath and scene sizes, not their daily GB per satellite; our daily-GB figures for these classes are scene-count estimates.
6. **Vendor component prices and lead times** (build mo columns, build costs) — datasheets give specs, not prices; satsearch-style listings vary and can be stale or export-controlled.
7. **Spectral band sufficiency for methane** (pl-hyper methane score) — real methane detection needs specific SWIR absorption bands (~1.65 µm GHGSat-class or 2.3 µm PRISMA/EmMAP-class); a generic “SWIR/VNIR hyper” in-game methane score is a pedagogical abstraction.
8. **Frequency licensing** — UHF/amateur bands are quasi-free for smallsats; S/X/Ka rights, ITU filings and ITAR/EAR export classification are legal gates the game deliberately abstracts; state that in the help text.
9. **Ground-station service fees** — AWS/Azure/KSAT/Leaf publish models, not comparable flat rates; our “ops USD/yr” tiers are game abstractions.
10. **“10° mask” contact stats** — weather, scheduling priority and antenna ownership reduce real usable minutes; our sim numbers are ceilings.
11. **Thermal-imager game values** — the 100 m GSD uncooled LWIR CubeSat is at the edge of published capability (200 m is the safe published number); keeping 100 m in the catalog is a deliberate “frontier hardware” choice and should be labeled as such in the UI tooltip (SPIE study above).

---

## 6. Source list

Primary (High):
1. NASA CSLI, *CubeSat 101: CubeSat Design Guidelines* v2 — https://www.nasa.gov/wp-content/uploads/2017/03/nasa_csli_cubesat_101_508.pdf (mass conventions, ≥10 % reserves, ground-station chapter guidance).
2. *CubeSat Design Specification* Rev 14.1 (CalPoly CubeSat Developer Resources) — https://static1.squarespace.com/static/5418c831e4b0fa4ecac1bacd/t/62193b7fc9e72e0053f00910/1645820809779/CDS+REV14_1+2022-02-09.pdf (Table 1 mass limits).
3. NASA STM, *Small Spacecraft Technology State of the Art*, NASA/TP−20260003140 (2026) — https://www.nasa.gov/smallsat-institute/sst-soa/ ; chapters used: 2 Platforms, 3 Power, 5 GNC, 6 Structures, 8 Avionics, 9 Comms, 10 Launch, 11 Ground Data Systems.
4. SpaceX Smallsat Rideshare program page — https://new.spacex.com/rideshare ($350 k/50 kg SSO, $7 k/kg, plates, cadence).
5. AAC Clyde Space product pages (OPTIMUS batteries, PULSAR radios, MTQ800, EPIC VIEW) — https://www.aac-clyde.space .
6. Satlantis product pages (iSIM-90, iSIM family) — https://www.satlantis.com ; datasheet mirror: https://satsearch.co/products/satlantis-isim-90 and …/satlantis-isim-170 .
7. eoPortal mission pages — ICEYE, GHGSat, PRISMA, EnMAP, Planet (Flock), HORACIO — https://www.eoportal.org .
8. ESA Earth Online gateway — PlanetScope, ICEYE entries — https://earth.esa.int/eogateway .
9. Blue Canyon Technologies product pages (XB CubeSat line, pointing) — https://www.bluecanyontech.com .
10. NASA EMIT mission pages — https://science.nasa.gov/mission/emit .
11. NanoAvionics M6P platform data as tabulated in SOA 2026 §2 (lifetime claims included).

Secondary (Medium):
12. Puschell & Masini (Raytheon), “Uncooled emissive infrared imagers for CubeSats,” SPIE (2014) — https://doi.org/10.1117/12.2064910 .
13. JAXA CIRC development paper — https://circgs.tksc.jaxa.jp/documents/2012/83533J.pdf .
14. Kulu, *Small Launchers — 2025 Survey and Competitive Landscape*, IAC-2025 — https://www.newspace.im/assets/Small-Launchers-2025_Erik-Kulu_IAC2025.pdf (Electron $7.5 M, market failures).
15. Carrier Space, “SpaceX Rideshare Price per kg by Year (2023–2027)” — https://carrier-space.com/news/spacex-rideshare-price-per-kg-by-year .
16. Intuition-1 mission summary — https://en.wikipedia.org/wiki/Intuition-1 (cross-checked against Clyde/KP Labs releases).
17. Aerospace Corporation, *2022 Small Satellite Propulsion Technologies Compendium* (ICEYE-X2 listing context) — https://aerospace.org .
18. Satlantis “Sustainable Partner for High-End EO” GWF presentation (Nova-class masses/swaths) — https://geospatialworld.net/gwf/presentations/plenary/plenary4/Sustainable-Partner-For-High-End-EO-HERNANI_Satlantis.pdf .

Derived by us (Low, methods shown in §4): contact/pass statistics, pass lengths, duty-cycle ceilings, SAR/optical GB/day ceilings from the §3.4 formulas, energy-accounting rules.

**Usage terms (respect these in the game and its docs):**
- NASA: text and imagery from nasa.gov are generally not copyrighted in the U.S.; retain attribution (“Credit: NASA”) and do **not** use the NASA logo/insignia or agency identifiers in a way that implies NASA endorsement (NASA branding policy). The SOA 2026 report is a NASA technical publication — cite, don't republish wholesale.
- JPL/CalPoly CDS: the CubeSat Design Specification is distributed for the CubeSat community under the CubeSat standards policies; follow current-version rules and attribute.
- eoPortal (ESA/ESaero): content is available for non-commercial use with attribution to eoPortal and the mission PI; re-publication requires permission.
- CSA (Canadian Space Agency) material, e.g., RADARSAT-2 references: Crown Copyright — reproduce with attribution and non-commercial use.
- GMAT (used anywhere in tooling): Apache-2.0.
- JPL Small-Body/mission data via NASA CML: CC0 (attribution encouraged).
- Vendor datasheets (Clyde, GOMspace, Satlantis, Rocket Lab, SpaceX): specs are cited as published facts; do not copy datasheet graphics into the game UI without permission; prices quoted are public-page snapshots as of Nov-2026.
