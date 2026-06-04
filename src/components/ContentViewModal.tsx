import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  id: string
  table: 'novel_contexts' | 'novel_parts'
  label: string
  accent: string
  titleRequired: boolean
  initialTitle: string | null
  initialContent: string
  onClose: () => void
  onUpdated: (title: string | null, content: string) => void
}

export default function ContentViewModal({
  id,
  table,
  label,
  accent,
  titleRequired,
  initialTitle,
  initialContent,
  onClose,
  onUpdated,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(initialTitle ?? '')
  const [content, setContent] = useState(initialContent)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copying, setCopying] = useState(false)

  async function handleSave() {
    if (!content.trim()) return
    if (titleRequired && !title.trim()) return
    setLoading(true)
    setError('')

    const { error: err } = await supabase
      .from(table)
      .update({ title: title.trim() || null, content: content.trim() })
      .eq('id', id)

    if (err) { setError(err.message); setLoading(false); return }
    onUpdated(title.trim() || null, content.trim())
    setEditing(false)
    setLoading(false)
  }

  function handleCancel() {
    setTitle(initialTitle ?? '')
    setContent(initialContent)
    setError('')
    setEditing(false)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(content)
    setCopying(true)
    setTimeout(() => setCopying(false), 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={editing ? undefined : onClose} />
      <div className="relative bg-[#1a1a22] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90svh]">

        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${accent}`}>{label}</span>
            {!editing && (initialTitle || title) && (
              <span className="text-white/70 text-sm font-medium truncate">{title || initialTitle}</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!editing && (
              <>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                >
                  {copying ? (
                    <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                  <span className="hidden sm:inline">{copying ? 'Copiado' : 'Copiar'}</span>
                </button>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
                  </svg>
                  <span className="hidden sm:inline">Editar</span>
                </button>
              </>
            )}
            {!editing && (
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white flex items-center justify-center transition-all text-base"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Cuerpo */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {editing ? (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">
                  Título {titleRequired ? '*' : '(opcional)'}
                </label>
                <input
                  autoFocus
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Contenido *</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={14}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors resize-none text-sm leading-relaxed"
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>
          ) : (
            <>
              {(title || initialTitle) && (
                <h3 className="text-white font-semibold text-base mb-3">{title || initialTitle}</h3>
              )}
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap break-words">
                {content}
              </p>
            </>
          )}
        </div>

        {/* Footer edición */}
        {editing && (
          <div className="flex gap-3 px-6 py-4 border-t border-white/8 shrink-0">
            <button
              onClick={handleCancel}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !content.trim() || (titleRequired && !title.trim())}
              className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-medium transition-colors text-sm"
            >
              {loading ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
