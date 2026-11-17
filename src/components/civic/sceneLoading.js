export function startCivicScene({ host, load, onReady, onFallback }) {
  let active = true;
  let dispose;
  const fail = () => {
    if (!active) return;
    active = false;
    dispose?.();
    dispose = undefined;
    onFallback();
  };
  Promise.resolve().then(load).then(({ mountCivicScene }) => {
    if (!active) return;
    const cleanup = mountCivicScene(host, fail, () => { if (active) onReady(); });
    if (active) dispose = cleanup;
    else cleanup();
  }).catch(fail);
  return () => { active = false; dispose?.(); dispose = undefined; };
}

