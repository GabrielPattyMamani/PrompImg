import { useEffect, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import NewContextModal from '../components/NewContextModal'
import NewPartModal from '../components/NewPartModal'
import NewChapterModal from '../components/NewChapterModal'
import AssignPartsToChapterModal from '../components/AssignPartsToChapterModal'
import CompactPartCard from '../components/CompactPartCard'
import ChapterHeader from '../components/ChapterHeader'
import ChapterDetailsSection from '../components/ChapterDetailsSection'
import ContextCard from '../components/ContextCard'
import ContentViewModal from '../components/ContentViewModal'
import type { Novel as NovelType, NovelContext, NovelPart, NovelChapter } from '../types'

type Tab = 'contexts' | 'parts' | 'chapters' | 'compiled'
type ViewingItem =
  | { type: 'context'; item: NovelContext; orderNum: number }
  | { type: 'part'; item: NovelPart; orderNum: number }
type SelectedItem =
  | { type: 'context'; id: string; title: string; content: string; orderNum: number }
  | { type: 'part'; id: string; title: string; content: string; orderNum: number }
  | { type: 'summary'; id: string; partTitle: string; content: string; orderNum: number }

function PartCard({
  part,
  orderNum,
  onClick,
  onDelete,
  onSummaryChange,
  onToggleSelect,
  isSelected,
  isResumarySelected,
}: {
  part: NovelPart
  orderNum: number
  onClick: () => void
  onDelete: () => void
  onSummaryChange: (id: string, summary: string) => void
  onToggleSelect: (item: SelectedItem) => void
  isSelected: boolean
  isResumarySelected: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [summaryCopied, setSummaryCopied] = useState(false)
  const [summary, setSummary] = useState(part.summary ?? '')
  const [savedSummary, setSavedSummary] = useState(part.summary ?? '')
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  function handleCopy(e: ReactMouseEvent) {
    e.stopPropagation()
    navigator.clipboard.writeText(`${part.title}\n\n${part.content}`).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleCopySummary(e: ReactMouseEvent) {
    e.stopPropagation()
    if (!summary.trim()) return
    navigator.clipboard.writeText(summary).then(() => {
      setSummaryCopied(true)
      setTimeout(() => setSummaryCopied(false), 2000)
    })
  }

  async function handleSummaryBlur() {
    if (summary === savedSummary) return
    setSaving(true)
    setSaveError('')
    const { error } = await supabase.from('novel_parts').update({ summary }).eq('id', part.id)
    setSaving(false)
    if (error) {
      setSaveError(error.message)
    } else {
      setSavedSummary(summary)
      onSummaryChange(part.id, summary)
    }
  }

  return (
    <div className={`bg-[#1a1a22] border rounded-xl sm:rounded-2xl overflow-hidden transition-colors ${isSelected ? 'border-violet-500/50 bg-violet-500/5' : 'border-white/8'}`}>
      {/* Encabezado */}
      <div className="p-3 sm:p-4 border-b border-white/8 flex items-start gap-2.5">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect({ type: 'part', id: part.id, title: part.title, content: part.content, orderNum })}
          className="w-5 h-5 mt-0.5 accent-violet-500 cursor-pointer flex-shrink-0"
        />
        <div
          className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onClick}
        >
          <div className="flex items-start gap-2 mb-2">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-400/10 text-violet-300 whitespace-nowrap flex-shrink-0">
              Parte {orderNum}
            </span>
            <span className="text-white/60 text-xs sm:text-sm font-medium line-clamp-1">{part.title}</span>
          </div>
          <p className="text-white/50 text-xs sm:text-sm leading-relaxed line-clamp-2 break-words">
            {part.content}
          </p>
        </div>
      </div>

      {/* Resumen — colapsable */}
      <div className="border-b border-white/8">
        <div className="flex items-center gap-2.5 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-white/3 transition-colors">
          <input
            type="checkbox"
            checked={isResumarySelected}
            onChange={() => {
              if (summary.trim()) {
                onToggleSelect({ type: 'summary', id: part.id, partTitle: part.title, content: summary, orderNum })
              }
            }}
            disabled={!summary.trim()}
            className={`w-5 h-5 accent-blue-500 cursor-pointer flex-shrink-0 ${!summary.trim() ? 'opacity-40 cursor-not-allowed' : ''}`}
          />
          <button
            onClick={e => { e.stopPropagation(); setSummaryOpen(v => !v) }}
            className="flex-1 flex items-center justify-between min-w-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <svg className="w-4 h-4 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs text-white/40 font-medium">Resumen</span>
              {summary.trim() && !summaryOpen && (
                <span className="text-xs text-white/30 truncate ml-1">{summary.slice(0, 30)}…</span>
              )}
              {!summary.trim() && !summaryOpen && (
                <span className="text-xs text-white/20 italic ml-1">sin resumen</span>
              )}
            </div>
            <svg
              className={`w-4 h-4 text-white/25 flex-shrink-0 transition-transform ${summaryOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {summaryOpen && (
          <div className="p-3 sm:p-4 bg-white/2 border-t border-white/8" onClick={e => e.stopPropagation()}>
            <textarea
              autoFocus
              value={summary}
              onChange={e => setSummary(e.target.value)}
              onBlur={handleSummaryBlur}
              placeholder="Pega o escribe el resumen de esta parte…"
              rows={5}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white/70 placeholder-white/30 focus:outline-none focus:border-violet-500/40 transition-colors resize-none text-sm leading-relaxed mb-2.5"
            />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className={`text-xs italic ${saveError ? 'text-red-400' : 'text-white/25'}`}>
                {saving ? 'Guardando…' : saveError ? saveError : summary !== savedSummary ? 'Sin guardar' : 'Guardado'}
              </span>
              <button
                onClick={handleCopySummary}
                disabled={!summary.trim()}
                className={`w-full sm:w-auto text-xs px-4 py-2 rounded-lg transition-all font-medium ${
                  summaryCopied
                    ? 'bg-green-500/20 text-green-400'
                    : summary.trim()
                    ? 'bg-violet-600/30 hover:bg-violet-600/40 text-violet-300'
                    : 'bg-white/5 text-white/25 cursor-not-allowed'
                }`}
              >
                {summaryCopied ? '✓ Copiado' : 'Copiar resumen'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex gap-2 p-3 sm:p-4">
        <button
          onClick={handleCopy}
          className={`flex-1 px-3 py-2 sm:py-1.5 rounded-lg transition-all text-xs sm:text-xs font-medium ${
            copied
              ? 'bg-green-500/20 text-green-400'
              : 'bg-white/8 hover:bg-white/12 text-white/60 hover:text-white/80'
          }`}
        >
          {copied ? '✓ Copiar' : 'Copiar'}
        </button>
        <button
          onClick={onClick}
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

export default function Novel() {
  const { id } = useParams<{ id: string }>()
  const [novel, setNovel] = useState<NovelType | null>(null)
  const [contexts, setContexts] = useState<NovelContext[]>([])
  const [chapters, setChapters] = useState<NovelChapter[]>([])
  const [parts, setParts] = useState<NovelPart[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('chapters')
  const [showContextModal, setShowContextModal] = useState(false)
  const [showPartModal, setShowPartModal] = useState(false)
  const [showChapterModal, setShowChapterModal] = useState(false)
  const [showAssignPartsModal, setShowAssignPartsModal] = useState(false)
  const [selectedChapterId, setSelectedChapterId] = useState<string | undefined>(undefined)
  const [viewing, setViewing] = useState<ViewingItem | null>(null)
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])

  useEffect(() => {
    if (id) fetchData(id)
  }, [id])

  async function fetchData(novelId: string) {
    const [{ data: nov }, { data: ctx }, { data: chp }, { data: pts }] = await Promise.all([
      supabase.from('novels').select('*').eq('id', novelId).single(),
      supabase.from('novel_contexts').select('*').eq('novel_id', novelId).order('order_num').order('created_at'),
      supabase.from('novel_chapters').select('*').eq('novel_id', novelId).order('order_num').order('created_at'),
      supabase.from('novel_parts').select('*').eq('novel_id', novelId).order('order_num').order('created_at'),
    ])
    if (nov) setNovel(nov)
    if (ctx) setContexts(ctx)
    if (chp) setChapters(chp)
    if (pts) setParts(pts)
    setLoading(false)
  }

  async function deleteContext(ctxId: string) {
    if (!confirm('¿Eliminar este contexto?')) return
    await supabase.from('novel_contexts').delete().eq('id', ctxId)
    setContexts(prev => prev.filter(c => c.id !== ctxId))
  }

  async function deleteChapter(chapterId: string) {
    if (!confirm('¿Eliminar este capítulo y todas sus partes?')) return
    await supabase.from('novel_chapters').delete().eq('id', chapterId)
    setChapters(prev => prev.filter(c => c.id !== chapterId))
    setParts(prev => prev.filter(p => p.chapter_id !== chapterId))
  }

  async function deletePart(partId: string) {
    if (!confirm('¿Eliminar esta parte?')) return
    await supabase.from('novel_parts').delete().eq('id', partId)
    setParts(prev => prev.filter(p => p.id !== partId))
  }

  function handleSummaryUpdate(partId: string, summary: string) {
    setParts(prev => prev.map(p => p.id === partId ? { ...p, summary } : p))
  }

  function toggleSelectedItem(item: SelectedItem) {
    setSelectedItems(prev => {
      const exists = prev.some(
        i => i.type === item.type && i.id === item.id
      )
      if (exists) {
        return prev.filter(i => !(i.type === item.type && i.id === item.id))
      } else {
        return [...prev, item]
      }
    })
  }

  function isItemSelected(type: string, id: string): boolean {
    return selectedItems.some(i => i.type === type && i.id === id)
  }

  if (loading) {
    return (
      <Layout>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#1a1a22] rounded-2xl h-40 animate-pulse" />
          ))}
        </div>
      </Layout>
    )
  }

  if (!novel) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-24">
          <p className="text-white/40">Novela no encontrada</p>
          <Link to="/novels" className="text-violet-400 mt-3 text-sm hover:text-violet-300">
            ← Volver a novelas
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <Link to="/novels" className="text-white/40 hover:text-white/60 text-xs sm:text-sm transition-colors mb-2 inline-flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Novelas
        </Link>
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">{novel.title}</h1>
          {novel.description && (
            <p className="text-white/40 text-xs sm:text-sm mt-1.5">{novel.description}</p>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
          {parts.some(p => p.summary?.trim()) && (
            <Link
              to={`/novel/${novel.id}/summaries`}
              className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 bg-white/6 hover:bg-white/10 text-white/60 hover:text-white/80 rounded-lg sm:rounded-xl font-medium text-sm transition-colors border border-white/8 order-2 sm:order-none"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Resúmenes</span>
            </Link>
          )}
          {parts.length > 0 && (
            <Link
              to={`/novel/${novel.id}/read`}
              className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 bg-amber-700/80 hover:bg-amber-700 text-amber-100 rounded-lg sm:rounded-xl font-medium text-sm transition-colors order-1 sm:order-none"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Leer novela</span>
            </Link>
          )}
          <button
            onClick={() => {
              if (tab === 'contexts') setShowContextModal(true)
              else if (tab === 'chapters') setShowChapterModal(true)
              else setShowPartModal(true)
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg sm:rounded-xl font-medium text-sm transition-colors order-3 sm:order-none"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>{tab === 'contexts' ? 'Contexto' : tab === 'chapters' ? 'Capítulo' : 'Parte'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-lg sm:rounded-xl w-full sm:w-fit mb-6 overflow-x-auto">
        <button
          onClick={() => setTab('chapters')}
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            tab === 'chapters' ? 'bg-[#1a1a22] text-white shadow' : 'text-white/40 hover:text-white/70'
          }`}
        >
          Capítulos
          <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${tab === 'chapters' ? 'bg-green-400/20 text-green-300' : 'bg-white/5 text-white/30'}`}>
            {chapters.length}
          </span>
        </button>
        <button
          onClick={() => setTab('contexts')}
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            tab === 'contexts' ? 'bg-[#1a1a22] text-white shadow' : 'text-white/40 hover:text-white/70'
          }`}
        >
          Contextos
          <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${tab === 'contexts' ? 'bg-amber-400/20 text-amber-300' : 'bg-white/5 text-white/30'}`}>
            {contexts.length}
          </span>
        </button>
        <button
          onClick={() => setTab('parts')}
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            tab === 'parts' ? 'bg-[#1a1a22] text-white shadow' : 'text-white/40 hover:text-white/70'
          }`}
        >
          Partes
          <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${tab === 'parts' ? 'bg-violet-400/20 text-violet-300' : 'bg-white/5 text-white/30'}`}>
            {parts.length}
          </span>
        </button>
        {selectedItems.length > 0 && (
          <button
            onClick={() => setTab('compiled')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              tab === 'compiled' ? 'bg-[#1a1a22] text-white shadow' : 'text-white/40 hover:text-white/70'
            }`}
          >
            Compilado
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${tab === 'compiled' ? 'bg-blue-400/20 text-blue-300' : 'bg-white/5 text-white/30'}`}>
              {selectedItems.length}
            </span>
          </button>
        )}
      </div>

      {/* Contenido */}
      {tab === 'contexts' && (
        contexts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
              <svg className="w-7 h-7 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-white/30 text-sm">No hay contextos todavía</p>
            <button onClick={() => setShowContextModal(true)} className="text-violet-400 hover:text-violet-300 text-sm transition-colors">
              Añadir el primero →
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {contexts.map((ctx, i) => (
              <ContextCard
                key={ctx.id}
                ctx={ctx}
                orderNum={i + 1}
                parts={parts}
                isSelected={isItemSelected('context', ctx.id)}
                onToggleSelect={toggleSelectedItem}
                onView={() => setViewing({ type: 'context', item: ctx, orderNum: i + 1 })}
                onDelete={() => deleteContext(ctx.id)}
                onCompactChange={(id, compact) => {
                  setContexts(prev => prev.map(c => c.id === id ? { ...c, compact } : c))
                }}
              />
            ))}
          </div>
        )
      )}

      {tab === 'chapters' && (
        chapters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
              <svg className="w-7 h-7 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-white/30 text-sm">No hay capítulos todavía</p>
            <button onClick={() => setShowChapterModal(true)} className="text-green-400 hover:text-green-300 text-sm transition-colors">
              Crear el primero →
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {chapters.map((chapter, i) => {
              const chapterParts = parts.filter(p => p.chapter_id === chapter.id)
              return (
                <div
                  key={chapter.id}
                  className="border border-white/8 rounded-xl sm:rounded-2xl overflow-hidden bg-[#1a1a22] hover:border-white/20 transition-colors"
                >
                  <ChapterHeader
                    chapter={chapter}
                    orderNum={i + 1}
                    isExpanded={selectedChapterId === chapter.id}
                    hasUnassignedParts={parts.some(p => !p.chapter_id)}
                    onToggleExpand={() => setSelectedChapterId(selectedChapterId === chapter.id ? undefined : chapter.id)}
                    onAssignParts={() => {
                      setSelectedChapterId(chapter.id)
                      setShowAssignPartsModal(true)
                    }}
                    onDelete={() => deleteChapter(chapter.id)}
                    onTitleChange={(newTitle) => {
                      setChapters(prev => prev.map(c =>
                        c.id === chapter.id ? { ...c, title: newTitle } : c
                      ))
                    }}
                  />

                  {/* Context/Summary section */}
                  {selectedChapterId === chapter.id && (
                    <ChapterDetailsSection
                      chapter={chapter}
                      onContextChange={(newContext) => {
                        setChapters(prev => prev.map(c =>
                          c.id === chapter.id ? { ...c, context: newContext } : c
                        ))
                      }}
                      onSummaryChange={(newSummary) => {
                        setChapters(prev => prev.map(c =>
                          c.id === chapter.id ? { ...c, summary: newSummary } : c
                        ))
                      }}
                    />
                  )}

                  {/* Parts inside chapter */}
                  {selectedChapterId === chapter.id && (
                    <div className="border-t border-white/8 p-3 sm:p-4 space-y-2">
                      {chapterParts.length === 0 ? (
                        <div className="py-6 flex flex-col items-center justify-center gap-3">
                          <p className="text-white/30 text-sm">No hay partes en este capítulo</p>
                          <button
                            onClick={() => {
                              setSelectedChapterId(chapter.id)
                              setShowPartModal(true)
                            }}
                            className="text-violet-400 hover:text-violet-300 text-xs transition-colors"
                          >
                            Agregar la primera →
                          </button>
                        </div>
                      ) : (
                        <>
                          {chapterParts.map((part, partIdx) => (
                            <CompactPartCard
                              key={part.id}
                              part={part}
                              partIdx={partIdx}
                              onDelete={() => deletePart(part.id)}
                              onSummaryChange={handleSummaryUpdate}
                              onExpandClick={() => setViewing({ type: 'part', item: part, orderNum: partIdx + 1 })}
                              onToggleSelect={toggleSelectedItem}
                              isSelected={isItemSelected('part', part.id)}
                              isSummarySelected={isItemSelected('summary', part.id)}
                            />
                          ))}
                          <button
                            onClick={() => {
                              setSelectedChapterId(chapter.id)
                              setShowPartModal(true)
                            }}
                            className="w-full py-2 rounded-lg border border-white/8 hover:border-white/20 text-white/40 hover:text-white/60 text-xs font-medium transition-colors"
                          >
                            + Agregar parte
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}

      {tab === 'parts' && (
        parts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
              <svg className="w-7 h-7 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <p className="text-white/30 text-sm">No hay partes todavía</p>
            <button onClick={() => setShowPartModal(true)} className="text-violet-400 hover:text-violet-300 text-sm transition-colors">
              Añadir la primera →
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {parts.map((part, i) => (
              <PartCard
                key={part.id}
                part={part}
                orderNum={i + 1}
                onClick={() => setViewing({ type: 'part', item: part, orderNum: i + 1 })}
                onDelete={() => deletePart(part.id)}
                onSummaryChange={handleSummaryUpdate}
                onToggleSelect={toggleSelectedItem}
                isSelected={isItemSelected('part', part.id)}
                isResumarySelected={isItemSelected('summary', part.id)}
              />
            ))}
          </div>
        )
      )}

      {tab === 'compiled' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-sm">Elementos seleccionados: {selectedItems.length}</h3>
              <p className="text-white/40 text-xs mt-1">Arrastra o usa los checkboxes para agregar/remover items</p>
            </div>
            {selectedItems.length > 0 && (
              <button
                onClick={() => {
                  const separator = '\n\n---------------------------------------------------------\n\n'
                  const text = selectedItems
                    .sort((a, b) => a.orderNum - b.orderNum)
                    .map((item) => {
                      if (item.type === 'context') {
                        return `CONTEXTO ${item.orderNum}${item.title ? ` — ${item.title}` : ''}\n\n${item.content}`
                      } else if (item.type === 'part') {
                        return `PARTE ${item.orderNum} — ${item.title}\n\n${item.content}`
                      } else {
                        return `RESUMEN PARTE ${item.orderNum} — ${item.partTitle}\n\n${item.content}`
                      }
                    })
                    .join(separator)
                  navigator.clipboard.writeText(text)
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm transition-colors"
              >
                Copiar todo
              </button>
            )}
          </div>

          {selectedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl bg-white/3 border border-white/8">
              <svg className="w-12 h-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-white/30 text-sm">Selecciona contextos, partes o resúmenes para compilarlos</p>
            </div>
          ) : (
            <div className="space-y-3 bg-white/2 rounded-2xl border border-white/8 p-4">
              {selectedItems
                .sort((a, b) => a.orderNum - b.orderNum)
                .map((item) => (
                  <div key={`${item.type}-${item.id}`} className="bg-[#1a1a22] border border-white/8 rounded-xl p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${
                          item.type === 'context' ? 'bg-amber-400/10 text-amber-300' :
                          item.type === 'part' ? 'bg-violet-400/10 text-violet-300' :
                          'bg-blue-400/10 text-blue-300'
                        }`}>
                          {item.type === 'context' ? `Contexto ${item.orderNum}` :
                           item.type === 'part' ? `Parte ${item.orderNum}` :
                           `Resumen P${item.orderNum}`}
                        </span>
                        <span className="text-white/60 text-xs sm:text-sm font-medium line-clamp-1 min-w-0">
                          {item.type === 'summary' ? item.partTitle : item.title}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleSelectedItem(item)}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-white/50 text-xs sm:text-sm leading-relaxed line-clamp-3 break-words">
                      {item.content}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {showContextModal && (
        <NewContextModal
          novelId={novel.id}
          orderNum={contexts.length + 1}
          parts={parts}
          onClose={() => setShowContextModal(false)}
          onCreated={ctx => setContexts(prev => [...prev, ctx])}
        />
      )}
      {showChapterModal && (
        <NewChapterModal
          novelId={novel.id}
          orderNum={chapters.length + 1}
          onClose={() => setShowChapterModal(false)}
          onCreated={chapter => {
            setChapters(prev => [...prev, chapter])
            setSelectedChapterId(chapter.id)
          }}
        />
      )}
      {showPartModal && (
        <NewPartModal
          novelId={novel.id}
          chapterId={selectedChapterId}
          orderNum={selectedChapterId
            ? (parts.filter(p => p.chapter_id === selectedChapterId).length + 1)
            : (parts.filter(p => !p.chapter_id).length + 1)
          }
          onClose={() => setShowPartModal(false)}
          onCreated={part => setParts(prev => [...prev, part])}
        />
      )}
      {showAssignPartsModal && selectedChapterId && (
        <AssignPartsToChapterModal
          chapterId={selectedChapterId}
          parts={parts}
          onClose={() => setShowAssignPartsModal(false)}
          onAssigned={assignedParts => {
            setParts(prev => prev.map(p =>
              assignedParts.some(ap => ap.id === p.id)
                ? { ...p, chapter_id: selectedChapterId }
                : p
            ))
          }}
        />
      )}

      {viewing && (
        <ContentViewModal
          id={viewing.item.id}
          table={viewing.type === 'context' ? 'novel_contexts' : 'novel_parts'}
          label={viewing.type === 'context' ? `Contexto ${viewing.orderNum}` : `Parte ${viewing.orderNum}`}
          accent={viewing.type === 'context' ? 'bg-amber-400/10 text-amber-300' : 'bg-violet-400/10 text-violet-300'}
          titleRequired={viewing.type === 'part'}
          initialTitle={viewing.item.title ?? null}
          initialContent={viewing.item.content}
          parts={parts}
          initialPartIds={viewing.type === 'context' ? (viewing.item as NovelContext).part_ids ?? null : undefined}
          onClose={() => setViewing(null)}
          onUpdated={(newTitle, newContent, partIds) => {
            if (viewing.type === 'context') {
              setContexts(prev => prev.map(c =>
                c.id === viewing.item.id ? { ...c, title: newTitle, content: newContent, part_ids: partIds } : c
              ))
            } else {
              setParts(prev => prev.map(p =>
                p.id === viewing.item.id ? { ...p, title: newTitle ?? p.title, content: newContent } : p
              ))
            }
            setViewing(null)
          }}
        />
      )}
    </Layout>
  )
}
