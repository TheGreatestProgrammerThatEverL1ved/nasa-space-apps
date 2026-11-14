# MISSION FORGE — agent entry point

## Authority and phase boundary

- Start with [technical rules](docs/game-rules-technical.md), [player guide](docs/game-rules-player.md), and [workflow](docs/agent-workflow.md).
- The audited Step 2 revision of **14 November 2026**, preserved in [the source record](docs/02-game-rules.md), governs gameplay and engineering. The technical rules reorganize it; they do not authorize rebalancing. Escalate a genuine contradiction instead of silently changing a threshold.
- Step 1 supplies consistent challenge context and React + TypeScript + Vite direction. Local research drafts are supporting evidence, not rules. Existing source constants/types are older implementation history, not authority.
- Current authorization is **documentation only**. Stop for human review after documentation; planning needs separate authorization, and execution needs approval of that plan. Do not scaffold, migrate types, implement an evaluator, or deploy in this phase.
- Only **Return the Heat Map**, a scheduled wildfire thermal-anomaly training mission, is active. All current passes are conditional model passes. Do not revive full-region active-fire, flood, or methane gameplay.

## Ownership

- The orchestrator integrates final documentation and owns shared contracts, source precedence, verification, and **all Git mutations**.
- Phase 1 workers are read-only: return drafts/findings, checks actually run, and blockers. No file writes, shell/Git writes, or further workers.
- Future authorized work must assign disjoint catalog/scenario-data, pure evaluator, UI/localization, and derived-visualization paths. One owner integrates the shared contract; do not edit it concurrently. See the workflow for routing and handoffs.
- Preserve tracked and untracked user work. Never stage the whole checkout, private config, or unrelated drafts.

## Verification

- Docs: check links, source precedence, player/technical consistency, all WF-A/B/C examples and 15 boundary checks; independently recalculate representative results. Run `git diff --check` and inspect the staged diff for scope and secrets.
- No application tests are expected for documentation-only work. A local scaffold is not proof of a working game. Future authorized phases must inspect actual package scripts before choosing build/test commands, and record what ran.
- Use only branch `mission-forge` in this phase; no extra branches, worktrees, PRs, merges to `main`, force-pushes, resets, or cleans. A commit is pending until pushed and remote SHA verification succeeds.
