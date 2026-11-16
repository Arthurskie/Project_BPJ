import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { AuthContext, useAuth } from './useAuth.js';
import { FormContext, useFormContext } from './useForm.js';
import { ThemeContext, useTheme } from './useTheme.js';

for (const [name, Context, useValue] of [
  ['Auth', AuthContext, useAuth],
  ['Form', FormContext, useFormContext],
  ['Theme', ThemeContext, useTheme],
]) {
  function Consumer() {
    const value = useValue();
    return createElement('span', null, value.marker);
  }
  test(name + ' hook requires its provider', () => {
    assert.throws(() => renderToString(createElement(Consumer)), new RegExp('must be used within an? ' + name + 'Provider'));
  });
  test(name + ' hook receives the matching context value', () => {
    const html = renderToString(createElement(Context.Provider, { value: { marker: name } }, createElement(Consumer)));
    assert.equal(html, '<span>' + name + '</span>');
  });
}


test('both form hook import paths share one provider context', async () => {
  const legacy = await import('./useFormContext.js');
  assert.equal(FormContext, legacy.FormContext);
  assert.equal(useFormContext, legacy.useFormContext);
});
