'use client';

import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Disc as Discord, 
  Instagram, 
  Youtube, 
  Twitter, 
  CheckCircle2, 
  HelpCircle,
  ShieldCheck 
} from 'lucide-react';
import { INITIAL_SITE_SETTINGS } from '@/lib/dataStore';
import { GamingEmberParticles, HudCornerBrackets } from '@/components/GamingVisualEffects';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Tournament Query',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate contact dispatch
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen gaming-arena-bg py-16 relative overflow-hidden font-rajdhani">
      <GamingEmberParticles count={15} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan text-xs font-mono font-bold uppercase tracking-wider mb-3 shadow-[0_0_15px_rgba(0,242,254,0.2)]">
            <Mail className="w-3.5 h-3.5" />
            <span>COMMUNICATION RELAY</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-orbitron uppercase tracking-wide">
            CONTACT <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-white to-neon-emerald">HEADQUARTERS</span>
          </h1>
          <p className="mt-4 text-base text-gray-300 font-rajdhani font-medium tracking-wide">
            Need bracket support, dispute resolution, or sponsorship inquiries? Transmit a message directly to our battle desk.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Direct Info & Socials */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="glass-hud p-6 rounded-2xl border border-neon-emerald/40 space-y-4 relative overflow-hidden shadow-[0_0_25px_rgba(10,255,10,0.08)]">
              <HudCornerBrackets color="emerald" />
              <h2 className="text-lg font-black text-white font-orbitron uppercase tracking-wide">
                DIRECT CONTACT CHANNELS
              </h2>
              
              <div className="space-y-4 text-xs font-mono">
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-cyber-dark/80 border border-cyber-border">
                  <Mail className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-400 block uppercase font-rajdhani font-semibold text-xs">Official Email</span>
                    <a href="mailto:contact@gamersguild.gg" className="text-white font-bold hover:text-neon-cyan transition-colors">
                      contact@gamersguild.gg
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg bg-cyber-dark/80 border border-cyber-border">
                  <Phone className="w-5 h-5 text-neon-emerald flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-400 block uppercase font-rajdhani font-semibold text-xs">Player Helpline & WhatsApp</span>
                    <span className="text-white font-bold">+91 98765 43210</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg bg-cyber-dark/80 border border-cyber-border">
                  <MapPin className="w-5 h-5 text-neon-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-400 block uppercase font-rajdhani font-semibold text-xs">Arena Headquarters</span>
                    <span className="text-white font-bold">Gamers Guild Arena, Cyber District, Nagpur, Maharashtra, India</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Community Socials */}
            <div className="glass-panel p-6 rounded-2xl border border-cyber-border/70 space-y-3 relative overflow-hidden">
              <HudCornerBrackets color="cyan" />
              <h3 className="text-xs font-orbitron font-bold text-gray-200 uppercase tracking-wider">
                OFFICIAL COMMUNITY NETWORKS
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="https://discord.gg"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-lg bg-cyber-dark/80 border border-cyber-border hover:border-neon-cyan/50 text-xs font-mono flex items-center space-x-2 text-gray-300 hover:text-neon-cyan transition-colors"
                >
                  <Discord className="w-4 h-4" />
                  <span className="font-rajdhani font-semibold">Discord Guild</span>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-lg bg-cyber-dark/80 border border-cyber-border hover:border-neon-pink/50 text-xs font-mono flex items-center space-x-2 text-gray-300 hover:text-neon-pink transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  <span className="font-rajdhani font-semibold">Instagram</span>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-lg bg-cyber-dark/80 border border-cyber-border hover:border-neon-red/50 text-xs font-mono flex items-center space-x-2 text-gray-300 hover:text-neon-red transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                  <span className="font-rajdhani font-semibold">YouTube</span>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-lg bg-cyber-dark/80 border border-cyber-border hover:border-neon-cyan/50 text-xs font-mono flex items-center space-x-2 text-gray-300 hover:text-neon-cyan transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  <span className="font-rajdhani font-semibold">Twitter / X</span>
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="glass-panel p-8 rounded-2xl border border-neon-cyan/30 relative overflow-hidden shadow-[0_0_30px_rgba(0,242,254,0.08)]">
              <HudCornerBrackets color="cyan" />
              <h2 className="text-2xl font-black text-white font-orbitron uppercase tracking-wide mb-2">
                TRANSMIT <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-emerald">MESSAGE</span>
              </h2>
              <p className="text-sm text-gray-300 font-rajdhani mb-6 font-medium">
                Fill out the battle form below. Inquiries are dispatched within 24 hours during tournament cycles.
              </p>

              {submitted ? (
                <div className="p-8 text-center space-y-3 bg-neon-emerald/10 border border-neon-emerald/30 rounded-xl relative overflow-hidden">
                  <HudCornerBrackets color="emerald" />
                  <CheckCircle2 className="w-12 h-12 text-neon-emerald mx-auto" />
                  <h3 className="text-xl font-black text-white font-orbitron uppercase tracking-wide">MESSAGE TRANSMITTED</h3>
                  <p className="text-sm text-gray-300 font-rajdhani">
                    Thank you for reaching out. Our tournament desk has received your ticket and will reply shortly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', subject: 'General Query', message: '' });
                    }}
                    className="btn-cyber-secondary clip-esports-btn px-6 py-2.5 text-xs font-orbitron font-bold mt-4"
                  >
                    SEND ANOTHER MESSAGE
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-orbitron font-bold text-gray-300">Your Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-sm font-rajdhani font-semibold bg-cyber-dark/90 border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-cyan"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-orbitron font-bold text-gray-300">Your Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-sm font-rajdhani font-semibold bg-cyber-dark/90 border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-cyan"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-orbitron font-bold text-gray-300">Subject Category</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-sm font-rajdhani font-semibold bg-cyber-dark/90 border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-cyan"
                    >
                      <option value="General Tournament Query">General Tournament Query</option>
                      <option value="Registration Code & Verification">Registration Code & Verification</option>
                      <option value="Anti-Cheat & Dispute Appeal">Anti-Cheat & Dispute Appeal</option>
                      <option value="Sponsorship & Business Partnership">Sponsorship & Business Partnership</option>
                      <option value="Media & Press Inquiries">Media & Press Inquiries</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-orbitron font-bold text-gray-300">Message Transmission *</label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Detail your inquiry, registration code, or proposal..."
                      value={formData.message}
                      onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-sm font-rajdhani font-semibold bg-cyber-dark/90 border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-cyan"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-cyber-primary clip-esports-btn w-full py-3.5 text-sm font-black font-orbitron uppercase tracking-wider flex items-center justify-center space-x-2 shadow-neon-emerald cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-cyber-black" />
                    <span>{loading ? 'TRANSMITTING...' : 'TRANSMIT MESSAGE'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
