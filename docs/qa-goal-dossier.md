# QA goal dossier — in progress, NOT delivery

Baseline: `2e92cb49a6be256d32128d2433697fa79eaa5bd2` (local and origin).
Implementation checkpoint is being prepared; clean committed-copy acceptance
is still open, so this remains **partial**. The goal spec `mission-forge-qa-goal.md` is committed
for the next agent, and [the status handoff](STATUS.md) is the short entry point. Existing unrelated
drafts, private config, untracked public assets and historic screenshots are excluded from staging.

| Gate | Current evidence | Status / checkpoint |
| --- | --- | --- |
| Fresh drafts | `qa-goal.test.tsx`, `player.test.ts`, Academy and both Campaign browser orders: eight actual-control selections; 0/8 on every new draft | Focused pass; clean-copy gate open |
| Parts / balance | 35 distinct IDs, 12 additions; all 12 in eight passing witnesses, four budget-only and four under-budget failures; real Campaign inventory witnesses; both-renderer visual swaps | 157 engine / new visual browser checks pass; clean-copy gate open |
| Text | Structural and paragraph assertions on every specified screen, EN/UA × 1440/390/320-200%; actual before/after captures | Focused pass; final capture/color rerun and clean-copy gate open |
| Research | 12 nodes / eight real purchases; price, states, separate equip, touch re-tap, genuine earn/buy and historical reload/refund browser checks | Focused pass; color specificity correction and clean-copy gate open |

Manifest, provisional provenance, caps and solvency invariant:
[player balance](player-balance.md). Exact loadouts:
`src/data/player/witnesses.ts`. Automated witness arithmetic:
`tests/conformance/player.test.ts`.

## Checks and observed failures

- Baseline build, 147 engine and 33 UI passed before edits.
- Baseline visible paragraph counts at 1440 / 390 widths:
  menu 4, Hangar 9, Missions 17, embedded Research 61. Definition:
  visible rendered `<p>` excluding screen-reader-only and descendants of
  closed details; counts include the selected screen, not chrome.
- Initial baseline Hangar capture did not await WebGL readiness and showed
  boot overlay; it was **not settled-WebGL evidence**. It has been replaced
  with a settled capture from the exact archived baseline, not relabelled.
- New typecheck and lint passed before catalog slice; catalog typecheck passed.
- First named relay-B failed **only ENG-BUDGET**, $2,547,250 vs $2,500,000.
  Explicit 100 → 50 Mbps radio change repaired it to $2,478,250; physics/cap
  were not changed to erase the failure. All ten focused player engine checks pass.
- First migrated UI run: 27 passed / 6 failed. All six depended on old
  automatic starting equipment or automatic purchase fitting. Tests were
  migrated to explicit actual-control assembly while retaining outcome checks.
- Two historical browser intermittents are retained in
  [hangar visual dossier](hangar-visual-target.md): urban EN React #156 and
  Campaign UA context closure after axe. They require review and a full
  parallel production run; passing retries do not erase initial observations.
- Working-copy full browser run at four workers: 45 passed / four failed.
  Two were an obsolete urban repair that now exceeded the cap by **$33,000**
  ($2,783,000 vs $2,750,000; correcting an earlier rough $4,500 estimate);
  the test now explicitly selects the new 50 Mbps radio (lower DC/cost).
  One 30-second whole-test deadline expired during the last of eight genuine
  launches; explicit assembly adds many controls, so that flow now has 60 s.
  One Chrome target crashed during assembly. Resource contention is a
  hypothesis, not a proven driver diagnosis; default parallel concurrency is
  bounded to two. The next two-worker run had 49 passes, no crash and no #156;
  two new visual assertions failed because their "before" bus was already
  the selected new bus. They now explicitly compare each new shape to the
  reference part, not to itself.
- A verification copy under `node_modules/.cache` could build but Playwright
  rejected TS type stripping under node_modules before tests. `/tmp/opencode`
  is root-owned and unwritable here; subsequent copies use uniquely-created
  `/tmp/mission-forge-*` directories, not Git branches or worktrees.
- `/tmp/opencode/qa-ui.log` and `qa-engine.log` redirection was denied before
  running commands. Unique `node_modules/.cache/qa-goal-*` logs used instead.

## Worker record

| Route | Packet | Delivered / checks | Takeover |
| --- | --- | --- | --- |
| Free DeepSeek V4.1 Flash | Research screen/styles, disjoint first wave | Quota exhausted before edits | Ownership released; connected Sol fallback |
| Free DeepSeek V4.1 Flash | Menu/gallery density, disjoint first wave | Same provider-wide quota, no edits | No further exhausted-route dispatch |
| Local Qwen / quick-local | Bounded 12-ID label/appearance parity | 12 labels/registry IDs confirmed via grep; reads denied, geometric continuation check incomplete at step cap | Root reviewed mounted shape fields; ground is a service, not mounted hardware |
| Connected Sol High | Draft semantics, catalog/balance, integration and fallback | Root edits and actual checks above | No paid routes |
| Connected Sol review alias (not Codex) | Source-boundary review | Blocked before reads by documentation-only controlling scope | No independent source-review claim; root manually reviewed boundaries |

## Captures and remaining clean-copy gate

Focused production Chrome: 9/10 passed initially. UA Research at 320px/200%
overflowed its long title; explicit title wrapping added. Screenshot inspection
also found scroll-triggered hover could overwrite a focused node's inspector;
keyboard focus now remains authoritative until actual pointer movement.
Touch first-preview/second-purchase and both real Campaign orders passed.
Final focused production Chrome visual/density run: **9/9 passed**.
EN/UA × all three viewports have identical default paragraph counts:
menu **1** (only current mission; **zero explanatory paragraphs**),
Hangar **1**, Missions **4** (one objective/card), debrief **2**
(verdict qualifier and important number), Research **1** (inspector status).
The matched failed-debrief comparison is **9 → 3** paragraphs; the additional
paragraph names the failed requirement. The pass is separately captured at 2.
Before: **4 / 9 / 17 / 9 / 61**, respectively. Baseline recapture is from
an untouched exact-archive production build and awaits settled WebGL,
including scrolling the 320px canvas into view before resetting the page.
`scripts/qa-baseline.mjs` and `qa-goal.spec.ts` use the same definition:
all rendered `<p>` in the screen (including scrollable content), excluding
screen-reader-only text and closed disclosures. The initial scoped `main p`
recapture undercounted embedded Research (24); full-screen counting correctly
retains the original **61**, with the correction recorded rather than hidden.
UI **39/39**, engine **157/157**, build/typecheck/lint and audit (0 vulnerabilities)
pass locally. Screenshot inspection also found selected Research nodes inherited
the generic blue border; state colors now override selection and have computed
RGB assertions. The full **51/51** two-worker production-browser run passes
that correction, both Campaign orders and both-renderer shape comparisons.
All **81** pre-existing tracked screenshots remain byte-for-byte unchanged.

The matched failure-density rerun also passes **7/7** after adding the
9 → 3 failed-debrief comparison. Both locales and all three viewport/text
combinations were actually captured; **36 curated PNGs / 11.05 MiB** are kept,
including paired desktop EN, phone UA and 320px/200% UA states, empty builds,
a separate passing debrief and both new-hardware renderer examples.
[Baseline counts](screenshots/qa/baseline-counts.json),
[after counts](screenshots/qa/after-counts.json), and the
[dimension/SHA-256 manifest](screenshots/qa/captures.json) are retained.
Inspection covered actual menu, Hangar, Missions, failed/passing debrief,
Research, phone/reflow and both hardware renderers. The installed-parts
stress capture deliberately includes an over-budget / wrong-role design;
its visible blocker is not represented as a pass.

**Next command after scoped push:** extract that exact committed SHA into a
new isolated directory, `npm ci`, then typecheck, lint, engine, UI, build,
`MISSION_FORGE_PREVIEW=1 npm run test:e2e`, and audit. No private or untracked
inputs, branch/worktree, deployment, PR or merge. Final acceptance requires
the clean-copy results and remote SHA verification, not this checkpoint.
