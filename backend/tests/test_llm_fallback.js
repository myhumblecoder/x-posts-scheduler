const assert = require('assert')

async function run() {
  // Monkeypatch global.fetch to simulate 404 then model-list then success
  const originalFetch = global.fetch
  let callIndex = 0
  global.fetch = async (url, opts = {}) => {
    callIndex += 1
    // First call: POST /api/generate -> 404 model not found
    if (callIndex === 1) {
      return {
        ok: false,
        status: 404,
        text: async () => '{"error":"model \'llama\' not found"}',
      }
    }
    // Second call: GET /api/models -> return array of models
    if (callIndex === 2) {
      return {
        ok: true,
        status: 200,
        json: async () => ["gpt-4o-mini", "llama2"]
      }
    }
    // Third call: POST /api/generate retry -> success
    if (callIndex === 3) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ output: 'fallback generated' })
      }
    }
    // Fallback: return 500
    return { ok: false, status: 500, text: async () => 'nope' }
  }

  try {
    const llm = require('../src/llm_service')
    const out = await llm.generate({ prompt: 'hello', provider: 'ollama', timeout: 5000 })
    assert.strictEqual(out, 'fallback generated')
  } finally {
    global.fetch = originalFetch
  }
}

module.exports = { run }
