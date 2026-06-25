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
      width: 480,
      height: 320,
      backgroundColor: '#0f172a',
      pixelArt: true,
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
        scene.onInteract = () => {
          // Trigger interaction in game state
        }
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
      scene.cameras.main.flash(400, 0, 0, 0)
    }
    prevNode.current = state.currentNode
  }, [state.currentNode])

  useEffect(() => {
    sceneRef.current?.setWeather(state.weather.condition)
  }, [state.weather.condition])

  const node = getCurrentNode()

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-mountain-700/60" style={{ aspectRatio: '3/2' }}>
      <div ref={containerRef} className="w-full h-full" style={{ imageRendering: 'pixelated' }} />

      {/* HUD */}
      <div className="absolute top-2 left-2 bg-mountain-900/85 backdrop-blur-sm rounded px-2.5 py-1.5 border border-mountain-700/50">
        <div className="text-sm font-bold text-ice-400">{node.name}</div>
        <div className="text-xs text-mountain-400">{node.altitude}m · {node.terrainType}</div>
      </div>

      <div className="absolute top-2 right-2 bg-mountain-900/85 backdrop-blur-sm rounded px-2.5 py-1.5 border border-mountain-700/50">
        <div className="text-xs text-mountain-300">{state.weather.condition} {state.weather.temperature}°C</div>
        <div className="text-xs text-mountain-500">第{state.dayCount}天 {String(state.hourCount).padStart(2, '0')}:00</div>
      </div>

      {/* Bottom status */}
      <div className="absolute bottom-2 left-2 right-2 flex gap-1.5">
        <Bar icon="❤️" value={state.health} color="#ef4444" />
        <Bar icon="⚡" value={state.stamina} color="#22c55e" />
        <Bar icon="💧" value={state.hydration} color="#38bdf8" />
        <Bar icon="🍖" value={state.hunger} color="#f59e0b" />
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 text-xs text-mountain-600 pointer-events-none">
        WASD移动 · E互动
      </div>
    </div>
  )
}

function Bar({ icon, value, color }: { icon: string; value: number; color: string }) {
  return (
    <div className="flex-1 bg-mountain-900/80 rounded px-1 py-0.5 flex items-center gap-1">
      <span className="text-xs">{icon}</span>
      <div className="flex-1 h-1.5 bg-mountain-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-mono text-mountain-400 w-5 text-right">{value}</span>
    </div>
  )
}
