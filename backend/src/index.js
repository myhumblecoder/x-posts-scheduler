const express = require('express');
const cors = require('cors');
const postService = require('./post_service');
const layoutService = require('./layout_service');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Create a draft and optionally schedule it. If the request includes `enhance: true`
// attempt to run the LLM enhancer (demo-only stub) and update the draft before
// returning it so the Canvas shows the enhanced content.
app.post('/api/posts', async (req, res) => {
  try {
    // eslint-disable-next-line no-console
    console.log('[server] POST /api/posts received', req.body && typeof req.body === 'object' ? { text: Boolean(req.body.text), enhance: !!req.body.enhance } : typeof req.body);
    const { text, scheduledAt, enhance } = req.body || {};
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

    if (enhance) {
      try {
        // Lazy-require the LLM service (keeps it optional)
        // eslint-disable-next-line global-require
        const llm = require('./llm_service')
        const enhanced = await llm.generatePreview({ prompt: text, context: { postId: post.id } })
        // Update the stored draft with the enhanced text so UI shows it.
        try {
          postService.saveDraft(post.id, enhanced)
        } catch (errSave) {
          // If save fails, log but continue returning the original post
          // eslint-disable-next-line no-console
          console.error('Failed to save enhanced draft', String(errSave))
        }
      } catch (err) {
        // LLM failed; return created draft but include a warning detail
        // eslint-disable-next-line no-console
        console.error('[server] llm enhancement failed', String(err))
        return res.status(201).json({ post, warning: 'Enhancement failed' })
      }
    }

    return res.status(201).json(postService.getPost(post.id))
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
  try {
    // Return all scheduled posts (upcoming) so the Canvas UI shows scheduled items
    // postService.listScheduled expects a "beforeDate"; pass a far-future date to include all.
    const farFuture = new Date(8640000000000000) // max Date value
    const scheduled = postService.listScheduled(farFuture);
    return res.json(scheduled);
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
});

// Cancel (mark failed) a scheduled post
app.post('/api/posts/:id/cancel', (req, res) => {
  try {
    const id = req.params.id
    const post = postService.getPost(id)
    if (!post) return res.status(404).json({ error: 'Not found' })
    postService.markFailed(id, 'CANCELLED', 'Cancelled by user')
    return res.json(postService.getPost(id))
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
})

// Layout endpoints: get and save layout for the canvas
app.get('/api/layout', (req, res) => {
  try {
    const layout = layoutService.getLayout()
    return res.json(layout)
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
})

app.post('/api/layout', (req, res) => {
  try {
    const entries = req.body
    const saved = layoutService.saveLayout(entries)
    return res.json(saved)
  } catch (err) {
    return res.status(400).json({ error: String(err) })
  }
})

// Demo-only: trigger worker run once (useful when ENABLE_WORKER is not enabled)
app.post('/api/run-now', (req, res) => {
  try {
    const worker = require('./worker');
    // eslint-disable-next-line no-console
    console.log('[server] POST /api/run-now invoked');
    const stats = worker.runOnce();
    // eslint-disable-next-line no-console
    console.log('[server] runOnce stats', stats);
    return res.json({ ok: true, processed: stats.processed, sent: stats.sent, failed: stats.failed });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// LLM generation endpoint. Accepts { prompt, model?, provider?, timeout? }
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, model, provider, timeout } = req.body || {}
    if (!prompt || typeof prompt !== 'string') return res.status(400).json({ error: 'Missing or invalid `prompt`' })
    // Lazy-require so the module remains optional for environments that don't want LLMs
    // eslint-disable-next-line global-require
    const llm = require('./llm_service')
    const text = await llm.generate({ prompt, model, provider, timeout })
    return res.json({ text })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[server] /api/generate error', String(err))
    return res.status(500).json({ error: String(err) })
  }
})

// Small provider health/status endpoint. Returns quick status for the configured
// provider. Query params: ?provider=ollama|openai|stub (optional), ?timeout=ms
app.get('/api/llm/status', async (req, res) => {
  try {
    const provider = req.query.provider || process.env.LLM_PROVIDER || 'ollama'
    // stub is always healthy locally
    if (provider === 'stub') return res.json({ ok: true, provider })

    // Lazy-require LLM module and perform a short generate/ping with a small timeout.
    // This intentionally uses a short timeout so health checks stay quick.
    // eslint-disable-next-line global-require
    const llm = require('./llm_service')
    const timeout = parseInt(req.query.timeout, 10) || (provider === 'ollama' ? 5000 : 3000)
    try {
      // Use a tiny prompt to probe liveness — the provider defaults and llm_service
      // will enforce per-provider timeouts. We pass provider explicitly to avoid env reliance.
      // Note: llm.generate may apply retries/backoff; the timeout helps keep this short.
      // eslint-disable-next-line no-await-in-loop
      await llm.generate({ prompt: 'ping', provider, timeout })
      return res.json({ ok: true, provider })
    } catch (err) {
      return res.status(502).json({ ok: false, provider, error: String(err) })
    }
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
})

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
