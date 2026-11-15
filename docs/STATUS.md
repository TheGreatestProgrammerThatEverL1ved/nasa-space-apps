# MISSION FORGE — status handoff

Updated 15 November 2026, branch `mission-forge`. This round's work is committed as
**`5b7d29919df4b712becb5c1febaab5340ae12edc`** (96 files) on top of the audited baseline
`2e92cb49a6be256d32128d2433697fa79eaa5bd2`, and that commit is pushed: `git ls-remote origin
refs/heads/mission-forge` returns the same SHA as local `HEAD`. The four-goal specification that
drove this round is committed as `mission-forge-qa-goal.md`, and the full evidence record is
[the QA dossier](qa-goal-dossier.md). A friend or another agent can take over from this commit.

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

## Verified locally before committing

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

## Clean-copy gate: closed

The pushed SHA was extracted with `git archive` into a fresh directory and checked there, in order:
`npm ci` (0 vulnerabilities) → typecheck (exit 0) → lint (exit 0) → `npm test` **157/157** →
`npm run test:ui` **39/39** → `npm run build` → density-focused Playwright run **7/7** with counts
matching `after-counts.json` → full production-preview Playwright suite **51/51** →
`npm audit --audit-level=moderate` (exit 0). Exact command list:

```bash
git archive 5b7d29919df4b712becb5c1febaab5340ae12edc | tar -x -C /tmp/mf-check && cd /tmp/mf-check
npm ci
npm run typecheck && npm run lint
npm test && npm run test:ui
npm run build
MISSION_FORGE_PREVIEW=1 npx playwright test --grep "QA density|touch Research" --workers=1
MISSION_FORGE_PREVIEW=1 npm run test:e2e
npm audit --audit-level=moderate
```

Staged scope was verified too: no `opencode.jsonc`, `public/`, `src/assets/`, `dist/`,
`node_modules/` or `test-results/` is committed, no credential-looking text in the diff, every
relative Markdown link resolves, `git diff --cached --check` is clean, and all 81 previously
tracked screenshots are byte-for-byte identical to the baseline.

## Two known flakes, not code bugs

- **Playwright EN concurrency:** the first full clean-copy run at the configured two workers failed
  2 of 51 (`campaign.spec.ts` *campaign earn → unlock → redesign … (en)* and `visible.spec.ts`
  *visible lens tradeoff and capability repair (en)*, which timed out waiting for `requirement-VM-GSD`
  to read `Not met`). Both passed when rerun alone at one worker, and both passed in the next two
  full runs (51/51 at one worker, 51/51 at two). No assertion or threshold was changed.
- **Vitest UI worker SIGSEGV:** 2 of 11 `npm run test:ui` runs crashed a fork worker on
  `tests/ui/parity.test.tsx` (`Worker exited unexpectedly with signal SIGSEGV`, 27 tests executed,
  no failed assertion); the other 9 and six later consecutive reruns reported 39/39. Rerun rather
  than editing `parity.test.tsx`.

Both correlate with this host's memory state during the runs: about 7.4 GiB free RAM with
14.2/16.4 GiB swap in use. If you hit either, free memory first and rerun at `--workers=1`.

## What to do next

1. Review the checkpoint (`git diff 2e92cb4..5b7d299 --stat`, then the gate table in
   [the QA dossier](qa-goal-dossier.md)). It is a reviewable delivery candidate: nothing is
   published, submitted, PR'd or merged.
2. The redesigned wildfire checkpoint is now shipped independently, so the next authorized work is
   urban-heat integration, following [the expansion supplement](scenario-expansion.md) and keeping the
   audited wildfire mechanics untouched.
3. Re-run the checks from a clean copy of the pushed SHA before building on top of it, and add new
   evidence to the dossier rather than rewriting the record above.

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
