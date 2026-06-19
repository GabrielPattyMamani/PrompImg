import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { NovelContext, NovelPart } from '../types'

interface Props {
  novelId: string
  orderNum: number
  parts: NovelPart[]
  onClose: () => void
  onCreated: (ctx: NovelContext) => void
}

export default function NewContextModal({ novelId, orderNum, parts, onClose, onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedParts, setSelectedParts] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function togglePart(partId: string) {
    setSelectedParts(prev =>
      prev.includes(partId) ? prev.filter(id => id !== partId) : [...prev, partId]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    setError('')

    const { data, error: err } = await supabase
      .from('novel_contexts')
      .insert({
        novel_id: novelId,
        title: title.trim() || null,
        content: content.trim(),
        part_ids: selectedParts.length > 0 ? selectedParts : null,
        order_num: orderNum,
      })
      .select()
      .single()

    if (err) { setError(err.message); setLoading(false); return }
    onCreated(data as NovelContext)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1a1a22] border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90svh] overflow-y-auto">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 font-medium">
            Contexto {orderNum}
          </span>
          <h2 className="text-white font-semibold text-lg">Nuevo contexto</h2>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Título (opcional)</label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="ej. Descripción del mundo, Personajes principales…"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Contenido *</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Pega aquí el contexto que le darás a la IA para que continúe la historia…"
              rows={8}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors resize-none text-sm leading-relaxed"
            />
          </div>

          {parts.length > 0 && (
            <div>
              <label className="text-sm text-white/60 mb-2 block">Partes que abarca (opcional)</label>
              <div className="flex flex-col gap-2 max-h-32 overflow-y-auto bg-white/3 border border-white/8 rounded-xl p-3">
                {parts.map((part, i) => (
                  <label key={part.id} className="flex items-center gap-2.5 cursor-pointer hover:bg-white/5 px-2 py-1.5 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedParts.includes(part.id)}
                      onChange={() => togglePart(part.id)}
                      className="w-4 h-4 accent-violet-500 cursor-pointer"
                    />
                    <span className="text-xs text-white/70">Parte {i + 1} — {part.title}</span>
                  </label>
                ))}
              </div>
              {selectedParts.length > 0 && (
                <p className="text-xs text-white/40 mt-1">{selectedParts.length} parte(s) seleccionada(s)</p>
              )}
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading || !content.trim()} className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-medium transition-colors">
              {loading ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
