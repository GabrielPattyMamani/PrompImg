import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import NewNovelModal from '../components/NewNovelModal'
import type { Novel } from '../types'

export default function Novels() {
  const [novels, setNovels] = useState<Novel[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchNovels()
  }, [])

  async function fetchNovels() {
    const { data } = await supabase
      .from('novels')
      .select(`
        *,
        novel_contexts(count),
        novel_chapters(count),
        novel_parts(count)
      `)
      .order('created_at', { ascending: false })

    if (data) {
      setNovels(
        data.map(n => ({
          ...n,
          context_count: n.novel_contexts?.[0]?.count ?? 0,
          chapter_count: n.novel_chapters?.[0]?.count ?? 0,
          part_count: n.novel_parts?.[0]?.count ?? 0,
        }))
      )
    }
    setLoading(false)
  }

  async function deleteNovel(id: string) {
    if (!confirm('¿Eliminar esta novela y todo su contenido?')) return
    await supabase.from('novels').delete().eq('id', id)
    setNovels(prev => prev.filter(n => n.id !== id))
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Mis novelas</h1>
          <p className="text-white/40 text-sm mt-1">
            {novels.length} {novels.length === 1 ? 'novela' : 'novelas'}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva novela
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#1a1a22] rounded-2xl h-36 animate-pulse" />
          ))}
        </div>
      ) : novels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
            <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-white/30 text-sm">Todavía no hay novelas</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-violet-400 hover:text-violet-300 text-sm transition-colors"
          >
            Crear la primera →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {novels.map(novel => (
            <div
              key={novel.id}
              className="group relative bg-[#1a1a22] border border-white/8 rounded-2xl p-5 hover:border-white/20 transition-all"
            >
              <Link to={`/novel/${novel.id}`} className="block">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-medium truncate">{novel.title}</h3>
                    {novel.description && (
                      <p className="text-white/40 text-xs mt-0.5 line-clamp-2">{novel.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-white/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400/60" />
                    {novel.chapter_count} {novel.chapter_count === 1 ? 'capítulo' : 'capítulos'}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-white/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
                    {novel.context_count} {novel.context_count === 1 ? 'contexto' : 'contextos'}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-white/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400/60" />
                    {novel.part_count} {novel.part_count === 1 ? 'parte' : 'partes'}
                  </span>
                </div>
              </Link>
              <button
                onClick={() => deleteNovel(novel.id)}
                className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-black/50 text-white/0 group-hover:text-white/40 hover:!text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all text-sm"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <NewNovelModal
          onClose={() => setShowModal(false)}
          onCreated={novel => setNovels(prev => [{ ...novel, context_count: 0, chapter_count: 0, part_count: 0 }, ...prev])}
        />
      )}
    </Layout>
  )
}
