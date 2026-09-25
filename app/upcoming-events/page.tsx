'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Trophy, 
  Users, 
  Flame, 
  Search, 
  Filter, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Shield,
  X
} from 'lucide-react';
import { Event } from '@/lib/types';
import { INITIAL_EVENTS } from '@/lib/dataStore';
import { GamingEmberParticles, HudCornerBrackets } from '@/components/GamingVisualEffects';

function getGamePoster(game: string, posterUrl?: string): string {
  if (posterUrl && !posterUrl.includes('unsplash.com')) return posterUrl;
  const g = game.toLowerCase();
  if (g.includes('bgmi') || g.includes('battlegrounds')) return '/images/characters/bgmi_operator.jpg';
  if (g.includes('free fire') || g.includes('freefire')) return '/images/characters/freefire_ninja.jpg';
  if (g.includes('valorant')) return '/images/characters/valorant_duelist.jpg';
  return '/images/characters/arena_banner.jpg';
}

export default function UpcomingEventsPage() {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [selectedGame, setSelectedGame] = useState<string>('ALL');
  const [selectedMode, setSelectedMode] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeRulesModal, setActiveRulesModal] = useState<Event | null>(null);

  useEffect(() => {
    fetch('/api/admin/data?type=events')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data?.length) {
          setEvents(res.data);
        }
      })
      .catch(() => console.log('Using default client store.'));
  }, []);

  const upcomingEvents = events.filter(e => e.status === 'UPCOMING' && e.is_published);

  const filteredEvents = upcomingEvents.filter(event => {
    const matchesGame = selectedGame === 'ALL' || event.game.toLowerCase().includes(selectedGame.toLowerCase());
    const matchesMode = selectedMode === 'ALL' || event.mode === selectedMode;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.game.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGame && matchesMode && matchesSearch;
  });

  return (
    <div className="min-h-screen gaming-arena-bg py-12 sm:py-16 relative overflow-hidden font-rajdhani">
      {/* Ambient floating glowing embers */}
      <GamingEmberParticles />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-neon-emerald/15 border border-neon-emerald/40 text-neon-emerald text-xs font-orbitron font-bold uppercase mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>COMPETITIVE SCHEDULE 2026</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-orbitron uppercase tracking-tight">
            UPCOMING ESPORTS TOURNAMENTS
          </h1>
          <p className="mt-4 text-base text-gray-300 font-rajdhani font-semibold">
            Choose your battleground, inspect tournament guidelines, and lock in your squad’s slot before registration closes.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="glass-panel p-4 sm:p-6 rounded-xl border border-cyber-border mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search event name, game, venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-emerald"
              />
            </div>

            {/* Game Filter */}
            <div>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
              >
                <option value="ALL">All Game Titles</option>
                <option value="BGMI">BGMI (Battlegrounds Mobile India)</option>
                <option value="Free Fire">Free Fire Max</option>
                <option value="Valorant">Valorant</option>
                <option value="Call of Duty">Call of Duty: Mobile</option>
              </select>
            </div>

            {/* Mode Filter */}
            <div>
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
              >
                <option value="ALL">All Modes (Online & Offline LAN)</option>
                <option value="ONLINE">Online Only</option>
                <option value="OFFLINE">Offline LAN Only</option>
              </select>
            </div>

            {/* Total Count */}
            <div className="text-right text-xs font-mono text-gray-400 sm:col-span-2 lg:col-span-1">
              Showing <span className="text-neon-emerald font-bold">{filteredEvents.length}</span> Tournaments
            </div>

          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl border border-cyber-border">
            <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <h3 className="text-lg font-black text-white font-orbitron uppercase">NO UPCOMING EVENTS FOUND</h3>
            <p className="text-xs text-gray-400 mt-1 font-mono">Try adjusting your game or mode filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => {
              const isFull = event.filled_slots >= event.total_slots;
              const posterSrc = getGamePoster(event.game, event.poster_url);
              return (
                <div
                  key={event.id}
                  className="gaming-battle-card rounded-2xl overflow-hidden flex flex-col border border-neon-cyan/30 hover:border-neon-emerald/60 hover:shadow-neon-emerald transition-all duration-300 group relative"
                >
                  <HudCornerBrackets color="cyan" />
                  {/* Poster Image */}
                  <div className="relative h-56 w-full overflow-hidden bg-cyber-dark">
                    <Image
                      src={posterSrc}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-transparent opacity-85"></div>
                    
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-cyber-black/80 backdrop-blur-md border border-cyber-border text-[10px] font-black uppercase text-neon-cyan font-orbitron">
                      {event.game}
                    </div>

                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded bg-cyber-black/80 backdrop-blur-md border border-neon-emerald/50 text-[10px] font-black uppercase text-neon-emerald font-orbitron">
                      {event.mode}
                    </div>

                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-lg sm:text-xl font-black text-white font-orbitron leading-tight drop-shadow-md">
                        {event.title}
                      </h3>
                    </div>
                  </div>

                  {/* Details Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    
                    <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Metadata Grid */}
                    <div className="space-y-2.5 text-xs font-mono bg-cyber-black/40 p-4 rounded-xl border border-cyber-border">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5 text-neon-gold" />
                          Prize Pool:
                        </span>
                        <span className="text-neon-gold font-bold text-sm">{event.prize_pool}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-neon-cyan" />
                          Date & Time:
                        </span>
                        <span className="text-white font-semibold">{event.date} ({event.time})</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          Venue:
                        </span>
                        <span className="text-gray-300 truncate max-w-[180px]">{event.venue}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-neon-emerald" />
                          Registration Fee:
                        </span>
                        <span className="text-neon-emerald font-bold">{event.entry_fee}</span>
                      </div>

                      <div className="pt-2 border-t border-cyber-border">
                        <div className="flex justify-between text-[11px] mb-1.5">
                          <span className="text-gray-400">Slots Availability:</span>
                          <span className="text-white font-bold">{event.filled_slots} / {event.total_slots} Filled</span>
                        </div>
                        <div className="w-full h-2 bg-cyber-dark rounded-full overflow-hidden border border-cyber-border">
                          <div 
                            className={`h-full ${isFull ? 'bg-neon-red' : 'bg-gradient-to-r from-neon-emerald to-neon-cyan'}`}
                            style={{ width: `${Math.min(100, (event.filled_slots / event.total_slots) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                      {/* Rules Modal Trigger */}
                      <button
                        onClick={() => setActiveRulesModal(event)}
                        className="w-full py-2 text-xs font-mono font-bold text-gray-400 hover:text-white border border-cyber-border hover:border-gray-500 rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-neon-cyan" />
                        <span>VIEW TOURNAMENT RULES</span>
                      </button>

                      {/* Register Button */}
                      {isFull ? (
                        <div className="w-full py-3 bg-neon-red/20 border border-neon-red/40 text-neon-red text-center text-xs font-black font-orbitron uppercase rounded-lg">
                          REGISTRATION CLOSED (SLOTS FULL)
                        </div>
                      ) : (
                        <Link
                          href={`/registration?event=${event.id}`}
                          className="btn-cyber-primary clip-esports-btn w-full py-3 text-xs font-black font-orbitron text-center uppercase tracking-wider flex items-center justify-center space-x-2 shadow-neon-emerald"
                        >
                          <Flame className="w-4 h-4 text-cyber-black fill-current animate-pulse" />
                          <span>REGISTER FOR THIS EVENT</span>
                        </Link>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* RULES MODAL */}
      {activeRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full glass-hud p-6 sm:p-8 rounded-2xl border-2 border-neon-cyan/50 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveRulesModal(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-lg bg-cyber-dark border border-cyber-border"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-xs font-mono text-neon-cyan font-bold uppercase">
              <Shield className="w-4 h-4" />
              <span>OFFICIAL COMPETITIVE GUIDELINES</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white font-mono uppercase mt-2">
              {activeRulesModal.title}
            </h2>

            <div className="mt-6 space-y-4 text-xs font-mono text-gray-300">
              <div className="p-4 rounded-lg bg-cyber-black/70 border border-cyber-border space-y-1.5">
                <div><strong>Game Title:</strong> {activeRulesModal.game}</div>
                <div><strong>Tournament Mode:</strong> {activeRulesModal.mode}</div>
                <div><strong>Registration Deadline:</strong> {activeRulesModal.registration_deadline}</div>
                <div><strong>Venue / Server:</strong> {activeRulesModal.venue}</div>
              </div>

              <div className="font-bold text-white text-sm uppercase">RULEBOOK & DIRECTIVES:</div>
              <ul className="space-y-2.5">
                {activeRulesModal.rules?.map((rule, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-neon-emerald flex-shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-cyber-border flex justify-end space-x-3">
              <button
                onClick={() => setActiveRulesModal(null)}
                className="px-4 py-2 text-xs font-mono font-bold text-gray-400 hover:text-white"
              >
                CLOSE
              </button>
              <Link
                href={`/registration?event=${activeRulesModal.id}`}
                className="btn-cyber-primary px-6 py-2 rounded text-xs font-black font-mono uppercase"
              >
                PROCEED TO REGISTRATION
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
