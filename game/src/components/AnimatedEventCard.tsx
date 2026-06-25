import { useState, useEffect } from 'react'
import { Mountain, AlertTriangle, Flame, Sparkles, HeartCrack, Tent } from 'lucide-react'

const categoryConfig: Record<string, {
  icon: typeof AlertTriangle
  color: string
  bg: string
  border: string
  label: string
  animClass: string
}> = {
  terrain: { icon: Mountain, color: 'text-orange-400', bg: 'bg-orange-500/8', border: 'border-orange-500/30', label: '地形事件', animClass: 'event-shake' },
  weather: { icon: AlertTriangle, color: 'text-blue-400', bg: 'bg-blue-500/8', border: 'border-blue-500/30', label: '天气事件', animClass: 'event-flash' },
  encounter: { icon: Flame, color: 'text-green-400', bg: 'bg-green-500/8', border: 'border-green-500/30', label: '遭遇事件', animClass: '' },
  discovery: { icon: Sparkles, color: 'text-yellow-400', bg: 'bg-yellow-500/8', border: 'border-yellow-500/30', label: '发现事件', animClass: 'event-glow' },
  crisis: { icon: HeartCrack, color: 'text-red-400', bg: 'bg-red-500/8', border: 'border-red-500/30', label: '危机事件', animClass: 'event-crisis' },
  memorial: { icon: Flame, color: 'text-purple-400', bg: 'bg-purple-500/8', border: 'border-purple-500/30', label: '纪念事件', animClass: 'event-memorial-fade' },
}

interface AnimatedEventCardProps {
  event: {
    title: string
    description: string
    category: string
    choices: Array<{
      id: string
      text: string
      narrative: string
    }>
  }
  onChoice: (id: string) => void
  onSkip?: () => void
}

export default function AnimatedEventCard({ event, onChoice, onSkip }: AnimatedEventCardProps) {
  const [phase, setPhase] = useState<'enter' | 'show' | 'choice'>('enter')
  const config = categoryConfig[event.category] || categoryConfig.terrain
  const Icon = config.icon

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'), 300)
    const t2 = setTimeout(() => setPhase('choice'), 1200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const crisisIcons: Record<string, string> = {
    '滑坠': '🏔️',
    '扭伤': '🦶',
    '碎石': '🪨',
    '狂风': '💨',
    '沼泽': '🟤',
    '冰河': '🧊',
    '雪桥': '🌉',
    '冰裂缝': '❄️',
    '陡坡': '⛰️',
    '暴风雪': '🌨️',
    '冰雹': '🧊',
    '雷暴': '⚡',
    '白化天': '🌫️',
    '暴雨': '🌧️',
    '高反': '🏔️',
    '失温': '🥶',
    '体力': '😩',
    '雪盲': '👁️',
    '脱水': '💧',
    '帐篷': '⛺',
    '登山杖': '🥾',
    '水袋': '💧',
    '衣物': '🧥',
    '食物': '🍞',
    '背包': '🎒',
    '狂风': '🌬️',
    '动物': '🦊',
    '进水': '🌊',
    '雪地': '❄️',
    '补给': '📦',
    '废弃': '🏚️',
    '水源': '💧',
    '绳索': '🪢',
    '墨镜': '🕶️',
    'GPS': '📡',
    '草药': '🌿',
    '野果': '🍎',
    '徒步者': '🚶',
    '救援队': '🚑',
    '野生动物': '🐻',
    '迷路': '🧭',
    '浓雾': '🌫️',
    '晒伤': '☀️',
    '寒夜': '🥶',
    '玛尼堆': '🪨',
    '岩洞': '🕳️',
  }

  const getEventIcon = (title: string) => {
    for (const [key, emoji] of Object.entries(crisisIcons)) {
      if (title.includes(key)) return emoji
    }
    return null
  }

  const eventEmoji = getEventIcon(event.title)

  return (
    <div className={`bg-mountain-800/90 backdrop-blur rounded-xl border h-full flex flex-col overflow-hidden transition-all duration-500 ${
      phase === 'enter' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
    } ${config.border} ${config.animClass}`}>
      {/* Event header with animation */}
      <div className={`p-4 sm:p-5 border-b ${config.border} relative overflow-hidden`}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          {event.category === 'crisis' && (
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-transparent to-red-500/20 animate-pulse" />
          )}
          {event.category === 'weather' && (
            <div className="absolute inset-0">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="absolute w-1 h-8 bg-blue-400/20 rotate-12 animate-rainDrop"
                  style={{ left: `${20 + i * 15}%`, animationDelay: `${i * 0.2}s`, animationDuration: '1s', animationIterationCount: 'infinite' }} />
              ))}
            </div>
          )}
          {event.category === 'discovery' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-yellow-400/10 rounded-full animate-ping" />
            </div>
          )}
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            {/* Animated icon */}
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.bg} ${config.border} border transition-all duration-700 ${
              phase !== 'enter' ? 'rotate-0 scale-100' : '-rotate-12 scale-50'
            }`}>
              {eventEmoji ? (
                <span className="text-xl">{eventEmoji}</span>
              ) : (
                <Icon size={20} className={config.color} />
              )}
            </div>
            <div>
              <h2 className={`text-base sm:text-lg font-bold ${config.color}`}>{event.title}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${config.border} ${config.color} bg-current/5`}>
                {config.label}
              </span>
            </div>
          </div>

          {/* Description with typewriter effect */}
          <div className={`mt-3 transition-all duration-700 ${
            phase !== 'enter' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <p className="text-sm text-mountain-200 leading-relaxed">{event.description}</p>
          </div>
        </div>
      </div>

      {/* Choice list with staggered entrance */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto">
        <h3 className="text-xs font-bold text-mountain-400 mb-3 tracking-wider uppercase">做出你的选择</h3>
        <div className="space-y-2.5">
          {event.choices.map((choice, idx) => (
            <button
              key={choice.id}
              onClick={() => onChoice(choice.id)}
              className={`choice-btn w-full text-left p-3.5 rounded-lg border transition-all duration-300 cursor-pointer
                ${config.bg} ${config.border} hover:brightness-150 hover:scale-[1.01] active:scale-[0.99]
                ${phase === 'choice' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <div className="flex items-start gap-3">
                <span className={`text-lg font-bold ${config.color} opacity-40 w-6 shrink-0`}>{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${config.color}`}>{choice.text}</p>
                  <p className="text-xs text-mountain-400 mt-1 leading-relaxed">{choice.narrative}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {event.category === 'memorial' && onSkip && (
          <button
            onClick={onSkip}
            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-mountain-700/60 hover:bg-mountain-600/80
              border border-mountain-600/50 rounded-md text-xs text-mountain-400 transition-all cursor-pointer"
          >
            默默走过
          </button>
        )}
      </div>
    </div>
  )
}
