import React from 'react';

/**
 * Lambang Resmi Garuda Pancasila & Logo Instansi Pemerintah Indonesia
 * Render SVG vektor emas presisi khas lambang negara Republik Indonesia.
 */
export function GarudaLogo({ className = "w-10 h-10" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Lambang Garuda Pancasila"
    >
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5D061" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#996515" />
        </linearGradient>
        <linearGradient id="shieldRed" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>
      </defs>

      {/* Garuda Wings Left */}
      <path
        d="M 50,38 C 42,32 30,22 18,22 C 10,22 4,28 6,36 C 8,42 16,50 26,58 C 34,64 42,67 47,68 C 44,62 42,54 44,46 Z"
        fill="url(#goldGrad)"
        stroke="#805b10"
        strokeWidth="1"
      />
      {/* Wing Feathers Left */}
      <path
        d="M 18,22 C 12,28 10,38 14,48 M 22,26 C 18,34 18,44 24,54 M 28,32 C 26,42 28,52 34,60 M 34,38 C 34,48 38,58 44,66"
        stroke="#805b10"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Garuda Wings Right */}
      <path
        d="M 50,38 C 58,32 70,22 82,22 C 90,22 96,28 94,36 C 92,42 84,50 74,58 C 66,64 58,67 53,68 C 56,62 58,54 56,46 Z"
        fill="url(#goldGrad)"
        stroke="#805b10"
        strokeWidth="1"
      />
      {/* Wing Feathers Right */}
      <path
        d="M 82,22 C 88,28 90,38 86,48 M 78,26 C 82,34 82,44 76,54 M 72,32 C 74,42 72,52 66,60 M 66,38 C 66,48 62,58 56,66"
        stroke="#805b10"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Tail Feathers (Ekor) */}
      <path
        d="M 44,70 L 40,88 C 44,90 56,90 60,88 L 56,70 Z"
        fill="url(#goldGrad)"
        stroke="#805b10"
        strokeWidth="1"
      />
      <line x1="45" y1="72" x2="44" y2="87" stroke="#805b10" strokeWidth="1" />
      <line x1="50" y1="72" x2="50" y2="89" stroke="#805b10" strokeWidth="1" />
      <line x1="55" y1="72" x2="56" y2="87" stroke="#805b10" strokeWidth="1" />

      {/* Garuda Head and Neck */}
      <path
        d="M 48,22 C 48,15 50,10 54,9 C 58,8 63,12 65,15 C 67,17 71,17 72,18 C 70,20 66,22 64,22 C 63,25 61,29 60,33 L 49,33 C 48,29 48,25 48,22 Z"
        fill="url(#goldGrad)"
        stroke="#805b10"
        strokeWidth="1"
      />
      {/* Crown Feathers */}
      <path
        d="M 52,9 Q 55,4 58,8 M 55,9 Q 60,6 62,11"
        stroke="#805b10"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Eye */}
      <circle cx="58" cy="15" r="1.2" fill="#3D2005" />

      {/* Claws (Cengkeraman Kaki) */}
      <path
        d="M 42,75 C 40,78 40,80 43,80 C 46,80 47,77 47,74 M 58,75 C 60,78 60,80 57,80 C 54,80 53,77 53,74"
        stroke="#805b10"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* White Scroll (Pita Bhinneka Tunggal Ika) */}
      <path
        d="M 32,80 C 38,78 62,78 68,80 C 72,81 74,84 69,85 C 61,86 39,86 31,85 C 26,84 28,81 32,80 Z"
        fill="#FFFFFF"
        stroke="#805b10"
        strokeWidth="1"
      />
      <text
        x="50"
        y="83.8"
        fontSize="3.2"
        fontWeight="bold"
        textAnchor="middle"
        fill="#1E293B"
        letterSpacing="0.2"
        fontFamily="sans-serif"
      >
        BHINNEKA TUNGGAL IKA
      </text>

      {/* Main Shield (Perisai Dada) */}
      <path
        d="M 40,38 C 40,38 40,58 50,68 C 60,58 60,38 60,38 Z"
        fill="#FFFFFF"
        stroke="#996515"
        strokeWidth="1.5"
      />

      {/* Shield Quarters */}
      {/* Top Left (Red: Banteng) */}
      <path d="M 40.5,38.5 L 49.5,38.5 L 49.5,50 L 40.5,46 Z" fill="url(#shieldRed)" />
      {/* Bottom Right (Red: Rantai Emas) */}
      <path d="M 50.5,50 L 59.5,50 L 59.5,54 C 56,60 52,65 50.5,67 Z" fill="url(#shieldRed)" />
      {/* Top Right (White: Pohon Beringin) */}
      <path d="M 50.5,38.5 L 59.5,38.5 L 59.5,46 L 50.5,50 Z" fill="#F8FAFC" />
      {/* Bottom Left (White: Padi & Kapas) */}
      <path d="M 40.5,50 L 49.5,50 L 49.5,67 C 48,65 44,60 40.5,54 Z" fill="#F8FAFC" />

      {/* Center Black Shield & Star (Bintang) */}
      <rect x="47.5" y="47.5" width="5" height="5" fill="#0F172A" rx="0.5" />
      {/* Golden Star in center */}
      <polygon
        points="50,48.2 50.6,49.5 52,49.5 50.9,50.2 51.3,51.5 50,50.7 48.7,51.5 49.1,50.2 48,49.5 49.4,49.5"
        fill="#FACC15"
      />

      {/* Cross dividing line */}
      <line x1="40" y1="50" x2="60" y2="50" stroke="#0F172A" strokeWidth="1" />
      <line x1="50" y1="38" x2="50" y2="67" stroke="#0F172A" strokeWidth="1" />
    </svg>
  );
}

/**
 * Bendera Merah Putih dengan rasio resmi 2:3 dan efek kibaran halus
 */
export function FlagID({ className = "w-6 h-4" }) {
  return (
    <span className={`inline-block overflow-hidden rounded-[2px] shadow-xs border border-slate-200/60 dark:border-white/20 shrink-0 ${className}`}>
      <span className="block h-1/2 bg-[#E11D48] w-full" />
      <span className="block h-1/2 bg-white w-full" />
    </span>
  );
}

/**
 * Pita Merah Putih untuk Topbar / Header
 */
export function RedWhiteRibbon() {
  return (
    <div className="w-full h-1 flex">
      <div className="w-1/2 bg-[#E11D48]" />
      <div className="w-1/2 bg-white border-b border-slate-200 dark:border-neutral-700" />
    </div>
  );
}
