'use client';

import React, { useState } from 'react';
import { Settings, Plus, CheckCircle2, ShieldCheck, MapPin, Hash, Sparkles } from 'lucide-react';
import { INDIAN_STATES } from '@/lib/stateCodes';

export default function AdminSettingsPage() {
  const [states, setStates] = useState(INDIAN_STATES);
  const [newStateName, setNewStateName] = useState('');
  const [newStateCode, setNewStateCode] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const handleAddState = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStateName || !newStateCode) return;
    const cleanCode = newStateCode.toUpperCase().trim();
    if (states.some(s => s.code === cleanCode)) {
      alert('State code already exists!');
      return;
    }
    setStates([...states, { name: newStateName, code: cleanCode, districts: [] }]);
    setNewStateName('');
    setNewStateCode('');
    setNotice(`State code ${cleanCode} (${newStateName}) successfully activated!`);
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-mono uppercase">
            STATE CODE DIRECTORY & COUNTERS
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            Configure state abbreviations used to automatically construct player codes (e.g. MH27, GJ14).
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-neon-emerald/20 border border-neon-emerald/50 text-xs font-mono text-neon-emerald flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* Add New State */}
      <div className="glass-hud p-6 rounded-2xl border border-cyber-border space-y-4">
        <h2 className="text-sm font-black text-white font-mono uppercase flex items-center space-x-2">
          <Plus className="w-4 h-4 text-neon-emerald" />
          <span>REGISTER NEW STATE PREFIX</span>
        </h2>
        <form onSubmit={handleAddState} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <label className="text-gray-400 block mb-1">State / Territory Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Ladakh"
              value={newStateName}
              onChange={(e) => setNewStateName(e.target.value)}
              className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white"
            />
          </div>
          <div>
            <label className="text-gray-400 block mb-1">2-Letter Code Prefix</label>
            <input
              type="text"
              required
              maxLength={4}
              placeholder="e.g. LA"
              value={newStateCode}
              onChange={(e) => setNewStateCode(e.target.value)}
              className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white uppercase"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="btn-cyber-primary w-full py-2 rounded text-xs font-mono font-bold uppercase"
            >
              Add State Code
            </button>
          </div>
        </form>
      </div>

      {/* States Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-cyber-border">
        <div className="p-4 border-b border-cyber-border text-xs font-mono text-gray-400">
          Total Active State Registrars: <strong className="text-white">{states.length}</strong>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4">
          {states.map((st) => (
            <div key={st.code} className="p-3 rounded-lg bg-cyber-dark/80 border border-cyber-border flex items-center justify-between font-mono text-xs">
              <span className="text-white truncate max-w-[130px] font-semibold">{st.name}</span>
              <span className="px-2 py-0.5 rounded bg-neon-cyan/20 text-neon-cyan font-black border border-neon-cyan/30">
                {st.code}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
