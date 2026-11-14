# MISSION FORGE — implementation plan for review

**Status: planning only; execution is not authorized.** Baseline: reviewed commit **`8f07eb64d39cf10240b30c359f4a766972941eaf`** on **`mission-forge`**. This request passes the documentation-review gate and authorizes this plan, not application edits, dependency installation, scaffolding, or deployment. Stop for human approval of the plan before coding; review the implementation again at delivery.

Authority remains the [technical rulebook](game-rules-technical.md), derived from the [audited 14 November 2026 Step 2 record](02-game-rules.md). The [player guide](game-rules-player.md), [workflow](agent-workflow.md), and [agent entry point](../AGENTS.md) remain applicable. Their earlier documentation-phase stop records are historical; this planning authorization does not waive their execution gate. Decisions below resolve representation and delivery questions, **not science thresholds or hardware performance**.

## 1. Starting state and preservation

Preflight confirmed the requested local checkout/origin, branch, exact baseline HEAD, and equality with `origin/mission-forge` after fetch. Reuse that branch: no additional branch, worktree, PR, merge to `main`, reset, clean, or force-push.

| Inspected input | Finding and implementation consequence |
|---|---|
| Tracked repository at the baseline | Documentation and `.gitignore`; no tracked runnable application. A fresh clone of this commit is not the local scaffold. |
| Local application | Untracked `src/App.tsx` is a Vite counter/links starter; `src/main.tsx` mounts it with React StrictMode. `App.css`/`index.css`, `index.html`, `public/`, and starter assets exist. Inspect/adapt in place after authorization; do not rerun a scaffold generator over them. |
| Actual dependency lock | React/React DOM **19.3.1**, Vite **8.3.8**, TypeScript **7.0.2**, React Vite plugin **6.3.0**, oxlint **1.93.0**; lockfile v3. Do not downgrade to older Step 1 example versions. Inspected installed versions agree for the checked packages. |
| Existing scripts | `npm run dev` → Vite; `npm run build` → `tsc -b && vite build`; `npm run lint` → oxlint; `npm run preview` → Vite preview. **No test script or test runner is present.** |
| TypeScript/lint setup | Strict type-only import behavior (`verbatimModuleSyntax`), `erasableSyntaxOnly`, unused checks, React hooks linting. Use discriminated unions/type aliases, not enums requiring runtime emit. |
| Older domain files | `src/engine/types.ts` and `constants.ts` are untracked user inputs, not an accepted contract. They contain partial-pass bands, blended verdicts, generic affinity, capped pointing penalties, inferred coverage/revisit, and guessed drag life. Do not reuse those semantics. |
| Vite/public paths | No configured Pages `base`; starter icon/favicon references use root-relative URLs. Verify the repository subpath during delivery, not just localhost. |
| Other local work | Modified `.gitignore`; untracked package/config files, Step 1 and research drafts, assets, and source scaffold. Preserve all of them. Private `opencode.jsonc` is not a project deliverable. |

Before execution, repeat status/diff/hash inspection against these inputs and the approved plan; pause on overlapping user edits rather than overwriting them. Adopt only the application/package/config paths actually needed for an approved slice, with their changes inspected and explicitly staged by the orchestrator. Reuse the existing scripts/config where possible. Do not publish unrelated research, private config, dependency directories, build outputs, or unused assets just because they are local.

Only this new Markdown plan is to be committed during planning. No application build, lint, test, install, or dev-server run is claimed for this phase.

## 2. First milestone: a playable failure → repair loop

**M1 is the first coding milestone, not an evaluator-only preparatory milestone.** Its acceptance is a keyboard-operable React/TypeScript/Vite browser loop, with native part selectors, Run, six resource summaries, an explained verdict, one-choice repair, and retry. A complete text result precedes animation or visual polish.

### 2.1 First end-to-end case

Select `pl-thermal`, `bus-12u`, `arr-deploy-l`, `bat-m`, `rf-x`, `orb-sso-low`, and `lv-heavy`; start with **`gs-single`**. Use the audited one-year, $3M, 36-month fixture and accepted provisional tracking/link assumptions. Run, then change **only ground** to **`gs-network`** and run again.

| Evaluator result | WF-B with `gs-single`: first failure | WF-B with `gs-network`: repair |
|---|---:|---:|
| Contacts/day, each 6 min | 4 | 12 |
| Actual modeled payload capacity with accepted closing link | 12.6 GB/day | 37.8 GB/day |
| Generated stream, unchanged | 3.1850496 GB/day | 3.1850496 GB/day |
| Accepted useful products, unchanged | 1.91102976 GB/day | 1.91102976 GB/day |
| Stable periodic queue peak /102.4 GB usable | 0.78299136 GB | 0.25214976 GB |
| **Fixture latency bound /≤6 h** | **7.1 h: NOT_MET** | **3.1 h: MET** |
| Allocated spacecraft mass /24 kg | 19.7685 kg | 19.7685 kg |
| Total USD including reserve/ops | 2,662,250 | 2,921,000 |
| Schedule /36 months | 31 months | 31 months |
| Outcome | **FAILURE** | **MODEL_PASS_PROVISIONAL** |

The failing variant's only failed hard check is **WF-LATENCY**, diagnosed with `SCIENCE_REQUIREMENT_UNMET` and detail `WF-LATENCY`; it is not `LINK_UNCLOSED` or a data bottleneck. The radio is already fast enough. Explain: **“More Mbps cannot create a missing contact; try more frequent ground contacts.”** Repair increases total cost by $258,750; compare setup **and** annual operations rather than assuming every higher-contact option costs more in every dimension. Repaired WF-B has the audited budget warning (2.633% headroom) and schedule warning (five months slack). Warnings do not negate a pass.

Useful bytes are capped by generation before the 60% acceptance factor: **not** `12.6×0.60` or `37.8×0.60`. A high-capacity radio does not create extra images.

### 2.2 Work inside M1

1. **Contract and harness handoff inside the slice:** the orchestrator freezes §3, adopts the required existing scaffold paths after inspection, and owns package/config edits. Add compatible unit/component/browser test tooling only after execution approval; verify actual compatibility with this locked React/Vite/TS stack first.
2. **Build UI and evaluator concurrently:** the UI initially uses exact-key, complete report fixtures for the two configurations above through the same provider interface. Display **“Fixture preview — sample report, not a fresh evaluation.”** An unmatched configuration produces a presentation-only “Not available in this preview” state, never a fabricated verdict. No lookup fallback based on just `groundId`.
3. **Replace preview with the real pure evaluator before M1 is complete:** compute every hard gate applicable to selectable configurations, not a hard-coded `groundId` verdict. The first browser acceptance must run the real evaluator for both cases. Do not release a mixed silent preview/real path or mark unimplemented gates MET. Until its real path is ready, unsupported configurations stay explicitly non-evaluating.
4. **Acceptance walkthrough:** Tab/Shift-Tab to labelled selectors, use native keyboard selection, activate Run with keyboard, read failure and repair text, return to the ground selector, choose network, and Run again. A visible results heading receives focus and summarizes the failing requirement/repair; an accessible link returns focus to the ground selector. No pointer or animation is needed.
5. **State correctness:** store draft configuration separately from the evaluated immutable snapshot. Any edit marks old results visibly stale (also announced); they must not be presented as the edited design's verdict. Run replaces the report; no silent success or animation-driven change. Language switching preserves configuration, result, and stale state.
6. **English and Ukrainian in the first loop:** all player-facing controls, brief, resource labels, values/units, warnings, verdicts, repair hints, and fixture disclaimers have both dictionaries; update document `lang` (`en`/`uk`). Use locale keys `en`/`ua` to remain consistent with the existing convention, mapping `ua` to standard `uk`/`uk-UA` browser metadata/formatting. No raw translation keys or engine reason codes as the sole explanation.
7. **M1 done:** a real-evaluator browser test performs the complete failure/repair loop in both languages; all six resources have text explanations; result focus/staleness is tested; build/lint and the focused evaluator tests pass. A fixture-only UI is an integration checkpoint, **not milestone completion**.

M1 may expose the complete, audited selectable catalog as its evaluator support lands. Show all eight part categories, even where the only supported option is fixed. Do not require a new uncosted payload to make the first loop interactive: the ground choice already supplies the required meaningful repair.

## 3. Shared evaluator contract — one owner, one verdict

**Canonical future path:** `src/engine/types.ts`, migrated by the orchestrator only after plan approval. This is a new contract revision, not an extension of the old partial-pass interfaces. All data, evaluator, fixtures, UI, and later presentation import it using type-only imports as appropriate; no duplicate UI report types. Use readonly JSON-serializable data. No React, DOM, wall clock, storage, random source, vendor network call, or localization formatting in the evaluator.

### 3.1 Boundary and identity

Planned API:

```text
evaluateMission(request: unknown, context: EvaluationContext): EvaluationReport
ReportProvider.evaluate(request: unknown): EvaluationReport
deriveTimeline(report: EvaluationReport): TimelineView
```

`evaluateMission` validates at runtime, not just through TypeScript. `ReportProvider` is an integration seam for the short-lived preview versus real implementation, not a second rule engine. Timeline derives from the report and cannot change its outcome.

| Contract record | Required fields and semantics |
|---|---|
| `EvaluationContext` | Immutable catalog, scenario, fixture and policy snapshots; explicit `modelRevision`, `contractRevision`, `catalogRevision`, `scenarioRevision`, `fixtureRevision`. IDs resolve against these snapshots, not global mutable imports. |
| `MissionConfiguration` | `scenarioId`; eight IDs: `payloadId`, `busId`, `arrayId`, `batteryId`, `radioId`, `groundId`, `orbitId`, `launcherId`. Active scenario ID remains `wildfire`; displayed mission is Return the Heat Map. Budget, duration, workload and tracking fixture are not user-supplied overrides. |
| Evidence/fixture inputs | Explicit target-access, contact, receiver/link, operating-mode, tracking and life assumptions, including accepted provisional profiles. Production context uses the audited fixture. Controlled test contexts can disable or mark evidence unknown without becoming player hardware options. |
| Run identity | `configurationKey` from fixed-order IDs **and all snapshot revisions**, echoed immutable configuration, plus model/contract revisions. UI adds its own attempt ID. Changing context must invalidate preview matches and stale results. No timestamp is needed for deterministic identity. |
| `EvaluationReport` | `origin` (`evaluator` or `reference-preview`), validation, echoed normalized input when possible, outcome, seven science checks, engineering checks, metrics, counts, diagnostics, warnings, assumptions/source references, and timeline eligibility. All computed results refer to the same snapshot. The real evaluator always emits `evaluator`; a preview provider cannot conceal its origin. |

Use explicit suffixed units throughout: `massKg`, `arrayWhOrbitBOL`, `arrayWhOrbitEOL`, `batteryUsableWhEOL`, `peakW`, `generatedGBDay`, `effectiveDownlinkGBDay`, `queuePeakGB`, `latencyHours`, `scheduleMonths`, `plannedYears`, `totalUsd`. Store rates in line Mbps and efficiencies separately. Distinguish W from Wh, kg spacecraft from kg slot, native GSD from effective scale, nominal contact time from effective service, and funded duration from hardware/orbit support.

### 3.2 Evidence and non-finite values

An input evidence field is either:

- **Known:** `{ state: "known", value, provenance, sourceRefs, assumptionIds }`; `provenance` is `verified-reference`, `derived`, or `provisional`. Derived values retain input field references and inherited assumptions. A primary source ID does not upgrade [P] inputs.
- **Explicitly unknown:** `{ state: "unknown", missingEvidenceIds, ruleRef }`; never substitute zero, an optimistic default, or a vendor reference with a different quantity.

Use a tagged metric result: **finite** (full-precision numeric value, unit, evidence), **unknown** (missing prerequisites), **unbounded** (e.g. no delivery service with positive generation), or **not-applicable** (e.g. stable-periodic peak for an unstable queue). Never serialize NaN/Infinity or use `null` to mean all of zero, missing, infinite, and not applicable. Display rounding is outside the evaluator.

Catalog records separate product fields rather than the old generic `powerW`: array rating, bus housekeeping, payload active/idle/peak, radio transmitting DC, battery Wh/DoD/discharge W, and each field's source/provenance. Include explicit package compatibility, omni versus directed antenna, spectrum ranges, camera geometry/exposure/product plan, booked spacecraft/slot/adapter limits, and independent target/contact fixture references. No generic affinity, fixed latency by ground tier, inferred revisit, or drag-life field supplies missing evidence.

### 3.3 Validation, requirements, and precedence

- **Malformed/omitted configuration**, unknown IDs, non-finite known numeric values, wrong units, or out-of-domain physical values: `validation.kind="invalid"`, diagnostic `INVALID_INPUT`, outcome **FAILURE**. Preserve independently evaluable known failures; mark dependent checks UNVERIFIED with a “not evaluable: invalid prerequisite” explanation. Never pretend an invalid field was evaluated.
- **Explicit unknown evidence** in a structurally valid context: validation remains valid; dependent checks are **UNVERIFIED**. Known incompatible but fully specified products are valid input and fail the relevant compatibility gate, not a schema shortcut.
- A recognized deferred scenario request returns **DEFERRED**, no playable result. Unknown scenario IDs are invalid. A malformed request is not rescued by a deferred label.
- For the active mission, outcome precedence is **known hard failure → FAILURE; otherwise required unknown → UNVERIFIED; otherwise all hard checks MET → MODEL_PASS_PROVISIONAL**. Invalid input is a known validation failure. No source-validated flight-success outcome exists.

Each `CheckResult` has stable `checkId`, scope (`science`/`engineering`), `status` (`MET`/`NOT_MET`/`UNVERIFIED`), actual tagged metric(s), inclusive operator/limit, rule/source references and prerequisite IDs. A derived check may depend on another check but must not inherit MET from an unavailable number. Seven science IDs remain exactly WF-SPECTRUM, WF-GSD, WF-FOOTPRINT, WF-ACCESS, WF-DELIVERY, WF-LATENCY, WF-DURATION.

Freeze these **19 engineering reporting checks** as decompositions of existing gates, not new requirements:

| IDs | Existing rule covered |
|---|---|
| `ENG-MASS`, `ENG-SLOT`, `ENG-LAUNCH-INTERFACE` | Booked spacecraft allocation; spacecraft+adapter slot; orbit/interface delivery |
| `ENG-PAYLOAD-FIT`, `ENG-POWER-PACKAGE-FIT` | Payload bay; array/battery compatibility and combined allowance |
| `ENG-BUDGET`, `ENG-SCHEDULE`, `ENG-MODES` | Reserved/funded cost; procurement/integration/queue; allowed activity windows |
| `ENG-POWER-BOL`, `ENG-POWER-EOL` | Generation versus required energy at both endpoints |
| `ENG-ECLIPSE`, `ENG-PEAK-W`, `ENG-PEAK-WH` | Usable shadow energy; discharge power; six-minute peak-energy envelope |
| `ENG-PAYLOAD-POINTING`, `ENG-MOTION-PROFILE` | Absolute payload error; required stability/motion evidence and accepted enabled-tracking profile |
| `ENG-LINK`, `ENG-DATA-RATE`, `ENG-STORAGE` | Compatible effective link; sustainable full stream; usable storage |
| `ENG-LIFETIME` | Planned duration within supported/funded life |

Report science counts **out of seven** and engineering counts **out of 19**, each partitioned into MET/NOT_MET/UNVERIFIED. Invalid input has its own validity indicator; do not add it to those denominators. Compound details do not add counts. These presentation counts never determine feasibility. All-minima science merit is 70; compute merit only when every hard gate passes, retaining the audited weights and no blended score.

### 3.4 Diagnostics, warnings, and result ownership

Use the rulebook's reason codes unchanged, with a stable `detailId` for the affected condition (e.g. WF-LATENCY, battery peak W, battery peak Wh). Missing evidence is an evidence diagnostic, not an invented flight failure code. Each diagnostic references `checkIds`, cause/prerequisite IDs, message/repair keys and numeric parameters; engine output contains no preformatted English “actual/required” strings.

Keep one finding per distinct condition and cross-reference shared causes rather than duplicate rows in counts. A failed link may explain downstream data/latency failures; those checks still retain their own statuses. Order findings deterministically: invalid input, known failures in the check registry's order, missing evidence, warnings. The UI can emphasize the first repair without hiding the rest.

Report power BOL and EOL separately, with minimum endpoint margin as the power summary; mass against booked spacecraft limit; data against **effective D**, not G; budget after reserve; storage against usable storage; battery energy margins for eclipse and peak envelope separately, and discharge W separately. Schedule slack is native months. Zero/unknown/unbounded capacity yields a labelled unavailable ratio, never division by zero or a “0% safe” badge. Only the audited warning thresholds apply: power<15%, mass/data/budget<10%, schedule slack<6 months. No invented battery/storage warning threshold.

## 4. Effective link → queue → latency: mandatory propagation

Compute link eligibility **before** any service-dependent metric or check. Keep nominal line-rate capacity for a clearly conditional engineering diagnostic, never as an alternate service path.

The shared `LinkService` record carries `state` (`available`/`unavailable`/`unknown`), source contact-fixture ID, conditional nominal capacity, tagged effective daily capacity, effective window capacities/service rates, and failed-check or missing-evidence IDs. Known unavailable service has an **empty effective-window list**; unknown service has an explicitly unknown window-service value, not an empty list. Geometric windows and the booked attempted-transmission profile remain separate context records. Queue calculations accept this record, not a second radio-rate/ground-tier shortcut.

| Link/service state | Capacity and queue behavior | Requirement/report effect |
|---|---|---|
| Accepted closing-link assumption, receiver and pointing MET | Use unioned compatible contact windows, line rate, and η once. Compute D and per-contact service from the **same effective service record**. | May establish periodic stability and fixture latency subject to the other prerequisites. Remains [P]. |
| Known receiver/pointing/link failure | Effective service windows **empty** and service per window/day **zero**. Geometric contact schedule remains visible as unusable opportunities. | `LINK_UNCLOSED`; D=0; useful delivery=0; positive G gives backlog G, unstable queue, no finite delivery bound. Data/delivery/latency fail; do not drain the queue at nominal rate. |
| Link evidence unknown, no independently known link failure | Effective service and dependent queue/delivery metrics **unknown**, not nominal and not proven zero. | Link/dependent checks UNVERIFIED. Conditional nominal capacity may be shown only with its condition. Other known mass/budget/etc. failures retain FAILURE precedence. |
| No contacts and positive G | Effective service zero regardless of nominal Mbps; guard N=0 before division. | Unstable queue, backlog G, unbounded delivery delay; failure, not an arbitrary 3/8/24-hour tier. |

Source generation, native sampling, jitter and tracking calculations are unchanged by a link failure. Retain the audited conservative radio **attempted-transmission** load/peak envelope for the booked operations; an unavailable useful link supplies no free power-saving credit.

For effective service known and a valid uniform-arrival/even-spacing fixture:

1. Test **D≥G** and contact capacity≥arrivals/cycle using the audited inclusive tolerance.
2. Only a stable queue has the audited stable-periodic `queuePeakGB=G×gapMin/1440`. Require that peak≤usable storage separately. D=G passes the rate check but not automatically storage.
3. For an unstable queue, mark stable-periodic peak not applicable; report backlog and, if defined, the fluid net-backlog storage estimate. **Do not report max queue zero, exact first-overflow time, or exact lost-byte totals.**
4. Supported finite fixture latency requires established service, the supplied timing assumptions, rate stability, and no storage overflow. For positive generation with zero service, delay is tagged unbounded and WF-LATENCY NOT_MET. With positive but inadequate service or storage overflow, the stable lossless latency formula is unsupported; WF-LATENCY is UNVERIFIED, while the known data/storage failure fixes the overall outcome. Retain any conditional cadence-only expression as diagnostic, not a passing delay.
5. Stable, lossless modeled useful delivery is `min(G,D)×0.60`. Known failed link gives zero. Unknown service gives unknown. Under unstable/overflowing operation a conditional rate-equivalent useful proxy may be shown, but **does not establish delivered useful-workload compliance**; WF-DELIVERY remains UNVERIFIED unless a known zero/failure establishes NOT_MET. This does not excuse D<G even if the proxy exceeds 1 GB/day (audited case 6).

Required regression: start from WF-B, inject known antenna/receiver failure, and assert **nominal capacity may remain 37.8, but effective D=0, per-contact service=0, no queue drain, backlog=3.1850496 GB/day, useful delivery=0, no finite supported latency**, unchanged native GSD, and FAILURE. Repeat with unknown link evidence and assert unknown service, not zero/nominal. A conditional number must never satisfy a gate.

## 5. Fixture latency, timeline, and all open planning questions

### 5.1 Required latency labels

Wherever a finite fixture latency appears, show the nearby short label:

> **Analytical fixture latency bound — smoothed arrivals; not validated observation age.**

English detail:

> Synthetic ground contacts repeat evenly over 24 hours; image products are smoothed into uniform queue arrivals. This is the training model's delivery bound, not a measurement or proof of physical observation-to-product age.

Ukrainian source copy for implementation review:

> **Аналітична верхня межа затримки у навчальній моделі — згладжений потік даних; фактичний час від спостереження не підтверджено.**
>
> Синтетичні сеанси зв’язку рівномірно повторюються протягом 24 годин; надходження зображень до черги вважається рівномірним. Це межа затримки навчальної моделі, а не вимірювання чи підтвердження фактичного часу від спостереження до готового продукту.

Retain WF-LATENCY's **≤6 h** threshold and numerical model verdict. Report metric basis `synthetic-smoothed-periodic-bound`; keep a distinct physical-observation-age evidence field **unknown**. That disclosure is **not another current hard gate** that would erase the audited provisional passes. Do not rename queue arrival into an actual observation timestamp. Scientific validation of that mapping remains evidence-blocked.

### 5.2 Decision register

These are the proposed decisions to approve with this plan; rulebook questions stay beside the rules as source history. Technical implementation details below can proceed only after execution authorization.

| Open question / rulebook section | Planning decision | Impact / human judgment |
|---|---|---|
| Editable controls (§1) | Fix active scenario, $3M, 36 months, one funded/planned year, fixed frame plan and accepted assumptions. Eight part IDs are the player choices; no difficulty or free parameter sliders. | Routine scope decision. Changing budgets, workload, duration controls or scenarios later is product approval, not a tuning shortcut. |
| Invalid versus unknown (§1) | Use §3.3's separate validation and evidence unions; invalid produces FAILURE with INVALID_INPUT; explicit unknowns do not silently fail or pass; retain independent failures. | Routine contract decision, tested in combinations. |
| Incomplete teaching payloads (§3.5) | Ship only complete audited `pl-thermal`. Do not invent mass/price/load for selectable visible/VNIR/none/SAR/SWIR. Use clearly named test-only capability mutations to retain spectral negative tests, not new purchasable components. | **Human product/engineering judgment required before adding those options:** complete allocations, compatibility and evidence, including any legitimate no-payload validation exception. Not blocking M1 or conformance tests. |
| Tracking representation (§5.4) | Context discriminant: accepted provisional tracking profile, explicitly disabled diagnostic, or unknown evidence. Enabled profile carries separate rate capability, residual speed and exposure jitter. Disabled uses untracked speed, not the old 1,000 m/s residual; unknown is not disabled. | Routine representation. New performance profiles require science/engineering evidence and approval. |
| Observation→smoothed arrival (§5.6) | Preserve analytical fixture evaluation with explicit label/basis; physical observation timestamp mapping and buffering delay remain unknown. Do not generate physical product ages. | **Human science/product judgment plus evidence required** before physical age guarantees or a real acquisition schedule. Not blocking an honestly labelled training loop. |
| Initial queue/loss policy (§5.6) | Use steady-periodic analytical quantities, not a startup simulation. No exact drops/overwrite/acquisition-stop model in MVP. Deficit storage time stays an estimate. | Routine MVP deferral. **Human product judgment** if exact startup/lost-product behavior is later requested; no policy may rescue a failed gate. |
| Timeline epochs (§4.2) | Optional repeating contact diagram uses display-only minute zero and half-open `[start,end)` windows, wrap-around union and a clear synthetic-cycle label. It is not a target epoch, date, propagated ground track, or evidence of simultaneous operations. | Routine display convention. Do not infer new access or align separate synthetic models as a physical schedule. |
| Diagnostic detail/counts (§6) | Seven science /19 engineering reporting checks, fixed code/detail mapping, separate invalid indicator, shared-cause links, deterministic order (§3.3–3.4). | Routine reporting decomposition; no new thresholds or count-based verdict. |
| Margin display (§8) | Show endpoint/minimum power margins, separate battery Wh/W margins, effective data denominator, unknown/unbounded guards, and only existing warnings. | Routine presentation choice. New warnings are a later product decision. |
| Design versus flight (§9) | Evaluate all known gates before launch; a failed/unverified/invalid/deferred design cannot “launch successfully.” Allow clearly labelled **counterfactual explanations** of its predicted eclipse/data/science consequences, without a second verdict. | Routine safety/presentation choice, not simulated random flight. |
| Language/accessibility (§9) | English/Ukrainian parity from M1; dictionaries and parameters, native controls, text warnings, reduced-motion/no-animation path. | **The user or a user-designated bilingual reviewer** owns linguistic/scientific quality approval before delivery; key parity alone is insufficient. No translation access blocker for writing the plan. |

No unanswered human question blocks coding the scoped, provisional training model **once the plan is approved**. They block only the stated expansions/stronger evidence claims. The user must separately authorize execution; approval of a plan is not presumed.

### 5.3 Later derived presentation

`deriveTimeline(report)` consumes frozen metrics/checks/diagnostics. It may show phase-ordered explanations (design, commissioning, eclipse, downlink, cloud acceptance, end report), not invented mission dates. All known hard failures block the launch path; explanatory failures are explicitly counterfactual. Unknowns are not animated as measured failures.

If a degradation crossing is displayed, the evaluator supplies the crossing derived from the audited energy equation with its units/basis; the presenter only labels it. Equality passes, and no arbitrary day-30 event is added. Do not manufacture an exact event from the backlog estimate or guessed residence. Text/skip and reduced motion show the same report/outcome.

## 6. Module ownership and parallel work packets

The orchestrator is the only contract/integration/Git owner. During this planning phase every worker is read-only and returns text. After execution approval, any worker write permissions must be limited to its assigned paths, with shell/Git writes and further worker dispatch denied; tool limitations do not waive the ownership rules. Orchestrator runs shared checks, installs tools, and stages/commits/pushes explicit paths.

| Owner/packet | Relevant inputs | Owned future paths (only after authorization) | Acceptance and returned report |
|---|---|---|---|
| **P0 — Sol contract/integration** | This plan §§1–5; technical rules; existing types/config | `src/engine/types.ts`, `src/engine/constants.ts`, `src/App.tsx`, `src/main.tsx`, root package/lock/TS/Vite/test config, `.gitignore`, `index.html`; integration docs | One shared contract/code registry, audited policy constants, no old pass/penalty loopholes, type fixtures compile. Inspect user diffs before each adoption. Report contract revision, migrations, checks, blockers. |
| **P1 — free DeepSeek catalog/scenario** | Technical §§2–5,10–11; frozen contract | `src/data/**` | Complete audited selectable records and field provenance; independent target/contact/link/tracking fixtures; no disabled solver shortcut or invented products. Return field/source coverage, changed files, actual checks, blockers. |
| **P2 — free DeepSeek evaluator** | Technical §§5–8; frozen contract; P1 snapshots | `src/engine/evaluate.ts`, `src/engine/validate.ts`, `src/engine/link.ts`, `src/engine/queue.ts`, `src/engine/geometry.ts`, `src/engine/power.ts`, `src/engine/checks.ts`, colocated `*.test.ts` for these modules | Pure deterministic dependency-ordered math; effective service propagation; full-precision inclusive checks; all check statuses/causes and no second verdict. Return tested equations/cases and untested risks. Split packets by module if too large; never change contract. |
| **P3 — free DeepSeek UI/localization** | Player guide; this plan §§2,3,5; frozen contract | `src/ui/**`, `src/i18n/**`, `src/App.css`, `src/index.css` | Native keyboard controls, six resources, bilingual results/repairs/labels, stale snapshot state, no hidden formulas or fabricated verdicts. UI reducer lives in `src/ui/`; orchestrator's App only composes it. Return interaction checklist, translation gaps, checks, blockers. |
| **P4 — free DeepSeek reference fixtures/conformance** | Technical §10, frozen contract, independent arithmetic targets | `src/fixtures/**`, `tests/conformance/**` | Configurations, exact-key preview reports and reference assertions for three passes, M1 failure and 15 boundary cases. Never compute expected values by calling the evaluator under test or import fixtures into evaluator math. Return coverage matrix and actual checks. |
| **P5 — connected OpenAI reviewer** | Frozen contract, changed modules, this plan and rules | **Read-only**; no files owned | Independently inspect link/queue/latency, precedence, boundaries, all three passes and UI truthfulness. Return evidence-based findings, checks run, blockers. If unavailable, current connected Sol reviews; never paid OpenCode fallback. |
| **P6 — local Qwen bounded QA** | One named document, dictionary pair, or test excerpt per task | **Read-only by default**; no shared files | One link/key/path/short boundary check within eight steps; one local job at a time. Return exact findings/checks and stop if broader work is needed. |
| **P7 — later presentation** | Frozen EvaluationReport only | `src/presentation/**` and its own tests | No evaluator/formula duplication, no new verdict, no exact invented ages/dates; accessible text equivalent. Only after M1 real loop works. |
| **P8 — Sol browser acceptance/integration** | Real provider plus P1–P4 outputs | `tests/e2e/**`, `tests/ui/**`; root test config remains P0-owned | Real-evaluator M1 retry in both languages, focus/staleness/fixture labels and adversarial link-service tests; no mock-only final acceptance. Return actual browser/build/test evidence. |

P1, P3 and P4 can proceed concurrently **after P0's contract handoff**; UI uses P4's exact-key reports until the real provider is ready. P2 develops against the frozen data shapes, consuming reviewed P1 data as available. If a single DeepSeek route is capacity-limited, use small sequential packets or route difficult work/review to connected Sol; preserve independence of expected assertions. No paid OpenCode model is a fallback.

Contract changes: worker stops the affected integration, returns proposed field/reason/unit change and impact; P0 approves, versions, and publishes the change; dependent owners adapt their own paths. No worker patches types, package metadata, global CSS, entry points, or another module opportunistically. P2 owns unit tests for its modules; P4 owns cross-module conformance so their files do not overlap. Packet completion report always names changed paths, assumptions, actual checks, failures/blockers, and remaining work; no Git mutations or nested workers.

## 7. Ordered milestones and verification gates

### M1 — minimum real playable loop (first coding slice)

Deliver §2, including contract/data, both-locale UI and a genuine deterministic evaluation path. Build a thin text-first interface alongside the evaluator, not after a long simulator project. Test the two WF-B configurations, first latency failure/repair, stale-report identity, effective-service failure and unknown-link propagation. No launch animation, save/compare, scenario expansion or visual polish is needed.

**Gate:** keyboard-only real loop passes in both languages; all implemented selectable configurations receive complete gates (or explicit unsupported-preview presentation during development); no fixture-backed pass masquerades as evaluation. Existing build/lint plus newly installed and documented focused tests succeed. Root/config modifications and adopted user files are reviewed before staging.

### M2 — audit conformance and robust diagnostics

Complete the catalog matrix and all three reference builds plus all 15 boundary cases (§8), validate unknown/invalid/deferred combinations, storage equality/wrap-around, field provenance, source links, warnings and merit. Check all numerical outputs in technical §10 at displayed precision; also assert unrounded inequalities at limits. Remove production fixture-preview wiring; retain reference reports solely for development/tests.

**Gate:** deterministic pure tests cover every hard reporting check, every reason mapping, every science requirement and all audited cases. Different known configurations never share a report key. No React import in data/engine; no fixture imports in evaluator; all-pass means provisional, not flight qualification.

### M3 — explanation and accessibility completion

Add the derived text timeline/contact visualization only if it clarifies choices; use the same report, conditional/counterfactual labels and fixture-latency disclosure. Add citations/provenance panels and complete parameterized English/Ukrainian text. Optional save/compare is not required for this scope and may not delay delivery.

**Gate:** keyboard/focus/reading order, non-colour-only warnings, zoom/reflow, reduced motion, and skip/text equivalence checked manually and with browser tests; animation cannot change outcome. Bilingual human review covers technical meaning, not only matching dictionary keys. No physical observation-age/deorbit/overflow claim without evidence.

### M4 — delivery candidate and user review

Inspect actual package scripts and compatible tool versions again. Proposed additions during execution: Vitest for pure tests, Testing Library/user-event with a compatible DOM environment for UI checks, and Playwright for actual browser acceptance. The orchestrator owns dependency/lock/config changes and verifies compatibility before use. Create documented `test` (non-watch), `test:ui`, and `test:e2e` scripts then; they **do not exist now**.

Run existing `npm run build` and `npm run lint`, new pure/conformance/UI suites, and real browser tests. Verify dev and built preview at the configured `/nasa-space-apps/` repository base, including icons/assets and language reload; any publication needs the execution/delivery authorization, not this planning request. Confirm a fresh clone plus the committed lockfile can install/build/test and complete the loop without private local inputs. Inspect dependency/tool licensing, attribution and no implied agency endorsement.

**Gate:** report actual command outputs, browser/language/accessibility coverage and unresolved limits; preserve user work; inspect exact staged diff for scope/secrets, commit/push normally on `mission-forge`, verify remote SHA equals HEAD. Stop for human delivery review. Never merge `main` or create a PR implicitly.

## 8. Required acceptance matrix

### 8.1 Reference builds retained

All share `pl-thermal`, `bus-12u`, `orb-sso-low`, `lv-heavy`, accepted provisional tracking/link/access, one year, $3M and 36 months. Preserve **every quantity** in technical §10, not just this summary:

| Fixture | Distinct choices | Allocated kg | Total USD | D GB/day | Fixture latency h | Tightest margin |
|---|---|---:|---:|---:|---:|---|
| WF-A | `arr-deploy-l`, `bat-s`, `rf-s`, `gs-service` | 18.9635 | 2,673,750 | 3.465 | 2.190909… | Data 8.079% |
| WF-B | `arr-deploy-l`, `bat-m`, `rf-x`, `gs-network` | 19.7685 | 2,921,000 | 37.8 | 3.1 | Budget 2.633% |
| WF-C | `arr-deploy-xl`, `bat-m`, `rf-s`, `gs-service` | 23.7705 | 2,846,250 | 3.465 | 2.190909… | Mass 0.956% |

Each must return **MODEL_PASS_PROVISIONAL**, generated **3.1850496 GB/day**, useful **1.91102976 GB/day**, effective scale **170.334026 m**, usable swath **104.231570 km**, scheduled access **24 h**, schedule **31 months**, and explicit provisional assumptions. Preserve separate mass-slot, BOL/EOL power, eclipse, peak-W/Wh, storage, cost breakdown and pointing outputs. Expected warnings: A data/schedule; B budget/schedule; C mass/data/budget/schedule.

### 8.2 All 15 audited boundary cases

Use named parameterized tests `audit-01` through `audit-15`, linked to the technical rulebook's corresponding cases. Synthetic fault/mathematical boundary inputs are test contexts, **not additions to the purchasable catalog**.

| ID | Required assertions |
|---|---|
| **audit-01** | 1 Mbps ×1 min at η=1 is **0.0075 decimal GB**. Confirm η=.70 produces .00525, applied once. |
| **audit-02** | D=G exactly passes rate stability; D<G beyond allowed round-off fails even for tiny deficit. Do not exempt one-year storage capacity. |
| **audit-03** | Allocated **24 kg passes; 24.000001 fails**. Adapter separate for slot, not hidden in spacecraft or counted twice. |
| **audit-04** | Payload error **0.2° passes angular gate; 0.200001° fails**. Independently enforce swath/scale. Better absolute error cannot worsen offset/usable swath. |
| **audit-05** | Omni UHF uses no zero-angle division. **0.008316 GB/day** at 132 min/day fails the full stream; no false stable queue. |
| **audit-06** | A with `gs-network`: **D=1.890<G=3.1850496 →DATA_BOTTLENECK**. Conditional useful proxy >1 does not remove this failure or prove supported full delivery. |
| **audit-07** | M1 WF-B/`gs-single`: **D=12.6**, supported fixture bound **7.1>6**, correct latency failure despite passing data/storage; network-only repair restores **3.1** and provisional pass. |
| **audit-08** | C with `bat-l`: **25.507 kg →CDS_MASS_LIMIT**, despite more Wh. |
| **audit-09** | A with 24 W array: EOL **19.546214 Wh/orbit <24.377998 required →POWER_DEFICIT**. Larger battery alone cannot cure repeated generation deficit. |
| **audit-10** | Known radio/receiver failure: **effective service zero in every queue path**, no finite delivery bound, useful=0; native camera sampling unchanged. Add unknown-link variant with unknown dependent metrics, not nominal/zero defaults (§4). |
| **audit-11** | Missing explicit target-access evidence →UNVERIFIED, not `1/dailyCoverage`, altitude-derived access or one revisit/day. Add a separate known hard failure and ensure FAILURE dominates without hiding the unknown. |
| **audit-12** | Test-only visible/VNIR/no-science capability mutations fail LWIR inspection regardless of other favorable values. Test the science predicate independently; do not invent a zero-mass selectable `pl-none` record or import old unsupported payload profiles. |
| **audit-13** | Every exact minimum satisfies the gates; zero stretch gives merit **70**, not failure. Test logarithmic directions/weights and no invalid/no-stretch log division. |
| **audit-14** | All known gates may be MET while mission outcome remains **MODEL_PASS_PROVISIONAL**. Source/evidence assumptions remain visible; no SUCCESS/verified-flight conversion. |
| **audit-15** | Explicit tracking off: **232.954 m** smear, **286.692018 m>200**, all three builds fail WF-GSD. Reject old jitter-only **167.106794 m**. Unknown profile is a distinct UNVERIFIED case, not zero smear or automatic no-tracking physics. |

Use full-precision double arithmetic; hard comparator round-off allowance at most **`1e-9×max(1,abs(limit))`** in each unit, not an engineering waiver. Reference snapshot comparisons can allow half the last displayed decimal solely to compare rounded documentation; gate tests must use the strict comparator, not those display tolerances.

Additional regressions: N=0; link unknown plus known budget failure; malformed/NaN IDs/fields; recognized deferred scenario; queue=capacity versus >capacity; contact union/wrap-around with no doubled rate; unsupported schedules yield unknown rather than borrowed fixtures; positive rate deficit never produces a finite stable-periodic peak; failed links retain nominal attempted-load costs rather than free energy; stale report invalidation on context revision; output JSON serializes without NaN/Infinity; no score or timeline override; locale-key/parameter parity and screen-reader text.

## 9. Planning verification and actual routing record

- Planning ran from the reviewed baseline in the user's existing checkout. Fetch/history comparison, local scaffold/package/lock/config inspection, and a baseline SHA-256 manifest of **30 tracked/visible-untracked input files** were recorded outside the repository. No application file was changed for this plan.
- OpenCode **v2.3.0**, current session explicitly verified as **`openai/gpt-6.1-sol#high`**. Effective worker definitions keep read-only permissions: **`opencode/deepseek-v4.1-flash-free`** for routine drafting, **`strata/qwen3.8-flash-next-iq3_xxs`** for bounded checks, and model-less `reviewer` inheriting connected Sol High. No paid OpenCode request is part of this planning phase. The legacy-named local `codex-review` role is Sol, not genuine Codex; do not claim Codex coverage.
- Local Qwen checked the source boundary list/case values; the orchestrator used only the source-supported extraction, not its mistaken description of repaired WF-B as “single-station” or unsupported smear interpretation. Free DeepSeek returned the first-loop/keyboard acceptance draft; the orchestrator corrected its capacity-times-acceptance example to cap useful data at generation. Connected Sol reviewed failed-link/queue propagation and fixture-latency evidence before integration. Workers returned response text, checks and blockers; no writes, Git or nested workers.
- The orchestrator independently recalculated the two first-loop variants with standalone Python arithmetic: **$2,662,250 /$2,921,000; 12.6 /37.8 GB/day; 0.78299136 /0.25214976 GB peak queue; 7.1 /3.1 h; 19.7685 kg each**. No-service backlog is **3.1850496 GB/day**; **102.4/G≈32.1502 days** is only the fluid net-backlog estimate, not an exact overflow date. These calculations validate plan targets, not application behavior.
- Final free DeepSeek static review confirmed all 15 cases and generation-capped useful delivery; local Qwen checked all five introductory document links. The connected Sol reviewer read the complete plan, cross-checked the technical authority, independently checked first-loop capacity/latency/queue/cost arithmetic and the 19-check count, and found no blocking contradiction. This is document review, not a claim that any planned software exists.
- Planning verification checked the five relative document links, contiguous `audit-01`–`audit-15` coverage, 19 unique engineering reporting IDs, and unchanged hashes for all 30 pre-existing recorded files. The exact staged scope is this plan alone; staged content matches the working document, credential/machine-specific pattern checks found no matches, and working/staged `git diff --check` checks passed. No application commands or dependency installation ran.

A proposed future build/test is not a check run now. The orchestrator commits only this plan, pushes normally to the existing upstream, verifies remote SHA equality, and records the pushed SHA/branch in the final handoff. Report any access blocker rather than treating an unpushed commit as delivered.

**Review gate:** approve or revise this implementation plan before authorizing any application edits. After plan approval **and execution authorization**, the next work is M1's working keyboard loop, not an additional planning phase or an engine-only project.
