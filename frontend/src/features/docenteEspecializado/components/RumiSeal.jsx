import React from 'react';

export default function RumiSeal({ className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`rumi-seal select-none pointer-events-none ${className}`}
      style={{ opacity: 0.06, ...style }}
    >
      <circle cx="100" cy="100" r="94" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />
      <circle cx="100" cy="100" r="87" stroke="currentColor" strokeWidth="1" />

      <path id="sealTextPath" d="M 100,100 m -68,0 a 68,68 0 1,1 136,0 a 68,68 0 1,1 -136,0" fill="transparent" />
      <text fill="currentColor" fontSize="8.2" fontWeight="800" letterSpacing="1.8">
        <textPath href="#sealTextPath" startOffset="50%" textAnchor="middle">
          RUMI EDUCATION • MARCA PERSONAL DOCENTE • RUMI •
        </textPath>
      </text>

      <g transform="translate(58, 86) scale(0.34)" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 10,60 L 25,10 L 45,35 L 65,10 L 80,60 Z" />
        <polygon points="25,48 32,48 28,42" fill="currentColor" />
        <polygon points="65,48 58,48 62,42" fill="currentColor" />
        <path d="M 38,58 L 45,52 L 52,58 L 45,66 Z" />
        <polygon points="42,54 48,54 45,58" fill="currentColor" />
        <path d="M 28,38 L 45,46 L 62,38" />
      </g>

      <g transform="translate(104, 86) scale(0.34)" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="45" cy="45" r="28" />
        <path d="M 18,48 C 5,48 5,38 18,36 Z" fill="currentColor" opacity="0.1" />
        <circle cx="38" cy="38" r="3" fill="currentColor" />
        <path d="M 38,34 Q 35,30 32,31" />
        <path d="M 40,35 Q 40,29 37,29" />
        <path d="M 58,22 C 64,18 68,26 62,28 C 68,30 64,38 58,34 C 54,36 50,32 54,28 Z" fill="currentColor" />
        <circle cx="58" cy="28" r="2" fill="currentColor" />
      </g>

      <line x1="100" y1="62" x2="100" y2="138" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
    </svg>
  );
}
