'use client';

import React from 'react';
import { Zap, ShieldCheck } from 'lucide-react';

/**
 * Ambient floating glowing ember sparks across the gaming canvas
 */
export function GamingEmberParticles({ count }: { count?: number } = {}) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Golden & Emerald Floating Embers */}
      <span className="absolute bottom-10 left-[15%] w-2 h-2 rounded-full bg-neon-emerald/70 shadow-[0_0_12px_#00ff9d] animate-ember-1"></span>
      <span className="absolute bottom-20 left-[28%] w-1.5 h-1.5 rounded-full bg-neon-cyan/70 shadow-[0_0_10px_#00f0ff] animate-ember-2"></span>
      <span className="absolute bottom-5 left-[45%] w-2.5 h-2.5 rounded-full bg-neon-gold/70 shadow-[0_0_14px_#ffb800] animate-ember-3"></span>
      <span className="absolute bottom-16 left-[62%] w-1.5 h-1.5 rounded-full bg-neon-cyan/60 shadow-[0_0_10px_#00f0ff] animate-ember-1"></span>
      <span className="absolute bottom-8 left-[78%] w-2 h-2 rounded-full bg-neon-emerald/80 shadow-[0_0_12px_#00ff9d] animate-ember-2"></span>
      <span className="absolute bottom-24 left-[90%] w-1.5 h-1.5 rounded-full bg-neon-gold/80 shadow-[0_0_12px_#ffb800] animate-ember-3"></span>
      <span className="absolute bottom-32 left-[8%] w-2 h-2 rounded-full bg-neon-red/60 shadow-[0_0_10px_#ff2a55] animate-ember-2"></span>
    </div>
  );
}

/**
 * Precision HUD Corner Brackets for gaming cards and banners
 */
export function HudCornerBrackets({ color = 'cyan' }: { color?: 'cyan' | 'emerald' | 'gold' | 'red' }) {
  const colorMap = {
    cyan: 'border-neon-cyan/70',
    emerald: 'border-neon-emerald/70',
    gold: 'border-neon-gold/70',
    red: 'border-neon-red/70',
  };
  const borderColor = colorMap[color] || colorMap.cyan;

  return (
    <>
      <span className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 ${borderColor} pointer-events-none`}></span>
      <span className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 ${borderColor} pointer-events-none`}></span>
      <span className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 ${borderColor} pointer-events-none`}></span>
      <span className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 ${borderColor} pointer-events-none`}></span>
    </>
  );
}

/**
 * Live Esports Telemetry Status Ticker
 */
export function LiveTelemetryTicker() {
  return (
    <div className="w-full bg-cyber-black/95 border-y border-cyber-border py-1.5 px-4 font-mono text-[10px] text-gray-400 overflow-hidden relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1.5 text-neon-emerald font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-neon-emerald animate-ping"></span>
            <span>SYSTEM LIVE</span>
          </span>
          <span className="hidden sm:inline text-cyber-muted">|</span>
          <span className="hidden sm:flex items-center space-x-1 text-neon-cyan">
            <Zap className="w-3 h-3" />
            <span>TICK: 128Hz</span>
          </span>
          <span className="hidden md:inline text-cyber-muted">|</span>
          <span className="hidden md:inline text-gray-300">
            LATENCY: <strong className="text-neon-emerald">14ms</strong>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="hidden lg:flex items-center space-x-1 text-neon-gold">
            <ShieldCheck className="w-3 h-3" />
            <span>ANTI-CHEAT ENGINE: ACTIVE</span>
          </span>
          <span className="text-gray-400 font-mono">
            ARENA UPLINK: <span className="text-neon-cyan font-bold">GGE-IN-MUMBAI-01</span>
          </span>
        </div>
      </div>
    </div>
  );
}
