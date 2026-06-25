import { useSnapshot } from 'valtio'
import { useMemo } from 'react'
import StatusPanel from './components/StatusPanel'
import GamePanel from './components/GamePanel'
import GameMap from './components/GameMap'
import EventLog from './components/EventLog'
import { gameState } from './store/gameStore'

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
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
      {rainParticles.map(p => (
        <div
          key={`rain-${p.id}`}
          className="rain-particle"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
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
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        />
      ))}
    </div>
  )
}

function App() {
  const state = useSnapshot(gameState)

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
    <div className={`min-h-screen ${sceneBg} flex flex-col relative overflow-hidden transition-all duration-1000`}>
      <StarField />
      <WeatherEffects />

      {/* Top navigation */}
      <header className="h-11 border-b border-mountain-700/60 flex items-center px-5 relative z-10 backdrop-blur-sm bg-mountain-900/40">
        <h1 className="text-sm font-bold text-mountain-100 tracking-wide">血战鳌太线</h1>
        <div className="ml-4 h-4 w-px bg-mountain-600" />
        <span className="ml-4 text-xs text-mountain-400 tracking-wider">
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
      </header>

      {/* Main three-column layout */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left: Status Panel */}
        <div className="w-56 shrink-0 p-2 overflow-y-auto">
          <StatusPanel />
        </div>

        {/* Center: Game Area */}
        <div className="flex-1 p-2 flex flex-col gap-2 min-w-0">
          <div className="flex-1 min-h-0">
            <GamePanel />
          </div>
          <div className="h-40 shrink-0">
            <EventLog />
          </div>
        </div>

        {/* Right: Map */}
        <div className="w-72 shrink-0 p-2">
          <GameMap />
        </div>
      </div>
    </div>
  )
}

function getCurrentDistance(state: any) {
  const routeNodes = [
    { id: 'tangkou', distance: 0 },
    { id: 'camp2900', distance: 8 },
    { id: 'penjingyuan', distance: 12 },
    { id: 'baiqimiao', distance: 14 },
    { id: 'daohangjia', distance: 18 },
    { id: 'yaowangdong', distance: 20 },
    { id: 'maijiling', distance: 24 },
    { id: 'shuiwozi', distance: 28 },
    { id: 'jinnianbei', distance: 30 },
    { id: 'feijiliang', distance: 35 },
    { id: 'liang1', distance: 37 },
    { id: 'liang2', distance: 39 },
    { id: 'liang3', distance: 41 },
    { id: 'camp2800', distance: 45 },
    { id: 'jinzita', distance: 50 },
    { id: 'xiyuan', distance: 55 },
    { id: 'taibailiang', distance: 60 },
    { id: 'dashiehe', distance: 65 },
    { id: 'dongyuan', distance: 70 },
    { id: 'wanxianzhen', distance: 75 },
    { id: 'leigongmiao', distance: 78 },
    { id: 'dongpaomaliang', distance: 82 },
    { id: 'dayehai', distance: 88 },
    { id: 'baxiantai', distance: 92 },
    { id: 'dawengongmiao', distance: 96 },
    { id: 'fangyangsi', distance: 100 },
    { id: 'mingxingsi', distance: 105 },
    { id: 'pingansi', distance: 110 },
    { id: 'nanyuan', distance: 120 },
  ]
  const node = routeNodes.find(n => n.id === state.currentNode)
  return node?.distance ?? 0
}

export default App
