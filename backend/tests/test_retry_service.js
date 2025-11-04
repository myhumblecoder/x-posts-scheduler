const assert = require('assert');

exports.run = function run() {
  // Tests for retry_service (T043–T045 Retry)
  const rs = require('../src/retry_service');

  // API surface checks
  assert(typeof rs.scheduleRetry === 'function', 'scheduleRetry should be a function');
  assert(typeof rs.performRetries === 'function', 'performRetries should be a function');
  assert(typeof rs.getRetryStatus === 'function', 'getRetryStatus should be a function');

  // Basic behavior: schedule a retry and then check status
  const postId = 'retry-post-1';
  rs._retryStore.clear();
  rs.scheduleRetry(postId, { attempts: 1 });
  const status = rs.getRetryStatus(postId);
  assert(status && status.scheduled === true, 'retry should be scheduled');

  // performRetries should process scheduled retries (no-op but must not throw)
  rs.performRetries();
};
