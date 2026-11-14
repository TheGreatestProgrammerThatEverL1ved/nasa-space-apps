# Optional Mission Campaign

The direct mission picker remains available with the complete audited catalog. Campaign mode adds a small local **earn → unlock → redesign** loop; it does not change science/engineering requirements, prices, physical performance or the provisional-pass boundary.

## Progression and economy [P]

1. Start with a complete audited kit, including `bus-12u`, CIRC-like thermal camera, 55 W array, batteries, S-band radio and frequent ground service. The supplied **WF-A** design can provisionally pass wildfire without a purchase.
2. A mission's **first** fresh, valid `MODEL_PASS_PROVISIONAL` earns **100 campaign credits**. Later passes of that mission award nothing. Failed and unverified attempts are free.
3. After wildfire, urban heat becomes available in campaign mode. Spend credits on either:
   - **X-band package: 100 credits.** Enables the urban X-band/single-station approach, trading more radio power/hardware cost for less ground service.
   - **135 W BOL array: 100 credits.** More generation, but higher mass/cost. The WF-C S-band/frequent-service approach also meets urban goals.
4. Pass urban heat to finish the first campaign. There are only two reward-bearing missions; no grinding or further content is implied.

All credit/reward/unlock prices are synthetic game choices. **Credits are not USD.** Unlocking availability never adds to the engineering budget or waives a requirement. Every Run uses the existing deterministic evaluator and the mission's available catalog; locked hardware cannot produce a valid campaign pass. The $3M engineering budget and original reserved part/operations costs still apply.

The main loop is solvent: wildfire →100, unlock X-band →0, urban pass →100 remaining. Choosing the array instead is also completable with S-band/frequent service. A part can be purchased only once; unaffordable purchases are disabled and rejected by the pure progression function.

## Local persistence and interaction

- Progress is stored only under `mission-forge.campaign.v1` in browser localStorage. No account, credential or unrelated storage changes.
- Saved data contains a version, unique completed mission IDs and unique unlocked part IDs. Credits are derived, not independently stored. Invalid/impossible/future saves are ignored, and duplicates cannot mint credits.
- Reload starts ordinary direct wildfire play in English, preserving the campaign save separately. Re-enter campaign to continue. Designs and language are not saved.
- Switching modes/missions or buying hardware starts a fresh design/report, preserving current language and restoring picker focus. Retained or stale reports never award progress.
- Storage read/write failure is disclosed. In-memory play remains possible, but persistence is not promised. This is local convenience state, not tamper-proof accounting or cross-tab synchronization.

## Verification / human gate

See the [execution log](execution-log.md) for actual pure, UI and real-Chrome checks and clean-copy results. Campaign ships only after both language loops, repeat-award prevention, reload persistence, available-credit completion and existing browser regressions pass. Bilingual human quality and assistive-technology acceptance remain pending.
