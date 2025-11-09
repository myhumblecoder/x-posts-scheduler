// Simple in-memory layout store for MVP. Stores layout per 'space' (global default).
// If environment requests SQLite, delegate to sqlite-backed implementation
if (process.env.USE_FILE_DB === '1') {
  // eslint-disable-next-line global-require
  module.exports = require('./layout_service_file')
} else if (process.env.USE_SQLITE === '1') {
  // eslint-disable-next-line global-require
  module.exports = require('./layout_service_sqlite')
} else {
  const layouts = new Map();

  function getLayout(space = 'default') {
    return layouts.get(space) || [];
  }

  function saveLayout(entries, space = 'default') {
    // entries: array of { id, x?, y?, order? }
    if (!Array.isArray(entries)) throw new Error('Invalid layout');
    layouts.set(space, entries);
    return entries;
  }

  module.exports = { getLayout, saveLayout, _layouts: layouts };
}
