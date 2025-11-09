// LLM service with simple provider abstraction and common retry/timeout handling.
// Supports providers: 'stub' (local deterministic), 'ollama', and 'openai'.
// Configure via env vars: LLM_PROVIDER, OLLAMA_URL, OLLAMA_MODEL, OPENAI_API_KEY

const DEFAULT_RETRIES = 2
const DEFAULT_BACKOFF_BASE_MS = 500

// Persist discovered Ollama model for process lifetime to avoid repeated discovery
let _lastDiscoveredOllamaModel = null

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function fetchWithTimeout(url, opts = {}, timeoutMs = 15000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal })
    return res
  } finally {
    clearTimeout(id)
  }
}

async function retry(fn, attempts = DEFAULT_RETRIES, baseDelay = DEFAULT_BACKOFF_BASE_MS) {
  let lastErr
  for (let i = 0; i <= attempts; i += 1) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      if (i === attempts) break
      const backoff = baseDelay * Math.pow(2, i)
      // eslint-disable-next-line no-await-in-loop
      await sleep(backoff)
    }
  }
  throw lastErr
}

function _extractTextFromJson(json) {
  if (!json) return ''
  // Common shapes: { output: 'text' } or { output: [{ content: '...' }]} or { choices: [{ message: { content } }] }
  if (typeof json === 'string') return json
  if (json.output && typeof json.output === 'string') return json.output
  if (Array.isArray(json.output) && json.output.length && typeof json.output[0] === 'string') return json.output[0]
  if (Array.isArray(json.results) && json.results.length) {
    const first = json.results[0]
    if (typeof first === 'string') return first
    if (first.output && typeof first.output === 'string') return first.output
    if (first.content && typeof first.content === 'string') return first.content
  }
  if (json.choices && Array.isArray(json.choices) && json.choices[0]) {
    const c = json.choices[0]
    if (c.message && c.message.content) return c.message.content
    if (c.text) return c.text
  }
  // Fallback: stringify
  try { return JSON.stringify(json) } catch (e) { return String(json) }
}

async function ollamaGenerate({ prompt, model, timeoutMs = 30000 } = {}) {
  const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
  // Prefer explicit model argument, then any previously discovered model, then env or default
  const OLLAMA_MODEL = model || _lastDiscoveredOllamaModel || process.env.OLLAMA_MODEL || 'llama'

  const url = `${OLLAMA_URL.replace(/\/$/, '')}/api/generate`
  const body = { model: OLLAMA_MODEL, prompt }

  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, timeoutMs)

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    // If Ollama reports model not found (404) try to discover available models
    if (res.status === 404 && /model .* not found/i.test(txt)) {
      // attempt to discover models from known endpoints
      // eslint-disable-next-line no-console
      console.warn('[llm_service] Ollama model not found, attempting discovery')
      const candidates = [
        `${OLLAMA_URL.replace(/\/$/, '')}/api/models`,
        `${OLLAMA_URL.replace(/\/$/, '')}/models`,
        `${OLLAMA_URL.replace(/\/$/, '')}/v1/models`,
      ]
      for (const endpoint of candidates) {
        try {
          const r = await fetchWithTimeout(endpoint, { method: 'GET' }, 3000)
          if (!r.ok) continue
          const json = await r.json().catch(() => null)
          // json may be array or object; normalize to array of strings
          let models = []
          if (Array.isArray(json)) models = json
          else if (json && Array.isArray(json.models)) models = json.models
          else if (json && Array.isArray(json.data)) models = json.data
          if (models.length) {
            // Normalize model entries to string identifiers.
            const modelStrings = models.map(m => {
              if (typeof m === 'string') return m
              if (m && typeof m === 'object') return m.id || m.name || m.model || JSON.stringify(m)
              return String(m)
            })

            // Preference order: llama3 (versioned), llama, gpt, ggml, else first
            const preferred = modelStrings.find(m => /llama3/i.test(m))
              || modelStrings.find(m => /llama/i.test(m))
              || modelStrings.find(m => /gpt/i.test(m))
              || modelStrings.find(m => /ggml/i.test(m))
              || modelStrings[0]

            if (preferred) {
              // eslint-disable-next-line no-console
              console.warn('[llm_service] Ollama fallback model chosen:', preferred)
              // persist discovered model for process lifetime
              try { _lastDiscoveredOllamaModel = String(preferred) } catch (e) { /* ignore */ }
              // retry generate with chosen model id string
              const retryUrl = `${OLLAMA_URL.replace(/\/$/, '')}/api/generate`
              const retryBody = { model: preferred, prompt }
              const retryRes = await fetchWithTimeout(retryUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(retryBody),
              }, timeoutMs)
              if (retryRes.ok) {
                const retryJson = await retryRes.json().catch(() => null)
                return _extractTextFromJson(retryJson)
              }
            }
          }
        } catch (e) {
          // ignore and try next endpoint
        }
      }
    }

    const err = new Error(`Ollama responded ${res.status}: ${txt}`)
    err.status = res.status
    throw err
  }

  const json = await res.json().catch(() => null)
  return _extractTextFromJson(json)
}

async function openaiGenerate({ prompt, model = 'gpt-3.5-turbo', timeoutMs = 15000 } = {}) {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY not configured')
  const url = 'https://api.openai.com/v1/chat/completions'
  const body = { model, messages: [{ role: 'user', content: prompt }], max_tokens: 512 }

  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  }, timeoutMs)

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    const err = new Error(`OpenAI responded ${res.status}: ${txt}`)
    err.status = res.status
    throw err
  }

  const json = await res.json().catch(() => null)
  return _extractTextFromJson(json)
}

async function stubGenerate({ prompt } = {}) {
  const base = (prompt || '').trim()
  if (!base) return ''
  await sleep(30)
  return `${base.charAt(0).toUpperCase() + base.slice(1)} — enhanced for clarity and engagement.`
}

/**
 * generate options:
 *  - prompt: string
 *  - model: optional model name
 *  - provider: 'stub' | 'ollama' | 'openai'
 *  - timeout: override timeout in ms
 */
async function generate({ prompt, model, provider, timeout } = {}) {
  const prov = provider || process.env.LLM_PROVIDER || 'ollama'
  if (!prompt || typeof prompt !== 'string') throw new Error('Missing prompt')

  const call = async () => {
    if (prov === 'ollama') {
      // default 30s for local Ollama
      const t = typeof timeout === 'number' ? timeout : 30000
      return await ollamaGenerate({ prompt, model, timeoutMs: t })
    }
    if (prov === 'openai') {
      const t = typeof timeout === 'number' ? timeout : 15000
      return await openaiGenerate({ prompt, model, timeoutMs: t })
    }
    return await stubGenerate({ prompt })
  }

  // run with retries
  return await retry(call, DEFAULT_RETRIES, DEFAULT_BACKOFF_BASE_MS)
}

// Expose the default provider resolution so tests can assert it.
function getDefaultProvider() {
  return process.env.LLM_PROVIDER || 'ollama'
}

// Convenience wrapper used by existing codebase. Accepts same options as generate
async function generatePreview({ prompt, context, provider, model, timeout } = {}) {
  // keep signature compatible; support passing provider/model/timeout as needed
  return generate({ prompt, provider, model, timeout })
}

function getLastDiscoveredOllamaModel() {
  return _lastDiscoveredOllamaModel
}

module.exports = { generate, generatePreview, getDefaultProvider, getLastDiscoveredOllamaModel }
