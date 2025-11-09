const { execFileSync } = require('child_process')
const path = require('path')

const DB_PATH = process.env.SQLITE_DB_PATH || path.resolve(__dirname, '../../data/app.db')

function runSqliteJson(sql) {
  // Use sqlite3 CLI with the -json flag to get JSON output for SELECTs
  // We run a single SQL statement; for safety wrap in quotes
  const cmd = 'sqlite3'
  const args = [DB_PATH, '-json', sql]
  const out = execFileSync(cmd, args, { encoding: 'utf8' })
  return out.trim() === '' ? '[]' : out
}

function runSqliteExec(sql) {
  const cmd = 'sqlite3'
  const args = [DB_PATH, sql]
  execFileSync(cmd, args, { stdio: 'ignore' })
}

module.exports = { DB_PATH, runSqliteJson, runSqliteExec }
