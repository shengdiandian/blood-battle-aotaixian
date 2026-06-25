import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useSnapshot } from 'valtio'
import { gameState, getRouteNodes } from '../store/gameStore'
import { Map } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

const currentIcon = L.divIcon({
  html: '<div style="background:#38bdf8;width:16px;height:16px;border-radius:50%;border:3px solid #0a0e17;box-shadow:0 0 12px rgba(56,189,248,0.7);animation:pulseGlow 2s ease-in-out infinite"></div>',
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

const nodeIcon = L.divIcon({
  html: '<div style="background:#475569;width:6px;height:6px;border-radius:50%;border:1.5px solid #94a3b8;opacity:0.7"></div>',
  className: '',
  iconSize: [6, 6],
  iconAnchor: [3, 3],
})

const incidentIcon = L.divIcon({
  html: '<div style="background:rgba(239,68,68,0.6);width:8px;height:8px;border-radius:50%;border:1.5px solid rgba(252,165,165,0.5);box-shadow:0 0 4px rgba(239,68,68,0.3)"></div>',
  className: '',
  iconSize: [8, 8],
  iconAnchor: [4, 4],
})

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
      </div>
      <div className="flex-1 relative">
        <MapContainer
          center={currentNode?.coordinates || [107.85, 33.80]}
          zoom={10}
          className="h-full w-full"
          ref={mapRef}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <MapUpdater />

          <Polyline
            positions={routeCoords}
            pathOptions={{ color: '#38bdf8', weight: 1.5, dashArray: '4,6', opacity: 0.4 }}
          />

          {nodes.map(node => (
            <Marker key={node.id} position={node.coordinates} icon={nodeIcon}>
              <Popup className="custom-popup">
                <div className="text-xs p-1">
                  <strong className="text-slate-800">{node.name}</strong><br />
                  <span className="text-slate-600">海拔 {node.altitude}m · {node.distance}km</span>
                </div>
              </Popup>
            </Marker>
          ))}

          {currentNode && (
            <Marker position={currentNode.coordinates} icon={currentIcon}>
              <Popup>
                <div className="text-xs p-1">
                  <strong className="text-slate-800">{currentNode.name}</strong><br />
                  <span className="text-slate-600">你当前的位置</span>
                </div>
              </Popup>
            </Marker>
          )}

          {incidentLocations.map((loc, i) => (
            <Marker key={`inc_${i}`} position={loc.coords} icon={incidentIcon}>
              <Popup>
                <div className="text-xs p-1">
                  <strong className="text-red-700">⚠ {loc.name}</strong><br />
                  <span className="text-slate-600">此处发生过 {loc.count} 起事故</span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
