// Simple in-memory layout store for MVP. Stores layout per 'space' (global default).
const layouts = new Map();

function getLayout(space = 'default') {
  return layouts.get(space) || []
}

function saveLayout(entries, space = 'default') {
  // entries: array of { id, x?, y?, order? }
  if (!Array.isArray(entries)) throw new Error('Invalid layout')
  layouts.set(space, entries)
  return entries
}

module.exports = { getLayout, saveLayout, _layouts: layouts }
