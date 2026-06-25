import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useSnapshot } from 'valtio'
import { gameState, getRouteNodes } from '../store/gameStore'
import { Map } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

const terrainColors: Record<string, string> = {
  '石海': '#94a3b8', '草甸': '#4ade80', '刃脊': '#f87171',
  '丛林': '#22c55e', '营地': '#fbbf24', '村庄': '#a78bfa',
  '湖泊': '#38bdf8', '庙宇': '#c084fc',
}

function createDotIcon(color: string, size: number, glow: boolean) {
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:2px solid #0a0e17;
      ${glow ? `box-shadow:0 0 8px ${color}99;` : ''}
    "></div>`,
    className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2],
  })
}

function createCurrentIcon() {
  return L.divIcon({
    html: `<div style="
      width:18px;height:18px;border-radius:50%;
      background:linear-gradient(135deg,#38bdf8,#0ea5e9);
      border:3px solid #0a0e17;
      box-shadow:0 0 14px rgba(56,189,248,0.8);
      animation:pulseGlow 2s ease-in-out infinite;
    "></div>`,
    className: '', iconSize: [18, 18], iconAnchor: [9, 9],
  })
}

function createLabelWithLine(name: string, terrainType: string, isCurrent: boolean, above: boolean) {
  const color = terrainColors[terrainType] || '#94a3b8'
  const textColor = isCurrent ? '#38bdf8' : '#e2e8f0'
  const borderColor = isCurrent ? '#38bdf8' : color + '50'
  const lineH = 18

  if (above) {
    return L.divIcon({
      html: `<div style="display:flex;flex-direction:column;align-items:center;width:0;">
        <div style="
          white-space:nowrap;font-size:9px;font-weight:600;
          color:${textColor};background:rgba(10,14,23,0.85);
          padding:1px 4px;border-radius:3px;
          border:1px solid ${borderColor};
          text-shadow:0 1px 2px rgba(0,0,0,0.9);
          margin-bottom:2px;
        ">${name}</div>
        <div style="width:1px;height:${lineH}px;background:${borderColor};opacity:0.4;"></div>
      </div>`,
      className: '', iconSize: [0, 0], iconAnchor: [0, lineH + 2],
    })
  } else {
    return L.divIcon({
      html: `<div style="display:flex;flex-direction:column;align-items:center;width:0;">
        <div style="width:1px;height:${lineH}px;background:${borderColor};opacity:0.4;"></div>
        <div style="
          white-space:nowrap;font-size:9px;font-weight:600;
          color:${textColor};background:rgba(10,14,23,0.85);
          padding:1px 4px;border-radius:3px;
          border:1px solid ${borderColor};
          text-shadow:0 1px 2px rgba(0,0,0,0.9);
          margin-top:2px;
        ">${name}</div>
      </div>`,
      className: '', iconSize: [0, 0], iconAnchor: [0, 0],
    })
  }
}

function MapUpdater() {
  const map = useMap()
  const state = useSnapshot(gameState)
  const nodes = getRouteNodes()
  const currentNode = nodes.find(n => n.id === state.currentNode)
  useEffect(() => {
    if (currentNode) map.setView(currentNode.coordinates, 11, { animate: true, duration: 1 })
  }, [currentNode, map])
  return null
}

function MountainProfile() {
  const state = useSnapshot(gameState)
  const nodes = getRouteNodes()

  const maxAlt = 3800
  const minAlt = 1400
  const w = 300
  const h = 110
  const base = h - 18
  const chartH = base - 10

  const points = nodes.map((n, i) => {
    const x = 10 + (i / (nodes.length - 1)) * (w - 20)
    const altRatio = (n.altitude - minAlt) / (maxAlt - minAlt)
    const y = base - altRatio * chartH
    return { x, y, altitude: n.altitude, name: n.name }
  })

  // Build smooth mountain silhouette path
  let mountainPath = `M${points[0].x},${base}`
  // Start with a slope up to first point
  mountainPath += ` L${points[0].x},${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpx = (prev.x + curr.x) / 2
    mountainPath += ` Q${prev.x + (curr.x - prev.x) * 0.3},${prev.y} ${cpx},${(prev.y + curr.y) / 2}`
    mountainPath += ` Q${prev.x + (curr.x - prev.x) * 0.7},${curr.y} ${curr.x},${curr.y}`
  }
  mountainPath += ` L${points[points.length - 1].x},${base} Z`

  // Snow cap path (only for peaks above 3200m)
  let snowPath = ''
  for (const p of points) {
    if (p.altitude >= 3200) {
      const snowH = Math.min(12, (p.altitude - 3200) / 100 + 4)
      snowPath += `M${p.x - 4},${p.y + 2} L${p.x},${p.y - snowH * 0.3} L${p.x + 4},${p.y + 2} `
    }
  }

  const currentIdx = nodes.findIndex(n => n.id === state.currentNode)
  const currentX = currentIdx >= 0 ? points[currentIdx].x : 0
  const currentY = currentIdx >= 0 ? points[currentIdx].y : 0

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-mountain-900/95 backdrop-blur border-t border-mountain-700/50">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 100 }}>
        <defs>
          <linearGradient id="mtnGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
            <stop offset="40%" stopColor="#1e293b" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0a0e17" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="snowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.7" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Altitude grid lines */}
        {[2000, 2500, 3000, 3500].map(alt => {
          const y = base - ((alt - minAlt) / (maxAlt - minAlt)) * chartH
          return (
            <g key={alt}>
              <line x1="10" y1={y} x2={w - 10} y2={y} stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,4" />
              <text x={w - 8} y={y + 3} fill="#475569" fontSize="5.5" fontFamily="monospace">{alt}</text>
            </g>
          )
        })}

        {/* Mountain body - dark fill */}
        <path d={mountainPath} fill="url(#mtnGrad)" />

        {/* Mountain ridge line */}
        {points.slice(0, -1).map((p, i) => {
          const next = points[i + 1]
          const avgAlt = (nodes[i].altitude + nodes[i + 1].altitude) / 2
          const ratio = (avgAlt - minAlt) / (maxAlt - minAlt)
          const r = Math.round(56 + ratio * 183)
          const g = Math.round(189 - ratio * 120)
          const b = Math.round(248 - ratio * 100)
          return <line key={i} x1={p.x} y1={p.y} x2={next.x} y2={next.y} stroke={`rgb(${r},${g},${b})`} strokeWidth="1.2" opacity="0.7" />
        })}

        {/* Snow caps */}
        {snowPath && <path d={snowPath} fill="url(#snowGrad)" />}

        {/* Node dots on mountain */}
        {points.map((p, i) => {
          const isVisited = state.visitedNodes.includes(nodes[i].id)
          const isCurrent = nodes[i].id === state.currentNode
          const color = terrainColors[nodes[i].terrainType] || '#94a3b8'
          return (
            <circle
              key={i} cx={p.x} cy={p.y}
              r={isCurrent ? 3 : isVisited ? 1.5 : 2}
              fill={isCurrent ? '#38bdf8' : isVisited ? '#475569' : color}
              stroke="#0a0e17" strokeWidth={isCurrent ? 1.5 : 0.8}
              opacity={isVisited ? 0.5 : 1}
            />
          )
        })}

        {/* Current position vertical line */}
        {currentIdx >= 0 && (
          <line x1={currentX} y1={currentY - 4} x2={currentX} y2={base} stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="1,2" opacity="0.4" />
        )}

        {/* Start/End labels */}
        <text x="10" y={base + 10} fill="#64748b" fontSize="5.5" fontFamily="sans-serif">塘口村</text>
        <text x={w - 10} y={base + 10} fill="#64748b" fontSize="5.5" fontFamily="sans-serif" textAnchor="end">南塬村</text>
      </svg>
    </div>
  )
}

export default function GameMap() {
  const state = useSnapshot(gameState)
  const nodes = getRouteNodes()
  const mapRef = useRef<L.Map | null>(null)

  const routeCoords: [number, number][] = nodes.map(n => n.coordinates)

  const incidentLocations = [
    { name: '麦秸岭', coords: [107.86, 33.79] as [number, number], count: 3 },
    { name: '飞机梁', coords: [107.92, 33.76] as [number, number], count: 4 },
    { name: '太白梁', coords: [108.04, 33.69] as [number, number], count: 2 },
    { name: '导航架', coords: [107.83, 33.81] as [number, number], count: 2 },
    { name: '万仙阵', coords: [108.10, 33.66] as [number, number], count: 2 },
  ]

  const currentNode = nodes.find(n => n.id === state.currentNode)

  return (
    <div className="bg-mountain-800/80 backdrop-blur rounded-lg border border-mountain-700/60 h-full overflow-hidden card-atmosphere flex flex-col">
      <div className="p-2.5 border-b border-mountain-700/50 flex items-center gap-2 shrink-0">
        <Map size={13} className="text-mountain-400" />
        <h3 className="text-xs font-bold text-mountain-400 tracking-wider uppercase">路线图</h3>
        {currentNode && <span className="text-xs text-ice-400 ml-auto">{currentNode.name}</span>}
      </div>
      <div className="flex-1 relative" style={{ marginBottom: 100 }}>
        <MapContainer
          center={currentNode?.coordinates || [107.85, 33.80]}
          zoom={11}
          className="h-full w-full"
          ref={mapRef}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <MapUpdater />
          <Polyline positions={routeCoords} pathOptions={{ color: '#38bdf8', weight: 1.5, dashArray: '5,4', opacity: 0.3 }} />

          {/* Labels with leader lines */}
          {nodes.map((node, i) => (
            <Marker
              key={`label-${node.id}`}
              position={node.coordinates}
              icon={createLabelWithLine(node.name, node.terrainType, node.id === state.currentNode, i % 2 === 0)}
              interactive={false}
            />
          ))}

          {/* Node dots */}
          {nodes.map(node => {
            const isVisited = state.visitedNodes.includes(node.id)
            const isCurrent = node.id === state.currentNode
            const color = terrainColors[node.terrainType] || '#94a3b8'
            return (
              <Marker key={node.id} position={node.coordinates} icon={createDotIcon(isCurrent ? '#38bdf8' : color, isVisited ? 6 : 8, node.dangerLevel >= 4)}>
                <Popup className="custom-popup">
                  <div className="text-xs p-1 min-w-[120px]">
                    <div className="font-bold text-slate-800 text-sm mb-1">{node.name}</div>
                    <div className="text-slate-600 space-y-0.5">
                      <div>海拔 {node.altitude}m · {node.distance}km</div>
                      <div>地形 {node.terrainType}</div>
                      <div>危险 <span style={{ color: node.dangerLevel >= 4 ? '#ef4444' : node.dangerLevel >= 3 ? '#f59e0b' : '#22c55e' }}>
                        {'★'.repeat(node.dangerLevel)}{'☆'.repeat(5 - node.dangerLevel)}
                      </span></div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}

          {currentNode && (
            <Marker position={currentNode.coordinates} icon={createCurrentIcon()}>
              <Popup><div className="text-xs p-1"><strong className="text-slate-800">📍 {currentNode.name}</strong></div></Popup>
            </Marker>
          )}

          {incidentLocations.map((loc, i) => (
            <Marker key={`inc_${i}`} position={loc.coords} icon={createDotIcon('#ef4444', 8, true)}>
              <Popup>
                <div className="text-xs p-1">
                  <strong className="text-red-700">⚠ {loc.name}</strong><br />
                  <span className="text-slate-600">此处发生过 {loc.count} 起事故</span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <MountainProfile />
      </div>
    </div>
  )
}
