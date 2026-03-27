import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { calcularPrioridade } from '../utils/priorityCalculator'

const TaskContext = createContext()

// Mock data for development
const MOCK_TASKS = [
  {
    id: '1',
    titulo: 'Revisar relatório trimestral',
    tipo: 'trabalho',
    categoria: 'Relatórios',
    importancia: 4,
    esforco_horas: 3,
    prazo: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    concluida: false,
    criada_em: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    urgencia: 0.8,
    score: 3.2,
  },
  {
    id: '2',
    titulo: 'Pagar fatura do cartão',
    tipo: 'pessoal',
    categoria: 'Finanças',
    importancia: 3,
    esforco_horas: 0.5,
    prazo: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    concluida: false,
    criada_em: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    urgencia: 0.95,
    score: 2.85,
  },
  {
    id: '3',
    titulo: 'Estudar TypeScript avançado',
    tipo: 'pessoal',
    categoria: 'Estudos',
    importancia: 2,
    esforco_horas: 8,
    prazo: null,
    concluida: false,
    criada_em: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    urgencia: 0.3,
    score: 0.6,
  },
  {
    id: '4',
    titulo: 'Reunião com cliente ABC',
    tipo: 'trabalho',
    categoria: 'Reuniões',
    importancia: 4,
    esforco_horas: 1,
    prazo: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    concluida: false,
    criada_em: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    urgencia: 0.7,
    score: 2.8,
  },
  {
    id: '5',
    titulo: 'Atualizar documentação da API',
    tipo: 'trabalho',
    categoria: 'Documentação',
    importancia: 2,
    esforco_horas: 4,
    prazo: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    concluida: false,
    criada_em: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    urgencia: 1.0,
    score: 2.0,
  },
  {
    id: '6',
    titulo: 'Consulta médica de rotina',
    tipo: 'pessoal',
    categoria: 'Saúde',
    importancia: 3,
    esforco_horas: 2,
    prazo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    concluida: false,
    criada_em: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    urgencia: 0.4,
    score: 1.2,
  },
]

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [freeHours, setFreeHours] = useState(4) // default free hours per day

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks')
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks.map(t => ({
          ...t,
          ...calcularPrioridade(t, freeHours),
        })))
      } else {
        if (import.meta.env.DEV) {
          setTasks(MOCK_TASKS)
        }
      }
    } catch {
      if (import.meta.env.DEV) {
        setTasks(MOCK_TASKS)
      }
    } finally {
      setLoading(false)
    }
  }, [freeHours])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const createTask = async (taskData) => {
    // Atualização otimista: aparece imediatamente no gráfico
    const tempId = `temp_${Date.now()}`
    const tempTask = {
      id: tempId,
      ...taskData,
      concluida: false,
      criada_em: new Date().toISOString(),
      ...calcularPrioridade(taskData, freeHours),
    }
    setTasks(prev => [tempTask, ...prev])

    if (import.meta.env.DEV) return tempTask

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      })
      if (!res.ok) {
        setTasks(prev => prev.filter(t => t.id !== tempId))
        throw new Error('Erro ao criar tarefa')
      }
      const data = await res.json()
      // Substitui o temp pela tarefa real com ID do servidor
      setTasks(prev => prev.map(t =>
        t.id === tempId
          ? { ...data.task, ...calcularPrioridade(data.task, freeHours) }
          : t
      ))
      return data.task
    } catch (err) {
      setTasks(prev => prev.filter(t => t.id !== tempId))
      throw err
    }
  }

  const updateTask = async (id, updates) => {
    if (import.meta.env.DEV) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
      return
    }
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    await fetchTasks()
  }

  const deleteTask = async (id) => {
    if (import.meta.env.DEV) {
      setTasks(prev => prev.filter(t => t.id !== id))
      return
    }
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const completeTask = async (id) => {
    await updateTask(id, { concluida: true, concluida_em: new Date().toISOString() })
  }

  const postponeTask = async (id, novoPrazo, justificativa) => {
    await updateTask(id, { prazo: novoPrazo, justificativa_adiamento: justificativa })
  }

  const activeTasks = tasks.filter(t => !t.concluida)
  const completedTasks = tasks.filter(t => t.concluida)

  return (
    <TaskContext.Provider value={{
      tasks,
      activeTasks,
      completedTasks,
      loading,
      freeHours,
      fetchTasks,
      createTask,
      updateTask,
      deleteTask,
      completeTask,
      postponeTask,
    }}>
      {children}
    </TaskContext.Provider>
  )
}

export const useTasks = () => useContext(TaskContext)
