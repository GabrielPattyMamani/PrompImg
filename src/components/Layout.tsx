import { NavLink } from 'react-router-dom'

export default function Layout({ children }: { children: React.ReactNode }) {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm px-3 py-1.5 rounded-lg transition-colors ${
      isActive
        ? 'bg-white/10 text-white font-medium'
        : 'text-white/50 hover:text-white hover:bg-white/5'
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
        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={navClass}>Prompts</NavLink>
          <NavLink to="/novels" className={navClass}>Novelas</NavLink>
        </nav>
      </header>
      <main className="flex-1 px-4 sm:px-6 py-6 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  )
}
