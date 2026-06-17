import React from 'react';

function Footprint({ type = 'duck', style }) {
  const emoji = type === 'husky' ? '🐾' : '🦆';
  return (
    <div className={`de-footprint de-footprint-${type}`} style={style}>
      <span className="de-footprint-emoji" aria-hidden>
        {emoji}
      </span>
    </div>
  );
}

export default function Footprints() {
  // Positions are designed to appear diagonally across the hero
  const positions = [
    { top: '70%', left: '10%', delay: '0s', type: 'duck' },
    { top: '60%', left: '22%', delay: '0.2s', type: 'husky' },
    { top: '50%', left: '34%', delay: '0.4s', type: 'duck' },
    { top: '40%', left: '46%', delay: '0.6s', type: 'husky' },
  ];

  return (
    <div className="de-footprints absolute inset-0 pointer-events-none">
      {positions.map((p, i) => (
        <Footprint key={i} type={p.type} style={{ top: p.top, left: p.left, animationDelay: p.delay }} />
      ))}
    </div>
  );
}
