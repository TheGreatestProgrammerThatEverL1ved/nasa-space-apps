# Mission Forge handoff for Space Mission Design

Use the **Space Mission Design ZIP as the destination project**. Its React/Vite frontend, FastAPI API, Python catalog and simulator, and SQLite persistence remain the base. The Mission Forge branch is a source of features, tests and documented engineering tradeoffs. The two repositories have different save formats, catalog IDs, units and models. Integrate one feature at a time and verify it in the destination's normal UI.

Baseline on our branch: `1a63a23727b80cd27a77eddc4802185c8d9f1ba0`. The earlier [QA dossier](qa-goal-dossier.md) records the bilingual empty-build, 12-part, wallet, and Research verification. The latest [status](STATUS.md) gives the delta and reproduction commands.

## What the ZIP already contains

- Five destinations in `backend/app/catalog.py`: Earth, Moon, Mars, asteroid, Jupiter. There are 11 orbit entries, three launch vehicles and 24 components.
- `backend/app/engineering.py` checks mass, budget, duty-cycle load, storage and other constraints. `backend/app/simulation.py` produces 120 time steps and uses a deterministic seed. Selected interventions affect later operations.
- `frontend/src/lib/store.ts` stores configuration and UI state in Zustand and calls `/api/evaluate` and `/api/simulate`. The API supports saved mission designs and simulations through SQLite.
- Reproduced all **20 backend tests** against the supplied ZIP. Its frontend fails TypeScript build with two unused declarations in `frontend/src/App.tsx`: the Recharts `Bar` import and the `patch` binding in `Learning`. Removing just those two declarations in a temporary copy made the production build pass. The destination still needs a browser run with FastAPI running.
- The ZIP's SQLite save endpoints are for local use. If a judge-facing deployment is needed, decide how its API will run and review what writes can be exposed. A static frontend build alone cannot serve these API endpoints.

## Port by feature

| Feature | Mission Forge source | Destination integration |
| --- | --- | --- |
| Empty draft and guided assembly | `src/engine/draft.ts`, `src/ui/game/GameScreens.tsx`, `src/ui/academy/Academy.tsx` | Replace the gameplay preset initialization in `frontend/src/lib/store.ts` with a partial draft. Treat missing component/orbit/launch selections as draft state, only call simulation with a complete API configuration. Keep explicit training examples in Learning. |
| Launch choice and component tradeoffs | `src/data/player/operations.ts`, `src/data/player/catalog.ts`, `src/data/player/missions.ts`, `docs/player-balance.md` | Port the choices and rationale into the Python catalog and existing slot/fit checks. Use the base's existing launch vehicles. Introduce booking queue, adapter and dispatch constraints only with corresponding backend fields or clearly mark them as a separate mode. Convert USD to millions once at the catalog boundary. Verify quantities, mass, lead time and compatible destinations explicitly. |
| Research and permanent progression | `src/campaign/progress.ts`, `src/ui/research/ResearchScreen.tsx`, `research.css`, `docs/mission-campaign.md` | Keep wallet and unlocks separate from engineering USD. Map each node to a base component ID with a real backend effect. Add a dated persistence migration if already shipping saves. Reuse the visual/interaction design and refund rules. Avoid binding the tree to both saves and two independent wallet implementations. |
| Expedition mode | `src/campaign/expedition.ts`, `src/ui/game/ExpeditionBoard.tsx`, `expedition.css`, `tests/conformance/expedition.test.ts` | Keep the seed/order, accepted-offer, score, supply and attempt rules. Feed them the base's scenario list and an explicit map of economy and priority limits. Make the existing Mission/Simulation pages the assembly and flight screens. Settle only a finished simulation tied to the accepted offer, attempt and frozen configuration. Do not settle each rerender or partial event response. |
| User data handoff | `src/ui/game/DataHandoff.tsx`; four scenario-specific recipients in the module | In Reports add one disclosure naming the recipient, product, model result and intended use. Use the base's delivered amount/fraction and time values only when those fields exist. Show unknown if the base cannot establish delivery time. Keep the actual ground recipient separate from the simulated experiment. |
| Test approach | `tests/conformance/player.test.ts`, `tests/conformance/expedition.test.ts`, `tests/e2e/expedition.spec.ts`, `tests/e2e/qa-goal.spec.ts` | Adapt the scenario inputs and assertions to Python and the destination UI. Keep at least one complete run in each language and assertions that a retry does not debit the permanent wallet. |

## Engine and data boundaries

1. **Mission Forge** uses a static TypeScript evaluator, one selected ID per slot, USD costs and analytical daily delivery constraints. `EvaluationReport` and its revision-aware configuration key are the authority for our provisional verdict. A finite wildfire number is an analytical fixture delivery estimate.
2. **Space Mission Design** uses a Python-backed catalog, item quantities, price in millions of USD, selected maneuver/operations variables, and a seeded time-series simulation. Its assessment and final report are separate. Keep one authoritative verdict for each mode. If you want both engines, expose them explicitly as different scenarios or training modes.
3. **Rebind on acceptance.** Persist a stable scenario ID, offer ID, attempt number, seed and chosen requirements. Freeze the launch configuration. Carry its identity through replays and interventions. Grant a reward at most once when the final report matches. A revision or attempt change invalidates an earlier report. A static preflight can block launch, but if your sim runs, settle after the last event response.
4. **Units.** Convert `cost_m × 1_000_000` at the boundary. Separate launch queue months from mission days, watts from watt-hours, and Mbps from GB/day. Do not map the base's averaged communication opportunity directly to our discrete station contact fixtures. Do not infer mission readiness from an illustration.
5. **Launches and hardware.** The additional bookings on our branch are fictional 24 kg economy and 30 kg express slots for the same model orbit, besides the existing 50 kg option. The new ground plans have no relay window fixtures and therefore appear in the three imaging missions only. The 43 unique selections are counted across all four missions. Different-shaped avionics and deep-space parts from the ZIP require their own destination-model checks.
6. **Saves.** Our permanent wallet uses `mission-forge.campaign.v1` with historical ledgers. Expedition uses `mission-forge.expedition.v1`; its schema stores the seed, attempted legs, pass/fail and accepted leg. Its current draft survives screen changes and retries for the same leg in a tab. A browser reload restores progress and the accepted leg; an active draft is rebuilt. Keep the v1 mission ID order and shuffle stable or version a new route generator. Use an explicit migration for SQLite saves and award credits once per qualifying clear.

## Build order for the integration agent

1. Open the ZIP on its own, install both sides, run the Python tests, compile the frontend and prove a normal Earth run in the browser. Confirm the actual data sources and credit anything ported or reused.
2. Port empty-draft assembly and the Earth data-handoff disclosure into the existing lifecycle. Keep the base's other destinations and timeline. Add a blocker if final delivery evidence is absent rather than showing a success claim.
3. Integrate Research if the campaign will be shown. First map a small set of existing component IDs and prove buy, equip, reload and refund against real hardware choices. Then add catalog breadth where tests show a useful tradeoff.
4. Integrate Expedition as an opt-in mode. Start with proven Earth offers. Add Moon/Mars/asteroid/Jupiter offers only after each can be completed with the available destination catalog and the actual simulator. Keep queue constraints meaningful, or use a requirement the base already models.
5. Run the original base commands and new integration tests. Rehearse one judge-facing run from a fresh browser. Show the user need, launch booking, craft, communications, final delivery and use of the product. Ship the verified slice available before your cutoff.

## Acceptance checks

- Empty role-appropriate draft; no evaluate-on-undefined and no save migration that silently loads a preset.
- Two real launches with one changed choice and an explainable outcome, preserving the existing numerical test fixtures for each engine.
- Expedition replay with the same seed offers the same route. One evaluable failed attempt spends one supply; duplicate or stale completion grants nothing. All offers have a passing build. A completed, failed or reloaded run resumes in the correct state.
- Research debit/refund needs one intended activation, preserves payment history, and never auto-equips. A locked or owned card cannot charge again.
- End-to-end delivery and report links work on the final judge-facing build. Test how the destination behaves when its backend is unreachable.
