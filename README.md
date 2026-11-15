# MISSION FORGE

A bilingual browser mission-design game for NASA Space Apps 2026, Dnipro, Ukraine. Four playable missions teach thermal imaging, visible-light lens selection and two-hop packet relay. Balance mass, power, budget, data, communications and time.

Also playable: **Trace the Shoreline**, a genuinely visible-light lens-selection mission. Run the 8 mm starter, repair to the 35 mm analogue, then compare the narrower 70 mm option. Primary evidence, exact assumptions and reproducible figures are in [non-thermal missions](docs/nonthermal-missions.md).

**Carry the Signal** adds a different mechanism: receive two packet batches, buffer them and close a two-hop Earth relay route. Keep the starter hardware and select the ground network; viable ingress alone cannot deliver anything without egress. The exact synthetic FIFO reference returns 1 GB/day with a 0.5 GB peak and 1.84921 h completion delay. No optical equations or lunar geometry are used.

- [Player guide](docs/game-rules-player.md)
- [Technical game rules](docs/game-rules-technical.md)
- [New scenario policy and primary references](docs/scenario-expansion.md)
- [Agent workflow and review gates](docs/agent-workflow.md)
- [Agent entry point](AGENTS.md)

**Current stage: night-03 orbital visual/flow checkpoint.** Full-screen menu → live spacecraft customization → illustrated Earth mission selector → frozen launch → debrief/typed repair. The original campaign remains playable; the branching economy is the next authorized slice, not yet shipped. [Overnight handoff](docs/overnight-handoff.md) records exact checkpoints and recovery. Human bilingual scientific/linguistic and assistive-technology review remains pending. Nothing has been deployed.

## Run locally

A fresh profile automatically enters **Flight Academy**, with immediate Skip and language selection. Accept its training contract, launch (7.1 h), equip the ground network and rerun (3.1 h provisional pass). The menu's **Tutorial** replays it; **Help / Academy** or **?** preserves your draft, report and credits. Guided runs never pay credits.

Menu, hangar and launch share a lazy procedural 3D spacecraft with actual part-specific shapes, internal battery inspection and a dynamic SVG fallback. A visible menu control disables continuous motion; reduced-motion starts static and skips launch presentation. Earth texture: NASA Earth Observatory. All spacecraft/scenario art is illustrative, not a flight layout. The **Engineering console** link retains the detailed legacy workbench as an optional advanced entry.

Node 22.22.2+ (or a compatible supported Node release) and npm:

```sh
npm ci
npm run dev
```

Open the printed local URL under `/nasa-space-apps/`. Finish or skip the academy → **Customize**. Choose a subsystem and a real part card to equip it immediately. **Launch** freezes the current design and evaluator result; skip the short presentation at any time. Wildfire's starter has a 7.1 h latency failure: use the debrief's ground-service repair, equip the network, then launch again for a 3.1 h provisional pass. English/Ukrainian controls and results are available.

Choose **Urban Heat Map** for a different challenge. Its starter S-band/network cannot sustain the image stream. Switch **Radio package** to X-band, rerun, then compare **Ground service → single station**: a cheaper provisional pass at 7.1 h is acceptable against urban's 12 h fixture limit, but not wildfire's 6 h limit. Frequent S-band service is another passing approach. All engineering gates remain enforced; no calibrated temperature, air-temperature, street-level or health-risk capability is implied.

### Optional campaign

Select **Campaign** from the menu for wildfire → urban → visible mapping → relay. Each first provisional pass earns **100 credits once**. Unlock X-band, the 35 mm visible camera and receive/store package for **100 each**. The optional audited 135 W array offers a materially different power/mass choice. Full refunds keep every purchase order solvable. Fit owned parts into compatible designs; retry for free. Engineering USD and all requirements remain separate. In campaign the menu offers **Sandbox** to return directly to unrestricted mission selection.

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

`npm run preview` serves the built app locally at `/nasa-space-apps/`. Tests own port 4173; stop another local server on that port first. Reload opens the menu in English (or automatic academy if unseen); campaign completions/unlocks survive separately in localStorage. Existing v1/v2 saves retain their entitlements and credit balance. Separate mode/mission drafts survive session navigation, not reload. Selecting a new mission clears the old report rather than relabelling it. `?renderer=svg` explicitly exercises the supported schematic fallback.

## Delivery scope

Thermal missions retain the frozen audited catalog and seven science/19 engineering checks. New scenario catalogs have explicit provisional evidence records. Relay uses six mission/17 applicable engineering checks, without pretending camera geometry applies. Edited or context-changed results are stale; rerun to evaluate the draft. Rounded boundaries retain full-precision details.

The hangar's live draft telemetry is evaluated separately from frozen launch results. Exact installed values and signed, capped headroom bars show real tradeoffs, not arbitrary ratings. Launch animation cannot alter an outcome or mint a second reward. The contact strip consumes the recorded schedule. Keyboard controls, help/guide focus, reduced motion, WebGL context loss/fallback and enlarged-text reflow are tested, including opened disclosures.

### Actual Chrome screenshots

- Night-03: [orbital menu](docs/screenshots/night03-menu-en.png) · [before](docs/screenshots/night03-craft-before-en.png) / [after real array swap](docs/screenshots/night03-craft-after-en.png) · [battery inspection](docs/screenshots/night03-battery-en.png)
- [Four illustrated missions](docs/screenshots/night03-missions-en.png) · [Ukrainian academy](docs/screenshots/night03-academy-ua.png) · [launch](docs/screenshots/night03-launch-en.png) · [failure/repair](docs/screenshots/night03-debrief-failure-en.png) · [provisional pass](docs/screenshots/night03-debrief-pass-ua.png)

- Night-02: [first load](docs/screenshots/night02-first-load.png) · [spacecraft](docs/screenshots/night02-workbench.png) · [debrief](docs/screenshots/night02-debrief-en.png) · [Ukrainian academy](docs/screenshots/night02-academy-uk.png)
- [Visible mapping](docs/screenshots/night02-visible-en.png) · [Ukrainian](docs/screenshots/night02-visible-uk.png)
- [Two-hop relay](docs/screenshots/night02-relay-en.png) · [Ukrainian](docs/screenshots/night02-relay-uk.png)
- [Four-contract campaign](docs/screenshots/night02-campaign-en.png) · [Ukrainian](docs/screenshots/night02-campaign-uk.png)

Historical night-01 comparisons:

- [M4 before](docs/screenshots/m4-before-en.png) · [before failure](docs/screenshots/m4-before-failure-en.png)
- [Redesigned control deck](docs/screenshots/wildfire-after-en.png) · [failure and repair](docs/screenshots/wildfire-after-failure-en.png)
- [Provisional pass, English](docs/screenshots/wildfire-after-pass-en.png) · [Ukrainian](docs/screenshots/wildfire-after-pass-uk.png)
- [Urban brief and picker](docs/screenshots/urban-brief-en.png) · [urban failure](docs/screenshots/urban-failure-en.png)
- [Urban pass, English](docs/screenshots/urban-pass-en.png) · [Ukrainian](docs/screenshots/urban-pass-uk.png) · [320px enlarged text](docs/screenshots/urban-mobile-uk.png)
- [Completed campaign, English](docs/screenshots/campaign-complete-en.png) · [Ukrainian](docs/screenshots/campaign-complete-uk.png)

Automated accessibility scans do not replace assistive-technology testing or bilingual human scientific/linguistic review.

### 60-second local demo

Open `/nasa-space-apps/` → automatic academy → accept contract → launch (7.1 h) → ground network → retry (3.1 h) → main menu. **Customize** → equip another solar array → return and see the same larger wings. **Missions** → **Trace the Shoreline** → Payload → 35 mm → Launch. Then **Carry the Signal** → Ground service → network → Launch. Toggle Ukrainian at any point. For campaign credits/refunds, see [Mission Campaign](docs/mission-campaign.md).

See [third-party notices](docs/third-party-notices.md) for software licenses and attribution.

## Verification

The night-03 visual/flow checkpoint passed typecheck, lint (zero warnings), build, **137 engine /32 UI /33 production-preview Chrome** tests and audit (zero vulnerabilities). This includes actual WebGL and context-loss replacement, fallback equipment and rotation, the complete four-mission bilingual game flow, fresh automatic academy, frozen launch/reward integrity, and completing the guide plus disclosed report reflow at 320px/200%. See the handoff for exact checkpoint and clean-copy status; branching progression remains pending.

The night-02 candidate passed typecheck, lint, build, **133 evaluator/progression**, **27 UI**, and **21 production-preview Chrome tests**. Coverage preserves WF-A/B/C/all 15 audited cases and urban checks, and adds actual bilingual guide/mission/campaign repairs, visible↔thermal capability, exact FIFO relay/boundaries/malformed evidence, all v1 inventories, storage isolation, stale/spoofed reward rejection, fitting/refunds and **48/48-state campaign solvency**. Keyboard focus, axe, 320px/200% text, opened disclosures and reduced motion remain covered. See the handoff for checkpoint and clean-copy evidence.

The historical M4 archive passed a fresh install and all checks; the redesigned wildfire checkpoint `adc8dde` independently repeated that proof with **61 evaluator /19 UI /8 production Chrome** tests and zero install-audit vulnerabilities. Tested with Node **22.23.5** and npm **10.9.9**; Chrome must be separately installed for browser tests. Current-candidate clean-copy results are recorded in the execution log.

**Historical clean-copy proof:** night-01 application `699b6a23e8e135ccc2703deeca82147629c2ec55` passed fresh `npm ci`, all verification commands, **105 /25 /12** tests and zero audit vulnerabilities. Current night-02 committed-copy proof is recorded in the [handoff](docs/overnight-handoff.md).

**Night-02 clean-copy proof:** application `309250d855ff00f9029fe587fc3c4d0451529f73` passed fresh `npm ci`, typecheck, lint, **133 engine /27 UI /21 production Chrome** tests, production build and zero-vulnerability audit from an isolated committed archive outside the checkout. Toolchain: Node22.23.5/npm10.9.9/Chrome157.0.8103.78. Final wrap is documentation only; no deployment.

All passing examples are **provisional model passes**, conditional on synthetic access/contact fixtures and assumed tracking/integration. Fixture latency is not validated physical observation age. An insufficient optimistic useful-return ceiling can prove urban failure; it is labelled as a ceiling, not achieved delivery. This is not flight qualification, an operational alert service, or NASA endorsement.

The lunar relay remains a short [scenario backlog](docs/scenario-expansion.md#further-scenario-backlog): no Earth-imaging equations have been misused as lunar geometry. Full-region active-fire, flood and methane remain deferred. Local campaign saves are convenience state, not tamper-proof accounts or cross-device synchronization.
