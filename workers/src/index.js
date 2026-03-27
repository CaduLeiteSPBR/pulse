import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import tasksRouter from './routes/tasks.js'
import authRouter from './routes/auth.js'
import calendarRouter from './routes/calendar.js'

const app = new Hono()

// CORS
app.use('/api/*', cors({
  origin: (origin, c) => {
    const allowedOrigins = [
      'https://pulse.inovacx.com',
      'http://localhost:5173',
      'http://localhost:4173',
    ]
    return allowedOrigins.includes(origin) ? origin : null
  },
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}))

// Auth middleware
app.use('/api/*', async (c, next) => {
  if (c.req.path.startsWith('/api/auth/')) {
    return next()
  }

  const sessionId = getCookie(c, 'pulse_session')
  if (!sessionId) {
    return c.json({ error: 'Não autenticado' }, 401)
  }

  const session = await c.env.SESSIONS.get(`session:${sessionId}`, { type: 'json' })
  if (!session) {
    return c.json({ error: 'Sessão inválida' }, 401)
  }

  c.set('userId', session.userId)
  c.set('userEmail', session.email)
  return next()
})

// Routes
app.route('/api/auth', authRouter)
app.route('/api/tasks', tasksRouter)
app.route('/api/calendar', calendarRouter)

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok', ts: Date.now() }))

export default app
