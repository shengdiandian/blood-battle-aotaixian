import { useSnapshot } from 'valtio'
import { gameState, getCurrentNode, moveToNode, makeCamp, eatAndDrink, useFirstAid, startGame, resetGame, getRouteNodes } from '../store/gameStore'
import { processNodeEvents } from '../game/eventSystem'
import { Mountain, Tent, UtensilsCrossed, Heart, ArrowRight, RotateCcw } from 'lucide-react'
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

  const nextNodes = currentNode.nextNodes.map(id => getNodeById(id)).filter(Boolean) as RouteNode[]

  const dangerColor = (level: number) => {
    if (level <= 2) return 'text-success-400'
    if (level <= 3) return 'text-warning-400'
    return 'text-danger-400'
  }

  const handleMove = (nodeId: string) => {
    moveToNode(nodeId)
    processNodeEvents(nodeId)
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
          {state.log.slice(-5).map(entry => (
            <div
              key={entry.id}
              className={`text-xs py-1 px-2 rounded ${
                entry.type === 'danger' ? 'bg-danger-500/10 text-danger-400' :
                entry.type === 'warning' ? 'bg-warning-500/10 text-warning-400' :
                entry.type === 'success' ? 'bg-success-500/10 text-success-400' :
                entry.type === 'narrative' ? 'bg-ice-500/10 text-ice-400' :
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
          面对真实天气变化、生理状态管理和路线选择。
        </p>
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
    'HE': '🎉 成功结局',
    'normal': '🚁 常规结局',
    'BE': '💀 悲剧结局',
    'tragic': '🕯️ 致敬结局',
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
          <p>历时 {state.dayCount} 天 | 获得事故知识 {state.knowledgePoints} 点</p>
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
