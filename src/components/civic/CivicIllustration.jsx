import { useEffect, useRef, useState } from 'react';
import { canAnimateCivicScene } from './scenePolicy';
import { startCivicScene } from './sceneLoading';

function shouldAnimate() {
  return typeof window !== 'undefined' && canAnimateCivicScene({ width: window.innerWidth, reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches, saveData: navigator.connection?.saveData, cores: navigator.hardwareConcurrency, memory: navigator.deviceMemory });
}

export default function CivicIllustration() {
  const host = useRef(null);
  const [status, setStatus] = useState(() => shouldAnimate() ? 'loading' : 'static');
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 960px)');
    const connection = navigator.connection;
    let dispose;
    const update = () => {
      dispose?.();
      dispose = undefined;
      if (!shouldAnimate()) { setStatus('static'); return; }
      setStatus('loading');
      dispose = startCivicScene({
        host: host.current,
        load: () => import('./civicScene'),
        onReady: () => setStatus('ready'),
        onFallback: () => setStatus('static'),
      });
    };
    update();
    media.addEventListener('change', update);
    desktop.addEventListener('change', update);
    connection?.addEventListener('change', update);
    return () => {
      dispose?.();
      media.removeEventListener('change', update);
      desktop.removeEventListener('change', update);
      connection?.removeEventListener('change', update);
    };
  }, []);
  return <div className="civic-art">
    {status === 'loading' && <div className="civic-loading" role="status"><span className="civic-loading-indicator" aria-hidden="true" /><span>Memuat ilustrasi…</span></div>}
    <div className={`civic-static ${status !== 'static' ? 'is-hidden' : ''}`} aria-hidden="true">
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
    <div className={`civic-canvas ${status === 'ready' ? 'is-ready' : ''}`} ref={host} aria-hidden="true" />
    <span className="civic-caption" aria-hidden="true">Administrasi tertata. Pelayanan lebih dekat.</span>
  </div>;
}
