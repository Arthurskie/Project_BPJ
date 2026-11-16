export function canAnimateCivicScene({ width, reducedMotion, saveData, cores, memory }) {
  return width >= 960 && !reducedMotion && !saveData && !(cores > 0 && cores <= 2) && !(memory > 0 && memory <= 2);
}
