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
      const trimmedEmail = email.trim().toLowerCase();
      if (trimmedEmail === '53yelureprathemesh@gmail.com' && password === 'Prathamesh@27') {
        localStorage.setItem('gg_admin_user', JSON.stringify({
          email: '53yelureprathemesh@gmail.com',
          name: 'Prathamesh (Super Admin)',
          role: 'SUPER_ADMIN'
        }));
        router.push('/admin');
      } else {
        setErrorMsg('ACCESS DENIED: Invalid administrator credentials.');
      }
      setLoading(false);
    }, 400);
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
                placeholder="admin@domain.com"
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
            className="btn-cyber-primary w-full py-3 rounded-lg text-xs font-black font-mono uppercase tracking-wider flex items-center justify-center space-x-2 shadow-neon-emerald mt-4"
          >
            <Shield className="w-4 h-4 text-cyber-black" />
            <span>{loading ? 'AUTHENTICATING...' : 'AUTHORIZE LOGIN'}</span>
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs font-mono text-gray-400 hover:text-white flex items-center justify-center space-x-1">
            <span>&larr; Return to Public Portal</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
