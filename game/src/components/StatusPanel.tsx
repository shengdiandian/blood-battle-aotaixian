import { useSnapshot } from 'valtio'
import { gameState } from '../store/gameStore'
import { Thermometer, Heart, Droplets, Utensils, MapPin, Clock, CloudSun } from 'lucide-react'

function StatusBar({ icon: Icon, label, value, color }: {
  icon: React.ElementType
  label: string
  value: number
  color: string
}) {
  const barColor = value <= 20 ? 'bg-danger-500' : value <= 40 ? 'bg-warning-500' : color
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <Icon size={14} className={value <= 20 ? 'text-danger-400' : 'text-mountain-300'} />
          <span className="text-xs text-mountain-300">{label}</span>
        </div>
        <span className={`text-xs font-mono ${value <= 20 ? 'text-danger-400' : 'text-mountain-200'}`}>
          {value}
        </span>
      </div>
      <div className="h-2 bg-mountain-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

export default function StatusPanel() {
  const state = useSnapshot(gameState)

  const weatherIcon = {
    '晴': '☀️',
    '多云': '⛅',
    '雾': '🌫️',
    '小雨': '🌧️',
    '大雨': '🌧️',
    '暴风雪': '🌨️',
    '冰雹': '🧊',
  }

  return (
    <div className="bg-mountain-800 rounded-lg p-4 border border-mountain-700 h-full overflow-y-auto">
      <h2 className="text-sm font-bold text-mountain-100 mb-4 flex items-center gap-2">
        <Heart size={16} className="text-danger-400" />
        生存状态
      </h2>

      <StatusBar icon={Thermometer} label="体温" value={state.health} color="bg-ice-500" />
      <StatusBar icon={Heart} label="体力" value={state.stamina} color="bg-success-500" />
      <StatusBar icon={Droplets} label="水分" value={state.hydration} color="bg-ice-400" />
      <StatusBar icon={Utensils} label="饱腹" value={state.hunger} color="bg-warning-500" />

      <div className="mt-4 pt-3 border-t border-mountain-700">
        <h3 className="text-xs font-bold text-mountain-300 mb-2">位置信息</h3>
        <div className="space-y-1.5 text-xs text-mountain-300">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} />
            <span>{state.progress}% 已完成</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} />
            <span>第{state.dayCount}天 {state.hourCount}:00</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CloudSun size={12} />
            <span>{weatherIcon[state.weather.condition]} {state.weather.condition} {state.weather.temperature}°C</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-mountain-700">
        <h3 className="text-xs font-bold text-mountain-300 mb-2">装备</h3>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <span className={state.inventory.tent ? 'text-success-400' : 'text-mountain-500'}>
            🏕️ 帐篷
          </span>
          <span className={state.inventory.sleepingBag ? 'text-success-400' : 'text-mountain-500'}>
            🛏️ 睡袋
          </span>
          <span className={state.inventory.gps ? 'text-success-400' : 'text-mountain-500'}>
            📡 GPS
          </span>
          <span className={state.inventory.satelliteDevice ? 'text-success-400' : 'text-mountain-500'}>
            📱 卫星电话
          </span>
          <span className={state.inventory.warmClothes ? 'text-success-400' : 'text-mountain-500'}>
            🧥 保暖衣物
          </span>
          <span className={state.inventory.hikingPoles ? 'text-success-400' : 'text-mountain-500'}>
            🥾 登山杖
          </span>
          <span className={state.inventory.headlamp ? 'text-success-400' : 'text-mountain-500'}>
            🔦 头灯
          </span>
          <span className={state.inventory.firstAidKit ? 'text-success-400' : 'text-mountain-500'}>
            💊 急救包
          </span>
          <span className={state.inventory.rope ? 'text-success-400' : 'text-mountain-500'}>
            🪢 绳索
          </span>
          <span className={state.inventory.sunglasses ? 'text-success-400' : 'text-mountain-500'}>
            🕶️ 墨镜
          </span>
        </div>
        <div className="mt-2 space-y-1 text-xs text-mountain-300">
          <div>🍞 食物 ×{state.inventory.food}</div>
          <div>💧 饮水 ×{state.inventory.water}</div>
        </div>
      </div>

      {(state.knowledgePoints > 0 || state.luck > 0) && (
        <div className="mt-4 pt-3 border-t border-mountain-700">
          <h3 className="text-xs font-bold text-mountain-300 mb-1">其他</h3>
          {state.knowledgePoints > 0 && (
            <div className="text-xs text-warning-400">📚 事故知识 {state.knowledgePoints} 点</div>
          )}
          {state.luck > 0 && (
            <div className="text-xs text-green-400">🍀 运气 {state.luck.toFixed(1)}</div>
          )}
        </div>
      )}
    </div>
  )
}
