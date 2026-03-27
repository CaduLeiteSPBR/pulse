import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function Login() {
  const { login, loginWithEmail, register } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [tab, setTab] = useState('google')        // 'google' | 'email'
  const [mode, setMode] = useState('login')        // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const update = (field) => (e) => {
    setError('')
    setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        await register(form.name, form.email, form.password)
      } else {
        await loginWithEmail(form.email, form.password)
      }
      navigate('/')
    } catch (err) {
      setError(err.message || 'Erro ao autenticar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pulse-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-xl bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pulse-500 rounded-2xl shadow-2xl shadow-pulse-500/30 mb-4">
            <span className="text-3xl font-bold text-white">P</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Pulse</h1>
          <p className="text-gray-400 mt-2 text-sm">Gestão inteligente de pendências</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-5">

          {/* Tabs Google / E-mail */}
          <div className="flex rounded-xl bg-white/5 p-1 gap-1">
            <button
              onClick={() => { setTab('google'); setError('') }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                tab === 'google'
                  ? 'bg-white/15 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Google
            </button>
            <button
              onClick={() => { setTab('email'); setError('') }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                tab === 'email'
                  ? 'bg-white/15 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              E-mail
            </button>
          </div>

          {/* ── Aba Google ── */}
          {tab === 'google' && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm text-center">
                Entre com sua conta Google para continuar
              </p>
              <button
                onClick={login}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors shadow-sm"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Entrar com Google
              </button>
            </div>
          )}

          {/* ── Aba E-mail ── */}
          {tab === 'email' && (
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Toggle entrar/criar conta */}
              <div className="flex rounded-lg bg-white/5 p-0.5 gap-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError('') }}
                  className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${
                    mode === 'login' ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError('') }}
                  className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${
                    mode === 'register' ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Criar conta
                </button>
              </div>

              {mode === 'register' && (
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={form.name}
                  onChange={update('name')}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-pulse-500 transition-colors"
                />
              )}

              <input
                type="email"
                placeholder="E-mail"
                value={form.email}
                onChange={update('email')}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-pulse-500 transition-colors"
              />

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Senha (mín. 8 caracteres)"
                  value={form.password}
                  onChange={update('password')}
                  required
                  minLength={8}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-pulse-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && (
                <p className="text-red-400 text-xs text-center bg-red-400/10 py-2 px-3 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-pulse-500 hover:bg-pulse-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {mode === 'register' ? 'Criar conta' : 'Entrar'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          Seus dados ficam seguros e privados.<br />Nenhuma informação é compartilhada.
        </p>
      </div>
    </div>
  )
}
