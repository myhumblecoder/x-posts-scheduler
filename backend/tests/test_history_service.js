const assert = require('assert');

exports.run = function run() {
  // Tests for history_service (T046–T048)
  const hs = require('../src/history_service');

  // API surface checks
  assert(typeof hs.getHistoryForUser === 'function', 'getHistoryForUser should be a function');
  assert(typeof hs.getPostById === 'function', 'getPostById should be a function');
  assert(typeof hs.listSentBetween === 'function', 'listSentBetween should be a function');

  // Basic behavior (in-memory expectations)
  const userId = 'user-test-1';
  const posts = hs.getHistoryForUser(userId, { limit: 10 });
  assert(Array.isArray(posts), 'getHistoryForUser should return an array');

  // getPostById on a non-existing id should return null or undefined
  const p = hs.getPostById('no-such-id');
  assert(p === null || p === undefined, 'getPostById should return null/undefined for missing id');
};
