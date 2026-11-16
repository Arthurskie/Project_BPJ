import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AuthContext, useAuth } from '../contexts/useAuth.js';
import { FormContext, useFormContext } from '../contexts/useFormContext.js';
import { ThemeContext, useTheme } from '../contexts/useTheme.js';

for (const [name, Context, useValue, provider] of [
  ['useAuth', AuthContext, useAuth, 'AuthProvider'],
  ['useFormContext', FormContext, useFormContext, 'FormProvider'],
  ['useTheme', ThemeContext, useTheme, 'ThemeProvider'],
]) {
  function Consumer() {
    return createElement('span', null, useValue().marker);
  }

  test(`${name} rejects a missing provider`, () => {
    assert.throws(() => renderToStaticMarkup(createElement(Consumer)), {
      message: `${name} must be used within ${provider === 'AuthProvider' ? 'an' : 'a'} ${provider}`,
    });
  });

  test(`${name} reads the shared context value`, () => {
    const value = { marker: `${name} value` };
    const markup = renderToStaticMarkup(
      createElement(Context.Provider, { value }, createElement(Consumer)),
    );
    assert.equal(markup, `<span>${value.marker}</span>`);
  });
}

