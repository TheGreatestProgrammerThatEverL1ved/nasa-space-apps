# MISSION FORGE

A bilingual browser mission-design game for NASA Space Apps 2026, Dnipro, Ukraine. Play **Return the Heat Map** (scheduled wildfire imagery) or **Urban Heat Map** (city-scale thermal-pattern screening). Learn how mass, power, budget, data, communications and time shape a complete mission.

- [Player guide](docs/game-rules-player.md)
- [Technical game rules](docs/game-rules-technical.md)
- [New scenario policy and primary references](docs/scenario-expansion.md)
- [Agent workflow and review gates](docs/agent-workflow.md)
- [Agent entry point](AGENTS.md)

**Current stage: two-mission delivery candidate with optional campaign.** The mission-control deck presents a picker, brief, eight-part workbench, resource headroom and immediate verdict/repair; detailed checks and evidence live in keyboard-accessible disclosures. [Overnight handoff](docs/overnight-handoff.md) records actual progress and the exact resume step. Human bilingual scientific/linguistic and assistive-technology review remains pending. Nothing has been published live.

## Run locally

Node 22.22.2+ (or a compatible supported Node release) and npm:

```sh
npm ci
npm run dev
```

Open the printed local URL under `/nasa-space-apps/`. Start with the supplied WF-B/single-station design, run the mission, read the 7.1 h latency failure, change **Ground service** to the network, and run again: 3.1 h, provisional pass. English/Ukrainian controls and results are available.

Choose **Urban Heat Map** for a different challenge. Its starter S-band/network cannot sustain the image stream. Switch **Radio package** to X-band, rerun, then compare **Ground service → single station**: a cheaper provisional pass at 7.1 h is acceptable against urban's 12 h fixture limit, but not wildfire's 6 h limit. Frequent S-band service is another passing approach. All engineering gates remain enforced; no calibrated temperature, air-temperature, street-level or health-risk capability is implied.

### Optional campaign

Select **Play campaign** for one complete earn → unlock → redesign loop. The supplied S-band/frequent-service wildfire build can pass without a purchase. Its first provisional pass earns **100 credits once**; unlock X-band for **100**, then redesign urban delivery around it. The 135 W array is a second audited purchase option. Failed attempts are free; engineering USD budgets and all requirements stay unchanged.

[Campaign progress](docs/mission-campaign.md) is saved locally, separately from direct play. Re-enter campaign after reload to continue. Direct mission selection remains available; no account is needed.

```sh
npm run typecheck
npm run build
npm run lint
npm test
npm run test:ui
npm run test:e2e
npm run preview
```

Browser tests use local Google Chrome through Playwright (`channel: chrome`). Nothing is published by these commands. Bilingual human quality review remains pending.

To test the built app rather than the development server:

```sh
npm run build
MISSION_FORGE_PREVIEW=1 npm run test:e2e
```

`npm run preview` serves the built app locally at `/nasa-space-apps/`. Tests own port 4173; stop another local server on that port first. Reload starts direct wildfire play in English; campaign completions/unlocks survive separately in localStorage. Designs and language are not saved. Switching missions keeps the current language, restores picker focus and clears the old report rather than relabelling it.

## Delivery scope

Only complete audited catalog choices are selectable. Results include seven science and 19 engineering checks, six resource summaries, repair directions, warnings, field provenance and source links. Edited or context-changed results are marked stale; rerun to evaluate the new design. Rounded boundary values have full-precision details.

The interface is text-first and has no animation or second simulated verdict. Keyboard controls, result focus, reduced motion and enlarged-text mobile reflow are tested, including opened disclosures. Resource percentages describe the last Run, never an unevaluated draft. The ground-service hint makes the 7.1 → 3.1 h fixture repair explicit.

### Actual Chrome screenshots

- [M4 before](docs/screenshots/m4-before-en.png) · [before failure](docs/screenshots/m4-before-failure-en.png)
- [Redesigned control deck](docs/screenshots/wildfire-after-en.png) · [failure and repair](docs/screenshots/wildfire-after-failure-en.png)
- [Provisional pass, English](docs/screenshots/wildfire-after-pass-en.png) · [Ukrainian](docs/screenshots/wildfire-after-pass-uk.png)
- [Urban brief and picker](docs/screenshots/urban-brief-en.png) · [urban failure](docs/screenshots/urban-failure-en.png)
- [Urban pass, English](docs/screenshots/urban-pass-en.png) · [Ukrainian](docs/screenshots/urban-pass-uk.png) · [320px enlarged text](docs/screenshots/urban-mobile-uk.png)
- [Completed campaign, English](docs/screenshots/campaign-complete-en.png) · [Ukrainian](docs/screenshots/campaign-complete-uk.png)

Automated accessibility scans do not replace assistive-technology testing or bilingual human scientific/linguistic review.

See [third-party notices](docs/third-party-notices.md) for software licenses and attribution.

## Verification

The complete candidate passed typecheck, lint, build, **105 evaluator/progression**, **25 UI**, and **12 production-preview Chrome tests**. Coverage includes WF-A/B/C, all 15 audited cases, urban inclusive boundaries, malformed policies/context swaps, bilingual repair/scenario switching, keyboard focus, stale snapshots, source disclosures, axe, enlarged mobile text and reduced motion. Campaign coverage includes both language loops, repeat-award prevention, free retries, reload persistence, purchase enforcement, unchanged engineering costs, save-failure disclosure and a solvent alternative purchase path. See the execution log for actual fixes and review limits.

The historical M4 archive passed a fresh install and all checks; the redesigned wildfire checkpoint `adc8dde` independently repeated that proof with **61 evaluator /19 UI /8 production Chrome** tests and zero install-audit vulnerabilities. Tested with Node **22.23.5** and npm **10.9.9**; Chrome must be separately installed for browser tests. Current-candidate clean-copy results are recorded in the execution log.

All passing examples are **provisional model passes**, conditional on synthetic access/contact fixtures and assumed tracking/integration. Fixture latency is not validated physical observation age. An insufficient optimistic useful-return ceiling can prove urban failure; it is labelled as a ceiling, not achieved delivery. This is not flight qualification, an operational alert service, or NASA endorsement.

The lunar relay remains a short [scenario backlog](docs/scenario-expansion.md#further-scenario-backlog): no Earth-imaging equations have been misused as lunar geometry. Full-region active-fire, flood and methane remain deferred. Local campaign saves are convenience state, not tamper-proof accounts or cross-device synchronization.
