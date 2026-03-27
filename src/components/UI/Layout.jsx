import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, ListTodo, Sun, Moon, Menu, X, Plus, LogOut, User } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import TaskFormModal from '../Tasks/TaskFormModal'

export default function Layout({ children }) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [taskModalOpen, setTaskModalOpen] = useState(false)

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tarefas', icon: ListTodo, label: 'Tarefas' },
  ]

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col
        bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-pulse-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Pulse</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* New Task Button */}
        <div className="p-4">
          <button
            onClick={() => { setTaskModalOpen(true); setSidebarOpen(false) }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-pulse-500 hover:bg-pulse-600 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <Plus size={18} />
            Nova Tarefa
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${location.pathname === to
                  ? 'bg-pulse-50 dark:bg-pulse-950/50 text-pulse-600 dark:text-pulse-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }
              `}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        {/* User + Theme */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
          </button>

          <div className="flex items-center gap-3 px-3 py-2">
            {user?.picture ? (
              <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-pulse-100 dark:bg-pulse-900/30 flex items-center justify-center">
                <User size={16} className="text-pulse-600 dark:text-pulse-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar mobile */}
        <header className="lg:hidden flex items-center h-16 px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 ml-3">
            <div className="w-7 h-7 bg-pulse-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">Pulse</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setTaskModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-pulse-500 hover:bg-pulse-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Nova
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>

      {/* Task Form Modal */}
      {taskModalOpen && (
        <TaskFormModal onClose={() => setTaskModalOpen(false)} />
      )}
    </div>
  )
}
