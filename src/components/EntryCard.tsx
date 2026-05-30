import { useState } from 'react'
import type { Entry } from '../types'

interface Props {
  entry: Entry
  onDelete: (id: string) => void
  onEdit: (entry: Entry) => void
  isDuplicate?: boolean
}

export default function EntryCard({ entry, onDelete, onEdit, isDuplicate }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [copying, setCopying] = useState(false)

  const images = [...(entry.images ?? [])].sort((a, b) =>
    a.created_at < b.created_at ? -1 : 1
  )
  const cover = images[0]
  const extraCount = images.length - 1

  async function copyPrompt() {
    await navigator.clipboard.writeText(entry.prompt)
    setCopying(true)
    setTimeout(() => setCopying(false), 1500)
  }

  return (
    <>
      <div className={`bg-[#1a1a22] border rounded-2xl overflow-hidden transition-colors flex flex-col ${
        isDuplicate
          ? 'border-amber-500/40 hover:border-amber-500/60'
          : 'border-white/8 hover:border-white/15'
      }`}>
        {isDuplicate && (
          <div className="flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 border-b border-amber-500/20">
            <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-amber-400 text-xs font-medium">Prompt duplicado</span>
          </div>
        )}

        <div
          className="relative w-full aspect-video overflow-hidden flex-shrink-0 cursor-zoom-in bg-white/3"
          onClick={() => cover && setLightbox(cover.image_data)}
        >
          {cover ? (
            <>
              <img
                src={cover.image_data}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                alt=""
                loading="lazy"
              />
              {extraCount > 0 && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  +{extraCount}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1">
          {entry.title && (
            <p className="text-white font-medium text-sm mb-2">{entry.title}</p>
          )}
          <div className="flex-1">
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
              onClick={() => onEdit(entry)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-violet-500/20 text-white/30 hover:text-violet-400 transition-all"
            >
              Editar
            </button>
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
