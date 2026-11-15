import { Component, Suspense, lazy, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import './scene.css'
import type { Locale, MissionConfiguration } from '../../engine/types'
import type { PartField } from '../mission-control/Spacecraft'
import CraftFallback from './CraftFallback'
import { resolveCraftAppearance, type CraftMode } from './appearance'

export interface CraftSceneProps {
  config: MissionConfiguration
  locale: Locale
  mode?: CraftMode
  selectedField?: PartField
  motion?: boolean
  angle?: number
  onInspect?: (field: PartField) => void
}

const CraftCanvas = lazy(() => import('./CraftCanvas'))

type RenderState = 'boot' | 'webgl' | 'svg'

function isSvgForced(): boolean {
  if (typeof window === 'undefined' || !window.location) return false
  try {
    return new URLSearchParams(window.location.search).get('renderer') === 'svg'
  } catch {
    return false
  }
}

/**
 * Conservative capability probe. Must not touch getContext where the WebGL
 * constructors are absent (jsdom / text browsers), so the fallback stays the
 * only path there.
 */
function supportsWebGL(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false
  const hasConstructor = typeof WebGLRenderingContext !== 'undefined'
    || typeof WebGL2RenderingContext !== 'undefined'
  if (!hasConstructor) return false
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    const supported = Boolean(context)
    context?.getExtension('WEBGL_lose_context')?.loseContext()
    return supported
  } catch {
    return false
  }
}

interface BoundaryProps {
  onFailure: (reason: string) => void
  children: ReactNode
}

interface BoundaryState {
  failed: boolean
}

class RenderBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false }

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true }
  }

  componentDidCatch(): void {
    this.props.onFailure('webgl-render-error')
  }

  render(): ReactNode {
    return this.state.failed ? null : this.props.children
  }
}

function sceneDescription(config: MissionConfiguration, locale: Locale, mode: CraftMode): string {
  const craft = resolveCraftAppearance(config)
  const installed = (['bus','payload','array','radio','battery'] as const).filter(key => config[`${key}Id`])
    .map(key => craft[key].label[locale]).join(', ')
  const setting = {
    hangar: {
      en: 'Industrial assembly bay with a work stand, overhead gantry lights and receding steel ribs.',
      ua: 'Промисловий складальний бокс із робочою підставкою, верхніми фермами та низкою сталевих ребер.',
    },
    menu: {
      en: 'Earth limb behind.',
      ua: 'Край Землі на тлі.',
    },
    launch: {
      en: 'Launch plume below.',
      ua: 'Струмінь носія внизу.',
    },
  }[mode]
  if (locale === 'ua') {
    return `${installed || 'Обладнання не встановлено'}. ${setting.ua}`
  }
  return `${installed || 'No installed hardware'}. ${setting.en}`
}

/**
 * Orbital preview: WebGL scene when the device supports it, the dynamic SVG
 * schematic otherwise (or when `?renderer=svg` is present). Inspectable DOM
 * slot buttons stay owned by the game chrome; this module never requires them.
 */
export default function CraftScene({
  config,
  locale,
  mode = 'hangar',
  selectedField,
  motion = false,
  angle = 28,
  onInspect,
}: CraftSceneProps) {
  const forced = useMemo(() => isSvgForced(), [])
  const [supported] = useState(() => !forced && supportsWebGL())
  const [state, setState] = useState<RenderState>(supported ? 'boot' : 'svg')
  const [failureReason, setFailureReason] = useState<string | null>(forced ? 'forced-svg' : null)
  const [pageHidden, setPageHidden] = useState(false)
  const [offscreen, setOffscreen] = useState(false)
  const sceneRef = useRef<HTMLDivElement>(null)
  const suspended = pageHidden || offscreen
  const renderer = state === 'webgl' ? 'webgl' : 'svg'
  const description = useMemo(() => sceneDescription(config, locale, mode), [config, locale, mode])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const update = () => setPageHidden(document.hidden)
    update()
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || !sceneRef.current) return
    const observer = new IntersectionObserver(([entry]) => setOffscreen(!entry?.isIntersecting))
    observer.observe(sceneRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (state !== 'boot' || suspended) return
    // A canvas that never signals readiness (rare driver stall) keeps the
    // schematic instead of an empty stage. Time spent in a hidden tab does not
    // count, since animation frames are paused there.
    const timer = window.setTimeout(() => {
      setState(current => current === 'boot' ? 'svg' : current)
      setFailureReason(current => current ?? 'webgl-timeout')
    }, 4500)
    return () => window.clearTimeout(timer)
  }, [state, suspended])

  const fail = (reason: string) => {
    setState('svg')
    setFailureReason(reason)
  }

  // The canvas keeps a single, keyed slot from `boot` through `webgl`. Moving
  // it between child positions remounts <Canvas>, which re-creates the WebGL
  // context right after the first `onReady` and can leave the stage empty.
  const canvas = <div className="craft-scene__webgl" key="webgl">
    <RenderBoundary onFailure={fail}>
      <Suspense fallback={null}>
        <CraftCanvas
          config={config}
          locale={locale}
          mode={mode}
          selectedField={selectedField}
          motion={motion}
          angle={angle}
          onInspect={onInspect}
          suspended={suspended}
          onReady={() => setState(current => current === 'boot' ? 'webgl' : current)}
          onFailure={fail}
        />
      </Suspense>
    </RenderBoundary>
  </div>

  return <div
    ref={sceneRef}
    className="craft-scene"
    data-renderer={renderer}
    data-mode={mode}
    data-motion={motion && !suspended ? 'on' : 'off'}
    data-bus-id={config.busId}
    data-array-id={config.arrayId}
    data-battery-id={config.batteryId}
    data-radio-id={config.radioId}
    data-payload-id={config.payloadId}
    data-installed-count={[config.busId,config.arrayId,config.batteryId,config.radioId,config.payloadId].filter(Boolean).length}
    {...(failureReason ? { 'data-fallback-reason': failureReason } : {})}
  >
    <div
      className="craft-scene__stage"
      {...(renderer === 'webgl' ? { role: 'img' as const, 'aria-label': description } : {})}
    >
      {state !== 'svg' && canvas}
      {state !== 'webgl' && <CraftFallback
        config={config}
        locale={locale}
        mode={mode}
        selectedField={selectedField}
        reason={state === 'boot' ? null : failureReason}
        angle={angle}
      />}
    </div>
  </div>
}
