'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Check, 
  X, 
  Trash2, 
  Mail, 
  FileText, 
  MapPin, 
  FileCheck, 
  Lock,
  ExternalLink,
  RotateCw,
  AlertTriangle
} from 'lucide-react';
import { Registration, RegistrationStatus } from '@/lib/types';
import { INITIAL_REGISTRATIONS } from '@/lib/dataStore';
import { INDIAN_STATES } from '@/lib/stateCodes';

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>(INITIAL_REGISTRATIONS);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filters & State Drilldown
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedGame, setSelectedGame] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const fetchRegistrations = () => {
    fetch('/api/admin/data?type=registrations')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) setRegistrations(res.data);
      })
      .catch(() => console.log('Using local registrations data.'));
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Update Status
  const handleUpdateStatus = async (id: string, status: RegistrationStatus) => {
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-registration-status',
          payload: { id, status }
        })
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
        if (selectedReg && selectedReg.id === id) {
          setSelectedReg(prev => prev ? { ...prev, status } : null);
        }
        setActionNotice(`Registration status successfully updated to ${status}!`);
        setTimeout(() => setActionNotice(null), 3000);
      }
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  // Resend Confirmation Email (Section 22: DO NOT generate another code)
  const handleResendEmail = async (id: string) => {
    try {
      setActionNotice('Dispatching confirmation email with existing registration code...');
      const res = await fetch('/api/registrations/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: id })
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(data.message || 'Confirmation email resent successfully!');
      } else {
        setActionNotice('Email dispatch failed: ' + data.error);
      }
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  // Delete Registration
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-registration',
          payload: { id }
        })
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations(prev => prev.filter(r => r.id !== id));
        if (selectedReg && selectedReg.id === id) setSelectedReg(null);
        setDeleteConfirmId(null);
        setActionNotice('Registration successfully deleted.');
        setTimeout(() => setActionNotice(null), 3000);
      }
    } catch (err: any) {
      alert('Error deleting registration: ' + err.message);
    }
  };

  // CSV Export (Section 31)
  const handleExportCSV = () => {
    const headers = ['Public Code', 'Player Name', 'Email', 'Phone', 'State', 'District', 'City', 'Game', 'IGN', 'UID', 'Team', 'Role', 'Status', 'Date'];
    const rows = filteredRegistrations.map(r => [
      r.public_code,
      `"${r.player_name}"`,
      r.email,
      r.phone,
      r.state,
      r.district,
      r.city,
      `"${r.game}"`,
      `"${r.in_game_name}"`,
      r.player_uid,
      `"${r.team_name}"`,
      `"${r.team_role || ''}"`,
      r.status,
      r.created_at
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gamers_guild_registrations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Logic
  const filteredRegistrations = registrations.filter(r => {
    const matchesSearch = 
      r.player_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.in_game_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.player_uid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.team_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.public_code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesState = selectedState === 'ALL' || r.state === selectedState;
    const matchesDistrict = selectedDistrict === 'ALL' || r.district === selectedDistrict;
    const matchesGame = selectedGame === 'ALL' || r.game.toLowerCase().includes(selectedGame.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus;

    return matchesSearch && matchesState && matchesDistrict && matchesGame && matchesStatus;
  });

  // Extract available districts based on selected state
  const availableDistricts = Array.from(new Set(registrations.filter(r => selectedState === 'ALL' || r.state === selectedState).map(r => r.district)));

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-mono uppercase">
            REGISTRATION DATABASE & ARBITER CONSOLE
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            Private player roster, state code allocations (e.g. MH27), and proof verification.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="btn-cyber-secondary px-4 py-2 rounded text-xs font-mono font-bold uppercase flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-neon-cyan" />
          <span>EXPORT AS CSV</span>
        </button>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-neon-emerald/20 border border-neon-emerald/50 text-xs font-mono text-neon-emerald flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* STATE-WISE DRILLDOWN BREADCRUMB (SECTION 30 REQUIREMENT) */}
      <div className="glass-hud p-4 rounded-xl border border-neon-cyan/30 text-xs font-mono flex flex-wrap items-center gap-2">
        <span className="text-gray-400">STATE CIRCUIT NAVIGATOR:</span>
        <button 
          onClick={() => { setSelectedState('ALL'); setSelectedDistrict('ALL'); }}
          className={`px-2.5 py-1 rounded ${selectedState === 'ALL' ? 'bg-neon-cyan text-black font-bold' : 'bg-cyber-dark text-gray-300'}`}
        >
          INDIA (ALL)
        </button>
        <span>&rarr;</span>
        <select
          value={selectedState}
          onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict('ALL'); }}
          className="px-2.5 py-1 rounded bg-cyber-dark border border-cyber-border text-white text-xs font-mono"
        >
          <option value="ALL">All States</option>
          {INDIAN_STATES.map(s => (
            <option key={s.code} value={s.name}>{s.name} ({s.code})</option>
          ))}
        </select>
        {selectedState !== 'ALL' && (
          <>
            <span>&rarr;</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-2.5 py-1 rounded bg-cyber-dark border border-cyber-border text-white text-xs font-mono"
            >
              <option value="ALL">All Districts</option>
              {availableDistricts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Search & Secondary Filters */}
      <div className="glass-panel p-4 rounded-xl border border-cyber-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search code (MH27), player name, UID, team, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
          />
        </div>

        {/* Game Filter */}
        <div>
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
          >
            <option value="ALL">All Games</option>
            <option value="BGMI">BGMI</option>
            <option value="Free Fire">Free Fire Max</option>
            <option value="Valorant">Valorant</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {/* REGISTRATIONS TABLE */}
      <div className="glass-panel rounded-xl overflow-hidden border border-cyber-border">
        <div className="p-4 border-b border-cyber-border flex justify-between items-center text-xs font-mono">
          <span className="text-gray-400">
            Showing <strong className="text-white">{filteredRegistrations.length}</strong> Registrations
          </span>
          <button 
            onClick={fetchRegistrations}
            className="text-neon-cyan hover:underline flex items-center space-x-1"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Refresh Grid</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-cyber-border text-gray-400 uppercase bg-cyber-dark/60">
                <th className="py-3 px-3">STATE CODE</th>
                <th className="py-3 px-3">PLAYER DETAILS</th>
                <th className="py-3 px-3">LOCATION</th>
                <th className="py-3 px-3">TITLE / SQUAD</th>
                <th className="py-3 px-3">STATUS</th>
                <th className="py-3 px-3">EMAIL</th>
                <th className="py-3 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No registrations found matching the specified filters.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-3 font-black text-neon-cyan text-sm">
                      #{reg.public_code}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-white">{reg.player_name}</div>
                      <div className="text-[10px] text-gray-400">
                        {reg.in_game_name} (UID: {reg.player_uid})
                      </div>
                      <div className="text-[10px] text-gray-500">{reg.email} &bull; {reg.phone}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="text-gray-300 font-semibold">{reg.district}</div>
                      <div className="text-[10px] text-gray-400">{reg.state}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="text-neon-gold font-bold">{reg.team_name}</div>
                      <div className="text-[10px] text-gray-400 truncate max-w-[130px]">{reg.game}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        reg.status === 'APPROVED' ? 'bg-neon-emerald/20 text-neon-emerald border border-neon-emerald/40' :
                        reg.status === 'VERIFIED' ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40' :
                        reg.status === 'REJECTED' ? 'bg-neon-red/20 text-neon-red border border-neon-red/40' :
                        'bg-neon-gold/20 text-neon-gold border border-neon-gold/40'
                      }`}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-[10px] text-neon-emerald font-bold uppercase">
                        {reg.email_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right space-x-1">
                      {/* View details */}
                      <button
                        onClick={() => setSelectedReg(reg)}
                        className="p-1.5 rounded bg-cyber-dark hover:bg-neon-cyan/20 text-gray-300 hover:text-neon-cyan border border-cyber-border"
                        title="View Full Profile & Documents"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Verify */}
                      <button
                        onClick={() => handleUpdateStatus(reg.id, 'VERIFIED')}
                        className="p-1.5 rounded bg-cyber-dark hover:bg-neon-cyan/20 text-gray-300 hover:text-neon-cyan border border-cyber-border"
                        title="Mark Verified"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                      </button>

                      {/* Approve */}
                      <button
                        onClick={() => handleUpdateStatus(reg.id, 'APPROVED')}
                        className="p-1.5 rounded bg-cyber-dark hover:bg-neon-emerald/20 text-gray-300 hover:text-neon-emerald border border-cyber-border"
                        title="Approve Slot"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      {/* Reject */}
                      <button
                        onClick={() => handleUpdateStatus(reg.id, 'REJECTED')}
                        className="p-1.5 rounded bg-cyber-dark hover:bg-neon-red/20 text-gray-300 hover:text-neon-red border border-cyber-border"
                        title="Reject Slot"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      {/* Resend Email */}
                      <button
                        onClick={() => handleResendEmail(reg.id)}
                        className="p-1.5 rounded bg-cyber-dark hover:bg-neon-gold/20 text-gray-300 hover:text-neon-gold border border-cyber-border"
                        title="Resend Confirmation Email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteConfirmId(reg.id)}
                        className="p-1.5 rounded bg-cyber-dark hover:bg-neon-red/20 text-gray-300 hover:text-neon-red border border-cyber-border"
                        title="Delete Registration"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL REGISTRATION DETAILS MODAL */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full glass-hud p-6 sm:p-8 rounded-2xl border-2 border-neon-cyan/50 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedReg(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-lg bg-cyber-dark border border-cyber-border"
            >
              ✕
            </button>

            <div className="flex items-center space-x-2 text-xs font-mono text-neon-cyan font-bold uppercase">
              <Lock className="w-4 h-4 text-neon-gold" />
              <span>CONFIDENTIAL ARBITER PROFILE</span>
            </div>

            <div className="flex items-baseline justify-between mt-2">
              <h2 className="text-2xl font-black text-white font-mono uppercase">
                {selectedReg.player_name}
              </h2>
              <span className="text-xl font-black text-neon-cyan font-mono">
                #{selectedReg.public_code}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-cyber-dark/80 border border-cyber-border space-y-2">
                <div className="text-gray-400 uppercase font-bold text-[10px] border-b border-cyber-border pb-1">
                  PERSONAL RECORD
                </div>
                <div><strong>DOB:</strong> {selectedReg.date_of_birth || 'N/A'}</div>
                <div><strong>Gender:</strong> {selectedReg.gender || 'N/A'}</div>
                <div><strong>Email:</strong> {selectedReg.email}</div>
                <div><strong>Mobile:</strong> {selectedReg.phone}</div>
                <div><strong>Location:</strong> {selectedReg.city}, {selectedReg.district}, {selectedReg.state}</div>
              </div>

              <div className="p-4 rounded-xl bg-cyber-dark/80 border border-cyber-border space-y-2">
                <div className="text-gray-400 uppercase font-bold text-[10px] border-b border-cyber-border pb-1">
                  GAMING TELEMETRY
                </div>
                <div><strong>Game:</strong> {selectedReg.game}</div>
                <div><strong>In-Game Name:</strong> {selectedReg.in_game_name}</div>
                <div><strong>Player UID:</strong> {selectedReg.player_uid}</div>
                <div><strong>Team:</strong> {selectedReg.team_name}</div>
                <div><strong>Tactical Role:</strong> {selectedReg.team_role || 'General'}</div>
                <div><strong>Experience:</strong> {selectedReg.gaming_experience || 'None listed'}</div>
              </div>
            </div>

            {/* UPLOADED DOCUMENTS (PRIVATE STORAGE ACCESS) */}
            <div className="mt-6 p-4 rounded-xl bg-cyber-dark/80 border border-cyber-border">
              <div className="flex items-center justify-between border-b border-cyber-border pb-2 mb-3">
                <span className="text-xs font-mono font-bold text-white uppercase flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-neon-cyan" />
                  <span>UPLOADED IDENTITY & PROOF DOCUMENTS</span>
                </span>
                <span className="text-[10px] font-mono text-neon-gold">Private Vault</span>
              </div>

              {selectedReg.files && selectedReg.files.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedReg.files.map((file, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-cyber-black border border-cyber-border flex items-center justify-between text-xs font-mono">
                      <div className="truncate max-w-[180px]">
                        <span className="text-white block font-semibold truncate">{file.file_name}</span>
                        <span className="text-[10px] text-gray-400">{file.mime_type || 'Document'}</span>
                      </div>
                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 text-[10px] font-bold flex items-center space-x-1"
                      >
                        <span>VIEW</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-mono text-gray-400">
                  Document proofs submitted directly via mobile upload. No external file attachments.
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-cyber-border flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => handleUpdateStatus(selectedReg.id, 'APPROVED')}
                className="btn-cyber-primary px-4 py-2 rounded text-xs font-mono font-bold uppercase"
              >
                Approve Slot
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedReg.id, 'REJECTED')}
                className="px-4 py-2 rounded text-xs font-mono font-bold uppercase bg-neon-red/20 text-neon-red border border-neon-red/40"
              >
                Reject Application
              </button>
              <button
                onClick={() => handleResendEmail(selectedReg.id)}
                className="btn-cyber-secondary px-4 py-2 rounded text-xs font-mono font-bold uppercase"
              >
                Resend Confirmation
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DELETION CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-hud p-6 rounded-2xl border-2 border-neon-red/60 max-w-sm w-full text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-neon-red mx-auto" />
            <h3 className="text-lg font-black text-white font-mono uppercase">CONFIRM DELETION</h3>
            <p className="text-xs font-mono text-gray-300">
              Are you sure you want to delete this registration record? This action is irreversible.
            </p>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-mono font-bold text-gray-400 hover:text-white"
              >
                CANCEL
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2 rounded bg-neon-red text-white text-xs font-mono font-bold uppercase"
              >
                DELETE RECORD
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
