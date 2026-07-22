import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { NovelPartImage } from '../types'

interface Props {
  partId: string
  orderNum: number
  onClose: () => void
}

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

async function toWebP(file: File, maxDim = 1920): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      let w = img.naturalWidth
      let h = img.naturalHeight
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = Math.round(h * maxDim / w); w = maxDim }
        else { w = Math.round(w * maxDim / h); h = maxDim }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/webp', 0.85))
    }
    img.onerror = reject
    img.src = url
  })
}

export default function PartImagesModal({ partId, orderNum, onClose }: Props) {
  const [images, setImages] = useState<NovelPartImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState<NovelPartImage | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)

  useEffect(() => {
    fetchImages()
  }, [partId])

  async function fetchImages() {
    setLoading(true)
    const { data } = await supabase
      .from('novel_part_images')
      .select('*')
      .eq('part_id', partId)
      .order('created_at', { ascending: false })
    if (data) setImages(data as NovelPartImage[])
    setLoading(false)
  }

  async function uploadFiles(files: File[]) {
    if (!files.length) return
    setUploading(true)
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue
      const webpData = await toWebP(file)
      const { data } = await supabase
        .from('novel_part_images')
        .insert({ part_id: partId, image_data: webpData })
        .select()
        .single()
      if (data) setImages(prev => [data as NovelPartImage, ...prev])
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    uploadFiles(Array.from(e.target.files ?? []))
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault()
    dragCounter.current++
    if (e.dataTransfer.types.includes('Files')) setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragging(false)
    uploadFiles(Array.from(e.dataTransfer.files))
  }

  async function deleteImage(imgId: string) {
    if (!confirm('¿Eliminar esta imagen?')) return
    await supabase.from('novel_part_images').delete().eq('id', imgId)
    setImages(prev => prev.filter(i => i.id !== imgId))
    if (lightbox?.id === imgId) setLightbox(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={uploading ? undefined : onClose} />
      <div
        className="relative bg-[#1a1a22] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90svh]"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-violet-600/10 border-2 border-dashed border-violet-400 rounded-2xl pointer-events-none">
            <p className="text-violet-300 font-semibold text-sm">Suelta para agregar</p>
          </div>
        )}

        {/* Cabecera */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-400/10 text-violet-300 font-medium shrink-0">
              Parte {orderNum}
            </span>
            <h2 className="text-white font-semibold text-base">Imágenes</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-medium transition-colors"
            >
              {uploading ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
              <span className="hidden sm:inline">{uploading ? 'Subiendo…' : 'Adjuntar imágenes'}</span>
              <span className="sm:hidden">{uploading ? 'Subiendo…' : 'Adjuntar'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white flex items-center justify-center transition-all text-base"
            >
              ×
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Cuerpo */}
        <div className="overflow-y-auto flex-1 px-5 sm:px-6 py-5">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-white/10 hover:border-violet-500/40 rounded-xl py-16 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors"
            >
              <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-white/30 text-sm">No hay ilustraciones todavía</p>
              <p className="text-white/25 text-xs">Arrastra imágenes aquí o toca para seleccionar</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map(img => (
                <div
                  key={img.id}
                  className="group relative aspect-square bg-black/20 rounded-xl overflow-hidden cursor-pointer"
                  onClick={() => setLightbox(img)}
                >
                  <img
                    src={img.image_data}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  <button
                    onClick={e => { e.stopPropagation(); deleteImage(img.id) }}
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-lg bg-black/60 text-white/70 hover:text-red-400 flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-all text-sm"
                    title="Eliminar"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
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
              onClick={e => { e.stopPropagation(); downloadAsPng(lightbox.image_data, `parte-${orderNum}-imagen`) }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar
            </button>
          </div>
          <img
            src={lightbox.image_data}
            alt=""
            className="max-w-full max-h-[85vh] rounded-xl object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
