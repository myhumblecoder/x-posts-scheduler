const { runSqliteJson, runSqliteExec } = require('./sqlite_cli_helper')

function getLayout(space = 'default') {
  const rows = JSON.parse(runSqliteJson(`SELECT id, ord FROM layout_entries WHERE space = '${space}' ORDER BY ord ASC;`))
  return rows.map(r => ({ id: r.id, order: r.ord }))
}

function saveLayout(entries, space = 'default') {
  if (!Array.isArray(entries)) throw new Error('Invalid layout')
  // delete existing and reinsert
  runSqliteExec(`DELETE FROM layout_entries WHERE space = '${space}';`)
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i]
    const ord = (e.order == null) ? i : e.order
    runSqliteExec(`INSERT OR REPLACE INTO layout_entries (space, id, ord) VALUES ('${space}', '${e.id}', ${ord});`)
  }
  return getLayout(space)
}

module.exports = { getLayout, saveLayout }
