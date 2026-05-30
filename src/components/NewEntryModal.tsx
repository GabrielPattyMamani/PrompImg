import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { Entry } from '../types'

interface Props {
  collectionId: string
  onClose: () => void
  onCreated: (e: Entry) => void
}

function toWebPDataURL(file: File, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      canvas.getContext('2d')!.drawImage(img, 0, 0)
      URL.revokeObjectURL(img.src)
      resolve(canvas.toDataURL('image/webp', quality))
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export default function NewEntryModal({ collectionId, onClose, onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [prompt, setPrompt] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(selected: FileList | null) {
    if (!selected) return
    const arr = Array.from(selected)
    setFiles(prev => [...prev, ...arr])
    arr.forEach(f => {
      const reader = new FileReader()
      reader.onload = ev => setPreviews(prev => [...prev, ev.target!.result as string])
      reader.readAsDataURL(f)
    })
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim()) return
    setLoading(true)
    setError('')

    try {
      const { data: entry, error: entryErr } = await supabase
        .from('entries')
        .insert({
          collection_id: collectionId,
          title: title.trim() || null,
          prompt: prompt.trim(),
        })
        .select()
        .single()

      if (entryErr) throw entryErr

      const imageRows = []

      for (const file of files) {
        const imageData = await toWebPDataURL(file)
        imageRows.push({ entry_id: entry.id, image_data: imageData })
      }

      if (imageRows.length > 0) {
        const { error: imgErr } = await supabase.from('entry_images').insert(imageRows)
        if (imgErr) throw imgErr
      }

      const fullEntry: Entry = {
        ...entry,
        images: imageRows.map((row, i) => ({
          id: String(i),
          entry_id: entry.id,
          image_data: row.image_data,
          created_at: entry.created_at,
        })),
      }

      onCreated(fullEntry)
      onClose()
    } catch (err: unknown) {
      console.error('Error guardando prompt:', err)
      const msg =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message
            ?? JSON.stringify(err)
      setError(msg)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1a1a22] border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90svh] overflow-y-auto">
        <h2 className="text-white font-semibold text-lg mb-5">Nuevo prompt</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Título (opcional)</label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="ej. Mujer con luz dorada"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Prompt *</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Pega aquí tu prompt completo…"
              rows={6}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors resize-none font-mono text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Imágenes</label>
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-white/10 hover:border-violet-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors"
            >
              <p className="text-white/40 text-sm">
                Arrastra imágenes aquí o <span className="text-violet-400">selecciona archivos</span>
              </p>
              <p className="text-white/25 text-xs mt-1">PNG, JPG, GIF — se convierten a WebP automáticamente</p>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={e => handleFiles(e.target.files)}
              />
            </div>
            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative group aspect-square">
                    <img src={src} className="w-full h-full object-cover rounded-lg" alt="" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              disabled={loading || !prompt.trim()}
              className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-colors"
            >
              {loading ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
