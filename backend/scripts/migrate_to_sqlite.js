#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
let Database
try {
  Database = require('better-sqlite3')
} catch (err) {
  console.error('\nError: missing native dependency `better-sqlite3`.')
  console.error('This script requires the optional native module `better-sqlite3` to access the SQLite DB.')
  console.error('\nOptions:')
  console.error('  1) Install the optional dependency locally (recommended for demos):')
  console.error('       cd backend && npm install --no-audit --no-fund --save-optional better-sqlite3')
  console.error('\n  2) If installation fails due to native compilation errors on macOS, ensure Xcode command line tools are installed:')
  console.error('       xcode-select --install')
  console.error('       sudo xcodebuild -license accept')
  console.error('\n  3) Or skip running the migration and use the in-memory stores (default for tests/CI).')
  console.error('\nAfter installing, re-run this script with USE_SQLITE=1.\n')
  process.exit(1)
}

const DB_PATH = process.env.SQLITE_DB_PATH || path.resolve(__dirname, '../../data/app.db')

function usage() {
  console.log('Usage:')
  console.log('  USE_SQLITE=1 node backend/scripts/migrate_to_sqlite.js --seed=path/to/seed.json')
  console.log('  USE_SQLITE=1 node backend/scripts/migrate_to_sqlite.js --export=path/to/export.json')
  console.log('\nIf no --seed or --export is provided this script will noop.')
}

function readJSON(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'))
  } catch (err) {
    console.error('Failed to read JSON:', err.message)
    process.exit(2)
  }
}

function writeJSON(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), 'utf8')
}

function openDb() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
  const db = new Database(DB_PATH)
  return db
}

function ensureSchema(db) {
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
}

function seedDb(db, seed) {
  const posts = Array.isArray(seed.posts) ? seed.posts : []
  const layouts = seed.layouts || {}

  const insertPost = db.prepare(`INSERT OR REPLACE INTO posts
    (id, content_text, content_html_preview, status, scheduled_at, sent_at, remote_post_id, error_code, error_message, created_at, updated_at)
    VALUES (@id,@content_text,@content_html_preview,@status,@scheduled_at,@sent_at,@remote_post_id,@error_code,@error_message,@created_at,@updated_at)`)

  const delLayout = db.prepare('DELETE FROM layout_entries WHERE space = ?')
  const insLayout = db.prepare('INSERT OR REPLACE INTO layout_entries (space, id, ord) VALUES (?, ?, ?)')

  const tx = db.transaction(() => {
    for (const p of posts) {
      // normalize fields
      const row = {
        id: p.id || ('id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8)),
        content_text: p.content_text || p.content || '',
        content_html_preview: p.content_html_preview || null,
        status: p.status || 'DRAFT',
        scheduled_at: p.scheduled_at || null,
        sent_at: p.sent_at || null,
        remote_post_id: p.remote_post_id || null,
        error_code: p.error_code || null,
        error_message: p.error_message || null,
        created_at: p.created_at || new Date().toISOString(),
        updated_at: p.updated_at || new Date().toISOString()
      }
      insertPost.run(row)
    }

    for (const space of Object.keys(layouts)) {
      const entries = Array.isArray(layouts[space]) ? layouts[space] : []
      delLayout.run(space)
      for (let i = 0; i < entries.length; i++) {
        const e = entries[i]
        insLayout.run(space, e.id, e.order == null ? i : e.order)
      }
    }
  })

  tx()
}

function exportDb(db, outPath) {
  const posts = db.prepare('SELECT * FROM posts').all()
  const layoutsRows = db.prepare('SELECT space, id, ord FROM layout_entries ORDER BY space, ord').all()
  const layouts = {}
  for (const r of layoutsRows) {
    layouts[r.space] = layouts[r.space] || []
    layouts[r.space].push({ id: r.id, order: r.ord })
  }
  writeJSON(outPath, { posts, layouts })
}

// --- main
const argv = process.argv.slice(2)
let seedPath = null
let exportPath = null
for (const a of argv) {
  if (a.startsWith('--seed=')) seedPath = a.split('=')[1]
  if (a.startsWith('--export=')) exportPath = a.split('=')[1]
}

if (!seedPath && !exportPath) {
  usage()
  process.exit(0)
}

if (process.env.USE_SQLITE !== '1') {
  console.error('WARNING: recommended to run this with USE_SQLITE=1 to ensure same DB_PATH and behavior.')
}

const db = openDb()
ensureSchema(db)

if (seedPath) {
  if (!fs.existsSync(seedPath)) {
    console.error('Seed file not found:', seedPath)
    process.exit(2)
  }
  const seed = readJSON(seedPath)
  seedDb(db, seed)
  console.log('Seeded DB from', seedPath)
}

if (exportPath) {
  exportDb(db, exportPath)
  console.log('Exported DB to', exportPath)
}

console.log('Done. DB:', DB_PATH)
