export interface RouteNode {
  id: string;
  name: string;
  altitude: number;
  distance: number;
  terrainType: '石海' | '草甸' | '刃脊' | '丛林' | '营地' | '村庄' | '湖泊' | '庙宇';
  baseTimeCost: number;
  dangerLevel: number;
  weatherZones: string[];
  coordinates: [number, number];
  description: string;
  nextNodes: string[];
}

export interface Incident {
  id: string;
  location: string;
  date: string;
  description: string;
  type: '失温' | '坠崖' | '高反' | '失踪' | '迷路' | '暴风雪';
  victims: number;
  source: string;
  severity: number;
}

export interface PlayerState {
  currentNode: string;
  progress: number;
  health: number;
  stamina: number;
  hydration: number;
  hunger: number;
  inventory: Inventory;
  knowledgePoints: number;
  alertedRisks: string[];
  dayCount: number;
  hourCount: number;
  weather: WeatherState;
  gamePhase: 'start' | 'playing' | 'event' | 'ended';
  ending?: string;
  log: LogEntry[];
  pendingEvent: GameEvent | null;
  visitedNodes: string[];
  luck: number; // 运气值，影响随机事件
}

export interface Inventory {
  tent: boolean;
  sleepingBag: boolean;
  food: number;
  water: number;
  gps: boolean;
  satelliteDevice: boolean;
  warmClothes: boolean;
  hikingPoles: boolean;
  headlamp: boolean;
  firstAidKit: boolean;
  rope: boolean;
  sunglasses: boolean;
}

export interface WeatherState {
  temperature: number;
  windSpeed: number;
  visibility: number;
  condition: '晴' | '多云' | '雾' | '小雨' | '大雨' | '暴风雪' | '冰雹';
  isDeteriorating: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: 'info' | 'warning' | 'danger' | 'success' | 'narrative' | 'memorial';
  message: string;
}

// ===== 随机事件系统 =====

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  category: 'terrain' | 'weather' | 'encounter' | 'discovery' | 'crisis' | 'memorial';
  choices: EventChoice[];
  /** 事件触发条件 */
  condition?: EventCondition;
}

export interface EventChoice {
  id: string;
  text: string;
  narrative: string;
  effects: EventEffect;
  /** 选择后的概率事件（如：70%成功，30%失败） */
  outcomes?: EventOutcome[];
}

export interface EventOutcome {
  probability: number; // 0-1
  narrative: string;
  effects: EventEffect;
  /** 装备获取 */
  gainItems?: Partial<Inventory>;
  /** 装备丢失 */
  loseItems?: (keyof Inventory)[];
}

export interface EventEffect {
  health?: number;
  stamina?: number;
  hydration?: number;
  hunger?: number;
  food?: number;
  water?: number;
  knowledgePoints?: number;
  luck?: number;
  /** 装备变化 */
  gainItems?: Partial<Inventory>;
  loseItems?: (keyof Inventory)[];
  /** 天气变化 */
  weatherChange?: {
    temperature?: number;
    windSpeed?: number;
    visibility?: number;
  };
}

export interface EventCondition {
  minAltitude?: number;
  maxAltitude?: number;
  terrainTypes?: RouteNode['terrainType'][];
  minDangerLevel?: number;
  weatherConditions?: WeatherState['condition'][];
  minHealth?: number;
  maxHealth?: number;
  minStamina?: number;
  hasItem?: keyof Inventory;
  lacksItem?: keyof Inventory;
  minDay?: number;
  maxDay?: number;
  minHour?: number;
  maxHour?: number;
  minLuck?: number;
  maxLuck?: number;
  minFood?: number;
  minWater?: number;
  notVisited?: boolean; // 只在首次到访触发
}

export interface Ending {
  id: string;
  title: string;
  type: 'HE' | 'normal' | 'BE' | 'tragic';
  description: string;
}

export interface WeatherEvent {
  id: string;
  name: string;
  description: string;
  affectedNodes: string[];
  probability: number;
  effects: {
    temperature: number;
    windSpeed: number;
    visibility: number;
    health: number;
    stamina: number;
  };
}
