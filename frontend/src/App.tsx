import React, { useState } from 'react'
import Compose from './pages/Compose'
import Canvas from './pages/Canvas'

export default function App() {
  const [page, setPage] = useState<'compose' | 'canvas'>('compose')
  return (
    <div className="app-root">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">X Post Creator — Demo</h1>
        <p className="text-sm text-gray-600">Minimal demo UI wired to the backend prototype.</p>
        <nav className="mt-3 space-x-2">
          <button onClick={() => setPage('compose')} className="px-2 py-1 rounded bg-slate-100">Compose</button>
          <button onClick={() => setPage('canvas')} className="px-2 py-1 rounded bg-slate-100">Canvas</button>
        </nav>
      </header>
      <main>
        {page === 'compose' ? <Compose /> : <Canvas />}
      </main>
    </div>
  )
}
