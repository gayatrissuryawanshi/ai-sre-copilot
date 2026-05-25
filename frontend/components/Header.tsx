'use client'

export default function Header({
  isWarRoom,
  activePage,
  profileOpen,
  setProfileOpen,
  setIsLoggedIn,
  setActivePage,
  setSelectedTool,
}: any) {
  return (
    <section className="relative z-40 bg-slate-950/85 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-2xl shadow-cyan-500/5 backdrop-blur-xl overflow-visible">
      <div>
        <div className="text-4xl font-black bg-gradient-to-r from-cyan-300 via-purple-300 to-emerald-300 bg-clip-text text-transparent tracking-wide">
          AI SRE COPILOT
        </div>

        <div className="text-sm text-zinc-500 mt-1">
          Autonomous Incident Intelligence Platform • {activePage}
        </div>
      </div>

      <div
        className={`px-6 py-3 rounded-2xl border text-lg ${
          isWarRoom
            ? 'border-red-500/45 bg-red-500/10 text-red-300 animate-pulse shadow-lg shadow-red-500/20'
            : 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300 shadow-lg shadow-emerald-500/10'
        }`}
      >
        {isWarRoom
          ? '🚨 WAR ROOM ACTIVE — P1 Critical'
          : '● LIVE SYSTEM — Monitoring Active'}
      </div>

      <div className="flex items-center gap-3 relative overflow-visible">
        <div className="hidden xl:flex gap-3 text-xs">

          <button
            onClick={() => setSelectedTool('Datadog')}
            className="px-4 py-3 rounded-2xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 transition shadow-lg shadow-cyan-500/10"
          >
            Datadog
          </button>

          <button
            onClick={() => setSelectedTool('Grafana')}
            className="px-4 py-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 transition shadow-lg shadow-emerald-500/10"
          >
            Grafana
          </button>

          <button
            onClick={() => setSelectedTool('New Relic')}
            className="px-4 py-3 rounded-2xl border border-purple-500/25 bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 transition shadow-lg shadow-purple-500/10"
          >
            New Relic
          </button>
        </div>

        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center gap-3 bg-black/45 border border-purple-500/25 rounded-2xl px-3 py-2 shadow-lg shadow-purple-500/10"
        >
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center font-bold text-slate-950">
            G
          </div>

          <div className="text-left">
            <div className="text-xs font-semibold text-purple-200 leading-tight">
              Gayatri S.
            </div>

            <div className="text-[10px] text-zinc-500 leading-tight">s
              SRE Intern
            </div>
          </div>
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-16 w-64 bg-slate-950 border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-500/30 p-3 z-[999999]">

            {[
              'My Assessment',
              'Support',
              'Forgot Password',
              'Project Info',
            ].map((item) => (
              <button
                key={item}
                onClick={() => {
                  if (item === 'Project Info') {
                    setActivePage('Info')
                  }
                }}
                className="w-full text-left px-4 py-3 rounded-2xl text-sm text-zinc-300 hover:bg-purple-500/10 hover:text-purple-200 transition"
              >
                {item}
              </button>
            ))}

            <button
              onClick={() => setIsLoggedIn(false)}
              className="w-full text-left px-4 py-3 rounded-2xl text-sm text-red-300 hover:bg-red-500/10 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </section>
  )
}