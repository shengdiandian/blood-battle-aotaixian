export interface RouteNode {
  id: string;
  name: string;
  altitude: number;
  distance: number;
  terrainType: '石海' | '草甸' | '刃脊' | '丛林' | '营地' | '村庄' | '湖泊' | '庙宇';
  baseTimeCost: number;
  dangerLevel: number;
  weatherZones: string[];
  coordinates: [number, number]; // [lng, lat]
  description: string;
  nextNodes: string[]; // 可前往的下一个节点ID
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
  gamePhase: 'start' | 'playing' | 'ended';
  ending?: string;
  log: LogEntry[];
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
  type: 'info' | 'warning' | 'danger' | 'success' | 'narrative';
  message: string;
}

export interface GameChoice {
  id: string;
  text: string;
  effects: Partial<ChoiceEffect>;
  condition?: (state: PlayerState) => boolean;
  nextNode?: string;
  narrative?: string;
}

export interface ChoiceEffect {
  health: number;
  stamina: number;
  hydration: number;
  hunger: number;
  food: number;
  water: number;
  knowledgePoints: number;
}

export interface NPC {
  id: string;
  name: string;
  basedOnIncident: string;
  description: string;
  encounterNode: string;
  dialog: NPCDialog[];
}

export interface NPCDialog {
  id: string;
  text: string;
  choices: {
    text: string;
    effect: string; // NPC结局影响描述
    playerEffect: Partial<ChoiceEffect>;
  }[];
}

export interface Ending {
  id: string;
  title: string;
  type: 'HE' | 'normal' | 'BE' | 'tragic';
  description: string;
  condition: (state: PlayerState) => boolean;
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
