import React, { useState, useEffect } from 'react';
import { Activity, Zap, Shield, Flame } from 'lucide-react';

export default function TelemetrySnapshot({ label, value, type, height = 70 }) {
  const [points, setPoints] = useState([]);

  // Generate responsive real-time oscilloscope telemetry waves
  useEffect(() => {
    const initialPoints = Array.from({ length: 30 }, () => 40 + Math.random() * 30);
    setPoints(initialPoints);

    const interval = setInterval(() => {
      setPoints((prev) => {
        const next = [...prev.slice(1)];
        let base = 50;
        if (type === 'temp') base = 40 + Math.sin(Date.now() / 1500) * 15;
        if (type === 'vibrate') base = 50 + (Math.random() > 0.8 ? Math.random() * 25 : Math.random() * 10);
        if (type === 'pressure') base = 60 + Math.cos(Date.now() / 2000) * 10;
        if (type === 'electric') base = 45 + Math.sin(Date.now() / 600) * 20;

        next.push(Math.max(10, Math.min(base + Math.random() * 10, 90)));
        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [type]);

  const pathD = points
    .map((p, idx) => {
      const x = (idx / (points.length - 1)) * 260; // scale to viewbox
      const y = height - (p / 100) * height;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const getThemeColor = () => {
    switch (type) {
      case 'temp': return { stroke: '#ffb4ab', fill: 'rgba(255, 180, 171, 0.08)', icon: <Flame className="w-3.5 h-3.5 text-[#ffb4ab]" /> };
      case 'vibrate': return { stroke: '#9cd2b8', fill: 'rgba(156, 210, 184, 0.08)', icon: <Activity className="w-3.5 h-3.5 text-[#9cd2b8]" /> };
      case 'pressure': return { stroke: '#cbc3d9', fill: 'rgba(203, 195, 217, 0.08)', icon: <Shield className="w-3.5 h-3.5 text-[#cbc3d9]" /> };
      case 'electric': return { stroke: '#f4bc59', fill: 'rgba(244, 188, 89, 0.08)', icon: <Zap className="w-3.5 h-3.5 text-[#f4bc59]" /> };
    }
  };

  const theme = getThemeColor();

  return (
    <div className="p-3.5 bg-[#141314]/80 border border-white/5 rounded-xl hover:border-white/10 transition-all flex flex-col gap-2 relative overflow-hidden select-none">
      
      {/* Mini Title Grid */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[#cac5cc]/60">
          {theme.icon}
          <span className="font-mono text-[10px] tracking-wider uppercase font-semibold">{label}</span>
        </div>
        <span className="font-mono text-white text-xs font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">
          {value}
        </span>
      </div>

      {/* SVG Oscilloscope Panel */}
      <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
        <svg 
          viewBox={`0 0 260 ${height}`} 
          className="w-full h-full" 
          preserveAspectRatio="none"
        >
          {/* Wave Path Backfill */}
          <path
            d={`${pathD} L 260 ${height} L 0 ${height} Z`}
            fill={theme.fill}
            className="transition-all duration-150"
          />
          {/* Signal Ray line */}
          <path
            d={pathD}
            fill="none"
            stroke={theme.stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-150"
          />
        </svg>

        {/* Real-time scan swipe line */}
        <div 
          className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white/10 to-transparent pointer-events-none animate-pulse"
        ></div>
      </div>
    </div>
  );
}
