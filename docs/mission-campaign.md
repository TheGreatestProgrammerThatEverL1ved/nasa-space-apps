# Mission Campaign — four-contract game loop

Choose a contract → assemble → launch the real evaluator → collect a first-clear award → buy/fit equipment → pursue the next contract. Direct play retains immediate access to all four missions and their scenario catalogs. Campaign credits **never** replace engineering USD, budget, physical performance or science requirements.

## Explicit progression [P]

| Contract | Previous clear | Equipment prerequisite | First-clear reward |
|---|---|---|---:|
| Return the Heat Map | None | Complete owned WF-A starter kit | 100 credits |
| Urban Heat Map | Wildfire | Starter S-band/frequent-service is sufficient | 100 |
| Trace the Shoreline | Urban | 35 mm visible analogue | 100 |
| Carry the Signal | Visible mapping | Receive/store package **and X-band** | 100 |

The contract board discloses every prerequisite, missing part and reward. Completion means all **four shipped contracts**, never backlog missions. Each real model pass remains provisional.

## Hangar and choices [P]

All four shop items cost **100 credits**, separate from their unchanged engineering USD:

- **X-band:** faster return, higher radio power and engineering price; enables the cheaper urban single-station design and is required for the relay network fixture.
- **135 W array:** materially more generation, but higher cost and tight spacecraft mass; supports the audited WF-C and urban S-band/frequent-service approach. Optional, not a hidden prerequisite.
- **35 mm visible analogue:** unlocks the visible mapping contract and its width-versus-detail choice; cannot perform thermal or relay sensing.
- **Receive/store package:** unlocks the relay mechanism when X-band is also owned; cannot replace a camera.

Buying fits a compatible part in the current design and returns focus to its control, preserving other draft edits. If the part belongs to another mission's catalog, focus goes to the mission picker; choose its newly unlocked contract and use **Fit on compatible design**. Owned parts remain visibly distinguishable from locked/unaffordable items. Session mission/mode drafts survive navigation; reload still starts unsaved direct wildfire play in English.

### No purchase-order soft locks

Every shop purchase is **fully refundable**, visibly offered beside Fit. Refunding removes availability and makes prior reports stale; an equipped refunded part is replaced with an available control choice, requiring a rerun. Previously earned clears remain recorded. There is no interest, resale profit, grinding or paid retry.

Two solvent routes:

1. Wildfire +100 → X-band −100 → urban +100 → visible camera −100 → visible +100 → relay package −100 → relay +100. Finish with 100.
2. Wildfire +100 → optional array −100 → urban passes with WF-C-style S-band/frequent service +100 → refund array +100 → buy X-band −100 and visible camera −100 → visible +100 → relay package −100 → relay +100. Finish with 100.

The pure test explores **every reachable buy/refund/eligible-clear state** and proves a route to campaign completion from each, not just those two examples.

## Award integrity

Only the fresh player Run callback can award. It requires valid evaluator origin, provisional pass, matching mission/prerequisites/inventory, and an exact configuration/revision key against the **current campaign catalog**. It independently re-evaluates the configuration. Failures, unverified/invalid/spoofed results, stale-inventory reports, guide/direct reports, repeats and reloads pay zero. The dedicated academy never invokes the campaign callback. Credit deltas and the next concrete objective appear in the debrief and contract board.

## Save migration and failure semantics

Storage remains **only** `mission-forge.campaign.v1`; unrelated keys are untouched. Valid old version-1 saves normalize in memory to version 2, preserving completed wildfire/urban missions, purchased X-band/array and the **exact derived balance** (100 per old first clear minus original purchase prices). The next progress mutation writes normalized version 2 to the same key. No account, cloud sync, credentials or tamper-proof accounting is implied.

Version 2 adds the shipped contract/part IDs. Credits are still derived, not independently trusted. Duplicate IDs normalize without minting rewards; malformed, future, unknown-ID, impossible-prerequisite or negative-balance saves are ignored, retaining the old invalid-save semantics. A fully spent old save can refund an optional purchase to fund the next payload. Storage read/write failures are disclosed; in-memory play continues without promising persistence.

## Verification boundary

See [the handoff](overnight-handoff.md) for actual counts, independent connected Sol review and clean-copy proof. Tests cover all old valid inventory combinations, v1→v2→reload, unrelated storage, credits versus USD, stale/forged/direct reports, repeat prevention, refunds, all-state solvency, compatible fitting/focus/staleness, and full English/Ukrainian real-Chrome campaigns. Human bilingual scientific/linguistic and assistive-technology review remains pending.
