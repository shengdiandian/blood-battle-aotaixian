import { useSnapshot } from 'valtio'
import { useMemo, useState } from 'react'
import StatusPanel from './components/StatusPanel'
import GamePanel from './components/GamePanel'
import GameMap from './components/GameMap'
import EventLog from './components/EventLog'
import PixelGameCanvas from './components/PixelGameCanvas'
import { gameState } from './store/gameStore'
import { Map, ScrollText, User, Mountain, Gamepad2, Monitor } from 'lucide-react'

function WeatherEffects() {
  const state = useSnapshot(gameState)
  const condition = state.weather.condition

  const snowParticles = useMemo(() => {
    if (condition !== '暴风雪' && condition !== '冰雹') return []
    const count = condition === '暴风雪' ? 40 : 20
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${2 + Math.random() * 3}s`,
      isStrong: condition === '暴风雪',
    }))
  }, [condition])

  const rainParticles = useMemo(() => {
    if (condition !== '大雨' && condition !== '小雨') return []
    const count = condition === '大雨' ? 50 : 25
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${0.4 + Math.random() * 0.4}s`,
    }))
  }, [condition])

  const showFog = condition === '雾'
  const showLightning = condition === '暴风雪' || condition === '冰雹'

  return (
    <>
      {snowParticles.map(p => (
        <div
          key={p.id}
          className={`snow-particle ${p.isStrong ? 'strong' : ''}`}
          style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration }}
        />
      ))}
      {rainParticles.map(p => (
        <div
          key={`rain-${p.id}`}
          className="rain-particle"
          style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration }}
        />
      ))}
      {showFog && <div className="fog-layer" />}
      {showLightning && <div className="lightning-overlay" />}
    </>
  )
}

function StarField() {
  const stars = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 40}%`,
      delay: `${Math.random() * 4}s`,
      duration: `${2 + Math.random() * 3}s`,
      size: Math.random() > 0.7 ? 3 : 2,
    }))
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {stars.map(s => (
        <div
          key={s.id}
          className="star"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay, animationDuration: s.duration }}
        />
      ))}
    </div>
  )
}

type MobileTab = 'game' | 'status' | 'map' | 'log'

function App() {
  const state = useSnapshot(gameState)
  const [mobileTab, setMobileTab] = useState<MobileTab>('game')
  const [pixelMode, setPixelMode] = useState(true)

  const sceneBg = useMemo(() => {
    const c = state.weather.condition
    if (c === '暴风雪' || c === '冰雹') return 'scene-bg-storm'
    if (c === '雾') return 'scene-bg-fog'
    if (c === '大雨' || c === '小雨') return 'scene-bg-cloudy'
    if (c === '多云') return 'scene-bg-cloudy'
    return 'scene-bg-clear'
  }, [state.weather.condition])

  if (state.gamePhase === 'start') {
    return (
      <div className="min-h-screen scene-bg-clear flex flex-col relative overflow-hidden">
        <StarField />
        <WeatherEffects />
        <div className="relative z-10 flex-1 flex flex-col">
          <GamePanel />
        </div>
      </div>
    )
  }

  return (
    <div className={`h-dvh ${sceneBg} flex flex-col relative overflow-hidden transition-all duration-1000`}>
      <StarField />
      <WeatherEffects />

      {/* Top navigation */}
      <header className="h-11 border-b border-mountain-700/60 flex items-center px-3 sm:px-5 relative z-10 backdrop-blur-sm bg-mountain-900/40 shrink-0">
        <h1 className="text-sm font-bold text-mountain-100 tracking-wide">血战鳌太线</h1>
        <div className="ml-3 h-4 w-px bg-mountain-600 hidden sm:block" />
        <span className="ml-3 text-xs text-mountain-400 tracking-wider hidden sm:inline">
          {state.weather.condition === '晴' && '☀'}
          {state.weather.condition === '多云' && '☁'}
          {state.weather.condition === '雾' && '🌫'}
          {state.weather.condition === '小雨' && '🌧'}
          {state.weather.condition === '大雨' && '🌧'}
          {state.weather.condition === '暴风雪' && '❄'}
          {state.weather.condition === '冰雹' && '🧊'}
          {' '}{state.weather.condition} {state.weather.temperature}°C
          {' · '}
          第{state.dayCount}天 {String(state.hourCount).padStart(2, '0')}:00
          {' · '}
          已行进 {getCurrentDistance(state)}km
        </span>
        {/* Mobile: compact info */}
        <span className="ml-auto text-xs text-mountain-400 sm:hidden">
          {state.weather.condition === '晴' && '☀'}
          {state.weather.condition === '多云' && '☁'}
          {state.weather.condition === '雾' && '🌫'}
          {state.weather.condition === '小雨' && '🌧'}
          {state.weather.condition === '大雨' && '🌧'}
          {state.weather.condition === '暴风雪' && '❄'}
          {state.weather.condition === '冰雹' && '🧊'}
          {' '}{state.weather.temperature}°C
        </span>
      </header>

      {/* Desktop: three-column layout */}
      <div className="hidden md:flex flex-1 overflow-hidden relative z-10">
        <div className="w-56 shrink-0 p-2 overflow-y-auto">
          <StatusPanel />
        </div>
        <div className="flex-1 p-2 flex flex-col gap-2 min-w-0">
          {/* Pixel game canvas + toggle */}
          <div className="shrink-0 relative">
            <PixelGameCanvas />
            <button
              onClick={() => setPixelMode(!pixelMode)}
              className="absolute top-2 right-2 z-10 bg-mountain-900/80 backdrop-blur-sm rounded p-1.5 border border-mountain-700/50 text-mountain-400 hover:text-ice-400 transition-colors cursor-pointer"
              title={pixelMode ? '切换文字模式' : '切换像素模式'}
            >
              {pixelMode ? <Monitor size={14} /> : <Gamepad2 size={14} />}
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <GamePanel />
          </div>
          <div className="h-40 shrink-0">
            <EventLog />
          </div>
        </div>
        <div className="w-72 shrink-0 p-2">
          <GameMap />
        </div>
      </div>

      {/* Mobile: tab-based layout */}
      <div className="flex md:hidden flex-1 flex-col overflow-hidden relative z-10">
        <div className="flex-1 overflow-y-auto">
          {mobileTab === 'game' && (
            <>
              <div className="p-2">
                <PixelGameCanvas />
              </div>
              <GamePanel />
            </>
          )}
          {mobileTab === 'status' && <div className="p-2"><StatusPanel /></div>}
          {mobileTab === 'map' && <div className="h-full min-h-[50vh] p-2"><GameMap /></div>}
          {mobileTab === 'log' && <div className="p-2"><EventLog /></div>}
        </div>

        {/* Mobile tab bar */}
        <div className="shrink-0 border-t border-mountain-700/60 bg-mountain-900/80 backdrop-blur flex">
          {([
            { id: 'game' as MobileTab, icon: Mountain, label: '探索' },
            { id: 'status' as MobileTab, icon: User, label: '状态' },
            { id: 'log' as MobileTab, icon: ScrollText, label: '日志' },
            { id: 'map' as MobileTab, icon: Map, label: '地图' },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setMobileTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors cursor-pointer ${
                mobileTab === tab.id ? 'text-ice-400' : 'text-mountain-500'
              }`}
            >
              <tab.icon size={18} />
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function getCurrentDistance(state: any) {
  const routeNodes = [
    { id: 'tangkou', distance: 0 }, { id: 'camp2900', distance: 8 },
    { id: 'penjingyuan', distance: 12 }, { id: 'baiqimiao', distance: 14 },
    { id: 'daohangjia', distance: 18 }, { id: 'yaowangdong', distance: 20 },
    { id: 'maijiling', distance: 24 }, { id: 'shuiwozi', distance: 28 },
    { id: 'jinnianbei', distance: 30 }, { id: 'feijiliang', distance: 35 },
    { id: 'liang1', distance: 37 }, { id: 'liang2', distance: 39 },
    { id: 'liang3', distance: 41 }, { id: 'camp2800', distance: 45 },
    { id: 'jinzita', distance: 50 }, { id: 'xiyuan', distance: 55 },
    { id: 'taibailiang', distance: 60 }, { id: 'dashiehe', distance: 65 },
    { id: 'dongyuan', distance: 70 }, { id: 'wanxianzhen', distance: 75 },
    { id: 'leigongmiao', distance: 78 }, { id: 'dongpaomaliang', distance: 82 },
    { id: 'dayehai', distance: 88 }, { id: 'baxiantai', distance: 92 },
    { id: 'dawengongmiao', distance: 96 }, { id: 'fangyangsi', distance: 100 },
    { id: 'mingxingsi', distance: 105 }, { id: 'pingansi', distance: 110 },
    { id: 'nanyuan', distance: 120 },
  ]
  const node = routeNodes.find(n => n.id === state.currentNode)
  return node?.distance ?? 0
}

export default App
