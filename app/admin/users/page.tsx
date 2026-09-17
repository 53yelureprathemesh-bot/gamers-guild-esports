'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Trash2, CheckCircle2, UserCheck, Shield } from 'lucide-react';
import { AdminUser, AdminRole } from '@/lib/types';
import { INITIAL_ADMINS } from '@/lib/dataStore';

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminUser[]>(INITIAL_ADMINS);
  const [editingAdmin, setEditingAdmin] = useState<Partial<AdminUser> | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/data?type=admins')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) setAdmins(res.data);
      })
      .catch(() => console.log('Using default admin team.'));
  }, []);

  const handleSave = async () => {
    if (!editingAdmin || !editingAdmin.email || !editingAdmin.full_name) {
      alert('Email and full name are required.');
      return;
    }

    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-admin',
          payload: editingAdmin
        })
      });
      const data = await res.json();
      if (data.success) {
        setNotice('Administrator permissions granted successfully!');
        setAdmins([data.data, ...admins.filter(a => a.id !== data.data.id)]);
        setEditingAdmin(null);
        setTimeout(() => setNotice(null), 3000);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-mono uppercase">
            ADMINISTRATIVE ROLES & PERMISSIONS
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            Authorize team members with role-based access control (Super Admin only).
          </p>
        </div>

        <button
          onClick={() => setEditingAdmin({
            full_name: '',
            email: '',
            role: 'REGISTRATION_MANAGER',
            is_active: true
          })}
          className="btn-cyber-primary px-4 py-2 rounded text-xs font-mono font-bold uppercase flex items-center space-x-1"
        >
          <Plus className="w-4 h-4 text-cyber-black" />
          <span>PROVISION ADMIN</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-neon-emerald/20 border border-neon-emerald/50 text-xs font-mono text-neon-emerald flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      <div className="glass-panel rounded-xl overflow-hidden border border-cyber-border">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-cyber-border text-gray-400 uppercase bg-cyber-dark/60">
              <th className="py-3 px-4">ADMINISTRATOR</th>
              <th className="py-3 px-4">EMAIL IDENTITY</th>
              <th className="py-3 px-4">DESIGNATED ROLE</th>
              <th className="py-3 px-4">PERMISSIONS SCOPE</th>
              <th className="py-3 px-4">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-border">
            {admins.map((adm) => (
              <tr key={adm.id} className="hover:bg-white/5">
                <td className="py-3.5 px-4 font-bold text-white flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-neon-cyan" />
                  <span>{adm.full_name}</span>
                </td>
                <td className="py-3.5 px-4 text-gray-300">{adm.email}</td>
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
                <td className="py-3.5 px-4 text-gray-400">
                  {adm.role === 'SUPER_ADMIN' && 'Full Root Control across System'}
                  {adm.role === 'EVENT_ADMIN' && 'Tournament Schedules & Live Points'}
                  {adm.role === 'REGISTRATION_MANAGER' && 'Private Registrations & ID Verification'}
                  {adm.role === 'CONTENT_EDITOR' && 'Homepage, Media, Sponsors & News'}
                </td>
                <td className="py-3.5 px-4">
                  <span className="text-[10px] font-bold text-neon-emerald uppercase">
                    {adm.is_active ? 'Active' : 'Suspended'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingAdmin && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-hud p-6 rounded-2xl border-2 border-neon-cyan/50 max-w-md w-full space-y-4 text-xs font-mono">
            <h3 className="text-base font-black text-white uppercase">PROVISION ADMIN CREDENTIALS</h3>

            <div>
              <label className="text-gray-300 block mb-1">Full Legal Name *</label>
              <input
                type="text"
                value={editingAdmin.full_name || ''}
                onChange={(e) => setEditingAdmin({ ...editingAdmin, full_name: e.target.value })}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white"
                placeholder="Aman Sharma"
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-1">Admin Email *</label>
              <input
                type="email"
                value={editingAdmin.email || ''}
                onChange={(e) => setEditingAdmin({ ...editingAdmin, email: e.target.value })}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white"
                placeholder="events@gamersguild.gg"
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-1">Role Allocation</label>
              <select
                value={editingAdmin.role || 'REGISTRATION_MANAGER'}
                onChange={(e) => setEditingAdmin({ ...editingAdmin, role: e.target.value as AdminRole })}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white"
              >
                <option value="SUPER_ADMIN">SUPER ADMIN (Full Access)</option>
                <option value="EVENT_ADMIN">EVENT ADMIN (Tournaments & Standings)</option>
                <option value="REGISTRATION_MANAGER">REGISTRATION MANAGER (Arbiter & Private Vault)</option>
                <option value="CONTENT_EDITOR">CONTENT EDITOR (Home Editor & Media)</option>
              </select>
            </div>

            <div className="pt-3 border-t border-cyber-border flex justify-end space-x-2">
              <button onClick={() => setEditingAdmin(null)} className="px-4 py-2 text-gray-400 font-bold">
                Cancel
              </button>
              <button onClick={handleSave} className="btn-cyber-primary px-5 py-2 rounded font-bold uppercase">
                Save Admin
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
