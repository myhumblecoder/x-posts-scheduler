const fs = require('fs')
const path = require('path')

const DB_DIR = process.env.FILE_DB_DIR || path.resolve(__dirname, '../../data')
const LAYOUTS_PATH = path.join(DB_DIR, 'layouts.json')

fs.mkdirSync(DB_DIR, { recursive: true })

function readLayouts() {
  try {
    const raw = fs.readFileSync(LAYOUTS_PATH, 'utf8')
    return JSON.parse(raw)
  } catch (e) {
    return {}
  }
}

function writeLayouts(obj) {
  const tmp = LAYOUTS_PATH + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2), 'utf8')
  fs.renameSync(tmp, LAYOUTS_PATH)
}

function getLayout(space = 'default') {
  const layouts = readLayouts()
  return layouts[space] || []
}

function saveLayout(entries, space = 'default') {
  if (!Array.isArray(entries)) throw new Error('Invalid layout')
  const layouts = readLayouts()
  layouts[space] = entries
  writeLayouts(layouts)
  return layouts[space]
}

module.exports = { getLayout, saveLayout }
