// Keep the context API stable for consumers while the app ships one light theme.
export const fixedTheme = Object.freeze({
  darkMode: false,
  toggleDarkMode() {},
});

export function applyLightTheme(root) {
  root.classList.remove('dark');
  root.style.colorScheme = 'light';
}
