import { useState } from 'react'
import type { Entry } from '../types'

interface Props {
  entry: Entry
  onDelete: (id: string) => void
}

export default function EntryCard({ entry, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [copying, setCopying] = useState(false)

  const images = entry.images ?? []
  const preview = images.slice(0, 4)

  async function copyPrompt() {
    await navigator.clipboard.writeText(entry.prompt)
    setCopying(true)
    setTimeout(() => setCopying(false), 1500)
  }

  return (
    <>
      <div className="bg-[#1a1a22] border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-colors">
        {images.length > 0 && (
          <div className={`grid gap-0.5 ${preview.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {preview.map((img, i) => (
              <div
                key={img.id}
                className={`relative overflow-hidden cursor-zoom-in ${
                  preview.length === 3 && i === 0 ? 'row-span-2' : ''
                }`}
                style={{ aspectRatio: preview.length === 1 ? '16/9' : '1' }}
                onClick={() => setLightbox(img.image_data)}
              >
                <img
                  src={img.image_data}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  alt=""
                  loading="lazy"
                />
                {i === 3 && images.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold text-lg">
                    +{images.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="p-4">
          {entry.title && (
            <p className="text-white font-medium text-sm mb-2">{entry.title}</p>
          )}
          <div className="relative">
            <p
              className={`text-white/60 text-sm font-mono leading-relaxed whitespace-pre-wrap break-words ${
                !expanded && 'line-clamp-3'
              }`}
            >
              {entry.prompt}
            </p>
            {entry.prompt.length > 200 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-violet-400 text-xs mt-1 hover:text-violet-300 transition-colors"
              >
                {expanded ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={copyPrompt}
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
                  Copiar prompt
                </>
              )}
            </button>
            <span className="flex-1" />
            <button
              onClick={() => onDelete(entry.id)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            className="max-w-full max-h-full object-contain rounded-lg"
            alt=""
          />
          <button
            className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl"
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
        </div>
      )}
    </>
  )
}
