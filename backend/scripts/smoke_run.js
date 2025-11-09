process.env.USE_SQLITE = '1'

const srv = require('../src/index')

async function main() {
  const server = srv.startServer(0)
  const port = server.address().port
  console.log('Started server on port', port)

  const fetch = globalThis.fetch || (await import('node-fetch')).default

  const r1 = await fetch(`http://localhost:${port}/api/scheduled`)
  const s1 = await r1.text()
  console.log('/api/scheduled =>', s1)

  const r2 = await fetch(`http://localhost:${port}/api/layout`)
  const s2 = await r2.text()
  console.log('/api/layout =>', s2)

  srv.stopServer()
}

main().catch(err => {
  console.error('Smoke run failed:', err)
  try { srv.stopServer() } catch (e) {}
  process.exit(1)
})
