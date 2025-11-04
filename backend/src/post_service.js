// Simple in-memory store for MVP
const posts = new Map();

function generateId() {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8);
}

function createDraft(content_text) {
  const id = generateId();
  const post = {
    id,
    content_text,
    content_html_preview: null,
    status: 'DRAFT',
    scheduled_at: null,
    sent_at: null,
    remote_post_id: null,
    error_code: null,
    error_message: null,
    created_at: new Date(),
    updated_at: new Date(),
  };
  posts.set(id, post);
  return post;
}

function saveDraft(id, newContent) {
  const post = posts.get(id);
  if (!post) throw new Error('Post not found');
  post.content_text = newContent;
  post.updated_at = new Date();
  posts.set(id, post);
  return post;
}

function schedulePost(id, when) {
  const post = posts.get(id);
  if (!post) throw new Error('Post not found');
  post.scheduled_at = new Date(when);
  post.status = 'SCHEDULED';
  post.updated_at = new Date();
  posts.set(id, post);
  return post;
}

function getPost(id) {
  return posts.get(id) || null;
}

function markSent(id, remote_post_id) {
  const post = posts.get(id);
  if (!post) throw new Error('Post not found');
  post.status = 'SENT';
  post.sent_at = new Date();
  post.remote_post_id = remote_post_id;
  post.updated_at = new Date();
  posts.set(id, post);
  return post;
}

function markFailed(id, code, message) {
  const post = posts.get(id);
  if (!post) throw new Error('Post not found');
  post.status = 'FAILED';
  post.error_code = code;
  post.error_message = message;
  post.updated_at = new Date();
  posts.set(id, post);
  return post;
}

function listScheduled(beforeDate) {
  const res = [];
  for (const post of posts.values()) {
    if (post.status === 'SCHEDULED' && post.scheduled_at && post.scheduled_at <= beforeDate) {
      res.push(post);
    }
  }
  return res;
}

module.exports = {
  createDraft,
  saveDraft,
  schedulePost,
  getPost,
  markSent,
  markFailed,
  listScheduled,
  _posts: posts, // exported for testing
};
