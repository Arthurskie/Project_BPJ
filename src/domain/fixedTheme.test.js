import test from 'node:test';
import assert from 'node:assert/strict';
import { fixedTheme, applyLightTheme } from '../contexts/fixedTheme.js';

test('theme remains light even when legacy consumers request a toggle', () => {
  assert.equal(fixedTheme.darkMode, false);
  fixedTheme.toggleDarkMode();
  assert.equal(fixedTheme.darkMode, false);
  assert.ok(Object.isFrozen(fixedTheme));
});

test('applying the fixed theme clears a legacy dark class and uses light native controls', () => {
  const classes = new Set(['dark', 'unrelated']);
  const root = { classList: { remove: value => classes.delete(value) }, style: {} };
  applyLightTheme(root);
  assert.equal(classes.has('dark'), false);
  assert.equal(classes.has('unrelated'), true);
  assert.equal(root.style.colorScheme, 'light');
  applyLightTheme(root);
  assert.equal(root.style.colorScheme, 'light');
});
