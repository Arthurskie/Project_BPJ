import test from 'node:test';
import assert from 'node:assert/strict';
import { startCivicScene } from './sceneLoading.js';
const tick = () => new Promise(resolve => setImmediate(resolve));

test('waits for the renderer readiness callback rather than module or mount completion', async () => {
  let ready = 0, rendered;
  const stop = startCivicScene({ host: {}, load: async () => ({ mountCivicScene: (_host, _fail, onReady) => { rendered = onReady; return () => {}; } }), onReady: () => ready++, onFallback: assert.fail });
  await tick();
  assert.equal(ready, 0);
  rendered();
  assert.equal(ready, 1);
  stop();
  rendered();
  assert.equal(ready, 1);
});

test('cancelled imports never mount or reveal a stale scene', async () => {
  let resolve, mounts = 0;
  const module = new Promise(done => { resolve = done; });
  const stop = startCivicScene({ host: {}, load: () => module, onReady: assert.fail, onFallback: assert.fail });
  stop();
  resolve({ mountCivicScene: () => mounts++ });
  await tick();
  assert.equal(mounts, 0);
});

test('import and mount failures leave loading through fallback', async () => {
  for (const load of [async () => { throw Error('import'); }, async () => ({ mountCivicScene: () => { throw Error('WebGL'); } })]) {
    let fallback = 0;
    startCivicScene({ host: {}, load, onReady: assert.fail, onFallback: () => fallback++ });
    await tick();
    assert.equal(fallback, 1);
  }
});

test('context loss disposes once and ignores later renderer callbacks', async () => {
  let fail, ready, disposed = 0, fallback = 0;
  const stop = startCivicScene({ host: {}, load: async () => ({ mountCivicScene: (_host, onLost, onReady) => { fail = onLost; ready = onReady; return () => disposed++; } }), onReady: assert.fail, onFallback: () => fallback++ });
  await tick();
  fail(); ready(); fail(); stop();
  assert.equal(fallback, 1);
  assert.equal(disposed, 1);
});
