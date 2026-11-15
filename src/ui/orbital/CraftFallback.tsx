import { useId } from 'react'
import type { Locale, MissionConfiguration } from '../../engine/types'
import type { PartField } from '../mission-control/Spacecraft'
import {
  EARTH_SCHEMATIC, MODE_WORD, STARFIELD,
  arrayTransform, batteryTransform, busTransform, payloadTransform,
  resolveCraftAppearance, type CraftMode,
} from './appearance'

export interface CraftFallbackProps {
  config: MissionConfiguration
  locale: Locale
  mode: CraftMode
  selectedField: PartField | undefined
  reason: string | null
  angle?: number
}

const VIEW_W = 1000
const VIEW_H = 470
const SCALE = 96

const BAY_TONES = {
  wallTop: '#131b22',
  wallLow: '#1d262e',
  floorNear: '#20272d',
  floorFar: '#151c22',
  ribNear: '#3c4852',
  ribMid: '#333d46',
  ribFar: '#2a333b',
  amber: '#ffc684',
  cool: '#8fb6d6',
} as const

/**
 * Shared dynamic schematic used as the lazy/WebGL failure path. No interaction.
 * In hangar mode the backdrop is an original assembly bay; menu/launch keep the
 * orbital backdrop. Equipment swaps, the 28° angle and the cut-away all stay.
 */
export default function CraftFallback({ config, locale, mode, selectedField, reason, angle = 28 }: CraftFallbackProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const craft = resolveCraftAppearance(config)
  const bus = craft.bus
  const array = craft.array
  const payload = craft.payload
  const radio = craft.radio
  const busT = busTransform(config.busId)
  const arrayT = arrayTransform(config.arrayId, config.busId)
  const payloadT = payloadTransform(config.payloadId, config.busId)
  const batteryT = batteryTransform(config.batteryId, config.busId)
  const cutaway = !!config.batteryId && selectedField === 'batteryId'
  const hangar = mode === 'hangar'

  const w = busT.size[0] * SCALE
  const h = busT.size[1] * SCALE
  const d = busT.size[2] * SCALE
  const dx = d * 0.52
  const dy = -d * 0.34
  const cx = mode === 'menu' ? 672 : 512
  const cy = mode === 'launch' ? 182 : 205
  const frontX = cx - w / 2
  const frontY = cy - h / 2
  const wingY = cy + h * 0.1
  const topCenterX = frontX + w / 2 + dx / 2

  const yokePx = arrayT.yoke * SCALE
  const spanPx = arrayT.span * SCALE
  const chordPx = arrayT.chord * SCALE
  const skew = chordPx * 0.3
  const barrelW = payloadT.barrelRadius * 2 * SCALE
  const barrelH = payloadT.barrelLength * SCALE
  const barrelX = topCenterX - barrelW / 2
  const barrelTop = frontY + dy / 2 - barrelH - 4

  const packW = batteryT.pack[0] * SCALE
  const packH = batteryT.pack[1] * SCALE
  const packD = batteryT.pack[2] * SCALE
  const packX = frontX + w + dx * 0.45 + 24
  const packY = frontY + h / 2 - packH / 2

  // ---- Hangar bay composition -------------------------------------------
  const craftBottom = frontY + h
  const contentLeft = hangar
    ? (arrayT.mount === 'deploy'
      ? frontX + dx * 0.15 - yokePx - spanPx - 26
      : frontX - Math.abs(dy) * 0.25 - 16)
    : 0
  const contentRight = hangar
    ? (arrayT.mount === 'deploy'
      ? frontX + w + dx * 0.25 + yokePx + spanPx + 26
      : frontX + w + dx + 16)
    : VIEW_W
  const antennaTop = frontY + dy * 0.3 - radio.mast * SCALE
    - (radio.antenna === 'whip' ? 18 : radio.dishRadius * SCALE + 20)
  const contentTop = Math.min(barrelTop - 34, antennaTop, frontY + dy - 20)
  const floorY = craftBottom + 92
  const standTop = craftBottom + 38
  const bayW = Math.max(contentRight - contentLeft + 120, 420)
  const bayH = Math.max((floorY + 122) - (contentTop - 72), bayW / 1.6)
  const bayX = (contentLeft + contentRight) / 2 - bayW / 2
  const bayY = contentTop - 72

  const cutawayView = { x: frontX - 25, y: barrelTop - 35, w: 300, h: 280 }
  const fleetView = { x: 180, y: 0, w: 720, h: 400 }
  const hangarView = cutaway ? cutawayView : { x: bayX, y: bayY, w: bayW, h: bayH }
  const view = hangar ? hangarView : (mode === 'menu' ? { x: 0, y: 0, w: VIEW_W, h: VIEW_H } : fleetView)
  const viewBox = `${view.x} ${view.y} ${view.w} ${view.h}`

  const bayLeft = view.x
  const bayTop = view.y
  const bayRight = view.x + view.w
  const bayBottom = view.y + view.h
  const bayCenter = (bayLeft + bayRight) / 2
  const bayFloor = cutaway ? bayBottom : floorY
  const ribCount = cutaway ? 1 : 3

  const installedDescription = (['bus','payload','array','radio','battery'] as const).filter(key => config[`${key}Id`]).map(key => craft[key].label[locale]).join(', ')

  const halo = (field: PartField) => config[field] && selectedField === field ? bus.accent : null

  const wing = (side: 1 | -1) => {
    if (!config.arrayId || arrayT.mount !== 'deploy') return null
    const x0 = side === 1
      ? frontX + w + dx * 0.25 + yokePx
      : frontX + dx * 0.15 - yokePx - spanPx
    const points = `${x0},${wingY} ${x0 + spanPx},${wingY - skew} ${x0 + spanPx},${wingY - skew + chordPx} ${x0},${wingY + chordPx}`
    const rootX = side === 1 ? frontX + w + dx * 0.2 : frontX + dx * 0.1
    return <g key={side}>
      <line x1={rootX} y1={wingY} x2={side === 1 ? x0 : x0 + spanPx} y2={wingY - skew / 2} stroke="#aab7bd" strokeWidth="3" />
      <polygon points={points} fill={`url(#${uid}-cells)`} stroke={array.accent} strokeWidth="2" />
      {Array.from({ length: Math.max(0, arrayT.segments - 1) }, (_, index) => {
        const fraction = (index + 1) / arrayT.segments
        const lineX = x0 + spanPx * fraction
        return <line key={index} x1={lineX} y1={wingY - skew * fraction} x2={lineX} y2={wingY - skew * fraction + chordPx} stroke="#0d1a22" strokeWidth="2.5" />
      })}
      <rect x={side === 1 ? x0 + spanPx - 4 : x0} y={wingY - skew} width="4" height={chordPx} fill={array.accent} />
    </g>
  }

  const antenna = () => {
    const baseX = frontX + w * 0.18 + dx * 0.3
    const baseY = frontY + dy * 0.3
    const mastPx = radio.mast * SCALE
    const topY = baseY - mastPx
    if (radio.antenna === 'whip') {
      return <g>
        <line x1={baseX} y1={baseY} x2={baseX} y2={topY} stroke="#cfd8dc" strokeWidth="2.5" />
        <circle cx={baseX} cy={topY} r="2.6" fill={radio.accent} />
        {Array.from({ length: radio.coils }, (_, index) => (
          <ellipse key={index} cx={baseX} cy={baseY - 8 - index * 5} rx="5" ry="2.4" fill="none" stroke={radio.accent} strokeWidth="1.2" />
        ))}
      </g>
    }
    const radius = radio.dishRadius * SCALE
    return <g>
      <line x1={baseX} y1={baseY} x2={baseX} y2={topY} stroke="#cfd8dc" strokeWidth="2.5" />
      <ellipse cx={baseX} cy={topY} rx={radius} ry={radius * 0.4} fill="#dde7ea" stroke="#7e939e" strokeWidth="1.4" />
      <ellipse cx={baseX} cy={topY - 4} rx={radius * 0.7} ry={radius * 0.26} fill="none" stroke={radio.accent} strokeWidth="1.2" />
      <line x1={baseX} y1={topY} x2={baseX} y2={topY - 12} stroke={radio.accent} strokeWidth="2" />
      <circle cx={baseX} cy={topY - 13} r="2.2" fill={radio.accent} />
    </g>
  }

  /** Original assembly-bay backdrop, composed from the viewBox bounds. */
  const bay = () => {
    const horizon = bayFloor
    const floorDepth = bayBottom - horizon
    const spines = Array.from({ length: ribCount }, (_, index) => {
      const scale = 1 - index * 0.19
      const baseY = horizon - index * bayFloor * 0.005
      const topY = horizon - (horizon - bayTop) * (0.86 - index * 0.04) * scale
      const halfW = (bayRight - bayLeft) * 0.47 * scale
      const corner = 34 * scale
      const stroke = [BAY_TONES.ribNear, BAY_TONES.ribMid, BAY_TONES.ribFar][index] ?? BAY_TONES.ribFar
      const opacity = 0.92 - index * 0.16
      return { index, baseY, topY, halfW, corner, stroke, opacity, scale }
    })

    return <g data-bay>
      <rect x={bayLeft} y={bayTop} width={bayRight - bayLeft} height={bayBottom - bayTop} fill={`url(#${uid}-bayAir)`} />
      <rect x={bayLeft} y={bayTop} width={bayRight - bayLeft} height={Math.max(0, horizon - bayTop)} fill={`url(#${uid}-bayWall)`} />

      {/* Wall panel seams, very low contrast. */}
      {Array.from({ length: 7 }, (_, index) => {
        const x = bayLeft + ((bayRight - bayLeft) * (index + 1)) / 8
        return <line key={`panel${index}`} x1={x} y1={bayTop + 12} x2={x} y2={horizon - 6} stroke="#0e161c" strokeWidth="3" opacity="0.55" />
      })}
      {[0.34, 0.62].map(fraction => (
        <line key={fraction} x1={bayLeft} y1={bayTop + (horizon - bayTop) * fraction} x2={bayRight} y2={bayTop + (horizon - bayTop) * fraction} stroke="#0e161c" strokeWidth="2" opacity="0.4" />
      ))}

      {/* Warm wall washes well away from the craft, plus one cool fill. */}
      {[0.12, 0.88].map(fraction => (
        <rect
          key={fraction}
          x={bayLeft + (bayRight - bayLeft) * fraction - 5}
          y={bayTop + (horizon - bayTop) * 0.2}
          width="10"
          height={(horizon - bayTop) * 0.58}
          fill={BAY_TONES.amber}
          opacity="0.13"
        />
      ))}
      <ellipse
        cx={bayLeft + (bayRight - bayLeft) * 0.38}
        cy={bayTop + (horizon - bayTop) * 0.16}
        rx={(bayRight - bayLeft) * 0.2}
        ry={(horizon - bayTop) * 0.34}
        fill={`url(#${uid}-cool)`}
        opacity="0.5"
      />

      {/* Receding portals, far to near. */}
      {spines.slice().reverse().map(spine => (
        <g key={`rib${spine.index}`} opacity={spine.opacity}>
          <path
            d={`M ${bayCenter - spine.halfW} ${spine.baseY} L ${bayCenter - spine.halfW} ${spine.topY + spine.corner} L ${bayCenter - spine.halfW + spine.corner} ${spine.topY} L ${bayCenter + spine.halfW - spine.corner} ${spine.topY} L ${bayCenter + spine.halfW} ${spine.topY + spine.corner} L ${bayCenter + spine.halfW} ${spine.baseY}`}
            fill="none"
            stroke={spine.stroke}
            strokeWidth={16 - spine.index * 3}
            strokeLinejoin="round"
          />
          <path
            d={`M ${bayCenter - spine.halfW + 13} ${spine.baseY} L ${bayCenter - spine.halfW + 13} ${spine.topY + spine.corner + 6} L ${bayCenter - spine.halfW + spine.corner + 8} ${spine.topY + 13} L ${bayCenter + spine.halfW - spine.corner - 8} ${spine.topY + 13} L ${bayCenter + spine.halfW - 13} ${spine.topY + spine.corner + 6} L ${bayCenter + spine.halfW - 13} ${spine.baseY}`}
            fill="none"
            stroke="#5a6771"
            strokeWidth="2"
            opacity="0.4"
          />
          {/* Practical fixture hung from each portal. */}
          <ellipse cx={bayCenter} cy={spine.topY + 30} rx={58 * spine.scale} ry={16 * spine.scale} fill={`url(#${uid}-warm)`} opacity="0.7" />
          <rect x={bayCenter - 26 * spine.scale} y={spine.topY + 24} width={52 * spine.scale} height="6" rx="2" fill="#ffe0b4" opacity="0.85" />
          {/* Hairline rib strip light. */}
          <line x1={bayCenter - spine.halfW + 5} y1={spine.baseY - 12} x2={bayCenter - spine.halfW + 5} y2={spine.topY + spine.corner + 30} stroke={BAY_TONES.amber} strokeWidth="2.5" opacity="0.28" />
          <line x1={bayCenter + spine.halfW - 5} y1={spine.baseY - 12} x2={bayCenter + spine.halfW - 5} y2={spine.topY + spine.corner + 30} stroke={BAY_TONES.amber} strokeWidth="2.5" opacity="0.28" />
          <rect x={bayCenter - spine.halfW - 12} y={spine.baseY - 10} width="24" height="12" fill={spine.stroke} opacity="0.9" />
          <rect x={bayCenter + spine.halfW - 12} y={spine.baseY - 10} width="24" height="12" fill={spine.stroke} opacity="0.9" />
        </g>
      ))}

      {!cutaway && <>
        <polygon
          points={`${bayLeft},${horizon} ${bayRight},${horizon} ${bayRight},${bayBottom} ${bayLeft},${bayBottom}`}
          fill={`url(#${uid}-bayFloor)`}
        />
        <line x1={bayLeft} y1={horizon} x2={bayRight} y2={horizon} stroke="#0c1319" strokeWidth="4" opacity="0.9" />
        {/* Floor seams converge toward the vanishing point, giving depth. */}
        {Array.from({ length: 13 }, (_, index) => {
          const spread = (index - 6) / 6
          const xBottom = bayCenter + spread * (bayRight - bayLeft) * 0.5
          const xHorizon = bayCenter + spread * (bayRight - bayLeft) * 0.045
          return <line key={`seam${index}`} x1={xBottom} y1={bayBottom} x2={xHorizon} y2={horizon} stroke="#111920" strokeWidth="2" opacity="0.55" />
        })}
        {[10, 24, 46, 80, 126, 184].map((offset, index) => (
          offset < floorDepth
            ? <line key={`cross${index}`} x1={bayLeft} y1={horizon + offset} x2={bayRight} y2={horizon + offset} stroke="#111920" strokeWidth="1.6" opacity={0.36 - index * 0.04} />
            : null
        ))}
        <ellipse cx={bayCenter} cy={horizon + 18} rx={(bayRight - bayLeft) * 0.28} ry="24" fill="none" stroke="#5b6872" strokeWidth="2" opacity="0.45" />
        <ellipse cx={bayCenter} cy={horizon + 18} rx={(bayRight - bayLeft) * 0.17} ry="15" fill="none" stroke={BAY_TONES.amber} strokeWidth="1.6" opacity="0.22" />

        {/* Understated work stand and gantry, sized to the craft above. */}
        <g>
          <rect x={bayCenter - 150} y={standTop} width="300" height="16" rx="3" fill="#3a444d" stroke="#5b6872" strokeWidth="1.5" />
          <rect x={bayCenter - 126} y={standTop + 3} width="252" height="6" fill="#4b5761" />
          <rect x={bayCenter - 120} y={standTop + 16} width="14" height={Math.max(0, horizon - standTop - 16)} fill="#2f3941" />
          <rect x={bayCenter + 106} y={standTop + 16} width="14" height={Math.max(0, horizon - standTop - 16)} fill="#2f3941" />
          <rect x={bayCenter - 130} y={standTop + 13} width="260" height="3" fill={BAY_TONES.amber} opacity="0.8" />
          <rect x={bayCenter - 40} y={standTop - 9} width="36" height="9" rx="2" fill="#4d5860" />
          <rect x={bayCenter + 4} y={standTop - 9} width="36" height="9" rx="2" fill="#4d5860" />
          <rect x={bayCenter - 150} y={standTop - 2} width="8" height="18" fill="#586570" opacity="0.8" />
          <rect x={bayCenter + 142} y={standTop - 2} width="8" height="18" fill="#586570" opacity="0.8" />
        </g>
        <g opacity="0.9">
          <line x1={bayCenter - bayW * 0.36} y1={spines[0] ? spines[0].topY + 34 : bayTop + 120} x2={bayCenter - bayW * 0.36} y2={standTop - 30} stroke="#39434c" strokeWidth="7" />
          <line x1={bayCenter - bayW * 0.36} y1={spines[0] ? spines[0].topY + 40 : bayTop + 120} x2={bayCenter - 80} y2={spines[0] ? spines[0].topY + 40 : bayTop + 120} stroke="#39434c" strokeWidth="6" />
          <line x1={bayCenter - 80} y1={spines[0] ? spines[0].topY + 42 : bayTop + 120} x2={bayCenter - 80} y2={standTop - 46} stroke="#8b98a2" strokeWidth="2" opacity="0.75" />
          <rect x={bayCenter - 88} y={standTop - 54} width="16" height="10" rx="2" fill="#6d7a84" />
        </g>
        <rect x={bayLeft} y={bayBottom - 92} width={bayRight - bayLeft} height="92" fill={`url(#${uid}-bayFore)`} />
      </>}
      {cutaway && <rect x={bayLeft} y={bayBottom - 60} width={bayRight - bayLeft} height="60" fill={`url(#${uid}-bayFore)`} />}
      <rect x={bayLeft} y={bayTop} width={bayRight - bayLeft} height={bayBottom - bayTop} fill={`url(#${uid}-bayVignette)`} />
    </g>
  }

  return <div className="craft-fallback" data-renderer="svg" data-mode={mode} {...(reason ? { 'data-fallback-reason': reason } : {})}>
    <svg viewBox={viewBox} role="img" aria-label={`${installedDescription || (locale === 'en' ? 'No installed hardware' : 'Обладнання не встановлено')}. ${locale === 'en' ? 'Illustrative assembly view' : 'Ілюстративний вигляд складання'}`}>
      <defs>
        <radialGradient id={`${uid}-sky`} cx="35%" cy="18%" r="90%">
          <stop offset="0%" stopColor="#173c58" />
          <stop offset="58%" stopColor="#0a2035" />
          <stop offset="100%" stopColor="#030b14" />
        </radialGradient>
        <linearGradient id={`${uid}-ocean`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a6690" />
          <stop offset="62%" stopColor="#0d4266" />
          <stop offset="100%" stopColor="#062033" />
        </linearGradient>
        <radialGradient id={`${uid}-shade`} cx="28%" cy="26%" r="88%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="72%" stopColor="#04121f" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#020a12" stopOpacity="0.75" />
        </radialGradient>
        <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eef2f3" />
          <stop offset="42%" stopColor="#b8c3c9" />
          <stop offset="100%" stopColor="#6f7f8a" />
        </linearGradient>
        <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4d79a" />
          <stop offset="55%" stopColor="#d9a441" />
          <stop offset="100%" stopColor="#8d5f1f" />
        </linearGradient>
        <linearGradient id={`${uid}-plume`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff3c4" />
          <stop offset="45%" stopColor="#f2a23e" />
          <stop offset="100%" stopColor="#a63a12" stopOpacity="0" />
        </linearGradient>
        <pattern id={`${uid}-cells`} width="8" height="7" patternUnits="userSpaceOnUse">
          <rect width="8" height="7" fill="#123049" />
          <rect x="0.7" y="0.7" width="6.6" height="5.6" fill="#1d4a68" stroke="#6d9db6" strokeWidth="0.5" />
        </pattern>
        <clipPath id={`${uid}-earth`}><circle cx="182" cy="428" r="338" /></clipPath>
        <filter id={`${uid}-blur`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="11" />
        </filter>

        {/* Assembly bay: air, wall, floor, practical glow, vignette. */}
        <linearGradient id={`${uid}-bayAir`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a1015" />
          <stop offset="60%" stopColor="#111920" />
          <stop offset="100%" stopColor="#090e13" />
        </linearGradient>
        <linearGradient id={`${uid}-bayWall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BAY_TONES.wallTop} />
          <stop offset="58%" stopColor="#19222a" />
          <stop offset="100%" stopColor={BAY_TONES.wallLow} />
        </linearGradient>
        <linearGradient id={`${uid}-bayFloor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BAY_TONES.floorFar} />
          <stop offset="38%" stopColor="#1c242b" />
          <stop offset="100%" stopColor={BAY_TONES.floorNear} />
        </linearGradient>
        <radialGradient id={`${uid}-warm`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd9a6" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#e8a761" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#8c5b26" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-bayVignette`} cx="50%" cy="46%" r="76%">
          <stop offset="55%" stopColor="#04080c" stopOpacity="0" />
          <stop offset="100%" stopColor="#04080c" stopOpacity="0.5" />
        </radialGradient>
        <linearGradient id={`${uid}-bayFore`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#060b10" stopOpacity="0" />
          <stop offset="100%" stopColor="#060b10" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {hangar ? bay() : <>
        <rect width={VIEW_W} height={VIEW_H} fill={`url(#${uid}-sky)`} />
        {Array.from({ length: 1 }, () => null)}
        {STARFIELD.map((star, index) => (
          <circle key={index} cx={star.x * VIEW_W} cy={star.y * VIEW_H * 0.92} r={star.r} fill="#e8f1ff" opacity={star.a} />
        ))}

        <g clipPath={`url(#${uid}-earth)`}>
          <circle cx="182" cy="428" r="338" fill={`url(#${uid}-ocean)`} />
          <g transform={`translate(${182 - 500 * 0.7} ${428 - 250 * 0.7}) scale(0.7)`}>
            {EARTH_SCHEMATIC.land.map((path, index) => (
              <path key={`l${index}`} d={path} fill="#8ea67e" stroke="#e8e1c4" strokeWidth="2" opacity="0.94" />
            ))}
            {EARTH_SCHEMATIC.islands.map((path, index) => (
              <path key={`i${index}`} d={path} fill="#8ea67e" stroke="#e8e1c4" strokeWidth="1.6" opacity="0.9" />
            ))}
            {[60, 125, 190, 255, 320, 385, 450].map(y => (
              <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="#dff2ff" strokeWidth="1" opacity="0.07" />
            ))}
            {[125, 250, 375, 500, 625, 750, 875].map(x => (
              <line key={x} x1={x} y1="0" x2={x} y2="500" stroke="#dff2ff" strokeWidth="1" opacity="0.06" />
            ))}
          </g>
          <circle cx="182" cy="428" r="338" fill={`url(#${uid}-shade)`} />
        </g>
        <circle cx="182" cy="428" r="346" fill="none" stroke="#5aa9e8" strokeWidth="26" opacity="0.4" filter={`url(#${uid}-blur)`} />
        <circle cx="182" cy="428" r="340" fill="none" stroke="#8ed2ff" strokeWidth="2.5" opacity="0.5" />
      </>}

      <g data-craft transform={`translate(${cx} ${cy}) rotate(${(angle - 28) / 4}) translate(${-cx} ${-cy})`}>
      {wing(-1)}
      {wing(1)}

      {config.busId && <g data-hardware={config.busId} opacity={cutaway ? 0.26 : 1}>
        <polygon points={`${frontX},${frontY} ${frontX + dx},${frontY + dy} ${frontX + dx + w},${frontY + dy} ${frontX + w},${frontY}`} fill="#d9e1e5" stroke="#7e919c" strokeWidth="1.5" />
        <polygon points={`${frontX + w},${frontY} ${frontX + w + dx},${frontY + dy} ${frontX + w + dx},${frontY + dy + h} ${frontX + w},${frontY + h}`} fill="#5d6d78" stroke="#7e919c" strokeWidth="1.5" />
        <rect x={frontX} y={frontY} width={w} height={h} fill={`url(#${uid}-metal)`} stroke="#6d7f89" strokeWidth="2" />
        {bus.goldFoil && <rect x={frontX + 4} y={frontY + h - 13} width={w - 8} height="8" fill={`url(#${uid}-gold)`} opacity="0.9" />}
        {Array.from({ length: bus.radiatorCells }, (_, index) => (
          <line key={index} x1={frontX + w + dx * 0.35 + index * (dx * 0.55 / bus.radiatorCells)} y1={frontY + dy + 8} x2={frontX + w + dx * 0.35 + index * (dx * 0.55 / bus.radiatorCells)} y2={frontY + dy + h - 8} stroke="#eef3f4" strokeWidth="3" opacity="0.75" />
        ))}
        {Array.from({ length: bus.bands }, (_, index) => (
          <line key={index} x1={frontX + 2} y1={frontY + (h / (bus.bands + 1)) * (index + 1)} x2={frontX + w - 2} y2={frontY + (h / (bus.bands + 1)) * (index + 1)} stroke="#475862" strokeWidth="1.6" opacity="0.65" />
        ))}
        {config.arrayId && arrayT.mount === 'body' && <g>
          <rect x={frontX + 6} y={frontY + 8} width={w * 0.42} height={h * 0.6} fill={`url(#${uid}-cells)`} stroke={array.accent} strokeWidth="1.5" />
          <rect x={frontX + w * 0.55} y={frontY + 8} width={w * 0.37} height={h * 0.6} fill={`url(#${uid}-cells)`} stroke={array.accent} strokeWidth="1.5" />
        </g>}
        <circle cx={frontX + w - 9} cy={frontY + 10} r="3.2" fill={bus.accent} />
      </g>}
      {config.arrayId && !config.busId && arrayT.mount === 'body' && <rect data-hardware={config.arrayId} x={frontX} y={frontY} width={w} height={h} fill={`url(#${uid}-cells)`} />}

      {config.payloadId && (payload.optics === 'relay'
        ? <g>
          <rect x={topCenterX - (payload.buffer?.[0] ?? 0.4) * SCALE / 2} y={barrelTop + 6} width={(payload.buffer?.[0] ?? 0.4) * SCALE} height={(payload.buffer?.[1] ?? 0.3) * SCALE} rx="3" fill="#26343e" stroke={payload.accent} strokeWidth="2" />
          <rect x={topCenterX - 8} y={barrelTop + 12} width="16" height="6" rx="1" fill={`url(#${uid}-gold)`} />
          <circle cx={topCenterX + 12} cy={barrelTop + 20} r="2.4" fill={payload.accent} />
          <circle cx={topCenterX + 12} cy={barrelTop + 28} r="2.4" fill="#7fd2b8" />
        </g>
        : <g data-hardware={config.payloadId}>
          <rect x={barrelX - 4} y={frontY + dy / 2 - 5} width={barrelW + 8} height="9" rx="2" fill="#8f9ba3" />
          <rect x={barrelX} y={barrelTop} width={barrelW} height={barrelH + 8} rx={barrelW * 0.18} fill="#333f48" stroke="#a4b2ba" strokeWidth="1.6" />
          <ellipse cx={topCenterX} cy={barrelTop} rx={barrelW / 2} ry={barrelW * 0.16} fill={payload.lensTone} stroke="#dbe6ea" strokeWidth="1.4" />
          {Array.from({ length: payloadT.rings }, (_, index) => (
            <line key={index} x1={barrelX} y1={barrelTop + 8 + (barrelH / (payloadT.rings + 1)) * (index + 1)} x2={barrelX + barrelW} y2={barrelTop + 8 + (barrelH / (payloadT.rings + 1)) * (index + 1)} stroke="#8fa3ad" strokeWidth="2.2" />
          ))}
          {payload.optics === 'thermal' && [0, 1, 2].map(index => (
            <line key={index} x1={barrelX - 10} y1={barrelTop + 12 + index * 9} x2={barrelX - 2} y2={barrelTop + 12 + index * 9} stroke="#d9e2e6" strokeWidth="2" />
          ))}
          <text x={topCenterX} y={barrelTop - 10} fill={payload.accent} fontSize="11" textAnchor="middle" fontFamily="ui-monospace, monospace">{payload.short}</text>
        </g>)}

      {config.radioId && <g data-hardware={config.radioId}>{antenna()}</g>}

      {config.batteryId && (cutaway || !config.busId) && <g data-hardware={config.batteryId}>
        <rect x={packX - 5} y={packY - 5} width={packW + 10} height={packH + packD * 0.2 + 10} rx="3" fill="none" stroke={bus.accent} strokeWidth="1.5" strokeDasharray="7 5" />
        <line x1={frontX + w + 4} y1={packY + packH / 2} x2={packX} y2={packY + packH / 2} stroke={bus.accent} strokeWidth="2" strokeDasharray="5 4" />
        <polygon points={`${packX},${packY} ${packX + packD * 0.22},${packY - packD * 0.14} ${packX + packW + packD * 0.22},${packY - packD * 0.14} ${packX + packW},${packY}`} fill="#7f8f99" stroke="#c6d2d8" strokeWidth="1" />
        <rect x={packX} y={packY} width={packW} height={packH} fill="#2c3a44" stroke="#c6d2d8" strokeWidth="1.6" />
        {[0, 1, 2].map(index => (
          <rect key={index} x={packX + 3} y={packY + 4 + index * (packH / 3.4)} width={packW - 6} height={packH / 4.6} fill={bus.accent} opacity={0.55 - index * 0.08} />
        ))}
        <text x={packX + packW / 2} y={packY + packH + 16} fill={bus.accent} fontSize="11" textAnchor="middle" fontFamily="ui-monospace, monospace">{batteryT.nominalWh} Wh</text>
        <text x={packX + packW / 2} y={packY - packD * 0.14 - 7} fill="#d9ecf4" fontSize="10" textAnchor="middle" fontFamily="ui-monospace, monospace">{locale === 'en' ? 'CUTAWAY' : 'РОЗРІЗ'}</text>
      </g>}

      {halo('busId') && <rect x={frontX - 5} y={frontY - 5} width={w + dx + 10} height={h - dy + 10} rx="5" fill="none" stroke={bus.accent} strokeWidth="1.8" strokeDasharray="6 5" />}
      {halo('arrayId') && <rect x={frontX - (arrayT.mount === 'deploy' ? yokePx + spanPx + 8 : 8)} y={arrayT.mount === 'deploy' ? wingY - skew - 10 : frontY + 6} width={w + (arrayT.mount === 'deploy' ? 2 * (yokePx + spanPx) + 16 + dx : -8)} height={arrayT.mount === 'deploy' ? chordPx + 26 : h * 0.66} rx="4" fill="none" stroke={array.accent} strokeWidth="1.8" strokeDasharray="6 5" />}
      {halo('payloadId') && <rect x={barrelX - 10} y={barrelTop - 22} width={barrelW + 20} height={barrelH + 38} rx="4" fill="none" stroke={payload.accent} strokeWidth="1.8" strokeDasharray="6 5" />}
      {halo('radioId') && <circle cx={frontX + w * 0.18 + dx * 0.3} cy={frontY + dy * 0.3 - radio.mast * SCALE} r={(radio.antenna === 'whip' ? 16 : radio.dishRadius * SCALE + 12)} fill="none" stroke={radio.accent} strokeWidth="1.8" strokeDasharray="6 5" />}
      {selectedField && ['groundId', 'orbitId', 'launcherId'].includes(selectedField) && <text x={view.x + 24} y={view.y + view.h - 44} fill="#c7dbe6" fontSize="11" fontFamily="ui-monospace, monospace">{locale === 'en' ? 'EXTERNAL SELECTION · NOT ON CRAFT' : 'ЗОВНІШНІЙ ВИБІР · НЕ НА АПАРАТІ'}</text>}
      </g>

      {mode === 'launch' && <text x="24" y="32" fill="#f8bc74" fontSize="13" letterSpacing="2" fontFamily="ui-monospace, monospace">{MODE_WORD[mode][locale]}</text>}
      {craft.unknownIds.length > 0 && <text x="24" y="66" fill="#f0a24b" fontSize="10" letterSpacing="1" fontFamily="ui-monospace, monospace">{locale === 'en' ? 'UNKNOWN ID FALLBACK' : 'НЕВІДОМИЙ ID'}</text>}
      <text x={view.x + view.w - 24} y={view.y + view.h - 18} fill="#9fb6c4" fontSize="10" letterSpacing="1.6" textAnchor="end" fontFamily="ui-monospace, monospace">{locale === 'en' ? 'SCHEMATIC · NOT TO SCALE' : 'СХЕМА · НЕ В МАСШТАБІ'}</text>
    </svg>
  </div>
}
