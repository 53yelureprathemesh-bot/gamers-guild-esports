'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Award, Plus, Trash2, CheckCircle2, ExternalLink } from 'lucide-react';
import { Sponsor, SponsorTier } from '@/lib/types';
import { INITIAL_SPONSORS } from '@/lib/dataStore';

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>(INITIAL_SPONSORS);
  const [editingSponsor, setEditingSponsor] = useState<Partial<Sponsor> | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/data?type=sponsors')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) setSponsors(res.data);
      })
      .catch(() => console.log('Using default sponsors.'));
  }, []);

  const handleSave = async () => {
    if (!editingSponsor || !editingSponsor.name || !editingSponsor.logo_url) {
      alert('Sponsor name and logo are required.');
      return;
    }

    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-sponsor',
          payload: editingSponsor
        })
      });
      const data = await res.json();
      if (data.success) {
        setNotice('Sponsor saved successfully!');
        setSponsors([data.data, ...sponsors.filter(s => s.id !== data.data.id)]);
        setEditingSponsor(null);
        setTimeout(() => setNotice(null), 3000);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-sponsor', payload: { id } })
      });
      setSponsors(sponsors.filter(s => s.id !== id));
      setNotice('Sponsor deleted.');
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-mono uppercase">
            SPONSORS & BRAND ALLIANCES
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            Manage partner logos, tier hierarchies, and official partner URLs.
          </p>
        </div>

        <button
          onClick={() => setEditingSponsor({
            name: '',
            logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
            website: 'https://',
            description: '',
            tier: 'MAIN_SPONSOR',
            is_active: true
          })}
          className="btn-cyber-primary px-4 py-2 rounded text-xs font-mono font-bold uppercase flex items-center space-x-1"
        >
          <Plus className="w-4 h-4 text-cyber-black" />
          <span>ADD PARTNER</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-neon-emerald/20 border border-neon-emerald/50 text-xs font-mono text-neon-emerald flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {sponsors.map((sp) => (
          <div key={sp.id} className="glass-panel p-5 rounded-xl border border-cyber-border space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-neon-gold/20 text-neon-gold border border-neon-gold/40">
                  {sp.tier.replace(/_/g, ' ')}
                </span>
                <button
                  onClick={() => handleDelete(sp.id)}
                  className="p-1 rounded bg-cyber-dark text-gray-400 hover:text-neon-red"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-14 h-14 rounded-lg bg-cyber-dark p-2 flex items-center justify-center border border-cyber-border">
                <Image src={sp.logo_url} alt={sp.name} width={48} height={48} className="object-contain" />
              </div>

              <div>
                <h3 className="text-sm font-black text-white font-mono">{sp.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{sp.description}</p>
              </div>
            </div>

            {sp.website && (
              <a
                href={sp.website}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-mono text-neon-cyan hover:underline flex items-center space-x-1 pt-2 border-t border-cyber-border"
              >
                <span>Visit Partner</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ))}
      </div>

      {editingSponsor && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-hud p-6 rounded-2xl border-2 border-neon-cyan/50 max-w-md w-full space-y-4 text-xs font-mono">
            <h3 className="text-base font-black text-white uppercase">ADD / EDIT SPONSOR</h3>

            <div>
              <label className="text-gray-300 block mb-1">Company / Brand Name *</label>
              <input
                type="text"
                value={editingSponsor.name || ''}
                onChange={(e) => setEditingSponsor({ ...editingSponsor, name: e.target.value })}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white"
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-1">Sponsorship Tier</label>
              <select
                value={editingSponsor.tier || 'MAIN_SPONSOR'}
                onChange={(e) => setEditingSponsor({ ...editingSponsor, tier: e.target.value as SponsorTier })}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white"
              >
                <option value="MAIN_SPONSOR">MAIN SPONSOR</option>
                <option value="ESPORTS_PARTNER">ESPORTS PARTNER</option>
                <option value="TECH_PARTNER">TECH PARTNER</option>
                <option value="COMMUNITY_PARTNER">COMMUNITY PARTNER</option>
              </select>
            </div>

            <div>
              <label className="text-gray-300 block mb-1">Logo URL *</label>
              <input
                type="text"
                value={editingSponsor.logo_url || ''}
                onChange={(e) => setEditingSponsor({ ...editingSponsor, logo_url: e.target.value })}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white"
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-1">Partner Website URL</label>
              <input
                type="text"
                value={editingSponsor.website || ''}
                onChange={(e) => setEditingSponsor({ ...editingSponsor, website: e.target.value })}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white"
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-1">Partner Tagline / Role Description</label>
              <input
                type="text"
                value={editingSponsor.description || ''}
                onChange={(e) => setEditingSponsor({ ...editingSponsor, description: e.target.value })}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white"
              />
            </div>

            <div className="pt-3 border-t border-cyber-border flex justify-end space-x-2">
              <button
                onClick={() => setEditingSponsor(null)}
                className="px-4 py-2 text-gray-400 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-cyber-primary px-5 py-2 rounded font-bold uppercase"
              >
                Save Sponsor
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
