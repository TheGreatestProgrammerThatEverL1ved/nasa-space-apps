# Mission Campaign — branching contracts and upgrades

Choose a contract → assemble → launch the real evaluator → collect a first-clear award → buy/fit equipment → choose a branch. Sandbox retains immediate access to all four missions and their scenario catalogs. Campaign credits **never** replace engineering USD, budget, physical performance or science requirements. All progression numbers below are game policy **[P]**, not NASA requirements.

## Smallest balance table

| Contract | Previous clear | Equipment prerequisite | First-clear reward |
|---|---|---|---:|
| Return the Heat Map | None | Explicitly assemble complete owned hardware from 0/8 | 120 credits |
| Urban Heat Map | Wildfire | Starter S-band/frequent-service can pass | 140 |
| Trace the Shoreline | Wildfire | 35 mm visible analogue | 180 |
| Carry the Signal | Wildfire | Receive/store package **and X-band** | 200 |

Urban and shoreline are alternative next contracts after wildfire. Relay can precede shoreline or urban if its hardware is owned. All **four shipped clears** are required for the ending. Each model pass remains provisional. The gallery shows actionable prerequisites and first-clear/replay status; historical collected amounts remain in the settled award ledger. Engineering USD caps and [player balance](player-balance.md) are separate from credits.

| Upgrade | Credits | Tree prerequisite | Why buy |
|---|---:|---|---|
| `rf-x` X-band | 100 | Owned S-band foundation | Faster downlink; cheaper urban single-station route; required for relay |
| `arr-deploy-xl` 135 W array | 120 | Owned 55 W foundation | Audited WF-C/urban S-band power alternative; tight mass and higher USD |
| `pl-visible-35` visible camera | 100 | Owned thermal foundation | Unlocks shoreline mapping; real width/detail tradeoff |
| `pl-relay` receive/store package | 140 | Own X-band before buying | Unlocks two-hop packet relay; no camera capability |
| `arr-fold-75` accordion wings | 60 | Owned 55 W foundation | Compact 75 W generation / mass alternative |
| `bat-pack-80` twin pack | 40 | Owned 12U foundation | Lower mass/cost; less eclipse reserve than 120 Wh |
| `rf-x-eco` compact X-band | 80 | Owned S-band foundation | Lower DC/USD; slower serialization than 100 Mbps |
| `pl-thermal-survey` wide LWIR | 80 | Owned thermal foundation | Wider/finer thermal plan; higher data/load/USD |

The map has **twelve actual catalog-ID nodes: four foundations and eight purchases**:

```text
bus-12u (owned)
├─ arr-deploy-l (owned)
│  ├─ arr-deploy-xl
│  └─ arr-fold-75
├─ rf-s (owned)
│  ├─ rf-x
│  │  └─ pl-relay
│  └─ rf-x-eco
├─ pl-thermal (owned)
│  ├─ pl-visible-35
│  └─ pl-thermal-survey
└─ bat-pack-80
```

Foundations are not charges. Formerly free catalog choices remain free. An arrow is a purchase prerequisite, **not** a physical conversion between sensing technologies. Power/comms/payload/battery are independent choices installed through Customize.

## Fitting and recovery

Open **Research** in one selection from the menu, or directly from Campaign navigation. Sandbox has a read-only preview and an explicit Enter Campaign action. Buy never fits hardware: deliberately select it in Customize. Yellow outlines mean buyable, red unavailable, green owned; glyph/text cues supplement color. Hover/focus shows price, effect and lock reason in the shared inspector. Click or Enter/Space buys an available node once. Touch requires a first tap exposing the price, then a re-tap. Locked/owned nodes stay inspectable without debit. Refund belongs in the inspector. The map stacks on phones; native DOM controls stay outside canvas.

Every purchase refunds **exactly what that copy cost**, including historical prices. Refunding clears that ID from every Campaign draft and makes affected reports stale; it **never substitutes another part**. The player receives an explanation and chooses a replacement. Unequipped refunds leave Research open. Clears are never revoked. X-band may be refunded while relay remains owned; the contract discloses missing X-band and cannot pay until restored. This reversible state preserves historical entitlements and prevents purchase-order soft locks.

Two verified fresh routes (same final ownership and **300 credits**, without the optional array):

1. **Mapping first:** wildfire +120 → camera −100 → shoreline +180 → refund camera +100 → X-band −100 → relay package −140 → relay +200 → urban +140 → rebuy camera −100 = **300**.
2. **Comms first:** wildfire +120 → X-band −100 → urban +140 → relay package −140 → relay +200 → camera −100 → shoreline +180 = **300**.

The 120-credit array can instead consume the first award. Urban is still passable using the audited WF-C-style S-band/frequent-service kit; refund the array when credits are needed elsewhere. No grinding, interest, resale profit or paid retry is required.

The original four-purchase deterministic graph test retains exhaustive mixed-ledger coverage from fresh and all valid historical v1/v2 inventories (historical checkpoint: **411/411** solvable states). The expanded optional tree uses the stronger documented **refund-capital invariant** plus automated fresh/historical minimum-capital completion and real-inventory budget witnesses. Every purchase is fully refundable at its paid basis; no new item is mandatory. See [player balance](player-balance.md#research-and-ledger-invariant).

## Award integrity

Only the fresh player Run callback can award. It requires valid evaluator origin, provisional pass, matching mission/prerequisites/inventory, and an exact configuration/revision key against the **current campaign catalog**. It independently re-evaluates the configuration. Failures, unverified/invalid/spoofed results, stale-inventory reports, guide/direct reports, repeats and reloads pay zero. Academy never invokes the callback. Launch settlement is synchronous at preflight, never a timer/skip/animation callback; the frozen report and settled ledger survive presentation reentry and language changes.

## Historical migration and storage

Storage remains **only** `mission-forge.campaign.v1`; unrelated keys are untouched. Valid v1/v2 saves normalize in memory to **version 3**, preserving exact completed IDs, entitlements and spendable balances. Historical saves are validated with their **old linear prerequisites**, not today's branches: v1 covers wildfire/urban and X-band/array; v2 includes all four missions and four purchases.

V3 retains `completedMissionIds` and `unlockedPartIds`, plus `awards` and `paidParts`: per-ID settled credit amounts. Every legacy clear and legacy purchased item migrates at **100**, regardless of today's table. Old clears never receive reward top-ups. Historical array/relay refunds return 100; rebuy costs today's 120/140 and records that new refund basis. New awards use today's per-contract amounts. Because every current legacy-purchasable price is at least 100 and refunds equal recorded payment, refund/rebuy cannot profit. A fully completed old campaign stays complete, including after refund.

The next mutation writes v3 to the same key. Amounts are derived from validated ledgers, never a separately trusted balance. Duplicate IDs normalize without minting rewards; malformed/future/unknown-ID/impossible-prerequisite/negative-balance saves and unmatched or invalid per-ID amounts are ignored. V3 accepts only the known historical or current amount for each ID. This is local save validation, **not** tamper-proof accounting, an account or cloud sync. Read/write failures are disclosed; in-memory play continues without promising persistence. Session mode/mission drafts are not saved across reload.

## Verification boundary

See the [QA dossier](qa-goal-dossier.md) for current checkpoints and clean-copy proof; [the handoff](overnight-handoff.md) preserves older milestones. Coverage includes all valid legacy inventories, exact historical refunds/current-price rebuys, two genuine Campaign orders, empty drafts, separate purchase/equip, credits versus USD, stale/forged/direct/guide rejection and EN/UA real-Chrome flows. The audited engine/catalog/fixtures remain unchanged; the new player layer is explicitly revisioned. Human bilingual scientific/linguistic and assistive-technology review remains pending.
