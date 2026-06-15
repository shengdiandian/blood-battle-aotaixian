import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useSnapshot } from 'valtio'
import { gameState, getRouteNodes } from '../store/gameStore'
import 'leaflet/dist/leaflet.css'

// 修复 Leaflet 默认图标问题
const currentIcon = L.divIcon({
  html: '<div style="background:#38bdf8;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 10px rgba(56,189,248,0.6)"></div>',
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

const nodeIcon = L.divIcon({
  html: '<div style="background:#475569;width:8px;height:8px;border-radius:50%;border:2px solid #94a3b8"></div>',
  className: '',
  iconSize: [8, 8],
  iconAnchor: [4, 4],
})

const incidentIcon = L.divIcon({
  html: '<div style="background:#ef4444;width:10px;height:10px;border-radius:50%;border:2px solid #fca5a5;box-shadow:0 0 6px rgba(239,68,68,0.5)"></div>',
  className: '',
  iconSize: [10, 10],
  iconAnchor: [5, 5],
})

function MapUpdater() {
  const map = useMap()
  const state = useSnapshot(gameState)
  const nodes = getRouteNodes()
  const currentNode = nodes.find(n => n.id === state.currentNode)

  useEffect(() => {
    if (currentNode) {
      map.setView(currentNode.coordinates, 12, { animate: true })
    }
  }, [currentNode, map])

  return null
}

export default function GameMap() {
  const state = useSnapshot(gameState)
  const nodes = getRouteNodes()
  const mapRef = useRef<L.Map | null>(null)

  // 构建路线坐标
  const routeCoords: [number, number][] = nodes.map(n => n.coordinates)

  // 事故标记点（基于事故数据中的位置名）
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
    <div className="bg-mountain-800 rounded-lg border border-mountain-700 h-full overflow-hidden">
      <div className="p-2 border-b border-mountain-700">
        <h3 className="text-xs font-bold text-mountain-300">鳌太线路线图</h3>
      </div>
      <div className="h-[calc(100%-32px)]">
        <MapContainer
          center={currentNode?.coordinates || [107.85, 33.80]}
          zoom={10}
          className="h-full w-full"
          ref={mapRef}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapUpdater />

          {/* 路线连线 */}
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: '#64748b', weight: 2, dashArray: '5,5' }}
          />

          {/* 路线节点 */}
          {nodes.map(node => (
            <Marker key={node.id} position={node.coordinates} icon={nodeIcon}>
              <Popup className="custom-popup">
                <div className="text-xs">
                  <strong>{node.name}</strong><br />
                  海拔: {node.altitude}m<br />
                  距离: {node.distance}km<br />
                  危险等级: {'★'.repeat(node.dangerLevel)}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* 当前位置 */}
          {currentNode && (
            <Marker position={currentNode.coordinates} icon={currentIcon}>
              <Popup>
                <div className="text-xs">
                  <strong>📍 {currentNode.name}</strong><br />
                  你当前的位置
                </div>
              </Popup>
            </Marker>
          )}

          {/* 事故标记 */}
          {incidentLocations.map((loc, i) => (
            <Marker key={`inc_${i}`} position={loc.coords} icon={incidentIcon}>
              <Popup>
                <div className="text-xs">
                  <strong>⚠ {loc.name}</strong><br />
                  此处发生过 {loc.count} 起事故
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
