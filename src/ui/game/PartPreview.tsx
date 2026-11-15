import type { ReactNode } from 'react'
import type { Part } from '../../engine/types'
import {
  getAppearance,
  type ArrayAppearance,
  type BatteryAppearance,
  type BusAppearance,
  type PayloadAppearance,
  type RadioAppearance,
} from '../orbital/appearance'

/**
 * Compact, original schematic thumbnails for the equipment tray.
 * Presentation only: geometry comes from the shared appearance registry so a
 * tile reads like the hardware it equips (wing span, whip vs dish, pack size).
 * No catalog, evaluator or flight claim is expressed here.
 */

const W = 132
const H = 76
const CX = W / 2
const CY = H / 2

const HULL = '#d8e3ea'
const HULL_SHADE = '#9db2c0'
const MOUNT = '#233a4b'
const CELL = '#204b67'
const CELL_EDGE = '#7fd2e8'
const AMBER = '#f0b07a'

function Frame({ children }: { readonly children: ReactNode }) {
  return <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">{children}</svg>
}

function ArrayGlyph({ appearance }: { readonly appearance: ArrayAppearance }) {
  if (appearance.mount === 'body') {
    return <Frame>
      <rect x={CX - 22} y={16} width={44} height={44} rx={3} fill={HULL} stroke={HULL_SHADE} strokeWidth={1.2} />
      {Array.from({ length: 4 }, (_, index) => <rect key={index} x={CX - 19 + index * 10} y={21} width={8} height={34} fill={CELL} stroke={CELL_EDGE} strokeWidth={0.7} />)}
      <rect x={CX - 22} y={16} width={44} height={44} rx={3} fill="none" stroke={appearance.accent} strokeWidth={0.9} opacity={0.7} />
    </Frame>
  }
  const half = Math.min(56, 8 + appearance.span * 21)
  const chord = Math.min(34, 12 + appearance.chord * 24)
  const segments = Math.max(1, appearance.segments)
  const rows = Math.max(1, appearance.rows)
  const top = CY - chord / 2
  const segment = half / segments
  return <Frame>
    {([-1, 1] as const).map(side => {
      const x = side === -1 ? CX - 9 - half : CX + 9
      return <g key={side}>
        <rect x={x} y={top} width={half} height={chord} fill={CELL} stroke={HULL_SHADE} strokeWidth={1.1} />
        {Array.from({ length: rows - 1 }, (_, index) => <line key={`row-${index}`} x1={x + 1} x2={x + half - 1}
          y1={top + chord * (index + 1) / rows} y2={top + chord * (index + 1) / rows} stroke={HULL_SHADE} strokeWidth={0.5} opacity={0.55} />)}
        {Array.from({ length: segments - 1 }, (_, index) => <line key={`seg-${index}`} x1={x + segment * (index + 1)} x2={x + segment * (index + 1)}
          y1={top + 1} y2={top + chord - 1} stroke={CELL_EDGE} strokeWidth={0.8} opacity={0.85} />)}
        <rect x={x} y={top} width={half} height={chord} fill="none" stroke={appearance.accent} strokeWidth={0.9} opacity={0.6} />
      </g>
    })}
    <rect x={CX - 9} y={CY - 17} width={18} height={34} rx={2} fill={HULL} stroke={HULL_SHADE} strokeWidth={1.2} />
    <rect x={CX - 9} y={CY - 17} width={18} height={34} rx={2} fill="none" stroke={appearance.accent} strokeWidth={0.8} opacity={0.7} />
  </Frame>
}

function BatteryGlyph({ appearance }: { readonly appearance: BatteryAppearance }) {
  const width = 24 + appearance.pack[0] * 80
  const height = 18 + appearance.pack[2] * 62
  const x = CX - width / 2
  const y = CY - height / 2
  return <Frame>
    <rect x={x - 4} y={y + 6} width={4} height={8} fill={HULL_SHADE} />
    <rect x={x + width} y={y + 6} width={4} height={8} fill={HULL_SHADE} />
    <rect x={x} y={y} width={width} height={height} rx={3} fill={MOUNT} stroke={HULL_SHADE} strokeWidth={1.2} />
    {Array.from({ length: 3 }, (_, index) => <line key={index} x1={x + 5} x2={x + width - 5}
      y1={y + height * (index + 1) / 4} y2={y + height * (index + 1) / 4} stroke={appearance.accent} strokeWidth={1.6} opacity={0.9} />)}
  </Frame>
}

function BusGlyph({ appearance }: { readonly appearance: BusAppearance }) {
  const width = 26 + appearance.units * 1.2
  const height = 18 + appearance.units * 3.1
  const x = CX - width / 2
  const y = CY - height / 2
  const bays = Math.max(1, appearance.radiatorCells)
  const bands = Math.max(1, appearance.bands)
  return <Frame>
    <rect x={x} y={y} width={width} height={height} rx={2} fill={appearance.goldFoil ? '#c9b184' : HULL} stroke={HULL_SHADE} strokeWidth={1.2} />
    <rect x={x + width * 0.62} y={y} width={width * 0.38} height={height} fill={MOUNT} opacity={0.92} />
    {Array.from({ length: bays }, (_, index) => <rect key={index} x={x + width * 0.68}
      y={y + 4 + index * ((height - 8) / bays)} width={width * 0.24} height={Math.max(1, (height - 8) / bays - 2)}
      fill={appearance.accent} opacity={0.5} />)}
    {Array.from({ length: bands }, (_, index) => <line key={index} x1={x} x2={x + width}
      y1={y + height * (index + 1) / (bands + 1)} y2={y + height * (index + 1) / (bands + 1)} stroke="#5d7c8f" strokeWidth={0.7} />)}
    <rect x={x} y={y} width={width} height={height} rx={2} fill="none" stroke={appearance.accent} strokeWidth={0.9} opacity={0.7} />
  </Frame>
}

function RadioGlyph({ appearance }: { readonly appearance: RadioAppearance }) {
  const boxY = CY + 8
  return <Frame>
    <rect x={CX - 13} y={boxY} width={26} height={15} rx={2} fill={MOUNT} stroke={HULL_SHADE} strokeWidth={1.2} />
    {appearance.antenna === 'whip'
      ? <>
          <line x1={CX} y1={boxY} x2={CX - 15} y2={boxY - 8 - appearance.mast * 34} stroke={HULL} strokeWidth={2} strokeLinecap="round" />
          <circle cx={CX - 15} cy={boxY - 8 - appearance.mast * 34} r={2.2} fill={appearance.accent} />
        </>
      : <>
          <line x1={CX} y1={boxY} x2={CX} y2={boxY - 12 - appearance.mast * 22} stroke={HULL_SHADE} strokeWidth={2} />
          <ellipse cx={CX} cy={boxY - 16 - appearance.mast * 22} rx={6 + appearance.dishRadius * 52} ry={4 + appearance.dishRadius * 26}
            fill="#2b4759" stroke={appearance.accent} strokeWidth={1.2} />
          <line x1={CX} y1={boxY - 16 - appearance.mast * 22} x2={CX + 7} y2={boxY - 5 - appearance.mast * 22} stroke={HULL} strokeWidth={1} />
        </>}
  </Frame>
}

function PayloadGlyph({ appearance }: { readonly appearance: PayloadAppearance }) {
  if (appearance.optics === 'relay') {
    const buffer = appearance.buffer ?? [0.5, 0.34, 0.38]
    const width = 30 + buffer[0] * 18
    const height = 22 + buffer[2] * 26
    return <Frame>
      <rect x={CX - width / 2} y={CY - height / 2} width={width} height={height} rx={2} fill={MOUNT} stroke={HULL_SHADE} strokeWidth={1.2} />
      {Array.from({ length: 3 }, (_, index) => <line key={index} x1={CX - width / 2 + 5} x2={CX + width / 2 - 5}
        y1={CY - 6 + index * 6} y2={CY - 6 + index * 6} stroke={appearance.accent} strokeWidth={1.6} opacity={0.85} />)}
      <rect x={CX + width / 2} y={CY - 8} width={10} height={16} fill={HULL} stroke={HULL_SHADE} strokeWidth={1} />
    </Frame>
  }
  const length = 18 + appearance.barrelLength * 52
  const radius = 5 + appearance.barrelRadius * 18
  const x = CX - length / 2 - 6
  return <Frame>
    <rect x={x} y={CY - radius} width={length} height={radius * 2} rx={radius * 0.4} fill={HULL} stroke={HULL_SHADE} strokeWidth={1.2} />
    {Array.from({ length: appearance.rings }, (_, index) => <line key={index} x1={x + length - 5 - index * 5} x2={x + length - 5 - index * 5}
      y1={CY - radius + 1} y2={CY + radius - 1} stroke={HULL_SHADE} strokeWidth={0.8} opacity={0.8} />)}
    <ellipse cx={x + length} cy={CY} rx={3.6} ry={radius} fill={appearance.lensTone} stroke={appearance.accent} strokeWidth={1} />
  </Frame>
}

function ExternalGlyph({ role }: { readonly role: 'ground' | 'orbit' | 'launcher' }) {
  if (role === 'ground') {
    return <Frame>
      <path d={`M8 64 Q ${CX} 44 124 64`} fill="none" stroke="#3f5f74" strokeWidth={2} />
      <line x1={CX - 16} y1={64} x2={CX - 16} y2={36} stroke={HULL} strokeWidth={2.4} />
      <ellipse cx={CX - 10} cy={31} rx={12} ry={7} fill="#2b4759" stroke={CELL_EDGE} strokeWidth={1.2} transform={`rotate(-22 ${CX - 10} 31)`} />
      <circle cx={CX - 10} cy={31} r={2} fill={AMBER} />
    </Frame>
  }
  if (role === 'orbit') {
    return <Frame>
      <circle cx={CX - 8} cy={54} r={27} fill="#1d4a68" stroke="#2f6b8f" strokeWidth={1} />
      <ellipse cx={CX - 8} cy={44} rx={52} ry={21} fill="none" stroke={CELL_EDGE} strokeWidth={1.2} transform={`rotate(-18 ${CX - 8} 44)`} />
      <circle cx={CX + 33} cy={23} r={4.5} fill={AMBER} />
    </Frame>
  }
  return <Frame>
    <path d={`M${CX - 5} 22 L${CX + 5} 22 L${CX + 7} 58 L${CX - 7} 58 Z`} fill={HULL} stroke={HULL_SHADE} strokeWidth={1.2} />
    <path d={`M${CX - 5} 22 L${CX} 9 L${CX + 5} 22 Z`} fill={AMBER} />
    <path d={`M${CX - 7} 46 L${CX - 17} 60 L${CX - 7} 57 Z`} fill="#50708a" />
    <path d={`M${CX + 7} 46 L${CX + 17} 60 L${CX + 7} 57 Z`} fill="#50708a" />
    <line x1={CX - 9} y1={64} x2={CX + 9} y2={64} stroke={AMBER} strokeWidth={2} strokeLinecap="round" />
  </Frame>
}

/** Defensive silhouettes for catalog ids absent from the appearance registry. */
function FallbackGlyph({ part }: { readonly part: Part }) {
  if (part.category === 'array') {
    const half = 10 + Math.min(40, part.bolW / 6)
    const chord = 22
    return <Frame>
      <rect x={CX - 9 - half} y={CY - chord / 2} width={half} height={chord} fill={CELL} stroke={HULL_SHADE} strokeWidth={1.1} />
      <rect x={CX + 9} y={CY - chord / 2} width={half} height={chord} fill={CELL} stroke={HULL_SHADE} strokeWidth={1.1} />
      <rect x={CX - 9} y={CY - 15} width={18} height={30} rx={2} fill={HULL} stroke={HULL_SHADE} strokeWidth={1.2} />
    </Frame>
  }
  if (part.category === 'battery') {
    const width = 26 + Math.min(24, part.nominalWh / 12)
    const height = 20 + Math.min(22, part.nominalWh / 14)
    return <Frame>
      <rect x={CX - width / 2} y={CY - height / 2} width={width} height={height} rx={3} fill={MOUNT} stroke={HULL_SHADE} strokeWidth={1.2} />
      <line x1={CX - width / 2 + 5} x2={CX + width / 2 - 5} y1={CY} y2={CY} stroke={AMBER} strokeWidth={1.6} />
    </Frame>
  }
  if (part.category === 'radio') {
    return <Frame>
      <rect x={CX - 13} y={CY + 8} width={26} height={15} rx={2} fill={MOUNT} stroke={HULL_SHADE} strokeWidth={1.2} />
      {part.antenna.kind === 'omni'
        ? <><line x1={CX} y1={CY + 8} x2={CX - 15} y2={CY - 26} stroke={HULL} strokeWidth={2} strokeLinecap="round" /><circle cx={CX - 15} cy={CY - 26} r={2.2} fill={AMBER} /></>
        : <><line x1={CX} y1={CY + 8} x2={CX} y2={CY - 18} stroke={HULL_SHADE} strokeWidth={2} /><ellipse cx={CX} cy={CY - 22} rx={16} ry={8} fill="#2b4759" stroke={CELL_EDGE} strokeWidth={1.2} /></>}
    </Frame>
  }
  if (part.category === 'payload') {
    return <Frame>
      <rect x={CX - 22} y={CY - 15} width={44} height={30} rx={2} fill={MOUNT} stroke={HULL_SHADE} strokeWidth={1.2} />
      {part.mode === 'packet-relay'
        ? Array.from({ length: 3 }, (_, index) => <line key={index} x1={CX - 16} x2={CX + 16} y1={CY - 6 + index * 6} y2={CY - 6 + index * 6} stroke={AMBER} strokeWidth={1.6} />)
        : <ellipse cx={CX + 24} cy={CY} rx={6} ry={9} fill={AMBER} stroke={AMBER} strokeWidth={1} />}
    </Frame>
  }
  return <Frame>
    <rect x={CX - 15} y={CY - 24} width={30} height={48} rx={2} fill={HULL} stroke={HULL_SHADE} strokeWidth={1.2} />
    <rect x={CX - 15} y={CY - 24} width={30} height={48} rx={2} fill="none" stroke={AMBER} strokeWidth={0.9} opacity={0.6} />
  </Frame>
}

export default function PartPreview({ part }: { readonly part: Part }) {
  const appearance = getAppearance(part.id)
  switch (appearance.kind) {
    case 'array':
      return <ArrayGlyph appearance={appearance} />
    case 'battery':
      return <BatteryGlyph appearance={appearance} />
    case 'bus':
      return <BusGlyph appearance={appearance} />
    case 'radio':
      return <RadioGlyph appearance={appearance} />
    case 'payload':
      return <PayloadGlyph appearance={appearance} />
    case 'external':
      return <ExternalGlyph role={appearance.role} />
    default:
      return <FallbackGlyph part={part} />
  }
}
