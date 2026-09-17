'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/image';
import { 
  Radio, 
  Trophy, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  Play, 
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Event, TournamentMatch, PointsTableEntry } from '@/lib/types';
import { INITIAL_EVENTS, INITIAL_POINTS_TABLE, INITIAL_MATCHES } from '@/lib/dataStore';

export default function OngoingEventsPage() {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [pointsTable, setPointsTable] = useState<PointsTableEntry[]>(INITIAL_POINTS_TABLE);
  const [matches, setMatches] = useState<TournamentMatch[]>(INITIAL_MATCHES);
  const [selectedEventId, setSelectedEventId] = useState<string>('evt-002');
  const [activeTab, setActiveTab] = useState<'standings' | 'schedule' | 'qualified'>('standings');

  useEffect(() => {
    fetch('/api/admin/data')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          if (res.data.events?.length) setEvents(res.data.events);
        }
      })
      .catch(() => console.log('Using initial client data.'));
  }, []);

  const ongoingEvents = events.filter(e => e.status === 'ONGOING' && e.is_published);
  const currentEvent = ongoingEvents.find(e => e.id === selectedEventId) || ongoingEvents[0] || events[1];

  const currentPoints = pointsTable.filter(p => p.event_id === currentEvent?.id).sort((a, b) => a.rank - b.rank);
  const currentMatches = matches.filter(m => m.event_id === currentEvent?.id);

  return (
    <div className="min-h-screen cyber-bg py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title with Live Pulse */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neon-red/10 border border-neon-red/40 text-neon-red text-xs font-mono font-bold uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-neon-red animate-ping"></span>
            <span>LIVE MATCH BROADCAST & LEADERBOARDS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-mono uppercase tracking-tight">
            ONGOING CHAMPIONSHIPS
          </h1>
          <p className="mt-4 text-sm sm:text-base text-gray-400 font-sans">
            Real-time battleground status, match round progressions, team kill counters, and official points tables.
          </p>
        </div>

        {/* Selected Event Banner */}
        {currentEvent && (
          <div className="relative glass-hud rounded-2xl overflow-hidden border-2 border-neon-cyan/40 p-6 sm:p-8 mb-10 shadow-hud">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center gap-1 text-[11px] font-black uppercase px-2 py-0.5 rounded bg-neon-red text-black font-mono">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    LIVE ON STAGE
                  </span>
                  <span className="text-xs font-mono text-neon-cyan font-bold">
                    {currentEvent.game}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase">
                  {currentEvent.title}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-300 pt-1">
                  <span className="text-neon-gold font-bold">Prize: {currentEvent.prize_pool}</span>
                  <span>&bull;</span>
                  <span>Venue: {currentEvent.venue}</span>
                  <span>&bull;</span>
                  <span className="text-neon-emerald font-bold">Mode: {currentEvent.mode}</span>
                </div>
              </div>

              {/* Tournament Stream Button */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-cyber-primary px-6 py-3 rounded-lg text-xs font-black font-mono uppercase flex items-center justify-center space-x-2 shadow-neon-emerald"
                >
                  <Play className="w-4 h-4 text-cyber-black fill-current" />
                  <span>WATCH OFFICIAL STREAM</span>
                </a>
              </div>

            </div>
          </div>
        )}

        {/* Tabs: Standings / Schedule / Qualified */}
        <div className="flex items-center space-x-2 border-b border-cyber-border mb-8 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('standings')}
            className={`px-5 py-2.5 text-xs font-mono font-bold tracking-wider rounded-t-lg transition-all flex items-center space-x-2 ${
              activeTab === 'standings'
                ? 'bg-neon-emerald/20 text-neon-emerald border-t-2 border-neon-emerald'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>POINTS TABLE STANDINGS</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-5 py-2.5 text-xs font-mono font-bold tracking-wider rounded-t-lg transition-all flex items-center space-x-2 ${
              activeTab === 'schedule'
                ? 'bg-neon-cyan/20 text-neon-cyan border-t-2 border-neon-cyan'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>MATCH SCHEDULE & RESULTS</span>
          </button>

          <button
            onClick={() => setActiveTab('qualified')}
            className={`px-5 py-2.5 text-xs font-mono font-bold tracking-wider rounded-t-lg transition-all flex items-center space-x-2 ${
              activeTab === 'qualified'
                ? 'bg-neon-gold/20 text-neon-gold border-t-2 border-neon-gold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>QUALIFIED SQUADS</span>
          </button>
        </div>

        {/* TAB 1: POINTS TABLE */}
        {activeTab === 'standings' && (
          <div className="glass-panel rounded-2xl overflow-hidden border border-cyber-border p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cyber-border gap-2">
              <div>
                <h3 className="text-lg font-black text-white font-mono uppercase">
                  OVERALL TOURNAMENT STANDINGS
                </h3>
                <p className="text-xs font-mono text-gray-400 mt-0.5">
                  Points Formula: Placement Points + 1 Point Per Confirmed Kill
                </p>
              </div>
              <div className="text-xs font-mono text-neon-emerald font-bold bg-neon-emerald/10 px-3 py-1 rounded border border-neon-emerald/30">
                Official Verification Matrix Active
              </div>
            </div>

            <div className="overflow-x-auto mt-6">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-cyber-border text-gray-400 uppercase bg-cyber-dark/60">
                    <th className="py-3.5 px-4">RANK</th>
                    <th className="py-3.5 px-4">TEAM / SQUAD</th>
                    <th className="py-3.5 px-4 text-center">MATCHES</th>
                    <th className="py-3.5 px-4 text-center">WWCD (WINS)</th>
                    <th className="py-3.5 px-4 text-center">PLACEMENT PTS</th>
                    <th className="py-3.5 px-4 text-center">KILL PTS</th>
                    <th className="py-3.5 px-4 text-right">TOTAL POINTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyber-border">
                  {currentPoints.map((row) => (
                    <tr 
                      key={row.id}
                      className={`hover:bg-white/5 transition-colors ${
                        row.rank === 1 ? 'bg-neon-gold/5' : row.rank <= 3 ? 'bg-white/[0.02]' : ''
                      }`}
                    >
                      <td className="py-4 px-4 font-black">
                        {row.rank === 1 && <span className="text-neon-gold text-sm font-bold">🥇 #1</span>}
                        {row.rank === 2 && <span className="text-gray-300 text-sm font-bold">🥈 #2</span>}
                        {row.rank === 3 && <span className="text-amber-600 text-sm font-bold">🥉 #3</span>}
                        {row.rank > 3 && <span className="text-gray-400 font-mono">#{row.rank}</span>}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-white text-sm tracking-wider">
                          {row.team_name}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-300">
                        {row.matches_played}
                      </td>
                      <td className="py-4 px-4 text-center text-neon-emerald font-bold">
                        {row.wwcd}
                      </td>
                      <td className="py-4 px-4 text-center text-gray-300">
                        {row.placement_points}
                      </td>
                      <td className="py-4 px-4 text-center text-neon-cyan font-bold">
                        {row.kill_points}
                      </td>
                      <td className="py-4 px-4 text-right font-black text-neon-emerald text-base">
                        {row.total_points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 pt-4 border-t border-cyber-border flex flex-col sm:flex-row justify-between items-center text-xs font-mono text-gray-400 gap-3">
              <div>WWCD = Winner Winner Chicken Dinner / Booyah victory.</div>
              <div className="text-neon-cyan">Scores reviewed and updated by Gamers Guild Tournament Arbiters.</div>
            </div>
          </div>
        )}

        {/* TAB 2: MATCH SCHEDULE & RESULTS */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-cyber-border">
              <h3 className="text-lg font-black text-white font-mono uppercase mb-4">
                OFFICIAL MATCH SEQUENCE & BRACKET ROUNDS
              </h3>

              <div className="space-y-4">
                {currentMatches.map((match) => (
                  <div 
                    key={match.id}
                    className="glass-hud p-5 rounded-xl border border-cyber-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40">
                          {match.round_name}
                        </span>
                        {match.status === 'LIVE' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-neon-red text-black animate-pulse">
                            LIVE NOW
                          </span>
                        )}
                        <span className="text-xs font-mono text-gray-400">Map: {match.map_name || 'Bermuda'}</span>
                      </div>
                      <h4 className="text-base font-black text-white font-mono mt-1">
                        {match.match_title}
                      </h4>
                    </div>

                    <div className="flex items-center space-x-4 self-stretch md:self-auto justify-between">
                      <div className="text-xs font-mono text-right">
                        <div className="text-gray-400">Room Broadcast:</div>
                        <div className="text-neon-gold font-bold">{match.scheduled_time}</div>
                      </div>

                      {match.stream_url && (
                        <a
                          href={match.stream_url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-cyber-secondary px-4 py-2 rounded text-xs font-bold font-mono uppercase flex items-center space-x-1"
                        >
                          <Play className="w-3.5 h-3.5 text-neon-cyan" />
                          <span>SPECTATE</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: QUALIFIED SQUADS */}
        {activeTab === 'qualified' && (
          <div className="glass-panel p-6 rounded-2xl border border-cyber-border">
            <h3 className="text-lg font-black text-white font-mono uppercase mb-2">
              QUALIFIED ROSTER FOR GRAND FINALS
            </h3>
            <p className="text-xs font-mono text-gray-400 mb-6">
              Squads that secured their top seeds from the Quarter and Semi-Final bracket stages.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentPoints.slice(0, 6).map((team, idx) => (
                <div key={team.id} className="glass-hud p-5 rounded-xl border border-neon-emerald/30">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-neon-emerald font-bold">SEED #{idx + 1}</span>
                    <span className="px-2 py-0.5 rounded bg-neon-emerald/20 text-neon-emerald text-[10px] font-mono font-bold">
                      QUALIFIED
                    </span>
                  </div>
                  <h4 className="text-base font-black text-white font-mono mt-2">
                    {team.team_name}
                  </h4>
                  <div className="mt-3 pt-3 border-t border-cyber-border text-xs font-mono flex justify-between text-gray-400">
                    <span>Total Pts: {team.total_points}</span>
                    <span>WWCD: {team.wwcd}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
