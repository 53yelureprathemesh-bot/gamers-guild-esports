'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Shield, Lock, Mail, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound, Sparkles } from 'lucide-react';
import { AdminRole } from '@/lib/types';

interface PresetAccount {
  label: string;
  roleName: string;
  email: string;
  pass: string;
  role: AdminRole;
}

const PRESET_ACCOUNTS: PresetAccount[] = [
  {
    label: 'Super Admin',
    roleName: 'Root Access',
    email: '53yelureprathemesh@gmail.com',
    pass: 'Prathamesh@27',
    role: 'SUPER_ADMIN'
  },
  {
    label: 'Event Admin',
    roleName: 'Tournaments & Matches',
    email: 'admineventgge@gmail.com',
    pass: 'gamresguildesp@21',
    role: 'EVENT_ADMIN'
  },
  {
    label: 'Reg Manager',
    roleName: 'Registrations & Approvals',
    email: 'eventregester@gge.com',
    pass: 'gamersguildesports@22',
    role: 'REGISTRATION_MANAGER'
  },
  {
    label: 'Content Manager',
    roleName: 'Media & Homepage',
    email: 'managercontantgge@gge.com',
    pass: 'gamersguildesp@ggesports',
    role: 'CONTENT_EDITOR'
  }
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fillPreset = (preset: PresetAccount) => {
    setEmail(preset.email);
    setPassword(preset.pass);
    setErrorMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    try {
      // 1. Authenticate against the backend login API
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

      // 2. Client-side fallback if backend in-memory restart or offline
      const match = PRESET_ACCOUNTS.find(p => p.email.toLowerCase() === trimmedEmail);
      if (match && match.pass === trimmedPassword) {
        localStorage.setItem('gg_admin_user', JSON.stringify({
          email: match.email,
          name: `${match.label}`,
          role: match.role
        }));
        router.push('/admin');
        return;
      }

      setErrorMsg(data.error || 'ACCESS DENIED: Invalid administrator email or password.');
    } catch {
      // Offline fallback
      const match = PRESET_ACCOUNTS.find(p => p.email.toLowerCase() === trimmedEmail);
      if (match && match.pass === trimmedPassword) {
        localStorage.setItem('gg_admin_user', JSON.stringify({
          email: match.email,
          name: `${match.label}`,
          role: match.role
        }));
        router.push('/admin');
        return;
      }

      setErrorMsg('ACCESS DENIED: Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen cyber-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-hud p-8 rounded-2xl border-2 border-neon-cyan/40 shadow-hud relative">
        
        {/* Logo & Header */}
        <div className="text-center mb-6">
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
            Sign in with authorized role-based credentials.
          </p>
        </div>

        {/* Quick Role Fast-Pass Selectors */}
        <div className="mb-6 p-3 rounded-xl bg-cyber-dark/80 border border-cyber-border space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">
            <span className="flex items-center space-x-1">
              <KeyRound className="w-3 h-3 text-neon-cyan" />
              <span>AUTHORIZED ROLES PRESETS:</span>
            </span>
            <span className="text-[9px] text-neon-emerald font-semibold">TAP TO AUTOFILL</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {PRESET_ACCOUNTS.map((preset) => (
              <button
                key={preset.email}
                type="button"
                onClick={() => fillPreset(preset)}
                className={`p-1.5 text-left rounded border transition-all text-[11px] font-mono ${
                  email.toLowerCase() === preset.email.toLowerCase()
                    ? 'border-neon-emerald bg-neon-emerald/15 text-white'
                    : 'border-cyber-border bg-cyber-black/40 text-gray-300 hover:border-neon-cyan/60 hover:text-white'
                }`}
              >
                <div className="font-bold truncate text-[10px] text-neon-cyan">{preset.label}</div>
                <div className="text-[9px] text-gray-400 truncate">{preset.email.split('@')[0]}</div>
              </button>
            ))}
          </div>
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
            className="btn-cyber-primary w-full py-3 rounded-lg text-xs font-black font-mono uppercase tracking-wider flex items-center justify-center space-x-2 shadow-neon-emerald mt-4"
          >
            <Shield className="w-4 h-4 text-cyber-black" />
            <span>{loading ? 'AUTHENTICATING...' : 'AUTHORIZE LOGIN'}</span>
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs font-mono text-gray-400 hover:text-white flex items-center justify-center space-x-1">
            <span>&larr; Return to Public Arena</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
