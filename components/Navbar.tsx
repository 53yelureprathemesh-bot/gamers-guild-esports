'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Shield, Radio, Trophy, Calendar, UserCheck, Flame, Search } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'HOME', href: '/' },
    { name: 'UPCOMING EVENTS', href: '/upcoming-events', icon: Calendar },
    { 
      name: 'ONGOING EVENTS', 
      href: '/ongoing-events', 
      icon: Radio,
      badge: 'LIVE' 
    },
    { name: 'REGISTRATION', href: '/registration', icon: UserCheck, highlight: true },
    { name: 'FIND REGISTRATION', href: '/find-registration', icon: Search },
    { name: 'ABOUT', href: '/about' },
    { name: 'CONTACT', href: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-cyber-black/90 backdrop-blur-md border-b border-cyber-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Name */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center p-0.5 rounded-lg bg-cyber-dark/50 border border-neon-emerald/30 group-hover:border-neon-emerald transition-all duration-300">
              <Image
                src="/images/logo.png"
                alt="Gamers Guild Esports Logo"
                width={46}
                height={46}
                className="object-contain drop-shadow-[0_0_10px_rgba(0,255,157,0.4)] transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-black tracking-widest text-white group-hover:text-neon-emerald transition-colors font-mono">
                GAMERS GUILD
              </span>
              <span className="text-[10px] md:text-xs font-bold tracking-[0.25em] text-neon-cyan uppercase">
                ESPORTS ARENA
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative px-3 py-2 text-xs xl:text-sm font-bold tracking-wider rounded-md transition-all duration-200 flex items-center space-x-1.5 ${
                    link.highlight
                      ? 'bg-neon-emerald/10 text-neon-emerald border border-neon-emerald/40 hover:bg-neon-emerald/20 hover:shadow-neon-emerald'
                      : isActive
                      ? 'text-neon-emerald bg-white/5 border border-neon-emerald/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-neon-red/20 text-neon-red border border-neon-red/40 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-red"></span>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Admin Login & Action CTA */}
          <div className="hidden sm:flex items-center space-x-3">
            <Link
              href="/admin/login"
              className="px-3.5 py-2 text-xs font-bold tracking-wider text-gray-300 hover:text-neon-cyan border border-cyber-border hover:border-neon-cyan/50 rounded bg-cyber-dark/80 transition-all flex items-center space-x-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-neon-cyan" />
              <span>ADMIN</span>
            </Link>

            <Link
              href="/registration"
              className="btn-cyber-primary px-4 py-2 text-xs font-extrabold rounded flex items-center space-x-1.5 shadow-neon-emerald"
            >
              <Flame className="w-3.5 h-3.5 text-cyber-black fill-current" />
              <span>JOIN TOURNAMENT</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center space-x-2">
            <Link
              href="/admin/login"
              className="p-2 text-gray-300 hover:text-neon-cyan border border-cyber-border rounded bg-cyber-dark/80"
              title="Admin Login"
            >
              <Shield className="w-4 h-4 text-neon-cyan" />
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-300 hover:text-white focus:outline-none bg-cyber-dark rounded border border-cyber-border"
              aria-label="Toggle Navigation"
            >
              {isOpen ? <X className="w-6 h-6 text-neon-emerald" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden bg-cyber-black/95 border-b border-cyber-border px-4 pt-3 pb-6 space-y-2 backdrop-blur-xl animate-in slide-in-from-top-4 duration-200">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-bold tracking-wider transition-all flex items-center justify-between ${
                  link.highlight
                    ? 'bg-neon-emerald/20 text-neon-emerald border border-neon-emerald/40'
                    : isActive
                    ? 'bg-white/10 text-neon-emerald border-l-4 border-neon-emerald'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{link.name}</span>
                {link.badge && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-neon-red/20 text-neon-red border border-neon-red/40 animate-pulse">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-cyber-border flex flex-col gap-2">
            <Link
              href="/registration"
              onClick={() => setIsOpen(false)}
              className="btn-cyber-primary w-full py-3 text-center text-sm font-black rounded-lg"
            >
              REGISTER FOR TOURNAMENTS
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 text-center text-xs font-bold text-gray-400 border border-cyber-border rounded-lg hover:text-white"
            >
              ADMINISTRATOR LOGIN
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
