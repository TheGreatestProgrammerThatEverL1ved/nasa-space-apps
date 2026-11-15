# Player balance r1

The player layer (`src/data/player/`) extends, never mutates, the audited
catalog and contexts. All twelve additions are **fictional provisional
engineering packages**. Every numeric and capability field is labelled
provisional; no vendor measurement, flight qualification, calibrated retrieval
or new physical equation is claimed. Prices are engineering USD, not credits.

New 12U interfaces assume the same payload envelope, launch interface and
accepted tracking adaptation as the reference 12U. Their skeletal / storage
packaging, storage, housekeeping, control error and jitter allocations differ.
These integrations are synthetic and unverified in the real world.

Player scenario/catalog/fixture revisions include `player-balance-r1`.
Engineering caps are wildfire $2,850,000; urban $2,750,000; visible
$2,400,000; relay $2,500,000. Schedule, science, reserve, battery, queue,
link, tracking and duration equations are unchanged. Original contexts,
WF-A/B/C and all audited boundaries remain reference fixtures.

New imaging stations use analytical evenly spaced contacts, not propagated
access. Relay instead uses explicit synthetic egress contracts: regional
04:00–04:08 / 16:00–16:08, priority 02:30–02:36 / 14:30–14:36.
The existing ingress batches and conservative serialization are unchanged.
No contacts/day value is used as a substitute for relay timing evidence.

## Catalog manifest

| Category | New IDs | Material choice |
| --- | --- | --- |
| Bus | `bus-12u-light`, `bus-12u-vault` | Lower mass/load/storage vs heavy high-storage, steadier platform |
| Solar | `arr-fold-40`, `arr-fold-75` | Four-section fan vs five-section accordion; generation/mass/cost |
| Battery | `bat-pack-80`, `bat-pack-180` | Wide twin vs tall stacked pack; energy/discharge/mass |
| Radio | `rf-s-burst`, `rf-x-eco` | Short broad S horn vs small compact X aperture; rate/DC/cost |
| Ground | `gs-regional`, `gs-priority` | Long cheap windows vs frequent windows and fast processing |
| Payload | `pl-thermal-survey`, `pl-visible-strip` | Wide thermal 800-pixel plan vs 2560-pixel visible corridor plan |

All onboard additions have shared procedural geometry used in tray, WebGL
and SVG; shape, proportions, segmentation or placement differ. Ground is a
service preview, never mounted hardware. Full values and field provenance
are available in Engineering; concise bilingual tradeoffs are in the hangar.

## Verified design witnesses

Every row below is a complete eight-selection configuration in
`src/data/player/witnesses.ts`; orbit `orb-sso-low` and launch `lv-heavy`
are explicitly selected, never supplied to a player draft. Tests check every
gate, not just the cost. All passes are **provisional**.

All recipes explicitly select `orb-sso-low` and `lv-heavy`. Hardware IDs:

| Name | Bus | Payload | Solar | Battery | Radio | Ground |
| --- | --- | --- | --- | --- | --- | --- |
| WF-A-player | `bus-12u-light` | `pl-thermal-survey` | `arr-fold-75` | `bat-pack-80` | `rf-s-burst` | `gs-regional` |
| WF-B-player | `bus-12u-light` | `pl-thermal` | `arr-deploy-l` | `bat-pack-180` | `rf-x-eco` | `gs-priority` |
| UH-A-player | `bus-12u-light` | `pl-thermal-survey` | `arr-fold-75` | `bat-pack-80` | `rf-s-burst` | `gs-regional` |
| UH-B-player | `bus-12u-light` | `pl-thermal` | `arr-deploy-l` | `bat-s` | `rf-x` | `gs-single` |
| VM-A-player | `bus-12u-light` | `pl-visible-strip` | `arr-fold-40` | `bat-s` | `rf-s` | `gs-regional` |
| VM-B-player | `bus-12u-vault` | `pl-visible-35` | `arr-deploy-l` | `bat-pack-80` | `rf-s-burst` | `gs-single` |
| RL-A-player | `bus-12u-light` | `pl-relay` | `arr-fold-40` | `bat-pack-80` | `rf-x-eco` | `gs-regional` |
| RL-B-player | `bus-12u-light` | `pl-relay` | `arr-deploy-l` | `bat-pack-180` | `rf-x-eco` | `gs-priority` |

| Mission / cap | Pass A: USD / delay h | Pass B: USD / delay h | Pareto tradeoff |
| --- | --- | --- | --- |
| Wildfire / 2,850,000 | 2,717,450 / 3.933333 | 2,823,250 / 2.000000 | A costs less and surveys finer/wider; B returns sooner |
| Urban / 2,750,000 | 2,717,450 / 3.933333 | 2,495,500 / 7.100000 | A finer thermal scale / quicker delivery; B costs less |
| Visible / 2,400,000 | 2,110,250 / 3.933333 | 2,343,700 / 7.100000 | A cheaper, wider/finer; B has four times the system storage and steadier pointing |
| Relay / 2,500,000 | 2,188,450 / 2.665079 | 2,478,250 / 0.762963 | A costs less; B has faster processing / delivery and more eclipse reserve |

All **12/12** additions occur in these passing loadouts (minimum required 8).
Each pair differs in at least two categories; evaluator tests assert the
opposing metric improvements. The separate failure recipes are:

| Mission | Budget-only USD / one-selection repair | Under-budget technical failure USD / remedy |
| --- | --- | --- |
| Wildfire | 3,039,450; A's vault → skeletal bus restores 2,717,450 | 2,573,700; single → regional ground restores data/queue/delivery |
| Urban | 3,039,450; same bus repair restores 2,717,450 | 2,605,900; UHF → S-burst restores stream/delivery |
| Visible | 2,688,700; B's priority → single ground restores 2,343,700 | 2,047,000; 8 mm → strip camera repairs scale |
| Relay | 2,510,450; A's vault → skeletal bus restores 2,188,450 | 2,044,700; single → regional restores contracted egress |

Budget failures are valid complete builds with **only `ENG-BUDGET` not MET**.
Every repair is one explicit selection. Campaign tests earn genuine contract
rewards, refund only settled paid bases, acquire the needed later upgrades
and reproduce each budget failure in the inventory-filtered context.

All passing checks are MET. The separate under-budget recipes fail:
wildfire `ENG-DATA-RATE`, `ENG-STORAGE`, `WF-DELIVERY`, `WF-LATENCY`;
urban the same engineering checks plus `UH-DELIVERY`, `UH-LATENCY`;
visible only `VM-GSD`; relay `ENG-DATA-RATE`, `ENG-STORAGE`, `RL-ROUTE`,
`RL-DELIVERY`, `RL-DELAY`. They each restore to the named passing recipe
by one explicit selection, without buying retries or changing a limit.

Representative independent arithmetic (not evaluator code):
wildfire A's selected USD are
`(820000+540000+235000+33000+115000+155000+65000+400000)*1.15`
= **2,717,450**; replacing only its bus adds `(1100000-820000)*1.15`
= **322,000**. Relay A's 50 Mbps × 8 min × 0.0075 × .7
= **2.1 GB/window**, enough to serialize each 0.5 GB batch. Its
110-minute post-ingress wait + 1.904762-minute serialization + 48-minute
processing = **2.665079 h**. These remain synthetic analytical contracts.

## Research and ledger invariant

The four old purchases retain their IDs/prices. Four optional purchases in
power, battery, radio and instruments unlock real items, never equip them.
No new purchase is a mandatory contract prerequisite. Purchases debit once;
refunds return the actual paid basis, including historical prices, without
replacing any removed selection. Existing v1/v2/v3 entitlements and assigned
awards are preserved. v2 recognizes only its four historical purchase IDs.

For solvency, any reachable inventory can be fully refunded without penalty;
the resulting capital is exactly its already-settled awards. Wildfire has a
free-inventory witness, as does urban. After those clears even a historical
profile has at least 200 capital, enough for visible's 100-credit camera;
after visible, at least 300, enough for relay's 240-credit radio + payload.
Optional purchases cannot destroy this route. No refund/rebuy can increase
capital (wallet + settled paid bases). Automated player witnesses verify this
invariant and fresh/historical minimum-capital completion routes.

## Player balance r2

Eight player-only fictional choices expand the previous 35-ID catalog to 43.
Economy 24 kg, base 50 kg and express 30 kg bookings all deliver to the same
model orbit. The economy booking reduces USD but adds four queue months relative
to the 50 kg booking and has a 2.5 kg adapter. Express reduces the queue from
nine to four months, with higher USD and a smaller allocated slot. The two new
ground services cover imaging only until explicit relay windows exist. A rigid
62 W array, two batteries with opposing energy/peak-power choices, and a low-power
8 Mbps S-band radio add tradeoffs without changing the reference catalog.

Expedition derives a revisioned scenario context from the player balance. Economy
cuts the cap by 50,000 USD and leaves the preparation limit unchanged. Priority
keeps the base cap and limits preparation to 27 months. An economy clear earns
one point and restores one retry supply up to three. A priority clear earns two
points. These are game rules.
