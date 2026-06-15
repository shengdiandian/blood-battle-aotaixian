import { useSnapshot } from 'valtio'
import { gameState } from '../store/gameStore'
import { ScrollText } from 'lucide-react'

export default function EventLog() {
  const state = useSnapshot(gameState)

  const typeStyle: Record<string, string> = {
    danger: 'text-danger-400 border-danger-500/30',
    warning: 'text-warning-400 border-warning-500/30',
    success: 'text-success-400 border-success-500/30',
    narrative: 'text-ice-400 border-ice-500/30',
    info: 'text-mountain-300 border-mountain-600/30',
    memorial: 'text-purple-400 border-purple-500/30',
  }

  return (
    <div className="bg-mountain-800 rounded-lg border border-mountain-700 h-full flex flex-col">
      <div className="p-3 border-b border-mountain-700 flex items-center gap-2">
        <ScrollText size={14} className="text-mountain-300" />
        <h3 className="text-xs font-bold text-mountain-300">事件日志</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {state.log.length === 0 ? (
          <p className="text-xs text-mountain-500 text-center py-4">暂无事件记录</p>
        ) : (
          state.log.map(entry => (
            <div
              key={entry.id}
              className={`text-xs py-1 px-2 rounded border-l-2 ${typeStyle[entry.type]}`}
            >
              {entry.message}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
