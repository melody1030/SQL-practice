import { Link, Route, Routes } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Check,
  Cpu,
  Loader2,
  LogIn,
  LogOut,
} from 'lucide-react';
import Home from './pages/Home';
import Practice from './pages/Practice';
import { useAuth } from './lib/auth';
import { useSyncStatus } from './lib/syncStatus';

export default function App() {
  return (
    <div className="min-h-screen bg-stone-50 text-zinc-950 font-sans antialiased">
      <nav className="sticky top-0 z-40 bg-stone-50 border-b-2 border-zinc-950">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-4">
            <div className="h-6 w-6 bg-zinc-950 flex items-center justify-center">
              <div className="h-2 w-2 bg-stone-50"></div>
            </div>
            <div>
              <h1 className="font-black text-sm uppercase tracking-[0.4em] leading-none">
                SQL.PRACTICE_HUB
              </h1>
              <p className="text-[9px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">
                WASM_ENGINE_ACTIVE
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-10">
            <div className="hidden md:flex gap-8">
              <div className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Activity size={14} /> LATENCY: 0.2ms
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Cpu size={14} /> CORE: v0.1.0
              </div>
              <SyncIndicator />
            </div>
            <AuthButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/practice/:id" element={<Practice />} />
        </Routes>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950 h-10 border-t border-zinc-800 text-stone-50/40">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.4em]">
          <div className="flex items-center gap-10">
            <span>KERNEL: RUNNING</span>
            <div className="hidden sm:flex items-center gap-4">
              <div className="h-1.5 w-1.5 bg-emerald-500"></div>
              <span>READY</span>
            </div>
          </div>
          <div className="flex items-center gap-10">
            <span>SQL_PRACTICE_HUB_v0.1.0</span>
            <span className="hidden sm:inline">SQLITE.WASM_RUNTIME</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SyncIndicator() {
  const status = useSyncStatus();
  if (status.kind === 'idle') {
    return (
      <div className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-zinc-400">
        <div className="h-1.5 w-1.5 bg-zinc-300"></div> SYNC: IDLE
      </div>
    );
  }
  if (status.kind === 'pending') {
    return (
      <div className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-zinc-600">
        <Loader2 size={12} className="animate-spin" /> SYNC…
      </div>
    );
  }
  if (status.kind === 'ok') {
    return (
      <div className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-emerald-700">
        <Check size={12} strokeWidth={3} /> SYNC: OK
      </div>
    );
  }
  return (
    <div
      title={status.message}
      className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-red-600 max-w-[220px]"
    >
      <AlertTriangle size={12} />
      <span className="truncate">SYNC: {status.message}</span>
    </div>
  );
}

function AuthButton() {
  const { user, loading, configured, signIn, signOut } = useAuth();

  if (!configured) {
    return (
      <button
        disabled
        title="Set VITE_FIREBASE_* in .env.local to enable auth"
        className="flex items-center gap-3 bg-zinc-950 text-stone-50 px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-30"
      >
        <LogIn size={14} /> AUTH.OFFLINE
      </button>
    );
  }

  if (loading) {
    return (
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
        AUTH.SYNC…
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={() => {
          void signIn();
        }}
        className="flex items-center gap-3 bg-zinc-950 text-stone-50 px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all"
      >
        <LogIn size={14} /> SIGN_IN
      </button>
    );
  }

  const initial =
    (user.displayName || user.email || '?').charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <div
        title={user.email ?? user.displayName ?? 'signed in'}
        className="h-8 w-8 bg-zinc-950 text-stone-50 flex items-center justify-center text-[11px] font-black"
      >
        {initial}
      </div>
      <button
        onClick={() => {
          void signOut();
        }}
        className="flex items-center gap-2 border-2 border-zinc-950 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-950 hover:text-stone-50 transition-colors"
      >
        <LogOut size={12} /> SIGN_OUT
      </button>
    </div>
  );
}
