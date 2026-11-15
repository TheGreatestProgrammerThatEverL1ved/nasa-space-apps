# Mission Campaign — branching contracts and upgrades

Choose a contract → assemble → launch the real evaluator → collect a first-clear award → buy/fit equipment → choose a branch. Sandbox retains immediate access to all four missions and their scenario catalogs. Campaign credits **never** replace engineering USD, budget, physical performance or science requirements. All progression numbers below are game policy **[P]**, not NASA requirements.

## Smallest balance table

| Contract | Previous clear | Equipment prerequisite | First-clear reward |
|---|---|---|---:|
| Return the Heat Map | None | Complete owned WF-A starter kit | 120 credits |
| Urban Heat Map | Wildfire | Starter S-band/frequent-service can pass | 140 |
| Trace the Shoreline | Wildfire | 35 mm visible analogue | 180 |
| Carry the Signal | Wildfire | Receive/store package **and X-band** | 200 |

Urban and shoreline are alternative next contracts after wildfire. Relay can precede shoreline or urban if its hardware is owned. All **four shipped clears** are required for the ending; optional order does not mean optional completion. Each real model pass remains provisional. The gallery shows prerequisites, missing equipment, current rewards and, for old clears, the actual historical amount already collected (replay pays zero).

| Upgrade | Credits | Tree prerequisite | Why buy |
|---|---:|---|---|
| `rf-x` X-band | 100 | Owned S-band foundation | Faster downlink; cheaper urban single-station route; required for relay |
| `arr-deploy-xl` 135 W array | 120 | Owned 55 W foundation | Audited WF-C/urban S-band power alternative; tight mass and higher USD |
| `pl-visible-35` visible camera | 100 | Owned thermal foundation | Unlocks shoreline mapping; real width/detail tradeoff |
| `pl-relay` receive/store package | 140 | Own X-band before buying | Unlocks two-hop packet relay; no camera capability |

The diagram has **eight actual catalog-ID nodes**, not eight paid unlocks:

```text
                         bus-12u (owned)
                  ┌──────────┼──────────────┐
          arr-deploy-l     rf-s         pl-thermal     (owned)
                ↓            ↓               ↓
          arr-deploy-xl     rf-x        pl-visible-35
                             ↓
                          pl-relay
```

The four foundations can be fitted from the tree; they are not new charges. All other formerly free catalog choices stay free, including batteries and alternate teaching parts. An arrow is a purchase prerequisite, **not** a claim that a camera is physically upgraded into another sensing technology. Power/comms/payload are separate choices fitted through the same live hangar.

## Fitting and recovery

Buy fits compatible equipment immediately, preserving other edits and returning keyboard focus to that subsystem. Equipment outside the current mission's catalog opens the illustrated mission selector; choose a compatible contract and fit it. The tree shows fitted/owned/locked/unaffordable state, exact credit cost, prerequisite, tradeoff and actual refundable amount. It stacks branches on phones; all operations remain native DOM buttons outside canvas.

Every purchase refunds **exactly what that copy cost**, including historical prices. Refunding removes availability and makes affected reports stale; an equipped refunded part is replaced with an available control choice and focused for repair. Other in-session mission drafts are sanitized against current inventory on return. Refunding an unequipped part leaves the orbital tree open. Clears are never revoked. X-band may be refunded while relay remains owned; the contract discloses missing X-band and cannot pay until it is restored. This deliberate reversible state preserves historical entitlements and prevents purchase-order soft locks.

Two verified fresh routes (same final ownership and **300 credits**, without the optional array):

1. **Mapping first:** wildfire +120 → camera −100 → shoreline +180 → refund camera +100 → X-band −100 → relay package −140 → relay +200 → urban +140 → rebuy camera −100 = **300**.
2. **Comms first:** wildfire +120 → X-band −100 → urban +140 → relay package −140 → relay +200 → camera −100 → shoreline +180 = **300**.

The 120-credit array can instead consume the first award. Urban is still passable using the audited WF-C-style S-band/frequent-service kit; refund the array when credits are needed elsewhere. No grinding, interest, resale profit or paid retry is required.

The deterministic graph test explores every reachable buy/refund/eligible-real-clear state from a fresh profile **and all valid historical v1/v2 inventories**, including mixed old/new award and purchase bases. It keys states by settled ledger values, not just inventory IDs, and independently re-evaluates real passing configurations against each available inventory. **411/411 states have a route to completion** in the current table.

## Award integrity

Only the fresh player Run callback can award. It requires valid evaluator origin, provisional pass, matching mission/prerequisites/inventory, and an exact configuration/revision key against the **current campaign catalog**. It independently re-evaluates the configuration. Failures, unverified/invalid/spoofed results, stale-inventory reports, guide/direct reports, repeats and reloads pay zero. Academy never invokes the callback. Launch settlement is synchronous at preflight, never a timer/skip/animation callback; the frozen report and settled ledger survive presentation reentry and language changes.

## Historical migration and storage

Storage remains **only** `mission-forge.campaign.v1`; unrelated keys are untouched. Valid v1/v2 saves normalize in memory to **version 3**, preserving exact completed IDs, entitlements and spendable balances. Historical saves are validated with their **old linear prerequisites**, not today's branches: v1 covers wildfire/urban and X-band/array; v2 includes all four missions and four purchases.

V3 retains `completedMissionIds` and `unlockedPartIds`, plus `awards` and `paidParts`: per-ID settled credit amounts. Every legacy clear and legacy purchased item migrates at **100**, regardless of today's table. Old clears never receive reward top-ups. Historical array/relay refunds return 100; rebuy costs today's 120/140 and records that new refund basis. New awards use today's per-contract amounts. Because every current legacy-purchasable price is at least 100 and refunds equal recorded payment, refund/rebuy cannot profit. A fully completed old campaign stays complete, including after refund.

The next mutation writes v3 to the same key. Amounts are derived from validated ledgers, never a separately trusted balance. Duplicate IDs normalize without minting rewards; malformed/future/unknown-ID/impossible-prerequisite/negative-balance saves and unmatched or invalid per-ID amounts are ignored. V3 accepts only the known historical or current amount for each ID. This is local save validation, **not** tamper-proof accounting, an account or cloud sync. Read/write failures are disclosed; in-memory play continues without promising persistence. Session mode/mission drafts are not saved across reload.

## Verification boundary

See [the handoff](overnight-handoff.md) for exact pushed checkpoints and clean-copy proof. Coverage includes all valid legacy inventories, partial/full/reload/no-extra-award migration, historical refunds/current-price rebuys, two contract orders, exhaustive mixed-ledger solvency, credits versus USD, stale/forged/direct/guide rejection, compatible fitting/focus/staleness and full English/Ukrainian real-Chrome campaigns. Actual tree screenshots include desktop, phone and 320px/200% keyboard refunds/rebuys. Engine/catalog/fixtures remain unchanged. Human bilingual scientific/linguistic and assistive-technology review remains pending.
