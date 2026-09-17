'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Trophy, 
  Target, 
  Eye, 
  Users, 
  Flame, 
  ShieldCheck, 
  Award, 
  MapPin, 
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { SiteSettings } from '@/lib/types';
import { INITIAL_SITE_SETTINGS } from '@/lib/dataStore';

export default function AboutPage() {
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);

  useEffect(() => {
    fetch('/api/admin/data?type=settings')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) setSettings(res.data);
      })
      .catch(() => console.log('Using initial settings.'));
  }, []);

  return (
    <div className="min-h-screen cyber-bg py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neon-emerald/10 border border-neon-emerald/30 text-neon-emerald text-xs font-mono font-bold uppercase mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ORGANIZATION BLUEPRINT</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-mono uppercase tracking-tight">
            ABOUT GAMERS GUILD ESPORTS
          </h1>
          <p className="mt-4 text-sm sm:text-base text-gray-300 font-sans leading-relaxed">
            {settings.about.description}
          </p>
        </div>

        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          <div className="glass-hud p-8 rounded-2xl border border-neon-cyan/40 relative">
            <div className="w-12 h-12 rounded-xl bg-neon-cyan/20 border border-neon-cyan/50 flex items-center justify-center text-neon-cyan mb-4">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white font-mono uppercase mb-2">
              OUR MISSION
            </h3>
            <p className="text-sm text-gray-300 font-sans leading-relaxed">
              {settings.about.mission}
            </p>
          </div>

          <div className="glass-hud p-8 rounded-2xl border border-neon-gold/40 relative">
            <div className="w-12 h-12 rounded-xl bg-neon-gold/20 border border-neon-gold/50 flex items-center justify-center text-neon-gold mb-4">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white font-mono uppercase mb-2">
              OUR VISION
            </h3>
            <p className="text-sm text-gray-300 font-sans leading-relaxed">
              {settings.about.vision}
            </p>
          </div>

        </div>

        {/* WHAT WE DO SECTION */}
        <div className="glass-panel p-8 sm:p-12 rounded-2xl border border-cyber-border mb-16">
          <h2 className="text-2xl font-black text-white font-mono uppercase mb-8 border-l-4 border-neon-emerald pl-4">
            WHAT WE DO
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-cyber-dark/80 border border-cyber-border space-y-2">
              <div className="text-neon-emerald font-black font-mono text-sm uppercase">1. Tier-1 Tournament Operations</div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Hosting broadcast-quality online leagues and offline LAN spectacles with high-tickrate custom servers and zero-latency pipelines.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-cyber-dark/80 border border-cyber-border space-y-2">
              <div className="text-neon-cyan font-black font-mono text-sm uppercase">2. State Talent Scouting</div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Assigning unique state codes (e.g. MH27, GJ14, MP8) to track grassroots athletes across every district of India.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-cyber-dark/80 border border-cyber-border space-y-2">
              <div className="text-neon-gold font-black font-mono text-sm uppercase">3. Production & Live Casting</div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Full esports broadcast desk with professional commentary, real-time stat overlays, player cameras, and sponsor integrations.
              </p>
            </div>
          </div>
        </div>

        {/* ACHIEVEMENTS & MILESTONES */}
        <div className="glass-panel p-8 sm:p-12 rounded-2xl border border-cyber-border mb-16">
          <h2 className="text-2xl font-black text-white font-mono uppercase mb-8 border-l-4 border-neon-gold pl-4">
            ORGANIZATIONAL ACHIEVEMENTS
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-xl bg-cyber-dark border border-cyber-border">
              <div className="text-3xl sm:text-4xl font-black text-neon-emerald font-mono">500+</div>
              <div className="text-xs font-mono font-bold text-gray-400 mt-2 uppercase">ATHLETES ROSTERED</div>
            </div>
            <div className="p-6 rounded-xl bg-cyber-dark border border-cyber-border">
              <div className="text-3xl sm:text-4xl font-black text-neon-cyan font-mono">25+</div>
              <div className="text-xs font-mono font-bold text-gray-400 mt-2 uppercase">CHAMPIONSHIPS HOSTED</div>
            </div>
            <div className="p-6 rounded-xl bg-cyber-dark border border-cyber-border">
              <div className="text-3xl sm:text-4xl font-black text-neon-gold font-mono">₹1,00,000+</div>
              <div className="text-xs font-mono font-bold text-gray-400 mt-2 uppercase">PRIZES DISTRIBUTED</div>
            </div>
            <div className="p-6 rounded-xl bg-cyber-dark border border-cyber-border">
              <div className="text-3xl sm:text-4xl font-black text-neon-purple font-mono">10+</div>
              <div className="text-xs font-mono font-bold text-gray-400 mt-2 uppercase">CITIES REPRESENTED</div>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="text-center pt-8">
          <Link
            href="/registration"
            className="btn-cyber-primary px-8 py-4 rounded-xl text-sm font-black font-mono uppercase tracking-wider inline-flex items-center space-x-2"
          >
            <Flame className="w-5 h-5 text-cyber-black fill-current" />
            <span>JOIN THE COMPETITIVE RANKS</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
