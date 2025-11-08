import React, { useEffect, useRef, useState } from 'react'
import Tile from '../components/Tile'
import { getScheduled, cancelPost, runNow, createPost, getLayout, saveLayout } from '../api'

type Item = { id: string; content_text?: string; scheduled_at?: string | null }

export default function Canvas() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [layout, setLayout] = useState<Record<string, any>[]>([])
  const [dragId, setDragId] = useState<string | null>(null)
  const [newText, setNewText] = useState('')
  const [newWhen, setNewWhen] = useState('')
  const saveTimer = useRef<number | null>(null)

  async function refresh() {
    setLoading(true)
    try {
      const s = await getScheduled()
      // Map backend post shape to Item
      const mapped = s.map((p: any) => ({ id: p.id, content_text: p.content_text, scheduled_at: p.scheduled_at }))
      // fetch saved layout and merge
      try {
        const saved = await getLayout()
        setLayout(saved || [])
        // merge positions if available
        const merged = mapped.map((m: any) => {
          const pos = (saved || []).find((x: any) => x.id === m.id)
          return { ...m, layout: pos || null }
        })
        setItems(merged)
      } catch (e) {
        setItems(mapped)
      }
    } catch (err) {
      console.error('failed to load scheduled', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  async function onRemove(id: string) {
    try {
      await cancelPost(id)
    } catch (err) {
      console.error('cancel failed', err)
    }
    await refresh()
  }

  function onDragStart(e: React.DragEvent, id: string) {
    setDragId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function onDrop(e: React.DragEvent, overId: string) {
    e.preventDefault()
    if (!dragId) return
    if (dragId === overId) return
    // Reorder items and schedule a debounced save of layout
    setItems((prev) => {
      const from = prev.findIndex((p) => p.id === dragId)
      const to = prev.findIndex((p) => p.id === overId)
      if (from === -1 || to === -1) return prev
      const copy = prev.slice()
      const [moved] = copy.splice(from, 1)
      copy.splice(to, 0, moved)

      // schedule debounced save
      scheduleSaveLayout(copy)

      return copy
    })
    setDragId(null)
  }

  function onDragOver(e: React.DragEvent) { e.preventDefault() }

  async function onRunNow() {
    try {
      await runNow()
      await refresh()
    } catch (err) {
      console.error('run-now failed', err)
    }
  }

  async function onSaveLayout() {
    // create an ordered layout payload based on current items order
    const entries = items.map((it, idx) => ({ id: it.id, order: idx }))
    try {
      await saveLayout(entries)
      setLayout(entries)
    } catch (err) {
      console.error('save layout failed', err)
    }
  }

  function scheduleSaveLayout(currentItems: any[]) {
    // clear any pending timer
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current)
      saveTimer.current = null
    }

    // schedule save after 500ms
    saveTimer.current = window.setTimeout(async () => {
      const entries = currentItems.map((it, idx) => ({ id: it.id, order: idx }))
      try {
        await saveLayout(entries)
        setLayout(entries)
      } catch (err) {
        console.error('auto save layout failed', err)
      }
      saveTimer.current = null
    }, 500)
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current)
        saveTimer.current = null
      }
    }
  }, [])

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createPost({ text: newText, scheduledAt: newWhen || null })
      setNewText('')
      setNewWhen('')
      await refresh()
    } catch (err) {
      console.error('create failed', err)
    }
  }

  return (
    <section className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Canvas</h2>
        <div className="space-x-2">
          <button onClick={refresh} className="px-3 py-1 rounded bg-slate-100">Refresh</button>
          <button onClick={onRunNow} className="btn">Run now</button>
          <button onClick={onSaveLayout} className="px-3 py-1 rounded bg-slate-100">Save layout</button>
        </div>
      </div>

      <form onSubmit={onCreate} className="card mb-4">
        <label className="block mb-2">
          Text
          <input className="w-full border rounded p-1 mt-1" value={newText} onChange={(e) => setNewText(e.target.value)} />
        </label>
        <label className="block mb-2">
          Schedule (optional)
          <input type="datetime-local" className="w-full border rounded p-1 mt-1" value={newWhen} onChange={(e) => setNewWhen(e.target.value)} />
        </label>
        <div>
          <button type="submit" className="btn">Create & schedule</button>
        </div>
      </form>

      {loading ? <div>Loading...</div> : (
        <div className="grid grid-cols-2 gap-4">
          {items.length === 0 && <div className="text-sm text-gray-500">No scheduled posts</div>}
          {items.map((it) => (
            <div
              key={it.id}
              draggable
              onDragStart={(e) => onDragStart(e, it.id)}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, it.id)}
            >
              <Tile id={it.id} title={it.content_text} caption={it.scheduled_at ? new Date(it.scheduled_at).toLocaleString() : ''} onRemove={onRemove} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
