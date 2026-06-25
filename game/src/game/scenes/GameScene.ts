import Phaser from 'phaser'
import { generateTerrainSprite, generateCharacterSprites, generateSnowParticle, generateRainDrop, TERRAIN_MAP } from '../pixelArt'

export default class GameScene extends Phaser.Scene {
  private terrainSprite!: Phaser.GameObjects.Image
  private characterFrames: Phaser.GameObjects.Image[] = []
  private currentFrame = 0
  private frameTimer = 0
  private snowEmitter!: Phaser.GameObjects.Particles.ParticleEmitter
  private rainEmitter!: Phaser.GameObjects.Particles.ParticleEmitter
  private weatherType = '晴'
  private isWalking = false
  private walkTargetX = 0
  private onMoveComplete?: () => void

  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    const { width, height } = this.scale

    // Generate terrain sprite
    const terrainCanvas = generateTerrainSprite('stone')
    this.textures.addCanvas('terrain_stone', terrainCanvas)
    this.terrainSprite = this.add.image(width / 2, height * 0.65, 'terrain_stone')
    this.terrainSprite.setDisplaySize(width, height * 0.5)

    // Generate character frames
    const charFrames = generateCharacterSprites()
    this.characterFrames = charFrames.map((canvas, i) => {
      const key = `char_${i}`
      this.textures.addCanvas(key, canvas)
      return this.add.image(width * 0.3, height * 0.58, key)
        .setDisplaySize(48, 72)
        .setOrigin(0.5, 1)
        .setVisible(i === 0)
    })

    // Generate particle textures
    const snowCanvas = generateSnowParticle()
    const rainCanvas = generateRainDrop()
    this.textures.addCanvas('snow_particle', snowCanvas)
    this.textures.addCanvas('rain_particle', rainCanvas)

    // Snow emitter
    this.snowEmitter = this.add.particles(0, 0, 'snow_particle', {
      x: { min: 0, max: width },
      y: -10,
      lifespan: { min: 3000, max: 6000 },
      speedY: { min: 30, max: 80 },
      speedX: { min: -20, max: 20 },
      scale: { start: 0.5, end: 1 },
      alpha: { start: 0.8, end: 0 },
      frequency: 100,
      quantity: 2,
      emitting: false,
    })

    // Rain emitter
    this.rainEmitter = this.add.particles(0, 0, 'rain_particle', {
      x: { min: 0, max: width },
      y: -20,
      lifespan: 800,
      speedY: { min: 200, max: 400 },
      speedX: { min: -30, max: -10 },
      scale: 0.4,
      alpha: { start: 0.6, end: 0 },
      frequency: 50,
      quantity: 3,
      emitting: false,
    })

    // Title
    this.add.text(width / 2, 30, '⛰ 鳌太线', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#e2e8f0',
      stroke: '#0a0e17',
      strokeThickness: 3,
    }).setOrigin(0.5)

    this.add.text(width / 2, 55, '海拔 3400m · 危险等级 ★★★★★', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#94a3b8',
    }).setOrigin(0.5)
  }

  setTerrain(type: string) {
    const terrainKey = TERRAIN_MAP[type] || 'stone'
    const texKey = `terrain_${terrainKey}`
    if (!this.textures.exists(texKey)) {
      const canvas = generateTerrainSprite(terrainKey)
      this.textures.addCanvas(texKey, canvas)
    }
    this.terrainSprite.setTexture(texKey)
  }

  setWeather(weather: string) {
    this.weatherType = weather
    const { width } = this.scale

    this.snowEmitter.stop()
    this.rainEmitter.stop()

    switch (weather) {
      case '暴风雪':
        this.snowEmitter.start()
        ;(this.snowEmitter as any).frequency = 30
        ;(this.snowEmitter as any).quantity = 4
        break
      case '冰雹':
        this.snowEmitter.start()
        ;(this.snowEmitter as any).frequency = 50
        ;(this.snowEmitter as any).quantity = 3
        break
      case '大雨':
      case '小雨':
        this.rainEmitter.start()
        ;(this.rainEmitter as any).frequency = weather === '大雨' ? 30 : 80
        break
    }

    const bgColors: Record<string, number> = {
      '晴': 0x0f172a,
      '多云': 0x1a2230,
      '雾': 0x253040,
      '大雨': 0x0d1117,
      '暴风雪': 0x0a0d12,
      '冰雹': 0x0a0d12,
    }
    this.cameras.main.setBackgroundColor(bgColors[weather] || 0x0f172a)
  }

  walkTo(targetX: number, onComplete?: () => void) {
    this.isWalking = true
    this.walkTargetX = targetX
    this.onMoveComplete = onComplete
  }

  update(_time: number, delta: number) {
    this.frameTimer += delta
    if (this.frameTimer > 200) {
      this.frameTimer = 0
      this.characterFrames.forEach(f => f.setVisible(false))

      if (this.isWalking) {
        this.currentFrame = (this.currentFrame + 1) % 3
        const char = this.characterFrames[this.currentFrame]
        char.setVisible(true)

        const dx = this.walkTargetX - char.x
        if (Math.abs(dx) > 5) {
          char.x += Math.sign(dx) * 2
          char.setFlipX(dx < 0)
        } else {
          this.isWalking = false
          this.characterFrames[0].setVisible(true)
          this.onMoveComplete?.()
        }
      } else {
        this.characterFrames[0].setVisible(true)
      }
    }

    if (!this.isWalking) {
      const breath = Math.sin(Date.now() * 0.003) * 2
      this.characterFrames[0].y = this.scale.height * 0.58 + breath
    }
  }
}
