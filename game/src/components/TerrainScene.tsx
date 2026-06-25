import { useMemo } from 'react'

const terrainConfigs: Record<string, {
  bg: string
  layers: string
  particles?: string
}> = {
  '石海': {
    bg: 'from-slate-800 via-slate-700 to-slate-900',
    layers: `
      <rect x="0" y="60%" width="100%" height="40%" fill="#1e293b" opacity="0.8"/>
      <polygon points="0,70 30,45 60,65 90,40 120,60 150,50 180,70 210,45 240,65 270,55 300,70" fill="#334155" opacity="0.6"/>
      <polygon points="0,80 40,55 80,75 120,50 160,70 200,55 240,75 280,60 300,80" fill="#475569" opacity="0.4"/>
      <rect x="15" y="55" width="8" height="6" rx="1" fill="#64748b" opacity="0.5" transform="rotate(-5,19,58)"/>
      <rect x="50" y="48" width="10" height="7" rx="1" fill="#64748b" opacity="0.4" transform="rotate(8,55,52)"/>
      <rect x="90" y="52" width="7" height="5" rx="1" fill="#94a3b8" opacity="0.3"/>
      <rect x="140" y="46" width="12" height="8" rx="1" fill="#64748b" opacity="0.5" transform="rotate(-3,146,50)"/>
      <rect x="200" y="50" width="9" height="6" rx="1" fill="#94a3b8" opacity="0.4" transform="rotate(5,205,53)"/>
      <rect x="250" y="54" width="8" height="5" rx="1" fill="#64748b" opacity="0.3"/>
    `,
  },
  '草甸': {
    bg: 'from-green-900 via-emerald-800 to-green-900',
    layers: `
      <rect x="0" y="55%" width="100%" height="45%" fill="#14532d" opacity="0.6"/>
      <ellipse cx="30" cy="55" rx="15" ry="8" fill="#166534" opacity="0.5"/>
      <ellipse cx="80" cy="50" rx="20" ry="10" fill="#15803d" opacity="0.4"/>
      <ellipse cx="150" cy="52" rx="25" ry="12" fill="#166534" opacity="0.5"/>
      <ellipse cx="220" cy="48" rx="18" ry="9" fill="#15803d" opacity="0.4"/>
      <ellipse cx="270" cy="54" rx="20" ry="10" fill="#166534" opacity="0.5"/>
      <line x1="40" y1="45" x2="38" y2="35" stroke="#22c55e" stroke-width="1" opacity="0.4"/>
      <line x1="42" y1="45" x2="44" y2="33" stroke="#4ade80" stroke-width="0.8" opacity="0.3"/>
      <line x1="120" y1="42" x2="118" y2="30" stroke="#22c55e" stroke-width="1" opacity="0.4"/>
      <line x1="122" y1="42" x2="125" y2="28" stroke="#4ade80" stroke-width="0.8" opacity="0.3"/>
      <line x1="200" y1="43" x2="198" y2="32" stroke="#22c55e" stroke-width="1" opacity="0.3"/>
      <line x1="250" y1="46" x2="252" y2="34" stroke="#4ade80" stroke-width="0.8" opacity="0.3"/>
    `,
  },
  '刃脊': {
    bg: 'from-red-950 via-slate-800 to-red-950',
    layers: `
      <rect x="0" y="65%" width="100%" height="35%" fill="#1c1917" opacity="0.8"/>
      <polygon points="0,80 40,30 80,75 120,20 160,70 200,25 240,65 280,35 300,80" fill="#292524" opacity="0.7"/>
      <polygon points="0,85 50,40 100,80 150,30 200,75 250,35 300,85" fill="#44403c" opacity="0.5"/>
      <line x1="120" y1="20" x2="120" y2="80" stroke="#ef4444" stroke-width="0.5" opacity="0.3" stroke-dasharray="2,3"/>
      <line x1="200" y1="25" x2="200" y2="80" stroke="#ef4444" stroke-width="0.5" opacity="0.3" stroke-dasharray="2,3"/>
      <circle cx="120" cy="18" r="2" fill="#f87171" opacity="0.6"/>
      <circle cx="200" cy="23" r="2" fill="#f87171" opacity="0.6"/>
    `,
  },
  '营地': {
    bg: 'from-amber-950 via-yellow-900 to-amber-950',
    layers: `
      <rect x="0" y="60%" width="100%" height="40%" fill="#422006" opacity="0.6"/>
      <ellipse cx="150" cy="55" rx="80" ry="20" fill="#713f12" opacity="0.3"/>
      <polygon points="130,55 150,30 170,55" fill="none" stroke="#fbbf24" stroke-width="1.5" opacity="0.6"/>
      <polygon points="135,55 150,35 165,55" fill="#92400e" opacity="0.4"/>
      <circle cx="150" cy="52" r="3" fill="#f97316" opacity="0.7"/>
      <circle cx="150" cy="52" r="5" fill="#f97316" opacity="0.2"/>
      <circle cx="150" cy="52" r="8" fill="#f97316" opacity="0.1"/>
    `,
    particles: 'fire',
  },
  '庙宇': {
    bg: 'from-purple-950 via-violet-900 to-purple-950',
    layers: `
      <rect x="0" y="60%" width="100%" height="40%" fill="#2e1065" opacity="0.5"/>
      <rect x="130" y="35" width="40" height="25" rx="2" fill="#4c1d95" opacity="0.5"/>
      <polygon points="125,35 150,20 175,35" fill="#7c3aed" opacity="0.4"/>
      <rect x="145" y="45" width="10" height="15" rx="1" fill="#c084fc" opacity="0.3"/>
      <rect x="135" y="40" width="8" height="5" rx="1" fill="#fbbf24" opacity="0.3"/>
      <rect x="157" y="40" width="8" height="5" rx="1" fill="#fbbf24" opacity="0.3"/>
    `,
  },
  '村庄': {
    bg: 'from-violet-950 via-indigo-900 to-violet-950',
    layers: `
      <rect x="0" y="65%" width="100%" height="35%" fill="#1e1b4b" opacity="0.6"/>
      <rect x="40" y="45" width="25" height="20" rx="1" fill="#312e81" opacity="0.5"/>
      <polygon points="38,45 52,32 67,45" fill="#4338ca" opacity="0.4"/>
      <rect x="48" y="52" width="8" height="13" rx="1" fill="#fbbf24" opacity="0.2"/>
      <rect x="100" y="40" width="30" height="25" rx="1" fill="#312e81" opacity="0.5"/>
      <polygon points="98,40 115,25 132,40" fill="#4338ca" opacity="0.4"/>
      <rect x="108" y="50" width="10" height="15" rx="1" fill="#fbbf24" opacity="0.2"/>
      <rect x="180" y="48" width="20" height="17" rx="1" fill="#312e81" opacity="0.5"/>
      <polygon points="178,48 190,37 202,48" fill="#4338ca" opacity="0.4"/>
    `,
  },
  '湖泊': {
    bg: 'from-blue-950 via-cyan-900 to-blue-950',
    layers: `
      <rect x="0" y="50%" width="100%" height="50%" fill="#0c4a6e" opacity="0.4"/>
      <ellipse cx="150" cy="55" rx="100" ry="20" fill="#0ea5e9" opacity="0.15"/>
      <ellipse cx="150" cy="55" rx="80" ry="15" fill="#38bdf8" opacity="0.1"/>
      <path d="M50,55 Q75,48 100,55 Q125,62 150,55 Q175,48 200,55 Q225,62 250,55" fill="none" stroke="#7dd3fc" stroke-width="0.5" opacity="0.3"/>
      <path d="M60,58 Q85,52 110,58 Q135,64 160,58 Q185,52 210,58" fill="none" stroke="#7dd3fc" stroke-width="0.5" opacity="0.2"/>
    `,
  },
  '丛林': {
    bg: 'from-green-950 via-emerald-900 to-green-950',
    layers: `
      <rect x="0" y="45%" width="100%" height="55%" fill="#052e16" opacity="0.6"/>
      <rect x="20" y="30" width="4" height="35" fill="#166534" opacity="0.5"/>
      <ellipse cx="22" cy="25" rx="12" ry="10" fill="#15803d" opacity="0.4"/>
      <rect x="60" y="25" width="4" height="40" fill="#166534" opacity="0.5"/>
      <ellipse cx="62" cy="20" rx="14" ry="12" fill="#22c55e" opacity="0.3"/>
      <rect x="110" y="28" width="4" height="37" fill="#166534" opacity="0.5"/>
      <ellipse cx="112" cy="23" rx="11" ry="9" fill="#15803d" opacity="0.4"/>
      <rect x="160" y="32" width="4" height="33" fill="#166534" opacity="0.5"/>
      <ellipse cx="162" cy="27" rx="13" ry="11" fill="#22c55e" opacity="0.3"/>
      <rect x="210" y="26" width="4" height="39" fill="#166534" opacity="0.5"/>
      <ellipse cx="212" cy="21" rx="12" ry="10" fill="#15803d" opacity="0.4"/>
      <rect x="260" y="30" width="4" height="35" fill="#166534" opacity="0.5"/>
      <ellipse cx="262" cy="25" rx="14" ry="12" fill="#22c55e" opacity="0.3"/>
    `,
  },
}

export default function TerrainScene({ terrainType, weather }: { terrainType: string; weather: string }) {
  const config = terrainConfigs[terrainType] || terrainConfigs['石海']

  const weatherOverlay = useMemo(() => {
    switch (weather) {
      case '暴风雪': return <div className="absolute inset-0 bg-white/5 animate-pulse" />
      case '大雨': return <div className="absolute inset-0 bg-blue-500/5" />
      case '雾': return <div className="absolute inset-0 bg-gray-300/10" />
      case '多云': return <div className="absolute inset-0 bg-gray-500/5" />
      default: return null
    }
  }, [weather])

  return (
    <div className={`w-full h-24 sm:h-32 rounded-lg overflow-hidden relative bg-gradient-to-b ${config.bg} border border-mountain-700/30`}>
      <svg viewBox="0 0 300 80" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
          </linearGradient>
        </defs>
        <rect width="300" height="80" fill="url(#skyGrad)" />
        <g dangerouslySetInnerHTML={{ __html: config.layers }} />
      </svg>
      {weatherOverlay}
    </div>
  )
}
