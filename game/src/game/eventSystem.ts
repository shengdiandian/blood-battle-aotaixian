import { gameState, addLog, updatePlayerState, getCurrentNode } from '../store/gameStore'
import type { GameEvent, EventCondition, EventOutcome } from '../types'
import { eventPool } from './eventPool'
import incidentsData from '../data/incidents.json'
import type { Incident } from '../types'

const incidents = incidentsData as Incident[]

// 已触发事件记录，避免短时间内重复
const recentlyTriggered: string[] = []
const MAX_RECENT = 12

function markTriggered(eventId: string) {
  recentlyTriggered.push(eventId)
  if (recentlyTriggered.length > MAX_RECENT) recentlyTriggered.shift()
}

// ===== 条件检查 =====
function checkCondition(condition?: EventCondition): boolean {
  if (!condition) return true
  const node = getCurrentNode()
  const state = gameState

  if (condition.minAltitude && node.altitude < condition.minAltitude) return false
  if (condition.maxAltitude && node.altitude > condition.maxAltitude) return false
  if (condition.terrainTypes && !condition.terrainTypes.includes(node.terrainType)) return false
  if (condition.minDangerLevel && node.dangerLevel < condition.minDangerLevel) return false
  if (condition.weatherConditions && !condition.weatherConditions.includes(state.weather.condition)) return false
  if (condition.minHealth && state.health < condition.minHealth) return false
  if (condition.maxHealth && state.health > condition.maxHealth) return false
  if (condition.minStamina && state.stamina < condition.minStamina) return false
  if (condition.hasItem && !state.inventory[condition.hasItem]) return false
  if (condition.lacksItem && state.inventory[condition.lacksItem]) return false
  if (condition.minDay && state.dayCount < condition.minDay) return false
  if (condition.maxDay && state.dayCount > condition.maxDay) return false
  if (condition.minHour && state.hourCount < condition.minHour) return false
  if (condition.maxHour && state.hourCount > condition.maxHour) return false
  if (condition.minLuck && state.luck < condition.minLuck) return false
  if (condition.maxLuck && state.luck > condition.maxLuck) return false
  if (condition.minFood && state.inventory.food < condition.minFood) return false
  if (condition.minWater && state.inventory.water < condition.minWater) return false
  if (condition.notVisited && state.visitedNodes.includes(state.currentNode)) return false

  return true
}

// ===== 生成随机事件（带权重和去重） =====
export function generateNodeEvents(_nodeId: string): GameEvent | null {
  // 1. 筛选满足条件且不在最近触发列表中的事件
  let eligibleEvents = eventPool.filter(evt =>
    checkCondition(evt.condition) && !recentlyTriggered.includes(evt.id)
  )

  // 如果全部触发过，清空记录重来
  if (eligibleEvents.length === 0) {
    recentlyTriggered.length = 0
    eligibleEvents = eventPool.filter(evt => checkCondition(evt.condition))
  }

  if (eligibleEvents.length === 0) return null

  // 2. 权重随机：危机类事件权重更高（增加难度）
  const weights = eligibleEvents.map(evt => {
    if (evt.category === 'crisis') return 2.0
    if (evt.category === 'weather') return 1.5
    if (evt.category === 'terrain') return 1.3
    return 1.0
  })
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  let roll = Math.random() * totalWeight
  let selectedEvent = eligibleEvents[0]
  for (let i = 0; i < eligibleEvents.length; i++) {
    roll -= weights[i]
    if (roll <= 0) {
      selectedEvent = eligibleEvents[i]
      break
    }
  }

  // 3. 过滤选项条件
  const filteredChoices = selectedEvent.choices.filter(choice => {
    if ((choice as any).condition) return checkCondition((choice as any).condition)
    return true
  })
  if (filteredChoices.length === 0) return null

  // 4. 标记已触发
  markTriggered(selectedEvent.id)

  return { ...selectedEvent, choices: filteredChoices }
}

// ===== 生成纪念事件 =====
export function generateMemorialEvent(_nodeId: string): GameEvent | null {
  const node = getCurrentNode()
  const relatedIncidents = incidents.filter(inc => inc.location === node.name)
  if (relatedIncidents.length === 0) return null

  // 30%概率触发纪念事件
  if (Math.random() > 0.3) return null

  const incident = relatedIncidents[Math.floor(Math.random() * relatedIncidents.length)]

  return {
    id: `memorial_${incident.id}`,
    title: '逝者的痕迹',
    description: `你在这片区域发现了一块小小的纪念标记。这里曾发生过真实的事故——${incident.date}，${incident.description}`,
    category: 'memorial',
    choices: [
      {
        id: `memorial_${incident.id}_a`,
        text: '默哀致敬',
        narrative: `你停下脚步，在纪念标记前默默站立。${incident.victims > 1 ? `${incident.victims}条生命` : '一条生命'}在这里消逝。`,
        effects: { knowledgePoints: 3 },
        outcomes: [{ probability: 1, narrative: '愿逝者安息。你更加坚定了安全完成穿越的决心。', effects: { luck: 1 } }],
      },
      {
        id: `memorial_${incident.id}_b`,
        text: '阅读事故详情',
        narrative: `你仔细阅读了纪念标记上的文字。${incident.type}事故，${incident.victims}人遇难。`,
        effects: { knowledgePoints: 5 },
        outcomes: [{ probability: 1, narrative: '这些教训值得铭记。你更加警惕了。', effects: { knowledgePoints: 2 } }],
      },
    ],
  }
}

// ===== 处理事件选择 =====
export function resolveChoice(event: GameEvent, choiceId: string) {
  const choice = event.choices.find(c => c.id === choiceId)
  if (!choice) return

  // 应用选择的即时效果
  applyEffects(choice.effects)

  // 处理装备获取
  if (choice.effects.gainItems) {
    applyGainItems(choice.effects.gainItems)
  }

  // 处理装备丢失
  if (choice.effects.loseItems) {
    applyLoseItems(choice.effects.loseItems)
  }

  // 如果有概率事件，随机选择一个结果
  if (choice.outcomes && choice.outcomes.length > 0) {
    const outcome = rollOutcome(choice.outcomes)
    if (outcome) {
      // 延迟显示结果叙述（通过日志）
      addLog('narrative', outcome.narrative)
      applyEffects(outcome.effects)

      if (outcome.gainItems) {
        applyGainItems(outcome.gainItems)
      }
      if (outcome.loseItems) {
        applyLoseItems(outcome.loseItems)
      }
    }
  } else {
    // 没有概率事件，直接显示选择叙述
    addLog('narrative', choice.narrative)
  }
}

// ===== 概率选择 =====
function rollOutcome(outcomes: EventOutcome[]): EventOutcome | null {
  const roll = Math.random()
  let cumulative = 0
  for (const outcome of outcomes) {
    cumulative += outcome.probability
    if (roll <= cumulative) return outcome
  }
  return outcomes[outcomes.length - 1] // 兜底
}

// ===== 应用效果 =====
function applyEffects(effects: Record<string, any>) {
  if (!effects) return

  if (effects.health) updatePlayerState({ health: effects.health })
  if (effects.stamina) updatePlayerState({ stamina: effects.stamina })
  if (effects.hydration) updatePlayerState({ hydration: effects.hydration })
  if (effects.hunger) updatePlayerState({ hunger: effects.hunger })
  if (effects.food) updatePlayerState({ food: effects.food })
  if (effects.water) updatePlayerState({ water: effects.water })
  if (effects.knowledgePoints) updatePlayerState({ knowledgePoints: effects.knowledgePoints })
  if (effects.luck) {
    gameState.luck = Math.max(-5, Math.min(10, gameState.luck + effects.luck))
  }
}

// ===== 应用装备获取 =====
function applyGainItems(gainItems: Record<string, any>) {
  if (!gainItems) return
  const inv = gameState.inventory as Record<string, any>
  for (const [key, value] of Object.entries(gainItems)) {
    if (key in inv) {
      inv[key] = value
      addLog('success', `获得了装备：${getItemName(key)}`)
    }
  }
}

// ===== 应用装备丢失 =====
function applyLoseItems(loseItems: string[]) {
  if (!loseItems) return
  const inv = gameState.inventory as Record<string, any>
  for (const key of loseItems) {
    if (key in inv && inv[key]) {
      inv[key] = typeof inv[key] === 'boolean' ? false : 0
      addLog('danger', `失去了装备：${getItemName(key)}`)
    }
  }
}

// ===== 装备名称映射 =====
function getItemName(key: string): string {
  const names: Record<string, string> = {
    tent: '帐篷',
    sleepingBag: '睡袋',
    food: '食物',
    water: '水',
    gps: 'GPS',
    satelliteDevice: '卫星电话',
    warmClothes: '保暖衣物',
    hikingPoles: '登山杖',
    headlamp: '头灯',
    firstAidKit: '急救包',
    rope: '绳索',
    sunglasses: '墨镜',
  }
  return names[key] || key
}

// ===== 天气随机化 =====
export function randomizeWeather(_nodeId: string) {
  const node = getCurrentNode()
  const state = gameState

  // 基于海拔和地形随机化天气
  const altitudeFactor = node.altitude / 4000
  const random = Math.random()

  // 高海拔更容易恶劣天气
  if (altitudeFactor > 0.85 && random < 0.25) {
    state.weather.condition = '暴风雪'
    state.weather.temperature = -15 + Math.floor(Math.random() * 10)
    state.weather.windSpeed = 30 + Math.floor(Math.random() * 30)
    state.weather.visibility = 10 + Math.floor(Math.random() * 20)
    state.weather.isDeteriorating = true
    addLog('danger', '暴风雪来袭！气温骤降，能见度极低。')
  } else if (altitudeFactor > 0.7 && random < 0.3) {
    state.weather.condition = '冰雹'
    state.weather.temperature = -5 + Math.floor(Math.random() * 10)
    state.weather.windSpeed = 20 + Math.floor(Math.random() * 20)
    state.weather.visibility = 30 + Math.floor(Math.random() * 30)
    state.weather.isDeteriorating = true
    addLog('warning', '天空下起了冰雹！')
  } else if (altitudeFactor > 0.6 && random < 0.35) {
    state.weather.condition = '雾'
    state.weather.temperature = 0 + Math.floor(Math.random() * 10)
    state.weather.windSpeed = 5 + Math.floor(Math.random() * 10)
    state.weather.visibility = 15 + Math.floor(Math.random() * 20)
    state.weather.isDeteriorating = true
    addLog('warning', '浓雾升起，能见度下降。')
  } else if (random < 0.2) {
    state.weather.condition = '大雨'
    state.weather.temperature = 5 + Math.floor(Math.random() * 10)
    state.weather.windSpeed = 15 + Math.floor(Math.random() * 20)
    state.weather.visibility = 20 + Math.floor(Math.random() * 30)
    state.weather.isDeteriorating = true
    addLog('warning', '下起了大雨。')
  } else if (random < 0.4) {
    state.weather.condition = '多云'
    state.weather.temperature = 10 + Math.floor(Math.random() * 15) - altitudeFactor * 20
    state.weather.windSpeed = 5 + Math.floor(Math.random() * 15)
    state.weather.visibility = 60 + Math.floor(Math.random() * 30)
    state.weather.isDeteriorating = false
  } else {
    state.weather.condition = '晴'
    state.weather.temperature = 15 + Math.floor(Math.random() * 10) - altitudeFactor * 25
    state.weather.windSpeed = Math.floor(Math.random() * 10)
    state.weather.visibility = 80 + Math.floor(Math.random() * 20)
    state.weather.isDeteriorating = false
  }
}

// ===== 自然衰减 =====
export function processNaturalDecay() {
  const state = gameState
  const node = getCurrentNode()

  // 高海拔消耗更多
  const altitudePenalty = node.altitude > 3400 ? 1.5 : node.altitude > 3000 ? 1.2 : 1.0

  // 恶劣天气额外消耗
  const weatherPenalty = state.weather.isDeteriorating ? 1.3 : 1.0

  // 体力自然衰减
  const staminaDecay = Math.round(3 * altitudePenalty * weatherPenalty)
  const hydrationDecay = Math.round(4 * altitudePenalty * weatherPenalty)
  const hungerDecay = Math.round(3 * altitudePenalty * weatherPenalty)

  updatePlayerState({
    stamina: -staminaDecay,
    hydration: -hydrationDecay,
    hunger: -hungerDecay,
  })

  // 暴风雪额外伤害
  if (state.weather.condition === '暴风雪') {
    updatePlayerState({ health: -5 })
    addLog('danger', '暴风雪中持续失温！')
  }
}
