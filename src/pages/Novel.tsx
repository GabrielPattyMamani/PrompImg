import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import NewContextModal from '../components/NewContextModal'
import NewPartModal from '../components/NewPartModal'
import EditContextModal from '../components/EditContextModal'
import EditPartModal from '../components/EditPartModal'
import type { Novel as NovelType, NovelContext, NovelPart } from '../types'

type Tab = 'contexts' | 'parts'

function TextCard({
  label,
  title,
  content,
  onEdit,
  onDelete,
  accent,
}: {
  label: string
  title?: string | null
  content: string
  onEdit: () => void
  onDelete: () => void
  accent: string
}) {
  const [expanded, setExpanded] = useState(false)
  const [copying, setCopying] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(content)
    setCopying(true)
    setTimeout(() => setCopying(false), 1500)
  }

  return (
    <div className="bg-[#1a1a22] border border-white/8 rounded-2xl p-4 hover:border-white/15 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${accent}`}>{label}</span>
        {title && <span className="text-white/60 text-sm font-medium truncate">{title}</span>}
      </div>
      <p className={`text-white/60 text-sm leading-relaxed whitespace-pre-wrap break-words ${!expanded && 'line-clamp-4'}`}>
        {content}
      </p>
      {content.length > 300 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-violet-400 text-xs mt-1.5 hover:text-violet-300 transition-colors"
        >
          {expanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}
      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
        >
          {copying ? (
            <>
              <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400">Copiado</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copiar
            </>
          )}
        </button>
        <span className="flex-1" />
        <button
          onClick={onEdit}
          className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-violet-500/20 text-white/30 hover:text-violet-400 transition-all"
        >
          Editar
        </button>
        <button
          onClick={onDelete}
          className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all"
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
  const [parts, setParts] = useState<NovelPart[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('contexts')
  const [showContextModal, setShowContextModal] = useState(false)
  const [showPartModal, setShowPartModal] = useState(false)
  const [editingContext, setEditingContext] = useState<NovelContext | null>(null)
  const [editingPart, setEditingPart] = useState<NovelPart | null>(null)

  useEffect(() => {
    if (id) fetchData(id)
  }, [id])

  async function fetchData(novelId: string) {
    const [{ data: nov }, { data: ctx }, { data: pts }] = await Promise.all([
      supabase.from('novels').select('*').eq('id', novelId).single(),
      supabase.from('novel_contexts').select('*').eq('novel_id', novelId).order('order_num').order('created_at'),
      supabase.from('novel_parts').select('*').eq('novel_id', novelId).order('order_num').order('created_at'),
    ])
    if (nov) setNovel(nov)
    if (ctx) setContexts(ctx)
    if (pts) setParts(pts)
    setLoading(false)
  }

  async function deleteContext(ctxId: string) {
    if (!confirm('¿Eliminar este contexto?')) return
    await supabase.from('novel_contexts').delete().eq('id', ctxId)
    setContexts(prev => prev.filter(c => c.id !== ctxId))
  }

  async function deletePart(partId: string) {
    if (!confirm('¿Eliminar esta parte?')) return
    await supabase.from('novel_parts').delete().eq('id', partId)
    setParts(prev => prev.filter(p => p.id !== partId))
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
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <Link to="/novels" className="text-white/40 hover:text-white/60 text-sm transition-colors mb-2 inline-flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Novelas
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">{novel.title}</h1>
          {novel.description && (
            <p className="text-white/40 text-sm mt-1">{novel.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {parts.length > 0 && (
            <Link
              to={`/novel/${novel.id}/read`}
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-amber-700/80 hover:bg-amber-700 text-amber-100 rounded-xl font-medium text-sm transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="hidden sm:inline">Leer novela</span>
            </Link>
          )}
          <button
            onClick={() => tab === 'contexts' ? setShowContextModal(true) : setShowPartModal(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium text-sm transition-colors"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">{tab === 'contexts' ? 'Añadir contexto' : 'Añadir parte'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl w-fit mb-6">
        <button
          onClick={() => setTab('contexts')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'contexts'
              ? 'bg-[#1a1a22] text-white shadow'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          Contextos
          <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${tab === 'contexts' ? 'bg-amber-400/20 text-amber-300' : 'bg-white/5 text-white/30'}`}>
            {contexts.length}
          </span>
        </button>
        <button
          onClick={() => setTab('parts')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'parts'
              ? 'bg-[#1a1a22] text-white shadow'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          Partes
          <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${tab === 'parts' ? 'bg-violet-400/20 text-violet-300' : 'bg-white/5 text-white/30'}`}>
            {parts.length}
          </span>
        </button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contexts.map((ctx, i) => (
              <TextCard
                key={ctx.id}
                label={`Contexto ${i + 1}`}
                title={ctx.title}
                content={ctx.content}
                onEdit={() => setEditingContext(ctx)}
                onDelete={() => deleteContext(ctx.id)}
                accent="bg-amber-400/10 text-amber-300"
              />
            ))}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {parts.map((part, i) => (
              <TextCard
                key={part.id}
                label={`Parte ${i + 1}`}
                title={part.title}
                content={part.content}
                onEdit={() => setEditingPart(part)}
                onDelete={() => deletePart(part.id)}
                accent="bg-violet-400/10 text-violet-300"
              />
            ))}
          </div>
        )
      )}

      {showContextModal && (
        <NewContextModal
          novelId={novel.id}
          orderNum={contexts.length + 1}
          onClose={() => setShowContextModal(false)}
          onCreated={ctx => setContexts(prev => [...prev, ctx])}
        />
      )}
      {showPartModal && (
        <NewPartModal
          novelId={novel.id}
          orderNum={parts.length + 1}
          onClose={() => setShowPartModal(false)}
          onCreated={part => setParts(prev => [...prev, part])}
        />
      )}
      {editingContext && (
        <EditContextModal
          context={editingContext}
          orderNum={contexts.findIndex(c => c.id === editingContext.id) + 1}
          onClose={() => setEditingContext(null)}
          onUpdated={updated => {
            setContexts(prev => prev.map(c => c.id === updated.id ? updated : c))
            setEditingContext(null)
          }}
        />
      )}
      {editingPart && (
        <EditPartModal
          part={editingPart}
          orderNum={parts.findIndex(p => p.id === editingPart.id) + 1}
          onClose={() => setEditingPart(null)}
          onUpdated={updated => {
            setParts(prev => prev.map(p => p.id === updated.id ? updated : p))
            setEditingPart(null)
          }}
        />
      )}
    </Layout>
  )
}
