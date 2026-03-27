import { useTasks } from '../contexts/TaskContext'
import EisenhowerMatrix from '../components/Dashboard/EisenhowerMatrix'
import Timeline from '../components/Dashboard/Timeline'
import AlertCards from '../components/Dashboard/AlertCards'
import { LayoutDashboard, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { activeTasks, completedTasks, loading } = useTasks()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-pulse-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const atrasadas = activeTasks.filter(t => t.prazo && new Date(t.prazo) < new Date()).length
  const mediaUrgencia = activeTasks.length
    ? Math.round((activeTasks.reduce((s, t) => s + (t.urgencia || 0), 0) / activeTasks.length) * 100)
    : 0

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <LayoutDashboard size={22} className="text-pulse-500" />
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Visão geral das suas pendências</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={LayoutDashboard} label="Ativas" value={activeTasks.length} color="bg-pulse-500" />
        <StatCard icon={CheckCircle2} label="Concluídas" value={completedTasks.length} color="bg-green-500" />
        <StatCard icon={AlertTriangle} label="Atrasadas" value={atrasadas} color="bg-red-500" />
        <StatCard icon={Clock} label="Urgência Média" value={`${mediaUrgencia}%`} color="bg-amber-500" />
      </div>

      {/* Alert cards */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Alertas</h2>
        <AlertCards tasks={activeTasks} />
      </div>

      {/* Matrix + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EisenhowerMatrix tasks={activeTasks} />
        <Timeline tasks={activeTasks} />
      </div>
    </div>
  )
}
