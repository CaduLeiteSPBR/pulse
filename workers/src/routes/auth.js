import { Hono } from 'hono'
import { setCookie, deleteCookie, getCookie } from 'hono/cookie'

const auth = new Hono()

// ── Utilitários de senha (Web Crypto API) ────────────────────────────────────

async function hashPassword(password) {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial, 256
  )
  const toHex = (buf) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
  return `pbkdf2:${toHex(salt)}:${toHex(bits)}`
}

async function verifyPassword(password, stored) {
  const [, saltHex, hashHex] = stored.split(':')
  const salt = new Uint8Array(saltHex.match(/.{2}/g).map(b => parseInt(b, 16)))
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial, 256
  )
  const newHex = [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, '0')).join('')
  return newHex === hashHex
}

async function saveSession(c, sessionId, payload) {
  await c.env.SESSIONS.put(`session:${sessionId}`, JSON.stringify(payload), {
    expirationTtl: 60 * 60 * 24 * 30,
  })
  setCookie(c, 'pulse_session', sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
}

// ── Registro com email/senha ─────────────────────────────────────────────────

auth.post('/register', async (c) => {
  const { name, email, password } = await c.req.json().catch(() => ({}))

  if (!name || !email || !password)
    return c.json({ error: 'Nome, e-mail e senha são obrigatórios' }, 400)

  if (password.length < 8)
    return c.json({ error: 'A senha deve ter pelo menos 8 caracteres' }, 400)

  const existing = await c.env.DB.prepare(
    'SELECT id FROM users WHERE email = ?'
  ).bind(email.toLowerCase()).first()

  if (existing)
    return c.json({ error: 'E-mail já cadastrado' }, 409)

  const userId = `u_local_${crypto.randomUUID().replace(/-/g, '')}`
  const hash = await hashPassword(password)

  await c.env.DB.prepare(`
    INSERT INTO users (id, email, name, password_hash)
    VALUES (?, ?, ?, ?)
  `).bind(userId, email.toLowerCase(), name.trim(), hash).run()

  const sessionId = crypto.randomUUID()
  const payload = { userId, email: email.toLowerCase(), name: name.trim(), picture: null }
  await saveSession(c, sessionId, payload)

  return c.json({ ok: true, user: payload })
})

// ── Login com email/senha ────────────────────────────────────────────────────

auth.post('/login', async (c) => {
  const { email, password } = await c.req.json().catch(() => ({}))

  if (!email || !password)
    return c.json({ error: 'E-mail e senha são obrigatórios' }, 400)

  const user = await c.env.DB.prepare(
    'SELECT id, email, name, picture, password_hash FROM users WHERE email = ?'
  ).bind(email.toLowerCase()).first()

  if (!user || !user.password_hash)
    return c.json({ error: 'E-mail ou senha inválidos' }, 401)

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid)
    return c.json({ error: 'E-mail ou senha inválidos' }, 401)

  const sessionId = crypto.randomUUID()
  const payload = { userId: user.id, email: user.email, name: user.name, picture: user.picture }
  await saveSession(c, sessionId, payload)

  return c.json({ ok: true, user: payload })
})

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
