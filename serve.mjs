/**
 * Static file server for the game hub.
 *
 * Serves D:/game over HTTP so every game can be opened from the launcher at
 * http://localhost:8080/. Uses only Node's built-in modules — no dependencies.
 *
 *   node serve.mjs            # port 8080
 *   node serve.mjs 3000       # custom port
 */

import { createServer } from 'node:http'
import { createReadStream, statSync, existsSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)))
const PORT = Number(process.argv[2] ?? 8080)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.wasm': 'application/wasm',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
}

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type })
  res.end(body)
}

const server = createServer((req, res) => {
  let urlPath
  try {
    urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  } catch {
    return send(res, 400, 'Bad request')
  }

  // Resolve inside ROOT only — never escape the hub directory.
  const target = normalize(join(ROOT, urlPath))
  if (!target.startsWith(ROOT)) return send(res, 403, 'Forbidden')

  let filePath = target
  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, 'index.html')
  }

  // Next.js App Router prefetches client-side routes with an `RSC: 1` header and
  // expects the pre-rendered payload, which a static export writes as a `.txt`
  // sibling (e.g. /collection -> /collection.txt). Without this the prefetch
  // aborts and Next falls back to a full page load.
  const wantsRsc = req.headers['rsc'] === '1'
  if (wantsRsc && !existsSync(filePath)) {
    const rscPath = `${target}.txt`
    if (existsSync(rscPath)) filePath = rscPath
  }

  if (!existsSync(filePath)) {
    return send(res, 404, `Not found: ${urlPath}`, 'text/plain; charset=utf-8')
  }

  const stat = statSync(filePath)
  if (stat.isDirectory()) return send(res, 404, 'Not found')

  const ext = extname(filePath).toLowerCase()
  const type = wantsRsc && ext === '.txt'
    ? 'text/x-component; charset=utf-8'
    : (MIME[ext] ?? 'application/octet-stream')

  // HEAD must return the same headers but no body. Next.js prefetches routes
  // with HEAD, so answering incorrectly makes it abort the request.
  if (req.method === 'HEAD') {
    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache',
    })
    return res.end()
  }

  res.writeHead(200, {
    'Content-Type': type,
    'Content-Length': stat.size,
    'Cache-Control': 'no-cache',
  })
  createReadStream(filePath).pipe(res)
})

server.listen(PORT, () => {
  console.log(`\n  Duta Game Hub`)
  console.log(`  ➜  http://localhost:${PORT}/\n`)
  console.log(`  serving ${ROOT}`)
  console.log(`  press Ctrl+C to stop\n`)
})
