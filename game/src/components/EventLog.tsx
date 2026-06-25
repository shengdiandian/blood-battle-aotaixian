import { useSnapshot } from 'valtio'
import { useEffect, useRef } from 'react'
import { gameState } from '../store/gameStore'
import { ScrollText } from 'lucide-react'

const typeStyle: Record<string, { border: string; text: string; dot: string }> = {
  danger:   { border: 'border-red-500/40',     text: 'text-red-400',     dot: 'bg-red-500' },
  warning:  { border: 'border-amber-500/40',   text: 'text-amber-400',   dot: 'bg-amber-500' },
  success:  { border: 'border-emerald-500/40', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  narrative:{ border: 'border-cyan-500/40',    text: 'text-cyan-400',    dot: 'bg-cyan-500' },
  info:     { border: 'border-mountain-500/40',text: 'text-mountain-400',dot: 'bg-mountain-500' },
  memorial: { border: 'border-purple-500/40',  text: 'text-purple-400',  dot: 'bg-purple-500' },
}

export default function EventLog() {
  const state = useSnapshot(gameState)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [state.log.length])

  return (
    <div className="bg-mountain-800/80 backdrop-blur rounded-lg border border-mountain-700/60 h-full flex flex-col card-atmosphere">
      <div className="p-3 border-b border-mountain-700/50 flex items-center gap-2">
        <ScrollText size={13} className="text-mountain-400" />
        <h3 className="text-xs font-bold text-mountain-400 tracking-wider uppercase">事件日志</h3>
        <span className="text-xs text-mountain-600 ml-auto">{state.log.length} 条记录</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {state.log.length === 0 ? (
          <p className="text-xs text-mountain-600 text-center py-6">暂无事件记录</p>
        ) : (
          state.log.map(entry => {
            const style = typeStyle[entry.type] || typeStyle.info
            return (
              <div
                key={entry.id}
                className={`text-xs py-1.5 px-2.5 rounded-r border-l-2 ${style.border} ${style.text} bg-mountain-800/30`}
              >
                <div className="flex items-start gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${style.dot}`} />
                  <span className="leading-relaxed">{entry.message}</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
