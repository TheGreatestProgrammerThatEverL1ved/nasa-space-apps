# MISSION FORGE — status handoff

Updated 15 November 2026, branch `mission-forge`. Entry HEAD and `origin/mission-forge` were
both **`2e92cb49a6be256d32128d2433697fa79eaa5bd2`**; this round's work is committed on top of
it. The four-goal specification that drove this round is committed as `mission-forge-qa-goal.md`,
and the full evidence record is [the QA dossier](qa-goal-dossier.md).

## What is implemented

1. **Empty builds.** Fresh Sandbox, Campaign and Academy drafts start at 0/8 selected. All eight
   slots (bus, payload, solar array, battery, radio, ground, orbit, launch service) need explicit
   selection; per-slot Remove and a visible Clear Build exist; no hidden defaults or first-item
   substitutions after refunds or context changes. Partial state is a distinct `PartialDraft` type
   in `src/engine/draft.ts`, so an incomplete craft can never produce a launch result, telemetry,
   reward or Campaign progress, and visuals/fallbacks draw only actually selected IDs.
2. **More hardware, real budgets.** `src/data/player/` adds a revisioned player catalog and mission
   context layer: 12 new IDs (two each in bus, array, battery, radio, ground station, payload) over
   35 selectable IDs total, with explicit budget/latency tradeoffs in `src/data/player/catalog.ts`
   and witnesses in `src/data/player/witnesses.ts`. Every mission now has two Pareto-distinct passes
   that differ in two categories, a budget-only failure that a one- or two-selection repair fixes,
   an under-budget non-budget failure, and a solvable Campaign completion. The audited catalog and
   mission data are unchanged and reachable only as clearly labeled internal tooling at
   `?view=engineering&catalog=reference`; that catalog cannot launch through the player flow or
   award credits.
3. **Less default text.** Menu, Hangar, Mission list and debrief default prose is reduced with
   reproducible counts, and Research collapsed into a shared inspector. Details expand on demand in
   both languages.
4. **Research tree.** `src/ui/research/ResearchScreen.tsx` is a standalone 12-node tree with
   8 purchasable items, yellow buyable / red unavailable / green owned states, a shared inspector,
   deliberate touch preview-then-purchase, keyboard state handling, and refunds at historical paid
   bases. Purchases never auto-equip.

## Verified in the working copy at handoff

- Typecheck, lint and production build clean; `npm audit --audit-level=moderate` → 0 vulnerabilities.
- Engine conformance **157/157**, UI **39/39**, production Chrome **51/51**, matched
  failure-density focused run **7/7**.
- Visible default paragraphs per screen (EN and UA identical at 1440px, 390px/100%, 320px/200%):
  menu **1**, Hangar **1** (empty Hangar **1**), Missions **4**, passing debrief **2**, failed
  debrief **3**, Research **1** — from baselines menu 4, Hangar 9, Missions 17, debrief 9,
  Research 61. Counts live in `docs/screenshots/qa/baseline-counts.json` and `after-counts.json`,
  with 36 curated PNGs and a SHA-256 manifest in the same folder.
- All 81 previously tracked screenshots are byte-for-byte unchanged; historical saves and credit
  ledgers are untouched.

## The one gate still open

Committed clean-copy proof. Extract the pushed checkpoint SHA into a new isolated directory
(`git archive` is enough), then run, in order:

```bash
npm ci
npm run typecheck && npm run lint
npm test && npm run test:ui
npm run build
MISSION_FORGE_PREVIEW=1 npx playwright test tests/e2e/qa-goal.spec.ts --workers=1 --grep "@density"
MISSION_FORGE_PREVIEW=1 npm run test:e2e
npm audit --audit-level=moderate
```

Then record results in `docs/qa-goal-dossier.md` and confirm `git ls-remote origin refs/heads/mission-forge`
equals `HEAD`. No deployment, PR, merge, extra branch, worktree, or force push.

## Things that cost time last round

- **Browser concurrency:** four parallel Chromium contexts crashed the renderer. Two workers is the
  observed ceiling here. A four-then-two-worker retry is recorded as a transient failure, not a code
  fix, and no assertion was weakened to make a run pass.
- **Free DeepSeek quota is exhausted.** Two dispatched workers failed on quota before producing any
  diff; the connected root route finished their packets. Do not keep dispatching to that route.
- **Density definition matters:** count every rendered `<p>` in the whole screen, including
  scrollable content, excluding screen-reader-only text and closed disclosures. `scripts/qa-baseline.mjs`
  and `tests/e2e/qa-goal.spec.ts` share that definition; a `main p` scoped count undercounted the
  baseline Research screen (24 instead of 61).
- **Baseline recapture** must wait for settled WebGL (scroll the 320px canvas into view, then reset
  the page) or counts and images drift.
- Research node state colors were overridden by the generic selected-node border until computed-RGB
  assertions caught it.

## Rules that still apply

`AGENTS.md`, [technical rules](game-rules-technical.md), [player guide](game-rules-player.md) and
[workflow](agent-workflow.md) still govern. `docs/01-analysis-and-plan.md` and `docs/research/*.md`
are committed Step 1 / research supporting context, not engineering rules. Only `Return the Heat Map`
missions are playable gameplay; do not revive full-region active-fire, flood or methane gameplay.
Escalate a rules contradiction instead of changing a threshold. Stage explicit paths only — private
`opencode.jsonc` and the local `public/` and `src/assets/` inputs stay untracked and were
deliberately not committed.
