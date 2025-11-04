const assert = require('assert');
const oauth = require('../src/oauth');

exports.run = function() {
  const user = oauth.authorizeUser('fake-token');
  assert(user && user.user_id, 'authorizeUser should return user info');

  const refreshed = oauth.refreshToken('fake-token');
  assert(refreshed && refreshed.includes('refreshed'), 'refreshToken should return refreshed token');
};
