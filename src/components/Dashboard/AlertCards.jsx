import { AlertTriangle, Flame, Timer, Lightbulb } from 'lucide-react'
import { isPast, differenceInHours, differenceInDays } from 'date-fns'
import clsx from 'clsx'

function AlertCard({ icon: Icon, title, count, tasks, color, emptyMsg }) {
  return (
    <div className={clsx(
      'rounded-2xl border p-4',
      color === 'red' && 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20',
      color === 'orange' && 'border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20',
      color === 'blue' && 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20',
      color === 'purple' && 'border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/20',
    )}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={18} className={clsx(
          color === 'red' && 'text-red-500',
          color === 'orange' && 'text-orange-500',
          color === 'blue' && 'text-blue-500',
          color === 'purple' && 'text-purple-500',
        )} />
        <h4 className={clsx(
          'font-semibold text-sm',
          color === 'red' && 'text-red-700 dark:text-red-400',
          color === 'orange' && 'text-orange-700 dark:text-orange-400',
          color === 'blue' && 'text-blue-700 dark:text-blue-400',
          color === 'purple' && 'text-purple-700 dark:text-purple-400',
        )}>
          {title}
          {count > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-white/60 dark:bg-black/20">
              {count}
            </span>
          )}
        </h4>
      </div>
      <div className="space-y-1.5">
        {tasks.length > 0 ? tasks.slice(0, 3).map(t => (
          <p key={t.id} className="text-xs text-gray-600 dark:text-gray-400 truncate">
            • {t.titulo}
          </p>
        )) : (
          <p className="text-xs text-gray-400 dark:text-gray-500">{emptyMsg}</p>
        )}
        {tasks.length > 3 && (
          <p className="text-xs text-gray-400 dark:text-gray-500">+{tasks.length - 3} mais...</p>
        )}
      </div>
    </div>
  )
}

export default function AlertCards({ tasks }) {
  const active = tasks.filter(t => !t.concluida)

  const atrasadas = active.filter(t => t.prazo && isPast(new Date(t.prazo)))

  const emRisco = active.filter(t => {
    if (!t.prazo || isPast(new Date(t.prazo))) return false
    return differenceInHours(new Date(t.prazo), new Date()) < 48
  })

  const envelhecendo = active.filter(t => {
    if (t.prazo) return false
    const dias = differenceInDays(new Date(), new Date(t.criada_em))
    return dias >= 14
  })

  // Próxima tarefa sugerida: maior score entre não atrasadas
  const proxima = active
    .filter(t => !atrasadas.includes(t))
    .sort((a, b) => (b.score || 0) - (a.score || 0))[0]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <AlertCard
        icon={AlertTriangle}
        title="Atrasadas"
        count={atrasadas.length}
        tasks={atrasadas}
        color="red"
        emptyMsg="Nenhuma tarefa atrasada"
      />
      <AlertCard
        icon={Flame}
        title="Em Risco"
        count={emRisco.length}
        tasks={emRisco}
        color="orange"
        emptyMsg="Nenhuma em risco imediato"
      />
      <AlertCard
        icon={Timer}
        title="Envelhecendo"
        count={envelhecendo.length}
        tasks={envelhecendo}
        color="blue"
        emptyMsg="Sem tarefas esquecidas"
      />
      <AlertCard
        icon={Lightbulb}
        title="Próxima Sugerida"
        count={proxima ? 1 : 0}
        tasks={proxima ? [proxima] : []}
        color="purple"
        emptyMsg="Nenhuma sugestão disponível"
      />
    </div>
  )
}
