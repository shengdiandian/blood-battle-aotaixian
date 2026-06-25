import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import GameScene from '../game/scenes/GameScene'
import { useSnapshot } from 'valtio'
import { gameState, getCurrentNode } from '../store/gameStore'

export default function PixelGameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const sceneRef = useRef<GameScene | null>(null)
  const state = useSnapshot(gameState)

  // Initialize Phaser
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 400,
      height: 260,
      backgroundColor: '#0f172a',
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [GameScene],
    }

    const game = new Phaser.Game(config)
    gameRef.current = game

    game.events.once('ready', () => {
      sceneRef.current = game.scene.getScene('GameScene') as GameScene
    })

    return () => {
      game.destroy(true)
      gameRef.current = null
    }
  }, [])

  // Update terrain when node changes
  useEffect(() => {
    if (!sceneRef.current) return
    const node = getCurrentNode()
    sceneRef.current.setTerrain(node.terrainType)
  }, [state.currentNode])

  // Update weather
  useEffect(() => {
    if (!sceneRef.current) return
    sceneRef.current.setWeather(state.weather.condition)
  }, [state.weather.condition])

  // Walk animation on node change
  useEffect(() => {
    if (!sceneRef.current) return
    const scene = sceneRef.current
    const { width } = scene.scale
    // Walk from left to a random position, then back
    const targetX = width * 0.3 + Math.random() * width * 0.4
    scene.walkTo(targetX)
  }, [state.currentNode])

  return (
    <div className="relative w-full" style={{ aspectRatio: '400/260' }}>
      {/* Pixel art canvas */}
      <div
        ref={containerRef}
        className="w-full h-full rounded-lg overflow-hidden border border-mountain-700/60"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* Overlay: location info */}
      <div className="absolute top-2 left-2 bg-mountain-900/80 backdrop-blur-sm rounded px-2 py-1 border border-mountain-700/50">
        <div className="text-xs font-mono text-ice-400">
          {getCurrentNode().name}
        </div>
        <div className="text-xs font-mono text-mountain-500">
          {getCurrentNode().altitude}m · {getCurrentNode().terrainType}
        </div>
      </div>

      {/* Overlay: weather */}
      <div className="absolute top-2 right-2 bg-mountain-900/80 backdrop-blur-sm rounded px-2 py-1 border border-mountain-700/50">
        <div className="text-xs font-mono text-mountain-300">
          {state.weather.condition} {state.weather.temperature}°C
        </div>
      </div>

      {/* Overlay: status bars */}
      <div className="absolute bottom-2 left-2 right-2 flex gap-1">
        <StatusBar label="HP" value={state.health} color="#ef4444" />
        <StatusBar label="SP" value={state.stamina} color="#22c55e" />
        <StatusBar label="水分" value={state.hydration} color="#38bdf8" />
      </div>

      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
        }}
      />
    </div>
  )
}

function StatusBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex-1 bg-mountain-900/80 rounded-sm px-1.5 py-0.5 border border-mountain-700/50">
      <div className="flex items-center gap-1">
        <span className="text-xs font-mono text-mountain-500 w-6">{label}</span>
        <div className="flex-1 h-1.5 bg-mountain-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${value}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-xs font-mono text-mountain-400 w-6 text-right">{value}</span>
      </div>
    </div>
  )
}
