# MISSION FORGE — agent entry point

## Current status

Read [the status handoff](docs/STATUS.md) first: what is implemented, what is verified, the one
gate still open, and what cost time last round.

## Post-M4 authorization

The current user authorizes a visual/bilingual redesign and scenario expansion from M4 `397c041591ce3efaaa6d49faf7d67b4dd36fed55`, with local tests, commits and pushes on `mission-forge`. This supersedes the historical wildfire-only execution boundary below, **not** the audited wildfire mechanics. Ship the redesigned wildfire checkpoint independently before integrating urban heat. New scenario policy is documented separately in [the expansion supplement](docs/scenario-expansion.md). All preservation, ownership, permitted-model routing and Git restrictions below still apply. No live deployment, PR or merge; stop at a reviewable delivery candidate.

## Authority and phase boundary

- Start with [technical rules](docs/game-rules-technical.md), [player guide](docs/game-rules-player.md), and [workflow](docs/agent-workflow.md).
- The audited Step 2 revision of **14 November 2026**, preserved in [the source record](docs/02-game-rules.md), governs gameplay and engineering. The technical rules reorganize it; they do not authorize rebalancing. Escalate a genuine contradiction instead of silently changing a threshold.
- Step 1 supplies consistent challenge context and React + TypeScript + Vite direction. Local research drafts are supporting evidence, not rules. Existing source constants/types are older implementation history, not authority.
- **Execution authorized** from approved plan `71415323577c0cecc1764672e0621a47a0d74866`: implement [the plan](docs/implementation-plan.md) in milestone order. Push M1 after real bilingual keyboard acceptance, then continue conformance/accessibility/delivery checks. Stop at delivery review. No live publishing, PR, or merge to `main`.
- Only **Return the Heat Map**, a scheduled wildfire thermal-anomaly training mission, is active. All current passes are conditional model passes. Do not revive full-region active-fire, flood, or methane gameplay.

## Ownership

- The orchestrator integrates final documentation and owns shared contracts, source precedence, verification, and **all Git mutations**.
- Execution workers may edit only assigned disjoint paths; reviewers stay read-only. No shell/Git writes or further workers. Return changed paths, checks actually run, and blockers.
- Assign disjoint catalog/scenario-data, pure evaluator, UI/localization, and derived-visualization paths. Sol owns `src/engine/types.ts`, policy constants, integration, and Git. See the plan for routing and handoffs. GPT workers use connected OpenAI only; routine workers use free DeepSeek, bounded checks use local Qwen. No paid OpenCode routes.
- Preserve tracked and untracked user work. Never stage the whole checkout, private config, or unrelated drafts.

## Verification

- Docs: check links, source precedence, player/technical consistency, all WF-A/B/C examples and 15 boundary checks; independently recalculate representative results. Run `git diff --check` and inspect the staged diff for scope and secrets.
- Execution requires real evaluator/browser acceptance in both languages, all three passing builds and 15 audited cases, build/lint, accessibility and clean-install verification. Inspect actual scripts and record checks actually run.
- Use only branch `mission-forge` in this phase; no extra branches, worktrees, PRs, merges to `main`, force-pushes, resets, or cleans. A commit is pending until pushed and remote SHA verification succeeds.
