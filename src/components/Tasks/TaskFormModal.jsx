import { useState } from 'react'
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { useTasks } from '../../contexts/TaskContext'
import clsx from 'clsx'

const STEPS = ['titulo', 'tipo', 'categoria', 'importancia', 'esforco', 'prazo']

const STEP_LABELS = {
  titulo: 'Qual é a tarefa?',
  tipo: 'Que tipo de tarefa?',
  categoria: 'Qual categoria?',
  importancia: 'Qual a importância?',
  esforco: 'Quanto esforço vai exigir?',
  prazo: 'Tem prazo?',
}

const IMPORTANCIA_OPTIONS = [
  { value: 1, label: 'Baixa', desc: 'Pode esperar bastante', color: 'gray' },
  { value: 2, label: 'Média', desc: 'Importante mas não crítica', color: 'blue' },
  { value: 3, label: 'Alta', desc: 'Precisa atenção logo', color: 'orange' },
  { value: 4, label: 'Crítica', desc: 'Deve ser feita agora', color: 'red' },
]

const COLOR_MAP = {
  gray: 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700',
  blue: 'border-blue-300 bg-blue-50 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:hover:bg-blue-900/40',
  orange: 'border-orange-300 bg-orange-50 hover:bg-orange-100 dark:border-orange-700 dark:bg-orange-900/20 dark:hover:bg-orange-900/40',
  red: 'border-red-300 bg-red-50 hover:bg-red-100 dark:border-red-700 dark:bg-red-900/20 dark:hover:bg-red-900/40',
}

const COLOR_SELECTED = {
  gray: 'border-gray-500 bg-gray-100 ring-2 ring-gray-400 dark:border-gray-400 dark:bg-gray-700',
  blue: 'border-blue-500 bg-blue-100 ring-2 ring-blue-400 dark:border-blue-400 dark:bg-blue-900/50',
  orange: 'border-orange-500 bg-orange-100 ring-2 ring-orange-400 dark:border-orange-400 dark:bg-orange-900/50',
  red: 'border-red-500 bg-red-100 ring-2 ring-red-400 dark:border-red-400 dark:bg-red-900/50',
}

export default function TaskFormModal({ onClose }) {
  const { createTask } = useTasks()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    titulo: '',
    tipo: '',
    categoria: '',
    importancia: null,
    esforco_horas: '',
    prazo: '',
  })

  const currentStep = STEPS[step]
  const isLast = step === STEPS.length - 1

  const canAdvance = () => {
    switch (currentStep) {
      case 'titulo': return form.titulo.trim().length > 0
      case 'tipo': return form.tipo !== ''
      case 'categoria': return form.categoria.trim().length > 0
      case 'importancia': return form.importancia !== null
      case 'esforco': return form.esforco_horas !== '' && Number(form.esforco_horas) > 0
      case 'prazo': return true // prazo é opcional
      default: return false
    }
  }

  const advance = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1)
  }

  const back = () => {
    if (step > 0) setStep(s => s - 1)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && canAdvance() && !isLast) advance()
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await createTask({
        titulo: form.titulo.trim(),
        tipo: form.tipo,
        categoria: form.categoria.trim(),
        importancia: form.importancia,
        esforco_horas: Number(form.esforco_horas),
        prazo: form.prazo || null,
      })
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
              Passo {step + 1} de {STEPS.length}
            </p>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-0.5">
              {STEP_LABELS[currentStep]}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100 dark:bg-gray-800">
          <div
            className="h-full bg-pulse-500 transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Step content */}
        <div className="px-6 py-6 min-h-[200px] flex items-center">
          <div className="w-full">

            {currentStep === 'titulo' && (
              <input
                autoFocus
                type="text"
                value={form.titulo}
                onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                onKeyDown={handleKeyDown}
                placeholder="Ex: Revisar proposta comercial..."
                className="w-full px-4 py-3 text-lg border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              />
            )}

            {currentStep === 'tipo' && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'trabalho', label: '💼 Trabalho' },
                  { value: 'pessoal', label: '🏠 Pessoal' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setForm(f => ({ ...f, tipo: opt.value })); setTimeout(advance, 150) }}
                    className={clsx(
                      'p-4 rounded-xl border-2 text-center font-medium text-gray-800 dark:text-gray-200 transition-all',
                      form.tipo === opt.value
                        ? 'border-pulse-500 bg-pulse-50 dark:bg-pulse-950/30 ring-2 ring-pulse-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-pulse-300 dark:hover:border-pulse-700 bg-gray-50 dark:bg-gray-800'
                    )}
                  >
                    <span className="text-2xl block mb-1">{opt.value === 'trabalho' ? '💼' : '🏠'}</span>
                    {opt.value === 'trabalho' ? 'Trabalho' : 'Pessoal'}
                  </button>
                ))}
              </div>
            )}

            {currentStep === 'categoria' && (
              <div className="space-y-3">
                <input
                  autoFocus
                  type="text"
                  value={form.categoria}
                  onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                  onKeyDown={handleKeyDown}
                  placeholder="Ex: Finanças, Saúde, Relatórios..."
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pulse-500"
                />
                <p className="text-sm text-gray-400 dark:text-gray-500">Digite uma categoria livre para organizar suas tarefas</p>
              </div>
            )}

            {currentStep === 'importancia' && (
              <div className="space-y-2">
                {IMPORTANCIA_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setForm(f => ({ ...f, importancia: opt.value })); setTimeout(advance, 150) }}
                    className={clsx(
                      'w-full flex items-center gap-4 p-3.5 rounded-xl border-2 text-left transition-all',
                      form.importancia === opt.value ? COLOR_SELECTED[opt.color] : COLOR_MAP[opt.color]
                    )}
                  >
                    <span className="w-8 h-8 rounded-lg bg-white dark:bg-gray-900/50 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300 text-sm shadow-sm">
                      {opt.value}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{opt.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentStep === 'esforco' && (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    autoFocus
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={form.esforco_horas}
                    onChange={e => setForm(f => ({ ...f, esforco_horas: e.target.value }))}
                    onKeyDown={handleKeyDown}
                    placeholder="0"
                    className="w-full px-4 py-3 pr-16 text-lg border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pulse-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">horas</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[0.5, 1, 2, 4, 8].map(h => (
                    <button
                      key={h}
                      onClick={() => setForm(f => ({ ...f, esforco_horas: String(h) }))}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                        String(form.esforco_horas) === String(h)
                          ? 'border-pulse-500 bg-pulse-50 dark:bg-pulse-950/30 text-pulse-600 dark:text-pulse-400'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-pulse-300'
                      )}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 'prazo' && (
              <div className="space-y-4">
                <input
                  autoFocus
                  type="datetime-local"
                  value={form.prazo}
                  onChange={e => setForm(f => ({ ...f, prazo: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pulse-500 [color-scheme:light] dark:[color-scheme:dark]"
                />
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Opcional. Sem prazo, a urgência aumenta com o tempo.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 0}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
            Voltar
          </button>

          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-pulse-500 hover:bg-pulse-600 disabled:opacity-60 text-white rounded-xl font-medium text-sm transition-colors"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check size={16} />
              )}
              {saving ? 'Salvando...' : 'Criar Tarefa'}
            </button>
          ) : (
            <button
              onClick={advance}
              disabled={!canAdvance()}
              className="flex items-center gap-1 px-5 py-2.5 bg-pulse-500 hover:bg-pulse-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm transition-colors"
            >
              Próximo
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
