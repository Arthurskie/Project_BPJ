export function shouldResetLandingOnReload(pathname, navigationType) {
  return navigationType === 'reload' && ['/', '/guest', '/guest/'].includes(pathname);
}

export const landingSections = ['beranda', 'layanan', 'prosedur', 'informasi'];
export function getSectionScrollTop(sectionTop, headerHeight, maxScroll, isHome = false) {
  return Math.max(0, Math.min(isHome ? 0 : sectionTop - headerHeight, Math.max(0, maxScroll)));
}
export function getActiveLandingSection(sections, scrollTop, headerHeight, maxScroll) {
  if (scrollTop <= 1) return 'beranda';
  if (maxScroll > 0 && scrollTop >= maxScroll - 1) return sections.at(-1)?.id || 'beranda';
  return sections.filter(section => section.top <= scrollTop + headerHeight + 1).at(-1)?.id || 'beranda';
}
