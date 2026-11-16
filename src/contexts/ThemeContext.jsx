import React, { useEffect } from 'react';
import { ThemeContext } from './useTheme.js';
import { applyLightTheme, fixedTheme } from './fixedTheme.js';

export function ThemeProvider({ children }) {
  useEffect(() => {
    applyLightTheme(document.documentElement);
  }, []);

  return (
    <ThemeContext.Provider value={fixedTheme}>
      {children}
    </ThemeContext.Provider>
  );
}
