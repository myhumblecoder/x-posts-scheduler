const assert = require('assert');

exports.run = function run() {
  // Tests for tile_service (T031–T033 Arrange)
  const ts = require('../src/tile_service');

  // API surface checks
  assert(typeof ts.moveTile === 'function', 'moveTile should be a function');
  assert(typeof ts.getTilesForUser === 'function', 'getTilesForUser should be a function');
  assert(typeof ts.reorderWithKeyboard === 'function', 'reorderWithKeyboard should be a function (accessibility)');

  // Basic behavior
  const userId = 'user-tiles-1';
  // seed tiles
  ts._tilesStore.clear();
  ts._tilesStore.set('a', { id: 'a', user_id: userId, position: 0 });
  ts._tilesStore.set('b', { id: 'b', user_id: userId, position: 1 });
  ts._tilesStore.set('c', { id: 'c', user_id: userId, position: 2 });

  // move tile b to index 0
  ts.moveTile(userId, 'b', 0);
  const tiles = ts.getTilesForUser(userId);
  assert(tiles[0].id === 'b', 'tile b should now be first');

  // keyboard reorder: move tile c left by 1 (simulate ArrowLeft)
  ts.reorderWithKeyboard(userId, 'c', 'left');
  const tiles2 = ts.getTilesForUser(userId);
  // expect c to be at index 1 now
  const idx = tiles2.findIndex(t => t.id === 'c');
  assert(idx === 1, 'tile c should be at index 1 after keyboard move left');
};
