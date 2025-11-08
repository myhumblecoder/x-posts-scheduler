const express = require('express');
const cors = require('cors');
const postService = require('./post_service');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Create a draft and optionally schedule it
app.post('/api/posts', (req, res) => {
  try {
    const { text, scheduledAt } = req.body || {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid `text` field' });
    }

    const post = postService.createDraft(text);
    if (scheduledAt) {
      try {
        postService.schedulePost(post.id, scheduledAt);
      } catch (err) {
        // scheduling failed; return created draft with warning
        return res.status(400).json({ error: 'Failed to schedule', detail: String(err), post });
      }
    }

    return res.status(201).json(post);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.get('/api/posts/:id', (req, res) => {
  const post = postService.getPost(req.params.id);
  if (!post) return res.status(404).json({ error: 'Not found' });
  return res.json(post);
});

// simple endpoint to list scheduled posts due before now (for testing)
app.get('/api/scheduled', (req, res) => {
  const now = new Date();
  const scheduled = postService.listScheduled(now);
  res.json(scheduled);
});

// Demo-only: trigger worker run once (useful when ENABLE_WORKER is not enabled)
app.post('/api/run-now', (req, res) => {
  try {
    const worker = require('./worker');
    const stats = worker.runOnce();
    return res.json({ ok: true, processed: stats.processed, sent: stats.sent, failed: stats.failed });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

let _server = null;
let _worker = null;

function startServer(port = PORT) {
  if (_server) return _server;
  _server = app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend running on http://localhost:${port}`);
  });

  // Optionally start background worker to process scheduled posts
  if (process.env.ENABLE_WORKER === '1' || process.env.ENABLE_WORKER === 'true') {
    try {
      _worker = require('./worker');
      _worker.start();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to start worker:', String(err));
    }
  }
  return _server;
}

function stopServer() {
  if (_worker) {
    try { _worker.stop(); } catch (e) { /* ignore */ }
    _worker = null;
  }
  if (_server) {
    _server.close();
    _server = null;
  }
}

// If run directly, start server immediately
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer, stopServer };

function createServer() {
  return app;
}

module.exports.createServer = createServer;
