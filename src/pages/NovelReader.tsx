import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Novel, NovelPart } from '../types'

// ── Temas ──────────────────────────────────────────────────────────────────
const THEMES = {
  retro: {
    label: 'Retro',
    bg: '#0f0f13',
    surface: '#1a1a22',
    text: '#e2d9c8',
    muted: '#6b6375',
    accent: '#a78bfa',
    border: 'rgba(255,255,255,0.08)',
    heading: '#f3ede3',
  },
  amber: {
    label: 'Ámbar',
    bg: '#0d0900',
    surface: '#1a1100',
    text: '#e8a820',
    muted: '#8a6010',
    accent: '#f59e0b',
    border: 'rgba(245,158,11,0.12)',
    heading: '#fbbf24',
  },
  sepia: {
    label: 'Sepia',
    bg: '#140e08',
    surface: '#1e1610',
    text: '#c9a880',
    muted: '#7a5c38',
    accent: '#d4956a',
    border: 'rgba(212,149,106,0.12)',
    heading: '#ddb896',
  },
  slate: {
    label: 'Pizarra',
    bg: '#0a0e14',
    surface: '#131b25',
    text: '#94b8d4',
    muted: '#3d5a73',
    accent: '#60a5fa',
    border: 'rgba(96,165,250,0.10)',
    heading: '#bdd4e8',
  },
} as const

type ThemeKey = keyof typeof THEMES

export default function NovelReader() {
  const { id } = useParams<{ id: string }>()
  const [novel, setNovel] = useState<Novel | null>(null)
  const [parts, setParts] = useState<NovelPart[]>([])
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState<ThemeKey>('retro')
  const [showChapters, setShowChapters] = useState(false)
  const [showThemes, setShowThemes] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const chapterRefs = useRef<(HTMLElement | null)[]>([])
  const t = THEMES[theme]

  useEffect(() => {
    if (id) fetchData(id)
  }, [id])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Cierra paneles al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-panel]')) {
        setShowChapters(false)
        setShowThemes(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function fetchData(novelId: string) {
    const [{ data: nov }, { data: pts }] = await Promise.all([
      supabase.from('novels').select('*').eq('id', novelId).single(),
      supabase.from('novel_parts').select('*').eq('novel_id', novelId).order('order_num').order('created_at'),
    ])
    if (nov) setNovel(nov)
    if (pts) setParts(pts)
    setLoading(false)
  }

  function scrollToChapter(index: number) {
    chapterRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setShowChapters(false)
  }

  if (loading) {
    return (
      <div style={{ background: t.bg }} className="min-h-svh flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/40 animate-spin" />
      </div>
    )
  }

  if (!novel) {
    return (
      <div style={{ background: t.bg }} className="min-h-svh flex flex-col items-center justify-center gap-4">
        <p style={{ color: t.muted, fontFamily: 'Lora, Georgia, serif' }}>Novela no encontrada</p>
        <Link to="/novels" style={{ color: t.accent }} className="text-sm underline">← Volver</Link>
      </div>
    )
  }

  return (
    <div style={{ background: t.bg, minHeight: '100svh' }}>

      {/* ── Barra superior ── */}
      <div
        style={{
          background: t.surface,
          borderBottom: `1px solid ${t.border}`,
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
        className="px-4 py-3 flex items-center gap-3"
      >
        {/* Volver */}
        <Link
          to={`/novel/${id}`}
          style={{ color: t.muted }}
          className="flex items-center gap-1 text-sm hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline" style={{ fontFamily: 'Lora, Georgia, serif' }}>Volver</span>
        </Link>

        {/* Título */}
        <p
          className="flex-1 text-sm font-medium truncate text-center"
          style={{ color: t.heading, fontFamily: 'Lora, Georgia, serif' }}
        >
          {novel.title}
        </p>

        {/* Botones derecha */}
        <div className="flex items-center gap-1 flex-shrink-0">

          {/* Selector de capítulos */}
          <div data-panel className="relative">
            <button
              onClick={() => { setShowChapters(v => !v); setShowThemes(false) }}
              style={{
                color: showChapters ? t.accent : t.muted,
                background: showChapters ? `${t.accent}18` : 'transparent',
                border: `1px solid ${showChapters ? t.accent + '40' : t.border}`,
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h8" />
              </svg>
              <span className="hidden sm:inline">Capítulos</span>
            </button>

            {showChapters && (
              <div
                style={{ background: t.surface, border: `1px solid ${t.border}` }}
                className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-2xl overflow-hidden z-50"
              >
                <div style={{ borderBottom: `1px solid ${t.border}` }} className="px-3 py-2">
                  <p className="text-xs font-medium" style={{ color: t.muted }}>
                    {parts.length} {parts.length === 1 ? 'parte' : 'partes'}
                  </p>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {parts.map((part, i) => (
                    <button
                      key={part.id}
                      onClick={() => scrollToChapter(i)}
                      style={{ borderBottom: `1px solid ${t.border}` }}
                      className="w-full text-left px-3 py-2.5 flex items-center gap-2 hover:opacity-70 transition-opacity"
                    >
                      <span
                        className="text-xs font-mono flex-shrink-0 w-6 text-center"
                        style={{ color: t.accent }}
                      >
                        {i + 1}
                      </span>
                      <span
                        className="text-sm truncate"
                        style={{ color: t.text, fontFamily: 'Lora, Georgia, serif' }}
                      >
                        {part.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selector de tema */}
          <div data-panel className="relative">
            <button
              onClick={() => { setShowThemes(v => !v); setShowChapters(false) }}
              style={{
                color: showThemes ? t.accent : t.muted,
                background: showThemes ? `${t.accent}18` : 'transparent',
                border: `1px solid ${showThemes ? t.accent + '40' : t.border}`,
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <span className="hidden sm:inline">Tema</span>
            </button>

            {showThemes && (
              <div
                style={{ background: t.surface, border: `1px solid ${t.border}` }}
                className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-2xl overflow-hidden z-50 p-2 flex flex-col gap-1"
              >
                {(Object.entries(THEMES) as [ThemeKey, typeof THEMES[ThemeKey]][]).map(([key, th]) => (
                  <button
                    key={key}
                    onClick={() => { setTheme(key); setShowThemes(false) }}
                    style={{
                      background: key === theme ? `${t.accent}18` : 'transparent',
                      border: `1px solid ${key === theme ? t.accent + '50' : 'transparent'}`,
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg w-full text-left transition-all"
                  >
                    {/* Swatch doble */}
                    <div className="flex-shrink-0 flex rounded overflow-hidden w-7 h-5 border border-white/10">
                      <div style={{ background: th.bg }} className="flex-1" />
                      <div style={{ background: th.text }} className="flex-1" />
                    </div>
                    <span className="text-sm" style={{ color: key === theme ? t.accent : t.muted }}>
                      {th.label}
                    </span>
                    {key === theme && (
                      <svg className="w-3 h-3 ml-auto flex-shrink-0" style={{ color: t.accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-14">

        {/* Portada */}
        <div className="text-center mb-16">
          <h1
            className="text-3xl sm:text-4xl font-semibold leading-tight"
            style={{ color: t.heading, fontFamily: 'Lora, Georgia, serif' }}
          >
            {novel.title}
          </h1>
          {novel.description && (
            <p
              className="mt-4 text-base italic"
              style={{ color: t.muted, fontFamily: 'Lora, Georgia, serif' }}
            >
              {novel.description}
            </p>
          )}
          <div className="mt-10 flex items-center gap-3 justify-center">
            <div className="h-px flex-1 max-w-20" style={{ background: t.border }} />
            <span style={{ color: t.accent }} className="text-lg opacity-60">❧</span>
            <div className="h-px flex-1 max-w-20" style={{ background: t.border }} />
          </div>
        </div>

        {/* Partes */}
        {parts.length === 0 ? (
          <p
            className="text-center italic"
            style={{ color: t.muted, fontFamily: 'Lora, Georgia, serif' }}
          >
            Esta novela todavía no tiene partes.
          </p>
        ) : (
          <div className="flex flex-col gap-16">
            {parts.map((part, i) => (
              <section
                key={part.id}
                ref={el => { chapterRefs.current[i] = el }}
                style={{ scrollMarginTop: '64px' }}
              >
                {/* Encabezado */}
                <div className="text-center mb-8">
                  <p
                    className="text-xs tracking-widest uppercase mb-2"
                    style={{ color: t.accent, opacity: 0.7, fontFamily: 'Lora, Georgia, serif', letterSpacing: '0.2em' }}
                  >
                    Parte {i + 1}
                  </p>
                  <h2
                    className="text-xl sm:text-2xl font-semibold"
                    style={{ color: t.heading, fontFamily: 'Lora, Georgia, serif' }}
                  >
                    {part.title}
                  </h2>
                </div>

                {/* Texto */}
                <p
                  className="whitespace-pre-wrap break-words"
                  style={{
                    color: t.text,
                    fontFamily: 'Lora, Georgia, serif',
                    fontSize: 'clamp(1rem, 2vw, 1.1rem)',
                    lineHeight: '1.9',
                  }}
                >
                  {part.content}
                </p>

                {/* Separador */}
                {i < parts.length - 1 && (
                  <div className="mt-16 flex items-center gap-3 justify-center">
                    <div className="h-px flex-1" style={{ background: t.border }} />
                    <span style={{ color: t.accent, opacity: 0.4 }} className="text-sm">✦</span>
                    <div className="h-px flex-1" style={{ background: t.border }} />
                  </div>
                )}
              </section>
            ))}

            {/* Fin */}
            <div className="text-center pt-4 pb-10">
              <div className="flex items-center gap-3 justify-center mb-6">
                <div className="h-px flex-1 max-w-20" style={{ background: t.border }} />
                <span style={{ color: t.accent }} className="text-lg opacity-50">❧</span>
                <div className="h-px flex-1 max-w-20" style={{ background: t.border }} />
              </div>
              <p
                className="text-sm italic"
                style={{ color: t.muted, fontFamily: 'Lora, Georgia, serif' }}
              >
                Fin
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Botón volver arriba */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.accent }}
          className="fixed bottom-6 right-6 w-10 h-10 rounded-full shadow-xl flex items-center justify-center transition-colors hover:opacity-80"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  )
}
