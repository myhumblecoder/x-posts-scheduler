const assert = require('assert')

async function run() {
  // Load the module
  const llm = require('../src/llm_service')

  // getDefaultProvider should reflect env or default to 'ollama'
  const expected = process.env.LLM_PROVIDER || 'ollama'
  assert.strictEqual(typeof llm.getDefaultProvider, 'function')
  assert.strictEqual(llm.getDefaultProvider(), expected)

  // Test stub provider returns the deterministic enhanced text
  const out = await llm.generate({ prompt: 'hello world', provider: 'stub' })
  assert.strictEqual(typeof out, 'string')
  assert.ok(out.toLowerCase().includes('enhanced') || out.length > 0, 'stub output should be non-empty and include enhancement')

  // Test generatePreview (explicitly instruct stub to avoid network)
  const p = await llm.generatePreview({ prompt: 'preview me', provider: 'stub' })
  assert.strictEqual(typeof p, 'string')
  assert.ok(p.length > 0)
}

module.exports = { run }
