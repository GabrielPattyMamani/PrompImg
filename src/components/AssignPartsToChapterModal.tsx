import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { NovelPart } from '../types'

interface Props {
  chapterId: string
  parts: NovelPart[]
  onClose: () => void
  onAssigned: (parts: NovelPart[]) => void
}

export default function AssignPartsToChapterModal({ chapterId, parts, onClose, onAssigned }: Props) {
  const [selectedPartIds, setSelectedPartIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Partes que no están en ningún capítulo
  const availableParts = parts.filter(p => !p.chapter_id)

  function togglePart(partId: string) {
    const newSelected = new Set(selectedPartIds)
    if (newSelected.has(partId)) {
      newSelected.delete(partId)
    } else {
      newSelected.add(partId)
    }
    setSelectedPartIds(newSelected)
  }

  async function handleAssign() {
    if (selectedPartIds.size === 0) return
    setLoading(true)
    setError('')

    try {
      const selectedParts = Array.from(selectedPartIds)
      const { error: err } = await supabase
        .from('novel_parts')
        .update({ chapter_id: chapterId })
        .in('id', selectedParts)

      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      const assignedParts = parts.filter(p => selectedParts.includes(p.id))
      onAssigned(assignedParts)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1a1a22] border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90svh] overflow-y-auto">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-white font-semibold text-lg">Agregar partes existentes al capítulo</h2>
        </div>

        {availableParts.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <p className="text-white/40 text-sm">No hay partes disponibles para agregar</p>
            <p className="text-white/30 text-xs">Todas las partes ya están asignadas a capítulos</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            <p className="text-white/60 text-sm mb-4">{availableParts.length} parte(s) disponible(s)</p>
            {availableParts.map((part, idx) => (
              <label
                key={part.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-white/8 hover:border-white/20 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedPartIds.has(part.id)}
                  onChange={() => togglePart(part.id)}
                  className="w-5 h-5 mt-0.5 accent-violet-500 cursor-pointer flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-400/10 text-violet-300 whitespace-nowrap flex-shrink-0">
                      Parte {idx + 1}
                    </span>
                    <span className="text-white/70 text-sm font-medium line-clamp-1">{part.title}</span>
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed line-clamp-2 break-words">
                    {part.content}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={loading || selectedPartIds.size === 0}
            className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white font-medium transition-colors"
          >
            {loading ? 'Asignando…' : `Agregar ${selectedPartIds.size > 0 ? selectedPartIds.size : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}
