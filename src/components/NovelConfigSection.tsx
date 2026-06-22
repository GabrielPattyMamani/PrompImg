import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  novelId: string
  initialConfig: string | null
  onConfigChange: (config: string | null) => void
}

export default function NovelConfigSection({ novelId, initialConfig, onConfigChange }: Props) {
  const [open, setOpen] = useState(false)
  const [config, setConfig] = useState(initialConfig ?? '')
  const [savedConfig, setSavedConfig] = useState(initialConfig ?? '')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleBlur() {
    if (config === savedConfig) return
    setSaving(true)
    const { error } = await supabase
      .from('novels')
      .update({ config: config.trim() || null })
      .eq('id', novelId)
    setSaving(false)
    if (!error) {
      setSavedConfig(config)
      onConfigChange(config.trim() || null)
    }
  }

  function handleCopy() {
    if (!config.trim()) return
    navigator.clipboard.writeText(config).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="mb-6 border border-orange-500/30 rounded-xl sm:rounded-2xl overflow-hidden bg-orange-500/5">
      {/* Header — siempre visible */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-orange-500/10 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="text-left">
            <span className="text-sm font-semibold text-orange-300">Config de Novela</span>
            {!open && config.trim() && (
              <p className="text-xs text-white/30 mt-0.5 line-clamp-1">{config.slice(0, 60)}…</p>
            )}
            {!open && !config.trim() && (
              <p className="text-xs text-white/20 italic mt-0.5">Sin configuración</p>
            )}
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-orange-400/50 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Body — expandible */}
      {open && (
        <div className="px-4 pb-4 border-t border-orange-500/20">
          <p className="text-xs text-orange-300/60 mt-3 mb-3">
            Escribe aquí las reglas, tono, estilo, puntos clave y todo lo que no debe perderse de vista al escribir esta novela.
          </p>
          <textarea
            autoFocus
            value={config}
            onChange={e => setConfig(e.target.value)}
            onBlur={handleBlur}
            placeholder={"Ej:\n- Tono: oscuro y filosófico\n- Protagonista: nunca revela su nombre\n- Evitar: finales felices forzados\n- Punto clave: el reloj aparece en cada capítulo\n- Regla: los diálogos siempre son cortos"}
            rows={8}
            className="w-full bg-black/30 border border-orange-500/20 rounded-lg px-3 py-2.5 text-white/80 placeholder-white/20 focus:outline-none focus:border-orange-500/40 transition-colors resize-none text-sm leading-relaxed"
          />
          <div className="flex items-center justify-between mt-2.5">
            <span className="text-xs italic text-white/25">
              {saving ? 'Guardando…' : config !== savedConfig ? 'Sin guardar' : 'Guardado'}
            </span>
            <button
              onClick={handleCopy}
              disabled={!config.trim()}
              className={`text-xs px-4 py-2 rounded-lg transition-all font-medium ${
                copied
                  ? 'bg-green-500/20 text-green-400'
                  : config.trim()
                  ? 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-300'
                  : 'bg-white/5 text-white/25 cursor-not-allowed'
              }`}
            >
              {copied ? 'Copiado' : 'Copiar config'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
