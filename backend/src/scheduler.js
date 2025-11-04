const postService = require('./post_service');

function pickScheduled(now) {
  const due = postService.listScheduled(now);
  return due.map(p => p.id);
}

// attemptPost simulates posting to X API and marks sent
function attemptPost(postId, posterFn) {
  const post = postService.getPost(postId);
  if (!post) throw new Error('Post not found');
  try {
    const remoteId = posterFn(post);
    postService.markSent(postId, remoteId);
    return { ok: true, remote_post_id: remoteId };
  } catch (err) {
    postService.markFailed(postId, 'POST_ERROR', err.message);
    return { ok: false, error: err.message };
  }
}

module.exports = {
  pickScheduled,
  attemptPost,
};
