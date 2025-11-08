const assert = require('assert');
// ensure deterministic fakePoster for test
process.env.WORKER_DETERMINISTIC = '1';

const postService = require('../src/post_service');
const worker = require('../src/worker');

exports.run = function() {
  // create a draft and schedule it in the past so it's due
  const draft = postService.createDraft('worker test post');
  postService.schedulePost(draft.id, new Date(Date.now() - 1000));

  // run a single worker iteration
  worker.runOnce();

  const updated = postService.getPost(draft.id);
  assert(updated.status === 'SENT', 'worker should mark scheduled post as SENT after runOnce');
};
