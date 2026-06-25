import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useSnapshot } from 'valtio'
import { gameState, getRouteNodes } from '../store/gameStore'
import { Map, Mountain, AlertTriangle } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

const terrainColors: Record<string, string> = {
  '石海': '#94a3b8',
  '草甸': '#4ade80',
  '刃脊': '#f87171',
  '丛林': '#22c55e',
  '营地': '#fbbf24',
  '村庄': '#a78bfa',
  '湖泊': '#38bdf8',
  '庙宇': '#c084fc',
}

const terrainEmoji: Record<string, string> = {
  '石海': '🪨',
  '草甸': '🌿',
  '刃脊': '🗡️',
  '丛林': '🌲',
  '营地': '⛺',
  '村庄': '🏘️',
  '湖泊': '💧',
  '庙宇': '🛕',
}

function createNodeIcon(node: { name: string; terrainType: string; dangerLevel: number }, isVisited: boolean, isCurrent: boolean) {
  const color = terrainColors[node.terrainType] || '#94a3b8'
  const size = isCurrent ? 0 : isVisited ? 8 : 10
  const opacity = isVisited ? '0.5' : '1'
  const border = isVisited ? '1px' : '2px'
  const shadow = node.dangerLevel >= 4 ? `box-shadow:0 0 6px ${color}80;` : ''

  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:${border} solid ${isVisited ? '#1e293b' : '#0a0e17'};
      opacity:${opacity};${shadow}
    "></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function createCurrentIcon() {
  return L.divIcon({
    html: `<div style="
      width:20px;height:20px;border-radius:50%;
      background:linear-gradient(135deg,#38bdf8,#0ea5e9);
      border:3px solid #0a0e17;
      box-shadow:0 0 16px rgba(56,189,248,0.8),0 0 30px rgba(56,189,248,0.3);
      animation:pulseGlow 2s ease-in-out infinite;
    "></div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

function createLabelIcon(name: string, terrainType: string, isCurrent: boolean) {
  const color = terrainColors[terrainType] || '#94a3b8'
  const textColor = isCurrent ? '#38bdf8' : '#e2e8f0'
  const bgOpacity = isCurrent ? '0.9' : '0.7'

  return L.divIcon({
    html: `<div style="
      white-space:nowrap;font-size:10px;font-weight:bold;
      color:${textColor};background:rgba(10,14,23,${bgOpacity});
      padding:2px 5px;border-radius:3px;
      border:1px solid ${isCurrent ? '#38bdf8' : color + '40'};
      text-shadow:0 1px 2px rgba(0,0,0,0.8);
      letter-spacing:0.5px;
    ">${name}</div>`,
    className: '',
    iconSize: [0, 0],
    iconAnchor: [-6, 6],
  })
}

function createIncidentIcon() {
  return L.divIcon({
    html: `<div style="
      width:10px;height:10px;border-radius:2px;
      background:rgba(239,68,68,0.7);
      border:1.5px solid rgba(252,165,165,0.6);
      box-shadow:0 0 8px rgba(239,68,68,0.4);
      transform:rotate(45deg);
    "></div>`,
    className: '',
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  })
}

function MapUpdater() {
  const map = useMap()
  const state = useSnapshot(gameState)
  const nodes = getRouteNodes()
  const currentNode = nodes.find(n => n.id === state.currentNode)

  useEffect(() => {
    if (currentNode) {
      map.setView(currentNode.coordinates, 12, { animate: true, duration: 1 })
    }
  }, [currentNode, map])

  return null
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
    { name: '水窝子营地', coords: [107.88, 33.78] as [number, number], count: 2 },
    { name: '导航架', coords: [107.83, 33.81] as [number, number], count: 2 },
    { name: '万仙阵', coords: [108.10, 33.66] as [number, number], count: 2 },
    { name: '金字塔', coords: [107.99, 33.71] as [number, number], count: 1 },
  ]

  const currentNode = nodes.find(n => n.id === state.currentNode)

  return (
    <div className="bg-mountain-800/80 backdrop-blur rounded-lg border border-mountain-700/60 h-full overflow-hidden card-atmosphere flex flex-col">
      <div className="p-2.5 border-b border-mountain-700/50 flex items-center gap-2">
        <Map size={13} className="text-mountain-400" />
        <h3 className="text-xs font-bold text-mountain-400 tracking-wider uppercase">路线图</h3>
        {currentNode && (
          <span className="text-xs text-ice-400 ml-auto">{currentNode.name}</span>
        )}
      </div>
      <div className="flex-1 relative">
        <MapContainer
          center={currentNode?.coordinates || [107.85, 33.80]}
          zoom={11}
          className="h-full w-full"
          ref={mapRef}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <MapUpdater />

          {/* Route line - thicker, gradient-like */}
          <Polyline
            positions={routeCoords}
            pathOptions={{
              color: '#38bdf8',
              weight: 2,
              dashArray: '6,4',
              opacity: 0.35,
            }}
          />

          {/* Node labels - shown on all nodes */}
          {nodes.map(node => (
            <Marker
              key={`label-${node.id}`}
              position={node.coordinates}
              icon={createLabelIcon(
                node.name,
                node.terrainType,
                node.id === state.currentNode
              )}
              interactive={false}
            />
          ))}

          {/* Node dots */}
          {nodes.map(node => {
            const isVisited = state.visitedNodes.includes(node.id)
            const isCurrent = node.id === state.currentNode
            return (
              <Marker
                key={node.id}
                position={node.coordinates}
                icon={createNodeIcon(node, isVisited, isCurrent)}
              >
                <Popup className="custom-popup">
                  <div className="text-xs p-1 min-w-[120px]">
                    <div className="font-bold text-slate-800 text-sm mb-1">
                      {terrainEmoji[node.terrainType]} {node.name}
                    </div>
                    <div className="text-slate-600 space-y-0.5">
                      <div>海拔: {node.altitude}m</div>
                      <div>距离: {node.distance}km</div>
                      <div>地形: {node.terrainType}</div>
                      <div className="flex items-center gap-1">
                        危险:
                        <span style={{ color: node.dangerLevel >= 4 ? '#ef4444' : node.dangerLevel >= 3 ? '#f59e0b' : '#22c55e' }}>
                          {'★'.repeat(node.dangerLevel)}{'☆'.repeat(5 - node.dangerLevel)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}

          {/* Current position - larger, glowing */}
          {currentNode && (
            <Marker position={currentNode.coordinates} icon={createCurrentIcon()}>
              <Popup>
                <div className="text-xs p-1 min-w-[120px]">
                  <div className="font-bold text-slate-800 text-sm mb-1">
                    📍 {currentNode.name}
                  </div>
                  <div className="text-slate-600">你当前的位置</div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Incident markers - rotated squares */}
          {incidentLocations.map((loc, i) => (
            <Marker key={`inc_${i}`} position={loc.coords} icon={createIncidentIcon()}>
              <Popup>
                <div className="text-xs p-1 min-w-[120px]">
                  <div className="font-bold text-red-700 text-sm mb-1">⚠ {loc.name}</div>
                  <div className="text-slate-600">此处发生过 {loc.count} 起事故</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend overlay */}
        <div className="absolute bottom-2 left-2 bg-mountain-900/90 backdrop-blur rounded-md p-2 border border-mountain-700/50 z-[1000]">
          <div className="text-xs text-mountain-400 mb-1 font-bold">图例</div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-mountain-300">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-mountain-900" />
              <span>当前位置</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-mountain-300">
              <div className="w-2 h-2 rounded-full bg-amber-400 border border-mountain-900" />
              <span>营地</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-mountain-300">
              <div className="w-2 h-2 rounded-full bg-red-400 border border-mountain-900" />
              <span>刃脊</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-mountain-300">
              <div className="w-2 h-2 rounded-full bg-slate-400 border border-mountain-900" />
              <span>石海</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-mountain-300">
              <div className="w-2 h-2 rounded-full bg-emerald-400 border border-mountain-900" />
              <span>草甸</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-mountain-300">
              <div className="w-2.5 h-2.5 rotate-45 bg-red-500/70 border border-red-300/60" />
              <span>事故点</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
