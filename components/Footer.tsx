import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Mail, Phone, MapPin, Disc as Discord, Instagram, Youtube, Twitter, Trophy, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-cyber-black border-t border-cyber-border text-gray-400 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-neon-emerald/5 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center p-1 rounded-lg bg-cyber-dark border border-neon-emerald/30">
                <Image
                  src="/images/logo.png"
                  alt="Gamers Guild Esports Logo"
                  width={44}
                  height={44}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-widest text-white font-mono">
                  GAMERS GUILD
                </span>
                <span className="text-[10px] font-bold tracking-[0.25em] text-neon-cyan uppercase">
                  ESPORTS ORGANIZATION
                </span>
              </div>
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              India’s premier competitive gaming organization. Empowering underground warriors, organizing broadcast-grade championships, and setting new benchmarks in Indian esports.
            </p>

            <div className="pt-2 text-xs font-mono text-neon-emerald tracking-wider font-semibold">
              ENTER THE ARENA. BUILD YOUR LEGACY.
            </div>

            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-3">
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-cyber-dark border border-cyber-border flex items-center justify-center text-gray-400 hover:text-neon-cyan hover:border-neon-cyan/50 hover:shadow-neon-cyan transition-all"
                aria-label="Discord"
              >
                <Discord className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-cyber-dark border border-cyber-border flex items-center justify-center text-gray-400 hover:text-neon-pink hover:border-neon-pink/50 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-cyber-dark border border-cyber-border flex items-center justify-center text-gray-400 hover:text-neon-red hover:border-neon-red/50 transition-all"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-cyber-dark border border-cyber-border flex items-center justify-center text-gray-400 hover:text-neon-cyan hover:border-neon-cyan/50 transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 3: Navigation Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-black tracking-widest text-white uppercase border-l-2 border-neon-emerald pl-2">
              PLATFORM
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-neon-emerald transition-colors">Home Portal</Link>
              </li>
              <li>
                <Link href="/upcoming-events" className="hover:text-neon-emerald transition-colors">Upcoming Tournaments</Link>
              </li>
              <li>
                <Link href="/ongoing-events" className="hover:text-neon-emerald transition-colors">Live Match Scores & Tables</Link>
              </li>
              <li>
                <Link href="/registration" className="text-neon-emerald font-semibold hover:underline">Player & Squad Registration</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-neon-emerald transition-colors">About the Guild</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-neon-emerald transition-colors">Official Contact & Support</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Featured Game Titles */}
          <div className="space-y-3">
            <h3 className="text-xs font-black tracking-widest text-white uppercase border-l-2 border-neon-cyan pl-2">
              COMPETITIVE ROSTER
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-1.5 text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-emerald"></span>
                <span>BGMI Championship</span>
              </li>
              <li className="flex items-center space-x-1.5 text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan"></span>
                <span>Free Fire Max Series</span>
              </li>
              <li className="flex items-center space-x-1.5 text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-gold"></span>
                <span>Valorant Tactical 5v5</span>
              </li>
              <li className="flex items-center space-x-1.5 text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-purple"></span>
                <span>Call of Duty: Mobile</span>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact & Admin */}
          <div className="space-y-3">
            <h3 className="text-xs font-black tracking-widest text-white uppercase border-l-2 border-neon-gold pl-2">
              HEADQUARTERS
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-neon-gold flex-shrink-0 mt-0.5" />
                <span>Cyber District, Nagpur, Maharashtra, India</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                <a href="mailto:contact@gamersguild.gg" className="hover:text-white">contact@gamersguild.gg</a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-neon-emerald flex-shrink-0" />
                <span>+91 98765 43210</span>
              </div>
            </div>

            <div className="pt-3">
              <Link
                href="/admin/login"
                className="inline-flex items-center space-x-2 px-3 py-1.5 text-xs font-bold tracking-wider text-gray-400 hover:text-white bg-cyber-dark/80 hover:bg-cyber-dark border border-cyber-border rounded transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-neon-cyan" />
                <span>Admin Control Panel</span>
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-cyber-border/80 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} <span className="text-gray-300 font-semibold">GAMERS GUILD ESPORTS</span>. All rights reserved.
          </div>
          <div className="flex items-center space-x-6">
            <span className="text-gray-600">State Registration Architecture v1.0</span>
            <Link href="/admin/login" className="hover:text-neon-cyan transition-colors flex items-center space-x-1">
              <span>Admin Access</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
