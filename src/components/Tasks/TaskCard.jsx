import { useState } from 'react'
import { Check, Pencil, Trash2, Clock, ChevronDown } from 'lucide-react'
import { format, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useTasks } from '../../contexts/TaskContext'
import { IMPORTANCIA_COLORS, IMPORTANCIA_LABELS, QUADRANTE_CONFIG } from '../../utils/priorityCalculator'
import PostponeModal from './PostponeModal'
import clsx from 'clsx'

export default function TaskCard({ task, onEdit }) {
  const { completeTask, deleteTask } = useTasks()
  const [showPostpone, setShowPostpone] = useState(false)
  const [completing, setCompleting] = useState(false)

  const atrasada = task.prazo && isPast(new Date(task.prazo))
  const quadranteCfg = QUADRANTE_CONFIG[task.quadrante] || {}

  const handleComplete = async () => {
    setCompleting(true)
    await completeTask(task.id)
  }

  return (
    <>
      <div className={clsx(
        'group relative bg-white dark:bg-gray-900 rounded-xl border transition-all hover:shadow-md',
        atrasada
          ? 'border-red-200 dark:border-red-900'
          : 'border-gray-200 dark:border-gray-800',
        completing && 'opacity-50 pointer-events-none'
      )}>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <button
              onClick={handleComplete}
              className={clsx(
                'mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors',
                'border-gray-300 dark:border-gray-600 hover:border-pulse-500 hover:bg-pulse-50 dark:hover:bg-pulse-950/30'
              )}
            >
              {completing && <Check size={11} className="text-pulse-500" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white text-sm leading-snug">{task.titulo}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={clsx('text-xs px-1.5 py-0.5 rounded font-medium', IMPORTANCIA_COLORS[task.importancia])}>
                  {IMPORTANCIA_LABELS[task.importancia]}
                </span>
                {task.quadrante && (
                  <span className={clsx('text-xs px-1.5 py-0.5 rounded font-medium', quadranteCfg.bg, quadranteCfg.text)}>
                    {quadranteCfg.label}
                  </span>
                )}
                <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">{task.tipo}</span>
                {task.categoria && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">· {task.categoria}</span>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {task.esforco_horas}h
              </span>
              {task.prazo && (
                <span className={clsx(atrasada ? 'text-red-500 font-medium' : '')}>
                  {atrasada ? 'Atrasada: ' : ''}
                  {format(new Date(task.prazo), "dd/MM", { locale: ptBR })}
                </span>
              )}
              {task.urgencia !== undefined && (
                <span>Urgência: {Math.round(task.urgencia * 100)}%</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setShowPostpone(true)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                title="Adiar"
              >
                <ChevronDown size={14} />
              </button>
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-pulse-500 hover:bg-pulse-50 dark:hover:bg-pulse-950/30 transition-colors"
                title="Editar"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Excluir"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPostpone && (
        <PostponeModal task={task} onClose={() => setShowPostpone(false)} />
      )}
    </>
  )
}
