import { useSnapshot } from 'valtio'
import { useState, useEffect } from 'react'
import { gameState, getCurrentNode, moveToNode, makeCamp, eatAndDrink, useFirstAid, startGame, resetGame, getRouteNodes, handleEventChoice, skipEvent } from '../store/gameStore'
import { Mountain, Tent, UtensilsCrossed, Heart, ArrowRight, RotateCcw, AlertTriangle, Flame, SkipForward, Compass, Sunrise, Moon, Wind, CloudRain, Snowflake } from 'lucide-react'
import type { RouteNode } from '../types'
import endingsData from '../data/endings.json'

function getNodeById(id: string): RouteNode | undefined {
  return getRouteNodes().find(n => n.id === id)
}

const terrainIcons: Record<string, string> = {
  '村庄': '🏘️',
  '营地': '⛺',
  '草甸': '🌿',
  '庙宇': '🛕',
  '刃脊': '🗡️',
  '石海': '🪨',
  '湖泊': '💧',
}

const weatherDescriptions: Record<string, { icon: typeof Wind; color: string; tip: string }> = {
  '晴': { icon: Sunrise, color: 'text-amber-400', tip: '难得的好天气，抓紧赶路。' },
  '多云': { icon: CloudRain, color: 'text-slate-400', tip: '天色阴沉，随时可能变天。' },
  '雾': { icon: Wind, color: 'text-slate-300', tip: '能见度极低，注意辨别方向。' },
  '大雨': { icon: CloudRain, color: 'text-blue-400', tip: '雨天路滑，小心脚下。' },
  '暴风雪': { icon: Snowflake, color: 'text-cyan-300', tip: '极端天气，立即寻找避风处！' },
  '冰雹': { icon: Snowflake, color: 'text-purple-300', tip: '冰雹可能造成伤害，保护好头部。' },
}

export default function GamePanel() {
  const state = useSnapshot(gameState)
  const currentNode = getCurrentNode()

  if (state.gamePhase === 'start') {
    return <StartScreen />
  }

  if (state.gamePhase === 'ended') {
    return <EndScreen />
  }

  if (state.gamePhase === 'event' && state.pendingEvent) {
    return <EventScreen />
  }

  const nextNodes = currentNode.nextNodes.map(id => getNodeById(id)).filter(Boolean) as RouteNode[]

  const dangerLabel = (level: number) => {
    if (level <= 1) return { text: '安全', color: 'text-emerald-400' }
    if (level <= 2) return { text: '低危', color: 'text-amber-400' }
    if (level <= 3) return { text: '中危', color: 'text-orange-400' }
    if (level <= 4) return { text: '高危', color: 'text-red-400' }
    return { text: '极危', color: 'text-red-500' }
  }

  const handleMove = (nodeId: string) => {
    moveToNode(nodeId)
  }

  const danger = dangerLabel(currentNode.dangerLevel)
  const weatherInfo = weatherDescriptions[state.weather.condition] || weatherDescriptions['晴']
  const WeatherIcon = weatherInfo.icon

  return (
    <div className="bg-mountain-800/80 backdrop-blur rounded-lg border border-mountain-700/60 h-full flex flex-col card-atmosphere">
      {/* Scene header with atmosphere */}
      <div className="p-5 border-b border-mountain-700/50 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{terrainIcons[currentNode.terrainType] || '⛰️'}</span>
              <h2 className="text-lg font-bold text-mountain-100 tracking-wide">
                {currentNode.name}
              </h2>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${danger.color} border-current/30 bg-current/5`}>
                {danger.text}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-mountain-400 mt-1">
              <span className="flex items-center gap-1">
                <Mountain size={12} />
                海拔 {currentNode.altitude}m
              </span>
              <span className="flex items-center gap-1">
                <Compass size={12} />
                {currentNode.terrainType}
              </span>
              <span>预计 {currentNode.baseTimeCost}h</span>
            </div>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-1.5 text-xs ${weatherInfo.color}`}>
              <WeatherIcon size={14} />
              <span>{state.weather.condition}</span>
              <span className="text-mountain-300">{state.weather.temperature}°C</span>
            </div>
            <p className="text-xs text-mountain-500 mt-0.5">{weatherInfo.tip}</p>
          </div>
        </div>
      </div>

      {/* Narrative text - the story */}
      <div className="flex-1 p-5 overflow-y-auto">
        <div className="story-text text-mountain-200 text-sm">
          {currentNode.description}
        </div>

        {/* Altitude indicator */}
        <div className="mt-4 relative">
          <div className="flex items-center gap-2 text-xs text-mountain-500">
            <Moon size={12} />
            <span>路线进度</span>
          </div>
          <div className="mt-2 h-1.5 bg-mountain-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-ice-500 to-ice-400"
              style={{ width: `${state.progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-mountain-500">
            <span>塘口村</span>
            <span>{state.progress}%</span>
            <span>南塬村</span>
          </div>
        </div>

        {/* Recent narrative logs */}
        <div className="mt-4 space-y-1">
          {state.log.slice(-5).map(entry => (
            <div
              key={entry.id}
              className={`text-xs py-1.5 px-3 rounded-r-md border-l-2 ${
                entry.type === 'danger' ? 'bg-danger-500/8 text-danger-400 border-danger-500/40' :
                entry.type === 'warning' ? 'bg-warning-500/8 text-warning-400 border-warning-500/40' :
                entry.type === 'success' ? 'bg-success-500/8 text-success-400 border-success-500/40' :
                entry.type === 'narrative' ? 'bg-ice-500/8 text-ice-400 border-ice-500/40' :
                entry.type === 'memorial' ? 'bg-purple-500/8 text-purple-400 border-purple-500/40' :
                'bg-mountain-700/30 text-mountain-400 border-mountain-600/40'
              }`}
            >
              {entry.message}
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-4 border-t border-mountain-700/50">
        {/* Direction choices */}
        {nextNodes.length > 0 && (
          <div className="mb-3">
            <h3 className="text-xs font-bold text-mountain-400 mb-2 tracking-wider uppercase">选择方向</h3>
            <div className="flex flex-wrap gap-2">
              {nextNodes.map(node => {
                const nd = dangerLabel(node.dangerLevel)
                return (
                  <button
                    key={node.id}
                    onClick={() => handleMove(node.id)}
                    className="choice-btn flex items-center gap-2 px-4 py-2.5 bg-mountain-700/60 hover:bg-mountain-600/80
                      border border-mountain-600/50 hover:border-ice-500/40 rounded-lg text-sm text-mountain-100
                      transition-all duration-200 cursor-pointer group"
                  >
                    <ArrowRight size={14} className="text-mountain-400 group-hover:text-ice-400 transition-colors" />
                    <span className="group-hover:text-white transition-colors">{node.name}</span>
                    <span className="text-xs text-mountain-500">{node.altitude}m</span>
                    <span className={`text-xs ${nd.color}`}>{nd.text}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Utility buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={makeCamp}
            disabled={!state.inventory.tent}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-mountain-700/60 hover:bg-mountain-600/80
              border border-mountain-600/50 rounded-md text-xs text-mountain-300 transition-all
              disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:text-mountain-100"
          >
            <Tent size={13} /> 扎营休息
          </button>
          <button
            onClick={eatAndDrink}
            disabled={state.inventory.food <= 0 && state.inventory.water <= 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-mountain-700/60 hover:bg-mountain-600/80
              border border-mountain-600/50 rounded-md text-xs text-mountain-300 transition-all
              disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:text-mountain-100"
          >
            <UtensilsCrossed size={13} /> 进食补水
          </button>
          <button
            onClick={useFirstAid}
            disabled={!state.inventory.firstAidKit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-mountain-700/60 hover:bg-mountain-600/80
              border border-mountain-600/50 rounded-md text-xs text-mountain-300 transition-all
              disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:text-mountain-100"
          >
            <Heart size={13} /> 使用急救包
          </button>
        </div>
      </div>
    </div>
  )
}

// ===== Event Selection Screen =====
function EventScreen() {
  const state = useSnapshot(gameState)
  const event = state.pendingEvent

  if (!event) return null

  const categoryConfig: Record<string, { icon: typeof AlertTriangle; color: string; bg: string; border: string; label: string }> = {
    terrain: { icon: Mountain, color: 'text-orange-400', bg: 'bg-orange-500/8', border: 'border-orange-500/30', label: '地形事件' },
    weather: { icon: AlertTriangle, color: 'text-blue-400', bg: 'bg-blue-500/8', border: 'border-blue-500/30', label: '天气事件' },
    encounter: { icon: Flame, color: 'text-green-400', bg: 'bg-green-500/8', border: 'border-green-500/30', label: '遭遇事件' },
    discovery: { icon: Flame, color: 'text-yellow-400', bg: 'bg-yellow-500/8', border: 'border-yellow-500/30', label: '发现事件' },
    crisis: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/8', border: 'border-red-500/30', label: '危机事件' },
    memorial: { icon: Flame, color: 'text-purple-400', bg: 'bg-purple-500/8', border: 'border-purple-500/30', label: '纪念事件' },
  }

  const config = categoryConfig[event.category] || categoryConfig.terrain
  const Icon = config.icon
  const isMemorial = event.category === 'memorial'

  return (
    <div className={`bg-mountain-800/80 backdrop-blur rounded-lg border h-full flex flex-col card-atmosphere ${
      isMemorial ? 'border-purple-500/30 memorial-card' : 'border-mountain-700/60'
    }`}>
      {/* Event header */}
      <div className={`p-5 border-b ${isMemorial ? 'border-purple-500/20' : config.border}`}>
        <div className="flex items-center gap-2">
          <Icon size={18} className={config.color} />
          <h2 className={`text-lg font-bold ${config.color}`}>{event.title}</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${config.border} ${config.color} bg-current/5`}>
            {config.label}
          </span>
          {isMemorial && (
            <span className="text-xs bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded">真实事故纪念</span>
          )}
        </div>
        <p className="mt-3 text-sm text-mountain-200 leading-relaxed story-text">
          {event.description}
        </p>
      </div>

      {/* Choice list */}
      <div className="flex-1 p-5 overflow-y-auto">
        <h3 className="text-xs font-bold text-mountain-400 mb-3 tracking-wider uppercase">做出你的选择</h3>
        <div className="space-y-3">
          {event.choices.map((choice, idx) => (
            <button
              key={choice.id}
              onClick={() => handleEventChoice(choice.id)}
              className={`choice-btn w-full text-left p-4 rounded-lg border transition-all duration-250 cursor-pointer
                ${config.bg} ${config.border} hover:brightness-150 hover:scale-[1.01]`}
            >
              <div className="flex items-start gap-3">
                <span className={`text-lg font-bold ${config.color} opacity-40`}>{idx + 1}</span>
                <div className="flex-1">
                  <p className={`font-medium text-sm ${config.color}`}>{choice.text}</p>
                  <p className="text-xs text-mountain-400 mt-1 leading-relaxed">{choice.narrative}</p>
                </div>
                <ArrowRight size={16} className={`${config.color} mt-0.5 shrink-0 opacity-40`} />
              </div>
            </button>
          ))}
        </div>

        {isMemorial && (
          <button
            onClick={skipEvent}
            className="mt-4 flex items-center gap-1.5 px-3 py-1.5 bg-mountain-700/60 hover:bg-mountain-600/80
              border border-mountain-600/50 rounded-md text-xs text-mountain-400 transition-all cursor-pointer"
          >
            <SkipForward size={12} /> 默默走过
          </button>
        )}
      </div>

      {/* Recent log */}
      {state.log.length > 0 && (
        <div className="p-3 border-t border-mountain-700/40 max-h-24 overflow-y-auto">
          {state.log.slice(-3).map(entry => (
            <div
              key={entry.id}
              className={`text-xs py-0.5 px-2 ${
                entry.type === 'danger' ? 'text-danger-400' :
                entry.type === 'warning' ? 'text-warning-400' :
                entry.type === 'success' ? 'text-success-400' :
                entry.type === 'memorial' ? 'text-purple-400' :
                'text-mountain-400'
              }`}
            >
              {entry.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ===== Start Screen with Prologue =====
function StartScreen() {
  const [showContent, setShowContent] = useState(false)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 800)
    const t2 = setTimeout(() => setShowButton(true), 2500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Mountain silhouette background */}
      <div className="absolute inset-0 flex items-end justify-center pointer-events-none opacity-10">
        <svg viewBox="0 0 1200 400" className="w-full" preserveAspectRatio="none">
          <path d="M0,400 L100,300 L200,350 L350,180 L500,300 L600,150 L700,250 L800,100 L900,200 L1000,120 L1100,280 L1200,200 L1200,400 Z" fill="url(#mountainGrad)" />
          <defs>
            <linearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0a0e17" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className={`text-center max-w-2xl relative z-10 transition-all duration-1000 ${
        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {/* Title */}
        <div className="mb-2">
          <span className="text-5xl">🏔️</span>
        </div>
        <h1 className="text-4xl font-bold text-mountain-100 mb-1 tracking-widest">
          血战鳌太线
        </h1>
        <p className="text-sm text-ice-400/80 tracking-[0.3em] mb-8">鳌太线生存冒险</p>

        {/* Prologue */}
        <div className="bg-mountain-800/60 backdrop-blur rounded-xl p-6 mb-6 border border-mountain-700/40 text-left">
          <p className="text-xs text-ice-400 font-bold mb-3 tracking-wider uppercase">序章 · 出发</p>
          <div className="story-text text-sm text-mountain-200 space-y-3">
            <p>
              2026年的初秋，你站在秦岭北麓的塘口村。
            </p>
            <p>
              背上28公斤的装备，你将踏上一条被称作「中华龙脊」的死亡路线——鳌太线。
              从塘口村到南塬村，170公里的山脊纵穿，连续翻越17座海拔3400米以上的山峰。
            </p>
            <p>
              这条路，已经夺去了数十条生命。每一块碎石下，都可能埋着前人的遗骸。
              每一阵风里，都夹杂着他们的低语。
            </p>
            <p className="text-dawn/80">
              你能活着走出来吗？
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="bg-mountain-800/40 rounded-xl p-5 mb-6 border border-mountain-700/30 text-left">
          <div className="grid grid-cols-2 gap-4 text-xs text-mountain-300">
            <div className="space-y-2">
              <p className="text-ice-400 font-bold">生存系统</p>
              <p>· 体温 / 体力 / 水分 / 饱腹</p>
              <p>· 10种装备，各有损耗</p>
              <p>· 天气完全随机化</p>
            </div>
            <div className="space-y-2">
              <p className="text-ice-400 font-bold">叙事系统</p>
              <p>· 50+随机事件，概率分支</p>
              <p>· 真实事故纪念</p>
              <p>· 每次游玩都是不同故事</p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-red-950/30 rounded-xl p-4 mb-8 border border-red-500/20">
          <p className="text-xs text-red-300/80 leading-relaxed">
            本游戏基于2002-2026年鳌太线真实事故数据创作。所有事故案例均有真实来源。
            请尊重每一位遇难者，将本游戏视为户外安全教育的工具。
            <span className="text-red-400 font-bold">鳌太线穿越已被明令禁止，切勿尝试。</span>
          </p>
        </div>

        {/* Start button */}
        <div className={`transition-all duration-700 ${
          showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <button
            onClick={startGame}
            className="btn-mountain px-10 py-3.5 text-white font-bold rounded-xl text-base
              tracking-wider cursor-pointer"
          >
            踏上鳌太线
          </button>
        </div>
      </div>
    </div>
  )
}

// ===== End Screen =====
function EndScreen() {
  const state = useSnapshot(gameState)
  const ending = (endingsData as any[]).find(e => e.id === state.ending)

  const typeConfig: Record<string, { label: string; icon: string; color: string }> = {
    'HE': { label: '成功结局', icon: '🏔️', color: 'text-emerald-400' },
    'normal': { label: '常规结局', icon: '⛰️', color: 'text-mountain-300' },
    'BE': { label: '悲剧结局', icon: '🕯️', color: 'text-red-400' },
    'tragic': { label: '致敬结局', icon: '🕯️', color: 'text-purple-400' },
  }

  const config = typeConfig[ending?.type] || typeConfig.normal

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 relative">
      <div className="text-center max-w-lg">
        <div className="text-6xl mb-4">{config.icon}</div>
        <h2 className={`text-3xl font-bold text-mountain-100 mb-2 tracking-wide`}>
          {ending?.title || '旅程结束'}
        </h2>
        <p className={`text-sm ${config.color} mb-6 tracking-wider`}>{config.label}</p>
        <div className="bg-mountain-800/60 rounded-xl p-6 mb-6 border border-mountain-700/40">
          <p className="story-text text-sm text-mountain-200 leading-relaxed">
            {ending?.description || '你的鳌太线之旅结束了。'}
          </p>
        </div>
        <div className="bg-mountain-800/40 rounded-lg p-4 mb-8 border border-mountain-700/30">
          <div className="flex justify-center gap-6 text-xs text-mountain-400">
            <span>历时 <span className="text-mountain-200 font-bold">{state.dayCount}</span> 天</span>
            <span>事故知识 <span className="text-warning-400 font-bold">{state.knowledgePoints}</span> 点</span>
            <span>运气值 <span className="text-success-400 font-bold">{state.luck.toFixed(1)}</span></span>
          </div>
        </div>
        <button
          onClick={resetGame}
          className="btn-mountain px-8 py-3 text-white font-bold rounded-xl text-sm
            tracking-wider cursor-pointer"
        >
          <span className="flex items-center gap-2"><RotateCcw size={14} /> 重新开始</span>
        </button>
      </div>
    </div>
  )
}
