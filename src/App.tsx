import { Link, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Practice from './pages/Practice';

export default function App() {
  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg tracking-tight">
            SQL Practice
          </Link>
          <nav className="text-sm text-neutral-600">
            <Link to="/" className="hover:text-neutral-900">
              Questions
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/practice/:id" element={<Practice />} />
        </Routes>
      </main>
      <footer className="border-t border-neutral-200 text-xs text-neutral-500">
        <div className="max-w-5xl mx-auto px-6 py-4">
          Runs SQLite in your browser via sql.js.
        </div>
      </footer>
    </div>
  );
}
