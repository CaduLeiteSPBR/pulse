import { Hono } from 'hono'

const tasks = new Hono()

// GET /api/tasks
tasks.get('/', async (c) => {
  const userId = c.get('userId')
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM tasks WHERE user_id = ? ORDER BY criada_em DESC'
  ).bind(userId).all()
  return c.json({ tasks: results })
})

// POST /api/tasks
tasks.post('/', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json()

  const { titulo, tipo, categoria, importancia, esforco_horas, prazo } = body

  if (!titulo || !tipo || !importancia || !esforco_horas) {
    return c.json({ error: 'Campos obrigatórios: titulo, tipo, importancia, esforco_horas' }, 400)
  }

  const id = crypto.randomUUID()
  await c.env.DB.prepare(`
    INSERT INTO tasks (id, user_id, titulo, tipo, categoria, importancia, esforco_horas, prazo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, userId, titulo, tipo, categoria || null, importancia, esforco_horas, prazo || null).run()

  const task = await c.env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first()
  return c.json({ task }, 201)
})

// PATCH /api/tasks/:id
tasks.patch('/:id', async (c) => {
  const userId = c.get('userId')
  const taskId = c.req.param('id')
  const body = await c.req.json()

  // Ensure task belongs to user
  const existing = await c.env.DB.prepare(
    'SELECT id FROM tasks WHERE id = ? AND user_id = ?'
  ).bind(taskId, userId).first()
  if (!existing) return c.json({ error: 'Tarefa não encontrada' }, 404)

  const allowed = ['titulo', 'tipo', 'categoria', 'importancia', 'esforco_horas', 'prazo', 'concluida', 'concluida_em', 'justificativa_adiamento']
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))

  if (Object.keys(updates).length === 0) return c.json({ error: 'Nenhum campo para atualizar' }, 400)

  updates.atualizada_em = new Date().toISOString()

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ')
  const values = [...Object.values(updates), taskId]

  await c.env.DB.prepare(`UPDATE tasks SET ${setClauses} WHERE id = ?`).bind(...values).run()

  const task = await c.env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(taskId).first()
  return c.json({ task })
})

// DELETE /api/tasks/:id
tasks.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const taskId = c.req.param('id')

  const existing = await c.env.DB.prepare(
    'SELECT id FROM tasks WHERE id = ? AND user_id = ?'
  ).bind(taskId, userId).first()
  if (!existing) return c.json({ error: 'Tarefa não encontrada' }, 404)

  await c.env.DB.prepare('DELETE FROM tasks WHERE id = ?').bind(taskId).run()
  return c.json({ ok: true })
})

export default tasks
