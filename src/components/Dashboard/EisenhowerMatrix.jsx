import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { QUADRANTE_CONFIG } from '../../utils/priorityCalculator'
import clsx from 'clsx'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const task = payload[0]?.payload
  if (!task) return null

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3 max-w-xs">
      <p className="font-medium text-gray-900 dark:text-white text-sm mb-1">{task.titulo}</p>
      <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span>Urgência: {Math.round(task.urgencia * 100)}%</span>
        <span>Importância: {task.importancia}/4</span>
        <span>Esforço: {task.esforco_horas}h</span>
      </div>
      {task.quadrante && (
        <span className={clsx(
          'inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
          QUADRANTE_CONFIG[task.quadrante]?.text,
          QUADRANTE_CONFIG[task.quadrante]?.bg,
        )}>
          {QUADRANTE_CONFIG[task.quadrante]?.label}
        </span>
      )}
    </div>
  )
}

function getPointColor(task) {
  const cfg = QUADRANTE_CONFIG[task.quadrante]
  return cfg?.color || '#6b7280'
}

function getPointSize(esforcoHoras) {
  // Mínimo 40, máximo 400 de área (radius 3 a 11)
  const r = Math.max(5, Math.min(14, 5 + esforcoHoras))
  return r * r * Math.PI
}

export default function EisenhowerMatrix({ tasks }) {
  const data = tasks
    .filter(t => !t.concluida)
    .map(t => ({
      ...t,
      x: Math.round(t.urgencia * 100),
      y: Math.round((t.importancia / 4) * 100),
    }))

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Matriz Eisenhower</h3>
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span>● Tamanho = esforço</span>
        </div>
      </div>

      {/* Quadrant legend */}
      <div className="grid grid-cols-2 gap-1.5 mb-4">
        {Object.entries(QUADRANTE_CONFIG).map(([key, cfg]) => (
          <div key={key} className={clsx('flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium', cfg.bg, cfg.text)}>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
            {cfg.label}
          </div>
        ))}
      </div>

      <div className="relative">
        {/* Axis labels */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-xs text-gray-400 dark:text-gray-500">Importância ↑</div>
        <div className="absolute -right-1 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 rotate-90">Urgência →</div>

        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis
              type="number"
              dataKey="x"
              domain={[0, 100]}
              tick={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
              label={{ value: 'Urgência →', position: 'insideBottom', offset: -5, style: { fill: '#9ca3af', fontSize: 11 } }}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[0, 100]}
              tick={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
              label={{ value: 'Importância', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: 11 } }}
            />
            <ReferenceLine x={50} stroke="#e5e7eb" strokeDasharray="4 4" />
            <ReferenceLine y={50} stroke="#e5e7eb" strokeDasharray="4 4" />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={data} shape="circle">
              {data.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={getPointColor(entry)}
                  fillOpacity={0.8}
                  r={Math.max(5, Math.min(14, 5 + (entry.esforco_horas || 1)))}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {data.length === 0 && (
        <div className="text-center text-gray-400 dark:text-gray-600 text-sm py-8">
          Nenhuma tarefa ativa
        </div>
      )}
    </div>
  )
}
