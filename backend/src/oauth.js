// Minimal OAuth mock for MVP tests

function authorizeUser(token) {
  // In real system we'd validate token and return user profile + scopes
  if (!token) throw new Error('Missing token');
  return { user_id: 'user-' + token.slice(0,6), scopes: ['write:post'] };
}

function refreshToken(oldToken) {
  if (!oldToken) throw new Error('Missing token');
  return oldToken + '-refreshed';
}

module.exports = {
  authorizeUser,
  refreshToken,
};
