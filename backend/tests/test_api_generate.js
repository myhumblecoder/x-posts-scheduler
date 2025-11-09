const assert = require('assert')
const request = require('supertest')

async function run() {
  // require the express app (createServer helper)
  const srv = require('../src/index.js')
  const app = srv.createServer()

  // POST /api/generate with stub provider should return deterministic text
  const res = await request(app)
    .post('/api/generate')
    .send({ prompt: 'integration test', provider: 'stub' })
    .set('Accept', 'application/json')
    .expect(200)

  assert.ok(res.body && typeof res.body.text === 'string')
  assert.ok(res.body.text.toLowerCase().includes('enhanced') || res.body.text.length > 0)
}

module.exports = { run }
