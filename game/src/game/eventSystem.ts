import { gameState, addLog, updatePlayerState, updateWeather, getCurrentNode } from '../store/gameStore'
import type { WeatherEvent } from '../types'
import weatherData from '../data/weather.json'

const weatherEvents = weatherData as WeatherEvent[]

// 固定事件：到达特定节点时触发
const fixedEvents: Record<string, () => void> = {
  jinnianbei: () => {
    addLog('narrative', '你站在遇难山友纪念碑前，石碑上刻着一个个名字。每一个名字背后，都是一条在鳌太线上消逝的生命。你默默站了很久，心中升起一种复杂的情感——敬畏、恐惧，还有一丝说不清的执念。')
    updatePlayerState({ knowledgePoints: 3 })
    addLog('success', '你获得了3点事故知识。了解历史，才能避免重蹈覆辙。')
  },
  maijiling: () => {
    addLog('narrative', '麦秸岭——鳌太线上最危险的刃脊之一。风在这里大得几乎站不稳人，两侧是近乎垂直的陡坡。天气毫无征兆地开始变化……')
    // 麦秸岭必触发恶劣天气
    updateWeather({ temperature: -15, windSpeed: 40, visibility: -60 })
    addLog('danger', '天气骤变！暴风雪正在逼近！')
  },
  feijiliang: () => {
    addLog('narrative', '飞机梁——因形似飞机机翼而得名。这里是鳌太线上暴风雪最频繁的区域，多起致命事故发生于此。石海遍布，每一步都可能踩空。')
    // 飞机梁高概率恶劣天气
    if (Math.random() < 0.6) {
      updateWeather({ temperature: -20, windSpeed: 50, visibility: -80 })
      addLog('danger', '暴风雪突袭！能见度骤降！')
    }
  },
  taibailiang: () => {
    addLog('narrative', '太白梁——海拔超过3500米的死亡地带。高反症状在这里最为明显：头痛欲裂、恶心想吐、四肢无力。你感觉每走一步都像是在水中前行。')
    updatePlayerState({ stamina: -10, health: -5 })
    addLog('warning', '高海拔导致身体不适，体力和体温下降。')
  },
  dayehai: () => {
    addLog('narrative', '大爷海——碧蓝的高山冰斗湖在群山环抱中如同一颗宝石。这是鳌太线上最后的补给点，你可以在这里补充水源。')
    gameState.inventory.water = Math.min(gameState.inventory.water + 3, 8)
    updatePlayerState({ hydration: 15 })
    addLog('success', '你在大爷海补充了水源。')
  },
  baxiantai: () => {
    addLog('narrative', '拔仙台——秦岭主峰，海拔3767.2米！你站在云海之上，脚下是翻涌的白云，远处是连绵的群山。这一刻，所有的艰辛都化作了脚下的风景。但你深知，下山的路同样致命。')
    updatePlayerState({ knowledgePoints: 5 })
    addLog('success', '登顶拔仙台！获得5点事故知识。')
  },
}

// 随机事件池
const randomEvents = [
  {
    name: '发现前人遗留的补给',
    probability: 0.15,
    condition: () => gameState.inventory.food < 3 || gameState.inventory.water < 3,
    execute: () => {
      gameState.inventory.food += 1
      gameState.inventory.water += 1
      addLog('success', '你在路边发现了一个被遗弃的背包，里面还有些食物和水。前人的遗留，成了你的救命稻草。')
    }
  },
  {
    name: '碎石滑落',
    probability: 0.2,
    condition: () => {
      const node = getCurrentNode()
      return node.terrainType === '刃脊' || node.terrainType === '石海'
    },
    execute: () => {
      if (gameState.inventory.hikingPoles) {
        addLog('info', '脚下的碎石突然滑动，你用登山杖稳住了身体！')
        updatePlayerState({ stamina: -5 })
      } else {
        addLog('danger', '脚下的碎石突然滑动，你差点摔下去！没有登山杖，你只能靠双手抓住岩石。')
        updatePlayerState({ health: -10, stamina: -10 })
      }
    }
  },
  {
    name: '高反发作',
    probability: 0.25,
    condition: () => getCurrentNode().altitude >= 3400,
    execute: () => {
      addLog('warning', '头痛加剧，视线模糊——高反症状发作了。你需要放慢速度。')
      updatePlayerState({ stamina: -15, health: -5 })
    }
  },
  {
    name: '发现事故痕迹',
    probability: 0.2,
    condition: () => gameState.knowledgePoints < 10,
    execute: () => {
      addLog('narrative', '你在路边发现了一个破损的帐篷和散落的装备。这些物品的主人，恐怕已经不在了……')
      updatePlayerState({ knowledgePoints: 2 })
      addLog('info', '你获得了2点事故知识。')
    }
  },
  {
    name: '水源补给',
    probability: 0.2,
    condition: () => {
      const node = getCurrentNode()
      return node.terrainType === '营地' || node.name.includes('河')
    },
    execute: () => {
      gameState.inventory.water = Math.min(gameState.inventory.water + 2, 8)
      updatePlayerState({ hydration: 10 })
      addLog('success', '你找到了一处水源，补充了水量。')
    }
  },
  {
    name: '幻觉出现',
    probability: 0.1,
    condition: () => gameState.health < 30 && gameState.stamina < 30,
    execute: () => {
      addLog('danger', '你开始出现幻觉——看到前方有人影在招手，但揉揉眼睛又什么都没有。这是严重失温的信号！')
      updatePlayerState({ health: -8 })
    }
  },
  {
    name: '失温前兆',
    probability: 0.3,
    condition: () => gameState.health < 40 && gameState.weather.temperature < -5,
    execute: () => {
      if (gameState.inventory.warmClothes) {
        addLog('info', '你感到一阵寒意，但厚实的衣物帮你挡住了最冷的风。')
        updatePlayerState({ health: -3 })
      } else {
        addLog('danger', '寒冷刺骨！你没有足够的保暖衣物，体温在快速下降。失温正在逼近！')
        updatePlayerState({ health: -15 })
      }
    }
  },
  {
    name: '通讯中断',
    probability: 0.3,
    condition: () => getCurrentNode().altitude > 3000,
    execute: () => {
      if (!gameState.inventory.satelliteDevice) {
        addLog('warning', '手机没有信号。在这片无人区，你与外界的联系完全中断了。')
      } else {
        addLog('info', '手机没有信号，但卫星电话还可以使用。你至少还有最后的通信手段。')
      }
    }
  },
]

// NPC事件
const npcEvents = [
  {
    nodeId: 'camp2900',
    npc: {
      name: '独自穿越的男子',
      basedOnIncident: 'inc_2025_09',
      dialog: '你好，我也是一个人走鳌太。天气预报说这几天还算稳定，应该没问题吧？',
    },
    execute: () => {
      addLog('narrative', '在2900营地，你遇到了一名独自穿越的男子。他看起来装备还算齐全，但对天气的判断似乎过于乐观。')
    }
  },
  {
    nodeId: 'shuiwozi',
    npc: {
      name: '18岁的少年',
      basedOnIncident: 'inc_2025_02',
      dialog: '哥，我才18岁，第一次走鳌太。听说有人走完全程了，我也可以的！',
    },
    execute: () => {
      addLog('narrative', '在水窝子营地，你遇到了一个18岁的少年。他年纪不大，眼神里却满是倔强和不服输。')
    }
  },
  {
    nodeId: 'feijiliang',
    npc: {
      name: '5人穿越小队',
      basedOnIncident: 'inc_2026_01',
      dialog: '我们5个人一起走的，人多安全嘛！暴风雪？不会那么倒霉吧？',
    },
    execute: () => {
      addLog('narrative', '在飞机梁，你遇到了一支5人穿越小队。他们看起来信心满满，但装备参差不齐。')
    }
  },
  {
    nodeId: 'dongpaomaliang',
    npc: {
      name: '失踪少年的影子',
      basedOnIncident: 'inc_2025_10',
      dialog: '（你似乎看到远处有一个年轻的身影在雾中若隐若现……）',
    },
    execute: () => {
      addLog('narrative', '在东跑马梁的浓雾中，你隐约看到远处有一个年轻的身影。是幻觉？还是那个失踪的少年？你揉了揉眼睛，身影已经消失在雾中。')
      updatePlayerState({ knowledgePoints: 2 })
    }
  },
]

// 处理到达节点时的所有事件
export function processNodeEvents(nodeId: string) {
  // 1. 固定事件
  if (fixedEvents[nodeId]) {
    fixedEvents[nodeId]()
  }

  // 2. 随机事件
  for (const event of randomEvents) {
    if (event.condition() && Math.random() < event.probability) {
      event.execute()
    }
  }

  // 3. 天气事件
  processWeatherEvents(nodeId)

  // 4. NPC事件
  const npcEvent = npcEvents.find(e => e.nodeId === nodeId)
  if (npcEvent && Math.random() < 0.7) {
    npcEvent.execute()
  }

  // 5. 自然状态衰减
  processNaturalDecay()
}

// 处理天气事件
function processWeatherEvents(nodeId: string) {
  for (const weatherEvent of weatherEvents) {
    const affectsNode = weatherEvent.affectedNodes.length === 0 ||
      weatherEvent.affectedNodes.includes(nodeId)
    if (affectsNode && Math.random() < weatherEvent.probability) {
      addLog('narrative', weatherEvent.description)
      updateWeather({
        temperature: weatherEvent.effects.temperature,
        windSpeed: weatherEvent.effects.windSpeed,
        visibility: weatherEvent.effects.visibility,
      })
      updatePlayerState({
        health: weatherEvent.effects.health,
        stamina: weatherEvent.effects.stamina,
      })
      break // 每个节点最多触发一个天气事件
    }
  }
}

// 自然状态衰减（每到达一个节点）
function processNaturalDecay() {
  const node = getCurrentNode()
  const altitudeFactor = node.altitude > 3000 ? 1.5 : 1
  const dangerFactor = 1 + node.dangerLevel * 0.1

  // 基础衰减
  updatePlayerState({
    hydration: -2 * altitudeFactor,
    hunger: -1.5 * altitudeFactor,
    stamina: -3 * dangerFactor,
  })

  // 天气影响衰减
  if (gameState.weather.temperature < -10) {
    updatePlayerState({ health: -3 })
  }
  if (gameState.weather.windSpeed > 30) {
    updatePlayerState({ stamina: -2 })
  }
}
