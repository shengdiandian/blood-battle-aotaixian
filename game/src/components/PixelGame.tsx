import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import MainScene from '../game/scenes/MainScene'
import { useSnapshot } from 'valtio'
import { gameState, getCurrentNode } from '../store/gameStore'

export default function PixelGame() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const sceneRef = useRef<MainScene | null>(null)
  const state = useSnapshot(gameState)
  const prevNode = useRef(state.currentNode)

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 640,
      height: 360,
      backgroundColor: '#0f172a',
      pixelArt: true,
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [MainScene],
    }

    const game = new Phaser.Game(config)
    gameRef.current = game

    const check = setInterval(() => {
      const scene = game.scene.getScene('MainScene') as MainScene
      if (scene && scene.scene.isActive()) {
        sceneRef.current = scene
        clearInterval(check)
        const node = getCurrentNode()
        scene.setTerrain(node.terrainType)
        scene.setWeather(state.weather.condition)
      }
    }, 100)

    return () => {
      clearInterval(check)
      game.destroy(true)
      gameRef.current = null
      sceneRef.current = null
    }
  }, [])

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    const node = getCurrentNode()
    scene.setTerrain(node.terrainType)
    if (prevNode.current !== state.currentNode) {
      // Flash transition
      scene.cameras.main.flash(300, 0, 0, 0)
    }
    prevNode.current = state.currentNode
  }, [state.currentNode])

  useEffect(() => {
    sceneRef.current?.setWeather(state.weather.condition)
  }, [state.weather.condition])

  return (
    <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
      <div ref={containerRef} className="w-full h-full rounded-lg overflow-hidden border border-mountain-700/60" />

      {/* HUD overlay */}
      <div className="absolute top-2 left-2 bg-mountain-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-mountain-700/50">
        <div className="text-sm font-mono text-ice-400 font-bold">{getCurrentNode().name}</div>
        <div className="text-xs font-mono text-mountain-400">{getCurrentNode().altitude}m · {getCurrentNode().terrainType}</div>
      </div>

      <div className="absolute top-2 right-2 bg-mountain-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-mountain-700/50">
        <div className="text-xs font-mono text-mountain-300">
          {state.weather.condition} {state.weather.temperature}°C
        </div>
        <div className="text-xs font-mono text-mountain-500">第{state.dayCount}天 {String(state.hourCount).padStart(2,'0')}:00</div>
      </div>

      {/* Status bars */}
      <div className="absolute bottom-2 left-2 right-2 flex gap-2">
        <Bar label="❤️" value={state.health} color="#ef4444" />
        <Bar label="⚡" value={state.stamina} color="#22c55e" />
        <Bar label="💧" value={state.hydration} color="#38bdf8" />
        <Bar label="🍖" value={state.hunger} color="#f59e0b" />
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-mountain-900/70 rounded px-2 py-0.5 text-xs font-mono text-mountain-500">
        WASD / 方向键移动 · E 互动
      </div>

      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)' }}
      />
    </div>
  )
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex-1 bg-mountain-900/80 rounded px-1.5 py-0.5 border border-mountain-700/40 flex items-center gap-1">
      <span className="text-xs">{label}</span>
      <div className="flex-1 h-2 bg-mountain-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-mono text-mountain-400 w-6 text-right">{value}</span>
    </div>
  )
}
