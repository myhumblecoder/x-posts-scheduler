// Minimal tile service for Arrange (drag-drop) + keyboard accessibility
const _tilesStore = new Map(); // tileId -> { id, user_id, position }

function getTilesForUser(userId) {
  const out = [];
  for (const t of _tilesStore.values()) {
    if (t.user_id === userId) out.push(Object.assign({}, t));
  }
  out.sort((a,b) => (a.position || 0) - (b.position || 0));
  return out;
}

function moveTile(userId, tileId, toIndex) {
  const tiles = getTilesForUser(userId);
  const idx = tiles.findIndex(t => t.id === tileId);
  if (idx === -1) return false;
  const [tile] = tiles.splice(idx,1);
  tiles.splice(toIndex,0,tile);
  // reassign positions
  tiles.forEach((t,i) => {
    const stored = _tilesStore.get(t.id);
    if (stored) stored.position = i;
  });
  return true;
}

// Accessibility: keyboard reorder simulation: 'left' or 'right'
function reorderWithKeyboard(userId, tileId, direction) {
  const tiles = getTilesForUser(userId);
  const idx = tiles.findIndex(t => t.id === tileId);
  if (idx === -1) return false;
  let to = idx;
  if (direction === 'left' || direction === 'up') to = Math.max(0, idx - 1);
  else if (direction === 'right' || direction === 'down') to = Math.min(tiles.length - 1, idx + 1);
  return moveTile(userId, tileId, to);
}

module.exports = {
  getTilesForUser,
  moveTile,
  reorderWithKeyboard,
  _tilesStore,
};
