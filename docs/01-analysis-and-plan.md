# Step 1 — Analysis, Context, and Plan

**Challenge:** Space Mission Design Game — 2026 NASA Space Apps Challenge (theme: *The Next Frontier*)
**Official page:** https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/
**Difficulty / subject:** Beginner-Youth + Intermediate · Games · Partner agency: CSA (1) · 9 official resources
**Local event:** NASA Space Apps Dnipro (Noosphere Engineering School), online + in-person, Nov 14–15 2026
**Author of this doc:** Step 1 of the agreed workflow (analysis → rules → code). No game rules and no code are defined here beyond outline level.

---

## 1. What the challenge actually requires (verified)

I retrieved the full official challenge statement text (mirrored verbatim by the HackAthlone 2026 local-event page, which links back to the official page; the official page itself is JS-gated from this sandbox).

### Hard requirements (the submission fails without these)

1. An **interactive game** (playable, not a document, calculator, or video).
2. The player **designs a complete mission** — objective + spacecraft + instruments + launch vehicle + orbit.
3. The player **manages limited resources** — the statement names exactly six: **Mass, Power, Budget, Data, Communications, Time**.
4. The player **simulates** the mission and sees **how each choice shaped success**.
5. The outcome must show **consequences and trade-offs**, i.e. decisions must couple to each other ("adding a more capable instrument may increase scientific value while also increasing mass, power consumption, data volume, and cost").

### Explicitly optional (do not spend core hours on these)

Everything else in the statement appears under "You may (but are not required to) consider the following" — including: single-player **or team play with up to 4 participants**, differentiated roles, difficulty levels, multiple scenarios, random events, realistic/simplified 3D spacecraft models, interactive spacecraft visualizations, real-time resource dashboards, leaderboards, generated mission reports, save/share/compare designs, competitive scenarios, sandbox mode, post-mission analysis.

> Strategic consequence: **team-mode, 3D, leaderboards, and sandbox are differentiators, not requirements.** They enter only after the loop works.

### The statement's own suggested flow

> define mission objective → establish mission requirements → design spacecraft → select instruments → choose launch vehicle and orbit → manage budget/mass/power/communications/data/lifetime → simulate → evaluate → understand the trade-off.

This maps 1:1 onto NASA's own systems-engineering sequence and onto the four mission segments (**launch / space / ground / user**) from the "Design and Develop Science Missions" resource. Our game should follow this flow rather than inventing one.

---

## 2. Judging and submission constraints (verified)

- Judged **1–5** on each of: **Impact, Creativity, Validity, Relevance, Presentation** — at local *and* global level.
- A **demo is required**: either a slide deck (**max 7 slides** including title/intro) **or a video of 30 seconds or less**, hosted on an external site / cloud host / code repository.
- If hosted on a new website, NASA recommends requesting a **web-filter classification** so judges can actually open it.
- **Project submission window:** Sat Nov 14 09:00 → Sun Nov 15 **23:59 local time**. Team size max 6.
- Local events typically give each team a very short pitch (many 2025–2026 local events used **~3 minutes**). *Assumption to confirm with the Dnipro local lead.*

**Operating principle derived from this:** the product must be understandable and playable by a judge **in under 3 minutes, unassisted**, and the 30-second demo must show one complete trade-off reversal, not a flyover.

### How we will answer each criterion

| Criterion | Our concrete answer |
|---|---|
| Impact | A student completes one real mission design loop and can afterwards explain why a bigger instrument broke the mission. |
| Creativity | Failure modes are *named, diagnosed, and repairable* — the game teaches by breaking the mission, not by scoring points. |
| Validity | Every mechanic is traceable to a named NASA/JPL source; simplified values are labelled as simplified. |
| Relevance | Models the four mission segments and all six named resources, with a real launch-compatibility check. |
| Presentation | Live dashboard updates on every click; 30-second demo shows science ↑ → comms ✗ → power ✗ → mass ✗ → budget ✗ → success. |

---

## 3. Environment findings (checked in this workspace)

| Item | Result | Consequence |
|---|---|---|
| Repo | `nasa-space-apps`, remote `github.com/TheGreatestProgrammerThatEverL1ved/nasa-space-apps`, 1 commit, essentially empty | Build here directly; push + GitHub Pages is the deployment path |
| Node / npm | Node **v22.23.5**, npm **10.9.9** | Vite 5/6 + React 18 + TS fine |
| npm registry | Reachable (`npm ping` → PONG) | Dependencies installable |
| github.com | HTTP 200 | Push + Pages works |
| `spaceappschallenge.org` from sandbox shell | Unreachable (TLS/DNS block) | Challenge text must come from mirrored copies; **submission itself must be done from the team's own browser**, not this sandbox |
| `gh` CLI | Present | Can create the public repo / release |
| Browsers | Chrome + Firefox installed | Local QA + screen recording for the 30 s demo |

---

## 4. Product definition (to be turned into rules in Step 2)

**Working name:** `MISSION FORGE` — a CubeSat mission trade-off game. *(Name confirmed in Step 2.)*

**One sentence:** *You are the mission team; you pick science hardware to meet a real science requirement, and every choice immediately breaks or saves your mass, power, budget, data, and communications margins.*

### Core loop (the only thing that may never be cut)

```
MISSION BRIEF (measurable science requirement)
   ↓
CONFIGURE (payload → bus → power → comms → orbit → launcher)
   ↓  live dashboard recalculates on every click
CONSTRAINTS BITE (named failure modes appear)
   ↓
REVISE
   ↓
LAUNCH + SIMULATE (timeline of mission events derived from the margins)
   ↓
VERDICT + POST-MISSION ANALYSIS ("why", with a specific repair hint)
   ↓
REPLAY / COMPARE designs
```

### Design pillars (Step 2 will formalize these into rules)

1. **Requirements first, hardware second.** A scenario starts with measurable requirements (revisit interval, required data return per day, mission duration), never with a rocket.
2. **Every decision touches ≥ 2 resources.** No option is a pure upgrade. Coupling is the gameplay.
3. **There is no single optimal build.** Several architectures must pass the same scenario with different verdicts; the game reports a Pareto-style profile instead of one score.
4. **Failure is the teacher.** Each failure mode is named, explained in plain language, and paired with a specific, discoverable fix.
5. **Deterministic engine, optional chaos.** Simulation interprets computed margins; random events are a later overlay, never a dependency.
6. **Plain-language concepts.** Altitude, payload capacity, power budget, data rate, downlink window are taught *inside* the UI with short ⓘ explainers citing NASA sources.

### Scenario plan (3 scenarios = the optional "difficulty levels", used as our demo arc)

| # | Scenario | What it forces the player to learn |
|---|---|---|
| 1 | **Wildfire / active-fire monitoring** (thermal imager, frequent revisit) | payload ↔ power ↔ data ↔ downlink bottleneck |
| 2 | **Coastal flood mapping** (SAR or optical, revisit ≤ 3 days, ≥ 80 GB/day, 12 months) | orbit ↔ coverage ↔ ground-segment contact windows ↔ mass ↔ launcher |
| 3 | **Greenhouse-gas (methane) plume survey** (swath vs resolution tension, long lifetime) | instrument selectivity ↔ orbit ↔ lifetime ↔ budget reserve |

One shared component library serves all three, so scenario cost is data-only, not code.

### Resource model (exactly the six from the official statement)

`MASS · POWER · BUDGET · DATA · COMMUNICATIONS · TIME` — each shown as *used / available* with a margin, never as a bare number.

### Simulation architecture (outline only — rules come in Step 2)

```
Science objective
   → required measurements (revisit, resolution, coverage, duration)
      → payload choice      → mass, watts, GB/day, cost, science value
         → bus choice      → dry mass, baseline watts, storage, cost
            → power system → generated watts, mass, cost
            → radio + ground segment → downlink GB/day, contacts, cost
         → orbit choice   → revisit, coverage, contact windows, launch energy, lifetime drag
            → launch vehicle → max payload mass to that orbit, cost
               → feasibility gates → simulation timeline → verdict + diagnosis
```

Failure modes the engine must name (this is the heart of the game):
`LAUNCH_INCOMPATIBLE`, `POWER_DEFICIT`, `DATA_BOTTLENECK`, `STORAGE_SATURATED`, `DOWNLINK_WINDOW_MISSED`, `OVER_BUDGET`, `SCIENCE_REQUIREMENT_UNMET`, `LIFETIME_SHORT` (drag/deorbit), `POINTING_UNSTABLE` (ADCS vs mass/instrument slew).

### Deliverables for the submission package

1. Playable, publicly reachable game (GitHub Pages, correct `base` path).
2. Public repository + **README** containing: problem, solution, gameplay, NASA foundation, engineering model with explicit assumptions, data attribution/licensing, architecture, accessibility, limitations, how to run.
3. **30-second demo video** (or ≤7-slide deck) showing one full trade-off reversal.
4. A source/attribution sheet: NASA design-and-develop guide, GMAT (Apache-2.0), JPL CML dataset (CC0), Goddard Mission Design Lab, Mission Viz, Build-It-Yourself telescope game, CubeSat 101, 2023 VR challenge, CSA games — plus the explicit statement that **simplified values are educational approximations**, and no implied NASA endorsement (NASA insignia/logos are protected even though most NASA media is not copyrighted; CSA material is Crown copyright).
5. NASA submission-form text: what it does, how it works, tools/languages used, why it is creative, intended impact, accessibility/cost considerations, and disclosure of AI/SI tool use as the 2026 form requests.

---

## 5. Technology decision (fixed now, implemented in Step 3)

**Vite + React + TypeScript + plain CSS.** No backend, no database, no auth, no WebGL required for the MVP.

- The game *is* a state-heavy configuration UI + deterministic simulator + results dashboard — exactly what React is good at, and exactly what Phaser/Three.js would waste a hackathon on.
- State: `useReducer` + context (no extra state library) → fewer dependencies, faster, more reliable build.
- Visuals: crisp 2D "control room" aesthetic — CSS grid dashboard, SVG orbit/ground-station diagram, CSS-animated launch/timeline. **2D orbit + ground-station contact diagram, not 3D Earth.** This directly serves the Mission Viz lesson (trajectory/geometry makes the abstraction concrete) at ~1/20 the risk.
- Charts: hand-rolled SVG bars/sparkline instead of Recharts (fewer deps, full styling control, accessible text labels).
- Persistence: `localStorage` (save/load/compare designs) — free, offline-friendly, satisfies the optional "save and compare" feature.
- Accessibility as a selling point (NASA's own telescope game admits it lacks accessibility): full keyboard operation, focus order, ARIA labels, warnings that use text + icon and not colour alone, reduced-motion path, "skip animation", scalable text, laptop/tablet responsive.
- Deploy: GitHub Pages (`gh` CLI available). Verify `base` path and that a fresh browser with no extensions can play it end to end.

Explicitly **not** building for the MVP: networking/multiplayer servers, accounts, leaderboards, Docker, 3D models, real GMAT integration, orbital propagators. GMAT (Apache-2.0) is used only as a *validation reference* in our write-up.

---

## 6. Scope ladder and cut order

**MVP (must exist, "complete ugly game" target):** 1 scenario end-to-end, 6 categories × 3 options, live 6-resource dashboard, all 9 named failure modes, deterministic timeline, verdict + diagnosis with repair hint, replay.

**v1.1 (this weekend, high value):** 3 scenarios + difficulty labels; localStorage save/compare; ⓘ concept explainers with citations; SVG orbit + ground-station window diagram; mission report card; README + 30 s demo.

**v1.2 (stretch, only if MVP is done early):** local 4-role mode with private objective cards (Science Lead / Spacecraft Engineer / Flight Dynamics / Program Manager) on one screen — the collaboration requirement satisfied with zero networking; one random in-flight event with a decision prompt; budget reserve mechanic; difficulty presets.

**Cut immediately if behind (in this order):** random events → role mode → orbit diagram polish → scenario 3 → save/compare → animation → audio.
**Never cut:** objective, component choices, coupled resources, simulation, explanation, working public demo.

---

## 7. Plan for the remaining steps of the agreed workflow

### Step 2 — Game rules (next prompt, rules only, no implementation)

1. Rule set written as a spec: entities `Mission`, `Payload`, `Bus`, `PowerSystem`, `Comms`, `Orbit`, `LaunchVehicle`, `GroundSegment`; the six resources; unit conventions.
2. **Coupling matrix**: for each component attribute, which resources it changes and how (linear terms + documented coefficients).
3. Derived quantities: total mass, power balance incl. eclipse duty cycle, data generated vs storage vs downlink per day, cost roll-up with **10–15 % reserve**, mission lifetime vs drag, launch energy class vs launcher capability.
4. **Feasibility gates** (hard) and **score dimensions** (soft): science return, engineering margin, budget performance, reliability, requirement satisfaction → verdict bands (`SUCCESS` / `SUCCESS WITH LIMITATIONS` / `PARTIAL` / `FAILURE`) with explicitly labelled weights as *our design choice*, not a NASA formula.
5. Timeline/event rules: which margin produces which event at which day, and the diagnosis → repair-hint text for all 9 failure modes.
6. Scenario briefs with numeric requirements for the 3 missions; component data tables with a credibility label per value (`real-world-derived` / `educational approximation`).
7. Difficulty presets and the 4-role optional mode rules.
8. Explicit assumptions + source mapping per mechanic (Validity evidence sheet for the README and pitch).

Output: `docs/02-game-rules.md` (+ `docs/03-engineering-basis.md` citation map).

### Step 3 — Game code (final prompt)

Sub-steps, in build order (each with an acceptance check):

1. Scaffold Vite/React/TS, Pages base path, repo push. *(check: builds and serves)*
2. `src/data/` component + scenario tables exactly as specified in Step 2 — kept UI-free. *(check: scientist-editable JSON-like TS with no React imports)*
3. Pure simulation engine in `src/simulation/` — `evaluateMission()` + `runMissionTimeline()` with **unit-testable, deterministic** outputs, zero React. *(check: pure functions, no randomness in MVP)*
4. Configure screen: option cards, live dashboard, gate badges, instant recalculation. *(check: keyboard-only play)*
5. Failure-mode surfacing + repair hints in the UI. *(check: every failure name reachable and explained)*
6. Simulate screen: launch + day-by-day timeline animation with skip button. *(check: skip works, reduced motion respected)*
7. Results/analysis screen + multi-dimensional report card + save/compare. *(check: full loop replays in < 3 min)*
8. Explainers/citations layer + accessibility pass + polish + README + 30 s demo script.
   *(check: fresh browser, no console errors, one unfamiliar judge can complete scenario 1 alone)*

### Submission track (runs in parallel, done by the team in their own browser)

Confirm the Dnipro presentation format → fill the Space Apps project form → attach demo link → attach repo → submit **before 23:59 local Sunday**, ideally with 2 hours of buffer.

---

## 8. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Time: ~36 h left, submission already open | MVP first, "complete ugly game" before any visual work; cut order pre-agreed above |
| Judges can't open the game (filter/geo/paths) | GitHub Pages + test in a fresh profile + check asset `base` path + request web-filter classification |
| Numbers challenged as "fake physics" | Per-value credibility labels + citation map + an explicit Limitations section |
| Scope creep into 3D/multiplayer | Explicitly deferred to v1.2; MVP loop is the gate |
| 30 s demo is too short to explain | Demo shows exactly one reversal chain, no menu tour; the deck version as fallback (≤7 slides) |
| Official page unreachable from the dev sandbox | Statement captured verbatim from mirrored local-event copy; team submits from their own browser |
| AI/SI disclosure expectations in 2026 form | Document tool use honestly in the submission text |

---

## 9. Confirmed decisions (Step 1 sign-off — binding for Steps 2 and 3)

| # | Decision | Locked value |
|---|---|---|
| 1 | Scenario structure | **3 Earth-observation CubeSat scenarios** (wildfire / coastal flood / methane survey) sharing **one** component library |
| 2 | Collaboration mode | **Stretch goal (v1.2)** — data model must be written so role cards can be added later without refactoring; never blocks the MVP |
| 3 | Team capacity | **1–2 implementers** for the remaining ~36 h → strict MVP first, v1.1 trimmed to essentials |
| 4 | Name | **MISSION FORGE** |
| 5 | UI language | **English primary + Ukrainian toggle** (`en` / `ua` string tables, no hard-coded UI text in components) |

**Scope consequence of 1–2 people:** the v1.1 list is reduced to *3 scenarios, save/compare, ⓘ citations, SVG orbit + ground-station diagram, mission report card, README, 30 s demo*. Anything else (role mode, random events, audio, animation polish) is explicitly optional and must not start before the MVP acceptance check passes.

Step 2 is next on request: the full scientifically grounded rule set.
