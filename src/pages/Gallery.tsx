import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import NewAlbumModal from '../components/NewAlbumModal'
import EditAlbumModal from '../components/EditAlbumModal'
import type { ImageAlbum } from '../types'

export default function Gallery() {
  const [albums, setAlbums] = useState<ImageAlbum[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState<ImageAlbum | null>(null)

  useEffect(() => {
    fetchAlbums()
  }, [])

  async function fetchAlbums() {
    const { data } = await supabase
      .from('image_albums')
      .select('*, album_images(count)')
      .order('created_at', { ascending: false })

    if (!data) {
      setLoading(false)
      return
    }

    // Mostrar álbumes de inmediato sin esperar portadas
    setAlbums(data.map(album => ({
      ...album,
      image_count: album.album_images?.[0]?.count ?? 0,
      cover_image: null as string | null,
    })))
    setLoading(false)

    // Cargar portadas en paralelo en segundo plano
    await Promise.all(
      data.map(async (album) => {
        const { data: imgData } = await supabase
          .from('album_images')
          .select('image_data')
          .eq('album_id', album.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (imgData?.image_data) {
          setAlbums(prev => prev.map(a =>
            a.id === album.id ? { ...a, cover_image: imgData.image_data } : a
          ))
        }
      })
    )
  }

  async function deleteAlbum(id: string) {
    if (!confirm('¿Eliminar esta carpeta y todas sus imágenes?')) return
    await supabase.from('image_albums').delete().eq('id', id)
    setAlbums(prev => prev.filter(a => a.id !== id))
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Galería</h1>
          <p className="text-white/40 text-sm mt-1">
            {albums.length} {albums.length === 1 ? 'carpeta' : 'carpetas'}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva carpeta
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#1a1a22] rounded-2xl aspect-[4/3] animate-pulse" />
          ))}
        </div>
      ) : albums.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
            <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-white/30 text-sm">Todavía no hay carpetas</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-violet-400 hover:text-violet-300 text-sm transition-colors"
          >
            Crear la primera →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {albums.map(album => (
            <div key={album.id} className="group relative bg-[#1a1a22] border border-white/8 rounded-2xl overflow-hidden hover:border-white/20 transition-all">
              <Link to={`/gallery/${album.id}`} className="block">
                <div className="aspect-[16/9] bg-[#12121a] overflow-hidden">
                  {album.cover_image ? (
                    <img
                      src={album.cover_image}
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
                  <h3 className="text-white font-medium text-sm truncate">{album.name}</h3>
                  {album.description && (
                    <p className="text-white/40 text-xs mt-0.5 truncate">{album.description}</p>
                  )}
                  <p className="text-white/25 text-xs mt-2">
                    {album.image_count} {album.image_count === 1 ? 'imagen' : 'imágenes'}
                  </p>
                </div>
              </Link>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => setEditingAlbum(album)}
                  className="w-7 h-7 rounded-lg bg-black/50 text-white/50 hover:text-violet-400 hover:bg-violet-500/20 flex items-center justify-center transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
                  </svg>
                </button>
                <button
                  onClick={() => deleteAlbum(album.id)}
                  className="w-7 h-7 rounded-lg bg-black/50 text-white/50 hover:text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all text-sm"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <NewAlbumModal
          onClose={() => setShowModal(false)}
          onCreated={album => setAlbums(prev => [{ ...album, image_count: 0 }, ...prev])}
        />
      )}

      {editingAlbum && (
        <EditAlbumModal
          album={editingAlbum}
          onClose={() => setEditingAlbum(null)}
          onUpdated={updated => {
            setAlbums(prev => prev.map(a => a.id === updated.id ? { ...a, ...updated } : a))
            setEditingAlbum(null)
          }}
        />
      )}
    </Layout>
  )
}
