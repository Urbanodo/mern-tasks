import { useState, useEffect, useCallback } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const STATUS_LABELS  = { 'todo': 'À faire', 'in-progress': 'En cours', 'completed': 'Terminé' }
const STATUS_COLORS  = { 'todo': 'bg-gray-100 text-gray-700', 'in-progress': 'bg-blue-100 text-blue-700', 'completed': 'bg-green-100 text-green-700' }
const PRIORITY_LABELS = { 'low': 'Basse', 'medium': 'Moyenne', 'high': 'Haute' }
const PRIORITY_COLORS = { 'low': 'bg-green-100 text-green-700', 'medium': 'bg-yellow-100 text-yellow-700', 'high': 'bg-red-100 text-red-700' }

const emptyForm = { title: '', description: '', dueDate: '', priority: 'medium', status: 'todo' }

export default function Dashboard() {
  const [tasks,    setTasks]    = useState([])
  const [loading,  setLoading]  = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [form,     setForm]     = useState(emptyForm)

  // Filtres et tri
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState('')
  const [priority, setPriority] = useState('')
  const [sort,     setSort]     = useState('createdAt')

  const loadTasks = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search)   params.search   = search
      if (status)   params.status   = status
      if (priority) params.priority = priority
      if (sort)     params.sort     = sort
      const { data } = await api.get('/tasks', { params })
      setTasks(data.tasks)
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [search, status, priority, sort])

  useEffect(() => { loadTasks() }, [loadTasks])

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      if (editTask) {
        await api.put(`/tasks/${editTask._id}`, form)
        toast.success('Tâche modifiée !')
      } else {
        await api.post('/tasks', form)
        toast.success('Tâche créée !')
      }
      setShowForm(false)
      setEditTask(null)
      setForm(emptyForm)
      loadTasks()
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = task => {
    setEditTask(task)
    setForm({
      title:       task.title,
      description: task.description || '',
      dueDate:     task.dueDate ? task.dueDate.split('T')[0] : '',
      priority:    task.priority,
      status:      task.status
    })
    setShowForm(true)
  }

  const handleDelete = async id => {
    if (!window.confirm('Supprimer cette tâche ?')) return
    try {
      await api.delete(`/tasks/${id}`)
      toast.success('Tâche supprimée')
      loadTasks()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleStatusToggle = async task => {
    const nextStatus = task.status === 'todo' ? 'in-progress'
      : task.status === 'in-progress' ? 'completed' : 'todo'
    try {
      await api.put(`/tasks/${task._id}`, { status: nextStatus })
      loadTasks()
    } catch {
      toast.error('Erreur')
    }
  }

  const stats = {
    total:     tasks.length,
    todo:      tasks.filter(t => t.status === 'todo').length,
    inProgress:tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes tâches</h1>
          <p className="text-gray-500 text-sm mt-1">{stats.total} tâche(s) au total</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditTask(null); setForm(emptyForm) }}
          className="bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2 rounded-lg transition-colors">
          + Nouvelle tâche
        </button>
      </div>

      {/* Barre de progression */}
<div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
  <div className="flex items-center justify-between mb-2">
    <span className="font-semibold text-gray-800">Progression globale</span>
    <span className="text-2xl font-bold text-primary">
      {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
    </span>
  </div>
  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
    <div
      className="h-4 rounded-full transition-all duration-500"
      style={{
        width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`,
        background: 'linear-gradient(90deg, #6366f1, #8b5cf6)'
      }}
    />
  </div>
  <div className="flex justify-between text-xs text-gray-500 mt-1">
    <span>{stats.completed} terminée(s)</span>
    <span>{stats.total} tâche(s) au total</span>
  </div>
</div>

{/* Stats */}
<div className="grid grid-cols-4 gap-4">
  {[
    { label: 'Total',     value: stats.total,      color: 'border-gray-300' },
    { label: 'À faire',   value: stats.todo,       color: 'border-gray-400' },
    { label: 'En cours',  value: stats.inProgress, color: 'border-blue-400' },
    { label: 'Terminées', value: stats.completed,  color: 'border-green-400' }
  ].map(s => (
    <div key={s.label} className={`bg-white rounded-xl border-l-4 ${s.color} p-4 shadow-sm`}>
      <p className="text-gray-500 text-xs">{s.label}</p>
      <p className="text-2xl font-bold text-gray-900">{s.value}</p>
    </div>
  ))}
</div>

      {/* Formulaire */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">
            {editTask ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input type="text" required value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Titre de la tâche" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3} placeholder="Description optionnelle" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date limite</label>
              <input type="date" value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
            </div>
            {editTask && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="todo">À faire</option>
                  <option value="in-progress">En cours</option>
                  <option value="completed">Terminé</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button type="submit"
              className="bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2 rounded-lg transition-colors">
              {editTask ? 'Modifier' : 'Créer'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditTask(null) }}
              className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-50">
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Rechercher..."
            className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">Tous les statuts</option>
            <option value="todo">À faire</option>
            <option value="in-progress">En cours</option>
            <option value="completed">Terminé</option>
          </select>
          <select value={priority} onChange={e => setPriority(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">Toutes priorités</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Basse</option>
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="createdAt">Plus récentes</option>
            <option value="dueDate">Date limite</option>
            <option value="priority">Priorité</option>
            <option value="title">Titre</option>
          </select>
          {(search || status || priority) && (
            <button onClick={() => { setSearch(''); setStatus(''); setPriority('') }}
              className="text-sm text-red-500 hover:text-red-700">
              ✕ Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Liste des tâches */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Chargement...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center text-gray-400 py-12 bg-white rounded-2xl border border-gray-200">
          Aucune tâche trouvée
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task._id}
              className={`bg-white rounded-2xl border border-gray-200 p-5 shadow-sm transition-opacity ${task.status === 'completed' ? 'opacity-70' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <button onClick={() => handleStatusToggle(task)}
                    className={`mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
                      task.status === 'completed'
                        ? 'bg-green-500 border-green-500'
                        : task.status === 'in-progress'
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300 hover:border-primary'
                    }`} />
                  <div className="flex-1">
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
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleEdit(task)}
                    className="text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-1.5 rounded-lg transition-colors">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(task._id)}
                    className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg transition-colors">
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
