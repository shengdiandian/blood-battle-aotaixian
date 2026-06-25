import { useSnapshot } from 'valtio'
import { gameState } from '../store/gameStore'
import { Thermometer, Heart, Droplets, Utensils, MapPin, Clock, CloudSun, Backpack, Star } from 'lucide-react'

function StatusBar({ icon: Icon, label, value, color }: {
  icon: React.ElementType
  label: string
  value: number
  color: string
}) {
  const isDanger = value <= 20
  const isWarning = value <= 40
  const barColor = isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-500' : color

  return (
    <div className={`mb-3 ${isDanger ? 'status-bar-danger rounded-md' : isWarning ? 'status-bar-warning rounded-md' : ''} px-1 py-0.5`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <Icon size={13} className={isDanger ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-mountain-400'} />
          <span className="text-xs text-mountain-400">{label}</span>
        </div>
        <span className={`text-xs font-mono font-bold ${
          isDanger ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-mountain-200'
        }`}>
          {value}
        </span>
      </div>
      <div className="h-1.5 bg-mountain-700/60 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${value}%`, boxShadow: isDanger ? '0 0 8px rgba(239,68,68,0.5)' : isWarning ? '0 0 6px rgba(245,158,11,0.3)' : 'none' }}
        />
      </div>
    </div>
  )
}

export default function StatusPanel() {
  const state = useSnapshot(gameState)

  const weatherEmoji = (condition: string) => {
    const map: Record<string, string> = {
      '晴': '☀️', '多云': '⛅', '雾': '🌫️', '小雨': '🌧️',
      '大雨': '🌧️', '暴风雪': '❄️', '冰雹': '🧊',
    }
    return map[condition] || '☀️'
  }

  return (
    <div className="bg-mountain-800/80 backdrop-blur rounded-lg p-4 border border-mountain-700/60 h-full overflow-y-auto card-atmosphere">
      {/* Header */}
      <h2 className="text-xs font-bold text-mountain-300 mb-4 flex items-center gap-2 tracking-wider uppercase">
        <Heart size={14} className="text-red-400" />
        生存状态
      </h2>

      {/* Vital bars */}
      <StatusBar icon={Thermometer} label="体温" value={state.health} color="bg-cyan-500" />
      <StatusBar icon={Heart} label="体力" value={state.stamina} color="bg-emerald-500" />
      <StatusBar icon={Droplets} label="水分" value={state.hydration} color="bg-blue-400" />
      <StatusBar icon={Utensils} label="饱腹" value={state.hunger} color="bg-amber-500" />

      {/* Location */}
      <div className="mt-4 pt-3 border-t border-mountain-700/50">
        <h3 className="text-xs font-bold text-mountain-400 mb-2 tracking-wider uppercase">位置</h3>
        <div className="space-y-1.5 text-xs text-mountain-300">
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-mountain-500" />
            <span>进度 <span className="text-mountain-100 font-bold">{state.progress}%</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-mountain-500" />
            <span>第<span className="text-mountain-100 font-bold">{state.dayCount}</span>天 {String(state.hourCount).padStart(2, '0')}:00</span>
          </div>
          <div className="flex items-center gap-2">
            <CloudSun size={12} className="text-mountain-500" />
            <span>{weatherEmoji(state.weather.condition)} {state.weather.condition} {state.weather.temperature}°C</span>
          </div>
        </div>
      </div>

      {/* Equipment */}
      <div className="mt-4 pt-3 border-t border-mountain-700/50">
        <h3 className="text-xs font-bold text-mountain-400 mb-2 tracking-wider uppercase flex items-center gap-1.5">
          <Backpack size={12} /> 装备
        </h3>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {[
            { key: 'tent', icon: '⛺', label: '帐篷' },
            { key: 'sleepingBag', icon: '🛏️', label: '睡袋' },
            { key: 'gps', icon: '📡', label: 'GPS' },
            { key: 'satelliteDevice', icon: '📱', label: '卫星电话' },
            { key: 'warmClothes', icon: '🧥', label: '保暖衣物' },
            { key: 'hikingPoles', icon: '🥾', label: '登山杖' },
            { key: 'headlamp', icon: '🔦', label: '头灯' },
            { key: 'firstAidKit', icon: '💊', label: '急救包' },
            { key: 'rope', icon: '🪢', label: '绳索' },
            { key: 'sunglasses', icon: '🕶️', label: '墨镜' },
          ].map(item => {
            const has = state.inventory[item.key as keyof typeof state.inventory]
            return (
              <span
                key={item.key}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${
                  has ? 'text-mountain-200' : 'text-mountain-600 line-through'
                }`}
              >
                <span className="text-xs">{item.icon}</span>
                <span>{item.label}</span>
              </span>
            )
          })}
        </div>
        <div className="mt-2 space-y-0.5 text-xs text-mountain-400">
          <div className="flex justify-between">
            <span>🍞 食物</span>
            <span className={state.inventory.food <= 1 ? 'text-red-400 font-bold' : 'text-mountain-200'}>×{state.inventory.food}</span>
          </div>
          <div className="flex justify-between">
            <span>💧 饮水</span>
            <span className={state.inventory.water <= 1 ? 'text-red-400 font-bold' : 'text-mountain-200'}>×{state.inventory.water}</span>
          </div>
        </div>
      </div>

      {/* Other stats */}
      {(state.knowledgePoints > 0 || state.luck > 0) && (
        <div className="mt-4 pt-3 border-t border-mountain-700/50">
          <h3 className="text-xs font-bold text-mountain-400 mb-2 tracking-wider uppercase flex items-center gap-1.5">
            <Star size={12} /> 其他
          </h3>
          <div className="space-y-1">
            {state.knowledgePoints > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-amber-400">📚</span>
                <span className="text-mountain-400">事故知识</span>
                <span className="text-amber-400 font-bold ml-auto">{state.knowledgePoints}</span>
              </div>
            )}
            {state.luck > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-emerald-400">🍀</span>
                <span className="text-mountain-400">运气</span>
                <span className="text-emerald-400 font-bold ml-auto">{state.luck.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
