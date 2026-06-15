import { proxy } from 'valtio'
import type { PlayerState, WeatherState, LogEntry } from '../types'
import routeData from '../data/route.json'
import type { RouteNode } from '../types'
import { generateNodeEvents, generateMemorialEvent, randomizeWeather, processNaturalDecay, resolveChoice } from '../game/eventSystem'

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
    rope: false,
    sunglasses: false,
  },
  knowledgePoints: 0,
  alertedRisks: [],
  dayCount: 1,
  hourCount: 6,
  weather: initialWeather,
  gamePhase: 'start',
  log: [],
  pendingEvent: null,
  visitedNodes: [],
  luck: 0,
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

  // 标记已访问
  if (!gameState.visitedNodes.includes(nodeId)) {
    gameState.visitedNodes.push(nodeId)
  }

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

  addLog('narrative', `到达${targetNode.name}，海拔${targetNode.altitude}米。${targetNode.description}`)

  // 随机化天气
  randomizeWeather(nodeId)

  // 自然衰减
  processNaturalDecay()

  // 生成随机事件
  const event = generateNodeEvents(nodeId)
  if (event) {
    gameState.pendingEvent = event
    gameState.gamePhase = 'event'
    addLog('warning', event.title)
    return // 等待玩家做出选择
  }

  // 没有随机事件，检查纪念事件
  const memorialEvent = generateMemorialEvent(nodeId)
  if (memorialEvent) {
    gameState.pendingEvent = memorialEvent
    gameState.gamePhase = 'event'
    addLog('memorial', memorialEvent.title)
    return
  }

  // 检查是否到达终点
  checkEndCondition(targetNode)
}

// 处理事件选择
export function handleEventChoice(choiceId: string) {
  const event = gameState.pendingEvent
  if (!event) return

  resolveChoice(event, choiceId)

  // 清除待处理事件
  gameState.pendingEvent = null

  // 检查是否死亡
  if (gameState.gamePhase === 'ended') return

  // 如果当前事件是随机事件，再检查纪念事件
  if (event.category !== 'memorial') {
    const memorialEvent = generateMemorialEvent(gameState.currentNode)
    if (memorialEvent) {
      gameState.pendingEvent = memorialEvent
      gameState.gamePhase = 'event'
      addLog('memorial', memorialEvent.title)
      return
    }
  }

  // 回到正常游戏
  gameState.gamePhase = 'playing'

  // 检查是否到达终点
  const currentNode = getCurrentNode()
  checkEndCondition(currentNode)
}

// 跳过事件（仅纪念事件可跳过）
export function skipEvent() {
  if (!gameState.pendingEvent) return
  if (gameState.pendingEvent.category !== 'memorial') return

  addLog('info', '你默默走过，继续赶路。')
  gameState.pendingEvent = null
  gameState.gamePhase = 'playing'

  const currentNode = getCurrentNode()
  checkEndCondition(currentNode)
}

// 检查终点条件
function checkEndCondition(node: RouteNode) {
  if (node.nextNodes.length === 0) {
    gameState.gamePhase = 'ended'
    gameState.ending = 'ending_he'
    addLog('success', '你成功走出了鳌太线！')
  }
}

// 扎营休息（含风险系统）
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

  // ===== 扎营风险系统 =====
  const node = getCurrentNode()
  const nightRisk = Math.random()

  // 高海拔暴风雪：帐篷可能被摧毁
  if (gameState.weather.condition === '暴风雪' && nightRisk < 0.35) {
    gameState.inventory.tent = false
    updatePlayerState({ health: -15 })
    addLog('danger', '暴风雪摧毁了你的帐篷！你在寒冷中度过了一夜，严重失温。')
  }
  // 高海拔大风：帐篷可能损坏
  else if (node.altitude > 3000 && gameState.weather.windSpeed > 30 && nightRisk < 0.3) {
    gameState.inventory.tent = false
    updatePlayerState({ health: -10 })
    addLog('danger', '夜间狂风撕毁了帐篷！你不得不在风中熬到天亮。')
  }
  // 动物偷食物
  else if (nightRisk < 0.25) {
    const foodLost = Math.min(gameState.inventory.food, Math.random() < 0.5 ? 1 : 2)
    if (foodLost > 0) {
      gameState.inventory.food = Math.max(0, gameState.inventory.food - foodLost)
      addLog('warning', `夜间有动物光顾营地，偷走了${foodLost}份食物。`)
    }
  }
  // 营地进水（下雨天）
  else if (gameState.weather.condition === '大雨' && nightRisk < 0.4) {
    if (gameState.inventory.sleepingBag && Math.random() < 0.4) {
      gameState.inventory.sleepingBag = false
      updatePlayerState({ health: -8 })
      addLog('danger', '大雨导致营地进水，睡袋被浸湿无法使用！')
    } else {
      updatePlayerState({ health: -5 })
      addLog('warning', '大雨导致营地进水，你被淋湿了。')
    }
  }

  // 夜间温度影响
  if (!hasSleepingBag) {
    updatePlayerState({ health: -10 })
    addLog('warning', '没有睡袋，夜间失温严重。')
  }

  // 高海拔额外失温
  if (node.altitude > 3400) {
    updatePlayerState({ health: -5 })
    addLog('warning', '高海拔夜间极寒，体温持续下降。')
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
  Object.assign(gameState, { ...initialState, gamePhase: 'playing', log: [], visitedNodes: ['tangkou'] })
  addLog('narrative', '你站在塘口村的村口，背对着温暖的人间，面向秦岭的苍茫群山。鳌太线——这条被称作"中华龙脊"的穿越路线，将在前方170公里的山脊上考验你的每一步。')
  addLog('info', '提示：注意管理你的体温、体力、水分和饥饿。任一数值归零，游戏结束。每次到达新地点，你将面临随机事件，做出选择将影响你的命运。')
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
    addLog('warning', '体温严重过低，请尽快保暖！')
  }
  if (gameState.stamina > 0 && gameState.stamina <= 20) {
    addLog('warning', '体力即将耗尽，请休息！')
  }
  if (gameState.hydration > 0 && gameState.hydration <= 20) {
    addLog('warning', '严重缺水，请补充水分！')
  }
  if (gameState.hunger > 0 && gameState.hunger <= 20) {
    addLog('warning', '严重饥饿，请进食！')
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
