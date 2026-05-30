import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import NewCollectionModal from '../components/NewCollectionModal'
import type { Collection } from '../types'

export default function Home() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchCollections()
  }, [])

  async function fetchCollections() {
    const { data } = await supabase
      .from('collections')
      .select('*, entries(count)')
      .order('created_at', { ascending: false })

    if (data) {
      const enriched = await Promise.all(
        data.map(async (col) => {
          const { data: imgData } = await supabase
            .from('entry_images')
            .select('image_data, entries!inner(collection_id)')
            .eq('entries.collection_id', col.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          return {
            ...col,
            entry_count: col.entries?.[0]?.count ?? 0,
            cover_image: imgData?.image_data ?? null,
          }
        })
      )
      setCollections(enriched)
    }
    setLoading(false)
  }

  async function deleteCollection(id: string) {
    if (!confirm('¿Eliminar esta colección y todos sus prompts?')) return
    await supabase.from('collections').delete().eq('id', id)
    setCollections(prev => prev.filter(c => c.id !== id))
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Mis colecciones</h1>
          <p className="text-white/40 text-sm mt-1">
            {collections.length} {collections.length === 1 ? 'carpeta' : 'carpetas'}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva colección
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#1a1a22] rounded-2xl aspect-[4/3] animate-pulse" />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
            <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-white/30 text-sm">Todavía no hay colecciones</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-violet-400 hover:text-violet-300 text-sm transition-colors"
          >
            Crear la primera →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {collections.map(col => (
            <div key={col.id} className="group relative bg-[#1a1a22] border border-white/8 rounded-2xl overflow-hidden hover:border-white/20 transition-all">
              <Link to={`/collection/${col.id}`} className="block">
                <div className="aspect-[16/9] bg-[#12121a] overflow-hidden">
                  {col.cover_image ? (
                    <img
                      src={col.cover_image}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-white font-medium text-sm truncate">{col.name}</h3>
                  {col.description && (
                    <p className="text-white/40 text-xs mt-0.5 truncate">{col.description}</p>
                  )}
                  <p className="text-white/25 text-xs mt-2">
                    {col.entry_count} {col.entry_count === 1 ? 'prompt' : 'prompts'}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => deleteCollection(col.id)}
                className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/50 text-white/0 group-hover:text-white/50 hover:!text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all text-sm"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <NewCollectionModal
          onClose={() => setShowModal(false)}
          onCreated={col => setCollections(prev => [{ ...col, entry_count: 0 }, ...prev])}
        />
      )}
    </Layout>
  )
}
