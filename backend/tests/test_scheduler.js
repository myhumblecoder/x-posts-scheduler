const assert = require('assert');
const postService = require('../src/post_service');
const scheduler = require('../src/scheduler');

exports.run = function() {
  const draft = postService.createDraft('to be posted');
  postService.schedulePost(draft.id, new Date(Date.now() + 1000));

  // simulate scheduler pickup
  const due = scheduler.pickScheduled(new Date(Date.now() + 2000));
  // pickScheduled should return an array including our post id
  assert(Array.isArray(due), 'pickScheduled should return array');

  // attemptPost should call posterFn and mark as SENT on success
  const poster = (post) => 'remote-' + post.id.slice(-6);
  const result = scheduler.attemptPost(draft.id, poster);
  assert(result.ok === true && result.remote_post_id, 'attemptPost should return success and remote id');
};
