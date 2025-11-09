const { runSqliteJson, runSqliteExec } = require('./sqlite_cli_helper')

function nowIso() { return new Date().toISOString() }

function generateId() {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8)
}

function createDraft(content_text) {
  const id = generateId()
  const now = nowIso()
  const sql = `INSERT INTO posts (id, content_text, status, created_at, updated_at) VALUES ('${id}', "${content_text.replace(/"/g, '\\"')}", 'DRAFT', '${now}', '${now}');`;
  runSqliteExec(sql)
  return getPost(id)
}

function saveDraft(id, newContent) {
  const now = nowIso()
  const sql = `UPDATE posts SET content_text = "${newContent.replace(/"/g, '\\"')}", updated_at = '${now}' WHERE id = '${id}';`;
  runSqliteExec(sql)
  return getPost(id)
}

function schedulePost(id, when) {
  const scheduled = new Date(when)
  if (isNaN(scheduled.getTime())) throw new Error('Invalid date')
  const now = nowIso()
  const sql = `UPDATE posts SET scheduled_at = '${scheduled.toISOString()}', status = 'SCHEDULED', updated_at = '${now}' WHERE id = '${id}';`;
  runSqliteExec(sql)
  return getPost(id)
}

function getPost(id) {
  const rows = JSON.parse(runSqliteJson(`SELECT * FROM posts WHERE id = '${id}';`))
  const row = rows[0]
  if (!row) return null
  return {
    id: row.id,
    content_text: row.content_text,
    content_html_preview: row.content_html_preview,
    status: row.status,
    scheduled_at: row.scheduled_at,
    sent_at: row.sent_at,
    remote_post_id: row.remote_post_id,
    error_code: row.error_code,
    error_message: row.error_message,
    created_at: row.created_at,
    updated_at: row.updated_at
  }
}

function markSent(id, remote_post_id) {
  const now = nowIso()
  runSqliteExec(`UPDATE posts SET status = 'SENT', sent_at = '${now}', remote_post_id = '${remote_post_id}', updated_at = '${now}' WHERE id = '${id}';`)
  return getPost(id)
}

function markFailed(id, code, message) {
  const now = nowIso()
  runSqliteExec(`UPDATE posts SET status = 'FAILED', error_code = '${code}', error_message = '${message.replace(/'/g,"''")}', updated_at = '${now}' WHERE id = '${id}';`)
  return getPost(id)
}

function listScheduled(beforeDate) {
  const iso = (beforeDate instanceof Date) ? beforeDate.toISOString() : new Date(beforeDate).toISOString()
  const rows = JSON.parse(runSqliteJson(`SELECT * FROM posts WHERE status = 'SCHEDULED' AND scheduled_at IS NOT NULL AND scheduled_at <= '${iso}';`))
  return rows.map(row => ({
    id: row.id,
    content_text: row.content_text,
    content_html_preview: row.content_html_preview,
    status: row.status,
    scheduled_at: row.scheduled_at,
    sent_at: row.sent_at,
    remote_post_id: row.remote_post_id,
    error_code: row.error_code,
    error_message: row.error_message,
    created_at: row.created_at,
    updated_at: row.updated_at
  }))
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
