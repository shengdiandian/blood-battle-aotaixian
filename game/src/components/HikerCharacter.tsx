import { useMemo } from 'react'

interface HikerProps {
  health: number
  stamina: number
  hydration: number
  weather: string
}

export default function HikerCharacter({ health, stamina, hydration, weather }: HikerProps) {
  const posture = useMemo(() => {
    if (health <= 20) return 'critical'
    if (stamina <= 30) return 'exhausted'
    if (hydration <= 20) return 'dehydrated'
    return 'normal'
  }, [health, stamina, hydration])

  const bodyColor = health <= 30 ? '#f87171' : health <= 60 ? '#fbbf24' : '#e2e8f0'
  const breathe = posture === 'critical' ? 'animate-pulse' : ''

  const headTilt = posture === 'exhausted' ? 10 : posture === 'critical' ? 15 : 0
  const bodyLean = posture === 'exhausted' ? 5 : 0
  const legAngle = posture === 'critical' ? 15 : 0

  return (
    <div className="relative w-16 h-24 sm:w-20 sm:h-28">
      <svg viewBox="0 0 60 90" className={`w-full h-full ${breathe}`}>
        <defs>
          <linearGradient id="hikerBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={bodyColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={bodyColor} stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Backpack */}
        <rect x="26" y="28" width="14" height="20" rx="3" fill="#475569" opacity="0.7" />
        <rect x="28" y="30" width="10" height="5" rx="1" fill="#64748b" opacity="0.5" />

        {/* Body */}
        <g transform={`rotate(${bodyLean}, 30, 50)`}>
          {/* Torso */}
          <rect x="24" y="30" width="12" height="22" rx="3" fill="url(#hikerBody)" />

          {/* Head */}
          <g transform={`rotate(${headTilt}, 30, 20)`}>
            <circle cx="30" cy="18" r="8" fill={bodyColor} opacity="0.8" />
            {/* Hat */}
            <ellipse cx="30" cy="12" rx="10" ry="3" fill="#475569" opacity="0.7" />
            <rect x="25" y="10" width="10" height="4" rx="2" fill="#64748b" opacity="0.6" />
            {/* Eyes */}
            <circle cx="27" cy="18" r="1" fill="#1e293b" opacity="0.8" />
            <circle cx="33" cy="18" r="1" fill="#1e293b" opacity="0.8" />
            {/* Expression based on health */}
            {posture === 'critical' && (
              <path d="M27,22 Q30,24 33,22" fill="none" stroke="#1e293b" strokeWidth="0.8" opacity="0.6" />
            )}
            {posture === 'exhausted' && (
              <line x1="27" y1="22" x2="33" y2="22" stroke="#1e293b" strokeWidth="0.8" opacity="0.6" />
            )}
            {(posture === 'normal' || posture === 'dehydrated') && (
              <path d="M27,21 Q30,23 33,21" fill="none" stroke="#1e293b" strokeWidth="0.8" opacity="0.6" />
            )}
          </g>

          {/* Arms */}
          <line x1="24" y1="34" x2="16" y2="48" stroke={bodyColor} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          <line x1="36" y1="34" x2="44" y2="48" stroke={bodyColor} strokeWidth="3" strokeLinecap="round" opacity="0.7" />

          {/* Hiking pole in right hand */}
          <line x1="44" y1="48" x2="48" y2="72" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

          {/* Legs */}
          <g transform={`rotate(${legAngle}, 28, 52)`}>
            <line x1="28" y1="52" x2="24" y2="72" stroke={bodyColor} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          </g>
          <g transform={`rotate(${-legAngle}, 32, 52)`}>
            <line x1="32" y1="52" x2="36" y2="72" stroke={bodyColor} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          </g>

          {/* Boots */}
          <ellipse cx="23" cy="73" rx="4" ry="2" fill="#475569" opacity="0.6" />
          <ellipse cx="37" cy="73" rx="4" ry="2" fill="#475569" opacity="0.6" />
        </g>

        {/* Weather effects on character */}
        {weather === '暴风雪' && (
          <g opacity="0.4">
            <circle cx="15" cy="10" r="1" fill="white" />
            <circle cx="45" cy="15" r="1" fill="white" />
            <circle cx="20" cy="25" r="0.8" fill="white" />
          </g>
        )}

        {/* Breath vapor when cold */}
        {(weather === '暴风雪' || weather === '冰雹') && (
          <g opacity="0.3">
            <ellipse cx="34" cy="16" rx="3" ry="1.5" fill="white" opacity="0.2" />
            <ellipse cx="36" cy="14" rx="4" ry="1" fill="white" opacity="0.1" />
          </g>
        )}

        {/* Status indicators */}
        {health <= 30 && (
          <g>
            <circle cx="10" cy="15" r="3" fill="#ef4444" opacity="0.6">
              <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <text x="10" y="17" textAnchor="middle" fill="white" fontSize="4" fontWeight="bold">!</text>
          </g>
        )}

        {hydration <= 25 && (
          <g>
            <circle cx="50" cy="15" r="3" fill="#38bdf8" opacity="0.6">
              <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
            </circle>
            <text x="50" y="17" textAnchor="middle" fill="white" fontSize="3.5" fontWeight="bold">💧</text>
          </g>
        )}
      </svg>

      {/* Posture label */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap">
        {posture === 'critical' && <span className="text-red-400 font-bold">濒危</span>}
        {posture === 'exhausted' && <span className="text-amber-400">疲惫</span>}
        {posture === 'dehydrated' && <span className="text-blue-400">缺水</span>}
        {posture === 'normal' && <span className="text-mountain-500">前行</span>}
      </div>
    </div>
  )
}
