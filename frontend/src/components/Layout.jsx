import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const navClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
      isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
    }`

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span className="text-xl font-bold text-primary">MERN Tasks</span>
            </div>
            <nav className="flex items-center gap-2">
              <NavLink to="/" className={navClass} end>Mes tâches</NavLink>
              {user?.isAdmin && (
                <NavLink to="/admin" className={navClass}>
                  👑 Admin
                </NavLink>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {user?.name}
              {user?.isAdmin && (
                <span className="ml-2 bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </span>
            <button onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-700 transition-colors">
              Déconnexion
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <Outlet />
      </main>
      <footer className="text-center text-xs text-gray-400 py-4">
        MERN Tasks © 2024
      </footer>
    </div>
  )
}