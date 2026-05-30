import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { Entry, EntryImage } from '../types'

interface Props {
  entry: Entry
  onClose: () => void
  onSaved: (e: Entry) => void
}

type ImageItem =
  | { type: 'existing'; data: EntryImage }
  | { type: 'new'; file: File; preview: string }

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

export default function EditEntryModal({ entry, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(entry.title ?? '')
  const [prompt, setPrompt] = useState(entry.prompt)
  const [images, setImages] = useState<ImageItem[]>(
    [...(entry.images ?? [])]
      .sort((a, b) => (a.created_at < b.created_at ? -1 : 1))
      .map(img => ({ type: 'existing', data: img }))
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lightbox, setLightbox] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function getSrc(item: ImageItem) {
    return item.type === 'existing' ? item.data.image_data : item.preview
  }

  function handleFiles(selected: FileList | null) {
    if (!selected) return
    Array.from(selected).forEach(file => {
      const reader = new FileReader()
      reader.onload = ev =>
        setImages(prev => [
          ...prev,
          { type: 'new', file, preview: ev.target!.result as string },
        ])
      reader.readAsDataURL(file)
    })
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  function makeCover(index: number) {
    setImages(prev => {
      const next = [...prev]
      const [item] = next.splice(index, 1)
      return [item, ...next]
    })
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
      const { data: updatedEntry, error: updateErr } = await supabase
        .from('entries')
        .update({ title: title.trim() || null, prompt: prompt.trim() })
        .eq('id', entry.id)
        .select()
        .single()

      if (updateErr) throw updateErr

      // Delete all existing images and reinsert in the current order
      // so the cover (index 0) always has the earliest created_at.
      await supabase.from('entry_images').delete().eq('entry_id', entry.id)

      const savedImages: EntryImage[] = []
      for (const item of images) {
        const imageData =
          item.type === 'existing'
            ? item.data.image_data
            : await toWebPDataURL(item.file)
        const { data: inserted, error: imgErr } = await supabase
          .from('entry_images')
          .insert({ entry_id: entry.id, image_data: imageData })
          .select()
          .single()
        if (imgErr) throw imgErr
        savedImages.push(inserted as EntryImage)
      }

      onSaved({ ...updatedEntry, images: savedImages })
      onClose()
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message ?? JSON.stringify(err)
      setError(msg)
      setLoading(false)
    }
  }

  return (
    <>
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} className="max-w-full max-h-full object-contain rounded-lg" alt="" />
          <button
            className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl"
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
        </div>
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-[#1a1a22] border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90svh] overflow-y-auto">
          <h2 className="text-white font-semibold text-lg mb-5">Editar prompt</h2>
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
              {images.length > 0 && (
                <>
                  <p className="text-white/30 text-xs mb-2">
                    La primera imagen es la portada — haz hover para cambiarla o eliminar
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                    {images.map((item, i) => {
                      const src = getSrc(item)
                      const isCover = i === 0
                      return (
                        <div
                          key={i}
                          className="relative group aspect-square cursor-zoom-in"
                          onClick={() => setLightbox(src)}
                        >
                          <img src={src} className="w-full h-full object-cover rounded-lg" alt="" />

                          {isCover ? (
                            <div className="absolute top-1 left-1 flex items-center gap-0.5 bg-amber-500/90 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full select-none">
                              <svg className="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              Portada
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); makeCover(i) }}
                              className="absolute top-1 left-1 w-5 h-5 bg-black/70 rounded-full text-amber-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              title="Hacer portada"
                            >
                              ★
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); removeImage(i) }}
                            className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-white/10 hover:border-violet-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors"
              >
                <p className="text-white/40 text-sm">
                  Arrastra imágenes aquí o{' '}
                  <span className="text-violet-400">selecciona archivos</span>
                </p>
                <p className="text-white/25 text-xs mt-1">
                  PNG, JPG, GIF — se convierten a WebP automáticamente
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleFiles(e.target.files)}
                />
              </div>
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
                {loading ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
