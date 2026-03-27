import { format, isPast, differenceInDays, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, AlertCircle, Calendar } from 'lucide-react'
import { IMPORTANCIA_COLORS, IMPORTANCIA_LABELS } from '../../utils/priorityCalculator'
import clsx from 'clsx'

function TimelineItem({ task }) {
  const prazo = new Date(task.prazo)
  const atrasada = isPast(prazo)
  const diasRestantes = differenceInDays(startOfDay(prazo), startOfDay(new Date()))

  return (
    <div className={clsx(
      'flex gap-3 p-3 rounded-xl border transition-colors',
      atrasada
        ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20'
        : diasRestantes <= 1
          ? 'border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20'
          : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50'
    )}>
      <div className="flex-shrink-0 mt-0.5">
        {atrasada ? (
          <AlertCircle size={16} className="text-red-500" />
        ) : (
          <Clock size={16} className={diasRestantes <= 1 ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.titulo}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={clsx('text-xs px-1.5 py-0.5 rounded font-medium', IMPORTANCIA_COLORS[task.importancia])}>
            {IMPORTANCIA_LABELS[task.importancia]}
          </span>
          <span className={clsx(
            'text-xs font-medium',
            atrasada ? 'text-red-600 dark:text-red-400' :
              diasRestantes <= 1 ? 'text-orange-600 dark:text-orange-400' :
                'text-gray-500 dark:text-gray-400'
          )}>
            {atrasada
              ? `Atrasada ${Math.abs(diasRestantes)} dia(s)`
              : diasRestantes === 0
                ? 'Vence hoje!'
                : diasRestantes === 1
                  ? 'Vence amanhã'
                  : format(prazo, "dd 'de' MMM", { locale: ptBR })
            }
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{task.esforco_horas}h</span>
        </div>
      </div>
    </div>
  )
}

export default function Timeline({ tasks }) {
  const withDeadline = tasks
    .filter(t => !t.concluida && t.prazo)
    .sort((a, b) => new Date(a.prazo) - new Date(b.prazo))
    .slice(0, 8)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={18} className="text-pulse-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Linha do Tempo</h3>
        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">{withDeadline.length} com prazo</span>
      </div>

      <div className="space-y-2">
        {withDeadline.length > 0 ? (
          withDeadline.map(task => <TimelineItem key={task.id} task={task} />)
        ) : (
          <div className="text-center text-gray-400 dark:text-gray-600 text-sm py-8">
            Nenhuma tarefa com prazo definido
          </div>
        )}
      </div>
    </div>
  )
}
