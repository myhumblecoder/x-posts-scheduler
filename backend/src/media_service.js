const { v4: uuidv4 } = (() => {
  try { return require('uuid'); } catch (e) { return { v4: () => 'id-' + Math.random().toString(36).slice(2,10) }; }
})();

// Simple in-memory media store for MVP (T026–T030)
const _mediaStore = new Map(); // id -> { id, postId, type, storage_ref, meta }

function generateId() {
  if (typeof uuidv4 === 'function') return uuidv4();
  return 'm-' + Math.random().toString(36).slice(2,10);
}

function uploadMedia(postId, bufferOrData, meta = {}) {
  const id = generateId();
  const storage_ref = `mem://${id}`;
  const item = Object.assign({ id, postId, storage_ref, created_at: new Date().toISOString() }, meta);
  _mediaStore.set(id, item);
  return item;
}

function listMediaForPost(postId) {
  const out = [];
  for (const m of _mediaStore.values()) {
    if (m.postId === postId) out.push(m);
  }
  return out;
}

function deleteMedia(id) {
  return _mediaStore.delete(id);
}

module.exports = {
  uploadMedia,
  listMediaForPost,
  deleteMedia,
  _mediaStore,
};
