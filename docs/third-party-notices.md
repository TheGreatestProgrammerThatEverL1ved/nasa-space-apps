# Third-party software and attribution

The playable application uses **React and React DOM 19.3.1** and **Scheduler 0.28.0**, under MIT. Production builds include this notice as `THIRD-PARTY-NOTICES.txt`; retain it when redistributing build artifacts.

## React, React DOM and Scheduler — MIT

Copyright (c) Meta Platforms, Inc. and affiliates.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Development and verification

## Orbital renderer runtime additions — MIT

These runtime additions use the same MIT permission and warranty text printed above; retain these copyright notices with that text:

- Three.js 0.183.2 — Copyright © 2010–2026 three.js authors.
- React Three Fiber 9.8.2 — Copyright (c) 2019–2025 Poimandres. Its bundled React reconciler retains the Meta Platforms MIT notice above.
- @babel/runtime 7.29.14 — Copyright (c) 2014-present Sebastian McKenzie and other contributors.
- base64-js 1.5.1 — Copyright (c) 2014 Jameson Little.
- buffer 6.0.3 — Copyright (c) Feross Aboukhadijeh, and other contributors.
- its-fine 2.1.1 — Copyright (c) 2022–2025 Poimandres.
- react-use-measure 2.1.7 — Copyright (c) 2019–2025 Poimandres.
- suspend-react 0.1.3 — Copyright (c) 2021 Paul Henschel.
- use-sync-external-store 1.7.0 — Copyright (c) Meta Platforms, Inc. and affiliates.
- zustand 5.1.0 — Copyright (c) 2019 Paul Henschel.

Package metadata, installed license texts and the tagged [Fiber license](https://github.com/pmndrs/react-three-fiber/blob/v9.8.2/LICENSE) were inspected. Native/Expo optional peers are not installed or bundled.

### ieee754 1.2.1 — BSD-3-Clause

Copyright 2008 Fair Oaks Labs, Inc.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

## Development toolchain

The committed lockfile records exact dependency versions and license declarations. The inspected toolchain includes Vite, TypeScript, Vitest, Testing Library, Playwright, jsdom, oxlint, and axe-core. Lockfile declarations cover MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, 0BSD, BlueOak-1.0.0 and MPL-2.0; none is missing. MPL-2.0 packages are development dependencies, not application runtime. Dependency source/license files remain available through `npm ci`; this is not a relicensing of those projects.

Browser acceptance uses a separately installed Google Chrome. It is not bundled or redistributed here.

## Scientific references

### Earth image

`src/visual/assets/earth-blue-marble.jpg` is the **1024×512** NASA-provided compressed derivative of the August 2004 Blue Marble: Next Generation topography/bathymetry composite. Source image credit: **NASA Earth Observatory**, produced by Reto Stöckli. This is a historical illustrative texture, not current conditions or orbital geometry. The application scene and spacecraft are original procedural illustrations assembled with AI assistance, not NASA illustrations or validated designs.

Individual asset fetched: `https://assets.science.nasa.gov/dynamicimage/assets/science/esd/eo/images/bmng/bmng-topography-bathymetry/august/world.topo.bathy.200408.3x5400x2700.jpg?w=1024&h=512&fit=clip` (84,741 bytes).

The [Blue Marble credit page](https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/) and [NASA media usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/) were fetched and inspected on 15 November 2026. The asset is supplied for educational/informational use; the individual image lists no third-party copyright restriction, people, insignia or logo. NASA does not endorse this game or validate its AI-assisted content. The image is bundled through Vite imports; no runtime hotlink.

The [technical source register](game-rules-technical.md#11-source-register-and-limitations) attributes adopted facts. No vendor graphics or protected agency insignia are used. References do not imply NASA, JAXA, provider, or vendor endorsement, or qualify this composite training model for flight.
