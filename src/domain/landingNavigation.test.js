import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldResetLandingOnReload, getSectionScrollTop, getActiveLandingSection } from './landingNavigation.js';

test('reload resets only landing routes', () => {
  for (const path of ['/', '/guest', '/guest/']) {
    assert.equal(shouldResetLandingOnReload(path, 'reload'), true);
  }
  for (const path of ['/guest/submit', '/guest/track', '/admin', '/login']) {
    assert.equal(shouldResetLandingOnReload(path, 'reload'), false);
  }
});

test('normal navigation and history traversal preserve section navigation', () => {
  for (const type of ['navigate', 'back_forward', undefined]) {
    assert.equal(shouldResetLandingOnReload('/guest', type), false);
  }
});

test('section alignment subtracts the measured header exactly once', () => {
  assert.equal(getSectionScrollTop(1000, 70, 3000), 930);
  assert.equal(getSectionScrollTop(1000, 105, 3000), 895);
  assert.equal(getSectionScrollTop(80, 70, 3000, true), 0);
});
test('section targets clamp to valid scroll positions', () => {
  assert.equal(getSectionScrollTop(40, 70, 2000), 0);
  assert.equal(getSectionScrollTop(2400, 70, 1900), 1900);
  assert.equal(getSectionScrollTop(2400, 70, -10), 0);
});
test('active section follows the header edge, not an unrelated viewport reading line', () => {
  const sections = [{ id: 'beranda', top: 70 }, { id: 'layanan', top: 800 }, { id: 'prosedur', top: 1600 }, { id: 'informasi', top: 2400 }];
  assert.equal(getActiveLandingSection(sections, 0, 70, 3000), 'beranda');
  assert.equal(getActiveLandingSection(sections, 650, 70, 3000), 'beranda');
  assert.equal(getActiveLandingSection(sections, 730, 70, 3000), 'layanan');
  assert.equal(getActiveLandingSection(sections, 1530, 70, 3000), 'prosedur');
  assert.equal(getActiveLandingSection(sections, 2000, 70, 2000), 'informasi');
});
