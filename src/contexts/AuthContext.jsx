import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check session on mount
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        } else {
          // Dev mode: mock user for local development
          if (import.meta.env.DEV) {
            setUser({
              id: 'dev-user',
              name: 'Usuário Dev',
              email: 'dev@pulse.local',
              picture: null,
            })
          }
        }
      } catch {
        if (import.meta.env.DEV) {
          setUser({
            id: 'dev-user',
            name: 'Usuário Dev',
            email: 'dev@pulse.local',
            picture: null,
          })
        }
      } finally {
        setLoading(false)
      }
    }
    checkSession()
  }, [])

  const login = () => {
    window.location.href = '/api/auth/google'
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
