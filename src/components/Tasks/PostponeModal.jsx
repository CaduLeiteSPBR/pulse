import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { useTasks } from '../../contexts/TaskContext'

export default function PostponeModal({ task, onClose }) {
  const { postponeTask } = useTasks()
  const [novoPrazo, setNovoPrazo] = useState('')
  const [justificativa, setJustificativa] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!novoPrazo) return
    setSaving(true)
    try {
      await postponeTask(task.id, novoPrazo, justificativa)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <ChevronDown size={18} className="text-blue-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Adiar Tarefa</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 font-medium truncate">
              "{task.titulo}"
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Novo prazo *</label>
            <input
              type="datetime-local"
              value={novoPrazo}
              onChange={e => setNovoPrazo(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pulse-500 [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Justificativa (opcional)</label>
            <textarea
              value={justificativa}
              onChange={e => setJustificativa(e.target.value)}
              placeholder="Por que está adiando?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pulse-500 placeholder-gray-400"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!novoPrazo || saving}
              className="flex-1 px-4 py-2 bg-pulse-500 hover:bg-pulse-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? 'Salvando...' : 'Adiar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
