import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { Locale, MissionConfiguration } from '../../engine/types'
import type { PartField } from '../mission-control/Spacecraft'
import {
  EARTH_SCHEMATIC, arrayTransform, batteryTransform, busTransform, createRandom,
  getArrayAppearance, getBatteryAppearance, getBusAppearance, getPayloadAppearance,
  getRadioAppearance, payloadTransform, resolveCraftAppearance,
  type CraftMode,
} from './appearance'

export interface CraftCanvasProps {
  config: MissionConfiguration
  locale: Locale
  mode: CraftMode
  selectedField: PartField | undefined
  motion: boolean
  angle: number
  onInspect: ((field: PartField) => void) | undefined
  onReady: () => void
  onFailure: (reason: string) => void
  suspended: boolean
}

const CAMERA_TARGET: Readonly<Record<CraftMode, readonly [number, number, number]>> = {
  menu: [0.55, 0.05, 0],
  hangar: [0, 0.08, 0],
  launch: [0, 0.42, 0],
}
const CAMERA_RADIUS = 10.6
const CAMERA_ELEVATION = 0.16
const EARTH_RADIUS = 7.6
const EARTH_POSITION: readonly [number, number, number] = [-6.5, -6.3, -7.6]
/**
 * Root-supplied, credited NASA Blue Marble surface. Resolved through the
 * bundler (never hotlinked); the procedural schematic map below remains the
 * fallback if the asset is missing or fails to decode.
 */
const EARTH_SURFACE_URL = new URL('../../visual/assets/earth-blue-marble.jpg', import.meta.url).href

export default function CraftCanvas(props: CraftCanvasProps) {
  const { suspended, motion, onFailure } = props
  const glOptions = useMemo(() => ({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance' as const,
    // Keep the last frame readable so verification captures and canvas
    // snapshots show the drawn scene instead of an empty buffer.
    preserveDrawingBuffer: true,
  }), [])
  const cameraOptions = useMemo(() => ({
    position: [7.4, 2.4, 8.6] as [number, number, number],
    fov: 38,
    near: 0.1,
    far: 220,
  }), [])

  return <div className="craft-scene__canvas">
    <Canvas
      dpr={[1, 1.75]}
      gl={glOptions}
      camera={cameraOptions}
      frameloop={suspended ? 'never' : motion ? 'always' : 'demand'}
      onCreated={state => {
        const canvas = state.gl.domElement
        canvas.addEventListener('webglcontextlost', (event: Event) => {
          event.preventDefault()
          onFailure('webgl-context-lost')
        }, false)
      }}
    >
      <Scene {...props} />
    </Canvas>
  </div>
}

interface SceneProps extends CraftCanvasProps {
  onReady: () => void
  onFailure: (reason: string) => void
}

function Scene({ config, locale, mode, selectedField, motion, angle, onInspect, onReady }: SceneProps) {
  const invalidate = useThree(state => state.invalidate)
  const [earthSettled, setEarthSettled] = useState(false)
  const configKey = `${config.busId}|${config.arrayId}|${config.batteryId}|${config.radioId}|${config.payloadId}`

  useEffect(() => {
    invalidate()
  }, [configKey, mode, selectedField, angle, motion, invalidate])

  return <>
    <ambientLight intensity={0.34} />
    <directionalLight position={[7, 9, 8]} intensity={2.5} color="#fff3df" />
    <directionalLight position={[-9, -4, 5]} intensity={0.85} color="#5f9cc9" />
    <directionalLight position={[0, 5, -10]} intensity={1.6} color="#a9d9ff" />
    <pointLight position={[1.5, -1.6, 2.4]} intensity={9} distance={9} decay={2} color="#4f9ecf" />
    <StarField />
    <EarthLimb motion={motion} onSettled={() => setEarthSettled(true)} />
    <CraftModel
      config={config}
      locale={locale}
      mode={mode}
      selectedField={selectedField}
      motion={motion}
      onInspect={onInspect}
    />
    <CameraRig angle={angle} motion={motion} mode={mode} selectedField={selectedField} />
    <ReadySignal earthSettled={earthSettled} onReady={onReady} />
  </>
}

/**
 * Accepts the WebGL path only after real frames have been drawn. `onCreated`
 * merely proves a context exists; this waits for two rendered frames and the
 * Earth surface request, then reports on the next animation frame so the
 * schematic overlay is removed only once the canvas holds the final image.
 */
function ReadySignal({ earthSettled, onReady }: { earthSettled: boolean; onReady: () => void }) {
  const frames = useRef(0)
  const reported = useRef(false)
  const rafRef = useRef<number | null>(null)
  const settledRef = useRef(earthSettled)
  const readyRef = useRef(onReady)
  const invalidate = useThree(state => state.invalidate)

  useEffect(() => { settledRef.current = earthSettled }, [earthSettled])
  useEffect(() => { readyRef.current = onReady }, [onReady])

  const report = useCallback(() => {
    if (reported.current) return
    reported.current = true
    const fire = () => {
      rafRef.current = null
      readyRef.current()
    }
    if (typeof requestAnimationFrame === 'function') rafRef.current = requestAnimationFrame(fire)
    else fire()
  }, [])

  useEffect(() => () => {
    if (rafRef.current !== null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  useFrame(() => {
    frames.current += 1
    if (reported.current) return
    if (frames.current >= 2 && settledRef.current) report()
    else invalidate()
  })

  useEffect(() => {
    if (earthSettled) invalidate()
  }, [earthSettled, invalidate])

  useEffect(() => {
    // A slow or blocked texture must not strand the stage; one real frame is
    // still required before WebGL is accepted.
    const timer = window.setTimeout(() => {
      if (frames.current >= 1) report()
    }, 1500)
    return () => window.clearTimeout(timer)
  }, [report])

  return null
}

function placeCamera(camera: THREE.Camera, angleDeg: number, mode: CraftMode, selectedField?: PartField) {
  const cutaway = mode === 'hangar' && selectedField === 'batteryId'
  const target = cutaway ? [0.35, 0.05, 0.1] : CAMERA_TARGET[mode]
  const aspect = camera instanceof THREE.PerspectiveCamera ? camera.aspect : 1.8
  const radius = cutaway ? 3.5 : mode === 'hangar' ? 5.8 * Math.max(1, 1.9 / aspect) : CAMERA_RADIUS
  const azimuth = THREE.MathUtils.degToRad(angleDeg)
  const horizontal = radius * Math.cos(CAMERA_ELEVATION)
  camera.position.set(
    target[0] + Math.sin(azimuth) * horizontal,
    target[1] + Math.sin(CAMERA_ELEVATION) * radius,
    target[2] + Math.cos(azimuth) * horizontal,
  )
  camera.lookAt(target[0], target[1], target[2])
}

function CameraRig({ angle, motion, mode, selectedField }: { angle: number; motion: boolean; mode: CraftMode; selectedField?: PartField }) {
  const camera = useThree(state => state.camera)
  const invalidate = useThree(state => state.invalidate)
  const azimuth = useRef(THREE.MathUtils.degToRad(angle))

  useEffect(() => {
    if (!motion) {
      azimuth.current = THREE.MathUtils.degToRad(angle)
      placeCamera(camera, angle, mode, selectedField)
      invalidate()
    }
  }, [angle, motion, mode, selectedField, camera, invalidate])

  useFrame((state) => {
    if (typeof document !== 'undefined' && document.hidden) return
    if (motion) {
      const t = state.clock.elapsedTime
      // A slow cinematic arc, not a propagated orbit. The bounded camera keeps
      // the menu's negative space intact instead of orbiting behind its text.
      azimuth.current = THREE.MathUtils.degToRad(angle) + Math.sin(t * 0.12) * 0.22
    }
    placeCamera(camera, THREE.MathUtils.radToDeg(azimuth.current), mode, selectedField)
  })
  return null
}

function StarField() {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const random = createRandom(424242)
    const positions = new Float32Array(1400 * 3)
    for (let i = 0; i < 1400; i += 1) {
      const radius = 48 + random() * 24
      const theta = random() * Math.PI * 2
      const cosPhi = 2 * random() - 1
      const sinPhi = Math.sqrt(1 - cosPhi * cosPhi)
      positions[i * 3] = radius * sinPhi * Math.cos(theta)
      positions[i * 3 + 1] = radius * cosPhi
      positions[i * 3 + 2] = radius * sinPhi * Math.sin(theta)
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [])

  useEffect(() => () => geometry.dispose(), [geometry])

  return <points geometry={geometry}>
    <pointsMaterial size={0.13} sizeAttenuation color="#e4eeff" transparent opacity={0.85} depthWrite={false} />
  </points>
}

function createEarthTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 1024
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    const sx = 2048 / EARTH_SCHEMATIC.width
    const sy = 1024 / EARTH_SCHEMATIC.height
    const ocean = ctx.createLinearGradient(0, 0, 0, 1024)
    ocean.addColorStop(0, '#1a6690')
    ocean.addColorStop(0.55, '#0e4568')
    ocean.addColorStop(1, '#061d2e')
    ctx.fillStyle = ocean
    ctx.fillRect(0, 0, 2048, 1024)

    ctx.save()
    ctx.scale(sx, sy)
    ctx.lineJoin = 'round'
    for (const path of EARTH_SCHEMATIC.land) {
      const shape = new Path2D(path)
      ctx.shadowColor = '#2f7e97'
      ctx.shadowBlur = 16
      ctx.fillStyle = '#8ea67e'
      ctx.fill(shape)
      ctx.shadowBlur = 0
      ctx.strokeStyle = '#e8e1c4'
      ctx.lineWidth = 2.2
      ctx.stroke(shape)
    }
    for (const path of EARTH_SCHEMATIC.islands) {
      const shape = new Path2D(path)
      ctx.fillStyle = '#8ea67e'
      ctx.fill(shape)
      ctx.strokeStyle = '#e8e1c4'
      ctx.lineWidth = 1.8
      ctx.stroke(shape)
    }
    ctx.globalAlpha = 0.09
    ctx.strokeStyle = '#dff2ff'
    ctx.lineWidth = 1
    for (let x = 0; x <= 1000; x += 62.5) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 500)
      ctx.stroke()
    }
    for (let y = 0; y <= 500; y += 62.5) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(1000, y)
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    // Sparse original cloud wisps, drawn procedurally, no external imagery.
    const random = createRandom(90210)
    ctx.strokeStyle = '#eaf4f8'
    ctx.lineCap = 'round'
    for (let i = 0; i < 26; i += 1) {
      const x = random() * 1000
      const y = 80 + random() * 340
      const width = 40 + random() * 120
      ctx.globalAlpha = 0.05 + random() * 0.07
      ctx.lineWidth = 4 + random() * 6
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.bezierCurveTo(x + width * 0.35, y - 12, x + width * 0.7, y + 12, x + width, y - 2)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    ctx.restore()

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.wrapS = THREE.RepeatWrapping
    texture.anisotropy = 4
    return texture
  } catch {
    return null
  }
}

const ATMOSPHERE_VERTEX = `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`
const ATMOSPHERE_FRAGMENT = `
  uniform vec3 uColor;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.4);
    gl_FragColor = vec4(uColor, rim * 0.95);
  }
`

function EarthLimb({ motion, onSettled }: { motion: boolean; onSettled: () => void }) {
  const procedural = useMemo(() => createEarthTexture(), [])
  const [surface, setSurface] = useState<THREE.Texture | null>(null)
  const group = useRef<THREE.Group | null>(null)
  const uniforms = useMemo(() => ({ uColor: { value: new THREE.Color('#5aa9e8') } }), [])
  const settledRef = useRef(false)
  const settledCbRef = useRef(onSettled)

  useEffect(() => { settledCbRef.current = onSettled }, [onSettled])

  const settle = useCallback(() => {
    if (settledRef.current) return
    settledRef.current = true
    settledCbRef.current()
  }, [])

  useEffect(() => {
    let cancelled = false
    const loader = new THREE.TextureLoader()
    loader.load(
      EARTH_SURFACE_URL,
      loaded => {
        if (cancelled) { loaded.dispose(); return }
        loaded.colorSpace = THREE.SRGBColorSpace
        loaded.wrapS = THREE.RepeatWrapping
        loaded.anisotropy = 4
        setSurface(loaded)
        settle()
      },
      undefined,
      () => { settle() /* keep the procedural schematic surface */ },
    )
    return () => { cancelled = true }
  }, [settle])

  useEffect(() => () => { procedural?.dispose() }, [procedural])
  useEffect(() => () => { surface?.dispose() }, [surface])

  const map = surface ?? procedural

  useFrame((_, delta) => {
    if (!group.current || !motion) return
    if (typeof document !== 'undefined' && document.hidden) return
    group.current.rotation.y += delta * 0.008
  })

  return <>
    <group ref={group} position={[EARTH_POSITION[0], EARTH_POSITION[1], EARTH_POSITION[2]]} rotation={[0.18, 2.2, -0.12]}>
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS, 96, 64]} />
        <meshStandardMaterial
          {...(map ? { map } : {})}
          color={map ? '#ffffff' : '#1d4f72'}
          roughness={0.94}
          metalness={0.04}
          emissive="#0a2740"
          emissiveIntensity={surface ? 0.14 : 0.35}
        />
      </mesh>
    </group>
    <mesh position={[EARTH_POSITION[0], EARTH_POSITION[1], EARTH_POSITION[2]]}>
      <sphereGeometry args={[EARTH_RADIUS * 1.025, 64, 48]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={ATMOSPHERE_VERTEX}
        fragmentShader={ATMOSPHERE_FRAGMENT}
      />
    </mesh>
  </>
}

const HULL = {
  shell: { color: '#d3dbe0', metalness: 0.72, roughness: 0.34 },
  rail: { color: '#aab6bd', metalness: 0.9, roughness: 0.26 },
  seam: { color: '#6d7d87', metalness: 0.55, roughness: 0.5 },
  radiator: { color: '#eaf1f4', metalness: 0.28, roughness: 0.55 },
  gold: { color: '#d9a441', metalness: 0.95, roughness: 0.3 },
  dark: { color: '#26323b', metalness: 0.5, roughness: 0.55 },
  spoke: { color: '#b9c6cd', metalness: 0.8, roughness: 0.35 },
}

const MODE_POSITION: Readonly<Record<CraftMode, readonly [number, number, number]>> = {
  menu: [1.15, -0.06, 0],
  hangar: [0, 0, 0],
  launch: [0, 0.44, 0],
}

function createSolarTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 384
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.fillStyle = '#0d2135'
    ctx.fillRect(0, 0, 384, 256)
    const cols = 10
    const rows = 6
    const cw = 384 / cols
    const ch = 256 / rows
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const shade = 18 + ((row * 7 + col * 11) % 20)
        ctx.fillStyle = `rgb(${18}, ${52 + shade}, ${92 + shade})`
        ctx.fillRect(col * cw + 2, row * ch + 2, cw - 4, ch - 4)
        const glare = ctx.createLinearGradient(col * cw, row * ch, (col + 1) * cw, (row + 1) * ch)
        glare.addColorStop(0, 'rgba(180, 220, 245, 0.16)')
        glare.addColorStop(0.55, 'rgba(10, 30, 50, 0.0)')
        glare.addColorStop(1, 'rgba(10, 30, 50, 0.24)')
        ctx.fillStyle = glare
        ctx.fillRect(col * cw + 2, row * ch + 2, cw - 4, ch - 4)
      }
    }
    ctx.strokeStyle = '#c3ccd2'
    ctx.lineWidth = 4
    ctx.strokeRect(2, 2, 380, 252)
    ctx.strokeStyle = 'rgba(195, 204, 210, 0.55)'
    ctx.lineWidth = 1.5
    for (let col = 1; col < cols; col += 1) {
      ctx.beginPath()
      ctx.moveTo(col * cw, 0)
      ctx.lineTo(col * cw, 256)
      ctx.stroke()
    }
    for (let row = 1; row < rows; row += 1) {
      ctx.beginPath()
      ctx.moveTo(0, row * ch)
      ctx.lineTo(384, row * ch)
      ctx.stroke()
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
    return texture
  } catch {
    return null
  }
}

function useSolarTexture(): THREE.CanvasTexture | null {
  const texture = useMemo(() => createSolarTexture(), [])
  useEffect(() => () => { texture?.dispose() }, [texture])
  return texture
}

function solarMaterial(texture: THREE.CanvasTexture | null, accent: string, selected: boolean) {
  return {
    ...(texture ? { map: texture } : { color: '#1d4a68' }),
    metalness: 0.38,
    roughness: 0.42,
    emissive: new THREE.Color(accent),
    emissiveIntensity: selected ? 0.055 : 0.018,
  }
}

interface ModelProps {
  config: MissionConfiguration
  locale: Locale
  mode: CraftMode
  selectedField: PartField | undefined
  motion: boolean
  onInspect: ((field: PartField) => void) | undefined
}

function CraftModel(props: ModelProps) {
  const { config, mode, selectedField, motion, onInspect } = props
  const craft = resolveCraftAppearance(config)
  const busT = busTransform(config.busId)
  const payloadT = payloadTransform(config.payloadId, config.busId)
  const batteryT = batteryTransform(config.batteryId, config.busId)
  const bob = useRef<THREE.Group | null>(null)
  const inspect = (field: PartField) => onInspect
    ? (event: { stopPropagation: () => void }) => { event.stopPropagation(); onInspect(field) }
    : undefined

  useFrame(state => {
    if (!bob.current) return
    if (!motion) { bob.current.position.y = 0; return }
    bob.current.position.y = Math.sin(state.clock.elapsedTime * 0.45) * 0.035
  })

  return <group position={[MODE_POSITION[mode][0], MODE_POSITION[mode][1], MODE_POSITION[mode][2]]}>
    <group ref={bob}>
      <group onClick={inspect('busId')}>
        <BusShell id={config.busId} selected={selectedField === 'busId'} />
      </group>
      <SolarArrays
        arrayId={config.arrayId}
        busId={config.busId}
        selected={selectedField === 'arrayId'}
        onClick={inspect('arrayId')}
      />
      <group onClick={inspect('payloadId')}>
        <PayloadMount payloadId={config.payloadId} busId={config.busId} selected={selectedField === 'payloadId'} />
      </group>
      <group onClick={inspect('radioId')}>
        <RadioAntenna radioId={config.radioId} busId={config.busId} selected={selectedField === 'radioId'} />
      </group>
      {selectedField === 'batteryId' && <BatteryCutaway
        batteryId={config.batteryId}
        busId={config.busId}
        onClick={inspect('batteryId')}
      />}
    </group>
    {selectedField === 'busId' && <Halo
      radius={Math.hypot(busT.half[0], busT.half[1]) + 0.22}
      tube={0.012}
      color={craft.bus.accent}
      rotation={[Math.PI / 2, 0, 0]}
      scale={[1, busT.size[2] / (2 * (Math.hypot(busT.half[0], busT.half[1]) + 0.22)), 1]}
      motion={motion}
    />}
    {selectedField === 'payloadId' && <Halo
      radius={payloadT.barrelRadius + 0.16}
      tube={0.01}
      color={craft.payload.accent}
      position={[0, busT.payloadBaseY + payloadT.barrelLength * 0.7, 0.08]}
      motion={motion}
    />}
    {selectedField === 'radioId' && <Halo
      radius={(craft.radio.antenna === 'whip' ? 0.2 : craft.radio.dishRadius + 0.14)}
      tube={0.01}
      color={craft.radio.accent}
      position={[busT.radioX, busT.payloadBaseY + craft.radio.mast, busT.radioZ]}
      rotation={[Math.PI / 2, 0, 0]}
      motion={motion}
    />}
    {selectedField === 'batteryId' && <Halo
      radius={Math.hypot(batteryT.half[0], batteryT.half[1], batteryT.half[2]) + 0.12}
      tube={0.01}
      color={craft.battery.accent}
      position={[batteryT.explodeX, 0, 0]}
      motion={motion}
    />}
    {selectedField && ['groundId', 'orbitId', 'launcherId'].includes(selectedField) && <mesh position={[0, -0.92, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.3, 0.008, 6, 48]} />
      <meshBasicMaterial color="#8fae9b" transparent opacity={0.5} depthWrite={false} />
    </mesh>}
  </group>
}

function Halo({ radius, tube, color, motion, position, rotation, scale }: {
  radius: number
  tube: number
  color: string
  motion: boolean
  position?: readonly [number, number, number]
  rotation?: readonly [number, number, number]
  scale?: readonly [number, number, number]
}) {
  const material = useRef<THREE.MeshBasicMaterial | null>(null)
  useFrame(state => {
    if (material.current && motion) material.current.opacity = 0.42 + 0.3 * Math.sin(state.clock.elapsedTime * 2.2)
  })
  return <mesh
    position={position ? [position[0], position[1], position[2]] : [0, 0, 0]}
    rotation={rotation ? [rotation[0], rotation[1], rotation[2]] : [0, 0, 0]}
    scale={scale ? [scale[0], scale[1], scale[2]] : [1, 1, 1]}
  >
    <torusGeometry args={[radius, tube, 6, 72]} />
    <meshBasicMaterial ref={material} color={color} transparent opacity={0.6} depthWrite={false} />
  </mesh>
}

function BusShell({ id, selected }: { id: string; selected: boolean }) {
  const bus = getBusAppearance(id)
  const t = busTransform(id)
  const [w, h, d] = t.size
  const front = d / 2
  return <group>
    <mesh>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial {...HULL.shell} {...(selected ? { emissive: new THREE.Color(bus.accent), emissiveIntensity: 0.24 } : {})} />
    </mesh>
    {([[-1, -1], [1, -1], [-1, 1], [1, 1]] as const).map(([sx, sy]) => (
      <mesh key={`${sx}:${sy}`} position={[sx * (w / 2 - 0.016), sy * (h / 2 - 0.016), 0]}>
        <boxGeometry args={[0.036, 0.036, d + 0.012]} />
        <meshStandardMaterial {...HULL.rail} />
      </mesh>
    ))}
    {/* Raised seam frame on the observing face. */}
    {([
      [0, h / 2 - 0.05, w - 0.1, 0.014],
      [0, -h / 2 + 0.05, w - 0.1, 0.014],
      [-w / 2 + 0.05, 0, 0.014, h - 0.1],
      [w / 2 - 0.05, 0, 0.014, h - 0.1],
    ] as const).map(([x, y, sw, sh], index) => (
      <mesh key={`seam${index}`} position={[x, y, front + 0.007]}>
        <boxGeometry args={[sw, sh, 0.012]} />
        <meshStandardMaterial {...HULL.seam} />
      </mesh>
    ))}
    {Array.from({ length: bus.bands }, (_, index) => {
      const y = -h / 2 + (h * (index + 1)) / (bus.bands + 1)
      return <mesh key={`band${index}`} position={[0, y, front + 0.008]}>
        <boxGeometry args={[w - 0.06, 0.012, 0.01]} />
        <meshStandardMaterial {...HULL.rail} metalness={0.7} roughness={0.4} />
      </mesh>
    })}
    {bus.goldFoil && <group position={[0, -h * 0.31, front + 0.008]}>
      <mesh>
        <boxGeometry args={[w * 0.86, h * 0.2, 0.012]} />
        <meshStandardMaterial {...HULL.gold} roughness={0.42} />
      </mesh>
      <mesh position={[0, 0, 0.008]}>
        <boxGeometry args={[w * 0.5, h * 0.11, 0.008]} />
        <meshStandardMaterial {...HULL.gold} color="#f0c877" roughness={0.32} />
      </mesh>
    </group>}
    {/* Radiator on +X with cell ribs. */}
    <group position={[w / 2 + 0.007, 0, 0]}>
      <mesh>
        <boxGeometry args={[0.014, h * 0.66, d * 0.58]} />
        <meshStandardMaterial {...HULL.radiator} />
      </mesh>
      {Array.from({ length: bus.radiatorCells }, (_, index) => {
        const z = -d * 0.26 + (d * 0.52 * index) / Math.max(1, bus.radiatorCells - 1)
        return <mesh key={`rib${index}`} position={[0.011, 0, z]}>
          <boxGeometry args={[0.008, h * 0.6, 0.014]} />
          <meshStandardMaterial {...HULL.rail} metalness={0.85} roughness={0.3} />
        </mesh>
      })}
    </group>
    {/* Rear access panel and top hatch give the hull depth from other angles. */}
    <mesh position={[0, 0, -front - 0.006]}>
      <boxGeometry args={[w * 0.82, h * 0.8, 0.012]} />
      <meshStandardMaterial {...HULL.dark} metalness={0.6} roughness={0.5} />
    </mesh>
    <mesh position={[0, h / 2 + 0.006, 0]}>
      <boxGeometry args={[w * 0.5, 0.012, d * 0.4]} />
      <meshStandardMaterial {...HULL.rail} metalness={0.8} roughness={0.35} />
    </mesh>
    {([[0.78, 0.72], [-0.78, 0.72], [0.78, -0.72], [-0.78, -0.72]] as const).map(([sx, sy], index) => (
      <mesh key={`bolt${index}`} position={[sx * w * 0.5, sy * h * 0.5, front + 0.012]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.019, 0.019, 0.014, 12]} />
        <meshStandardMaterial {...HULL.spoke} />
      </mesh>
    ))}
    <mesh position={[w / 2 - 0.1, h / 2 - 0.09, front + 0.012]}>
      <boxGeometry args={[0.05, 0.05, 0.014]} />
      <meshStandardMaterial color={bus.accent} emissive={new THREE.Color(bus.accent)} emissiveIntensity={0.9} roughness={0.4} />
    </mesh>
  </group>
}

function SolarArrays({ arrayId, busId, selected, onClick }: {
  arrayId: string
  busId: string
  selected: boolean
  onClick: ((event: { stopPropagation: () => void }) => void) | undefined
}) {
  const array = getArrayAppearance(arrayId)
  const layout = arrayTransform(arrayId, busId)
  const bus = busTransform(busId)
  const texture = useSolarTexture()
  const material = solarMaterial(texture, array.accent, selected)
  const [w, h, d] = bus.size

  if (layout.mount === 'body') {
    const face = <group>
      <mesh position={[w / 2 + 0.016, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[d * 0.74, h * 0.68, 0.012]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh position={[0, 0, d / 2 + 0.016]}>
        <boxGeometry args={[w * 0.78, h * 0.6, 0.012]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh position={[-w / 2 - 0.016, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[d * 0.74, h * 0.68, 0.012]} />
        <meshStandardMaterial {...material} />
      </mesh>
    </group>
    return <group onClick={onClick}>{face}</group>
  }

  const segment = layout.span / layout.segments
  const thickness = 0.022
  return <group onClick={onClick}>
    {([1, -1] as const).map(side => {
      const edge = side * (w / 2)
      const yokeEnd = edge + side * layout.yoke
      return <group key={side}>
        <mesh position={[edge + side * layout.yoke / 2, layout.wingY, 0]}>
          <boxGeometry args={[layout.yoke, 0.05, 0.05]} />
          <meshStandardMaterial {...HULL.spoke} />
        </mesh>
        {Array.from({ length: layout.segments }, (_, index) => {
          const centre = yokeEnd + side * (segment * (index + 0.5))
          return <group key={index} position={[centre, layout.wingY, 0]}>
            <mesh>
              <boxGeometry args={[segment * 0.985, layout.chord, thickness]} />
              <meshStandardMaterial {...material} />
            </mesh>
            <mesh position={[0, layout.chord / 2 - 0.012, 0]}>
              <boxGeometry args={[segment, 0.024, thickness + 0.01]} />
              <meshStandardMaterial {...HULL.spoke} />
            </mesh>
            <mesh position={[0, -layout.chord / 2 + 0.012, 0]}>
              <boxGeometry args={[segment, 0.024, thickness + 0.01]} />
              <meshStandardMaterial {...HULL.spoke} />
            </mesh>
            <mesh position={[side * segment / 2, 0, 0]}>
              <boxGeometry args={[0.02, layout.chord, thickness + 0.014]} />
              <meshStandardMaterial {...HULL.spoke} metalness={0.9} roughness={0.26} />
            </mesh>
            <mesh position={[0, 0, thickness / 2 + 0.006]}>
              <boxGeometry args={[segment * 0.7, layout.chord * 0.5, 0.004]} />
              <meshStandardMaterial color="#d8ecff" metalness={0.2} roughness={0.18} transparent opacity={0.16} depthWrite={false} />
            </mesh>
          </group>
        })}
        <mesh position={[yokeEnd + side * (layout.span + 0.02), layout.wingY, 0]}>
          <boxGeometry args={[0.03, layout.chord, thickness + 0.02]} />
          <meshStandardMaterial color={array.accent} metalness={0.85} roughness={0.3} />
        </mesh>
      </group>
    })}
  </group>
}

function PayloadMount({ payloadId, busId, selected }: { payloadId: string; busId: string; selected: boolean }) {
  const payload = getPayloadAppearance(payloadId)
  const t = payloadTransform(payloadId, busId)
  const bus = busTransform(busId)
  const accent = payload.accent
  const glow = selected ? 0.55 : 0.22

  return <group position={[0, t.baseY, 0]}>
    <mesh position={[0, 0.012, 0]}>
      <boxGeometry args={[bus.size[0] * 0.5, 0.024, bus.size[2] * 0.42]} />
      <meshStandardMaterial {...HULL.rail} />
    </mesh>
    <mesh position={[0, 0.03, -bus.size[2] * 0.1]}>
      <boxGeometry args={[bus.size[0] * 0.16, 0.036, bus.size[2] * 0.2]} />
      <meshStandardMaterial {...HULL.dark} />
    </mesh>
    {payload.optics === 'relay'
      ? <RelayBox payloadId={payloadId} selected={selected} />
      : <LensBarrel
        length={t.barrelLength}
        radius={t.barrelRadius}
        rings={t.rings}
        optics={payload.optics}
        lensTone={payload.lensTone}
        accent={accent}
        glow={glow}
      />}
  </group>
}

function LensBarrel({ length, radius, rings, optics, lensTone, accent, glow }: {
  length: number
  radius: number
  rings: number
  optics: 'thermal' | 'visible'
  lensTone: string
  accent: string
  glow: number
}) {
  const thermal = optics === 'thermal'
  const tilt = thermal ? 0.52 : 0.46
  return <group rotation={[tilt, 0, 0]} position={[0, 0.03, 0.02]}>
    <mesh position={[0, 0.03, 0]}>
      <cylinderGeometry args={[radius * 1.1, radius * 1.35, 0.06, 24]} />
      <meshStandardMaterial {...HULL.rail} />
    </mesh>
    <mesh position={[0, length / 2 + 0.04, 0]}>
      <cylinderGeometry args={[radius, radius * 1.04, length, 28]} />
      <meshStandardMaterial color={thermal ? '#3a464f' : '#46545e'} metalness={0.86} roughness={0.26} />
    </mesh>
    {/* Telescoping visible-lens steps read as a different instrument. */}
    {!thermal && Array.from({ length: 3 }, (_, index) => {
      const stepRadius = radius * (1.18 - index * 0.12)
      return <mesh key={index} position={[0, 0.16 + index * (length * 0.26), 0]}>
        <cylinderGeometry args={[stepRadius, stepRadius, 0.035, 24]} />
        <meshStandardMaterial {...HULL.spoke} metalness={0.92} roughness={0.22} />
      </mesh>
    })}
    {Array.from({ length: rings }, (_, index) => {
      const y = 0.14 + (length * (index + 0.5)) / Math.max(1, rings)
      return <mesh key={`ring${index}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 1.02, 0.011, 6, 40]} />
        <meshStandardMaterial {...HULL.spoke} metalness={0.9} roughness={0.24} />
      </mesh>
    })}
    <mesh position={[0, length + 0.055, 0]}>
      <cylinderGeometry args={[radius * 1.16, radius * 1.08, 0.05, 28]} />
      <meshStandardMaterial color="#1d262d" metalness={0.8} roughness={0.3} />
    </mesh>
    <mesh position={[0, length + 0.085, 0]}>
      <cylinderGeometry args={[radius * 0.9, radius * 0.9, 0.016, 28]} />
      <meshStandardMaterial color={lensTone} emissive={new THREE.Color(lensTone)} emissiveIntensity={glow * 2.4} metalness={0.3} roughness={0.12} />
    </mesh>
    <mesh position={[0, length + 0.096, 0]}>
      <cylinderGeometry args={[radius * 0.52, radius * 0.52, 0.012, 24]} />
      <meshStandardMaterial color="#0a1720" metalness={0.2} roughness={0.06} />
    </mesh>
    {thermal && <>
      <mesh position={[0, length + 0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 1.42, 0.018, 6, 32]} />
        <meshStandardMaterial color="#2b353d" metalness={0.7} roughness={0.4} />
      </mesh>
      {[0, 1, 2].map(index => {
        const angle = (index / 3) * Math.PI * 2
        return <mesh
          key={`fin${index}`}
          position={[Math.cos(angle) * radius * 1.28, length * 0.6, Math.sin(angle) * radius * 1.28]}
          rotation={[0, -angle, 0]}
        >
          <boxGeometry args={[radius * 0.9, length * 0.44, 0.014]} />
          <meshStandardMaterial color="#39454e" metalness={0.66} roughness={0.36} />
        </mesh>
      })}
      <mesh position={[radius * 0.7, length * 0.3, 0]}>
        <boxGeometry args={[0.03, length * 0.4, 0.09]} />
        <meshStandardMaterial color={accent} emissive={new THREE.Color(accent)} emissiveIntensity={glow} metalness={0.5} roughness={0.4} />
      </mesh>
    </>}
    <mesh position={[0, length * 0.52, radius * 0.92]}>
      <boxGeometry args={[radius * 0.5, length * 0.35, 0.012]} />
      <meshStandardMaterial color={accent} emissive={new THREE.Color(accent)} emissiveIntensity={glow * 0.8} transparent opacity={0.85} />
    </mesh>
    <mesh position={[radius * 0.34, length * 0.24, radius * 1.02]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.012, 0.012, length * 0.4, 8]} />
      <meshStandardMaterial color="#8d9aa4" metalness={0.9} roughness={0.28} />
    </mesh>
  </group>
}

function RelayBox({ payloadId, selected }: { payloadId: string; selected: boolean }) {
  const payload = getPayloadAppearance(payloadId)
  const [bw, bh, bd] = payload.buffer ?? [0.44, 0.3, 0.36]
  const accent = payload.accent
  return <group position={[0, 0.035, 0]}>
    <mesh position={[0, bh / 2, 0]}>
      <boxGeometry args={[bw, bh, bd]} />
      <meshStandardMaterial color="#2f3d47" metalness={0.72} roughness={0.38} />
    </mesh>
    <mesh position={[0, bh + 0.008, 0]}>
      <boxGeometry args={[bw * 0.86, 0.016, bd * 0.86]} />
      <meshStandardMaterial {...HULL.gold} roughness={0.4} />
    </mesh>
    {[bw / 2 + 0.006, -bw / 2 - 0.006].map((x, index) => (
      <mesh key={index} position={[x, bh * 0.55, 0]}>
        <boxGeometry args={[0.012, bh * 0.6, bd * 0.7]} />
        <meshStandardMaterial color={accent} emissive={new THREE.Color(accent)} emissiveIntensity={selected ? 0.6 : 0.2} metalness={0.6} roughness={0.4} />
      </mesh>
    ))}
    {[0.28, 0.5, 0.72].map((_, index) => (
      <mesh key={`led${index}`} position={[bw * 0.3, bh * 0.3, bd / 2 + 0.01]}>
        <sphereGeometry args={[0.017, 12, 10]} />
        <meshStandardMaterial
          color={index === 0 ? '#8fe3c8' : index === 1 ? '#f0c060' : '#7fb9e8'}
          emissive={new THREE.Color(index === 0 ? '#8fe3c8' : index === 1 ? '#f0c060' : '#7fb9e8')}
          emissiveIntensity={1.4}
          roughness={0.3}
        />
      </mesh>
    ))}
    <mesh position={[-bw * 0.24, bh + 0.03, 0]}>
      <cylinderGeometry args={[0.11, 0.13, 0.05, 20]} />
      <meshStandardMaterial color="#c9d4da" metalness={0.65} roughness={0.34} />
    </mesh>
    <mesh position={[-bw * 0.24, bh + 0.2, 0]}>
      <cylinderGeometry args={[0.008, 0.008, 0.3, 8]} />
      <meshStandardMaterial color="#b9c6cd" metalness={0.9} roughness={0.3} />
    </mesh>
    <mesh position={[bw / 2 * 0.55, bh * 0.24, bd / 2 + 0.014]}>
      <boxGeometry args={[bw * 0.24, bh * 0.2, 0.012]} />
      <meshStandardMaterial color="#1b242b" metalness={0.4} roughness={0.6} />
    </mesh>
  </group>
}

function RadioAntenna({ radioId, busId, selected }: { radioId: string; busId: string; selected: boolean }) {
  const radio = getRadioAppearance(radioId)
  const bus = busTransform(busId)
  const [w, h] = bus.size
  const accent = radio.accent
  const glow = selected ? 1.5 : 0.5
  const base: [number, number, number] = [bus.radioX, h / 2 + 0.008, bus.radioZ]

  return <group position={base}>
    <mesh position={[0, 0.008, 0]}>
      <boxGeometry args={[w * 0.24, 0.016, w * 0.24]} />
      <meshStandardMaterial {...HULL.rail} />
    </mesh>
    {radio.antenna === 'whip'
      ? <group>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.036, 0.05, 0.12, 16]} />
          <meshStandardMaterial {...HULL.spoke} />
        </mesh>
        <mesh position={[0, radio.mast / 2 + 0.1, 0]}>
          <cylinderGeometry args={[0.005, 0.008, radio.mast, 8]} />
          <meshStandardMaterial color="#d5dee3" metalness={0.92} roughness={0.24} />
        </mesh>
        {Array.from({ length: radio.coils }, (_, index) => (
          <mesh key={index} position={[0, 0.14 + index * 0.034, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.042, 0.006, 6, 20]} />
            <meshStandardMaterial color={accent} emissive={new THREE.Color(accent)} emissiveIntensity={glow} metalness={0.5} roughness={0.3} />
          </mesh>
        ))}
        <mesh position={[0, radio.mast + 0.12, 0]}>
          <sphereGeometry args={[0.016, 12, 10]} />
          <meshStandardMaterial color={accent} emissive={new THREE.Color(accent)} emissiveIntensity={glow * 1.6} />
        </mesh>
        <mesh position={[0.05, 0.03, 0]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.006, 0.006, 0.18, 8]} />
          <meshStandardMaterial {...HULL.spoke} />
        </mesh>
      </group>
      : <group>
        <mesh position={[0, radio.mast / 2 + 0.02, 0]}>
          <cylinderGeometry args={[0.02, 0.026, radio.mast, 16]} />
          <meshStandardMaterial {...HULL.spoke} />
        </mesh>
        <group position={[0, radio.mast + 0.03, 0]} rotation={[0.94, 0, 0]}>
          <mesh>
            <sphereGeometry args={[radio.dishRadius, 26, 14, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
            <meshStandardMaterial color="#dfe8ec" metalness={0.55} roughness={0.32} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, radio.dishRadius * 0.24, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radio.dishRadius * 0.965, 0.009, 6, 40]} />
            <meshStandardMaterial color={accent} emissive={new THREE.Color(accent)} emissiveIntensity={glow} metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, radio.dishRadius * 0.55, 0]}>
            <cylinderGeometry args={[0.008, 0.008, radio.dishRadius * 0.6, 8]} />
            <meshStandardMaterial {...HULL.spoke} />
          </mesh>
          <mesh position={[0, radio.dishRadius * 0.86, 0]}>
            <sphereGeometry args={[0.022, 12, 10]} />
            <meshStandardMaterial color={accent} emissive={new THREE.Color(accent)} emissiveIntensity={glow * 1.4} />
          </mesh>
          <mesh position={[0, radio.dishRadius * 0.24, 0]}>
            <coneGeometry args={[radio.dishRadius * 0.3, radio.dishRadius * 0.3, 20, 1, true]} />
            <meshStandardMaterial color="#9fadb7" metalness={0.8} roughness={0.32} side={THREE.DoubleSide} />
          </mesh>
        </group>
        <mesh position={[0, 0.05, 0.03]}>
          <boxGeometry args={[0.1, 0.08, 0.08]} />
          <meshStandardMaterial color="#26323b" metalness={0.6} roughness={0.5} />
        </mesh>
      </group>}
  </group>
}

function BatteryCutaway({ batteryId, busId, onClick }: {
  batteryId: string
  busId: string
  onClick: ((event: { stopPropagation: () => void }) => void) | undefined
}) {
  const battery = getBatteryAppearance(batteryId)
  const t = batteryTransform(batteryId, busId)
  const bus = busTransform(busId)
  const [pw, ph, pd] = t.pack
  const accent = battery.accent
  const cellWidth = pw / 4.6
  return <group onClick={onClick} position={[t.explodeX, 0, 0]}>
    <mesh>
      <boxGeometry args={[pw, ph, pd]} />
      <meshStandardMaterial color="#2b3740" metalness={0.55} roughness={0.5} transparent opacity={0.22} depthWrite={false} />
    </mesh>
    <mesh>
      <boxGeometry args={[pw * 1.03, ph * 1.03, pd * 1.03]} />
      <meshBasicMaterial color={accent} wireframe transparent opacity={0.5} />
    </mesh>
    {Array.from({ length: 4 }, (_, index) => {
      const x = -pw / 2 + cellWidth * (index + 0.5) + 0.006
      return <mesh key={index} position={[x, 0, 0]}>
        <boxGeometry args={[cellWidth * 0.86, ph * 0.86, pd * 0.9]} />
        <meshStandardMaterial
          color={index % 2 === 0 ? '#3f4e58' : '#465661'}
          metalness={0.6}
          roughness={0.42}
          emissive={new THREE.Color(accent)}
          emissiveIntensity={index === 0 ? 0.34 : 0.1}
        />
      </mesh>
    })}
    {[-1, 1].map(side => (
      <mesh key={side} position={[0, side * ph * 0.56, 0]}>
        <boxGeometry args={[pw * 0.96, ph * 0.06, pd * 0.96]} />
        <meshStandardMaterial {...HULL.spoke} />
      </mesh>
    ))}
    <mesh position={[0, 0, pd / 2 + 0.012]}>
      <boxGeometry args={[pw * 0.7, ph * 0.16, 0.01]} />
      <meshStandardMaterial color={accent} emissive={new THREE.Color(accent)} emissiveIntensity={0.9} metalness={0.4} roughness={0.4} />
    </mesh>
    <mesh position={[0, ph * 0.3, -pd / 2 - 0.01]}>
      <boxGeometry args={[pw * 0.4, ph * 0.2, 0.012]} />
      <meshStandardMaterial color="#1c252c" metalness={0.5} roughness={0.55} />
    </mesh>
    {/* Retention rails connect the extracted pack to the bus bay. */}
    {[-1, 1].map(side => (
      <mesh key={`rail${side}`} position={[-t.explodeX / 2 + bus.half[0] / 2, side * ph * 0.34, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.009, 0.009, Math.max(0.05, t.explodeX - bus.half[0]), 8]} />
        <meshStandardMaterial {...HULL.spoke} metalness={0.9} roughness={0.28} />
      </mesh>
    ))}
    <mesh position={[-t.explodeX + bus.half[0] + 0.015, 0, 0]}>
      <boxGeometry args={[0.02, ph * 1.25, pd * 1.15]} />
      <meshStandardMaterial {...HULL.rail} />
    </mesh>
  </group>
}
