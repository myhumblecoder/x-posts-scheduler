import React, { useState } from 'react'
import { createPost } from '../api'
import { useToaster } from '../components/Toaster'

export default function Compose() {
  const [text, setText] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const { toast } = useToaster()
  const [enhance, setEnhance] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('Sending...')
    try {
      const payload = { text, scheduledAt: scheduledAt || null }
      const res = await createPost({ ...payload, enhance })
      setStatus('Success: ' + JSON.stringify(res))
      toast('Post scheduled', 'success')
    } catch (err: any) {
      setStatus('Error: ' + (err.message || String(err)))
      toast('Failed to schedule post', 'error')
    }
  }

  return (
    <section className="compose">
      <form onSubmit={onSubmit}>
        <label>
          Text
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} />
        </label>

        <label>
          Schedule (optional)
          <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
        </label>

        <label className="block mt-2">
          <input type="checkbox" checked={enhance} onChange={(e) => setEnhance(e.target.checked)} />{' '}
          Enhance with AI
        </label>

        <div>
          <button type="submit">Schedule</button>
        </div>
      </form>
      {status && <div className="status">{status}</div>}
    </section>
  )
}
