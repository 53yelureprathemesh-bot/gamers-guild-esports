'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Calendar, 
  Radio, 
  Flame, 
  ArrowUpRight, 
  FileText, 
  ShieldCheck,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { Registration, Event } from '@/lib/types';
import { INITIAL_REGISTRATIONS, INITIAL_EVENTS } from '@/lib/dataStore';

export default function AdminDashboardPage() {
  const [registrations, setRegistrations] = useState<Registration[]>(INITIAL_REGISTRATIONS);
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);

  useEffect(() => {
    fetch('/api/admin/data')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          if (res.data.registrations) setRegistrations(res.data.registrations);
          if (res.data.events) setEvents(res.data.events);
        }
      })
      .catch(() => console.log('Loaded initial dashboard metrics.'));
  }, []);

  const totalRegs = registrations.length;
  const pendingCount = registrations.filter(r => r.status === 'PENDING').length;
  const verifiedCount = registrations.filter(r => r.status === 'VERIFIED').length;
  const approvedCount = registrations.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = registrations.filter(r => r.status === 'REJECTED').length;

  const upcomingCount = events.filter(e => e.status === 'UPCOMING').length;
  const ongoingCount = events.filter(e => e.status === 'ONGOING').length;

  // Compute state distribution
  const stateCounts: Record<string, number> = {};
  registrations.forEach(r => {
    const state = r.state || 'Other';
    stateCounts[state] = (stateCounts[state] || 0) + 1;
  });

  return (
    <div className="space-y-8">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase">
            ORGANIZATION COMMAND CENTER
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Real-time telemetry, state-wise tournament applications, and active stage monitors.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/registrations"
            className="btn-cyber-primary px-4 py-2 rounded text-xs font-mono font-bold uppercase flex items-center space-x-1.5"
          >
            <Users className="w-4 h-4 text-cyber-black" />
            <span>Manage Registrations</span>
          </Link>
          <Link
            href="/admin/upcoming-events"
            className="btn-cyber-secondary px-4 py-2 rounded text-xs font-mono font-bold uppercase flex items-center space-x-1.5"
          >
            <Calendar className="w-4 h-4 text-neon-cyan" />
            <span>New Tournament</span>
          </Link>
        </div>
      </div>

      {/* METRIC CARDS (SECTION 25 REQUIREMENTS) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        
        <div className="glass-panel p-4 rounded-xl border border-cyber-border">
          <div className="text-[11px] font-mono text-gray-400 uppercase">Total Regs</div>
          <div className="text-2xl font-black text-white font-mono mt-1">{totalRegs}</div>
          <div className="text-[10px] font-mono text-neon-emerald mt-1">All State Circuits</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-cyber-border">
          <div className="text-[11px] font-mono text-gray-400 uppercase">Pending</div>
          <div className="text-2xl font-black text-neon-gold font-mono mt-1">{pendingCount}</div>
          <div className="text-[10px] font-mono text-gray-400 mt-1">Awaiting Arbiter</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-cyber-border">
          <div className="text-[11px] font-mono text-gray-400 uppercase">Verified</div>
          <div className="text-2xl font-black text-neon-cyan font-mono mt-1">{verifiedCount}</div>
          <div className="text-[10px] font-mono text-neon-cyan mt-1">ID Confirmed</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-cyber-border">
          <div className="text-[11px] font-mono text-gray-400 uppercase">Approved</div>
          <div className="text-2xl font-black text-neon-emerald font-mono mt-1">{approvedCount}</div>
          <div className="text-[10px] font-mono text-neon-emerald mt-1">Bracket Seeded</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-cyber-border">
          <div className="text-[11px] font-mono text-gray-400 uppercase">Rejected</div>
          <div className="text-2xl font-black text-neon-red font-mono mt-1">{rejectedCount}</div>
          <div className="text-[10px] font-mono text-neon-red mt-1">Disqualified / Invalid</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-cyber-border">
          <div className="text-[11px] font-mono text-gray-400 uppercase">Upcoming</div>
          <div className="text-2xl font-black text-neon-purple font-mono mt-1">{upcomingCount}</div>
          <div className="text-[10px] font-mono text-gray-400 mt-1">Scheduled</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-cyber-border">
          <div className="text-[11px] font-mono text-gray-400 uppercase">Ongoing</div>
          <div className="text-2xl font-black text-neon-red font-mono mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-neon-red animate-pulse"></span>
            {ongoingCount}
          </div>
          <div className="text-[10px] font-mono text-neon-red mt-1">Live Stages</div>
        </div>

      </div>

      {/* Grid: State Circuit Distribution + Recent Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* State-Wise Distribution Breakdown */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-cyber-border">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3 mb-4">
            <h2 className="text-xs font-mono font-bold text-white uppercase flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-neon-cyan" />
              <span>STATE CIRCUIT METRICS</span>
            </h2>
            <Link href="/admin/registrations" className="text-[11px] font-mono text-neon-emerald hover:underline">
              Explorer &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {Object.entries(stateCounts).map(([st, cnt]) => {
              const pct = Math.round((cnt / (totalRegs || 1)) * 100);
              return (
                <div key={st} className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-gray-300">
                    <span className="font-semibold text-white">{st}</span>
                    <span className="text-neon-cyan font-bold">{cnt} athletes ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-cyber-dark rounded-full overflow-hidden border border-cyber-border">
                    <div 
                      className="h-full bg-gradient-to-r from-neon-emerald to-neon-cyan" 
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Registrations Table */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-cyber-border">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3 mb-4">
            <h2 className="text-xs font-mono font-bold text-white uppercase flex items-center space-x-2">
              <Clock className="w-4 h-4 text-neon-gold" />
              <span>RECENT PLAYER SUBMISSIONS</span>
            </h2>
            <Link href="/admin/registrations" className="text-[11px] font-mono text-neon-cyan hover:underline">
              View All ({totalRegs})
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-cyber-border text-gray-400 uppercase">
                  <th className="py-2.5 px-3">CODE</th>
                  <th className="py-2.5 px-3">PLAYER</th>
                  <th className="py-2.5 px-3">STATE</th>
                  <th className="py-2.5 px-3">GAME</th>
                  <th className="py-2.5 px-3">SQUAD</th>
                  <th className="py-2.5 px-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border">
                {registrations.slice(0, 5).map((reg) => (
                  <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-black text-neon-cyan">
                      #{reg.public_code}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{reg.player_name}</div>
                      <div className="text-[10px] text-gray-400">{reg.in_game_name} ({reg.player_uid})</div>
                    </td>
                    <td className="py-3 px-3 text-gray-300">
                      {reg.state}
                    </td>
                    <td className="py-3 px-3 text-gray-300 truncate max-w-[120px]">
                      {reg.game}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">
                      {reg.team_name}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        reg.status === 'APPROVED' ? 'bg-neon-emerald/20 text-neon-emerald border border-neon-emerald/40' :
                        reg.status === 'VERIFIED' ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40' :
                        reg.status === 'REJECTED' ? 'bg-neon-red/20 text-neon-red border border-neon-red/40' :
                        'bg-neon-gold/20 text-neon-gold border border-neon-gold/40'
                      }`}>
                        {reg.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
