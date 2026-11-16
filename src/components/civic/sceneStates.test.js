import test from 'node:test';
import assert from 'node:assert/strict';
import { getCivicState } from './scenePolicy.js';

test('landing sections have distinct intentional scene subjects', () => {
  assert.deepEqual(['beranda', 'layanan', 'prosedur', 'informasi'].map(key => getCivicState(key).subject), ['building', 'documents', 'flow', 'information']);
});
test('form follows actual entry, sending and success states', () => {
  assert.equal(getCivicState('entry').subject, 'documents');
  assert.equal(getCivicState('sending').subject, 'flow');
  assert.equal(getCivicState('success').subject, 'success');
});
test('unknown stages safely use home', () => assert.equal(getCivicState('unknown'), getCivicState('beranda')));
