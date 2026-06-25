// Pixel art sprite generator - procedural, no external assets needed
const PIXEL = 3 // each "pixel" is 3x3 screen pixels

// Color palettes (Stardew/Terraria style)
const PALETTE = {
  // Terrain
  stone: ['#4a4a4a', '#5c5c5c', '#6e6e6e', '#3a3a3a'],
  grass: ['#4a8c3f', '#3d7a34', '#5a9c4f', '#2d6a24'],
  ridge: ['#8b4513', '#a0522d', '#6b3410', '#c06030'],
  camp: ['#deb887', '#c4a06a', '#f5deb3', '#8b7355'],
  temple: ['#6a0dad', '#8a2be2', '#9370db', '#4b0082'],
  village: ['#8b7355', '#a0865a', '#c4a882', '#6b5b3a'],
  lake: ['#1e90ff', '#4169e1', '#87ceeb', '#0000cd'],
  forest: ['#228b22', '#2e8b57', '#32cd32', '#006400'],
  snow: ['#f0f8ff', '#e0e8f0', '#d0d8e0', '#ffffff'],
  // Character
  skin: ['#ffd5b4', '#e8b89a', '#c49a7a'],
  hair: ['#4a3728', '#6b4c3a', '#8b6c5a'],
  shirt: ['#2563eb', '#3b82f6', '#1d4ed8'],
  pants: ['#374151', '#4b5563', '#6b7280'],
  backpack: ['#92400e', '#b45309', '#78350f'],
  // Sky
  sky: ['#0f172a', '#1e293b', '#334155'],
  // UI
  danger: ['#ef4444', '#dc2626'],
  safe: ['#22c55e', '#16a34a'],
  water: ['#0ea5e9', '#38bdf8', '#7dd3fc'],
}

// Generate a single pixel block
function px(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size = PIXEL) {
  ctx.fillStyle = color
  ctx.fillRect(x * size, y * size, size, size)
}

// Generate terrain spritesheet
export function generateTerrainSprite(
  type: string,
  width: number = 100,
  height: number = 40
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width * PIXEL
  canvas.height = height * PIXEL
  const ctx = canvas.getContext('2d')!

  const colors = PALETTE[type as keyof typeof PALETTE] || PALETTE.stone

  // Sky gradient (top portion)
  for (let y = 0; y < height * 0.3; y++) {
    for (let x = 0; x < width; x++) {
      const skyIdx = Math.min(2, Math.floor(y / (height * 0.1)))
      px(ctx, x, y, PALETTE.sky[skyIdx], PIXEL)
    }
  }

  // Mountain/terrain shapes
  const terrainStart = Math.floor(height * 0.3)

  switch (type) {
    case 'stone': {
      // Rocky mountains
      for (let x = 0; x < width; x++) {
        const peakH = Math.floor(
          15 + 10 * Math.sin(x * 0.08) + 5 * Math.sin(x * 0.2 + 1) + 3 * Math.cos(x * 0.15)
        )
        for (let y = height - peakH; y < height; y++) {
          const colorIdx = Math.floor(Math.random() * colors.length)
          px(ctx, x, y, colors[colorIdx])
        }
        // Rock details
        if (Math.random() > 0.85) {
          const rockY = height - peakH + Math.floor(Math.random() * 5)
          px(ctx, x, rockY, '#7a7a7a')
          px(ctx, x + 1, rockY, '#5a5a5a')
        }
      }
      break
    }
    case 'grass': {
      // Rolling hills
      for (let x = 0; x < width; x++) {
        const hillH = Math.floor(12 + 8 * Math.sin(x * 0.06) + 3 * Math.sin(x * 0.15))
        for (let y = height - hillH; y < height; y++) {
          const depth = y - (height - hillH)
          if (depth < 2) {
            px(ctx, x, y, '#5aac4f') // grass top
          } else if (depth < 4) {
            px(ctx, x, y, colors[0])
          } else {
            px(ctx, x, y, colors[Math.floor(Math.random() * colors.length)])
          }
        }
        // Grass blades
        if (Math.random() > 0.7) {
          const grassY = height - hillH - 1
          px(ctx, x, grassY, '#6bbc5f')
          if (Math.random() > 0.5) px(ctx, x, grassY - 1, '#7dcc6f')
        }
      }
      break
    }
    case 'ridge': {
      // Sharp peaks
      for (let x = 0; x < width; x++) {
        const peakH = Math.floor(
          8 + 18 * Math.abs(Math.sin(x * 0.05)) * Math.abs(Math.cos(x * 0.03))
        )
        for (let y = height - peakH; y < height; y++) {
          const depth = y - (height - peakH)
          if (depth < 1) {
            px(ctx, x, y, '#c06030') // peak highlight
          } else {
            px(ctx, x, y, colors[Math.floor(Math.random() * colors.length)])
          }
        }
        // Dangerous edge markers
        if (Math.random() > 0.95) {
          px(ctx, x, height - peakH - 1, '#ef4444')
        }
      }
      break
    }
    case 'camp': {
      // Flat ground with tent
      for (let x = 0; x < width; x++) {
        for (let y = height - 10; y < height; y++) {
          const depth = y - (height - 10)
          px(ctx, x, y, depth < 3 ? '#4a8c3f' : colors[Math.floor(Math.random() * 3)])
        }
      }
      // Tent
      const tentX = Math.floor(width / 2)
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j <= i; j++) {
          px(ctx, tentX - i + j * 2, height - 11 - i, '#c06030')
        }
      }
      // Tent pole
      for (let y = height - 19; y < height - 10; y++) {
        px(ctx, tentX, y, '#8b7355')
      }
      // Campfire
      const fireX = tentX + 6
      px(ctx, fireX, height - 11, '#f97316')
      px(ctx, fireX, height - 12, '#fbbf24')
      px(ctx, fireX - 1, height - 11, '#ef4444')
      px(ctx, fireX + 1, height - 11, '#f97316')
      // Smoke
      for (let i = 1; i <= 4; i++) {
        px(ctx, fireX + (i % 2), height - 12 - i, `rgba(180,180,180,${0.5 - i * 0.1})`)
      }
      break
    }
    case 'temple': {
      // Temple building
      for (let x = 0; x < width; x++) {
        for (let y = height - 10; y < height; y++) {
          px(ctx, x, y, '#2d3a2d')
        }
      }
      // Roof
      const roofW = 20
      const roofX = Math.floor(width / 2) - roofW / 2
      for (let i = 0; i < 8; i++) {
        for (let j = roofW - i * 2; j > 0; j--) {
          px(ctx, roofX + i + Math.floor((roofW - j) / 2), height - 11 - i, colors[Math.floor(Math.random() * 3)])
        }
      }
      // Pillars
      for (let y = height - 11; y < height; y++) {
        px(ctx, roofX + 3, y, '#c0c0c0')
        px(ctx, roofX + roofW - 3, y, '#c0c0c0')
      }
      // Door
      px(ctx, Math.floor(width / 2), height - 11, '#4b0082')
      px(ctx, Math.floor(width / 2), height - 10, '#4b0082')
      px(ctx, Math.floor(width / 2), height - 9, '#4b0082')
      break
    }
    case 'village': {
      // Houses
      for (let x = 0; x < width; x++) {
        for (let y = height - 8; y < height; y++) {
          px(ctx, x, y, '#3d5a3d')
        }
      }
      // House 1
      drawHouse(ctx, 10, height - 8, '#8b7355', '#6b3410')
      // House 2
      drawHouse(ctx, 35, height - 8, '#a0865a', '#8b4513')
      // House 3
      drawHouse(ctx, 60, height - 8, '#c4a882', '#a0522d')
      break
    }
    case 'lake': {
      // Water surface
      for (let x = 0; x < width; x++) {
        for (let y = Math.floor(height * 0.4); y < height; y++) {
          const depth = (y - height * 0.4) / (height * 0.6)
          const wave = Math.sin(x * 0.1 + y * 0.2) > 0.5 ? 1 : 0
          const colorIdx = Math.min(2, Math.floor(depth * 3) + wave)
          px(ctx, x, y, PALETTE.water[colorIdx])
        }
        // Wave ripples
        if (Math.random() > 0.8) {
          const waveY = Math.floor(height * 0.4 + Math.random() * 5)
          px(ctx, x, waveY, '#7dd3fc')
        }
      }
      // Shore
      for (let x = 0; x < width; x++) {
        px(ctx, x, Math.floor(height * 0.38), '#c4a882')
        px(ctx, x, Math.floor(height * 0.37), '#4a8c3f')
      }
      break
    }
    case 'forest': {
      // Tree trunks and canopy
      for (let x = 0; x < width; x++) {
        for (let y = height - 8; y < height; y++) {
          px(ctx, x, y, '#2d3a2d')
        }
      }
      for (let tx = 5; tx < width; tx += 12 + Math.floor(Math.random() * 8)) {
        // Trunk
        for (let y = height - 15; y < height - 8; y++) {
          px(ctx, tx, y, '#5c3a1e')
          if (Math.random() > 0.7) px(ctx, tx + 1, y, '#4a2e16')
        }
        // Canopy
        const canopyR = 5 + Math.floor(Math.random() * 3)
        for (let dy = -canopyR; dy <= 0; dy++) {
          for (let dx = -canopyR; dx <= canopyR; dx++) {
            if (dx * dx + dy * dy <= canopyR * canopyR) {
              if (Math.random() > 0.2) {
                const ci = Math.floor(Math.random() * colors.length)
                px(ctx, tx + dx, height - 16 + dy, colors[ci])
              }
            }
          }
        }
      }
      break
    }
  }

  return canvas
}

function drawHouse(ctx: CanvasRenderingContext2D, x: number, y: number, wallColor: string, roofColor: string) {
  // Wall
  for (let i = 0; i < 12; i++) {
    for (let j = 0; j < 8; j++) {
      px(ctx, x + i, y - 8 + j, wallColor)
    }
  }
  // Roof
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j <= i; j++) {
      px(ctx, x - i + j * 2, y - 9 - i, roofColor)
    }
  }
  // Door
  px(ctx, x + 5, y - 2, '#4a3728')
  px(ctx, x + 5, y - 3, '#4a3728')
  px(ctx, x + 6, y - 2, '#4a3728')
  px(ctx, x + 6, y - 3, '#4a3728')
  // Window
  px(ctx, x + 2, y - 5, '#87ceeb')
  px(ctx, x + 9, y - 5, '#87ceeb')
}

// Generate character sprite (walking frames)
export function generateCharacterSprites(): HTMLCanvasElement[] {
  const frames: HTMLCanvasElement[] = []
  const W = 12, H = 20

  // 4 frames: stand, walk1, stand, walk2
  const poses = [
    // Stand
    [
      '  hhhh  ',
      ' hhhhhh ',
      ' hsssh  ',
      '  ssss  ',
      ' bbbbbb ',
      ' bbbbbbb',
      '  bbbb  ',
      '  s  s  ',
      '  s  s  ',
      '  p  p  ',
      '  p  p  ',
      '  P  P  ',
    ],
    // Walk1 (left leg forward)
    [
      '  hhhh  ',
      ' hhhhhh ',
      ' hsssh  ',
      '  ssss  ',
      ' bbbbbb ',
      ' bbbbbbb',
      '  bbbb  ',
      ' s      ',
      '  s s   ',
      '  p p   ',
      ' p   p  ',
      ' P   P  ',
    ],
    // Walk2 (right leg forward)
    [
      '  hhhh  ',
      ' hhhhhh ',
      ' hsssh  ',
      '  ssss  ',
      ' bbbbbb ',
      ' bbbbbbb',
      '  bbbb  ',
      '      s ',
      '   s s  ',
      '   p p  ',
      '  p   p ',
      '  P   P ',
    ],
  ]

  for (const pose of poses) {
    const canvas = document.createElement('canvas')
    canvas.width = W * PIXEL
    canvas.height = H * PIXEL
    const ctx = canvas.getContext('2d')!

    for (let y = 0; y < pose.length; y++) {
      for (let x = 0; x < pose[y].length; x++) {
        const ch = pose[y][x]
        let color: string | undefined
        switch (ch) {
          case 'h': color = PALETTE.hair[0]; break
          case 's': color = PALETTE.skin[0]; break
          case 'b': color = PALETTE.shirt[0]; break
          case 'B': color = PALETTE.backpack[0]; break
          case 'p': color = PALETTE.pants[0]; break
          case 'P': color = '#4a3728'; break // boots
        }
        if (color) px(ctx, x, y, color)
      }
    }
    frames.push(canvas)
  }

  return frames
}

// Generate weather particles
export function generateSnowParticle(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = PIXEL
  canvas.height = PIXEL
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, PIXEL, PIXEL)
  return canvas
}

export function generateRainDrop(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = PIXEL
  canvas.height = PIXEL * 4
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createLinearGradient(0, 0, 0, PIXEL * 4)
  grad.addColorStop(0, 'rgba(150,200,255,0)')
  grad.addColorStop(1, 'rgba(150,200,255,0.6)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, PIXEL, PIXEL * 4)
  return canvas
}

// Map terrain type to sprite type
export const TERRAIN_MAP: Record<string, string> = {
  '石海': 'stone',
  '草甸': 'grass',
  '刃脊': 'ridge',
  '营地': 'camp',
  '庙宇': 'temple',
  '村庄': 'village',
  '湖泊': 'lake',
  '丛林': 'forest',
}
