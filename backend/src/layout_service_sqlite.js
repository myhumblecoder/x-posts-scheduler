const path = require('path')
const fs = require('fs')

const DB_PATH = process.env.SQLITE_DB_PATH || path.resolve(__dirname, '../../data/app.db')

let Database
try {
  // eslint-disable-next-line global-require
  Database = require('better-sqlite3')
} catch (err) {
  Database = null
}

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

if (!Database) {
  // fallback to CLI shim
  module.exports = require('./layout_service_sqlite_cli')
} else {
  const db = new Database(DB_PATH)

  // layout_entries: space TEXT, id TEXT, ord INTEGER
  db.prepare(`
    CREATE TABLE IF NOT EXISTS layout_entries (
      space TEXT,
      id TEXT,
      ord INTEGER,
      PRIMARY KEY (space, id)
    )
  `).run()

  function getLayout(space = 'default') {
    const rows = db.prepare('SELECT id, ord FROM layout_entries WHERE space = ? ORDER BY ord ASC').all(space)
    return rows.map(r => ({ id: r.id, order: r.ord }))
  }

  function saveLayout(entries, space = 'default') {
    if (!Array.isArray(entries)) throw new Error('Invalid layout')
    const del = db.prepare('DELETE FROM layout_entries WHERE space = ?')
    const ins = db.prepare('INSERT OR REPLACE INTO layout_entries (space, id, ord) VALUES (?, ?, ?)')
    const tx = db.transaction((items) => {
      del.run(space)
      for (let i = 0; i < items.length; i++) {
        const e = items[i]
        ins.run(space, e.id, e.order == null ? i : e.order)
      }
    })
    tx(entries)
    return getLayout(space)
  }

  module.exports = { getLayout, saveLayout }
}
