import { Hono } from 'hono'

const calendar = new Hono()

async function getAccessToken(c, userId) {
  const user = await c.env.DB.prepare(
    'SELECT google_access_token, google_refresh_token, token_expires_at FROM users WHERE id = ?'
  ).bind(userId).first()

  if (!user) throw new Error('Usuário não encontrado')

  // Check if token is still valid (with 5 min buffer)
  if (user.token_expires_at && user.token_expires_at > Date.now() + 300000) {
    return user.google_access_token
  }

  // Refresh token
  if (!user.google_refresh_token) throw new Error('Refresh token não disponível')

  const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      refresh_token: user.google_refresh_token,
      grant_type: 'refresh_token',
    }),
  })

  if (!refreshRes.ok) throw new Error('Falha ao renovar token')

  const tokens = await refreshRes.json()
  const expiresAt = Date.now() + tokens.expires_in * 1000

  await c.env.DB.prepare(
    'UPDATE users SET google_access_token = ?, token_expires_at = ? WHERE id = ?'
  ).bind(tokens.access_token, expiresAt, userId).run()

  return tokens.access_token
}

// GET /api/calendar/free-time?date=YYYY-MM-DD
calendar.get('/free-time', async (c) => {
  const userId = c.get('userId')
  const date = c.req.query('date') || new Date().toISOString().split('T')[0]

  try {
    const accessToken = await getAccessToken(c, userId)

    const timeMin = `${date}T00:00:00Z`
    const timeMax = `${date}T23:59:59Z`

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/freebusy?` +
      new URLSearchParams({ timeMin, timeMax }),
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeMin,
          timeMax,
          items: [{ id: 'primary' }],
        }),
      }
    )

    const data = await res.json()
    const busySlots = data.calendars?.primary?.busy || []

    // Calculate free hours (8am to 8pm window)
    const workStart = new Date(`${date}T08:00:00Z`)
    const workEnd = new Date(`${date}T20:00:00Z`)
    const totalMinutes = (workEnd - workStart) / 60000

    let busyMinutes = 0
    for (const slot of busySlots) {
      const start = Math.max(new Date(slot.start), workStart)
      const end = Math.min(new Date(slot.end), workEnd)
      if (end > start) busyMinutes += (end - start) / 60000
    }

    const freeHours = Math.max(0, (totalMinutes - busyMinutes) / 60)

    return c.json({ date, freeHours, busySlots })
  } catch (err) {
    console.error('Calendar error:', err)
    return c.json({ date, freeHours: 4, busySlots: [], error: err.message })
  }
})

// POST /api/calendar/block — block time for a task
calendar.post('/block', async (c) => {
  const userId = c.get('userId')
  const { taskId, startTime, endTime, summary } = await c.req.json()

  try {
    const accessToken = await getAccessToken(c, userId)

    const event = {
      summary: `🎯 ${summary}`,
      description: `Tempo bloqueado pelo Pulse para: ${summary}`,
      start: { dateTime: startTime },
      end: { dateTime: endTime },
      colorId: '11', // Tomato
    }

    const res = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      return c.json({ error: 'Falha ao criar evento', details: err }, 500)
    }

    const createdEvent = await res.json()
    return c.json({ event: createdEvent })
  } catch (err) {
    return c.json({ error: err.message }, 500)
  }
})

export default calendar
