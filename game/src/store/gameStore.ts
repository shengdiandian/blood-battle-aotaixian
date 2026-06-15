import { proxy } from 'valtio'
import type { PlayerState, WeatherState, LogEntry } from '../types'
import routeData from '../data/route.json'
import type { RouteNode } from '../types'

const routeNodes = routeData as RouteNode[]

const initialWeather: WeatherState = {
  temperature: 15,
  windSpeed: 10,
  visibility: 100,
  condition: '晴',
  isDeteriorating: false,
}

const initialState: PlayerState = {
  currentNode: 'tangkou',
  progress: 0,
  health: 100,
  stamina: 100,
  hydration: 100,
  hunger: 100,
  inventory: {
    tent: true,
    sleepingBag: true,
    food: 5,
    water: 5,
    gps: false,
    satelliteDevice: false,
    warmClothes: true,
    hikingPoles: true,
    headlamp: true,
    firstAidKit: true,
  },
  knowledgePoints: 0,
  alertedRisks: [],
  dayCount: 1,
  hourCount: 6,
  weather: initialWeather,
  gamePhase: 'start',
  log: [],
}

export const gameState = proxy<PlayerState>({ ...initialState })

// 获取当前节点信息
export function getCurrentNode(): RouteNode {
  return routeNodes.find(n => n.id === gameState.currentNode)!
}

// 获取所有路线节点
export function getRouteNodes(): RouteNode[] {
  return routeNodes
}

// 添加日志
export function addLog(type: LogEntry['type'], message: string) {
  gameState.log.push({
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    type,
    message,
  })
}

// 更新玩家状态
export function updatePlayerState(effects: {
  health?: number
  stamina?: number
  hydration?: number
  hunger?: number
  food?: number
  water?: number
  knowledgePoints?: number
}) {
  if (effects.health) gameState.health = clamp(gameState.health + effects.health, 0, 100)
  if (effects.stamina) gameState.stamina = clamp(gameState.stamina + effects.stamina, 0, 100)
  if (effects.hydration) gameState.hydration = clamp(gameState.hydration + effects.hydration, 0, 100)
  if (effects.hunger) gameState.hunger = clamp(gameState.hunger + effects.hunger, 0, 100)
  if (effects.food) gameState.inventory.food = Math.max(0, gameState.inventory.food + effects.food)
  if (effects.water) gameState.inventory.water = Math.max(0, gameState.inventory.water + effects.water)
  if (effects.knowledgePoints) gameState.knowledgePoints += effects.knowledgePoints

  checkDeathCondition()
}

// 移动到下一个节点
export function moveToNode(nodeId: string) {
  const targetNode = routeNodes.find(n => n.id === nodeId)
  if (!targetNode) return

  const currentNode = getCurrentNode()
  if (!currentNode.nextNodes.includes(nodeId)) return

  gameState.currentNode = nodeId
  gameState.progress = Math.round((targetNode.distance / 120) * 100)
  gameState.hourCount += targetNode.baseTimeCost

  // 消耗基础体力
  const staminaCost = targetNode.baseTimeCost * 5 + targetNode.dangerLevel * 3
  const hydrationCost = targetNode.baseTimeCost * 4
  const hungerCost = targetNode.baseTimeCost * 3

  updatePlayerState({
    stamina: -staminaCost,
    hydration: -hydrationCost,
    hunger: -hungerCost,
  })

  // 时间推进
  if (gameState.hourCount >= 24) {
    gameState.hourCount -= 24
    gameState.dayCount += 1
    addLog('info', `第${gameState.dayCount}天开始了。`)
  }

  addLog('narrative', `到达${targetNode.name}，海拔${targetNode.altitude}米。`)

  // 检查是否到达终点
  if (targetNode.nextNodes.length === 0) {
    gameState.gamePhase = 'ended'
    gameState.ending = 'ending_he'
    addLog('success', '你成功走出了鳌太线！')
  }
}

// 扎营休息
export function makeCamp() {
  if (!gameState.inventory.tent) {
    addLog('warning', '你没有帐篷，无法扎营！')
    return
  }

  const hasSleepingBag = gameState.inventory.sleepingBag
  const healthRecovery = hasSleepingBag ? 20 : 10
  const staminaRecovery = hasSleepingBag ? 30 : 15

  updatePlayerState({
    health: healthRecovery,
    stamina: staminaRecovery,
  })

  // 消耗食物和水
  if (gameState.inventory.food > 0) {
    gameState.inventory.food -= 1
    updatePlayerState({ hunger: 15 })
  }
  if (gameState.inventory.water > 0) {
    gameState.inventory.water -= 1
    updatePlayerState({ hydration: 15 })
  }

  gameState.hourCount = 6
  gameState.dayCount += 1

  // 夜间温度影响
  if (!hasSleepingBag) {
    updatePlayerState({ health: -10 })
    addLog('warning', '没有睡袋，夜间失温严重。')
  }

  addLog('info', `你在帐篷中休息了一夜。第${gameState.dayCount}天清晨。`)
}

// 进食补水
export function eatAndDrink() {
  if (gameState.inventory.food > 0 && gameState.inventory.water > 0) {
    gameState.inventory.food -= 1
    gameState.inventory.water -= 1
    updatePlayerState({ hunger: 20, hydration: 20, stamina: 5 })
    addLog('info', '你吃了些食物，喝了些水。')
  } else if (gameState.inventory.food > 0) {
    gameState.inventory.food -= 1
    updatePlayerState({ hunger: 20, stamina: 3 })
    addLog('warning', '你吃了食物，但已经没有水了。')
  } else if (gameState.inventory.water > 0) {
    gameState.inventory.water -= 1
    updatePlayerState({ hydration: 20 })
    addLog('warning', '你喝了水，但已经没有食物了。')
  } else {
    addLog('danger', '食物和水都已耗尽！')
  }
}

// 使用急救包
export function useFirstAid() {
  if (!gameState.inventory.firstAidKit) {
    addLog('warning', '你没有急救包！')
    return
  }
  gameState.inventory.firstAidKit = false
  updatePlayerState({ health: 25 })
  addLog('success', '你使用了急救包，恢复了一些体力。')
}

// 更新天气
export function updateWeather(weatherEffect: {
  temperature?: number
  windSpeed?: number
  visibility?: number
}) {
  if (weatherEffect.temperature)
    gameState.weather.temperature += weatherEffect.temperature
  if (weatherEffect.windSpeed)
    gameState.weather.windSpeed = Math.max(0, gameState.weather.windSpeed + weatherEffect.windSpeed)
  if (weatherEffect.visibility)
    gameState.weather.visibility = clamp(gameState.weather.visibility + weatherEffect.visibility, 0, 100)

  // 判断天气状况
  if (gameState.weather.visibility < 20 && gameState.weather.windSpeed > 40) {
    gameState.weather.condition = '暴风雪'
    gameState.weather.isDeteriorating = true
  } else if (gameState.weather.visibility < 30) {
    gameState.weather.condition = '雾'
    gameState.weather.isDeteriorating = true
  } else if (gameState.weather.windSpeed > 30) {
    gameState.weather.condition = '大雨'
    gameState.weather.isDeteriorating = true
  } else if (gameState.weather.windSpeed > 15) {
    gameState.weather.condition = '多云'
    gameState.weather.isDeteriorating = false
  } else {
    gameState.weather.condition = '晴'
    gameState.weather.isDeteriorating = false
  }
}

// 开始游戏
export function startGame() {
  Object.assign(gameState, { ...initialState, gamePhase: 'playing', log: [] })
  addLog('narrative', '你站在塘口村的村口，背对着温暖的人间，面向秦岭的苍茫群山。鳌太线——这条被称作"中华龙脊"的穿越路线，将在前方170公里的山脊上考验你的每一步。')
  addLog('info', '提示：注意管理你的体温、体力、水分和饥饿。任一数值归零，游戏结束。')
}

// 重置游戏
export function resetGame() {
  Object.assign(gameState, { ...initialState, log: [] })
}

// 检查死亡条件
function checkDeathCondition() {
  if (gameState.health <= 0) {
    gameState.gamePhase = 'ended'
    gameState.ending = 'ending_hypothermia'
    addLog('danger', '你的体温降至致命水平，失温夺走了你的意识……')
  } else if (gameState.stamina <= 0) {
    gameState.gamePhase = 'ended'
    gameState.ending = 'ending_altitude'
    addLog('danger', '体力完全耗尽，你倒在了高海拔的荒野中……')
  } else if (gameState.hydration <= 0) {
    gameState.gamePhase = 'ended'
    gameState.ending = 'ending_altitude'
    addLog('danger', '严重脱水导致身体崩溃……')
  } else if (gameState.hunger <= 0) {
    gameState.gamePhase = 'ended'
    gameState.ending = 'ending_altitude'
    addLog('danger', '饥饿让你的身体无法继续运转……')
  }

  // 低值警告
  if (gameState.health > 0 && gameState.health <= 20) {
    addLog('warning', '⚠ 体温严重过低，请尽快保暖！')
  }
  if (gameState.stamina > 0 && gameState.stamina <= 20) {
    addLog('warning', '⚠ 体力即将耗尽，请休息！')
  }
  if (gameState.hydration > 0 && gameState.hydration <= 20) {
    addLog('warning', '⚠ 严重缺水，请补充水分！')
  }
  if (gameState.hunger > 0 && gameState.hunger <= 20) {
    addLog('warning', '⚠ 严重饥饿，请进食！')
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
