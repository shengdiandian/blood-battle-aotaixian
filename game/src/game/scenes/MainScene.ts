import Phaser from 'phaser'
import { generateCharacterFrames, generateTerrainTile, generateSnowflake, generateRaindrop, TERRAIN_MAP } from '../sprites'

const PLAYER_SPEED = 150

export default class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Image
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>
  private terrainBg!: Phaser.GameObjects.TileSprite
  private snowEmitter!: Phaser.GameObjects.Particles.ParticleEmitter
  private rainEmitter!: Phaser.GameObjects.Particles.ParticleEmitter
  private facing: 'down' | 'up' | 'left' | 'right' = 'down'
  private moving = false
  private frameIdx = 0
  private frameTimer = 0
  private hint!: Phaser.GameObjects.Text
  private touchDir = { x: 0, y: 0 }
  private joystickBase!: Phaser.GameObjects.Arc
  private joystickThumb!: Phaser.GameObjects.Arc
  private joystickActive = false
  private joystickPointer: number | null = null
  private interactBtn!: Phaser.GameObjects.Container

  public onInteract?: () => void

  constructor() {
    super({ key: 'MainScene' })
  }

  create() {
    const W = this.scale.width
    const H = this.scale.height

    // Load character frames
    const charFrames = generateCharacterFrames()
    charFrames.forEach((canvas, key) => {
      if (!this.textures.exists(`char_${key}`)) {
        this.textures.addCanvas(`char_${key}`, canvas)
      }
    })

    // Terrain
    this.loadTerrainTile('grass')
    this.terrainBg = this.add.tileSprite(0, 0, W, H, 'tile_grass').setOrigin(0).setScrollFactor(0)

    // Player - use first frame
    this.player = this.add.image(W / 2, H / 2, 'char_down_0')
      .setScale(3)
      .setDepth(10)

    // Keyboard
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys()
      this.wasd = {
        W: this.input.keyboard.addKey('W'),
        A: this.input.keyboard.addKey('A'),
        S: this.input.keyboard.addKey('S'),
        D: this.input.keyboard.addKey('D'),
      }
    }

    // Interaction hint
    this.hint = this.add.text(W / 2, H - 80, '[E] 互动', {
      fontSize: '16px', fontFamily: 'monospace', color: '#fbbf24',
      stroke: '#0a0e17', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20).setAlpha(0)

    // Interact button (for mobile)
    const btnBg = this.add.circle(0, 0, 28, 0xfbbf24, 0.3).setStrokeStyle(2, 0xfbbf24)
    const btnText = this.add.text(0, 0, 'E', {
      fontSize: '18px', fontFamily: 'monospace', color: '#fbbf24', fontStyle: 'bold',
    }).setOrigin(0.5)
    this.interactBtn = this.add.container(W - 50, H - 50, [btnBg, btnText]).setDepth(20).setAlpha(0).setScrollFactor(0)
    btnBg.setInteractive()
    btnBg.on('pointerdown', () => this.onInteract?.())

    // Joystick
    this.createJoystick(W, H)

    // Weather particles
    this.initWeatherParticles(W, H)

    // Title
    this.add.text(W / 2, 16, '⛰ 鳌太线', {
      fontSize: '22px', fontFamily: 'monospace', color: '#e2e8f0',
      stroke: '#0a0e17', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(18).setScrollFactor(0)
  }

  private createJoystick(W: number, H: number) {
    const cx = 70, cy = H - 70
    this.joystickBase = this.add.circle(cx, cy, 40, 0xffffff, 0.08)
      .setStrokeStyle(2, 0xffffff, 0.2)
      .setDepth(20).setScrollFactor(0).setInteractive()

    this.joystickThumb = this.add.circle(cx, cy, 18, 0xffffff, 0.15)
      .setStrokeStyle(1.5, 0xffffff, 0.3)
      .setDepth(21).setScrollFactor(0)

    this.joystickBase.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.joystickActive = true
      this.joystickPointer = p.id
    })

    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!this.joystickActive || p.id !== this.joystickPointer) return
      const base = this.joystickBase
      const dx = p.x - base.x
      const dy = p.y - base.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const maxDist = 35
      const clampedDist = Math.min(dist, maxDist)
      const angle = Math.atan2(dy, dx)
      this.joystickThumb.x = base.x + Math.cos(angle) * clampedDist
      this.joystickThumb.y = base.y + Math.sin(angle) * clampedDist
      this.touchDir.x = (Math.cos(angle) * clampedDist) / maxDist
      this.touchDir.y = (Math.sin(angle) * clampedDist) / maxDist
    })

    this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      if (p.id === this.joystickPointer) {
        this.joystickActive = false
        this.joystickPointer = null
        this.joystickThumb.x = this.joystickBase.x
        this.joystickThumb.y = this.joystickBase.y
        this.touchDir.x = 0
        this.touchDir.y = 0
      }
    })
  }

  private initWeatherParticles(W: number, H: number) {
    if (!this.textures.exists('snowflake')) {
      this.textures.addCanvas('snowflake', generateSnowflake())
    }
    if (!this.textures.exists('raindrop')) {
      this.textures.addCanvas('raindrop', generateRaindrop())
    }

    this.snowEmitter = this.add.particles(0, 0, 'snowflake', {
      x: { min: 0, max: W }, y: -10,
      lifespan: { min: 4000, max: 7000 },
      speedY: { min: 25, max: 60 }, speedX: { min: -10, max: 10 },
      scale: { start: 0.8, end: 1.5 },
      alpha: { start: 0.8, end: 0 },
      frequency: 120, quantity: 1, emitting: false,
    }).setDepth(15).setScrollFactor(0)

    this.rainEmitter = this.add.particles(0, 0, 'raindrop', {
      x: { min: 0, max: W }, y: -20,
      lifespan: 500,
      speedY: { min: 300, max: 500 }, speedX: { min: -15, max: -5 },
      scale: 0.6, alpha: { start: 0.5, end: 0 },
      frequency: 30, quantity: 2, emitting: false,
    }).setDepth(15).setScrollFactor(0)
  }

  private loadTerrainTile(type: string) {
    const key = `tile_${type}`
    if (!this.textures.exists(key)) {
      this.textures.addCanvas(key, generateTerrainTile(type))
    }
  }

  setTerrain(type: string) {
    const mapped = TERRAIN_MAP[type] || 'grass'
    this.loadTerrainTile(mapped)
    this.terrainBg?.setTexture(`tile_${mapped}`)
    // Randomize tile offset for variety
    if (this.terrainBg) {
      this.terrainBg.tilePositionX = Math.random() * 64
      this.terrainBg.tilePositionY = Math.random() * 64
    }
  }

  setWeather(weather: string) {
    this.snowEmitter.stop()
    this.rainEmitter.stop()

    switch (weather) {
      case '暴风雪':
        this.snowEmitter.start()
        this.cameras.main.setBackgroundColor(0x0a0d12)
        break
      case '冰雹':
        this.snowEmitter.start()
        this.cameras.main.setBackgroundColor(0x0a0d12)
        break
      case '大雨':
      case '小雨':
        this.rainEmitter.start()
        this.cameras.main.setBackgroundColor(0x0d1117)
        break
      case '雾':
        this.cameras.main.setBackgroundColor(0x1a2030)
        break
      default:
        this.cameras.main.setBackgroundColor(0x0f172a)
    }
  }

  update(_time: number, delta: number) {
    if (!this.player) return

    const speed = PLAYER_SPEED * (delta / 1000)
    let dx = 0, dy = 0
    this.moving = false

    // Keyboard input
    if (this.cursors) {
      if (this.cursors.left.isDown || this.wasd?.A?.isDown) { dx = -speed; this.facing = 'left'; this.moving = true }
      else if (this.cursors.right.isDown || this.wasd?.D?.isDown) { dx = speed; this.facing = 'right'; this.moving = true }
      if (this.cursors.up.isDown || this.wasd?.W?.isDown) { dy = -speed; this.facing = 'up'; this.moving = true }
      else if (this.cursors.down.isDown || this.wasd?.S?.isDown) { dy = speed; this.facing = 'down'; this.moving = true }
    }

    // Touch input
    if (this.touchDir.x !== 0 || this.touchDir.y !== 0) {
      dx = this.touchDir.x * speed * 2
      dy = this.touchDir.y * speed * 2
      this.moving = true
      // Determine facing from direction
      if (Math.abs(this.touchDir.x) > Math.abs(this.touchDir.y)) {
        this.facing = this.touchDir.x < 0 ? 'left' : 'right'
      } else {
        this.facing = this.touchDir.y < 0 ? 'up' : 'down'
      }
    }

    // Apply movement
    const W = this.scale.width
    const H = this.scale.height
    const newX = Phaser.Math.Clamp(this.player.x + dx, 30, W - 30)
    const newY = Phaser.Math.Clamp(this.player.y + dy, 50, H - 30)
    this.player.setPosition(newX, newY)

    // Animation
    this.frameTimer += delta
    if (this.moving) {
      if (this.frameTimer > 180) {
        this.frameTimer = 0
        this.frameIdx = (this.frameIdx + 1) % 3
      }
    } else {
      this.frameIdx = 0
    }

    // Update sprite frame
    const texKey = `char_${this.facing}_${this.frameIdx}`
    if (this.textures.exists(texKey)) {
      this.player.setTexture(texKey)
      this.player.setScale(3)
    }

    // Walking bob
    if (this.moving) {
      this.player.y += Math.sin(Date.now() * 0.008) * 1
    }

    // Parallax
    if (this.terrainBg) {
      this.terrainBg.tilePositionX += dx * 0.2
      this.terrainBg.tilePositionY += dy * 0.2
    }

    // Interact key
    if (this.input.keyboard && Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('E'))) {
      this.onInteract?.()
    }
  }
}
