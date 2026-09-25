'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { GamingEmberParticles, HudCornerBrackets } from '@/components/GamingVisualEffects';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword })
      });

      const data = await res.json();

      if (data.success && data.admin) {
        localStorage.setItem('gg_admin_user', JSON.stringify({
          id: data.admin.id,
          email: data.admin.email,
          name: data.admin.name,
          role: data.admin.role
        }));
        router.push('/admin');
        return;
      }

      setErrorMsg(data.error || 'ACCESS DENIED: Invalid administrator email or password.');
    } catch {
      setErrorMsg('ACCESS DENIED: Connection error during credential authorization.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gaming-arena-bg flex items-center justify-center p-4 relative overflow-hidden font-rajdhani">
      <GamingEmberParticles count={15} />
      <div className="max-w-md w-full glass-hud p-8 rounded-2xl border-2 border-neon-cyan/40 shadow-[0_0_40px_rgba(0,242,254,0.15)] relative overflow-hidden z-10">
        <HudCornerBrackets color="cyan" />
        
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="relative w-20 h-20 mx-auto p-1.5 rounded-2xl bg-cyber-dark/90 border border-neon-emerald/50 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(10,255,10,0.2)]">
            <Image
              src="/images/logo.png"
              alt="Gamers Guild Logo"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <span className="text-[10px] font-orbitron uppercase tracking-[0.25em] text-neon-emerald font-bold">
            RESTRICTED ACCESS
          </span>
          <h1 className="text-2xl font-black text-white font-orbitron uppercase mt-1 tracking-wide">
            ADMIN <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-emerald">CONTROL GRID</span>
          </h1>
          <p className="text-xs text-gray-300 font-rajdhani mt-1 font-medium">
            Enter authorized administrator credentials to access your control sector.
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
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-gray-300">Admin Email ID</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="admin@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-gray-300">Access Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-neon-cyan focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-cyber-primary clip-esports-btn w-full py-3.5 text-xs font-black font-orbitron uppercase tracking-wider flex items-center justify-center space-x-2 shadow-neon-emerald mt-6 cursor-pointer"
          >
            <Shield className="w-4 h-4 text-cyber-black" />
            <span>{loading ? 'AUTHENTICATING CREDENTIALS...' : 'AUTHORIZE LOGIN'}</span>
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 pt-4 border-t border-cyber-border/60 text-center">
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
            Protected Portal • Unauthorized access attempts are monitored and logged.
          </p>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-xs font-mono text-gray-400 hover:text-white flex items-center justify-center space-x-1">
            <span>&larr; Return to Public Arena</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
