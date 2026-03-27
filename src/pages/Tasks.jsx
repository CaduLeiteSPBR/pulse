import { useState } from 'react'
import { useTasks } from '../contexts/TaskContext'
import TaskCard from '../components/Tasks/TaskCard'
import TaskFormModal from '../components/Tasks/TaskFormModal'
import { ListTodo, Search, Filter, CheckCircle2, Undo2 } from 'lucide-react'
import clsx from 'clsx'

const FILTERS = [
  { value: 'todas', label: 'Todas' },
  { value: 'trabalho', label: 'Trabalho' },
  { value: 'pessoal', label: 'Pessoal' },
  { value: 'atrasadas', label: 'Atrasadas' },
]

const SORTS = [
  { value: 'score', label: 'Prioridade' },
  { value: 'prazo', label: 'Prazo' },
  { value: 'importancia', label: 'Importância' },
  { value: 'criada_em', label: 'Mais recentes' },
]

export default function Tasks() {
  const { activeTasks, completedTasks, loading, uncompleteTask } = useTasks()
  const [filter, setFilter] = useState('todas')
  const [sort, setSort] = useState('score')
  const [search, setSearch] = useState('')
  const [showCompleted, setShowCompleted] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const filtered = activeTasks
    .filter(t => {
      if (filter === 'trabalho') return t.tipo === 'trabalho'
      if (filter === 'pessoal') return t.tipo === 'pessoal'
      if (filter === 'atrasadas') return t.prazo && new Date(t.prazo) < new Date()
      return true
    })
    .filter(t => !search || t.titulo.toLowerCase().includes(search.toLowerCase()) || t.categoria?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'score') return (b.score || 0) - (a.score || 0)
      if (sort === 'prazo') {
        if (!a.prazo && !b.prazo) return 0
        if (!a.prazo) return 1
        if (!b.prazo) return -1
        return new Date(a.prazo) - new Date(b.prazo)
      }
      if (sort === 'importancia') return b.importancia - a.importancia
      if (sort === 'criada_em') return new Date(b.criada_em) - new Date(a.criada_em)
      return 0
    })

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <ListTodo size={22} className="text-pulse-500" />
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tarefas</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{activeTasks.length} pendências ativas</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar tarefas..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pulse-500 text-sm"
        />
      </div>

      {/* Filters + Sort */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                filter === f.value
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Filter size={14} className="text-gray-400" />
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-pulse-500"
          >
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-pulse-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.length > 0 ? (
            filtered.map(task => (
              <TaskCard key={task.id} task={task} onEdit={setEditingTask} />
            ))
          ) : (
            <div className="text-center py-12 text-gray-400 dark:text-gray-600">
              <ListTodo size={40} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">Nenhuma tarefa encontrada</p>
              <p className="text-sm mt-1">Tente ajustar os filtros ou adicione uma nova tarefa</p>
            </div>
          )}
        </div>
      )}

      {/* Completed tasks toggle */}
      {completedTasks.length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted(s => !s)}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <CheckCircle2 size={16} />
            {showCompleted ? 'Ocultar' : 'Mostrar'} concluídas ({completedTasks.length})
          </button>

          {showCompleted && (
            <div className="mt-3 space-y-2">
              {completedTasks.map(task => (
                <div key={task.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 flex items-center gap-3 opacity-60 hover:opacity-80 transition-opacity">
                  <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 line-through flex-1">{task.titulo}</span>
                  <button
                    onClick={() => uncompleteTask(task.id)}
                    title="Desfazer conclusão"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors flex-shrink-0"
                  >
                    <Undo2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {editingTask && (
        <TaskFormModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  )
}
