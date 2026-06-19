import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Novel, NovelPart } from '../types'

export default function NovelSummaries() {
  const { id } = useParams<{ id: string }>()
  const [novel, setNovel] = useState<Novel | null>(null)
  const [parts, setParts] = useState<NovelPart[]>([])
  const [loading, setLoading] = useState(true)
  const [allCopied, setAllCopied] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (id) fetchData(id)
  }, [id])

  async function fetchData(novelId: string) {
    const [{ data: nov }, { data: pts }] = await Promise.all([
      supabase.from('novels').select('*').eq('id', novelId).single(),
      supabase.from('novel_parts').select('*').eq('novel_id', novelId).order('order_num').order('created_at'),
    ])
    if (nov) setNovel(nov)
    if (pts) setParts(pts)
    setLoading(false)
  }

  const partsWithSummary = parts.filter(p => p.summary?.trim())

  function handleCopyAll() {
    const text = partsWithSummary
      .map((p) => `Parte ${parts.indexOf(p) + 1} — ${p.title}\n${p.summary}`)
      .join('\n\n---\n\n')
    navigator.clipboard.writeText(text).then(() => {
      setAllCopied(true)
      setTimeout(() => setAllCopied(false), 2000)
    })
  }

  function handleCopyOne(part: NovelPart) {
    navigator.clipboard.writeText(part.summary ?? '').then(() => {
      setCopiedId(part.id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  if (loading) {
    return (
      <div className="min-h-svh bg-[#0f0f13] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/40 animate-spin" />
      </div>
    )
  }

  if (!novel) {
    return (
      <div className="min-h-svh bg-[#0f0f13] flex flex-col items-center justify-center gap-4">
        <p className="text-white/40">Novela no encontrada</p>
        <Link to="/novels" className="text-violet-400 text-sm hover:text-violet-300">← Volver</Link>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-[#0f0f13]">
      {/* Barra superior */}
      <div className="sticky top-0 z-40 bg-[#0f0f13]/95 backdrop-blur border-b border-white/8 px-4 py-3 flex items-center gap-3">
        <Link
          to={`/novel/${id}`}
          className="flex items-center gap-1 text-white/40 hover:text-white/70 text-sm transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Volver</span>
        </Link>

        <div className="flex-1 min-w-0">
          <p className="text-white/60 text-xs truncate">{novel.title}</p>
          <p className="text-white font-semibold text-sm leading-tight">Resúmenes</p>
        </div>

        {partsWithSummary.length > 1 && (
          <button
            onClick={handleCopyAll}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all flex-shrink-0 ${
              allCopied
                ? 'bg-green-500/20 text-green-400'
                : 'bg-white/8 hover:bg-white/14 text-white/50 hover:text-white/80'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {allCopied ? 'Copiado todo' : 'Copiar todo'}
          </button>
        )}
      </div>

      {/* Contenido */}
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10">
        {partsWithSummary.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
              <svg className="w-7 h-7 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-white/30 text-sm">Ninguna parte tiene resumen aún</p>
            <Link to={`/novel/${id}`} className="text-violet-400 hover:text-violet-300 text-sm transition-colors">
              Añadir resúmenes →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {partsWithSummary.map(part => {
              const orderNum = parts.indexOf(part) + 1
              return (
                <div
                  key={part.id}
                  className="bg-[#1a1a22] border border-white/8 rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-400/10 text-violet-300 flex-shrink-0">
                        Parte {orderNum}
                      </span>
                      <span className="text-white/60 text-sm font-medium truncate">{part.title}</span>
                    </div>
                    <button
                      onClick={() => handleCopyOne(part)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-all flex-shrink-0 ${
                        copiedId === part.id
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-white/5 hover:bg-white/10 text-white/35 hover:text-white/70'
                      }`}
                    >
                      {copiedId === part.id ? 'Copiado ✓' : 'Copiar'}
                    </button>
                  </div>
                  <p className="text-white/65 text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {part.summary}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
