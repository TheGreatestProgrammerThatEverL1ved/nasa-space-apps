# Return the Heat Map — player guide

This guide covers the audited wildfire mission. The current game also offers [urban heat training](scenario-expansion.md) and an [optional local campaign](mission-campaign.md), with the direct mission picker always available.

**Player catalog r1:** fresh Sandbox, Campaign and Academy builds begin empty.
Select all eight slots, including orbit and launch booking; Research buys
equipment but never installs it. Clear Build and Remove only clear your
selections. The [revisioned player layer](player-balance.md) adds provisional
fictional packages and mission-specific USD caps shown in the hangar. The
$3M values and original 12U compatibility below describe the preserved
audited reference context, also used by Academy, not the expanded player caps.

## Your objective

Design a scheduled **wildfire thermal-anomaly training mission** for a land-management science team. Return useful thermal imagery for follow-up while balancing a complete spacecraft, ground service, orbit, and launch booking.

This is not operational fire detection or a promise to image every point of a whole region daily. Flood and methane missions are not playable in this version.

## Choose, run, learn, retry

Choose a **payload, bus, solar array, battery, radio, ground service, orbit, and launch booking**. Review the six resources, run the mission, read the verdict and repair hints, then change a choice and retry. Outcomes follow your design, not a random roll. Failed designs remain inspectable.

| Resource | What to watch |
|---|---|
| **Mass** | Parts must fit the bus and its booked mass allowance, including contingency. The retained camera fits only the 12U bus: **24 kg** spacecraft limit. The launch slot allows **50 kg**, including the **2 kg** adapter. A larger rocket slot does not make a camera fit a smaller bus. |
| **Power** | Arrays must cover energy needs at the start and end of the mission. Usable battery energy must cover eclipse and brief peak demand; battery discharge power must also support the peak load. |
| **Budget** | Stay within **$3 million**, including the **15% reserve** and ground operations. |
| **Data** | Sustain the complete **3.1850496 GB/day** image stream and keep the between-contact queue within usable storage. Returning enough useful images alone does not excuse a growing backlog. |
| **Communications** | Match the radio, antenna pointing, receiver, and contact opportunities. Both transmission capacity and contact cadence matter. |
| **Time** | Fit procurement, integration, and launch waiting within **36 months**, and fund/support at least **one year** of operations. |

## Mission targets

Every minimum is inclusive; meeting one does not excuse missing another.

| Target | Required | Stretch goal |
|---|---|---|
| Thermal capability | LWIR covering **8–12 µm** | — |
| Effective image scale | **200 m or smaller** | 150 m |
| Usable footprint width | **90 km or wider** | 100 km |
| Gap between scheduled target opportunities | **24 h or less** | 12 h |
| Useful products after cloud rejection | **At least 1 GB/day**, campaign-equivalent | 2 GB/day |
| Observation-to-product delivery bound | **6 h or less** | 2 h |
| Planned operations | **At least 1 year** | 3 years |

Visible-only or VNIR-only cameras cannot replace the required thermal band. The fixture rejects **40%** of scenes for cloud, after they have consumed imaging energy and downlink. A scheduled opportunity is not a promise of a cloud-free image.

**A concrete tradeoff:** in this fixture, four six-minute ground contacts a day leave a delivery bound of **7.1 hours**, even with a fast radio. More frequent contacts can reduce that delay and help a slower radio sustain the workload. Compare setup and annual costs separately: a high-contact service can cost less to set up but more per year than a network. More Mbps cannot create a contact that is missing.

## What a provisional pass means

A pass means every hard rule works **within this training model**, not that a spacecraft is flight-proven. Target opportunities come from a supplied synthetic campaign fixture; ground contacts are evenly spaced over each 24-hour cycle. They are separate inputs, not propagated geographic predictions.

Current passing designs assume tracking/image-motion compensation during exposure. Turning tracking off makes those designs exceed the image-scale limit. If tracking performance is unknown, a pass cannot be established; unknown evidence is not the same as a demonstrated failure. Integration, prices, pointing stability, lifetime, and other system assumptions remain provisional.

Tight-margin warnings do not automatically mean failure. Read the limiting resource and repair hint, revise the design, and rerun all checks: a bigger battery or array can help power but break mass or budget.

This is the **English source guide**. The implemented UI must offer equivalent English and Ukrainian text, full keyboard operation, text-labelled warnings, reduced motion, and a way to skip animations.

For equations, evidence, and developer examples, see the [technical rules](game-rules-technical.md).
