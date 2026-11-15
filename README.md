# MISSION FORGE

A bilingual browser mission-design game for NASA Space Apps 2026, Dnipro, Ukraine. Four playable missions teach thermal imaging, visible-light lens selection and two-hop packet relay. Balance mass, power, budget, data, communications and time.

Also playable: **Trace the Shoreline**, a genuinely visible-light lens-selection mission. Run the 8 mm starter, repair to the 35 mm analogue, then compare the narrower 70 mm option. Primary evidence, exact assumptions and reproducible figures are in [non-thermal missions](docs/nonthermal-missions.md).

**Carry the Signal** adds a different mechanism: receive two packet batches, buffer them and close a two-hop Earth relay route. Keep the starter hardware and select the ground network; viable ingress alone cannot deliver anything without egress. The exact synthetic FIFO reference returns 1 GB/day with a 0.5 GB peak and 1.84921 h completion delay. No optical equations or lunar geometry are used.

- [Player guide](docs/game-rules-player.md)
- [Technical game rules](docs/game-rules-technical.md)
- [New scenario policy and primary references](docs/scenario-expansion.md)
- [Agent workflow and review gates](docs/agent-workflow.md)
- [Agent entry point](AGENTS.md)

**Current stage: integration handoff.** Fresh builds are empty, the player catalog has **43 unique choices**, and Research is a first-level **12-node / eight-purchase** map. [Status and verification](docs/STATUS.md) cover the latest changes. [Player balance and exact recipes](docs/player-balance.md) distinguish player engineering caps from the audited contexts.

## Expedition and integration

From the main menu, open **Expedition**. Each seeded run offers three mission legs.
Take the economy offer for a tighter budget and a supply refill on success, or
the priority offer for a shorter schedule and more points. Each evaluated failed
launch consumes one of three supplies. Run history shows the seed, offers and
outcomes. A completed run keeps its result on this device until you start a new one.
The permanent Campaign wallet is independent. Debriefs include an optional
**Data handoff** with the intended user and product.

Planning the combined project? Start with the [integration handoff](docs/integration-handoff.md).

## Run locally

A fresh profile automatically enters **Flight Academy**, with immediate Skip and language selection. Accept its training contract, explicitly select all eight components (including the single station), launch (7.1 h), select the network and rerun (3.1 h provisional pass). Accept/Continue alone never equips. The menu's **Tutorial** replays an empty isolated build; **Help / Academy** or **?** preserves player drafts, reports and credits. Guided runs never pay credits.

Menu, hangar and launch share a lazy procedural 3D spacecraft with part-specific shapes, internal battery inspection and a dynamic SVG fallback. Only installed hardware is drawn. **Settings & About** controls motion; reduced-motion starts static and skips launch presentation. Earth texture: NASA Earth Observatory. Art is illustrative, not a flight layout. The **Engineering console** retains the advanced workbench and obeys the same empty-build rules.

Node 22.22.2+ (or a compatible supported Node release) and npm:

```sh
npm ci
npm run dev
```

Open the printed local URL under `/nasa-space-apps/`. Finish or skip Academy → **Customize**, initially **0/8**. Explicitly choose bus, payload, solar, battery, radio, ground, orbit and launch booking. Remove or Clear Build never substitutes another part. **Launch** enables only at 8/8 and freezes the evaluator result. For a Sandbox repair lesson assemble `bus-12u-light`, `pl-thermal`, `arr-deploy-l`, `bat-m`, `rf-x`, `gs-single`, `orb-sso-low`, `lv-heavy`: launch at 7.1 h, then deliberately change ground to `gs-network` and rerun at 3.1 h. All passes remain provisional.

Choose **Urban Heat Map** for a different cap and science brief. Assemble deliberately: S-band/network cannot sustain the thermal stream. The new 50 Mbps X-band alternative reduces radio load/cost; compare a single station's 7.1 h against urban's 12 h limit. A faster radio alone may break the budget. [Named passing/failing recipes](docs/player-balance.md#verified-design-witnesses) cover all four missions. No calibrated temperature, air-temperature, street-level or health-risk capability is implied.

### Optional campaign

Select **Campaign**, assemble from 0/8 and clear wildfire. One free-inventory recipe is the same skeletal bus / thermal camera / large wings / small battery / S-band / frequent service / explicit orbit and booking. Choose urban or shoreline next; build X-band → receive/store to reach relay. Clear all four to finish. First-clear rewards remain **120 /140 /180 /200 credits**. Open **Research** directly from the menu or Campaign navigation: four owned foundations plus eight purchases, yellow buyable / red unavailable / green owned. Hover/focus previews price/effect/locks; touch previews before a second tap buys. Purchasing **never equips**. Select unlocked parts separately in Customize; refunds clear unavailable selections without replacements. [Solvency and migration](docs/mission-campaign.md) preserve historical ledgers, free retries and separate engineering USD.

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

`npm run preview` serves the built app locally at `/nasa-space-apps/`. Tests own port 4173; stop another local server on that port first. Reload opens the menu in English (or automatic academy if unseen); campaign completions/unlocks survive separately in localStorage. Existing v1/v2 saves migrate to v3 with exact balances, entitlements and historical refund/award bases, without retroactive reward top-ups. Separate mode/mission drafts survive session navigation, not reload. Selecting a new mission clears the old report rather than relabelling it. `?renderer=svg` explicitly exercises the supported schematic fallback.

## Delivery scope

The audited catalog, contexts, WF-A/B/C and all 15 boundary cases remain unchanged. The explicitly revisioned player layer adds fictional provisional hardware, compatibility assumptions and mission caps, without changing physics or science roles. `?view=engineering&catalog=reference` is labelled internal audited tooling and cannot enter Campaign or award credits. Relay never applies camera geometry. Edited/context-changed reports are stale; rerun. Rounded boundaries retain full-precision details.

The hangar's live draft telemetry is evaluated separately from frozen launch results. Exact installed values and signed, capped headroom bars show real tradeoffs, not arbitrary ratings. Launch animation cannot alter an outcome or mint a second reward. The contact strip consumes the recorded schedule. Keyboard controls, help/guide focus, reduced motion, WebGL context loss/fallback and enlarged-text reflow are tested, including opened disclosures.

### Actual Chrome screenshots

- QA round: [empty Hangar](docs/screenshots/qa/after-hangar-empty-desktop-en.png) · [Research](docs/screenshots/qa/after-research-desktop-en.png) · [Ukrainian phone](docs/screenshots/qa/after-research-phone-ua.png) · [320px/200%](docs/screenshots/qa/after-research-reflow-ua.png) · [compact debrief](docs/screenshots/qa/after-debrief-phone-ua.png). The dossier contains reproducible before/after counts. All earlier captures below are historical, not current defaults.

- Hangar-04: [baseline](docs/screenshots/hangar04-before-desktop-en.png) → [assembly bay](docs/screenshots/hangar04-after-desktop-en.png) · [phone](docs/screenshots/hangar04-after-phone-en.png) · [Ukrainian fallback](docs/screenshots/hangar04-fallback-phone-ua.png)
- Actual mesh swaps: [wing before](docs/screenshots/hangar04-wing-before-en.png) / [after](docs/screenshots/hangar04-wing-en.png) · [antenna before](docs/screenshots/hangar04-antenna-before-en.png) / [after](docs/screenshots/hangar04-antenna-en.png) · [title treatment](docs/screenshots/hangar04-title-desktop-en.png)
- Night-03: [orbital menu](docs/screenshots/night03-menu-en.png) · [before](docs/screenshots/night03-craft-before-en.png) / [after real array swap](docs/screenshots/night03-craft-after-en.png) · [battery inspection](docs/screenshots/night03-battery-en.png)
- [Four illustrated missions](docs/screenshots/night03-missions-en.png) · [Ukrainian academy](docs/screenshots/night03-academy-ua.png) · [launch](docs/screenshots/night03-launch-en.png) · [failure/repair](docs/screenshots/night03-debrief-failure-en.png) · [provisional pass](docs/screenshots/night03-debrief-pass-ua.png)
- [Branching upgrade tree](docs/screenshots/night03-tree-en.png) · [Ukrainian](docs/screenshots/night03-tree-ua.png) · [phone](docs/screenshots/night03-tree-phone-ua.png) · [completed tree](docs/screenshots/night03-tree-complete-en.png)

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

### Hands-on local demo

Open `/nasa-space-apps/` → Academy → accept → select all eight training slots → launch (7.1 h) → network → retry (3.1 h) → menu. Customize starts independently at 0/8. Use the explicit Sandbox repair recipe above, remove a slot to disable Launch, then restore it. Research is one menu selection; entering its Sandbox preview does not silently change mode. Toggle Ukrainian at any point. For legitimate credits/purchases/refunds, see [Mission Campaign](docs/mission-campaign.md).

See [third-party notices](docs/third-party-notices.md) for software licenses and attribution.

## Verification

Current QA-round results and the exact tested/pushed checkpoint are in the
[QA dossier](docs/qa-goal-dossier.md). The records below preserve earlier
milestones; they do not substitute for current clean-copy acceptance.

Hangar-04 preserves evaluator, catalogs, fixtures, progression and save code unchanged. Typecheck, zero-warning lint, build, **147 engine /33 UI** tests pass. The focused six-test production-browser packet covers real mesh swaps, disclosures, both languages, phone/reflow, dynamic fallback and the complete launch/debrief path; the full suite is **42 tests**. [Verification record](docs/hangar-visual-target.md#verification-and-review) includes actual results, clean-install proof and two intermittent parallel-browser failures rather than claiming an entirely clean run history.

The night-03 candidate passes typecheck, lint (zero warnings), build, **147 engine /33 UI /36 production-preview Chrome** tests and audit (zero vulnerabilities). Coverage includes actual WebGL/context-loss/fallback, both-language four-mission flows, automatic academy, immutable launch settlement, foundation fitting, v1/v2 migration with mixed historical/current accounting, **411/411-state solvency**, two branch orders, axe scans, keyboard and 320px/200% reflow. Independent connected Sol reviewed the progression policy and actual tree captures with no remaining blockers. See the handoff for exact checkpoint and clean-copy evidence.

Exact pushed application **`f23fee534aa9418f6e32a87259c06fe73d9081b8`** also passed fresh `npm ci` and **every command above** from an isolated committed archive, with no private/untracked inputs. Remaining limits: the lazy3D chunk is approximately916kB/244kB gzip; installed Chrome coverage is not every GPU/browser or human assistive-technology/native-speaker approval. Final documentation wrap does not change the tested runtime.

The night-02 candidate passed typecheck, lint, build, **133 evaluator/progression**, **27 UI**, and **21 production-preview Chrome tests**. Coverage preserves WF-A/B/C/all 15 audited cases and urban checks, and adds actual bilingual guide/mission/campaign repairs, visible↔thermal capability, exact FIFO relay/boundaries/malformed evidence, all v1 inventories, storage isolation, stale/spoofed reward rejection, fitting/refunds and **48/48-state campaign solvency**. Keyboard focus, axe, 320px/200% text, opened disclosures and reduced motion remain covered. See the handoff for checkpoint and clean-copy evidence.

The historical M4 archive passed a fresh install and all checks; the redesigned wildfire checkpoint `adc8dde` independently repeated that proof with **61 evaluator /19 UI /8 production Chrome** tests and zero install-audit vulnerabilities. Tested with Node **22.23.5** and npm **10.9.9**; Chrome must be separately installed for browser tests. Current-candidate clean-copy results are recorded in the execution log.

**Historical clean-copy proof:** night-01 application `699b6a23e8e135ccc2703deeca82147629c2ec55` passed fresh `npm ci`, all verification commands, **105 /25 /12** tests and zero audit vulnerabilities. Current night-02 committed-copy proof is recorded in the [handoff](docs/overnight-handoff.md).

**Night-02 clean-copy proof:** application `309250d855ff00f9029fe587fc3c4d0451529f73` passed fresh `npm ci`, typecheck, lint, **133 engine /27 UI /21 production Chrome** tests, production build and zero-vulnerability audit from an isolated committed archive outside the checkout. Toolchain: Node22.23.5/npm10.9.9/Chrome157.0.8103.78. Final wrap is documentation only; no deployment.

All passing examples are **provisional model passes**, conditional on synthetic access/contact fixtures and assumed tracking/integration. Fixture latency is not validated physical observation age. An insufficient optimistic useful-return ceiling can prove urban failure; it is labelled as a ceiling, not achieved delivery. This is not flight qualification, an operational alert service, or NASA endorsement.

The lunar relay remains a short [scenario backlog](docs/scenario-expansion.md#further-scenario-backlog): no Earth-imaging equations have been misused as lunar geometry. Full-region active-fire, flood and methane remain deferred. Local campaign saves are convenience state, not tamper-proof accounts or cross-device synchronization.
