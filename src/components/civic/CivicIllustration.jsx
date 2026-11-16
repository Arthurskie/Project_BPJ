import { useEffect, useRef, useState } from 'react';
import { canAnimateCivicScene } from './scenePolicy';

export default function CivicIllustration() {
  const host = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 960px)');
    let cancelled = false;
    let dispose;
    let timer;
    let generation = 0;
    const update = () => {
      const current = ++generation;
      clearTimeout(timer);
      dispose?.();
      dispose = undefined;
      setReady(false);
      if (!canAnimateCivicScene({ width: window.innerWidth, reducedMotion: media.matches, saveData: navigator.connection?.saveData, cores: navigator.hardwareConcurrency, memory: navigator.deviceMemory })) return;
      timer = window.setTimeout(async () => {
        try {
          const { mountCivicScene } = await import('./civicScene');
          if (cancelled || current !== generation) return;
          dispose = mountCivicScene(host.current, () => setReady(false));
          setReady(true);
        } catch { if (!cancelled && current === generation) setReady(false); }
      }, 250);
    };
    // The first frame is always the lightweight illustration, never a loading placeholder.
    timer = window.setTimeout(update, 0);
    media.addEventListener('change', update);
    desktop.addEventListener('change', update);
    navigator.connection?.addEventListener('change', update);
    return () => {
      cancelled = true; generation++; clearTimeout(timer); dispose?.();
      media.removeEventListener('change', update);
      desktop.removeEventListener('change', update);
      navigator.connection?.removeEventListener('change', update);
    };
  }, []);
  return <div className="civic-art" aria-hidden="true">
    <div className={`civic-static ${ready ? 'is-hidden' : ''}`}>
      <svg viewBox="0 0 600 460" focusable="false">
        <g className="static-building">
        <ellipse cx="300" cy="381" rx="229" ry="33" fill="#e7e1d8" />
        <path d="m95 330 205-44 205 44-205 65z" fill="#d5ccbd" />
        <path d="M137 176h326v153H137z" fill="#eee8dc" />
        <path d="m119 177 181-96 181 96z" fill="#b62c31" />
        <path d="m154 162 146-75 146 75z" fill="#d14748" />
        <path d="M166 193h26v125h-26zm77 0h26v125h-26zm88 0h26v125h-26zm77 0h26v125h-26z" fill="#fffcf4" />
        <path d="M282 224h36v95h-36z" fill="#756e64" />
        <path d="M127 321h346v16H127zm-13 17h372v15H114z" fill="#c3b9a9" />
        <path d="M299 87V28" stroke="#777066" strokeWidth="4" /><path d="M301 29h49v17h-49z" fill="#bd292f" /><path d="M301 46h49v17h-49z" fill="#fff" />
        <g transform="translate(385 215) rotate(12)"><rect width="104" height="139" rx="4" fill="#fffdf8" stroke="#dbd1c3" strokeWidth="2" /><path d="M19 24h31M19 43h66M19 56h66M19 69h48" stroke="#bcb2a5" strokeWidth="5" /><circle cx="71" cy="105" r="15" fill="#b62c31" /><path d="m64 105 5 5 10-12" stroke="white" strokeWidth="3" fill="none" /></g>
        </g>
      </svg>
    </div>
    <div className={`civic-canvas ${ready ? 'is-ready' : ''}`} ref={host} />
    <span className="civic-caption">Administrasi tertata. Pelayanan lebih dekat.</span>
  </div>;
}
