// Minimal history service for MVP (T046–T048)
// Keeps a simple in-memory view of posts for history queries.

const _historyStore = new Map(); // postId -> post

function getHistoryForUser(userId, opts = {}) {
  // For MVP return all posts matching userId (if stored)
  const out = [];
  for (const p of _historyStore.values()) {
    if (!userId || p.user_id === userId) out.push(p);
  }
  // simple ordering by created_at desc if present
  out.sort((a,b) => (b.created_at || 0) - (a.created_at || 0));
  if (opts.limit) return out.slice(0, opts.limit);
  return out;
}

function getPostById(postId) {
  return _historyStore.get(postId) || null;
}

function listSentBetween(start, end) {
  const s = start instanceof Date ? start.getTime() : new Date(start).getTime();
  const e = end instanceof Date ? end.getTime() : new Date(end).getTime();
  const out = [];
  for (const p of _historyStore.values()) {
    if (!p.sent_at) continue;
    const t = new Date(p.sent_at).getTime();
    if (t >= s && t <= e) out.push(p);
  }
  return out;
}

module.exports = {
  getHistoryForUser,
  getPostById,
  listSentBetween,
  _historyStore,
};
