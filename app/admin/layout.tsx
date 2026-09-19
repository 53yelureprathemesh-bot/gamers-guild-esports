'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Edit3, 
  Calendar, 
  Radio, 
  FileText, 
  Users, 
  Megaphone, 
  Image as GalleryIcon, 
  Award, 
  ShieldAlert, 
  Mail, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { AdminRole } from '@/lib/types';

interface CurrentAdmin {
  email: string;
  name: string;
  role: AdminRole;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<CurrentAdmin | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check login state
  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsAuthorized(true);
      return;
    }

    const stored = localStorage.getItem('gg_admin_user');
    if (!stored) {
      setIsAuthorized(false);
      router.replace('/admin/login');
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      const validRoles: AdminRole[] = ['SUPER_ADMIN', 'EVENT_ADMIN', 'REGISTRATION_MANAGER', 'CONTENT_EDITOR'];
      if (parsed && parsed.email && validRoles.includes(parsed.role)) {
        setAdmin(parsed);
        setIsAuthorized(true);
      } else {
        localStorage.removeItem('gg_admin_user');
        setIsAuthorized(false);
        router.replace('/admin/login');
      }
    } catch {
      localStorage.removeItem('gg_admin_user');
      setIsAuthorized(false);
      router.replace('/admin/login');
    }
  }, [pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Security gate: Block unauthorized visitors while redirecting
  if (!isAuthorized) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center p-4">
        <div className="glass-hud p-8 rounded-2xl border border-neon-cyan/40 text-center font-mono space-y-3">
          <div className="w-8 h-8 mx-auto border-2 border-neon-emerald border-t-transparent rounded-full animate-spin"></div>
          <div className="text-xs text-gray-300 tracking-wider">VERIFYING ADMIN SECURITY CREDENTIALS...</div>
        </div>
      </div>
    );
  }

  const role = admin?.role || 'SUPER_ADMIN';

  // Navigation Items with Role Restrictions
  const navItems = [
    { 
      name: 'Dashboard', 
      href: '/admin', 
      icon: LayoutDashboard,
      allowed: ['SUPER_ADMIN', 'EVENT_ADMIN', 'REGISTRATION_MANAGER', 'CONTENT_EDITOR']
    },
    { 
      name: 'Home Editor', 
      href: '/admin/home-editor', 
      icon: Edit3,
      allowed: ['SUPER_ADMIN', 'CONTENT_EDITOR']
    },
    { 
      name: 'Upcoming Events', 
      href: '/admin/upcoming-events', 
      icon: Calendar,
      allowed: ['SUPER_ADMIN', 'EVENT_ADMIN']
    },
    { 
      name: 'Ongoing Events', 
      href: '/admin/ongoing-events', 
      icon: Radio,
      allowed: ['SUPER_ADMIN', 'EVENT_ADMIN']
    },
    { 
      name: 'Registration Forms', 
      href: '/admin/forms', 
      icon: FileText,
      allowed: ['SUPER_ADMIN', 'REGISTRATION_MANAGER']
    },
    { 
      name: 'Registrations', 
      href: '/admin/registrations', 
      icon: Users,
      allowed: ['SUPER_ADMIN', 'REGISTRATION_MANAGER']
    },
    { 
      name: 'Announcements', 
      href: '/admin/announcements', 
      icon: Megaphone,
      allowed: ['SUPER_ADMIN', 'CONTENT_EDITOR']
    },
    { 
      name: 'Gallery', 
      href: '/admin/gallery', 
      icon: GalleryIcon,
      allowed: ['SUPER_ADMIN', 'CONTENT_EDITOR']
    },
    { 
      name: 'Sponsors', 
      href: '/admin/sponsors', 
      icon: Award,
      allowed: ['SUPER_ADMIN', 'CONTENT_EDITOR']
    },
    { 
      name: 'Users & Permissions', 
      href: '/admin/users', 
      icon: ShieldAlert,
      allowed: ['SUPER_ADMIN']
    },
    { 
      name: 'Email Settings', 
      href: '/admin/email-settings', 
      icon: Mail,
      allowed: ['SUPER_ADMIN']
    },
    { 
      name: 'State Codes & Settings', 
      href: '/admin/settings', 
      icon: Settings,
      allowed: ['SUPER_ADMIN']
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('gg_admin_user');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-cyber-black text-white flex flex-col md:flex-row">
      
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-cyber-dark border-b border-cyber-border">
        <div className="flex items-center space-x-2">
          <Image src="/images/logo.png" alt="Logo" width={32} height={32} />
          <span className="font-mono font-bold text-sm text-neon-emerald">ADMIN PANEL</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded bg-cyber-black border border-cyber-border text-gray-300"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-cyber-dark border-r border-cyber-border flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          {/* Logo & Identity */}
          <div className="p-5 border-b border-cyber-border flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-cyber-black border border-neon-emerald/30 p-1 flex items-center justify-center flex-shrink-0">
              <Image src="/images/logo.png" alt="Logo" width={34} height={34} className="object-contain" />
            </div>
            <div>
              <div className="font-mono font-black text-xs tracking-wider text-white">GAMERS GUILD</div>
              <div className="text-[10px] font-mono font-bold text-neon-cyan uppercase">CONTROL CENTER</div>
            </div>
          </div>

          {/* Active Admin Profile Tag */}
          <div className="px-5 py-3 bg-cyber-black/50 border-b border-cyber-border">
            <div className="text-[11px] font-mono text-gray-400">LOGGED IN AS:</div>
            <div className="text-xs font-mono font-bold text-white truncate">{admin?.name || 'Administrator'}</div>
            <div className="mt-1 inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-neon-emerald/10 border border-neon-emerald/40 text-[10px] font-mono text-neon-emerald font-bold uppercase">
              <ShieldCheck className="w-3 h-3" />
              <span>{role.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            {navItems.map((item) => {
              const isAllowed = item.allowed.includes(role);
              const isActive = pathname === item.href;

              if (!isAllowed) return null;

              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    isActive
                      ? 'bg-neon-emerald/15 text-neon-emerald border-l-4 border-neon-emerald'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-cyber-border space-y-2">
          <Link
            href="/"
            target="_blank"
            className="w-full py-2 text-xs font-mono text-gray-400 hover:text-white flex items-center justify-center space-x-1.5 rounded bg-cyber-black border border-cyber-border"
          >
            <span>Live Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full py-2 text-xs font-mono text-neon-red hover:bg-neon-red/10 flex items-center justify-center space-x-1.5 rounded border border-neon-red/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-screen">
        {(() => {
          const currentNav = navItems.find(item => item.href === pathname);
          const isPageAllowed = !currentNav || currentNav.allowed.includes(role);

          if (!isPageAllowed) {
            return (
              <div className="min-h-[60vh] flex items-center justify-center">
                <div className="glass-hud p-8 rounded-2xl border border-neon-red/40 max-w-md w-full text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-neon-red/10 border border-neon-red flex items-center justify-center mx-auto text-neon-red">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-black font-mono text-white uppercase tracking-wider">RESTRICTED PRIVILEGES</h2>
                    <p className="text-xs text-gray-400 font-mono mt-1 leading-relaxed">
                      Your designated role (<span className="text-neon-cyan font-bold">{role.replace('_', ' ')}</span>) does not have authorization to view or modify this sector.
                    </p>
                  </div>
                  <Link href="/admin" className="btn-cyber-primary inline-flex px-5 py-2.5 rounded text-xs font-mono font-bold uppercase">
                    Return to Authorized Dashboard
                  </Link>
                </div>
              </div>
            );
          }

          return children;
        })()}
      </main>

    </div>
  );
}
