const assert = require('assert');
const child = require('child_process');

// Run server in this process by starting/stopping via exported helpers.
process.env.WORKER_DETERMINISTIC = '1';
process.env.ENABLE_WORKER = '0'; // do not auto-start worker

const srv = require('../src/index.js');

function sleepSync(ms) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    // busy wait
  }
}

function curlJson(cmd) {
  try {
    const out = child.execSync(cmd, { encoding: 'utf8' });
    return JSON.parse(out);
  } catch (err) {
    throw new Error('curl failed: ' + String(err));
  }
}

exports.run = function() {
  // start the server explicitly
  console.log('[test_run_now] starting server');
  srv.startServer();
  console.log('[test_run_now] server started');
  // wait for server readiness (poll /health)
  const start = Date.now();
  let ok = false;
  while (Date.now() - start < 5000) {
    try {
      const h = child.execSync('curl -s http://localhost:3000/health', { encoding: 'utf8' });
      const parsed = JSON.parse(h);
      if (parsed && parsed.status === 'ok') { ok = true; break; }
    } catch (e) {
      // ignore and retry
    }
    sleepSync(100);
  }
  if (!ok) throw new Error('server did not become ready');

  const scheduledAt = new Date(Date.now() - 2000).toISOString();
  const payload = JSON.stringify({ text: 'integration run-now test', scheduledAt });

  // create post via HTTP
  console.log('[test_run_now] creating post');
  const createCmd = `curl -s -X POST -H "Content-Type: application/json" -d '${payload}' http://localhost:3000/api/posts`;
  const created = curlJson(createCmd);
  console.log('[test_run_now] created', created && created.id);
  assert(created && created.id, 'created post must have id');
  assert(created.status === 'SCHEDULED', 'created post should be SCHEDULED');

  // trigger worker run once via API
  console.log('[test_run_now] triggering run-now');
  const runCmd = `curl -s -X POST http://localhost:3000/api/run-now`;
  const runRes = curlJson(runCmd);
  console.log('[test_run_now] run-now response', runRes);
  assert(runRes && runRes.ok === true, 'run-now should return ok');

  // fetch the post
  console.log('[test_run_now] fetching post');
  const getCmd = `curl -s http://localhost:3000/api/posts/${created.id}`;
  const fetched = curlJson(getCmd);
  console.log('[test_run_now] fetched post status', fetched && fetched.status);
  assert(fetched.status === 'SENT', 'post should be SENT after run-now');

  // stop server to allow test runner to exit
  console.log('[test_run_now] stopping server');
  srv.stopServer();
  console.log('[test_run_now] server stopped');
};
