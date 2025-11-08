const request = require('supertest');
const { createServer } = require('../src/index');

process.env.WORKER_DETERMINISTIC = '1';
process.env.ENABLE_WORKER = '0'; // ensure worker does not auto-start

exports.run = async function() {
  const app = createServer();

  // 1. Create + schedule
  const draftRes = await request(app)
    .post('/api/posts')
    .send({ text: 'supertest post', scheduledAt: new Date().toISOString() });
  const post = draftRes.body;
  if (!post.id) throw new Error('No post ID');

  // 2. Run now
  const runRes = await request(app).post('/api/run-now');
  const result = runRes.body;
  if (result.processed !== 1) throw new Error('Wrong processed count');
  if (result.sent !== 1) throw new Error('Wrong sent count');

  // 3. Verify
  const final = await request(app).get(`/api/posts/${post.id}`);
  if (final.body.status !== 'SENT') throw new Error('Not SENT');

  console.log('test_run_now: PASSED');
};
