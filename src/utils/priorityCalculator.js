import { differenceInHours, isPast } from 'date-fns'

/**
 * Calcula urgência de uma tarefa
 * Com prazo: urgencia = esforco_horas / horas_livres_disponiveis
 * Sem prazo: aumenta com o tempo parado (logarítmico)
 */
export function calcularUrgencia(task, horasLivresPorDia = 4) {
  if (task.prazo) {
    const agora = new Date()
    const prazo = new Date(task.prazo)

    if (isPast(prazo)) return 1.0 // atrasada = urgência máxima

    const horasAteoPrazo = differenceInHours(prazo, agora)
    const horasLivresDisponiveis = (horasAteoPrazo / 24) * horasLivresPorDia

    if (horasLivresDisponiveis <= 0) return 1.0

    const ratio = task.esforco_horas / horasLivresDisponiveis
    return Math.min(1.0, ratio)
  } else {
    // Sem prazo: urgência aumenta com tempo parado
    const criada = new Date(task.criada_em || Date.now())
    const diasParado = differenceInHours(new Date(), criada) / 24
    // Escala logarítmica: 0 dias = 0, 30 dias ≈ 0.5, 90 dias ≈ 0.8
    const urgencia = Math.log(1 + diasParado / 15) / Math.log(1 + 90 / 15)
    return Math.min(0.85, urgencia) // sem prazo nunca chega a 1.0
  }
}

/**
 * Score de prioridade: urgência × importância
 * Desempate: menor esforço primeiro
 */
export function calcularScore(urgencia, importancia, esforcoHoras) {
  const score = urgencia * importancia
  // Desempate embutido: pequena penalidade pelo esforço
  return score - (esforcoHoras * 0.001)
}

/**
 * Quadrante da Matriz Eisenhower
 * Importância: 3-4 = importante, 1-2 = não importante
 * Urgência: > 0.5 = urgente, <= 0.5 = não urgente
 */
export function calcularQuadrante(urgencia, importancia) {
  const eImportante = importancia >= 3
  const eUrgente = urgencia > 0.5

  if (eImportante && eUrgente) return 'fazer-agora'
  if (eImportante && !eUrgente) return 'agendar'
  if (!eImportante && eUrgente) return 'delegar'
  return 'eliminar'
}

export function calcularPrioridade(task, horasLivresPorDia = 4) {
  const urgencia = calcularUrgencia(task, horasLivresPorDia)
  const score = calcularScore(urgencia, task.importancia, task.esforco_horas)
  const quadrante = calcularQuadrante(urgencia, task.importancia)
  return { urgencia, score, quadrante }
}

export function classificarStatus(task) {
  if (!task.prazo) return 'sem-prazo'
  const prazo = new Date(task.prazo)
  if (isPast(prazo)) return 'atrasada'
  const horasRestantes = differenceInHours(prazo, new Date())
  if (horasRestantes < 24) return 'em-risco'
  if (horasRestantes < 72) return 'proxima'
  return 'normal'
}

export const IMPORTANCIA_LABELS = {
  1: 'Baixa',
  2: 'Média',
  3: 'Alta',
  4: 'Crítica',
}

export const IMPORTANCIA_COLORS = {
  1: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  2: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  3: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  4: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export const QUADRANTE_CONFIG = {
  'fazer-agora': {
    label: 'Fazer Agora',
    color: '#ef4444',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-400',
  },
  'agendar': {
    label: 'Agendar',
    color: '#f59e0b',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-400',
  },
  'delegar': {
    label: 'Delegar',
    color: '#3b82f6',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-400',
  },
  'eliminar': {
    label: 'Eliminar',
    color: '#6b7280',
    bg: 'bg-gray-50 dark:bg-gray-900/50',
    border: 'border-gray-200 dark:border-gray-700',
    text: 'text-gray-600 dark:text-gray-400',
  },
}
