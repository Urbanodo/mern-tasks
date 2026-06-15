import { useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const STATUS_LABELS  = { 'todo': 'À faire', 'in-progress': 'En cours', 'completed': 'Terminé' }
const STATUS_COLORS  = { 'todo': 'bg-gray-100 text-gray-700', 'in-progress': 'bg-blue-100 text-blue-700', 'completed': 'bg-green-100 text-green-700' }
const PRIORITY_LABELS = { 'low': 'Basse', 'medium': 'Moyenne', 'high': 'Haute' }
const PRIORITY_COLORS = { 'low': 'bg-green-100 text-green-700', 'medium': 'bg-yellow-100 text-yellow-700', 'high': 'bg-red-100 text-red-700' }

export default function AdminDashboard() {
  const [tasks,    setTasks]    = useState([])
  const [users,    setUsers]    = useState([])
  const [stats,    setStats]    = useState({})
  const [loading,  setLoading]  = useState(false)
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState('')
  const [priority, setPriority] = useState('')
  const [userId,   setUserId]   = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search)   params.search   = search
      if (status)   params.status   = status
      if (priority) params.priority = priority
      if (userId)   params.userId   = userId
      const { data } = await api.get('/admin/tasks', { params })
      setTasks(data.tasks)
      setUsers(data.users)
      setStats(data.stats)
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [search, status, priority, userId])

  const progressPercent = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">👑 Dashboard Admin</h1>
        <p className="text-gray-500 text-sm mt-1">Vue globale de toutes les tâches</p>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Utilisateurs', value: stats.totalUsers, color: 'border-purple-400' },
          { label: 'Total tâches', value: stats.total,      color: 'border-gray-300' },
          { label: 'À faire',      value: stats.todo,       color: 'border-gray-400' },
          { label: 'En cours',     value: stats.inProgress, color: 'border-blue-400' },
          { label: 'Terminées',    value: stats.completed,  color: 'border-green-400' }
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-xl border-l-4 ${s.color} p-4 shadow-sm`}>
            <p className="text-gray-500 text-xs">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value || 0}</p>
          </div>
        ))}
      </div>

      {/* Barre de progression globale */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-800">Progression globale — tous utilisateurs</span>
          <span className="text-2xl font-bold text-purple-600">{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div className="h-4 rounded-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #7c3aed, #a855f7)'
            }} />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{stats.completed} terminée(s)</span>
          <span>{stats.total} tâche(s) au total</span>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Rechercher..."
            className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
          <select value={userId} onChange={e => setUserId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
            <option value="">Tous les utilisateurs</option>
            {users.map(u => (
              <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
            ))}
          </select>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
            <option value="">Tous les statuts</option>
            <option value="todo">À faire</option>
            <option value="in-progress">En cours</option>
            <option value="completed">Terminé</option>
          </select>
          <select value={priority} onChange={e => setPriority(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
            <option value="">Toutes priorités</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Basse</option>
          </select>
        </div>
      </div>

      {/* Liste toutes les tâches */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Chargement...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center text-gray-400 py-12 bg-white rounded-2xl border border-gray-200">
          Aucune tâche trouvée
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task._id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                      👤 {task.userId?.name || 'Inconnu'}
                    </span>
                    <span className="text-xs text-gray-400">{task.userId?.email}</span>
                  </div>
                  <h3 className={`font-semibold text-gray-900 ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-gray-500 text-sm mt-1">{task.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[task.status]}`}>
                      {STATUS_LABELS[task.status]}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${PRIORITY_COLORS[task.priority]}`}>
                      {PRIORITY_LABELS[task.priority]}
                    </span>
                    {task.dueDate && (
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
                        📅 {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}