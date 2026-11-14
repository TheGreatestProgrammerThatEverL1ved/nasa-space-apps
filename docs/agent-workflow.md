# Agent workflow and documentation handoff

## 1. Authority, scope, and human gates

[Technical rules](game-rules-technical.md) are the implementation-facing rulebook; [the player guide](game-rules-player.md) is its short explanation. Both derive from the [audited 14 November 2026 Step 2 source record](02-game-rules.md). Preserve that record. Step 1 supplies consistent challenge context and the selected stack; the two local research drafts are supporting material only. Older source constants do not override the audit.

Three human review points are mandatory:

1. **After documentation (current stop):** review these documents before authorizing implementation planning.
2. **After planning:** review the proposed contract, slices, ownership, acceptance checks, and unresolved decisions before authorizing execution.
3. **At delivery:** review the authorized implementation and its verification before accepting delivery.

During an authorized phase the orchestrator resolves routine editorial/integration choices and fixes recoverable errors. Do not ask the user to arbitrate every task. Escalate missing access, destructive Git conflicts, or genuine science/product decisions only when they block safe progress. Record nonblocking implementation questions beside the affected technical rule, not as invented answers.

**Agreed planning direction, not an implementation plan:** the first coding slice must contain a basic keyboard-operable React + TypeScript + Vite browser UI: choose parts, run one mission, see a verdict and repair hint, revise, and retry. Keep the deterministic evaluator independent of React, with separate catalog/scenario data and one shared contract. Once that contract exists the UI can consume fixtures while the evaluator is built. Later visualization consumes the same evaluator result, never a second verdict. English/Ukrainian UI parity, text warnings, reduced motion, and a text/skip path remain requirements. This phase writes documentation only; planning, scaffold changes, and simulator code each await their authorized phase.

## 2. Preflight and repeatable routing

Before work, inspect checkout/origin, branch and upstream, tracked modifications, untracked inputs, and applicable instructions. Fetch origin and compare histories. Read the governing source in full. Record the installed OpenCode version, loaded config scopes, selected session model/variant, and actual available child agents without publishing personal settings or credentials. A configured default is not the selected session model. A V2 model-less child inherits the parent.

The orchestrator must be **GPT-6.1 Sol High**. Verify the session explicitly; if another model is selected, ask the user to switch before orchestration. Use the installed version's supported agent definitions and discovered connected model IDs, not guessed names.

| Route | Assignment and fallback |
|---|---|
| Local Qwen / `quick-local` | First choice for a bounded lookup, path/link check, or small copyedit that fits its eight-step cap. Give only relevant files; **one local job at a time**. If unavailable or too broad, use DeepSeek, then Sol. |
| DeepSeek V4.1 Flash | Default for substantive routine drafts and source-coverage checks, in small packets. Use an explicitly identified route. Honor a reported short retry window when practical; reroute sustained rate limits, exhausted quota, or unavailable service to Codex, then Sol. Do not repeatedly dispatch to an exhausted route. |
| Genuine connected OpenAI/ChatGPT Codex route | Hard specification ambiguities, independent pass-critical review, and DeepSeek fallback. Availability requires a successful smoke task with the needed tools, not merely a model listing. If unavailable, Sol completes the work and reports the missing Codex coverage. **Never fall back to a paid OpenCode model.** |
| Sol High orchestrator | Source precedence, decisions, integration, final verification, branch creation, commits, pushes. An independently dispatched Sol reviewer can review read-only, but must not be described as Codex. |

Use the user's connected **OpenAI/ChatGPT** provider for GPT workers. Keep **free** DeepSeek and local Qwen in their roles. If a connected reviewer is unavailable, review in the current Sol High session; never substitute a paid OpenCode model.

Smoke-test a new route with a small named-file read and exact expected facts before relying on it. Confirm its effective identity and permissions. Keep setup minimal and credential-free; preserve existing Qwen and search configuration. Do not commit private local config. In Phase 1 deny all worker tools except necessary reads/searches: no edit, shell, Git-write route, generic execution route, or child dispatch. Check effective permissions rather than trusting a prompt alone.

## 3. Assignment and return contract

Every packet states:

```text
Goal and source revision:
Relevant inputs (named files/sections only):
Owned output paths, or READ-ONLY / response draft:
Forbidden/shared paths:
Acceptance checks:
Expected report: findings/draft or changes; checks actually run; blockers.
Limits: no Git mutations; no further workers; no scope expansion.
```

The orchestrator writes all final Phase 1 files. Workers return text, not patches applied to the checkout. Do not claim a proposed check was run.

In future authorized execution, parallelize independent tasks with explicit, disjoint file ownership. Suggested module boundaries are **catalog/scenario data**, **pure evaluator**, **UI and localization**, and **derived presentation/timeline**; exact paths belong in the approved plan. The existing `src/engine/types.ts` is an older contract candidate, not a frozen agreement. A single named contract owner integrates field names, units, provenance, requirement statuses, result/diagnostic shapes, and fixture revision identifiers. Contract changes go through that owner before dependent workers adapt. Fixtures and evaluator must satisfy the same contract. Workers must not opportunistically edit shared files, package metadata, or someone else's module.

Return bounded reports early when blocked. Integrate findings against source authority; independently inspect pass-critical arithmetic. Do not turn a worker's confidence label into verified evidence.

## 4. Verification and Git ownership

For documentation:

- Cross-check all adopted catalog values, fixtures, equations, inclusive thresholds, outcome precedence, and provisional claims against Step 2.
- Keep the 15 negative/boundary checks and three conditional passing builds reproducible.
- Cross-check the player guide's thresholds and repair advice against technical rules; exclude formulas, status codes, and sample solutions from the player guide.
- Recalculate a passing build, decimal downlink conversion, and cadence/tracking failure independently. Record rounding discrepancies without changing thresholds.
- Check local Markdown links and source references. Distinguish source-register evidence inherited from the audit from URLs actually fetched in this phase.
- Run `git diff --check`; inspect the exact staged file list and staged diff for credentials, private config, unintended source/scaffold changes, and unrelated drafts. No application tests are expected for docs-only changes.

Only the orchestrator may change Git state, including branch/index/commit/push. Use **`mission-forge`**, created once from the appropriate `main` base or reused. Fetch before deciding; fast-forward straightforward histories without discarding work. Report exact divergence if it cannot be resolved safely. No extra branch, worktree, PR, merge to `main`, force-push, reset, or clean in this phase.

Stage explicit intended paths only. Preserve user modifications and untracked inputs; never use blanket staging. On an initial push use `git push -u origin mission-forge`; otherwise push the configured upstream normally. Verify `git ls-remote origin refs/heads/mission-forge` equals local `HEAD`. A local commit remains **pending** until this succeeds. Recoverable transport errors may be retried; authentication/permission blockers need a specific report and resumption after access returns.

## 5. Phase 1 discovery and execution record — 14 November 2026

- Existing local checkout, correct origin, initial `main` and `origin/main` at `5044f79a2291eac982b64251df317deae0124fad`; fetch confirmed no divergence and only remote `main`. No pre-existing project/ancestor `AGENTS.md` was found. Created `mission-forge` once, preserving the working tree.
- Preflight found a modified `.gitignore` and untracked React/Vite scaffold, engine types/constants, package files, config, Step 1, audited Step 2, and two research drafts. Preserve these inputs. Publish the audited source record with the new rulebooks; do not publish the unrelated drafts, private config, or scaffold in this documentation commit.
- OpenCode **v2.3.0**; loaded built-in/global and project config scopes verified through the location-scoped API. Session explicitly confirmed **`openai/gpt-6.1-sol#high`**. The project's DeepSeek default does not replace that session selection. Existing `reviewer` was model-less; `quick-local` was pinned to Qwen with eight steps.
- Minimal local-only agent additions identified DeepSeek and the initially discovered Codex route; worker permissions restrict them to documentation reads (Qwen also has bounded search tools). Effective definitions were checked. After the user's connected-provider-only direction, the local legacy-named `codex-review` role was mapped to Sol High and explicitly labelled **not Codex**; preserve that selected connected route rather than misreport its identity. Existing Qwen identity, step cap, default setting, and search setup were preserved; no endpoints, credentials, or personal settings belong in this repository handoff.
- Local Qwen smoke succeeded using `read` on the audited rules. Before the user's routing correction, the paid DeepSeek and **`opencode/gpt-5.3-codex#high`** smoke requests failed with insufficient provider credits, before tool execution. **Codex tool access was not verified and no Codex review was completed.** No Codex route was listed on the connected OpenAI provider. The accepted routes are **`opencode/deepseek-v4.1-flash-free`** and **`openai/gpt-6.1-sol#high`**; no further paid OpenCode dispatch is permitted.
- The source was read in full, including the audit and research context. Source types/constants reflect an older ruleset (partial-pass bands, blended scores, pointing penalties, inferred revisit and lifetime) and must not be copied as current rules. No source migration is authorized here.

See the completion record below for worker coverage, actual arithmetic/link/diff checks, and handoff state. Nonblocking planning questions are colocated in the technical rulebook.

## 6. Completion record

- **Actual worker coverage:** `quick-local` used **`strata/qwen3.8-flash-next-iq3_xxs`**, one job at a time, for source/date/register checks and direct entry-point link checks; its eight-step cap was retained. **`opencode/deepseek-v4.1-flash-free`** passed a named-file read smoke and returned the player-guide draft. The orchestrator integrated that draft, separating synthetic target opportunities from evenly spaced ground contacts. The model-less `reviewer` session was explicitly verified as **`openai/gpt-6.1-sol#high`**; it reviewed the full audit and integrated handoff, identified the colocated ambiguity questions, independently checked representative arithmetic by hand, and found no must-fix discrepancy in the reviewed snapshot. All workers were read-only, returned findings/checks/blockers, and launched no workers. This is **Sol review, not Codex coverage**.
- **Arithmetic actually run:** standalone Python double-precision calculations, not application code/tests, reproduced all three builds' mass, cost, worst-orbit energy, battery/peak, data, queue, pointing/scale, and latency outputs within the audit's displayed precision. WF-A: **18.9635 kg, $2,673,750, 3.465 GB/day, 2.190909 h**; WF-B: **19.7685 kg, $2,921,000, 37.8 GB/day, 3.1 h**; WF-C: **23.7705 kg, $2,846,250, 3.465 GB/day, 2.190909 h**. All remain provisional passes under accepted assumptions.
- **Boundary coverage:** retained and checked all 15 listed cases using arithmetic or static assertions as appropriate; missing evidence, absent thermal capability, and provisional status were static rule checks, not runtime evaluator tests. Independently confirmed **1 Mbps for 1 min =0.0075 GB raw**; S-band/network **1.890 GB/day** deficit; X-band/single-station **12.6 GB/day but 7.1 h** latency failure; no tracking **286.692017923 m >200 m**. An initial verification assertion used an overprecise handwritten 24 W reference; checking against the source's six-decimal value resolved it: **19.546213817 Wh →19.546214 Wh**, still a deficit. The rerun passed; no rule/output discrepancy required changing the audit.
- **Links and preservation actually checked:** all **17 local Markdown links** resolved; all **16 unique source-register URLs** were retained exactly. Source-register facts were checked against the audit, not re-fetched as new external evidence. The audit body was SHA-256 checked as unchanged after removing only the new archival banner; the other **23 pre-existing sampled input files** (including scaffold and `.gitignore`) matched their pre-edit hashes. README was intentionally replaced; private config adjustments were separately inspected and excluded from staging.
- **Scope/security actually checked:** explicit six-path index; staged content matched intended working files. Read the staged entry-point/workflow/player/technical diffs and checked the archived source against its read-and-hashed original body. Credential/private-key/token/local-endpoint/personal-path patterns found no matches in staged files. Both `git diff --check` and `git diff --cached --check` passed. No application build, lint, application test, deployment, or simulator implementation was performed.
- **Remaining planning questions:** fixed versus editable controls; malformed versus explicitly unknown fields; complete allocations for failing teaching payloads; tracking-state representation; observation-to-smoothed-arrival timing; initial queue/loss policy and display epochs; diagnostic counting; margin display; and preflight versus counterfactual timeline presentation. Their impacts and questions are next to the affected technical rules. None changes the audited thresholds; exact physical product-age claims remain unestablished.

The final handoff records commit/push and remote-SHA verification after these documentation checks. **Stop at human documentation review.** Do not interpret this direction as authorization to plan or code.
