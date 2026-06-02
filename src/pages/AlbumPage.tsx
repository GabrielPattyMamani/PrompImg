import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import EditAlbumModal from '../components/EditAlbumModal'
import type { ImageAlbum, AlbumImage } from '../types'

async function downloadAsPng(imageData: string, filename: string) {
  const img = new Image()
  img.src = imageData
  await new Promise<void>(resolve => { img.onload = () => resolve() })
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  canvas.getContext('2d')!.drawImage(img, 0, 0)
  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = filename.endsWith('.png') ? filename : `${filename}.png`
  a.click()
}

async function toWebP(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      canvas.getContext('2d')!.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/webp', 0.9))
    }
    img.onerror = reject
    img.src = url
  })
}

export default function AlbumPage() {
  const { id } = useParams<{ id: string }>()
  const [album, setAlbum] = useState<ImageAlbum | null>(null)
  const [images, setImages] = useState<AlbumImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState<AlbumImage | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    const [albumRes, imagesRes] = await Promise.all([
      supabase.from('image_albums').select('*').eq('id', id!).single(),
      supabase.from('album_images').select('*').eq('album_id', id!).order('created_at', { ascending: false }),
    ])
    if (albumRes.data) setAlbum(albumRes.data as ImageAlbum)
    if (imagesRes.data) setImages(imagesRes.data as AlbumImage[])
    setLoading(false)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)

    for (const file of files) {
      const webpData = await toWebP(file)
      const name = file.name.replace(/\.[^.]+$/, '')
      const { data } = await supabase
        .from('album_images')
        .insert({ album_id: id!, image_data: webpData, name })
        .select()
        .single()
      if (data) setImages(prev => [data as AlbumImage, ...prev])
    }

    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function deleteImage(imgId: string) {
    await supabase.from('album_images').delete().eq('id', imgId)
    setImages(prev => prev.filter(i => i.id !== imgId))
    if (lightbox?.id === imgId) setLightbox(null)
  }

  if (loading) {
    return (
      <Layout>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-[#1a1a22] rounded-xl animate-pulse" />
          ))}
        </div>
      </Layout>
    )
  }

  if (!album) {
    return (
      <Layout>
        <p className="text-white/40 text-sm">Carpeta no encontrada.</p>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/gallery" className="text-white/40 hover:text-white transition-colors shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-white tracking-tight truncate">{album.name}</h1>
            {album.description && (
              <p className="text-white/40 text-xs mt-0.5 truncate">{album.description}</p>
            )}
          </div>
          <button
            onClick={() => setShowEdit(true)}
            className="shrink-0 w-7 h-7 rounded-lg text-white/30 hover:text-violet-400 hover:bg-violet-500/20 flex items-center justify-center transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
            </svg>
          </button>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-xl font-medium text-sm transition-colors shrink-0"
        >
          {uploading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
          {uploading ? 'Subiendo…' : 'Agregar'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {/* Grid */}
      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
            <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-white/30 text-sm">No hay imágenes todavía</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="text-violet-400 hover:text-violet-300 text-sm transition-colors"
          >
            Agregar la primera →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {images.map(img => (
            <div
              key={img.id}
              className="group relative aspect-square bg-[#12121a] rounded-xl overflow-hidden cursor-pointer"
              onClick={() => setLightbox(img)}
            >
              <img
                src={img.image_data}
                alt={img.name ?? ''}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={e => { e.stopPropagation(); downloadAsPng(img.image_data, img.name ?? 'imagen') }}
                  className="w-7 h-7 rounded-lg bg-black/60 text-white/70 hover:text-white flex items-center justify-center transition-all"
                  title="Descargar PNG"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button
                  onClick={e => { e.stopPropagation(); deleteImage(img.id) }}
                  className="w-7 h-7 rounded-lg bg-black/60 text-white/70 hover:text-red-400 flex items-center justify-center transition-all text-sm"
                  title="Eliminar"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-lg"
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={e => { e.stopPropagation(); downloadAsPng(lightbox.image_data, lightbox.name ?? 'imagen') }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar PNG
            </button>
          </div>
          <img
            src={lightbox.image_data}
            alt={lightbox.name ?? ''}
            className="max-w-full max-h-[85vh] rounded-xl object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {showEdit && (
        <EditAlbumModal
          album={album}
          onClose={() => setShowEdit(false)}
          onUpdated={updated => {
            setAlbum(prev => prev ? { ...prev, ...updated } : prev)
            setShowEdit(false)
          }}
        />
      )}
    </Layout>
  )
}
