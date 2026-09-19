'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  UserCheck, 
  Shield, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Edit3, 
  Lock, 
  Search,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { AdminUser, AdminRole } from '@/lib/types';

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [editingAdmin, setEditingAdmin] = useState<Partial<AdminUser> | null>(null);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(true);

  // Check if current user is Super Admin
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gg_admin_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setIsSuperAdmin(parsed.role === 'SUPER_ADMIN');
      }
    } catch {
      setIsSuperAdmin(true);
    }
  }, []);

  const fetchAdmins = () => {
    fetch('/api/admin/data?type=admins')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data && Array.isArray(res.data) && res.data.length > 0) {
          setAdmins(res.data);
        }
      })
      .catch(() => console.log('Using default admin team.'));
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = async () => {
    if (!editingAdmin || !editingAdmin.email || !editingAdmin.full_name) {
      alert('Email and full name are required.');
      return;
    }

    // If new admin, password is required
    if (!editingAdmin.id && (!editingAdmin.password || editingAdmin.password.trim().length < 6)) {
      alert('Password is required and must be at least 6 characters.');
      return;
    }

    // If editing existing admin and password provided, validate length
    if (editingAdmin.password && editingAdmin.password.trim().length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    try {
      const payload: any = {
        ...editingAdmin,
        email: editingAdmin.email.trim().toLowerCase(),
      };

      if (editingAdmin.password && editingAdmin.password.trim()) {
        payload.password = editingAdmin.password.trim();
      }

      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-admin',
          payload
        })
      });
      const data = await res.json();
      if (data.success) {
        setNotice(`Admin settings for "${editingAdmin.full_name}" saved successfully!`);
        fetchAdmins();
        setEditingAdmin(null);
        setTimeout(() => setNotice(null), 4000);
      } else {
        alert('Failed to save admin: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (email.toLowerCase() === '53yelureprathemesh@gmail.com') {
      alert('CANNOT DELETE ROOT SUPER ADMIN: This is the protected master administrator account.');
      return;
    }

    if (!confirm(`Are you sure you want to revoke access for ${email}? This user will no longer be able to log in.`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-admin',
          payload: { id }
        })
      });
      const data = await res.json();
      if (data.success) {
        setNotice(`Revoked administrative access for ${email}`);
        fetchAdmins();
        setTimeout(() => setNotice(null), 3000);
      }
    } catch (err: any) {
      alert('Failed to revoke access: ' + err.message);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setEditingAdmin(prev => prev ? { ...prev, password: pass } : null);
  };

  const filteredAdmins = admins.filter(a => 
    a.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-neon-gold/15 border border-neon-gold/40 text-[10px] font-mono text-neon-gold font-bold uppercase tracking-wider">
              SUPER ADMIN CONSOLE
            </span>
            <span className="text-gray-500 font-mono text-xs">•</span>
            <span className="text-gray-400 font-mono text-xs">Role-Based Access Control</span>
          </div>
          <h1 className="text-2xl font-black text-white font-mono uppercase mt-1">
            ADMIN CREDENTIALS & ACCESS CONTROL
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            Set and manage emails (IDs), passwords, and role permissions for all tournament staff.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingAdmin({
              full_name: '',
              email: '',
              password: '',
              role: 'EVENT_ADMIN',
              is_active: true
            });
            setShowModalPassword(true);
          }}
          className="btn-cyber-primary px-4 py-2.5 rounded-lg text-xs font-mono font-bold uppercase flex items-center space-x-2 shadow-neon-cyan"
        >
          <Plus className="w-4 h-4 text-cyber-black" />
          <span>CREATE NEW ADMIN</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-neon-emerald/20 border border-neon-emerald/50 text-xs font-mono text-neon-emerald flex items-center space-x-2 shadow-neon-glow">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Role Cards Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Super Admin Card */}
        <div className="glass-panel p-4 rounded-xl border border-neon-gold/40 bg-neon-gold/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black text-neon-gold uppercase tracking-wider">SUPER ADMIN</span>
            <Shield className="w-4 h-4 text-neon-gold" />
          </div>
          <div className="text-xs font-mono font-bold text-white truncate">53yelureprathemesh@gmail.com</div>
          <div className="text-[11px] font-mono text-gray-400 flex items-center justify-between pt-1 border-t border-cyber-border">
            <span className="flex items-center space-x-1.5 text-neon-emerald">
              <Lock className="w-3 h-3" />
              <span className="font-bold tracking-wider">PROTECTED KEY</span>
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyber-dark text-neon-gold border border-neon-gold/30 font-bold uppercase">ROOT</span>
          </div>
          <div className="text-[10px] text-gray-400 font-sans">Full Root Access to All Settings & Data</div>
        </div>

        {/* Event Admin Card */}
        <div className="glass-panel p-4 rounded-xl border border-neon-cyan/40 bg-neon-cyan/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black text-neon-cyan uppercase tracking-wider">EVENT ADMIN</span>
            <KeyRound className="w-4 h-4 text-neon-cyan" />
          </div>
          <div className="text-xs font-mono font-bold text-white truncate">admineventgge@gmail.com</div>
          <div className="text-[11px] font-mono text-gray-400 flex items-center justify-between pt-1 border-t border-cyber-border">
            <span className="flex items-center space-x-1.5 text-neon-emerald">
              <Lock className="w-3 h-3" />
              <span className="font-bold tracking-wider">PROTECTED KEY</span>
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyber-dark text-neon-cyan border border-neon-cyan/30 font-bold uppercase">EVENTS</span>
          </div>
          <div className="text-[10px] text-gray-400 font-sans">Tournaments, Matches & Standings</div>
        </div>

        {/* Registration Manager Card */}
        <div className="glass-panel p-4 rounded-xl border border-neon-emerald/40 bg-neon-emerald/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black text-neon-emerald uppercase tracking-wider">REG MANAGER</span>
            <UserCheck className="w-4 h-4 text-neon-emerald" />
          </div>
          <div className="text-xs font-mono font-bold text-white truncate">eventregester@gge.com</div>
          <div className="text-[11px] font-mono text-gray-400 flex items-center justify-between pt-1 border-t border-cyber-border">
            <span className="flex items-center space-x-1.5 text-neon-emerald">
              <Lock className="w-3 h-3" />
              <span className="font-bold tracking-wider">PROTECTED KEY</span>
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyber-dark text-neon-emerald border border-neon-emerald/30 font-bold uppercase">REGISTRATIONS</span>
          </div>
          <div className="text-[10px] text-gray-400 font-sans">Registrations, Forms & Approvals</div>
        </div>

        {/* Content Manager Card */}
        <div className="glass-panel p-4 rounded-xl border border-neon-purple/40 bg-neon-purple/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black text-neon-purple uppercase tracking-wider">CONTENT MANAGER</span>
            <Edit3 className="w-4 h-4 text-neon-purple" />
          </div>
          <div className="text-xs font-mono font-bold text-white truncate">managercontantgge@gge.com</div>
          <div className="text-[11px] font-mono text-gray-400 flex items-center justify-between pt-1 border-t border-cyber-border">
            <span className="flex items-center space-x-1.5 text-neon-emerald">
              <Lock className="w-3 h-3" />
              <span className="font-bold tracking-wider">PROTECTED KEY</span>
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyber-dark text-neon-purple border border-neon-purple/30 font-bold uppercase">CONTENT</span>
          </div>
          <div className="text-[10px] text-gray-400 font-sans">Homepage, Media, Sponsors & News</div>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search admins by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan"
          />
        </div>

        <div className="text-xs font-mono text-gray-400">
          Showing <strong className="text-neon-cyan">{filteredAdmins.length}</strong> of <strong className="text-white">{admins.length}</strong> admin accounts
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-cyber-border">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-cyber-border text-gray-400 uppercase bg-cyber-dark/80">
              <th className="py-3.5 px-4">ADMINISTRATOR</th>
              <th className="py-3.5 px-4">EMAIL (LOGIN ID)</th>
              <th className="py-3.5 px-4">CREDENTIAL KEY</th>
              <th className="py-3.5 px-4">ROLE</th>
              <th className="py-3.5 px-4">PERMISSIONS SCOPE</th>
              <th className="py-3.5 px-4">STATUS</th>
              <th className="py-3.5 px-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-border">
            {filteredAdmins.map((adm) => {
              const isSuper = adm.email.toLowerCase() === '53yelureprathemesh@gmail.com';

              return (
                <tr key={adm.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center space-x-2">
                    <Shield className={`w-4 h-4 ${
                      adm.role === 'SUPER_ADMIN' ? 'text-neon-gold' :
                      adm.role === 'EVENT_ADMIN' ? 'text-neon-cyan' :
                      adm.role === 'REGISTRATION_MANAGER' ? 'text-neon-emerald' :
                      'text-neon-purple'
                    }`} />
                    <span>{adm.full_name}</span>
                  </td>
                  
                  <td className="py-3.5 px-4 text-gray-300">
                    <div className="flex items-center space-x-1.5">
                      <span>{adm.email}</span>
                      <button
                        onClick={() => copyToClipboard(adm.email, `email-${adm.id}`)}
                        className="text-gray-500 hover:text-white"
                        title="Copy Email ID"
                      >
                        {copiedId === `email-${adm.id}` ? <Check className="w-3 h-3 text-neon-emerald" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </td>

                  {/* Protected Credential Key Column */}
                  <td className="py-3.5 px-4">
                    <div className="inline-flex items-center space-x-2 bg-cyber-dark/80 px-2.5 py-1 rounded border border-cyber-border">
                      <Lock className="w-3.5 h-3.5 text-neon-emerald" />
                      <span className="font-mono text-gray-400 text-xs tracking-widest">••••••••</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neon-emerald/10 text-neon-emerald border border-neon-emerald/30 font-bold uppercase">
                        PROTECTED
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      adm.role === 'SUPER_ADMIN' ? 'bg-neon-gold/20 text-neon-gold border border-neon-gold/40' :
                      adm.role === 'EVENT_ADMIN' ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40' :
                      adm.role === 'REGISTRATION_MANAGER' ? 'bg-neon-emerald/20 text-neon-emerald border border-neon-emerald/40' :
                      'bg-neon-purple/20 text-neon-purple border border-neon-purple/40'
                    }`}>
                      {adm.role.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                    {adm.role === 'SUPER_ADMIN' && 'Full Root Control across Entire System'}
                    {adm.role === 'EVENT_ADMIN' && 'Tournaments, Match Schedules, Live Stream & Points'}
                    {adm.role === 'REGISTRATION_MANAGER' && 'Participant Registrations, Approvals & Verification'}
                    {adm.role === 'CONTENT_EDITOR' && 'Homepage Editor, Announcements, Gallery & Sponsors'}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      adm.is_active !== false ? 'text-neon-emerald bg-neon-emerald/10' : 'text-neon-red bg-neon-red/10'
                    }`}>
                      {adm.is_active !== false ? 'Active' : 'Suspended'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingAdmin({ ...adm, password: '' });
                          setShowModalPassword(false);
                        }}
                        className="p-1.5 rounded hover:bg-white/10 text-gray-300 hover:text-neon-cyan transition-colors"
                        title="Edit Admin / Change Password"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {!isSuper && (
                        <button
                          onClick={() => handleDelete(adm.id, adm.email)}
                          className="p-1.5 rounded hover:bg-neon-red/10 text-gray-400 hover:text-neon-red transition-colors"
                          title="Revoke Admin Access"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit / Provision Admin Modal */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-hud p-6 sm:p-7 rounded-2xl border-2 border-neon-cyan/50 max-w-md w-full space-y-4 text-xs font-mono shadow-hud">
            <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
              <h3 className="text-base font-black text-white uppercase flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-neon-cyan" />
                <span>{editingAdmin.id ? 'UPDATE ADMIN CREDENTIALS' : 'PROVISION NEW ADMIN'}</span>
              </h3>
              <span className="text-[10px] text-neon-emerald font-bold uppercase">SUPER ADMIN CLEARANCE</span>
            </div>

            <div>
              <label className="text-gray-300 block mb-1 font-bold">Full Legal Name *</label>
              <input
                type="text"
                required
                value={editingAdmin.full_name || ''}
                onChange={(e) => setEditingAdmin({ ...editingAdmin, full_name: e.target.value })}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white focus:outline-none focus:border-neon-cyan"
                placeholder="Aman Sharma"
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-1 font-bold">Admin Email (Login ID) *</label>
              <input
                type="email"
                required
                value={editingAdmin.email || ''}
                onChange={(e) => setEditingAdmin({ ...editingAdmin, email: e.target.value })}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white focus:outline-none focus:border-neon-cyan"
                placeholder="admineventgge@gmail.com"
              />
            </div>

            {/* Password Field with Generator & Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-gray-300 font-bold">
                  {editingAdmin.id ? 'Reset Access Password (optional)' : 'Access Password *'}
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[10px] text-neon-cyan hover:underline flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generate Strong</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showModalPassword ? 'text' : 'password'}
                  required={!editingAdmin.id}
                  value={editingAdmin.password || ''}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, password: e.target.value })}
                  className="w-full pl-3 pr-9 py-2 bg-cyber-dark border border-cyber-border rounded text-white focus:outline-none focus:border-neon-cyan"
                  placeholder={editingAdmin.id ? 'Leave blank to keep current secret password...' : 'Enter strong password (min 6 chars)...'}
                />
                <button
                  type="button"
                  onClick={() => setShowModalPassword(!showModalPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                {editingAdmin.id 
                  ? 'Keep blank to preserve the existing password, or enter a new one to reset access.'
                  : 'Share this email and password privately with the team member to grant access.'}
              </p>
            </div>

            <div>
              <label className="text-gray-300 block mb-1 font-bold">Role Allocation</label>
              <select
                value={editingAdmin.role || 'EVENT_ADMIN'}
                onChange={(e) => setEditingAdmin({ ...editingAdmin, role: e.target.value as AdminRole })}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white focus:outline-none focus:border-neon-cyan"
              >
                <option value="SUPER_ADMIN">SUPER ADMIN (Full Root Control)</option>
                <option value="EVENT_ADMIN">EVENT ADMIN (Tournaments, Matches & Points)</option>
                <option value="REGISTRATION_MANAGER">REGISTRATION MANAGER (Registrations & Approvals)</option>
                <option value="CONTENT_EDITOR">CONTENT EDITOR (Home Editor, Media, Sponsors & News)</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="activeToggle"
                checked={editingAdmin.is_active !== false}
                onChange={(e) => setEditingAdmin({ ...editingAdmin, is_active: e.target.checked })}
                className="rounded bg-cyber-dark border-cyber-border text-neon-emerald focus:ring-0"
              />
              <label htmlFor="activeToggle" className="text-gray-300 select-none cursor-pointer">
                Account Active (Can log in to admin panel)
              </label>
            </div>

            <div className="pt-4 border-t border-cyber-border flex justify-end space-x-2">
              <button 
                onClick={() => setEditingAdmin(null)} 
                className="px-4 py-2 text-gray-400 font-bold hover:text-white"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="btn-cyber-primary px-5 py-2 rounded font-bold uppercase shadow-neon-emerald"
              >
                Save Credentials
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
