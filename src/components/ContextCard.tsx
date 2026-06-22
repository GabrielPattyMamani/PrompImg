import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { NovelContext, NovelPart } from '../types'

type SelectedItem =
  | { type: 'context'; id: string; title: string; content: string; orderNum: number }

interface Props {
  ctx: NovelContext
  orderNum: number
  parts: NovelPart[]
  isSelected: boolean
  onToggleSelect: (item: SelectedItem) => void
  onView: () => void
  onDelete: () => void
  onCompactChange: (id: string, compact: string | null) => void
}

export default function ContextCard({
  ctx,
  orderNum,
  parts,
  isSelected,
  onToggleSelect,
  onView,
  onDelete,
  onCompactChange,
}: Props) {
  const [compactOpen, setCompactOpen] = useState(false)
  const [compact, setCompact] = useState(ctx.compact ?? '')
  const [savedCompact, setSavedCompact] = useState(ctx.compact ?? '')
  const [saving, setSaving] = useState(false)
  const [compactCopied, setCompactCopied] = useState(false)

  const coveredParts = ctx.part_ids?.length
    ? parts.filter(p => ctx.part_ids?.includes(p.id)).map(p => parts.indexOf(p) + 1)
    : []

  async function handleCompactBlur() {
    if (compact === savedCompact) return
    setSaving(true)
    const { error } = await supabase
      .from('novel_contexts')
      .update({ compact: compact.trim() || null })
      .eq('id', ctx.id)
    setSaving(false)
    if (!error) {
      setSavedCompact(compact)
      onCompactChange(ctx.id, compact.trim() || null)
    }
  }

  function handleCopyCompact(e: React.MouseEvent) {
    e.stopPropagation()
    if (!compact.trim()) return
    navigator.clipboard.writeText(compact).then(() => {
      setCompactCopied(true)
      setTimeout(() => setCompactCopied(false), 2000)
    })
  }

  return (
    <div className={`border rounded-xl sm:rounded-2xl overflow-hidden transition-colors ${
      isSelected ? 'border-amber-500/50 bg-amber-500/5' : 'bg-[#1a1a22] border-white/8 hover:border-white/20'
    }`}>
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-white/8 flex items-start gap-2.5">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect({
            type: 'context',
            id: ctx.id,
            title: ctx.title ?? `Contexto ${orderNum}`,
            content: ctx.content,
            orderNum,
          })}
          className="w-5 h-5 mt-0.5 accent-amber-500 cursor-pointer flex-shrink-0"
        />
        <div
          className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onView}
        >
          <div className="flex items-start gap-2 mb-2">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 whitespace-nowrap flex-shrink-0">
              Contexto {orderNum}
            </span>
            {ctx.title && (
              <span className="text-white/60 text-xs sm:text-sm font-medium line-clamp-2">{ctx.title}</span>
            )}
          </div>
          <p className="text-white/50 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 break-words">
            {ctx.content}
          </p>
        </div>
      </div>

      {/* Versión compacta — colapsable */}
      <div className="border-b border-white/8">
        <div className="flex items-center gap-2.5 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-white/3 transition-colors">
          <button
            onClick={e => { e.stopPropagation(); setCompactOpen(v => !v) }}
            className="flex-1 flex items-center justify-between min-w-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <svg className="w-4 h-4 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
              <span className="text-xs text-white/40 font-medium">Versión compacta</span>
              {compact.trim() && !compactOpen && (
                <span className="text-xs text-white/30 truncate ml-1">{compact.slice(0, 30)}…</span>
              )}
              {!compact.trim() && !compactOpen && (
                <span className="text-xs text-white/20 italic ml-1">sin versión compacta</span>
              )}
            </div>
            <svg
              className={`w-4 h-4 text-white/25 flex-shrink-0 transition-transform ${compactOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {compactOpen && (
          <div className="p-3 sm:p-4 bg-white/2 border-t border-white/8" onClick={e => e.stopPropagation()}>
            <textarea
              autoFocus
              value={compact}
              onChange={e => setCompact(e.target.value)}
              onBlur={handleCompactBlur}
              placeholder="Escribe la versión compacta de este contexto…"
              rows={5}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white/70 placeholder-white/30 focus:outline-none focus:border-amber-500/40 transition-colors resize-none text-sm leading-relaxed mb-2.5"
            />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className={`text-xs italic text-white/25`}>
                {saving ? 'Guardando…' : compact !== savedCompact ? 'Sin guardar' : 'Guardado'}
              </span>
              <button
                onClick={handleCopyCompact}
                disabled={!compact.trim()}
                className={`w-full sm:w-auto text-xs px-4 py-2 rounded-lg transition-all font-medium ${
                  compactCopied
                    ? 'bg-green-500/20 text-green-400'
                    : compact.trim()
                    ? 'bg-amber-600/30 hover:bg-amber-600/40 text-amber-300'
                    : 'bg-white/5 text-white/25 cursor-not-allowed'
                }`}
              >
                {compactCopied ? 'Copiado' : 'Copiar compacto'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Covered parts */}
      {coveredParts.length > 0 && (
        <div className="px-3 sm:px-4 pt-2 sm:pt-3 pb-2 sm:pb-3 border-b border-white/8">
          <p className="text-xs text-white/40 mb-1.5 font-medium">Abarca {coveredParts.length} parte(s)</p>
          <div className="flex flex-wrap gap-1.5">
            {coveredParts.map(partNum => (
              <span key={partNum} className="text-xs px-2 py-1 rounded-full bg-amber-400/10 text-amber-300">
                P{partNum}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-3 sm:p-4 flex flex-col sm:flex-row gap-2 sm:gap-1.5">
        <button
          onClick={e => {
            e.stopPropagation()
            navigator.clipboard.writeText(ctx.content)
          }}
          className="flex-1 px-3 py-2 sm:py-1.5 rounded-lg bg-white/8 hover:bg-white/12 text-white/60 hover:text-white/80 transition-all text-xs sm:text-xs font-medium"
        >
          Copiar
        </button>
        <button
          onClick={e => {
            e.stopPropagation()
            onView()
          }}
          className="flex-1 px-3 py-2 sm:py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 hover:text-violet-200 transition-all text-xs sm:text-xs font-medium"
        >
          Editar
        </button>
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="flex-1 px-3 py-2 sm:py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all text-xs sm:text-xs font-medium"
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}
