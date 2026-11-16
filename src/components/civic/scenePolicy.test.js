import test from 'node:test';
import assert from 'node:assert/strict';
import { canAnimateCivicScene } from './scenePolicy.js';
test('desktop with sufficient resources may render the scene', () => {
  assert.equal(canAnimateCivicScene({ width: 1200, reducedMotion: false, saveData: false, cores: 8, memory: 8 }), true);
});
for (const [name, change] of Object.entries({ mobile: { width: 700 }, motion: { reducedMotion: true }, data: { saveData: true }, cores: { cores: 2 }, memory: { memory: 2 } })) {
  test(`${name} uses the static illustration`, () => assert.equal(canAnimateCivicScene({ width: 1200, reducedMotion: false, saveData: false, cores: 8, memory: 8, ...change }), false));
}
test('missing optional resource hints do not block capable desktops', () => {
  assert.equal(canAnimateCivicScene({ width: 1200, reducedMotion: false }), true);
});
