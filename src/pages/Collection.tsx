import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import EntryCard from '../components/EntryCard'
import NewEntryModal from '../components/NewEntryModal'
import EditEntryModal from '../components/EditEntryModal'
import type { Collection as CollectionType, Entry } from '../types'

export default function Collection() {
  const { id } = useParams<{ id: string }>()
  const [collection, setCollection] = useState<CollectionType | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)

  useEffect(() => {
    if (id) fetchData(id)
  }, [id])

  async function fetchData(collId: string) {
    const [{ data: col }, { data: entriesData }] = await Promise.all([
      supabase.from('collections').select('*').eq('id', collId).single(),
      supabase
        .from('entries')
        .select('*, images:entry_images(*)')
        .eq('collection_id', collId)
        .order('created_at', { ascending: false }),
    ])

    if (col) setCollection(col)
    if (entriesData) setEntries(entriesData as Entry[])
    setLoading(false)
  }

  async function deleteEntry(entryId: string) {
    if (!confirm('¿Eliminar este prompt?')) return
    await supabase.from('entries').delete().eq('id', entryId)
    setEntries(prev => prev.filter(e => e.id !== entryId))
  }

  function handleSaved(updated: Entry) {
    setEntries(prev => prev.map(e => e.id === updated.id ? updated : e))
  }

  const duplicatePrompts = useMemo(() => {
    const counts = new Map<string, number>()
    entries.forEach(e => {
      const key = e.prompt.trim().toLowerCase()
      counts.set(key, (counts.get(key) ?? 0) + 1)
    })
    const dupes = new Set<string>()
    counts.forEach((count, key) => { if (count > 1) dupes.add(key) })
    return dupes
  }, [entries])

  if (loading) {
    return (
      <Layout>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#1a1a22] rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      </Layout>
    )
  }

  if (!collection) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-24">
          <p className="text-white/40">Colección no encontrada</p>
          <Link to="/" className="text-violet-400 mt-3 text-sm hover:text-violet-300">
            ← Volver al inicio
          </Link>
        </div>
      </Layout>
    )
  }

  const dupeCount = entries.filter(e => duplicatePrompts.has(e.prompt.trim().toLowerCase())).length

  return (
    <Layout>
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <Link to="/" className="text-white/40 hover:text-white/60 text-sm transition-colors mb-2 inline-flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Colecciones
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">{collection.name}</h1>
          {collection.description && (
            <p className="text-white/40 text-sm mt-1">{collection.description}</p>
          )}
          <p className="text-white/25 text-xs mt-2">
            {entries.length} {entries.length === 1 ? 'prompt' : 'prompts'}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Añadir prompt
        </button>
      </div>

      {dupeCount > 0 && (
        <div className="flex items-center gap-2.5 px-4 py-3 mb-6 bg-amber-500/10 border border-amber-500/25 rounded-xl">
          <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-amber-400 text-sm">
            <span className="font-semibold">{dupeCount} {dupeCount === 1 ? 'prompt duplicado' : 'prompts duplicados'}</span>
            {' '}— revisa las tarjetas marcadas en naranja
          </p>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
            <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-white/30 text-sm">Todavía no hay prompts en esta colección</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-violet-400 hover:text-violet-300 text-sm transition-colors"
          >
            Añadir el primero →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map(entry => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onDelete={deleteEntry}
              onEdit={setEditingEntry}
              isDuplicate={duplicatePrompts.has(entry.prompt.trim().toLowerCase())}
            />
          ))}
        </div>
      )}

      {showModal && (
        <NewEntryModal
          collectionId={collection.id}
          onClose={() => setShowModal(false)}
          onCreated={entry => setEntries(prev => [entry, ...prev])}
        />
      )}

      {editingEntry && (
        <EditEntryModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSaved={handleSaved}
        />
      )}
    </Layout>
  )
}
