import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Compte créé avec succès !')
      navigate('/')
    } catch {
      toast.error('Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <span className="text-4xl">✅</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Créer un compte</h1>
          <p className="text-gray-500 text-sm">Gérez vos tâches gratuitement</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Nom complet',    key: 'name',     type: 'text',     placeholder: 'Votre nom' },
            { label: 'Email',          key: 'email',    type: 'email',    placeholder: 'vous@exemple.com' },
            { label: 'Mot de passe',   key: 'password', type: 'password', placeholder: '••••••••' }
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} required placeholder={f.placeholder} value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
