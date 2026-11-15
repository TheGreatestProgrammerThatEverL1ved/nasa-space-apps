# Hangar visual target — 04

## Locked direction (before implementation)

**A working spacecraft inside a quiet industrial assembly bay, not a report with an orbital thumbnail.**

Inspected production build `a763454` at 1440×960 and 390×844. Desktop matches [night03](screenshots/night03-hangar-after-en.png): duplicated subsystem controls, tall text cards, and repeated specs compete with the craft. Phone pushes equipment and inspector into a long report.

Composition study:
- [KSP vehicle assembly](https://playcraft.space/gallery/kerbal-space-program/vehicle-assembly-building-parts/): inspected the VAB image; narrow category/parts palette, large uninterrupted craft, floor and receding structural ribs give scale. Borrow the hierarchy, not its UI/art.
- [Hardspace: Shipbreaker](https://store.steampowered.com/app/1161580/): inspected publisher screenshot 1 (salvage bay): dark perimeter structure frames the bright hull; warm work lights separate from cool ambient space; repeated ribs lead into depth. Keep our background quieter than its cutting/furnace effects.

Original procedural environment and original equipment silhouettes only. Steel/graphite framing, restrained amber practical lights, cool fill, readable pale hull and blue cells. Craft gets the largest surface. One compact subsystem navigation, short preview-based direct-equip tray, one inspector with trade-off and relevant live numbers. Exact specs/totals expand on demand. No evaluator, progression, saves, or mission changes.

## Interface / ownership

- Free DeepSeek UI worker: `src/ui/game/GameScreens.tsx`, `src/ui/game/game.css`, optional new `src/ui/game/PartPreview.tsx` only.
- Free DeepSeek renderer worker: `src/ui/orbital/CraftCanvas.tsx`, `CraftFallback.tsx`, `CraftScene.tsx`, `scene.css` only.
- Root Sol: integration after handoff, tests, documentation, screenshots, Git. No simultaneous writers.
- Preserve `LiveHangar` and `CraftSceneProps` interfaces, selected-field and direct-equip state, `data-part-id` / renderer/config attributes, 28° reset angle. DOM navigation belongs to UI, mesh click callback to renderer. No renderer DOM tab row. Keep fallback dynamic, camera buttons, bilingual descriptions, cutaway, stationary inspection and context-loss handling.

## Locked screenshot setup

Production build + `MISSION_FORGE_PREVIEW=1` Playwright Chrome; DPR 1; reduced motion; fresh isolated browser storage with academy marked seen (never touch user saves). Default wildfire sandbox; menu → Customize; equip XL solar array; reset camera (28°); blur control and scroll to document top. Desktop 1440×960, phone 390×844 (full page). Capture after WebGL readiness and two animation frames. Same config/angle/viewports before and after; environment/framing are intentionally redesigned. `tests/e2e/hangar-visual.spec.ts` reproduces this setup.

Before: [desktop](screenshots/hangar04-before-desktop-en.png), [phone](screenshots/hangar04-before-phone-en.png).

Verify hangar first; only then carry restrained framing/material treatment to title. Final browser path: menu → hangar → wing swap → antenna swap → launch → debrief, plus Ukrainian, phone/reflow, keyboard, reduced motion, dynamic SVG and context loss. Inspect actual captures, fix consequential issues, reshoot.

## Preflight evidence

- Fetched `origin mission-forge`; local and remote `a7634546b1433fa6748d74aafd54b78d8339ccb4`, no divergence, empty index and no tracked edits. Preserved existing untracked drafts, `opencode.jsonc`, `public/`, `src/assets/`.
- Active-session API showed only root and this pass's two workers running; no old worker was writing. Root session explicitly `openai/gpt-6.1-sol`, variant `high`.
- Free `opencode/deepseek-v4.1-flash-free` named-file smoke succeeded before assignment; both implementation packets keep existing interfaces and disjoint ownership. No paid routing.
- Baseline production build passed (existing renderer chunk-size warning); locked baseline browser captures passed **2/2**, images inspected. Baseline engine suite **147/147** passed.
- Generic web-search integration returned HTTP 402; used available Exa and publisher/public reference images for study instead. No reference artwork added to the application or tracked assets.

## Verification and review

### Implementation handoff

Both free DeepSeek workers left partial edits, then reached the free usage limit. No retries or paid fallback. Root reconciled each stopped slice before taking ownership: completed the partial UI's payload typing and responsive CSS, shortened the inspector, preserved precise UHF rate, replaced imperative fog with declarative R3F fog, and tuned visible bay beams. The root kept the craft visible when choosing ground/orbit/launch rather than substituting a large unrelated diagram. All evaluator/catalog/fixture/progression/save sources remain unchanged.

Local Qwen performed the bounded duplicate/copy check: its file reads were denied, so its report was grep-based only. It confirmed one subsystem navigation and one inspector; full row duplication concerned the intentionally closed exact-figures disclosure, not a second default inspector. Root verified that nesting and the rendered English/Ukrainian views.

### Visual inspection and fixes

Inspected actual production-preview desktop, phone, Ukrainian, wing, antenna, fallback, launch, debrief and title images. The pale craft is the largest high-contrast object; the amber Launch action and illustrated direct-equip tray are clear. Receding portals, overhead practicals, a work stand and deck give depth without Earth competing in the hangar.

First reshoot fixes: removed inherited main-grid whitespace so the entire desktop tray fits, made thumbnails larger, reduced repeated telemetry to relevant live numbers, moved exact totals behind disclosures and brought ceiling beams into view. A later inspected UHF screenshot exposed long “unavailable” text spilling from the inspector; allowed wrapping and added a direct overflow assertion. Phone camera controls now sit below the canvas so enlarged text cannot cover the craft. Only after hangar acceptance, carried its restrained amber/steel framing to the title without replacing the existing orbital scene.

### Checks actually run

- Typecheck, build and zero-warning lint passed. Existing large-chunk warning remains: lazy renderer approximately **929 kB /247 kB gzip**, main approximately **511 kB /156 kB gzip**. No new packages.
- **147/147 engine**, **33/33 UI** tests passed, preserving WF-A/B/C, audited boundaries, all four mission repair paths, both languages, saves/credits/refunds, Engineering console, keyboard and accessibility.
- Production-preview focused packet passed **6/6**; original renderer packet passed **5/5**, including real context loss and unavailable-WebGL fallback. Full production-preview suite passed **42/42** in a four-worker run, then **42/42** serially after final copy/number refinements. No Playwright retry option used.
- Disclosed run history: one earlier four-worker run was **41/42**, with Engineering urban EN blanking on minified React `#156`; isolated urban EN/UA rerun passed **2/2**, and the next full run passed **42/42**. A later four-worker run was **41/42**, with the Engineering campaign UA page/context closing after its axe scan. Serial **42/42** passed. These intermittent browser/runtime failures were not reproduced serially; their cause is unestablished and no unrelated runtime/dependency change was made to hide them.
- Final exact-source clean copy `mission-forge-hangar04-clean-3w7ho6qc` passed fresh `npm ci` (**zero vulnerabilities**), typecheck, zero-warning lint, build, **147 engine /33 UI /42 production-preview Chrome** tests (one worker, no retries). SHA-256 comparison confirmed all **83 runtime/test/config files** matched the checkout. This last pass includes the inspector-wrap assertion and phone-controls fix. Final captures were taken from that clean production preview, copied back and inspected.
- All **62 tracked historical screenshot hashes** were preserved. Existing tests overwrite some old screenshot destinations; only those generated changes were restored from the pre-test backup, not via Git reset/checkout. The new captures use the separate `hangar04-*` prefix.

### Human visual review

- Same configuration/28° azimuth/viewport: [before desktop](screenshots/hangar04-before-desktop-en.png) → [after desktop](screenshots/hangar04-after-desktop-en.png); [before phone](screenshots/hangar04-before-phone-en.png) → [after phone](screenshots/hangar04-after-phone-en.png).
- Mesh evidence: [L wing](screenshots/hangar04-wing-before-en.png) → [XL wing](screenshots/hangar04-wing-en.png); [X-band dish](screenshots/hangar04-antenna-before-en.png) → [UHF whip](screenshots/hangar04-antenna-en.png). Also [Ukrainian wing](screenshots/hangar04-wing-ua.png), [Ukrainian antenna](screenshots/hangar04-antenna-ua.png).
- [Phone SVG](screenshots/hangar04-fallback-phone-ua.png), [320px/200% Ukrainian](screenshots/hangar04-fallback-reflow-ua.png), [title desktop](screenshots/hangar04-title-desktop-en.png), [title phone](screenshots/hangar04-title-phone-en.png), [launch](screenshots/hangar04-launch-en.png), [debrief](screenshots/hangar04-debrief-en.png).

**Short play path:** `npm run build`, then `npm run preview`; open `/nasa-space-apps/`. Finish/skip Academy if new. Customize → Solar array: Large → Extra-large → Radio package: X-band → UHF (watch dish become whip). For a passing wildfire launch, restore **Large array + X-band + Ground network**, then Launch → debrief (**3.1 h provisional pass**). Toggle Ukrainian; repeat at phone width or `?renderer=svg`. Main menu → Engineering console remains available.

Automated axe/Chrome checks are not native-speaker, assistive-technology or every-GPU acceptance. Stop for human review; no deployment, PR or merge.
