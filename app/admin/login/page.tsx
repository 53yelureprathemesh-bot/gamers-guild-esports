'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { AdminRole } from '@/lib/types';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Authenticate (Supabase or Demo Fast-Pass)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // Store active session in localStorage for demonstration / mock state
    setTimeout(() => {
      if (email.includes('admin') || password === 'admin123' || email.length > 3) {
        localStorage.setItem('gg_admin_user', JSON.stringify({
          email: email,
          name: email.split('@')[0].toUpperCase(),
          role: 'SUPER_ADMIN'
        }));
        router.push('/admin');
      } else {
        setErrorMsg('Invalid admin credentials. For demo access, use the Quick Role Switcher below.');
      }
      setLoading(false);
    }, 500);
  };

  const handleQuickDemoLogin = (role: AdminRole, title: string) => {
    localStorage.setItem('gg_admin_user', JSON.stringify({
      email: `${role.toLowerCase()}@gamersguild.gg`,
      name: title,
      role: role
    }));
    router.push('/admin');
  };

  return (
    <div className="min-h-screen cyber-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-hud p-8 rounded-2xl border-2 border-neon-cyan/40 shadow-hud relative">
        
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="relative w-20 h-20 mx-auto p-1.5 rounded-2xl bg-cyber-dark border border-neon-emerald/40 flex items-center justify-center mb-3">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neon-emerald font-bold">
            RESTRICTED ACCESS
          </span>
          <h1 className="text-2xl font-black text-white font-mono uppercase mt-0.5">
            ADMIN CONTROL GRID
          </h1>
          <p className="text-xs text-gray-400 font-sans mt-1">
            Sign in with authorized administrator credentials.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-neon-red/20 border border-neon-red/50 text-xs font-mono text-neon-red flex items-center space-x-2 mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono font-bold text-gray-300">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="admin@gamersguild.gg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-bold text-gray-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-cyber-primary w-full py-3 rounded-lg text-xs font-black font-mono uppercase tracking-wider flex items-center justify-center space-x-2 shadow-neon-emerald mt-2"
          >
            <Shield className="w-4 h-4 text-cyber-black" />
            <span>{loading ? 'AUTHENTICATING...' : 'AUTHORIZE LOGIN'}</span>
          </button>
        </form>

        {/* QUICK DEMO ROLE SWITCHER (FOR INSTANT TESTING) */}
        <div className="mt-8 pt-6 border-t border-cyber-border">
          <div className="text-[11px] font-mono text-gray-400 text-center uppercase tracking-wider mb-3">
            QUICK ROLE-BASED ACCESS (TEST RUNNER):
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono font-bold">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('SUPER_ADMIN', 'Guild Commander (Super Admin)')}
              className="p-2 rounded bg-cyber-dark hover:bg-neon-emerald/20 border border-cyber-border hover:border-neon-emerald text-gray-300 hover:text-white text-left transition"
            >
              👑 SUPER ADMIN
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('EVENT_ADMIN', 'Tournament Director (Event Admin)')}
              className="p-2 rounded bg-cyber-dark hover:bg-neon-cyan/20 border border-cyber-border hover:border-neon-cyan text-gray-300 hover:text-white text-left transition"
            >
              🎮 EVENT ADMIN
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('REGISTRATION_MANAGER', 'Arbiter (Registration Manager)')}
              className="p-2 rounded bg-cyber-dark hover:bg-neon-gold/20 border border-cyber-border hover:border-neon-gold text-gray-300 hover:text-white text-left transition"
            >
              📋 REG MANAGER
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('CONTENT_EDITOR', 'Publicist (Content Editor)')}
              className="p-2 rounded bg-cyber-dark hover:bg-neon-purple/20 border border-cyber-border hover:border-neon-purple text-gray-300 hover:text-white text-left transition"
            >
              ✍️ CONTENT EDITOR
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs font-mono text-gray-400 hover:text-white flex items-center justify-center space-x-1">
            <span>&larr; Return to Public Portal</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
