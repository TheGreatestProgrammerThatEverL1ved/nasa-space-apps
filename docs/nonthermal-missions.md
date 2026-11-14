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
