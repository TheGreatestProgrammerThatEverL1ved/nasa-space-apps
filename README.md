# MISSION FORGE

A browser mission-design game for NASA Space Apps 2026, Dnipro, Ukraine. Design **Return the Heat Map**, a scheduled wildfire thermal-anomaly training mission, and learn how mass, power, budget, data, communications, and time shape the outcome.

- [Player guide](docs/game-rules-player.md)
- [Technical game rules](docs/game-rules-technical.md)
- [Agent workflow and review gates](docs/agent-workflow.md)
- [Agent entry point](AGENTS.md)

**Current stage: M1 playable; execution continues through conformance and delivery checks.** The approved [implementation plan](docs/implementation-plan.md) and [execution log](docs/execution-log.md) record authorization, progress and verification.

## Run locally

Node 22.22.2+ (or a compatible supported Node release) and npm:

```sh
npm ci
npm run dev
```

Open the printed local URL under `/nasa-space-apps/`. Start with the supplied WF-B/single-station design, run the mission, read the 7.1 h latency failure, change **Ground service** to the network, and run again: 3.1 h, provisional pass. English/Ukrainian controls and results are available.

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

All current passing examples are **provisional model passes**, conditional on synthetic access/contact fixtures and assumed tracking/integration. This is not a flight-feasibility claim, an operational fire-alert service, or NASA endorsement. The original full-region active-fire brief, coastal flood, and methane missions are deferred.
