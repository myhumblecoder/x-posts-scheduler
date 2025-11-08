type CreatePostPayload = { text: string; scheduledAt?: string | null }

export async function createPost(payload: CreatePostPayload) {
  const res = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }

  return res.json()
}

export async function getScheduled() {
  const res = await fetch('/api/scheduled')
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getPost(id: string) {
  const res = await fetch(`/api/posts/${id}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function cancelPost(id: string) {
  const res = await fetch(`/api/posts/${id}/cancel`, { method: 'POST' })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function runNow() {
  const res = await fetch('/api/run-now', { method: 'POST' })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getLayout() {
  const res = await fetch('/api/layout')
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function saveLayout(entries: any[]) {
  const res = await fetch('/api/layout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entries),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
