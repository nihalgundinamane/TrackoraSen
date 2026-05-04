import React, { useMemo } from 'react';
import './Petals.css';

// SVG cherry blossom — 5 petals with subtle gradient
const SakuraFlower = ({ size, opacity, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    className="petal-svg"
    style={{ opacity, ...style }}
    aria-hidden="true"
  >
    {/* 5 petals rotated around centre */}
    {[0, 72, 144, 216, 288].map((deg, i) => (
      <g key={i} transform={`rotate(${deg} 20 20)`}>
        <ellipse
          cx="20"
          cy="11"
          rx="5.5"
          ry="9"
          fill="url(#petalGrad)"
          stroke="rgba(255,130,170,0.3)"
          strokeWidth="0.4"
        />
      </g>
    ))}
    {/* Centre stamen dot */}
    <circle cx="20" cy="20" r="2.5" fill="rgba(255,220,230,0.9)" />
    <defs>
      <radialGradient id="petalGrad" cx="50%" cy="30%" r="60%">
        <stop offset="0%" stopColor="#ffe0ec" />
        <stop offset="60%" stopColor="#ffaac8" />
        <stop offset="100%" stopColor="#e0607a" stopOpacity="0.7" />
      </radialGradient>
    </defs>
  </svg>
);

const Petals = () => {
  const petals = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      left: `${5 + Math.random() * 90}%`,
      size: 14 + Math.random() * 18,
      duration: `${10 + Math.random() * 12}s`,
      delay: `${-Math.random() * 14}s`,
      opacity: 0.45 + Math.random() * 0.45,
      swayAmp: 30 + Math.random() * 60,
    })), []);

  return (
    <div className="petals-wrap" aria-hidden="true">
      {petals.map(p => (
        <div
          key={p.id}
          className="petal-container"
          style={{
            left: p.left,
            animationDuration: p.duration,
            animationDelay: p.delay,
            '--sway': `${p.swayAmp}px`,
          }}
        >
          <SakuraFlower size={p.size} opacity={p.opacity} />
        </div>
      ))}
    </div>
  );
};

export default React.memo(Petals);
