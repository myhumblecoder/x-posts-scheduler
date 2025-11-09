const path = require('path')
const fs = require('fs')

const DB_PATH = process.env.SQLITE_DB_PATH || path.resolve(__dirname, '../../data/app.db')

// If better-sqlite3 is available use it; otherwise fall back to CLI-based shim
let Database
try {
  // eslint-disable-next-line global-require
  Database = require('better-sqlite3')
} catch (err) {
  // fallback will be wired below
  Database = null
}

// Ensure directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

let db = null
if (Database) {
  db = new Database(DB_PATH)
} else {
  // Defer to CLI shim if native module is unavailable
  // eslint-disable-next-line global-require
  module.exports = require('./post_service_sqlite_cli')
  return
}

// Create table if missing
db.prepare(`
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    content_text TEXT,
    content_html_preview TEXT,
    status TEXT,
    scheduled_at TEXT,
    sent_at TEXT,
    remote_post_id TEXT,
    error_code TEXT,
    error_message TEXT,
    created_at TEXT,
    updated_at TEXT
  )
`).run()

function nowIso() { return new Date().toISOString() }

function generateId() {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8)
}

function createDraft(content_text) {
  const id = generateId()
  const stmt = db.prepare(`INSERT INTO posts (id, content_text, status, created_at, updated_at)
    VALUES (@id, @content_text, 'DRAFT', @created_at, @updated_at)`)
  const now = nowIso()
  stmt.run({ id, content_text, created_at: now, updated_at: now })
  return getPost(id)
}

function saveDraft(id, newContent) {
  const post = getPost(id)
  if (!post) throw new Error('Post not found')
  const now = nowIso()
  db.prepare('UPDATE posts SET content_text = ?, updated_at = ? WHERE id = ?').run(newContent, now, id)
  return getPost(id)
}

function schedulePost(id, when) {
  const post = getPost(id)
  if (!post) throw new Error('Post not found')
  const scheduled = new Date(when)
  if (isNaN(scheduled.getTime())) throw new Error('Invalid date')
  const now = nowIso()
  db.prepare('UPDATE posts SET scheduled_at = ?, status = ?, updated_at = ? WHERE id = ?')
    .run(scheduled.toISOString(), 'SCHEDULED', now, id)
  return getPost(id)
}

function getPost(id) {
  const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(id)
  if (!row) return null
  // convert columns back to expected shape
  return {
    id: row.id,
    content_text: row.content_text,
    content_html_preview: row.content_html_preview,
    status: row.status,
    scheduled_at: row.scheduled_at ? new Date(row.scheduled_at).toISOString() : null,
    sent_at: row.sent_at ? new Date(row.sent_at).toISOString() : null,
    remote_post_id: row.remote_post_id,
    error_code: row.error_code,
    error_message: row.error_message,
    created_at: row.created_at,
    updated_at: row.updated_at
  }
}

function markSent(id, remote_post_id) {
  const post = getPost(id)
  if (!post) throw new Error('Post not found')
  const now = nowIso()
  db.prepare('UPDATE posts SET status = ?, sent_at = ?, remote_post_id = ?, updated_at = ? WHERE id = ?')
    .run('SENT', now, remote_post_id, now, id)
  return getPost(id)
}

function markFailed(id, code, message) {
  const post = getPost(id)
  if (!post) throw new Error('Post not found')
  const now = nowIso()
  db.prepare('UPDATE posts SET status = ?, error_code = ?, error_message = ?, updated_at = ? WHERE id = ?')
    .run('FAILED', code, message, now, id)
  return getPost(id)
}

function listScheduled(beforeDate) {
  const iso = (beforeDate instanceof Date) ? beforeDate.toISOString() : new Date(beforeDate).toISOString()
  const rows = db.prepare('SELECT * FROM posts WHERE status = ? AND scheduled_at IS NOT NULL AND scheduled_at <= ?').all('SCHEDULED', iso)
  return rows.map(row => ({
    id: row.id,
    content_text: row.content_text,
    content_html_preview: row.content_html_preview,
    status: row.status,
    scheduled_at: row.scheduled_at,
    sent_at: row.sent_at,
    remote_post_id: row.remote_post_id,
    error_code: row.error_code,
    error_message: row.error_message,
    created_at: row.created_at,
    updated_at: row.updated_at
  }))
}

module.exports = {
  createDraft,
  saveDraft,
  schedulePost,
  getPost,
  markSent,
  markFailed,
  listScheduled
}
