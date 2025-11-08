// Node script (async) to exercise the /api/run-now flow for integration testing.
(async () => {
  try {
    process.env.WORKER_DETERMINISTIC = '1';
    process.env.ENABLE_WORKER = '0';
    const srv = require('../src/index.js');
    srv.startServer();

    // wait briefly for server to start
    await new Promise(r => setTimeout(r, 200));

    const scheduledAt = new Date(Date.now() - 2000).toISOString();
    const payload = { text: 'integration run-now test', scheduledAt };

    // create post
    const res1 = await fetch('http://localhost:3000/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const created = await res1.json();
    if (!created || !created.id) throw new Error('create failed');

    // trigger run-now
    const res2 = await fetch('http://localhost:3000/api/run-now', { method: 'POST' });
    const runRes = await res2.json();
    if (!runRes || runRes.ok !== true) throw new Error('run-now failed');

    // fetch post
    const res3 = await fetch(`http://localhost:3000/api/posts/${created.id}`);
    const fetched = await res3.json();
    if (!fetched || fetched.status !== 'SENT') throw new Error('post not SENT');

    // print success
    console.log(JSON.stringify({ ok: true, id: created.id, status: fetched.status }));

    srv.stopServer();
    process.exit(0);
  } catch (err) {
    console.error('error', String(err));
    try { require('../src/index.js').stopServer(); } catch (e) {}
    process.exit(2);
  }
})();
