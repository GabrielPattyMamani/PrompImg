import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { NovelPart } from '../types'

interface Props {
  novelId: string
  chapterId?: string
  orderNum: number
  onClose: () => void
  onCreated: (part: NovelPart) => void
}

export default function NewPartModal({ novelId, chapterId, orderNum, onClose, onCreated }: Props) {
  const [title, setTitle] = useState(`Parte ${orderNum}`)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || !title.trim()) return
    setLoading(true)
    setError('')

    const { data, error: err } = await supabase
      .from('novel_parts')
      .insert({
        novel_id: novelId,
        chapter_id: chapterId || null,
        title: title.trim(),
        content: content.trim(),
        order_num: orderNum,
      })
      .select()
      .single()

    if (err) { setError(err.message); setLoading(false); return }
    onCreated(data as NovelPart)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1a1a22] border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90svh] overflow-y-auto">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-400/10 text-violet-300 font-medium">
            Parte {orderNum}
          </span>
          <h2 className="text-white font-semibold text-lg">Nueva parte</h2>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Título *</label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="ej. Parte 1, Capítulo 1…"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Contenido *</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Pega aquí el contenido generado por la IA para esta parte…"
              rows={12}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors resize-none text-sm leading-relaxed"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading || !content.trim() || !title.trim()} className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-medium transition-colors">
              {loading ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
