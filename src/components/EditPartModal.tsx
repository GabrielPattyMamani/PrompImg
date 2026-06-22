import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { NovelPart } from '../types'

interface Props {
  part: NovelPart
  orderNum: number
  onClose: () => void
  onUpdated: (part: NovelPart) => void
}

export default function EditPartModal({ part, orderNum, onClose, onUpdated }: Props) {
  const [title, setTitle] = useState(part.title)
  const [content, setContent] = useState(part.content)
  const [draft, setDraft] = useState(part.draft ?? '')
  const [draftOpen, setDraftOpen] = useState(!!part.draft?.trim())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || (!content.trim() && !draft.trim())) return
    setLoading(true)
    setError('')

    const { data, error: err } = await supabase
      .from('novel_parts')
      .update({
        title: title.trim(),
        content: content.trim() || '',
        draft: draft.trim() || null,
      })
      .eq('id', part.id)
      .select()
      .single()

    if (err) { setError(err.message); setLoading(false); return }
    onUpdated(data as NovelPart)
    onClose()
  }

  function useDraft() {
    if (!draft.trim()) return
    setContent(draft.trim())
    setDraftOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1a1a22] border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90svh] overflow-y-auto">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-400/10 text-violet-300 font-medium">
            Parte {orderNum}
          </span>
          <h2 className="text-white font-semibold text-lg">Editar parte</h2>
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

          {/* Draft section */}
          <div>
            <button
              type="button"
              onClick={() => setDraftOpen(!draftOpen)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                draftOpen || draft.trim()
                  ? 'text-amber-400 hover:text-amber-300'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Borrador
              {draft.trim() && !draftOpen && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-400/15 text-amber-400/80">con contenido</span>
              )}
              <svg className={`w-3.5 h-3.5 transition-transform ${draftOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {draftOpen && (
              <div className="mt-2 space-y-2">
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  placeholder="Escribe aquí tu borrador, ideas, notas… luego puedes usarlo como contenido."
                  rows={8}
                  className="w-full bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-2.5 text-white/80 placeholder-white/30 focus:outline-none focus:border-amber-500/40 transition-colors resize-none text-sm leading-relaxed"
                />
                {draft.trim() && (
                  <button
                    type="button"
                    onClick={useDraft}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                    Usar borrador como contenido
                  </button>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Contenido</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={12}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors resize-none text-sm leading-relaxed"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading || !title.trim() || (!content.trim() && !draft.trim())} className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-medium transition-colors">
              {loading ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
