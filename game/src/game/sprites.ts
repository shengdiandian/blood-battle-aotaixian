// Clean pixel art sprites - no noise, solid colors, Stardew Valley style

const P = 4 // pixel scale - bigger pixels = chunkier look

function px(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color
  ctx.fillRect(x * P, y * P, P, P)
}

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color
  ctx.fillRect(x * P, y * P, w * P, h * P)
}

// ============ CHARACTER (16x20, big readable pixels) ============
// Each frame is a separate canvas

type Dir = 'down' | 'left' | 'right' | 'up'

const C = {
  hair: '#4a3728', hairL: '#6b4c3a',
  skin: '#f5c6a0', skinS: '#d4a080', skinD: '#b88060',
  eye: '#1e293b',
  shirt: '#2563eb', shirtL: '#3b82f6', shirtD: '#1d4ed8',
  pants: '#374151', pantsL: '#4b5563',
  boot: '#5c3a1e', bootL: '#78350f',
  bag: '#92400e', bagL: '#b45309',
}

function drawFrame(ctx: CanvasRenderingContext2D, dir: Dir, frame: number) {
  const f = frame % 3
  const walk = f === 1 ? -1 : f === 2 ? 1 : 0

  // Shadow
  rect(ctx, 4, 18, 8, 2, 'rgba(0,0,0,0.25)')

  // Boots
  rect(ctx, 4 + (f === 1 ? -1 : 0), 16, 3, 2, C.boot)
  rect(ctx, 9 + (f === 2 ? 1 : 0), 16, 3, 2, C.boot)

  // Pants
  rect(ctx, 5, 13 + (f === 1 ? walk : 0), 2, 4, C.pants)
  rect(ctx, 9, 13 + (f === 2 ? -walk : 0), 2, 4, C.pants)

  // Shirt
  rect(ctx, 4, 8, 8, 6, C.shirt)
  rect(ctx, 5, 8, 6, 5, C.shirtL)

  // Belt
  rect(ctx, 4, 12, 8, 1, '#78350f')

  // Arms
  if (dir === 'down' || dir === 'up') {
    rect(ctx, 2, 9 + walk, 2, 5, C.skin)
    rect(ctx, 12, 9 - walk, 2, 5, C.skin)
  } else if (dir === 'left') {
    rect(ctx, 2, 8, 2, 6, C.skin)
    rect(ctx, 12, 10, 2, 4, C.skin)
  } else {
    rect(ctx, 2, 10, 2, 4, C.skin)
    rect(ctx, 12, 8, 2, 6, C.skin)
  }

  // Head
  rect(ctx, 4, 1, 8, 7, C.skin)
  rect(ctx, 5, 2, 6, 5, C.skinS)

  // Hair
  rect(ctx, 3, 0, 10, 3, C.hair)
  if (dir === 'left') rect(ctx, 3, 3, 2, 3, C.hair)
  if (dir === 'right') rect(ctx, 11, 3, 2, 3, C.hair)
  if (dir === 'up') rect(ctx, 3, 0, 10, 7, C.hair)
  // Hair highlight
  if (dir !== 'up') rect(ctx, 4, 0, 8, 1, C.hairL)

  // Face
  if (dir === 'down') {
    px(ctx, 6, 4, C.eye); px(ctx, 9, 4, C.eye)
    px(ctx, 7, 6, C.skinD); px(ctx, 8, 6, C.skinD) // mouth
    px(ctx, 6, 3, '#e8b89a'); px(ctx, 9, 3, '#e8b89a') // cheeks
  } else if (dir === 'left') {
    px(ctx, 5, 4, C.eye)
    px(ctx, 5, 6, C.skinD)
  } else if (dir === 'right') {
    px(ctx, 10, 4, C.eye)
    px(ctx, 10, 6, C.skinD)
  }

  // Backpack (visible from side/back)
  if (dir === 'up' || dir === 'right') {
    rect(ctx, 12, 7, 3, 5, C.bag)
    rect(ctx, 13, 8, 1, 3, C.bagL)
  }
  if (dir === 'left') {
    rect(ctx, 1, 7, 3, 5, C.bag)
    rect(ctx, 2, 8, 1, 3, C.bagL)
  }

  // Hat brim
  rect(ctx, 3, 0, 10, 1, C.hairL)
}

export function generateCharacterFrames(): Map<string, HTMLCanvasElement> {
  const frames = new Map<string, HTMLCanvasElement>()
  const W = 16, H = 20

  for (const dir of ['down', 'left', 'right', 'up'] as Dir[]) {
    for (let f = 0; f < 3; f++) {
      const canvas = document.createElement('canvas')
      canvas.width = W * P
      canvas.height = H * P
      const ctx = canvas.getContext('2d')!
      drawFrame(ctx, dir, f)
      frames.set(`${dir}_${f}`, canvas)
    }
  }
  return frames
}

// ============ TERRAIN TILES (16x16) ============
// Clean, solid colors - no random noise

interface TerrainStyle {
  base: string
  light: string
  dark: string
  accent: string
}

const TERRAIN_STYLES: Record<string, TerrainStyle> = {
  stone:  { base: '#6b7280', light: '#9ca3af', dark: '#4b5563', accent: '#374151' },
  grass:  { base: '#4ade80', light: '#86efac', dark: '#22c55e', accent: '#16a34a' },
  ridge:  { base: '#a0522d', light: '#c06030', dark: '#8b4513', accent: '#6b3410' },
  camp:   { base: '#4ade80', light: '#86efac', dark: '#22c55e', accent: '#166534' },
  temple: { base: '#4b5563', light: '#6b7280', dark: '#374151', accent: '#1f2937' },
  village:{ base: '#6b7280', light: '#9ca3af', dark: '#4b5563', accent: '#374151' },
  lake:   { base: '#38bdf8', light: '#7dd3fc', dark: '#0284c7', accent: '#0ea5e9' },
  forest: { base: '#166534', light: '#22c55e', dark: '#14532d', accent: '#052e16' },
}

export function generateTerrainTile(type: string, size: number = 16): HTMLCanvasElement {
  const c = TERRAIN_STYLES[type] || TERRAIN_STYLES.grass
  const canvas = document.createElement('canvas')
  canvas.width = size * P
  canvas.height = size * P
  const ctx = canvas.getContext('2d')!

  // Base fill
  rect(ctx, 0, 0, size, size, c.base)

  switch (type) {
    case 'stone':
      // Simple rock blocks
      for (let i = 0; i < 4; i++) {
        const rx = (i * 4) % size
        const ry = Math.floor(i / 4) * 8
        rect(ctx, rx, ry, 3, 2, c.light)
        rect(ctx, rx, ry + 2, 3, 1, c.dark)
      }
      rect(ctx, 6, 6, 4, 3, c.light)
      rect(ctx, 6, 9, 4, 1, c.dark)
      rect(ctx, 10, 2, 3, 2, c.dark)
      break

    case 'grass':
      // Grass blades on top
      for (let x = 1; x < size; x += 3) {
        px(ctx, x, 0, c.light)
        px(ctx, x, 1, c.dark)
        if (x % 2 === 0) px(ctx, x + 1, 0, c.accent)
      }
      // Small flower
      px(ctx, 5, 2, '#fbbf24')
      px(ctx, 12, 1, '#f472b6')
      break

    case 'ridge':
      // Rocky spikes
      rect(ctx, 3, 2, 2, 8, c.dark)
      rect(ctx, 7, 0, 2, 10, c.base)
      rect(ctx, 11, 3, 2, 7, c.dark)
      // Highlight
      px(ctx, 4, 2, c.light)
      px(ctx, 8, 0, c.light)
      px(ctx, 12, 3, c.light)
      // Danger marks
      px(ctx, 8, 11, '#ef4444')
      break

    case 'camp':
      // Grass base + tent
      for (let x = 0; x < size; x++) { px(ctx, x, 0, c.light) }
      // Tent
      rect(ctx, 5, 3, 6, 1, '#f59e0b') // roof peak
      rect(ctx, 4, 4, 8, 1, '#f59e0b')
      rect(ctx, 3, 5, 10, 1, '#f59e0b')
      rect(ctx, 4, 6, 8, 5, '#92400e') // body
      rect(ctx, 7, 8, 2, 3, '#78350f') // door
      // Campfire
      rect(ctx, 2, 12, 2, 1, '#6b7280') // stones
      rect(ctx, 12, 12, 2, 1, '#6b7280')
      px(ctx, 7, 12, '#f97316') // fire
      px(ctx, 7, 11, '#fbbf24')
      px(ctx, 6, 12, '#ef4444')
      px(ctx, 8, 12, '#f97316')
      break

    case 'temple':
      rect(ctx, 0, 0, size, size, c.base)
      // Roof
      rect(ctx, 2, 1, 12, 1, '#a78bfa')
      rect(ctx, 1, 2, 14, 1, '#7c3aed')
      rect(ctx, 0, 3, 16, 1, '#5b21b6')
      // Walls
      rect(ctx, 1, 4, 14, 8, c.light)
      // Pillars
      rect(ctx, 2, 4, 2, 8, '#d4d4d4')
      rect(ctx, 12, 4, 2, 8, '#d4d4d4')
      // Door
      rect(ctx, 7, 6, 2, 6, '#fbbf24')
      // Window
      rect(ctx, 4, 5, 2, 2, '#87ceeb')
      rect(ctx, 10, 5, 2, 2, '#87ceeb')
      break

    case 'village':
      rect(ctx, 0, 0, size, size, c.base)
      // House
      rect(ctx, 2, 4, 12, 8, '#d4d4d4')
      rect(ctx, 1, 3, 14, 2, '#dc2626') // roof
      rect(ctx, 6, 7, 4, 5, '#78350f') // door
      rect(ctx, 3, 5, 2, 2, '#87ceeb') // window
      rect(ctx, 11, 5, 2, 2, '#87ceeb')
      // Chimney
      rect(ctx, 11, 1, 2, 3, '#6b7280')
      break

    case 'lake':
      // Water with waves
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const wave = Math.sin(x * 0.5 + y * 0.3) > 0.3
          px(ctx, x, y, wave ? c.light : c.base)
        }
      }
      // Shore line
      for (let x = 0; x < size; x++) {
        px(ctx, x, 0, '#c4a882')
      }
      break

    case 'forest':
      rect(ctx, 0, 0, size, size, c.dark)
      // Trees
      for (let tx = 2; tx < size - 2; tx += 5) {
        rect(ctx, tx + 1, 8, 2, 6, '#78350f') // trunk
        // Canopy
        for (let dy = -3; dy <= 0; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            if (Math.abs(dx) + Math.abs(dy) <= 3) {
              px(ctx, tx + 1 + dx, 6 + dy, dy === -3 ? c.light : c.base)
            }
          }
        }
      }
      break
  }

  return canvas
}

// ============ WEATHER ============
export function generateSnowflake(): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = 3 * P; c.height = 3 * P
  const ctx = c.getContext('2d')!
  px(ctx, 1, 0, '#fff')
  px(ctx, 0, 1, '#fff')
  px(ctx, 1, 1, '#e0e8f0')
  px(ctx, 2, 1, '#fff')
  px(ctx, 1, 2, '#fff')
  return c
}

export function generateRaindrop(): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = 1 * P; c.height = 4 * P
  const ctx = c.getContext('2d')!
  rect(ctx, 0, 0, 1, 4, 'rgba(120,180,255,0.5)')
  return c
}

export const TERRAIN_MAP: Record<string, string> = {
  '石海': 'stone', '草甸': 'grass', '刃脊': 'ridge',
  '营地': 'camp', '庙宇': 'temple', '村庄': 'village',
  '湖泊': 'lake', '丛林': 'forest',
}
