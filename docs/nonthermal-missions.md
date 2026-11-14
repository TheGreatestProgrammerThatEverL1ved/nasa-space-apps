# Non-thermal teaching missions — night-02

These additive policies do not modify the audited wildfire or urban mechanics. Every pass is **MODEL_PASS_PROVISIONAL**. All integrated allocations, schedules, game requirements and link/target/tracking assumptions remain provisional.

## Trace the Shoreline — visible mapping

Who needs what: a coastal cartography team needs **visible boundaries** on daylit, accepted clear scenes across a synthetic 80 km corridor. This is not water-quality retrieval, calibrated reflectance, thermal sensing, cloud penetration or operational coverage.

Primary references fetched 15 November 2026:

- [GomSpace NanoCam C1U](https://gomspace.com/product/nanocam-c1u/), explicitly **phased out / unavailable for sale**: 2048×1536, 10-bit Bayer color CMOS, 400–750 nm transmission; 8/35/70 mm sampling **<260/<60/<30 m at 650 km**, reference masses from 169/169/277 g.
- Its linked [datasheet revision 1.8, 12 July 2018](https://gomspace.com/wp-content/uploads/2025/12/gs-ds-nanocam-c1u_DS_-_1010105_-_1_-_18_-_1.pdf), §§2.1, 2.4.3, 6.1, 7, inspected locally (not republished): 10-bit ADC, 380 mW idle, 800 mW acquisition/processing, 1300 mW boot. Acquisition <5 s, processing <10 s, boot <15 s. The public page/source are reference evidence, not an available procurement offer.
- [NASA Landsat band guide](https://science.nasa.gov/mission/landsat/spectral-bands-and-applications/): visible versus emitted thermal sensor selection. No Landsat calibration, narrow-band discrimination or retrieval accuracy is transferred.

### Explicit analogue and model [P]

Use **0.30/0.30/0.40 kg integrated allocation**, $120k/$120k/$160k, 10-month lead, 2 W active/3 W peak, power-switched zero incremental idle under the shared batch-mode assumption. These exceed the source's reference power/mass but are **not verified integration budgets**. Batch operation includes boot/processing overhead within the allocation; 0.02 frames/s while active allows 50 s/frame versus the cited acquisition/processing operations. Actual timing, shutter/readout behavior, sensitivity and interface need qualification. No source exposure claim: **1 ms exposure** is a provisional daylit assumption, with the unchanged accepted residual motion ≤1000 m/s and 5 arcsec exposure jitter on the 12U bus.

The sensor's **one Bayer mosaic** is stored as **16-bit padded words** of 10-bit samples; never multiply by three RGB planes. Fixed 8% acquisition duty: `2048×1536×2×86400×0.08×0.02/1e9 = 0.86973087744 GB/day`; 60% accepted → `0.521838526464 GB/day`. The 40% rejected images still consume collection and downlink. Bus memory is shared streaming storage, not an additional free 2 GB camera buffer. S-band/network sustains 1.89 GB/day and 3.1 h. Single station S-band cannot sustain the stream (0.63 GB/day).

Conservative upper sampling anchors use 260/60/30 m at 650 km. Derive cross/along FOV with `2 atan(detector_pixels × anchor / (2×650000))`. This is a flat, near-nadir **teaching footprint approximation**, not a vendor FOV or validated edge resolution. Shared altitude/pointing/jitter/motion equations apply; static offset shrinks the usable strip. Pointing limit 0.2°/fit and synthetic daylit 24 h target opportunities are explicit assumptions, not vendor capabilities.

Synthetic gates: required visible Bayer mode covering 0.45–0.69 µm; effective scale ≤60 m; usable width ≥80 km; access ≤24 h; useful return ≥0.4 GB/day; latency ≤12 h; one funded/supported year. Shared $3M/36-month engineering policy remains.

- Starter: 12U, **8 mm** analogue, 55 W, medium battery, S-band/network, 500 km/50 kg slot. Wide view but ~200 m sampling misses detail.
- Repair: **35 mm** analogue, same hardware. ~46.154 m native sampling and ~93.65 km usable width meet both limits; all shared gates must pass.
- Countertrade: **70 mm** has finer sampling but ~46.39 km usable width, missing the corridor. Thermal payload fails the visible mode/spectrum gate; visible payload fails wildfire's LWIR gate.

No source asset is reused. All spacecraft artwork is original schematic SVG.

## Carry the Signal — Earth-orbit packet relay

Who needs what: a remote sensor team needs **two 0.5 GB batches/day** delivered through a receive/store spacecraft to a ground user. No camera, optical geometry, thermal capability or cloud rejection is applicable. This is an Earth training fixture, **not lunar far-side coverage**, a physical network booking or an implementation of the complete DTN protocol.

Primary conceptual reference, fetched 15 November 2026: [NASA SCaN, Delay/Disruption Tolerant Networking](https://www.nasa.gov/communicating-with-missions/delay-disruption-tolerant-networking/) explains storing data at a node until the next node becomes available. No NASA throughput, reliability, operational route, protocol conformance or hardware capability is transferred.

All hardware/route allocations below are **[P] synthetic**:

- Receive/store package: 0.6 kg, $150k, 10-month lead, 20 Mbps ingress, 70% ingress efficiency, 2 GB buffer; 4 W active/6 W peak; conservative 12% worst-orbit active envelope. Compatible assumed interface to 6U/12U buses. The 12U/X-band reference satisfies independent mass, cost, power and radio pointing checks.
- Daily ingress contacts: **02:00–02:10** and **14:00–14:10**, each carrying 0.5 GB. Each accepted receive contact has `20×10×0.0075×.7 = 1.05 GB` capacity. Source and receive interfaces/link closure are explicit assumptions. Unknown closure cannot pass; known closure/capacity failure is retained.
- The single-station contract has **explicitly zero egress windows**, despite viable ingress. Network egress: **03:00–03:06** and **15:00–15:06**. Frequent-service alternative adds **09:00–09:06** and **21:00–21:06**. These replace the imaging mission's evenly spaced ground schedule; costs remain the selected audited ground package's allocation.
- Selected X-band supplies `.525 GB/min`; unique unioned network egress capacity is `6.3 GB/day`. S-band supplies only `.315 GB/day` with this network schedule, so it cannot sustain the required batches. No parallel/overlapping station multiplies capacity.
- Exact FIFO event service: a complete batch enters the buffer at **ingress end**, a conservative serialization assumption. Egress starts after ingress; receive/transmit overlaps fail the mode check. The usable buffer is `min(0.8×busStorage, receivePackageBuffer)`, never two free buffers added together.
- Four repeated days are evaluated from empty startup: day 0 warms the queue; all day-1 batches are measured through the next periodic service. Stable daily capacity must sustain the complete ingress demand. No loss/drop model rescues a deficit. A repeating deficit is unbounded backlog, not extra achieved delivery; overflow suppresses achieved delivery and latency claims.
- Worst-orbit power uses the **maximum unioned egress minutes in any orbit-length interval, including day wrap**, not an even-spacing inference. Ingress occupancy must fit the package active envelope; receive and transmit windows must not overlap. Sunlit mode placement, orbit/link geometry and receiver compatibility remain explicitly assumed, not propagated.
- Reference result: **1 GB/day delivered**, **0.5 GB peak buffer**; X-band sends a 0.5 GB batch in **0.952380952 min**. Delay from ingress completion to product is `(50 + .952380952)/60 + 1 h processing = 1.849206349 h`. This is timestamped fixture completion, **not the imaging fluid-queue bound or physical observation age**.

Synthetic mission gates: actual relay payload; viable ingress; contracted egress route; ≥1 GB/day delivered; ≤4 h ingress-completion-to-product delay; one year. Shared applicable engineering gates remain; optical pointing/tracking/scale/spectrum/footprint are excluded, not falsely marked MET. Relay merit is a fixed 70 after all gates pass (no invented optical stretch score).

Starter and pass use identical 12U/55 W/medium battery/X-band/500 km/50 kg booking hardware. Change **Ground service → network** to complete the route; returning to the single-station contract fails despite viable ingress. Tests also cover day wrap, unioned windows, unknown versus false hop evidence, capability, ingress and service deficits, finite buffer and delay equality.
