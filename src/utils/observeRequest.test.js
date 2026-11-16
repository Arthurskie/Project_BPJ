import assert from 'node:assert/strict';
import test from 'node:test';
import { observeRequest } from './observeRequest.js';

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

test('publishes success and completion for an active request', async () => {
  const request = deferred();
  const calls = [];
  observeRequest(request.promise, { success: value => calls.push(value), complete: () => calls.push('done') });
  request.resolve('data');
  await new Promise(setImmediate);
  assert.deepEqual(calls, ['data', 'done']);
});

test('cleanup ignores late success, failure, and completion', async () => {
  for (const result of ['resolve', 'reject']) {
    const request = deferred();
    const calls = [];
    const cancel = observeRequest(request.promise, {
      success: value => calls.push(value), error: value => calls.push(value), complete: () => calls.push('done')
    });
    cancel();
    request[result]('stale');
    await new Promise(setImmediate);
    assert.deepEqual(calls, []);
  }
});

test('an older response cannot replace the latest result', async () => {
  const old = deferred();
  const latest = deferred();
  const values = [];
  const cancel = observeRequest(old.promise, { success: value => values.push(value) });
  cancel();
  observeRequest(latest.promise, { success: value => values.push(value) });
  latest.resolve('latest');
  old.resolve('old');
  await new Promise(setImmediate);
  assert.deepEqual(values, ['latest']);
});

test('routes an exception in the success handler to the error handler', async () => {
  const failure = new Error('publish failed');
  const calls = [];
  observeRequest(Promise.resolve('data'), {
    success: () => { throw failure; },
    error: error => calls.push(error),
    complete: () => calls.push('done')
  });
  await new Promise(setImmediate);
  assert.deepEqual(calls, [failure, 'done']);
});
