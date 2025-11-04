// Minimal retry service for MVP
const _retryStore = new Map(); // postId -> { attempts, scheduled }

function scheduleRetry(postId, opts = {}) {
  const entry = { attempts: opts.attempts || 0, scheduled: true, last_error: null };
  _retryStore.set(postId, entry);
  return entry;
}

function performRetries() {
  // For MVP: iterate and mark scheduled=false to indicate processed
  for (const [postId, entry] of _retryStore.entries()) {
    if (entry.scheduled) {
      // simplistic: decrement attempts and clear scheduled
      entry.scheduled = false;
      entry.attempts = Math.max(0, (entry.attempts || 0) - 1);
    }
  }
}

function getRetryStatus(postId) {
  return _retryStore.get(postId) || null;
}

module.exports = {
  scheduleRetry,
  performRetries,
  getRetryStatus,
  _retryStore,
};
