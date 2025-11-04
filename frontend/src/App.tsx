import React from 'react'
import Compose from './pages/Compose'

export default function App() {
  return (
    <div className="app-root">
      <header>
        <h1>X Post Creator — Demo</h1>
        <p>Minimal demo UI wired to the backend prototype.</p>
      </header>
      <main>
        <Compose />
      </main>
    </div>
  )
}
