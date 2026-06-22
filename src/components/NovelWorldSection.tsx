import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { NovelPlace, NovelCharacter, NovelCharacterPlace } from '../types'

interface Props {
  novelId: string
}

export default function NovelWorldSection({ novelId }: Props) {
  const [open, setOpen] = useState(false)
  const [places, setPlaces] = useState<NovelPlace[]>([])
  const [characters, setCharacters] = useState<NovelCharacter[]>([])
  const [charPlaces, setCharPlaces] = useState<NovelCharacterPlace[]>([])
  const [loaded, setLoaded] = useState(false)

  const [expandedPlace, setExpandedPlace] = useState<string | null>(null)
  const [editingPlace, setEditingPlace] = useState<string | null>(null)
  const [editingChar, setEditingChar] = useState<string | null>(null)

  // New place form
  const [newPlaceName, setNewPlaceName] = useState('')
  const [newPlaceDesc, setNewPlaceDesc] = useState('')
  const [showNewPlace, setShowNewPlace] = useState(false)

  // New character form
  const [addingCharToPlace, setAddingCharToPlace] = useState<string | null>(null)
  const [newCharName, setNewCharName] = useState('')
  const [newCharDesc, setNewCharDesc] = useState('')
  const [newCharRole, setNewCharRole] = useState('')
  const [newCharAppearance, setNewCharAppearance] = useState('')

  // Edit place form
  const [editPlaceName, setEditPlaceName] = useState('')
  const [editPlaceDesc, setEditPlaceDesc] = useState('')

  // Edit character form
  const [editCharName, setEditCharName] = useState('')
  const [editCharDesc, setEditCharDesc] = useState('')
  const [editCharRole, setEditCharRole] = useState('')
  const [editCharAppearance, setEditCharAppearance] = useState('')

  // Assign existing character to place
  const [assigningToPlace, setAssigningToPlace] = useState<string | null>(null)

  useEffect(() => {
    if (open && !loaded) fetchWorld()
  }, [open])

  async function fetchWorld() {
    const [{ data: p }, { data: c }, { data: cp }] = await Promise.all([
      supabase.from('novel_places').select('*').eq('novel_id', novelId).order('created_at'),
      supabase.from('novel_characters').select('*').eq('novel_id', novelId).order('created_at'),
      supabase.from('novel_character_places').select('*'),
    ])
    if (p) setPlaces(p)
    if (c) setCharacters(c)
    if (cp) {
      const charIds = new Set((c ?? []).map(ch => ch.id))
      setCharPlaces((cp as NovelCharacterPlace[]).filter(r => charIds.has(r.character_id)))
    }
    setLoaded(true)
  }

  function getPlaceCharacters(placeId: string) {
    const charIds = charPlaces.filter(cp => cp.place_id === placeId).map(cp => cp.character_id)
    return characters.filter(c => charIds.includes(c.id))
  }

  function getUnassignedCharacters(placeId: string) {
    const assignedIds = charPlaces.filter(cp => cp.place_id === placeId).map(cp => cp.character_id)
    return characters.filter(c => !assignedIds.includes(c.id))
  }

  // ---- PLACE CRUD ----
  async function createPlace() {
    if (!newPlaceName.trim()) return
    const { data, error } = await supabase
      .from('novel_places')
      .insert({ novel_id: novelId, name: newPlaceName.trim(), description: newPlaceDesc.trim() || null })
      .select()
      .single()
    if (!error && data) {
      setPlaces(prev => [...prev, data])
      setNewPlaceName('')
      setNewPlaceDesc('')
      setShowNewPlace(false)
    }
  }

  async function updatePlace(placeId: string) {
    if (!editPlaceName.trim()) return
    const { error } = await supabase
      .from('novel_places')
      .update({ name: editPlaceName.trim(), description: editPlaceDesc.trim() || null })
      .eq('id', placeId)
    if (!error) {
      setPlaces(prev => prev.map(p => p.id === placeId ? { ...p, name: editPlaceName.trim(), description: editPlaceDesc.trim() || null } : p))
      setEditingPlace(null)
    }
  }

  async function deletePlace(placeId: string) {
    if (!confirm('¿Eliminar este lugar y desasociar sus personajes?')) return
    await supabase.from('novel_places').delete().eq('id', placeId)
    setPlaces(prev => prev.filter(p => p.id !== placeId))
    setCharPlaces(prev => prev.filter(cp => cp.place_id !== placeId))
    if (expandedPlace === placeId) setExpandedPlace(null)
  }

  // ---- CHARACTER CRUD ----
  async function createCharacter(placeId: string) {
    if (!newCharName.trim()) return
    const { data: char, error } = await supabase
      .from('novel_characters')
      .insert({
        novel_id: novelId,
        name: newCharName.trim(),
        description: newCharDesc.trim() || null,
        role: newCharRole.trim() || null,
        appearance: newCharAppearance.trim() || null,
      })
      .select()
      .single()
    if (error || !char) return

    const { data: link } = await supabase
      .from('novel_character_places')
      .insert({ character_id: char.id, place_id: placeId })
      .select()
      .single()

    setCharacters(prev => [...prev, char])
    if (link) setCharPlaces(prev => [...prev, link])
    resetNewCharForm()
  }

  async function updateCharacter(charId: string) {
    if (!editCharName.trim()) return
    const { error } = await supabase
      .from('novel_characters')
      .update({
        name: editCharName.trim(),
        description: editCharDesc.trim() || null,
        role: editCharRole.trim() || null,
        appearance: editCharAppearance.trim() || null,
      })
      .eq('id', charId)
    if (!error) {
      setCharacters(prev => prev.map(c => c.id === charId ? {
        ...c,
        name: editCharName.trim(),
        description: editCharDesc.trim() || null,
        role: editCharRole.trim() || null,
        appearance: editCharAppearance.trim() || null,
      } : c))
      setEditingChar(null)
    }
  }

  async function deleteCharacter(charId: string) {
    if (!confirm('¿Eliminar este personaje?')) return
    await supabase.from('novel_characters').delete().eq('id', charId)
    setCharacters(prev => prev.filter(c => c.id !== charId))
    setCharPlaces(prev => prev.filter(cp => cp.character_id !== charId))
  }

  async function removeCharacterFromPlace(charId: string, placeId: string) {
    await supabase.from('novel_character_places').delete().eq('character_id', charId).eq('place_id', placeId)
    setCharPlaces(prev => prev.filter(cp => !(cp.character_id === charId && cp.place_id === placeId)))
  }

  async function assignCharacterToPlace(charId: string, placeId: string) {
    const { data } = await supabase
      .from('novel_character_places')
      .insert({ character_id: charId, place_id: placeId })
      .select()
      .single()
    if (data) setCharPlaces(prev => [...prev, data])
    setAssigningToPlace(null)
  }

  function resetNewCharForm() {
    setAddingCharToPlace(null)
    setNewCharName('')
    setNewCharDesc('')
    setNewCharRole('')
    setNewCharAppearance('')
  }

  function startEditPlace(place: NovelPlace) {
    setEditingPlace(place.id)
    setEditPlaceName(place.name)
    setEditPlaceDesc(place.description ?? '')
  }

  function startEditChar(char: NovelCharacter) {
    setEditingChar(char.id)
    setEditCharName(char.name)
    setEditCharDesc(char.description ?? '')
    setEditCharRole(char.role ?? '')
    setEditCharAppearance(char.appearance ?? '')
  }

  const inputClass = "w-full bg-black/30 border border-emerald-500/20 rounded-lg px-3 py-2 text-white/80 placeholder-white/20 focus:outline-none focus:border-emerald-500/40 transition-colors text-sm"

  return (
    <div className="mb-6 border border-emerald-500/30 rounded-xl sm:rounded-2xl overflow-hidden bg-emerald-500/5">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-emerald-500/10 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-left">
            <span className="text-sm font-semibold text-emerald-300">Mundo de la Novela</span>
            {!open && places.length > 0 && (
              <p className="text-xs text-white/30 mt-0.5">{places.length} lugar{places.length !== 1 ? 'es' : ''}, {characters.length} personaje{characters.length !== 1 ? 's' : ''}</p>
            )}
            {!open && places.length === 0 && (
              <p className="text-xs text-white/20 italic mt-0.5">Sin lugares definidos</p>
            )}
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-emerald-400/50 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Body */}
      {open && (
        <div className="px-4 pb-4 border-t border-emerald-500/20">
          <p className="text-xs text-emerald-300/60 mt-3 mb-3">
            Define los lugares de tu novela y los personajes que habitan en ellos.
          </p>

          {/* Places list */}
          <div className="space-y-2.5">
            {places.map(place => {
              const placeChars = getPlaceCharacters(place.id)
              const isExpanded = expandedPlace === place.id
              const isEditing = editingPlace === place.id

              return (
                <div key={place.id} className="border border-emerald-500/15 rounded-xl overflow-hidden bg-black/20">
                  {/* Place header */}
                  {isEditing ? (
                    <div className="p-3 space-y-2">
                      <input
                        autoFocus
                        value={editPlaceName}
                        onChange={e => setEditPlaceName(e.target.value)}
                        placeholder="Nombre del lugar"
                        className={inputClass}
                      />
                      <textarea
                        value={editPlaceDesc}
                        onChange={e => setEditPlaceDesc(e.target.value)}
                        placeholder="Descripción del lugar..."
                        rows={2}
                        className={`${inputClass} resize-none`}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => updatePlace(place.id)} className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 rounded-lg text-xs font-medium transition-colors">
                          Guardar
                        </button>
                        <button onClick={() => setEditingPlace(null)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/50 rounded-lg text-xs font-medium transition-colors">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="px-3 py-2.5 flex items-center justify-between cursor-pointer hover:bg-emerald-500/5 transition-colors"
                      onClick={() => setExpandedPlace(isExpanded ? null : place.id)}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <svg className={`w-4 h-4 text-emerald-400/50 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-emerald-200 truncate">{place.name}</span>
                            <span className="text-xs text-white/25 flex-shrink-0">{placeChars.length} pj{placeChars.length !== 1 ? 's' : ''}</span>
                          </div>
                          {place.description && !isExpanded && (
                            <p className="text-xs text-white/25 truncate mt-0.5">{place.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0 ml-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => startEditPlace(place)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button onClick={() => deletePlace(place.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Expanded: description + characters */}
                  {isExpanded && !isEditing && (
                    <div className="border-t border-emerald-500/10 px-3 py-3 space-y-3">
                      {place.description && (
                        <p className="text-xs text-white/40 leading-relaxed italic">{place.description}</p>
                      )}

                      {/* Characters in this place */}
                      {placeChars.length > 0 && (
                        <div className="space-y-2">
                          {placeChars.map(char => (
                            <div key={char.id} className="bg-white/3 border border-white/8 rounded-lg overflow-hidden">
                              {editingChar === char.id ? (
                                <div className="p-2.5 space-y-2">
                                  <input value={editCharName} onChange={e => setEditCharName(e.target.value)} placeholder="Nombre" className={inputClass} autoFocus />
                                  <input value={editCharRole} onChange={e => setEditCharRole(e.target.value)} placeholder="Rol (ej: protagonista, villano...)" className={inputClass} />
                                  <textarea value={editCharAppearance} onChange={e => setEditCharAppearance(e.target.value)} placeholder="Apariencia..." rows={2} className={`${inputClass} resize-none`} />
                                  <textarea value={editCharDesc} onChange={e => setEditCharDesc(e.target.value)} placeholder="Descripción..." rows={2} className={`${inputClass} resize-none`} />
                                  <div className="flex gap-2">
                                    <button onClick={() => updateCharacter(char.id)} className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 rounded-lg text-xs font-medium transition-colors">Guardar</button>
                                    <button onClick={() => setEditingChar(null)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/50 rounded-lg text-xs font-medium transition-colors">Cancelar</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-2.5">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-medium text-white/80">{char.name}</span>
                                        {char.role && (
                                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300/70">{char.role}</span>
                                        )}
                                      </div>
                                      {char.appearance && (
                                        <p className="text-xs text-amber-300/50 mt-1">
                                          <span className="text-amber-300/70 font-medium">Apariencia:</span> {char.appearance}
                                        </p>
                                      )}
                                      {char.description && (
                                        <p className="text-xs text-white/35 mt-1 leading-relaxed">{char.description}</p>
                                      )}
                                    </div>
                                    <div className="flex gap-0.5 flex-shrink-0">
                                      <button onClick={() => startEditChar(char)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/25 hover:text-white/60 transition-colors">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                      </button>
                                      <button onClick={() => removeCharacterFromPlace(char.id, place.id)} title="Quitar de este lugar" className="p-1.5 rounded-lg hover:bg-orange-500/20 text-white/25 hover:text-orange-400 transition-colors">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                      </button>
                                      <button onClick={() => deleteCharacter(char.id)} title="Eliminar personaje" className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/25 hover:text-red-400 transition-colors">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* New character form */}
                      {addingCharToPlace === place.id ? (
                        <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-2.5 space-y-2">
                          <p className="text-xs text-emerald-300/70 font-medium">Nuevo personaje</p>
                          <input value={newCharName} onChange={e => setNewCharName(e.target.value)} placeholder="Nombre *" className={inputClass} autoFocus />
                          <input value={newCharRole} onChange={e => setNewCharRole(e.target.value)} placeholder="Rol (ej: protagonista, villano, mentor...)" className={inputClass} />
                          <textarea value={newCharAppearance} onChange={e => setNewCharAppearance(e.target.value)} placeholder="Apariencia..." rows={2} className={`${inputClass} resize-none`} />
                          <textarea value={newCharDesc} onChange={e => setNewCharDesc(e.target.value)} placeholder="Descripción..." rows={2} className={`${inputClass} resize-none`} />
                          <div className="flex gap-2">
                            <button onClick={() => createCharacter(place.id)} disabled={!newCharName.trim()} className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                              Crear
                            </button>
                            <button onClick={resetNewCharForm} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/50 rounded-lg text-xs font-medium transition-colors">
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : assigningToPlace === place.id ? (
                        <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-2.5 space-y-2">
                          <p className="text-xs text-emerald-300/70 font-medium">Asignar personaje existente</p>
                          {getUnassignedCharacters(place.id).length === 0 ? (
                            <p className="text-xs text-white/30 italic">No hay personajes disponibles para asignar</p>
                          ) : (
                            <div className="space-y-1">
                              {getUnassignedCharacters(place.id).map(char => (
                                <button
                                  key={char.id}
                                  onClick={() => assignCharacterToPlace(char.id, place.id)}
                                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-emerald-500/10 text-white/60 hover:text-white/80 text-xs transition-colors flex items-center gap-2"
                                >
                                  <span className="font-medium">{char.name}</span>
                                  {char.role && <span className="text-white/30">— {char.role}</span>}
                                </button>
                              ))}
                            </div>
                          )}
                          <button onClick={() => setAssigningToPlace(null)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/50 rounded-lg text-xs font-medium transition-colors">
                            Cerrar
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => { resetNewCharForm(); setAssigningToPlace(null); setAddingCharToPlace(place.id) }}
                            className="flex-1 py-1.5 rounded-lg border border-emerald-500/15 hover:border-emerald-500/30 text-emerald-300/60 hover:text-emerald-300 text-xs font-medium transition-colors"
                          >
                            + Nuevo personaje
                          </button>
                          {characters.length > 0 && (
                            <button
                              onClick={() => { resetNewCharForm(); setAddingCharToPlace(null); setAssigningToPlace(place.id) }}
                              className="flex-1 py-1.5 rounded-lg border border-white/8 hover:border-white/20 text-white/40 hover:text-white/60 text-xs font-medium transition-colors"
                            >
                              Asignar existente
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* New place form */}
          {showNewPlace ? (
            <div className="mt-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3 space-y-2">
              <input
                autoFocus
                value={newPlaceName}
                onChange={e => setNewPlaceName(e.target.value)}
                placeholder="Nombre del lugar *"
                className={inputClass}
              />
              <textarea
                value={newPlaceDesc}
                onChange={e => setNewPlaceDesc(e.target.value)}
                placeholder="Descripción del lugar..."
                rows={2}
                className={`${inputClass} resize-none`}
              />
              <div className="flex gap-2">
                <button
                  onClick={createPlace}
                  disabled={!newPlaceName.trim()}
                  className="px-4 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Crear lugar
                </button>
                <button
                  onClick={() => { setShowNewPlace(false); setNewPlaceName(''); setNewPlaceDesc('') }}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/50 rounded-lg text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewPlace(true)}
              className="w-full mt-3 py-2.5 rounded-xl border border-dashed border-emerald-500/20 hover:border-emerald-500/40 text-emerald-300/50 hover:text-emerald-300/80 text-xs font-medium transition-colors"
            >
              + Agregar lugar
            </button>
          )}
        </div>
      )}
    </div>
  )
}
