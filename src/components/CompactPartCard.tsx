import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { NovelPart } from '../types'

type SelectedItem =
  | { type: 'part'; id: string; title: string; content: string; orderNum: number }
  | { type: 'summary'; id: string; partTitle: string; content: string; orderNum: number }

interface Props {
  part: NovelPart
  partIdx: number
  onDelete: () => void
  onSummaryChange: (id: string, summary: string) => void
  onExpandClick: () => void
  onToggleSelect?: (item: SelectedItem) => void
  isSelected?: boolean
  isSummarySelected?: boolean
}

export default function CompactPartCard({
  part,
  partIdx,
  onDelete,
  onSummaryChange,
  onExpandClick,
  onToggleSelect,
  isSelected = false,
  isSummarySelected = false,
}: Props) {
  const [copied, setCopied] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [summary, setSummary] = useState(part.summary ?? '')
  const [savedSummary, setSavedSummary] = useState(part.summary ?? '')
  const [saving, setSaving] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(`${part.title}\n\n${part.content}`).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function handleSummaryBlur() {
    if (summary === savedSummary) return
    setSaving(true)
    const { error } = await supabase.from('novel_parts').update({ summary }).eq('id', part.id)
    setSaving(false)
    if (!error) {
      setSavedSummary(summary)
      onSummaryChange(part.id, summary)
    }
  }

  return (
    <div className={`border rounded-lg overflow-hidden hover:border-white/20 transition-colors ${
      isSelected ? 'bg-violet-500/5 border-violet-500/50' : 'bg-white/2 border-white/8'
    }`}>
      {/* Part header - clickeable para expandir */}
      <div
        className="p-2.5 sm:p-3 flex items-start gap-2 cursor-pointer hover:bg-white/3 transition-colors"
      >
        {onToggleSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect({
              type: 'part',
              id: part.id,
              title: part.title,
              content: part.content,
              orderNum: partIdx + 1
            })}
            className="w-4 h-4 mt-0.5 accent-violet-500 cursor-pointer flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          />
        )}
        <div
          onClick={onExpandClick}
          className="flex-1 min-w-0"
        >
          <div className="flex items-start gap-2 mb-1">
            <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-violet-400/10 text-violet-300 whitespace-nowrap flex-shrink-0">
              Parte {partIdx + 1}
            </span>
            <span className="text-white/60 text-xs sm:text-sm font-medium line-clamp-1 flex-1">{part.title}</span>
          </div>
          <p className="text-white/50 text-xs leading-relaxed line-clamp-2 break-words">{part.content}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="text-white/40 hover:text-red-400 text-sm transition-colors flex-shrink-0 mt-0.5"
          title="Eliminar"
        >
          ×
        </button>
      </div>

      {/* Summary section */}
      {summary.trim() && (
        <div className="border-t border-white/8 px-2.5 sm:px-3 py-1.5 bg-white/1 flex items-center gap-2">
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={isSummarySelected}
              onChange={() => {
                if (summary.trim()) {
                  onToggleSelect({
                    type: 'summary',
                    id: part.id,
                    partTitle: part.title,
                    content: summary,
                    orderNum: partIdx + 1
                  })
                }
              }}
              disabled={!summary.trim()}
              className={`w-4 h-4 accent-blue-500 cursor-pointer flex-shrink-0 ${!summary.trim() ? 'opacity-40 cursor-not-allowed' : ''}`}
            />
          )}
          <p className="text-xs text-white/40 font-medium flex-1">Res: <span className="text-white/50">{summary.slice(0, 30)}…</span></p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-1 p-2 border-t border-white/8">
        <button
          onClick={handleCopy}
          className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${
            copied
              ? 'bg-green-500/20 text-green-400'
              : 'bg-white/8 hover:bg-white/12 text-white/60 hover:text-white/80'
          }`}
          title="Copiar contenido"
        >
          {copied ? '✓' : 'Copiar'}
        </button>
        <button
          onClick={onExpandClick}
          className="flex-1 px-2 py-1.5 rounded text-xs font-medium bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 hover:text-violet-200 transition-all"
          title="Leer y editar parte"
        >
          Leer
        </button>
        <button
          onClick={() => setSummaryOpen(!summaryOpen)}
          className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${
            summary.trim()
              ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-blue-200'
              : 'bg-white/8 text-white/40'
          }`}
          title="Editar resumen"
        >
          {summaryOpen ? 'Cerrar' : 'Resumen'}
        </button>
      </div>

      {/* Summary editor */}
      {summaryOpen && (
        <div className="p-2.5 sm:p-3 bg-blue-500/5 border-t border-white/8 space-y-2">
          <textarea
            autoFocus
            value={summary}
            onChange={e => setSummary(e.target.value)}
            onBlur={handleSummaryBlur}
            placeholder="Resumen de esta parte…"
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded px-2.5 py-2 text-white/70 placeholder-white/30 focus:outline-none focus:border-blue-500/40 transition-colors resize-none text-xs leading-relaxed"
          />
          <span className="text-xs italic text-white/25">{saving ? 'Guardando…' : summary !== savedSummary ? 'Sin guardar' : 'Guardado'}</span>
        </div>
      )}
    </div>
  )
}
