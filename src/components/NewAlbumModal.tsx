import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { ImageAlbum } from '../types'

interface Props {
  onClose: () => void
  onCreated: (album: ImageAlbum) => void
}

export default function NewAlbumModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')

    const { data, error: err } = await supabase
      .from('image_albums')
      .insert({ name: name.trim(), description: description.trim() || null })
      .select()
      .single()

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    onCreated(data as ImageAlbum)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1a1a22] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-white font-semibold text-lg mb-5">Nueva carpeta</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Nombre *</label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="ej. Personajes fantásticos"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Descripción (opcional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe qué imágenes vas a guardar aquí…"
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors resize-none"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-colors"
            >
              {loading ? 'Creando…' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
