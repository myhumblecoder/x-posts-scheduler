const assert = require('assert');
const child = require('child_process');

// Run server in this process by requiring index.js. Ensure deterministic worker behavior.
process.env.WORKER_DETERMINISTIC = '1';
process.env.ENABLE_WORKER = '0'; // do not auto-start worker

// require will start the Express server (listening on PORT)
require('../src/index.js');

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
  // wait briefly for server to be ready
  sleepSync(200);

  const scheduledAt = new Date(Date.now() - 2000).toISOString();
  const payload = JSON.stringify({ text: 'integration run-now test', scheduledAt });

  // create post via HTTP
  const createCmd = `curl -s -X POST -H "Content-Type: application/json" -d '${payload}' http://localhost:3000/api/posts`;
  const created = curlJson(createCmd);
  assert(created && created.id, 'created post must have id');
  assert(created.status === 'SCHEDULED', 'created post should be SCHEDULED');

  // trigger worker run once via API
  const runCmd = `curl -s -X POST http://localhost:3000/api/run-now`;
  const runRes = curlJson(runCmd);
  assert(runRes && runRes.ok === true, 'run-now should return ok');

  // fetch the post
  const getCmd = `curl -s http://localhost:3000/api/posts/${created.id}`;
  const fetched = curlJson(getCmd);
  assert(fetched.status === 'SENT', 'post should be SENT after run-now');
};
