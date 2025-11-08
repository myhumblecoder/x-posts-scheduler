const scheduler = require('./scheduler');
const postService = require('./post_service');

// Simple simulated poster: returns a remote id string or throws to simulate failure
function fakePoster(post) {
  // simulate occasional failure for demo (very low chance)
  if (Math.random() < 0.05) {
    throw new Error('simulated poster failure');
  }
  return `remote-${post.id}`;
}

let _interval = null;

function start(options = {}) {
  const intervalSeconds = Number(process.env.WORKER_INTERVAL_SECONDS || options.intervalSeconds || 15);
  if (_interval) return;

  _interval = setInterval(() => {
    try {
      const now = new Date();
      const due = scheduler.pickScheduled(now);
      if (!due || due.length === 0) return;
      // process each due post
      for (const id of due) {
        try {
          const result = scheduler.attemptPost(id, fakePoster);
          // eslint-disable-next-line no-console
          console.log('[worker] attemptPost', id, result);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[worker] error posting', id, String(err));
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[worker] unexpected error', String(err));
    }
  }, Math.max(1000, intervalSeconds * 1000));

  // eslint-disable-next-line no-console
  console.log(`[worker] started (intervalSeconds=${intervalSeconds})`);
}

function stop() {
  if (_interval) {
    clearInterval(_interval);
    _interval = null;
    // eslint-disable-next-line no-console
    console.log('[worker] stopped');
  }
}

module.exports = { start, stop };
