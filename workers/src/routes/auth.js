import { Hono } from 'hono'
import { setCookie, deleteCookie, getCookie } from 'hono/cookie'

const auth = new Hono()

// GET /api/auth/google — redirect to Google OAuth
auth.get('/google', (c) => {
  const clientId = c.env.GOOGLE_CLIENT_ID
  const redirectUri = `${c.env.APP_URL}/api/auth/callback`
  const scope = [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
  ].join(' ')

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
    access_type: 'offline',
    prompt: 'consent',
  })

  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
})

// GET /api/auth/callback — handle OAuth callback
auth.get('/callback', async (c) => {
  const code = c.req.query('code')
  if (!code) return c.json({ error: 'Código ausente' }, 400)

  const redirectUri = `${c.env.APP_URL}/api/auth/callback`

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    const err = await tokenRes.text()
    console.error('Token exchange failed:', err)
    return c.redirect(`${c.env.APP_URL}/login?error=auth_failed`)
  }

  const tokens = await tokenRes.json()

  // Get user info
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const userInfo = await userRes.json()

  // Upsert user in DB
  const userId = `u_${userInfo.id}`
  await c.env.DB.prepare(`
    INSERT INTO users (id, google_id, email, name, picture, google_access_token, google_refresh_token, token_expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(google_id) DO UPDATE SET
      name = excluded.name,
      picture = excluded.picture,
      google_access_token = excluded.google_access_token,
      google_refresh_token = COALESCE(excluded.google_refresh_token, users.google_refresh_token),
      token_expires_at = excluded.token_expires_at,
      updated_at = datetime('now')
  `).bind(
    userId,
    userInfo.id,
    userInfo.email,
    userInfo.name,
    userInfo.picture,
    tokens.access_token,
    tokens.refresh_token || null,
    tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : null,
  ).run()

  // Create session
  const sessionId = crypto.randomUUID()
  await c.env.SESSIONS.put(`session:${sessionId}`, JSON.stringify({
    userId,
    email: userInfo.email,
    name: userInfo.name,
    picture: userInfo.picture,
  }), { expirationTtl: 60 * 60 * 24 * 30 }) // 30 days

  setCookie(c, 'pulse_session', sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  return c.redirect(`${c.env.APP_URL}/`)
})

// GET /api/auth/me
auth.get('/me', async (c) => {
  const sessionId = getCookie(c, 'pulse_session')
  if (!sessionId) return c.json({ error: 'Não autenticado' }, 401)

  const session = await c.env.SESSIONS.get(`session:${sessionId}`, { type: 'json' })
  if (!session) return c.json({ error: 'Sessão inválida' }, 401)

  return c.json({ user: session })
})

// POST /api/auth/logout
auth.post('/logout', async (c) => {
  const sessionId = getCookie(c, 'pulse_session')
  if (sessionId) {
    await c.env.SESSIONS.delete(`session:${sessionId}`)
    deleteCookie(c, 'pulse_session')
  }
  return c.json({ ok: true })
})

export default auth
