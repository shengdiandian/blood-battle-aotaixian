// Pixel art sprite sheet generator
// Creates Stardew-Valley-style sprites procedurally

const P = 3 // pixel scale

function px(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color
  ctx.fillRect(x * P, y * P, P, P)
}

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color
  ctx.fillRect(x * P, y * P, w * P, h * P)
}

// ============ CHARACTER SPRITES ============
// 16x24 pixel character with 4 directions x 3 frames = 12 frames total
// Sprite sheet: 48x72 pixels (16*3 x 24*3)

type Dir = 'down' | 'up' | 'left' | 'right'

const SKIN = '#f5c6a0'
const SKIN_S = '#d4a080'
const HAIR = '#3d2b1f'
const SHIRT = '#2563eb'
const SHIRT_S = '#1d4ed8'
const PANTS = '#374151'
const PANTS_S = '#1f2937'
const BOOTS = '#5c3a1e'
const EYES = '#1e293b'
const MOUTH = '#c08060'

export function generateCharacterSheet(): HTMLCanvasElement {
  const W = 16, H = 24
  const cols = 3 // 3 frames per direction
  const rows = 4 // down, left, right, up
  const canvas = document.createElement('canvas')
  canvas.width = W * P * cols
  canvas.height = H * P * rows
  const ctx = canvas.getContext('2d')!

  const frames: Record<Dir, number[][][]> = {
    down: [
      // Frame 0: standing
      [
        [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
        [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
        [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
        [0,0,0,1,HAIR?1:0,HAIR?1:0,HAIR?1:0,HAIR?1:0,HAIR?1:0,HAIR?1:0,HAIR?1:0,HAIR?1:0,HAIR?1:0,1,0,0,0],
        [0,0,1,HAIR?1:0,SKIN?1:0,SKIN?1:0,SKIN?1:0,SKIN?1:0,SKIN?1:0,SKIN?1:0,SKIN?1:0,SKIN?1:0,HAIR?1:0,1,0,0],
        [0,0,1,HAIR?1:0,SKIN?1:0,EYES?1:0,SKIN?1:0,SKIN?1:0,SKIN?1:0,EYES?1:0,SKIN?1:0,SKIN?1:0,HAIR?1:0,1,0,0],
        [0,0,1,HAIR?1:0,SKIN?1:0,SKIN?1:0,SKIN?1:0,SKIN?1:0,SKIN?1:0,SKIN?1:0,SKIN?1:0,SKIN?1:0,HAIR?1:0,1,0,0],
        [0,0,0,1,SKIN?1:0,SKIN?1:0,SKIN?1:0,MOUTH?1:0,MOUTH?1:0,SKIN?1:0,SKIN?1:0,SKIN?1:0,1,0,0,0],
        [0,0,0,0,1,SKIN?1:0,SKIN?1:0,SKIN?1:0,SKIN?1:0,SKIN?1:0,SKIN?1:0,1,0,0,0,0],
        [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
        [0,0,0,1,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,1,0,0,0],
        [0,0,1,SKIN?1:0,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,SKIN?1:0,1,0,0],
        [0,0,1,SKIN?1:0,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,SKIN?1:0,1,0,0],
        [0,0,0,1,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,1,0,0,0],
        [0,0,0,0,1,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,SHIRT?1:0,1,0,0,0,0],
        [0,0,0,0,1,PANTS?1:0,PANTS?1:0,1,1,PANTS?1:0,PANTS?1:0,1,0,0,0,0],
        [0,0,0,0,1,PANTS?1:0,PANTS?1:0,1,1,PANTS?1:0,PANTS?1:0,1,0,0,0,0],
        [0,0,0,0,1,PANTS?1:0,PANTS?1:0,0,0,PANTS?1:0,PANTS?1:0,1,0,0,0,0],
        [0,0,0,0,1,PANTS?1:0,PANTS?1:0,0,0,PANTS?1:0,PANTS?1:0,1,0,0,0,0],
        [0,0,0,0,1,PANTS?1:0,PANTS?1:0,0,0,PANTS?1:0,PANTS?1:0,1,0,0,0,0],
        [0,0,0,1,BOOTS?1:0,BOOTS?1:0,1,0,0,1,BOOTS?1:0,BOOTS?1:0,1,0,0,0],
        [0,0,0,1,BOOTS?1:0,BOOTS?1:0,1,0,0,1,BOOTS?1:0,BOOTS?1:0,1,0,0,0],
      ],
      // Frame 1: walk left foot
      [], // simplified - will use color fill
      // Frame 2: walk right foot
      [],
    ],
    left: [], up: [], right: [],
  }

  // Simplified: draw character using colored rectangles instead of pixel arrays
  function drawCharacter(ctx: CanvasRenderingContext2D, ox: number, oy: number, dir: Dir, frame: number) {
    const f = frame % 3
    const walkOffset = f === 1 ? -1 : f === 2 ? 1 : 0
    const legOffset = f === 1 ? 2 : f === 2 ? -2 : 0

    // Shadow
    rect(ctx, ox + 3, oy + 22, 10, 2, 'rgba(0,0,0,0.2)')

    // Legs
    rect(ctx, ox + 5, oy + 16 + walkOffset, 2, 5, PANTS)
    rect(ctx, ox + 9, oy + 16 - walkOffset, 2, 5, PANTS)
    // Boots
    rect(ctx, ox + 4 + (f === 1 ? -1 : 0), oy + 21 + walkOffset, 3, 2, BOOTS)
    rect(ctx, ox + 9 + (f === 2 ? 1 : 0), oy + 21 - walkOffset, 3, 2, BOOTS)

    // Body
    rect(ctx, ox + 4, oy + 10, 8, 7, SHIRT)
    rect(ctx, ox + 5, oy + 10, 6, 6, SHIRT_S)
    // Belt
    rect(ctx, ox + 4, oy + 15, 8, 1, '#92400e')

    // Arms
    if (dir === 'left') {
      rect(ctx, ox + 2, oy + 10 + legOffset, 2, 6, SKIN)
      rect(ctx, ox + 12, oy + 11, 2, 5, SKIN)
    } else if (dir === 'right') {
      rect(ctx, ox + 2, oy + 11, 2, 5, SKIN)
      rect(ctx, ox + 12, oy + 10 + legOffset, 2, 6, SKIN)
    } else {
      rect(ctx, ox + 2, oy + 10 + legOffset, 2, 6, SKIN)
      rect(ctx, ox + 12, oy + 10 - legOffset, 2, 6, SKIN)
    }

    // Head
    rect(ctx, ox + 4, oy + 2, 8, 8, SKIN)
    rect(ctx, ox + 5, oy + 3, 6, 6, SKIN_S)

    // Hair
    rect(ctx, ox + 3, oy + 1, 10, 3, HAIR)
    if (dir === 'left') rect(ctx, ox + 3, oy + 4, 2, 3, HAIR)
    if (dir === 'right') rect(ctx, ox + 11, oy + 4, 2, 3, HAIR)
    if (dir === 'up') rect(ctx, ox + 3, oy + 1, 10, 6, HAIR)

    // Face (not shown from behind)
    if (dir !== 'up') {
      // Eyes
      if (dir === 'down') {
        px(ctx, ox + 6, oy + 5, EYES)
        px(ctx, ox + 9, oy + 5, EYES)
        // Mouth
        px(ctx, ox + 7, oy + 7, MOUTH)
        px(ctx, ox + 8, oy + 7, MOUTH)
      } else if (dir === 'left') {
        px(ctx, ox + 5, oy + 5, EYES)
        px(ctx, ox + 5, oy + 7, MOUTH)
      } else {
        px(ctx, ox + 10, oy + 5, EYES)
        px(ctx, ox + 10, oy + 7, MOUTH)
      }
    }

    // Backpack
    if (dir === 'up' || dir === 'right') {
      rect(ctx, ox + 11, oy + 9, 3, 5, '#92400e')
      rect(ctx, ox + 12, oy + 10, 1, 3, '#b45309')
    }
    if (dir === 'left') {
      rect(ctx, ox + 2, oy + 9, 3, 5, '#92400e')
      rect(ctx, ox + 3, oy + 10, 1, 3, '#b45309')
    }
  }

  const dirs: Dir[] = ['down', 'left', 'right', 'up']
  dirs.forEach((dir, row) => {
    for (let frame = 0; frame < 3; frame++) {
      const ox = frame * 16
      const oy = row * 24
      drawCharacter(ctx, ox, oy, dir, frame)
    }
  })

  return canvas
}

// ============ TERRAIN TILE SET ============
// 16x16 tiles, 8 terrain types

const TERRAIN_COLORS: Record<string, { top: string; mid: string; bot: string; accent: string; detail: string }> = {
  stone: { top: '#6b7280', mid: '#4b5563', bot: '#374151', accent: '#9ca3af', detail: '#1f2937' },
  grass: { top: '#4ade80', mid: '#22c55e', bot: '#166534', accent: '#86efac', detail: '#15803d' },
  ridge: { top: '#dc2626', mid: '#991b1b', bot: '#450a0a', accent: '#fca5a5', detail: '#7f1d1d' },
  camp:  { top: '#fbbf24', mid: '#92400e', bot: '#451a03', accent: '#fde68a', detail: '#78350f' },
  temple:{ top: '#a78bfa', mid: '#7c3aed', bot: '#3b0764', accent: '#c4b5fd', detail: '#5b21b6' },
  village:{ top: '#a3a3a3', mid: '#737373', bot: '#404040', accent: '#d4d4d4', detail: '#525252' },
  lake:  { top: '#38bdf8', mid: '#0284c7', bot: '#0c4a6e', accent: '#7dd3fc', detail: '#0ea5e9' },
  forest:{ top: '#16a34a', mid: '#166534', bot: '#052e16', accent: '#4ade80', detail: '#14532d' },
}

export function generateTerrainTiles(type: string): { ground: HTMLCanvasElement; details: HTMLCanvasElement } {
  const c = TERRAIN_COLORS[type] || TERRAIN_COLORS.stone
  const SIZE = 32 // 32x32 pixel tiles

  // Ground tile
  const ground = document.createElement('canvas')
  ground.width = SIZE * P
  ground.height = SIZE * P
  const gctx = ground.getContext('2d')!

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const noise = Math.random()
      let color = c.mid
      if (y < SIZE * 0.3) color = c.top
      else if (y > SIZE * 0.7) color = c.bot
      if (noise > 0.8) color = c.accent
      if (noise < 0.15) color = c.detail
      px(gctx, x, y, color)
    }
  }

  // Detail tile (rocks, grass blades, waves, etc.)
  const details = document.createElement('canvas')
  details.width = SIZE * P
  details.height = SIZE * P
  const dctx = details.getContext('2d')!

  switch (type) {
    case 'stone':
      for (let i = 0; i < 5; i++) {
        const rx = Math.floor(Math.random() * 28) + 2
        const ry = Math.floor(Math.random() * 28) + 2
        const rw = Math.floor(Math.random() * 6) + 3
        const rh = Math.floor(Math.random() * 4) + 2
        rect(dctx, rx, ry, rw, rh, c.accent)
        rect(dctx, rx + 1, ry + 1, rw - 1, 1, '#d1d5db')
      }
      break
    case 'grass':
      for (let i = 0; i < 12; i++) {
        const gx = Math.floor(Math.random() * 30) + 1
        const gy = Math.floor(Math.random() * 20)
        px(dctx, gx, gy, '#86efac')
        px(dctx, gx, gy - 1, '#4ade80')
        if (Math.random() > 0.5) px(dctx, gx + 1, gy - 1, '#22c55e')
      }
      break
    case 'ridge':
      // Sharp peaks
      for (let i = 0; i < 3; i++) {
        const px2 = Math.floor(Math.random() * 26) + 3
        const py = Math.floor(Math.random() * 10) + 5
        for (let j = 0; j < 6; j++) {
          px(dctx, px2, py + j, c.accent)
          if (j < 3) { px(dctx, px2 - 1, py + j + 1, c.mid) }
        }
      }
      break
    case 'camp':
      // Tent
      rect(dctx, 12, 8, 8, 1, '#f59e0b')
      rect(dctx, 13, 7, 6, 1, '#f59e0b')
      rect(dctx, 14, 6, 4, 1, '#f59e0b')
      rect(dctx, 15, 5, 2, 1, '#f59e0b')
      rect(dctx, 13, 9, 6, 6, '#92400e')
      // Fire
      px(dctx, 16, 16, '#f97316')
      px(dctx, 16, 15, '#fbbf24')
      px(dctx, 15, 16, '#ef4444')
      px(dctx, 17, 16, '#f97316')
      break
    case 'temple':
      rect(dctx, 10, 4, 12, 1, c.accent)
      rect(dctx, 11, 3, 10, 1, c.accent)
      rect(dctx, 12, 2, 8, 1, c.accent)
      rect(dctx, 9, 5, 14, 12, c.mid)
      rect(dctx, 14, 10, 4, 7, '#fbbf24')
      rect(dctx, 11, 7, 2, 3, '#e5e7eb')
      rect(dctx, 19, 7, 2, 3, '#e5e7eb')
      break
    case 'village':
      // House 1
      rect(dctx, 3, 8, 8, 8, '#a3a3a3')
      rect(dctx, 2, 7, 10, 2, '#dc2626')
      rect(dctx, 5, 11, 2, 5, '#78350f')
      px(dctx, 4, 9, '#fbbf24')
      // House 2
      rect(dctx, 18, 10, 6, 6, '#d4d4d4')
      rect(dctx, 17, 9, 8, 2, '#b91c1c')
      rect(dctx, 20, 12, 2, 4, '#78350f')
      break
    case 'lake':
      for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
          if (Math.sin(x * 0.3 + y * 0.2) > 0.7) {
            px(dctx, x, y, c.accent)
          }
        }
      }
      break
    case 'forest':
      for (let i = 0; i < 3; i++) {
        const tx = Math.floor(Math.random() * 24) + 4
        const ty = Math.floor(Math.random() * 8) + 4
        rect(dctx, tx, ty + 5, 2, 8, '#78350f')
        for (let dy = -4; dy <= 0; dy++) {
          for (let dx = -3; dx <= 3; dx++) {
            if (dx*dx + dy*dy <= 12) {
              if (Math.random() > 0.2) px(dctx, tx + dx + 1, ty + dy + 4, c.top)
            }
          }
        }
      }
      break
  }

  return { ground, details }
}

// ============ WEATHER PARTICLES ============
export function generateSnowflake(): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = 4 * P
  c.height = 4 * P
  const ctx = c.getContext('2d')!
  px(ctx, 1, 0, '#ffffff')
  px(ctx, 0, 1, '#ffffff')
  px(ctx, 1, 1, '#ffffff')
  px(ctx, 2, 1, '#ffffff')
  px(ctx, 1, 2, '#ffffff')
  return c
}

export function generateRaindrop(): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = 1 * P
  c.height = 6 * P
  const ctx = c.getContext('2d')!
  const grad = ctx.createLinearGradient(0, 0, 0, 6 * P)
  grad.addColorStop(0, 'rgba(100,180,255,0)')
  grad.addColorStop(1, 'rgba(100,180,255,0.7)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 1 * P, 6 * P)
  return c
}

// ============ MAP TYPE LOOKUP ============
export const TERRAIN_MAP: Record<string, string> = {
  '石海': 'stone', '草甸': 'grass', '刃脊': 'ridge',
  '营地': 'camp', '庙宇': 'temple', '村庄': 'village',
  '湖泊': 'lake', '丛林': 'forest',
}
