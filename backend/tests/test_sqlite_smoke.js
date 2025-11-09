const path = require('path')
const fs = require('fs')
let Database
try {
  Database = require('better-sqlite3')
} catch (err) {
  // If better-sqlite3 is not installed in this environment, skip the smoke test.
  // This keeps the lightweight test runner stable in environments where native
  // modules can't be compiled. The test will be a noop in that case.
  // eslint-disable-next-line no-console
  console.warn('better-sqlite3 not available; skipping SQLite smoke-test')
}
const supertest = require('supertest')

// Test harness expects exported `run` function
module.exports.run = async function () {
  // Use a dedicated temp DB path so CI/runs remain isolated
  const DB_DIR = path.resolve(__dirname, '../tmp')
  fs.mkdirSync(DB_DIR, { recursive: true })
  const dbPath = path.join(DB_DIR, `smoke-${Date.now()}.db`)

  // Set env before requiring server so services pick up USE_SQLITE
  process.env.USE_SQLITE = '1'
  process.env.SQLITE_DB_PATH = dbPath

  // Ensure db and schema (skip if Database not available)
  if (!Database) {
    console.warn('Skipping SQLite smoke-test because better-sqlite3 is not installed')
    return
  }
  const db = new Database(dbPath)
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

  db.prepare(`
  CREATE TABLE IF NOT EXISTS layout_entries (
    space TEXT,
    id TEXT,
    ord INTEGER,
    PRIMARY KEY (space, id)
  )
  `).run()

  // Seed one scheduled post and two layout entries
  const now = new Date()
  const scheduledIso = new Date(now.getTime() + 1000 * 60).toISOString() // 1 minute in future
  const insert = db.prepare(`INSERT INTO posts (id, content_text, status, scheduled_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`)
  insert.run('smoke-1', 'smoke post', 'SCHEDULED', scheduledIso, now.toISOString(), now.toISOString())

  const insLayout = db.prepare('INSERT OR REPLACE INTO layout_entries (space, id, ord) VALUES (?, ?, ?)')
  insLayout.run('default', 'tile-a', 0)
  insLayout.run('default', 'tile-b', 1)

  // require the server AFTER setting env so it loads sqlite-backed services
  const srv = require('../src/index')
  // start server (use ephemeral port 0 so OS chooses)
  const server = srv.startServer(0)

  // determine port in use
  const port = server.address().port

  const request = supertest(`http://localhost:${port}`)

  // Call /api/scheduled, should include our seeded scheduled post
  const resScheduled = await request.get('/api/scheduled').expect(200)
  if (!Array.isArray(resScheduled.body)) throw new Error('/api/scheduled did not return array')
  const found = resScheduled.body.find(p => p.id === 'smoke-1')
  if (!found) throw new Error('Seeded scheduled post not returned by /api/scheduled')

  // Call /api/layout and expect two entries
  const resLayout = await request.get('/api/layout').expect(200)
  if (!Array.isArray(resLayout.body)) throw new Error('/api/layout did not return array')
  if (resLayout.body.length !== 2) throw new Error('Expected 2 layout entries from /api/layout')

  // Cleanup: stop server and remove DB file
  srv.stopServer()
  db.close()
  try { fs.unlinkSync(dbPath) } catch (e) { /* ignore */ }
}
