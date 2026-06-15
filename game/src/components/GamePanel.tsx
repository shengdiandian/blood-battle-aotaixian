import { useSnapshot } from 'valtio'
import { gameState, getCurrentNode, moveToNode, makeCamp, eatAndDrink, useFirstAid, startGame, resetGame, getRouteNodes, handleEventChoice, skipEvent } from '../store/gameStore'
import { Mountain, Tent, UtensilsCrossed, Heart, ArrowRight, RotateCcw, AlertTriangle, Flame, SkipForward } from 'lucide-react'
import type { RouteNode } from '../types'
import endingsData from '../data/endings.json'

function getNodeById(id: string): RouteNode | undefined {
  return getRouteNodes().find(n => n.id === id)
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

  const dangerColor = (level: number) => {
    if (level <= 2) return 'text-success-400'
    if (level <= 3) return 'text-warning-400'
    return 'text-danger-400'
  }

  const handleMove = (nodeId: string) => {
    moveToNode(nodeId)
  }

  return (
    <div className="bg-mountain-800 rounded-lg border border-mountain-700 h-full flex flex-col">
      {/* 场景标题 */}
      <div className="p-4 border-b border-mountain-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-mountain-100 flex items-center gap-2">
            <Mountain size={20} className="text-ice-500" />
            {currentNode.name}
          </h2>
          <div className="flex items-center gap-3 text-xs text-mountain-400">
            <span>海拔 {currentNode.altitude}m</span>
            <span>距离 {currentNode.distance}km</span>
            <span className={dangerColor(currentNode.dangerLevel)}>
              危险 {'★'.repeat(currentNode.dangerLevel)}{'☆'.repeat(5 - currentNode.dangerLevel)}
            </span>
          </div>
        </div>
        <div className="mt-1 text-xs text-mountain-400">
          地貌：{currentNode.terrainType} | 预计耗时：{currentNode.baseTimeCost}小时
        </div>
      </div>

      {/* 叙事文本 */}
      <div className="flex-1 p-4 overflow-y-auto">
        <p className="text-mountain-200 leading-relaxed text-sm">
          {currentNode.description}
        </p>

        {/* 最近日志 */}
        <div className="mt-4 space-y-1">
          {state.log.slice(-6).map(entry => (
            <div
              key={entry.id}
              className={`text-xs py-1 px-2 rounded ${
                entry.type === 'danger' ? 'bg-danger-500/10 text-danger-400' :
                entry.type === 'warning' ? 'bg-warning-500/10 text-warning-400' :
                entry.type === 'success' ? 'bg-success-500/10 text-success-400' :
                entry.type === 'narrative' ? 'bg-ice-500/10 text-ice-400' :
                entry.type === 'memorial' ? 'bg-purple-500/10 text-purple-400' :
                'bg-mountain-700/50 text-mountain-300'
              }`}
            >
              {entry.message}
            </div>
          ))}
        </div>
      </div>

      {/* 行动按钮 */}
      <div className="p-4 border-t border-mountain-700">
        <div className="mb-3">
          <h3 className="text-xs font-bold text-mountain-300 mb-2">选择前进方向</h3>
          <div className="flex flex-wrap gap-2">
            {nextNodes.map(node => (
              <button
                key={node.id}
                onClick={() => handleMove(node.id)}
                className="flex items-center gap-1.5 px-3 py-2 bg-mountain-700 hover:bg-mountain-600 
                  border border-mountain-600 hover:border-ice-500/50 rounded-lg text-sm text-mountain-100 
                  transition-all duration-200 cursor-pointer"
              >
                <ArrowRight size={14} />
                <span>{node.name}</span>
                <span className="text-xs text-mountain-400">{node.altitude}m</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={makeCamp}
            disabled={!state.inventory.tent}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-mountain-700 hover:bg-mountain-600 
              border border-mountain-600 rounded text-xs text-mountain-200 transition-all 
              disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Tent size={12} /> 扎营休息
          </button>
          <button
            onClick={eatAndDrink}
            disabled={state.inventory.food <= 0 && state.inventory.water <= 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-mountain-700 hover:bg-mountain-600 
              border border-mountain-600 rounded text-xs text-mountain-200 transition-all 
              disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <UtensilsCrossed size={12} /> 进食补水
          </button>
          <button
            onClick={useFirstAid}
            disabled={!state.inventory.firstAidKit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-mountain-700 hover:bg-mountain-600 
              border border-mountain-600 rounded text-xs text-mountain-200 transition-all 
              disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Heart size={12} /> 使用急救包
          </button>
        </div>
      </div>
    </div>
  )
}

// ===== 事件选择界面 =====
function EventScreen() {
  const state = useSnapshot(gameState)
  const event = state.pendingEvent

  if (!event) return null

  const categoryConfig: Record<string, { icon: typeof AlertTriangle; color: string; bg: string; border: string }> = {
    terrain: { icon: Mountain, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
    weather: { icon: AlertTriangle, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    encounter: { icon: Flame, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    discovery: { icon: Flame, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    crisis: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    memorial: { icon: Flame, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  }

  const config = categoryConfig[event.category] || categoryConfig.terrain
  const Icon = config.icon

  return (
    <div className="bg-mountain-800 rounded-lg border border-mountain-700 h-full flex flex-col">
      {/* 事件标题 */}
      <div className={`p-4 border-b ${config.border} ${config.bg}`}>
        <div className="flex items-center gap-2">
          <Icon size={20} className={config.color} />
          <h2 className={`text-lg font-bold ${config.color}`}>{event.title}</h2>
          {event.category === 'memorial' && (
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">真实事故纪念</span>
          )}
        </div>
        <p className="mt-2 text-sm text-mountain-200 leading-relaxed">
          {event.description}
        </p>
      </div>

      {/* 选择列表 */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h3 className="text-xs font-bold text-mountain-300 mb-3">做出你的选择：</h3>
        <div className="space-y-3">
          {event.choices.map(choice => (
            <button
              key={choice.id}
              onClick={() => handleEventChoice(choice.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 cursor-pointer
                ${config.bg} ${config.border} hover:brightness-125`}
            >
              <div className="flex items-start gap-2">
                <ArrowRight size={16} className={`${config.color} mt-0.5 shrink-0`} />
                <div>
                  <p className={`font-medium text-sm ${config.color}`}>{choice.text}</p>
                  <p className="text-xs text-mountain-400 mt-1">{choice.narrative}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* 纪念事件可以跳过 */}
        {event.category === 'memorial' && (
          <button
            onClick={skipEvent}
            className="mt-4 flex items-center gap-1.5 px-3 py-1.5 bg-mountain-700 hover:bg-mountain-600 
              border border-mountain-600 rounded text-xs text-mountain-300 transition-all cursor-pointer"
          >
            <SkipForward size={12} /> 默默走过
          </button>
        )}
      </div>

      {/* 最近日志 */}
      {state.log.length > 0 && (
        <div className="p-3 border-t border-mountain-700 max-h-24 overflow-y-auto">
          {state.log.slice(-3).map(entry => (
            <div
              key={entry.id}
              className={`text-xs py-0.5 px-1.5 rounded ${
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

function StartScreen() {
  return (
    <div className="bg-mountain-800 rounded-lg border border-mountain-700 h-full flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-lg">
        <div className="text-6xl mb-6">🏔️</div>
        <h1 className="text-3xl font-bold text-mountain-100 mb-2">血战鳌太线</h1>
        <p className="text-lg text-ice-400 mb-4">鳌太线生存冒险</p>
        <p className="text-sm text-mountain-300 mb-8 leading-relaxed">
          这是一款基于真实事故数据的交互式叙事游戏。你将扮演一名穿越鳌太线的徒步者，
          在约170公里的真实路线上连续翻越17座海拔3400米以上的山峰，
          面对随机天气变化、突发事件和艰难抉择。每次游玩都是不同的体验。
        </p>
        <div className="bg-mountain-700/50 rounded-lg p-4 mb-4 text-xs text-mountain-300 leading-relaxed">
          <p className="text-ice-400 font-bold mb-2">游戏特色</p>
          <ul className="space-y-1 text-left">
            <li>- 50+种随机事件，涵盖滑坠/天气/装备/扎营/发现/遭遇六大类</li>
            <li>- 每个选择都有概率结果，同样的选择可能不同结局</li>
            <li>- 天气系统完全随机化，高海拔随时可能变天</li>
            <li>- 装备损耗机制：帐篷/登山杖/睡袋都可能损坏或丢失</li>
            <li>- 扎营有风险：暴风雪毁帐篷、动物偷食物、大雨浸睡袋</li>
            <li>- 真实事故仅作纪念告警，不影响游戏逻辑</li>
          </ul>
        </div>
        <div className="bg-mountain-700/50 rounded-lg p-4 mb-8 text-xs text-mountain-300 leading-relaxed">
          <p className="text-warning-400 font-bold mb-2">⚠ 教育提示</p>
          <p>
            本游戏基于2002-2026年鳌太线真实事故数据创作。游戏中所有事故案例均有真实来源。
            请尊重每一位遇难者，将本游戏视为户外安全教育的工具，而非娱乐。
            鳌太线穿越已被明令禁止，切勿尝试。
          </p>
        </div>
        <button
          onClick={startGame}
          className="px-8 py-3 bg-ice-500 hover:bg-ice-400 text-mountain-900 font-bold rounded-lg 
            transition-all duration-200 text-lg cursor-pointer"
        >
          踏上鳌太线
        </button>
      </div>
    </div>
  )
}

function EndScreen() {
  const state = useSnapshot(gameState)
  const ending = (endingsData as any[]).find(e => e.id === state.ending)

  const typeLabel: Record<string, string> = {
    'HE': '成功结局',
    'normal': '常规结局',
    'BE': '悲剧结局',
    'tragic': '致敬结局',
  }

  return (
    <div className="bg-mountain-800 rounded-lg border border-mountain-700 h-full flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-lg">
        <div className="text-5xl mb-4">
          {state.ending === 'ending_he' ? '🏔️' : state.ending === 'ending_rescue' ? '🚁' : '🕯️'}
        </div>
        <h2 className="text-2xl font-bold text-mountain-100 mb-2">
          {ending?.title || '旅程结束'}
        </h2>
        <p className="text-sm text-mountain-400 mb-4">
          {typeLabel[ending?.type] || '结局'}
        </p>
        <p className="text-sm text-mountain-200 leading-relaxed mb-6">
          {ending?.description || '你的鳌太线之旅结束了。'}
        </p>
        <div className="bg-mountain-700/50 rounded-lg p-4 mb-6 text-xs text-mountain-300">
          <p>历时 {state.dayCount} 天 | 获得事故知识 {state.knowledgePoints} 点 | 运气值 {state.luck.toFixed(1)}</p>
        </div>
        <button
          onClick={resetGame}
          className="flex items-center gap-2 mx-auto px-6 py-2.5 bg-mountain-700 hover:bg-mountain-600 
            border border-mountain-600 rounded-lg text-sm text-mountain-200 transition-all cursor-pointer"
        >
          <RotateCcw size={14} /> 重新开始
        </button>
      </div>
    </div>
  )
}
