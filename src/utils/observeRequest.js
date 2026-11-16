export function observeRequest(promise, { success, error, complete }) {
  let active = true;
  Promise.resolve(promise)
    .then(value => { if (active) return success?.(value); })
    .catch(reason => { if (active) error?.(reason); })
    .finally(() => { if (active) complete?.(); });
  return () => { active = false; };
}
