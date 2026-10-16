import React from 'react';
import { Shield } from 'lucide-react';

interface SyncingLoaderProps {
  title?: string;
  subtitle?: string;
  fullScreen?: boolean;
}

export const SyncingLoader: React.FC<SyncingLoaderProps> = ({
  title = 'SYNCING SERVER',
  subtitle = 'ESTABLISHING CONNECTION WITH DEXTERCORP DASHBOARD',
  fullScreen = true,
}) => {
  return (
    <div
      className={`${
        fullScreen
          ? 'fixed inset-0 z-[9999] bg-[#06070a]'
          : 'w-full h-full min-h-[380px] bg-[#06070a] rounded-2xl'
      } flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-200 font-['Outfit'] overflow-hidden`}
    >
      {/* Background radial glow */}
      <div className="absolute w-72 h-72 bg-white/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Concentric Spinning Dual Rings - Obsidian Monochrome */}
      <div className="relative flex items-center justify-center mb-7">
        {/* Outer Circular Track with Glowing White Arcs */}
        <div className="w-20 h-20 rounded-full border border-white/10 relative flex items-center justify-center">
          {/* Rotating outer white arc ring */}
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-white border-b-white animate-spin"
            style={{ animationDuration: '1.8s', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.7))' }}
          ></div>
        </div>

        {/* Inner Dashed Reverse Rotating Ring */}
        <div
          className="absolute w-14 h-14 rounded-full border border-dashed border-white/40 animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '3s' }}
        ></div>

        {/* Innermost Dark Core Circle with Shield Mascot */}
        <div className="absolute w-9 h-9 rounded-full bg-[#0c0d12] border border-white/50 flex items-center justify-center shadow-[inset_0_0_8px_rgba(255,255,255,0.3)]">
          <Shield className="w-4 h-4 text-white animate-pulse" />
        </div>
      </div>

      {/* Title: SYNCING SERVER */}
      <h3 className="font-orbitron font-bold text-sm sm:text-base tracking-[0.38em] text-white uppercase mb-1.5 drop-shadow-[0_0_14px_rgba(255,255,255,0.4)]">
        {title}
      </h3>

      {/* Subtitle */}
      <p className="font-mono text-[9px] sm:text-[10px] tracking-[0.22em] text-slate-400 uppercase max-w-md">
        {subtitle}
      </p>
    </div>
  );
};
