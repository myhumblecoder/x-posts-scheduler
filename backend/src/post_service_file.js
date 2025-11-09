const fs = require('fs')
const path = require('path')

const DB_DIR = process.env.FILE_DB_DIR || path.resolve(__dirname, '../../data')
const POSTS_PATH = path.join(DB_DIR, 'posts.json')

fs.mkdirSync(DB_DIR, { recursive: true })

function readPosts() {
  try {
    const raw = fs.readFileSync(POSTS_PATH, 'utf8')
    return JSON.parse(raw)
  } catch (e) {
    return {}
  }
}

function writePosts(obj) {
  const tmp = POSTS_PATH + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2), 'utf8')
  fs.renameSync(tmp, POSTS_PATH)
}

function nowIso() { return new Date().toISOString() }

function generateId() {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8)
}

function createDraft(content_text) {
  const id = generateId()
  const now = nowIso()
  const posts = readPosts()
  posts[id] = {
    id,
    content_text,
    content_html_preview: null,
    status: 'DRAFT',
    scheduled_at: null,
    sent_at: null,
    remote_post_id: null,
    error_code: null,
    error_message: null,
    created_at: now,
    updated_at: now
  }
  writePosts(posts)
  return posts[id]
}

function saveDraft(id, newContent) {
  const posts = readPosts()
  const post = posts[id]
  if (!post) throw new Error('Post not found')
  post.content_text = newContent
  post.updated_at = nowIso()
  writePosts(posts)
  return post
}

function schedulePost(id, when) {
  const posts = readPosts()
  const post = posts[id]
  if (!post) throw new Error('Post not found')
  const scheduled = new Date(when)
  if (isNaN(scheduled.getTime())) throw new Error('Invalid date')
  post.scheduled_at = scheduled.toISOString()
  post.status = 'SCHEDULED'
  post.updated_at = nowIso()
  writePosts(posts)
  return post
}

function getPost(id) {
  const posts = readPosts()
  return posts[id] || null
}

function markSent(id, remote_post_id) {
  const posts = readPosts()
  const post = posts[id]
  if (!post) throw new Error('Post not found')
  post.status = 'SENT'
  post.sent_at = nowIso()
  post.remote_post_id = remote_post_id
  post.updated_at = nowIso()
  writePosts(posts)
  return post
}

function markFailed(id, code, message) {
  const posts = readPosts()
  const post = posts[id]
  if (!post) throw new Error('Post not found')
  post.status = 'FAILED'
  post.error_code = code
  post.error_message = message
  post.updated_at = nowIso()
  writePosts(posts)
  return post
}

function listScheduled(beforeDate) {
  const iso = (beforeDate instanceof Date) ? beforeDate.toISOString() : new Date(beforeDate).toISOString()
  const posts = readPosts()
  const res = []
  for (const id in posts) {
    const p = posts[id]
    if (p.status === 'SCHEDULED' && p.scheduled_at && p.scheduled_at <= iso) res.push(p)
  }
  return res
}

module.exports = {
  createDraft,
  saveDraft,
  schedulePost,
  getPost,
  markSent,
  markFailed,
  listScheduled
}
