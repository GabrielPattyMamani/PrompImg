import { NavLink } from 'react-router-dom'

export default function Layout({ children }: { children: React.ReactNode }) {
  const desktopNavClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm px-3 py-1.5 rounded-lg transition-colors ${
      isActive
        ? 'bg-white/10 text-white font-medium'
        : 'text-white/50 hover:text-white hover:bg-white/5'
    }`

  const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors text-xs font-medium ${
      isActive ? 'text-violet-400' : 'text-white/40'
    }`

  return (
    <div className="min-h-svh flex flex-col bg-[#0f0f13]">
      <header className="border-b border-white/10 px-4 sm:px-6 py-4 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-white text-sm font-bold">
            P
          </div>
          <span className="text-white font-semibold tracking-tight">PromptVault</span>
        </div>
        {/* Nav desktop */}
        <nav className="hidden sm:flex items-center gap-1">
          <NavLink to="/" end className={desktopNavClass}>Prompts</NavLink>
          <NavLink to="/novels" className={desktopNavClass}>Novelas</NavLink>
          <NavLink to="/gallery" className={desktopNavClass}>Galería</NavLink>
        </nav>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-6 pb-24 sm:pb-6 max-w-7xl w-full mx-auto">
        {children}
      </main>

      {/* Nav mobile — barra inferior */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f0f13]/95 backdrop-blur border-t border-white/10 flex justify-around px-2 pb-safe">
        <NavLink to="/" end className={mobileNavClass}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Prompts
        </NavLink>
        <NavLink to="/novels" className={mobileNavClass}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Novelas
        </NavLink>
        <NavLink to="/gallery" className={mobileNavClass}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Galería
        </NavLink>
      </nav>
    </div>
  )
}
