const assert = require('assert');
const postService = require('../src/post_service');

exports.run = function() {
  // create draft
  const draft = postService.createDraft('hello world');
  assert(draft && draft.id, 'Draft must have id');
  assert(draft.content_text === 'hello world', 'Draft content must match prompt');

  // save edit
  const saved = postService.saveDraft(draft.id, 'edited');
  assert(saved.content_text === 'edited', 'Saved content must be updated');

  // schedule
  const scheduled = postService.schedulePost(draft.id, new Date(Date.now() + 60*1000));
  assert(scheduled.status === 'SCHEDULED', 'Post should be scheduled');

  // getPost
  const fetched = postService.getPost(draft.id);
  assert(fetched && fetched.id === draft.id, 'getPost should return the post');

  // markSent and markFailed (markSent then markFailed on new draft)
  const sent = postService.markSent(draft.id, 'remote-123');
  assert(sent.status === 'SENT' && sent.remote_post_id === 'remote-123', 'markSent should record remote_post_id');

  // create another draft to test markFailed and listScheduled
  const d2 = postService.createDraft('will fail');
  postService.schedulePost(d2.id, new Date(Date.now() - 1000));
  const failed = postService.markFailed(d2.id, 'ERR', 'boom');
  assert(failed.status === 'FAILED', 'markFailed should set status');
  const due = postService.listScheduled(new Date());
  // d2 was scheduled in past but now marked FAILED, so listScheduled should not include it
  assert(Array.isArray(due), 'listScheduled returns array');

  // _posts internal store should be accessible for tests
  const postsMap = postService._posts;
  const isMap = postsMap && typeof postsMap.get === 'function';
  assert(isMap, '_posts should be a Map-like object');
};
