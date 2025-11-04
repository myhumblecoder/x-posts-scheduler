import React, { useState } from 'react'
import { createPost } from '../api'

export default function Compose() {
  const [text, setText] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('Sending...')
    try {
      const payload = { text, scheduledAt: scheduledAt || null }
      const res = await createPost(payload)
      setStatus('Success: ' + JSON.stringify(res))
    } catch (err: any) {
      setStatus('Error: ' + (err.message || String(err)))
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

        <div>
          <button type="submit">Schedule</button>
        </div>
      </form>
      {status && <div className="status">{status}</div>}
    </section>
  )
}
