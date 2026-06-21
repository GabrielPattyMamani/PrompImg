import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { NovelChapter } from '../types'

interface Props {
  chapter: NovelChapter
  onContextChange: (context: string | null) => void
  onSummaryChange: (summary: string | null) => void
}

export default function ChapterDetailsSection({
  chapter,
  onContextChange,
  onSummaryChange,
}: Props) {
  const [contextOpen, setContextOpen] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [context, setContext] = useState(chapter.context ?? '')
  const [summary, setSummary] = useState(chapter.summary ?? '')
  const [savingContext, setSavingContext] = useState(false)
  const [savingSummary, setSavingSummary] = useState(false)
  const [savedContext, setSavedContext] = useState(chapter.context ?? '')
  const [savedSummary, setSavedSummary] = useState(chapter.summary ?? '')

  async function handleContextBlur() {
    if (context === savedContext) return
    setSavingContext(true)
    const { error } = await supabase
      .from('novel_chapters')
      .update({ context: context.trim() || null })
      .eq('id', chapter.id)
    setSavingContext(false)
    if (!error) {
      setSavedContext(context)
      onContextChange(context.trim() || null)
    }
  }

  async function handleSummaryBlur() {
    if (summary === savedSummary) return
    setSavingSummary(true)
    const { error } = await supabase
      .from('novel_chapters')
      .update({ summary: summary.trim() || null })
      .eq('id', chapter.id)
    setSavingSummary(false)
    if (!error) {
      setSavedSummary(summary)
      onSummaryChange(summary.trim() || null)
    }
  }

  return (
    <div className="border-b border-white/8">
      {/* Context section */}
      <div className="border-b border-white/8">
        <button
          onClick={() => setContextOpen(!contextOpen)}
          className="w-full p-3 sm:p-4 bg-blue-500/5 hover:bg-blue-500/10 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-2 min-w-0">
            <svg
              className={`w-4 h-4 text-blue-300 flex-shrink-0 transition-transform ${contextOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="text-xs text-blue-300 font-medium">Contexto</span>
            {context.trim() && !contextOpen && (
              <span className="text-xs text-white/30 truncate ml-2">{context.slice(0, 40)}…</span>
            )}
            {!context.trim() && !contextOpen && (
              <span className="text-xs text-white/20 italic ml-2">sin contexto</span>
            )}
          </div>
        </button>

        {contextOpen && (
          <div className="p-3 sm:p-4 bg-blue-500/3 border-t border-white/8 space-y-2">
            <textarea
              autoFocus
              value={context}
              onChange={e => setContext(e.target.value)}
              onBlur={handleContextBlur}
              placeholder="Agrega un contexto para este capítulo…"
              rows={5}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white/70 placeholder-white/30 focus:outline-none focus:border-blue-500/40 transition-colors resize-none text-sm leading-relaxed"
            />
            <span className="text-xs italic text-white/25">
              {savingContext ? 'Guardando…' : context !== savedContext ? 'Sin guardar' : 'Guardado'}
            </span>
          </div>
        )}
      </div>

      {/* Summary section */}
      <div>
        <button
          onClick={() => setSummaryOpen(!summaryOpen)}
          className="w-full p-3 sm:p-4 bg-purple-500/5 hover:bg-purple-500/10 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-2 min-w-0">
            <svg
              className={`w-4 h-4 text-purple-300 flex-shrink-0 transition-transform ${summaryOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="text-xs text-purple-300 font-medium">Resumen</span>
            {summary.trim() && !summaryOpen && (
              <span className="text-xs text-white/30 truncate ml-2">{summary.slice(0, 40)}…</span>
            )}
            {!summary.trim() && !summaryOpen && (
              <span className="text-xs text-white/20 italic ml-2">sin resumen</span>
            )}
          </div>
        </button>

        {summaryOpen && (
          <div className="p-3 sm:p-4 bg-purple-500/3 border-t border-white/8 space-y-2">
            <textarea
              autoFocus
              value={summary}
              onChange={e => setSummary(e.target.value)}
              onBlur={handleSummaryBlur}
              placeholder="Agrega un resumen para este capítulo…"
              rows={5}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white/70 placeholder-white/30 focus:outline-none focus:border-purple-500/40 transition-colors resize-none text-sm leading-relaxed"
            />
            <span className="text-xs italic text-white/25">
              {savingSummary ? 'Guardando…' : summary !== savedSummary ? 'Sin guardar' : 'Guardado'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
