import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        } else if (import.meta.env.DEV) {
          setUser({ id: 'dev-user', name: 'Usuário Dev', email: 'dev@pulse.local', picture: null })
        }
      } catch {
        if (import.meta.env.DEV) {
          setUser({ id: 'dev-user', name: 'Usuário Dev', email: 'dev@pulse.local', picture: null })
        }
      } finally {
        setLoading(false)
      }
    }
    checkSession()
  }, [])

  // Login via Google OAuth (redirect)
  const login = () => {
    window.location.href = '/api/auth/google'
  }

  // Login com email/senha
  const loginWithEmail = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro ao entrar')
    setUser(data.user)
  }

  // Criar conta com email/senha
  const register = async (name, email, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro ao criar conta')
    setUser(data.user)
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithEmail, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
