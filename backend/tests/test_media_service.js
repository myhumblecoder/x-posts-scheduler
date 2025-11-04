const assert = require('assert');

exports.run = function run() {
  // Tests for media_service (T026–T030)
  const ms = require('../src/media_service');

  // API surface checks
  assert(typeof ms.uploadMedia === 'function', 'uploadMedia should be a function');
  assert(typeof ms.listMediaForPost === 'function', 'listMediaForPost should be a function');
  assert(typeof ms.deleteMedia === 'function', 'deleteMedia should be a function');

  // Basic behavior (in-memory expectations)
  const postId = 'post-test-1';
  const meta = { type: 'image', alt_text: 'alt' };
  const uploaded = ms.uploadMedia(postId, Buffer.from('fake'), meta);
  assert(uploaded && uploaded.id, 'uploadMedia should return an object with id');

  const list = ms.listMediaForPost(postId);
  assert(Array.isArray(list) && list.length >= 1, 'listMediaForPost should include uploaded media');

  const deleted = ms.deleteMedia(uploaded.id);
  assert(deleted === true, 'deleteMedia should return true on success');
};
