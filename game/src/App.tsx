import StatusPanel from './components/StatusPanel'
import GamePanel from './components/GamePanel'
import GameMap from './components/GameMap'
import EventLog from './components/EventLog'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航 */}
      <header className="h-12 bg-mountain-800 border-b border-mountain-700 flex items-center px-4">
        <h1 className="text-sm font-bold text-mountain-100">🏔️ 血战鳌太线</h1>
        <span className="ml-3 text-xs text-mountain-400">鳌太线生存冒险 — 基于真实事故数据</span>
      </header>

      {/* 主体三栏布局 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧状态面板 */}
        <div className="w-56 shrink-0 p-2 overflow-y-auto">
          <StatusPanel />
        </div>

        {/* 中间主游戏区 */}
        <div className="flex-1 p-2 flex flex-col gap-2 min-w-0">
          <div className="flex-1 min-h-0">
            <GamePanel />
          </div>
          <div className="h-40 shrink-0">
            <EventLog />
          </div>
        </div>

        {/* 右侧地图 */}
        <div className="w-72 shrink-0 p-2">
          <GameMap />
        </div>
      </div>
    </div>
  )
}

export default App
