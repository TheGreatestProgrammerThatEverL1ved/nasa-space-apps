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

/** Shared dynamic schematic used as the lazy/WebGL failure path. No interaction. */
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
  const cutaway = selectedField === 'batteryId'

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

  const description = locale === 'en'
    ? `Schematic spacecraft: ${bus.label.en}, ${payload.label.en}, ${array.label.en}, ${radio.label.en}, ${craft.battery.nominalWh} Wh battery. Earth limb background. Not to scale.`
    : `Схематичний апарат: ${bus.label.ua}, ${payload.label.ua}, ${array.label.ua}, ${radio.label.ua}, батарея ${craft.battery.nominalWh} Вт·год. Фон — край Землі. Не в масштабі.`

  const halo = (field: PartField) => selectedField === field ? bus.accent : null

  const wing = (side: 1 | -1) => {
    if (arrayT.mount !== 'deploy') return null
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

  return <div className="craft-fallback" data-renderer="svg" data-mode={mode} {...(reason ? { 'data-fallback-reason': reason } : {})}>
    <svg viewBox={mode === 'hangar' ? (cutaway ? `${frontX - 25} ${barrelTop - 35} 300 280` : '180 0 720 400') : `0 0 ${VIEW_W} ${VIEW_H}`} role="img" aria-label={description}>
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
      </defs>

      <rect width={VIEW_W} height={VIEW_H} fill={`url(#${uid}-sky)`} />
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


      <g data-craft transform={`translate(${cx} ${cy}) rotate(${(angle - 28) / 4}) translate(${-cx} ${-cy})`}>
      {wing(-1)}
      {wing(1)}

      <g opacity={cutaway ? 0.26 : 1}>
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
        {arrayT.mount === 'body' && <g>
          <rect x={frontX + 6} y={frontY + 8} width={w * 0.42} height={h * 0.6} fill={`url(#${uid}-cells)`} stroke={array.accent} strokeWidth="1.5" />
          <rect x={frontX + w * 0.55} y={frontY + 8} width={w * 0.37} height={h * 0.6} fill={`url(#${uid}-cells)`} stroke={array.accent} strokeWidth="1.5" />
        </g>}
        <circle cx={frontX + w - 9} cy={frontY + 10} r="3.2" fill={bus.accent} />
      </g>

      {payload.optics === 'relay'
        ? <g>
          <rect x={topCenterX - (payload.buffer?.[0] ?? 0.4) * SCALE / 2} y={barrelTop + 6} width={(payload.buffer?.[0] ?? 0.4) * SCALE} height={(payload.buffer?.[1] ?? 0.3) * SCALE} rx="3" fill="#26343e" stroke={payload.accent} strokeWidth="2" />
          <rect x={topCenterX - 8} y={barrelTop + 12} width="16" height="6" rx="1" fill={`url(#${uid}-gold)`} />
          <circle cx={topCenterX + 12} cy={barrelTop + 20} r="2.4" fill={payload.accent} />
          <circle cx={topCenterX + 12} cy={barrelTop + 28} r="2.4" fill="#7fd2b8" />
        </g>
        : <g>
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
        </g>}

      {antenna()}

      {cutaway && <g>
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
      {selectedField && ['groundId', 'orbitId', 'launcherId'].includes(selectedField) && <text x="24" y={VIEW_H - 44} fill="#c7dbe6" fontSize="11" fontFamily="ui-monospace, monospace">{locale === 'en' ? 'EXTERNAL SELECTION · NOT ON CRAFT' : 'ЗОВНІШНІЙ ВИБІР · НЕ НА АПАРАТІ'}</text>}
      </g>

      {mode === 'launch' && <text x="24" y="32" fill="#f8bc74" fontSize="13" letterSpacing="2" fontFamily="ui-monospace, monospace">{MODE_WORD[mode][locale]}</text>}
      {craft.unknownIds.length > 0 && <text x="24" y="66" fill="#f0a24b" fontSize="10" letterSpacing="1" fontFamily="ui-monospace, monospace">{locale === 'en' ? 'UNKNOWN ID FALLBACK' : 'НЕВІДОМИЙ ID'}</text>}
      <text x={VIEW_W - 24} y={VIEW_H - 18} fill="#9fb6c4" fontSize="10" letterSpacing="1.6" textAnchor="end" fontFamily="ui-monospace, monospace">{locale === 'en' ? 'SCHEMATIC · NOT TO SCALE' : 'СХЕМА · НЕ В МАСШТАБІ'}</text>
    </svg>
  </div>
}
