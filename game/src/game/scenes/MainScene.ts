import Phaser from 'phaser'
import { generateCharacterSheet, generateTerrainTiles, generateSnowflake, generateRaindrop, TERRAIN_MAP } from '../sprites'

const TILE = 32
const SCALE = 2
const MAP_W = 20
const MAP_H = 12
const PLAYER_SPEED = 120

export default class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>
  private terrainLayer!: Phaser.GameObjects.TileSprite
  private detailLayer!: Phaser.GameObjects.TileSprite
  private snowEmitter!: Phaser.GameObjects.Particles.ParticleEmitter
  private rainEmitter!: Phaser.GameObjects.Particles.ParticleEmitter
  private facing: 'down'|'up'|'left'|'right' = 'down'
  private moving = false
  private frameIdx = 0
  private frameTimer = 0
  private npcSprites: Phaser.GameObjects.Sprite[] = []
  private interactionZone!: Phaser.GameObjects.Zone
  private showInteractHint = false
  private hint!: Phaser.GameObjects.Text
  private weatherActive = '晴'

  // Callbacks to React
  public onNodeArrive?: (nodeId: string) => void
  public onInteract?: () => void

  constructor() {
    super({ key: 'MainScene' })
  }

  create() {
    const W = this.scale.width
    const H = this.scale.height

    // Generate and load sprites
    this.loadCharacterSprite()
    this.loadTerrain('grass')

    // Background
    this.terrainLayer = this.add.tileSprite(0, 0, W, H, 'terrain_ground').setOrigin(0).setScrollFactor(0)
    this.detailLayer = this.add.tileSprite(0, 0, W, H, 'terrain_detail').setOrigin(0).setScrollFactor(0).setAlpha(0.7)

    // Player
    this.player = this.add.sprite(W / 2, H / 2 + 30, 'char_down', 0)
      .setScale(SCALE)
      .setDepth(10)

    // Interaction zone around player
    this.interactionZone = this.add.zone(W / 2, H / 2, TILE * SCALE * 2, TILE * SCALE * 2)

    // Controls
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasd = {
      W: this.input.keyboard!.addKey('W'),
      A: this.input.keyboard!.addKey('A'),
      S: this.input.keyboard!.addKey('S'),
      D: this.input.keyboard!.addKey('D'),
    }

    // Interaction hint
    this.hint = this.add.text(W / 2, H - 60, '[E] 互动', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#fbbf24',
      stroke: '#0a0e17',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20).setAlpha(0)

    // Snow particle
    const snowCanvas = generateSnowflake()
    this.textures.addCanvas('snowflake', snowCanvas)
    this.snowEmitter = this.add.particles(0, 0, 'snowflake', {
      x: { min: 0, max: W },
      y: -10,
      lifespan: { min: 4000, max: 8000 },
      speedY: { min: 20, max: 60 },
      speedX: { min: -15, max: 15 },
      scale: { start: 0.5, end: 1.2 },
      alpha: { start: 0.9, end: 0 },
      frequency: 150,
      quantity: 1,
      emitting: false,
    }).setDepth(15)

    // Rain particle
    const rainCanvas = generateRaindrop()
    this.textures.addCanvas('raindrop', rainCanvas)
    this.rainEmitter = this.add.particles(0, 0, 'raindrop', {
      x: { min: 0, max: W },
      y: -20,
      lifespan: 600,
      speedY: { min: 250, max: 500 },
      speedX: { min: -20, max: -5 },
      scale: 0.5,
      alpha: { start: 0.5, end: 0 },
      frequency: 40,
      quantity: 2,
      emitting: false,
    }).setDepth(15)

    // Vignette overlay
    const vig = this.add.graphics()
    vig.fillStyle(0x000000, 0.3)
    vig.fillRect(0, 0, W, 20) // top
    vig.fillRect(0, H - 20, W, 20) // bottom
    vig.setDepth(16).setScrollFactor(0)
  }

  private loadCharacterSprite() {
    if (this.textures.exists('char_sheet')) return
    const sheet = generateCharacterSheet()
    this.textures.addCanvas('char_sheet', sheet)

    // Cut into individual frames
    const dirs = ['down', 'left', 'right', 'up']
    dirs.forEach((dir, row) => {
      for (let frame = 0; frame < 3; frame++) {
        const key = `char_${dir}_${frame}`
        // We'll use the sheet directly with frame rects
      }
    })
  }

  private loadTerrain(type: string) {
    const key = `terrain_${type}`
    if (!this.textures.exists(`${key}_ground`)) {
      const { ground, details } = generateTerrainTiles(type)
      this.textures.addCanvas(`${key}_ground`, ground)
      this.textures.addCanvas(`${key}_detail`, details)
    }
    this.terrainLayer?.setTexture(`${key}_ground`)
    this.detailLayer?.setTexture(`${key}_detail`)
  }

  setTerrain(type: string) {
    const mapped = TERRAIN_MAP[type] || 'grass'
    this.loadTerrain(mapped)
    // Shift terrain tile pattern for variety
    if (this.terrainLayer) {
      this.terrainLayer.tilePositionX = Math.random() * TILE * SCALE
      this.terrainLayer.tilePositionY = Math.random() * TILE * SCALE
    }
    if (this.detailLayer) {
      this.detailLayer.tilePositionX = Math.random() * TILE * SCALE
      this.detailLayer.tilePositionY = Math.random() * TILE * SCALE
    }
  }

  setWeather(weather: string) {
    this.weatherActive = weather
    const W = this.scale.width

    this.snowEmitter.stop()
    this.rainEmitter.stop()

    switch (weather) {
      case '暴风雪':
        this.snowEmitter.start()
        ;(this.snowEmitter as any).frequency = 40
        ;(this.snowEmitter as any).quantity = 3
        this.cameras.main.setBackgroundColor(0x0a0d12)
        break
      case '冰雹':
        this.snowEmitter.start()
        ;(this.snowEmitter as any).frequency = 60
        ;(this.snowEmitter as any).quantity = 2
        this.cameras.main.setBackgroundColor(0x0a0d12)
        break
      case '大雨':
      case '小雨':
        this.rainEmitter.start()
        ;(this.rainEmitter as any).frequency = weather === '大雨' ? 25 : 80
        this.cameras.main.setBackgroundColor(0x0d1117)
        break
      case '雾':
        this.cameras.main.setBackgroundColor(0x1a2030)
        break
      case '多云':
        this.cameras.main.setBackgroundColor(0x111827)
        break
      default:
        this.cameras.main.setBackgroundColor(0x0f172a)
    }
  }

  update(_time: number, delta: number) {
    if (!this.player || !this.cursors) return

    const speed = PLAYER_SPEED * (delta / 1000)
    let dx = 0, dy = 0
    this.moving = false

    // Movement
    if (this.cursors.left.isDown || this.wasd.A.isDown) { dx = -speed; this.facing = 'left'; this.moving = true }
    else if (this.cursors.right.isDown || this.wasd.D.isDown) { dx = speed; this.facing = 'right'; this.moving = true }
    if (this.cursors.up.isDown || this.wasd.W.isDown) { dy = -speed; this.facing = 'up'; this.moving = true }
    else if (this.cursors.down.isDown || this.wasd.S.isDown) { dy = speed; this.facing = 'down'; this.moving = true }

    // Apply movement with bounds
    const newX = Phaser.Math.Clamp(this.player.x + dx, 40, this.scale.width - 40)
    const newY = Phaser.Math.Clamp(this.player.y + dy, 40, this.scale.height - 40)
    this.player.setPosition(newX, newY)

    // Animation
    this.frameTimer += delta
    if (this.moving) {
      if (this.frameTimer > 150) {
        this.frameTimer = 0
        this.frameIdx = (this.frameIdx + 1) % 3
      }
      this.player.setFrame(this.frameIdx)
      // Walking bob
      this.player.y += Math.sin(Date.now() * 0.01) * 0.5
    } else {
      this.frameIdx = 0
      this.player.setFrame(0)
    }

    // Update texture based on facing
    const texKey = `char_${this.facing}_${this.frameIdx}`
    // Since we're using a spritesheet, we need to set the frame from the sheet
    const sheet = this.textures.get('char_sheet')
    if (sheet) {
      const frameX = this.frameIdx * 16 * 3
      const frameY = ['down','left','right','up'].indexOf(this.facing) * 24 * 3
      // Use crop to show correct frame
      this.player.setTexture('char_sheet')
      this.player.setCrop(frameX, frameY, 16 * 3, 24 * 3)
      this.player.setDisplaySize(16 * SCALE, 24 * SCALE)
    }

    // Parallax terrain scroll
    if (this.terrainLayer) {
      this.terrainLayer.tilePositionX += dx * 0.3
      this.terrainLayer.tilePositionY += dy * 0.3
    }
    if (this.detailLayer) {
      this.detailLayer.tilePositionX += dx * 0.5
      this.detailLayer.tilePositionY += dy * 0.5
    }

    // Interaction hint
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard!.addKey('E'))) {
      this.onInteract?.()
    }
  }
}
