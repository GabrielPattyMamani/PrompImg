import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { NovelChapter } from '../types'

interface Props {
  novelId: string
  orderNum: number
  onClose: () => void
  onCreated: (chapter: NovelChapter) => void
}

export default function NewChapterModal({ novelId, orderNum, onClose, onCreated }: Props) {
  const [title, setTitle] = useState(`Capítulo ${orderNum}`)
  const [context, setContext] = useState('')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError('')

    const { data, error: err } = await supabase
      .from('novel_chapters')
      .insert({
        novel_id: novelId,
        title: title.trim(),
        context: context.trim() || null,
        summary: summary.trim() || null,
        order_num: orderNum,
      })
      .select()
      .single()

    if (err) { setError(err.message); setLoading(false); return }
    onCreated(data as NovelChapter)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1a1a22] border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90svh] overflow-y-auto">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-400/10 text-green-300 font-medium">
            Capítulo {orderNum}
          </span>
          <h2 className="text-white font-semibold text-lg">Nuevo capítulo</h2>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Título *</label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="ej. Capítulo 1, El Inicio…"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Contexto</label>
            <textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="Contexto general para este capítulo…"
              rows={5}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-green-500 transition-colors resize-none text-sm leading-relaxed"
            />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Resumen</label>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Resumen o descripción breve del capítulo…"
              rows={5}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-green-500 transition-colors resize-none text-sm leading-relaxed"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading || !title.trim()} className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white font-medium transition-colors">
              {loading ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
