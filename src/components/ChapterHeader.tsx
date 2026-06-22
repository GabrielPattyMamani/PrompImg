import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { NovelChapter } from '../types'

interface Props {
  chapter: NovelChapter
  orderNum: number
  isExpanded: boolean
  hasUnassignedParts: boolean
  onToggleExpand: () => void
  onAssignParts: () => void
  onDelete: () => void
  onTitleChange: (newTitle: string) => void
}

export default function ChapterHeader({
  chapter,
  orderNum,
  isExpanded,
  hasUnassignedParts,
  onToggleExpand,
  onAssignParts,
  onDelete,
  onTitleChange,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(chapter.title)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const trimmed = title.trim()
    if (!trimmed || trimmed === chapter.title) {
      setTitle(chapter.title)
      setEditing(false)
      return
    }
    setSaving(true)
    const { error } = await supabase
      .from('novel_chapters')
      .update({ title: trimmed })
      .eq('id', chapter.id)
    setSaving(false)
    if (!error) {
      onTitleChange(trimmed)
    } else {
      setTitle(chapter.title)
    }
    setEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      setTitle(chapter.title)
      setEditing(false)
    }
  }

  return (
    <div className="p-3 sm:p-4 border-b border-white/8 flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-400/10 text-green-300 whitespace-nowrap flex-shrink-0">
            Capítulo {orderNum}
          </span>
          {editing ? (
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              disabled={saving}
              className="flex-1 bg-white/5 border border-green-500/40 rounded px-2 py-0.5 text-white/80 text-xs sm:text-sm font-medium focus:outline-none focus:border-green-400 transition-colors min-w-0"
            />
          ) : (
            <span
              onClick={() => setEditing(true)}
              className="text-white/60 text-xs sm:text-sm font-medium line-clamp-2 flex-1 cursor-pointer hover:text-white/80 transition-colors"
              title="Click para renombrar"
            >
              {chapter.title}
            </span>
          )}
        </div>
        {(chapter.context || chapter.summary) && (
          <div className="flex gap-2 mt-2">
            {chapter.context && <span className="text-xs px-2 py-1 rounded-full bg-blue-400/10 text-blue-300">Contexto</span>}
            {chapter.summary && <span className="text-xs px-2 py-1 rounded-full bg-purple-400/10 text-purple-300">Resumen</span>}
          </div>
        )}
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <button
          onClick={onToggleExpand}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/60 hover:bg-white/10 transition-all text-lg"
          title="Expandir/Contraer"
        >
          {isExpanded ? '−' : '+'}
        </button>
        {isExpanded && hasUnassignedParts && (
          <button
            onClick={onAssignParts}
            className="px-2 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-blue-400 hover:bg-blue-500/20 transition-all text-sm font-medium"
            title="Agregar partes existentes"
          >
            📎
          </button>
        )}
        <button
          onClick={onDelete}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/20 transition-all text-lg"
          title="Eliminar capítulo"
        >
          ×
        </button>
      </div>
    </div>
  )
}
