import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Toast = { id: string; message: string; type?: 'info' | 'success' | 'error' }

type ToasterContext = {
  toast: (message: string, type?: Toast['type'], ttl?: number) => void
}

const ctx = createContext<ToasterContext | null>(null)

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    // cleanup when unmounting
    return () => setToasts([])
  }, [])

  const toast = (message: string, type: Toast['type'] = 'info', ttl = 4000) => {
    const id = Math.random().toString(36).slice(2, 9)
    const t: Toast = { id, message, type }
    setToasts((s) => [...s, t])
    if (ttl > 0) {
      setTimeout(() => {
        setToasts((s) => s.filter((x) => x.id !== id))
      }, ttl)
    }
  }

  const value = useMemo(() => ({ toast }), [])

  return (
    <ctx.Provider value={value}>
      {children}
      <div aria-live="polite" className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`max-w-sm px-3 py-2 rounded shadow-md text-sm ${t.type === 'success' ? 'bg-green-600 text-white' : t.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ctx.Provider>
  )
}

export function useToaster() {
  const c = useContext(ctx)
  if (!c) {
    // In tests or when provider isn't present, return a no-op toaster to avoid throwing.
    return { toast: (_message: string, _type?: Toast['type']) => {} }
  }
  return c
}

export default ToasterProvider
