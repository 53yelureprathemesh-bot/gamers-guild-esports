'use client';

import React from 'react';
import { Zap, ShieldCheck } from 'lucide-react';

/**
 * Ambient floating glowing ember sparks across the gaming canvas
 */
export function GamingEmberParticles({ count }: { count?: number } = {}) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Dynamic Laser Beams Cutting Across */}
      <div className="absolute -top-24 left-1/4 w-[600px] h-[2px] bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent rotate-12 blur-[1px] animate-pulse"></div>
      <div className="absolute -top-32 right-1/4 w-[600px] h-[2px] bg-gradient-to-r from-transparent via-neon-emerald/50 to-transparent -rotate-12 blur-[1px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>

      {/* Volumetric Radial Arena Glows */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[550px] h-[550px] bg-neon-cyan/12 blur-[150px] rounded-full"></div>
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-neon-emerald/12 blur-[160px] rounded-full"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[450px] h-[450px] bg-neon-red/10 blur-[140px] rounded-full"></div>

      {/* Floating Glowing Battle Embers & Sparks */}
      <span className="absolute bottom-10 left-[12%] w-2.5 h-2.5 rounded-full bg-neon-emerald shadow-[0_0_16px_#00ff9d] animate-ember-1"></span>
      <span className="absolute bottom-24 left-[24%] w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_14px_#00f0ff] animate-ember-2"></span>
      <span className="absolute bottom-6 left-[38%] w-3 h-3 rounded-full bg-neon-gold shadow-[0_0_18px_#ffb800] animate-ember-3"></span>
      <span className="absolute bottom-20 left-[52%] w-2 h-2 rounded-full bg-neon-emerald shadow-[0_0_14px_#00ff9d] animate-ember-1"></span>
      <span className="absolute bottom-12 left-[65%] w-2.5 h-2.5 rounded-full bg-neon-cyan shadow-[0_0_16px_#00f0ff] animate-ember-2"></span>
      <span className="absolute bottom-28 left-[76%] w-2 h-2 rounded-full bg-neon-red shadow-[0_0_14px_#ff2a55] animate-ember-3"></span>
      <span className="absolute bottom-8 left-[88%] w-2.5 h-2.5 rounded-full bg-neon-gold shadow-[0_0_16px_#ffb800] animate-ember-1"></span>
      <span className="absolute bottom-36 left-[6%] w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_14px_#00f0ff] animate-ember-2"></span>
      <span className="absolute bottom-16 left-[94%] w-2 h-2 rounded-full bg-neon-emerald shadow-[0_0_14px_#00ff9d] animate-ember-3"></span>
      <span className="absolute bottom-40 left-[45%] w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_12px_#ffffff] animate-ember-1"></span>
      <span className="absolute bottom-18 left-[82%] w-2 h-2 rounded-full bg-neon-gold shadow-[0_0_14px_#ffb800] animate-ember-2"></span>
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
