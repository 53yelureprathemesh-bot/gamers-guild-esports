'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Trophy, 
  Users, 
  Coins, 
  MapPin, 
  Flame, 
  ArrowRight, 
  Radio, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Award, 
  Sparkles, 
  Gamepad2, 
  ChevronRight, 
  Megaphone,
  ShieldAlert,
  Send,
  ExternalLink
} from 'lucide-react';
import { Event, Announcement, GalleryItem, Sponsor, SiteSettings, PointsTableEntry } from '@/lib/types';
import { INITIAL_EVENTS, INITIAL_SITE_SETTINGS, INITIAL_ANNOUNCEMENTS, INITIAL_GALLERY, INITIAL_SPONSORS, INITIAL_POINTS_TABLE } from '@/lib/dataStore';

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [gallery, setGallery] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [sponsors, setSponsors] = useState<Sponsor[]>(INITIAL_SPONSORS);
  const [pointsTable, setPointsTable] = useState<PointsTableEntry[]>(INITIAL_POINTS_TABLE);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<GalleryItem | null>(null);

  // Fetch updated data from API if available
  useEffect(() => {
    fetch('/api/admin/data')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          if (res.data.events?.length) setEvents(res.data.events);
          if (res.data.settings) setSettings(res.data.settings);
          if (res.data.announcements?.length) setAnnouncements(res.data.announcements);
          if (res.data.gallery?.length) setGallery(res.data.gallery);
          if (res.data.sponsors?.length) setSponsors(res.data.sponsors);
        }
      })
      .catch(err => console.log('Using default client store data.'));
  }, []);

  const upcomingEvents = events.filter(e => e.status === 'UPCOMING' && e.is_published);
  const ongoingEvents = events.filter(e => e.status === 'ONGOING' && e.is_published);
  const featuredEvent = upcomingEvents[0] || events[0];

  return (
    <div className="min-h-screen cyber-bg">
      
      {/* 1. ANNOUNCEMENT LIVE TICKER */}
      {announcements.length > 0 && (
        <div className="bg-gradient-to-r from-neon-cyan/20 via-cyber-dark to-neon-emerald/20 border-b border-neon-cyan/30 py-2.5 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2 text-neon-emerald font-bold tracking-wider flex-shrink-0">
              <Megaphone className="w-4 h-4 animate-bounce" />
              <span className="hidden sm:inline">OFFICIAL DISPATCH:</span>
            </div>
            <div className="truncate px-3 text-gray-200">
              <span className="font-semibold text-neon-cyan">{announcements[0].title}</span> — {announcements[0].content}
            </div>
            <Link 
              href={announcements[0].link || '/upcoming-events'}
              className="text-neon-emerald hover:text-white flex items-center space-x-1 flex-shrink-0 font-bold"
            >
              <span>DETAILS</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Futuristic glowing radial orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-emerald/10 blur-[130px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-neon-cyan/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center">
            
            {/* OFFICIAL LOGO BADGE */}
            <div className="relative mb-8 group">
              <div className="absolute -inset-2 bg-gradient-to-r from-neon-emerald via-neon-cyan to-cyber-gold rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition duration-500"></div>
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 p-2 rounded-2xl bg-cyber-dark border-2 border-neon-emerald/50 flex items-center justify-center shadow-hud">
                <Image
                  src={settings.hero.logo_url || '/images/logo.png'}
                  alt="Gamers Guild Esports Logo"
                  width={140}
                  height={140}
                  className="object-contain drop-shadow-[0_0_15px_rgba(0,255,157,0.5)] transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-cyber-black border border-neon-emerald text-[10px] font-black tracking-widest text-neon-emerald uppercase font-mono shadow-sm">
                VERIFIED ESPORTS ORG
              </div>
            </div>

            {/* Brand Title */}
            <h2 className="text-sm sm:text-base font-black tracking-[0.3em] text-neon-cyan uppercase font-mono mb-3">
              GAMERS GUILD ESPORTS
            </h2>

            {/* Main Tagline */}
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight text-white uppercase max-w-4xl leading-none font-mono">
              ENTER THE ARENA.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-emerald via-neon-cyan to-neon-gold">
                BUILD YOUR LEGACY.
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-base sm:text-lg text-gray-300 max-w-2xl font-sans leading-relaxed">
              {settings.hero.subheading}
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full max-w-md justify-center">
              <Link
                href={settings.hero.cta_primary_link || '/registration'}
                className="btn-cyber-primary w-full sm:w-auto px-8 py-4 rounded-lg text-sm font-extrabold flex items-center justify-center space-x-2 shadow-neon-emerald"
              >
                <Flame className="w-5 h-5 text-cyber-black fill-current" />
                <span>{settings.hero.cta_primary_text || 'REGISTER NOW'}</span>
                <ArrowRight className="w-4 h-4 text-cyber-black" />
              </Link>

              <Link
                href={settings.hero.cta_secondary_link || '/upcoming-events'}
                className="btn-cyber-secondary w-full sm:w-auto px-8 py-4 rounded-lg text-sm font-bold flex items-center justify-center space-x-2"
              >
                <Calendar className="w-5 h-5 text-neon-cyan" />
                <span>{settings.hero.cta_secondary_text || 'VIEW EVENTS'}</span>
              </Link>
            </div>

            {/* FEATURED TOURNAMENT BANNER HUD */}
            {featuredEvent && (
              <div className="mt-16 w-full max-w-3xl glass-hud rounded-xl p-5 sm:p-6 text-left border border-neon-cyan/40 shadow-hud">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-neon-emerald/20 text-neon-emerald border border-neon-emerald/40 font-mono">
                        FEATURED TOURNAMENT
                      </span>
                      <span className="text-xs font-mono text-gray-400">
                        {featuredEvent.game}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white mt-1 font-mono">
                      {featuredEvent.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-300 font-mono">
                      <span className="text-neon-gold font-bold">Prize: {featuredEvent.prize_pool}</span>
                      <span>&bull;</span>
                      <span className="text-neon-cyan">Date: {featuredEvent.date}</span>
                      <span>&bull;</span>
                      <span className="text-gray-400">{featuredEvent.venue}</span>
                    </div>
                  </div>

                  <Link
                    href={`/registration?event=${featuredEvent.id}`}
                    className="btn-cyber-primary px-5 py-2.5 rounded text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 self-stretch md:self-auto justify-center"
                  >
                    <span>CLAIM SLOT</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyber-black" />
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* 3. STATISTICS SECTION */}
      <section className="py-12 border-y border-cyber-border bg-cyber-dark/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {settings.statistics.map((stat, idx) => (
              <div 
                key={idx} 
                className="glass-panel p-6 rounded-xl text-center relative group hover:border-neon-emerald/40 transition-all duration-300"
              >
                <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-mono tracking-tight group-hover:text-neon-emerald transition-colors">
                  {stat.number}
                </div>
                <div className="mt-2 text-xs sm:text-sm font-bold tracking-widest text-gray-400 uppercase font-mono">
                  {stat.label}
                </div>
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-neon-emerald/40 group-hover:bg-neon-emerald transition-colors"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. UPCOMING EVENTS SHOWCASE */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="text-xs font-black tracking-widest text-neon-cyan uppercase font-mono flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-neon-cyan"></span>
              <span>CALENDAR</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase font-mono mt-1">
              UPCOMING TOURNAMENTS
            </h2>
          </div>
          <Link
            href="/upcoming-events"
            className="mt-4 md:mt-0 text-sm font-bold text-neon-emerald hover:text-white flex items-center space-x-1 font-mono"
          >
            <span>VIEW ALL UPCOMING EVENTS</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingEvents.slice(0, 3).map((event) => (
            <div
              key={event.id}
              className="glass-panel rounded-xl overflow-hidden flex flex-col border border-cyber-border hover:border-neon-cyan/50 hover:shadow-neon-cyan transition-all duration-300 group"
            >
              <div className="relative h-48 w-full overflow-hidden bg-cyber-dark">
                <Image
                  src={event.poster_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'}
                  alt={event.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-cyber-black/80 backdrop-blur-md border border-cyber-border text-[10px] font-black uppercase text-neon-cyan font-mono">
                  {event.game}
                </div>
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded bg-neon-emerald/20 backdrop-blur-md border border-neon-emerald/40 text-[10px] font-black uppercase text-neon-emerald font-mono">
                  {event.mode}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-black text-white font-mono group-hover:text-neon-cyan transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                    {event.description}
                  </p>
                </div>

                <div className="space-y-2 border-t border-cyber-border pt-4 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Prize Pool:</span>
                    <span className="text-neon-gold font-bold">{event.prize_pool}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date & Time:</span>
                    <span className="text-white">{event.date} &bull; {event.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Slots:</span>
                    <span className="text-neon-emerald font-bold">{event.filled_slots}/{event.total_slots} Filled</span>
                  </div>
                  {/* Slots Progress Bar */}
                  <div className="w-full h-1.5 bg-cyber-dark rounded-full overflow-hidden border border-cyber-border">
                    <div 
                      className="h-full bg-gradient-to-r from-neon-emerald to-neon-cyan" 
                      style={{ width: `${Math.min(100, (event.filled_slots / event.total_slots) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <Link
                  href={`/registration?event=${event.id}`}
                  className="btn-cyber-primary w-full py-2.5 rounded text-xs font-extrabold text-center uppercase tracking-wider block"
                >
                  REGISTER SQUAD
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. ONGOING EVENTS PULSE & LIVE POINTS TABLE PREVIEW */}
      <section className="py-20 bg-cyber-dark/30 border-y border-cyber-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="flex items-center space-x-2 text-xs font-black tracking-widest text-neon-red uppercase font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-neon-red animate-ping"></span>
                <span>LIVE MATCHES & STANDINGS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase font-mono mt-1">
                ONGOING CHAMPIONSHIPS
              </h2>
            </div>
            <Link
              href="/ongoing-events"
              className="mt-4 md:mt-0 text-sm font-bold text-neon-cyan hover:text-white flex items-center space-x-1 font-mono"
            >
              <span>EXPLORE ALL LIVE STAGES</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Live Matches Card */}
            <div className="lg:col-span-5 glass-hud p-6 rounded-xl border border-neon-cyan/40">
              <div className="flex items-center justify-between border-b border-cyber-border pb-4">
                <div className="flex items-center space-x-2">
                  <Radio className="w-5 h-5 text-neon-red animate-pulse" />
                  <span className="font-mono text-sm font-black text-white uppercase">MATCH BROADCAST</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neon-red/20 text-neon-red border border-neon-red/40 font-bold">
                  ROUND 5 / 6
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-lg bg-cyber-black/60 border border-cyber-border">
                  <div className="flex justify-between text-xs font-mono text-gray-400">
                    <span>Free Fire Max &bull; Bermuda</span>
                    <span className="text-neon-emerald font-bold">IN PROGRESS</span>
                  </div>
                  <div className="text-base font-black text-white font-mono mt-2">
                    Semi-Finals: Battle for Grand Finals Slot
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Top 6 squads advance to the LAN Grand Finals in Nagpur.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-cyber-black/60 border border-cyber-border">
                  <div className="flex justify-between text-xs font-mono text-gray-400">
                    <span>Next Match Scheduled</span>
                    <span className="text-neon-gold font-bold">08:30 PM IST</span>
                  </div>
                  <div className="text-base font-black text-white font-mono mt-2">
                    Grand Finals — Round 6 (Purgatory Decider)
                  </div>
                </div>

                <Link
                  href="/ongoing-events"
                  className="btn-cyber-secondary w-full py-3 rounded text-xs font-bold text-center flex items-center justify-center space-x-2 block"
                >
                  <Radio className="w-4 h-4 text-neon-cyan" />
                  <span>WATCH LIVE STREAM & STATS</span>
                </Link>
              </div>
            </div>

            {/* Quick Points Table Preview */}
            <div className="lg:col-span-7 glass-panel p-6 rounded-xl border border-cyber-border">
              <div className="flex items-center justify-between border-b border-cyber-border pb-4">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-neon-gold" />
                  <span className="font-mono text-sm font-black text-white uppercase">LIVE LEADERBOARD PREVIEW</span>
                </div>
                <span className="text-xs font-mono text-gray-400">
                  Updated Live
                </span>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-cyber-border text-gray-400">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">TEAM</th>
                      <th className="py-2.5 px-3 text-center">MATCHES</th>
                      <th className="py-2.5 px-3 text-center">WWCD</th>
                      <th className="py-2.5 px-3 text-right">TOTAL PTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyber-border">
                    {pointsTable.slice(0, 5).map((entry) => (
                      <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 font-black text-neon-gold">
                          {entry.rank === 1 ? '🥇 #1' : entry.rank === 2 ? '🥈 #2' : entry.rank === 3 ? '🥉 #3' : `#${entry.rank}`}
                        </td>
                        <td className="py-3 px-3 font-bold text-white">
                          {entry.team_name}
                        </td>
                        <td className="py-3 px-3 text-center text-gray-300">
                          {entry.matches_played}
                        </td>
                        <td className="py-3 px-3 text-center text-neon-emerald font-bold">
                          {entry.wwcd}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-neon-cyan text-sm">
                          {entry.total_points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 pt-3 border-t border-cyber-border text-right">
                <Link
                  href="/ongoing-events"
                  className="text-xs font-bold text-neon-emerald hover:underline font-mono"
                >
                  View Complete 16-Team Points Table &rarr;
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. ABOUT GAMERS GUILD SECTION */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div className="text-xs font-black tracking-widest text-neon-emerald uppercase font-mono flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-neon-emerald"></span>
              <span>ABOUT GAMERS GUILD</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase font-mono leading-tight">
              {settings.about.heading}
            </h2>

            <p className="text-base text-gray-300 leading-relaxed">
              {settings.about.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="glass-panel p-5 rounded-lg border-l-2 border-neon-cyan">
                <div className="text-xs font-black text-neon-cyan uppercase font-mono">OUR MISSION</div>
                <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                  {settings.about.mission}
                </p>
              </div>

              <div className="glass-panel p-5 rounded-lg border-l-2 border-neon-gold">
                <div className="text-xs font-black text-neon-gold uppercase font-mono">OUR VISION</div>
                <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                  {settings.about.vision}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/about"
                className="btn-cyber-secondary px-6 py-3 rounded text-xs font-bold font-mono inline-flex items-center space-x-2"
              >
                <span>READ FULL STORY & ACHIEVEMENTS</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative h-[420px] rounded-2xl overflow-hidden border border-neon-emerald/30 glass-hud p-2">
              <Image
                src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80"
                alt="Gamers Guild Arena"
                fill
                className="object-cover rounded-xl opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-transparent to-transparent"></div>
              
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-cyber-black/80 backdrop-blur-md border border-cyber-border">
                <div className="text-xs font-mono text-neon-emerald font-bold">STATE RECOGNITION</div>
                <div className="text-sm font-black text-white font-mono mt-1">
                  Pioneering Tier-1 Esports Infrastructure in Central India
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 7. GALLERY SECTION */}
      <section className="py-20 bg-cyber-dark/40 border-y border-cyber-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="text-xs font-black tracking-widest text-neon-cyan uppercase font-mono flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-neon-cyan"></span>
                <span>MEDIA VAULT</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase font-mono mt-1">
                ACTION & LAN MOMENTS
              </h2>
            </div>
            <div className="text-xs font-mono text-gray-400 mt-2 md:mt-0">
              LAN Grand Finals, Trophy Celebrations & Stage Moments
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {gallery.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedGalleryImg(item)}
                className="glass-panel rounded-xl overflow-hidden border border-cyber-border hover:border-neon-emerald/50 cursor-pointer group transition-all duration-300"
              >
                <div className="relative h-56 w-full overflow-hidden bg-cyber-dark">
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-transparent opacity-60 group-hover:opacity-30 transition-opacity"></div>
                  <div className="absolute bottom-3 left-3 right-3 text-left">
                    <span className="text-[10px] font-mono font-bold uppercase text-neon-emerald bg-cyber-black/70 px-2 py-0.5 rounded border border-neon-emerald/30">
                      {item.category}
                    </span>
                    <h4 className="text-xs font-black text-white font-mono mt-1 truncate">
                      {item.title}
                    </h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. SPONSORS & PARTNERS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-xs font-black tracking-widest text-neon-gold uppercase font-mono mb-2">
          OFFICIAL ALLIANCES
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white uppercase font-mono mb-12">
          SPONSORS & PARTNERS
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {sponsors.map((sponsor) => (
            <a
              key={sponsor.id}
              href={sponsor.website || '#'}
              target="_blank"
              rel="noreferrer"
              className="glass-panel p-6 rounded-xl border border-cyber-border hover:border-neon-gold/50 flex flex-col items-center justify-center space-y-3 group transition-all duration-300"
            >
              <div className="relative w-16 h-16 rounded-lg bg-white/5 p-2 flex items-center justify-center">
                <Image
                  src={sponsor.logo_url}
                  alt={sponsor.name}
                  width={60}
                  height={60}
                  className="object-contain filter grayscale group-hover:grayscale-0 transition duration-300"
                />
              </div>
              <div>
                <h4 className="text-xs font-black text-white font-mono group-hover:text-neon-gold transition-colors">
                  {sponsor.name}
                </h4>
                <p className="text-[10px] font-mono text-gray-400 mt-0.5 uppercase">
                  {sponsor.tier.replace(/_/g, ' ')}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 9. CALL TO ACTION (CTA) */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="glass-hud p-8 sm:p-14 rounded-2xl border-2 border-neon-emerald/40 text-center relative shadow-hud">
            
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neon-emerald/10 border border-neon-emerald/30 text-neon-emerald text-xs font-mono font-bold uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>REGISTRATION PORTAL LIVE</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase font-mono leading-tight">
              ARE YOU READY TO PROVE YOUR SKILLS?
            </h2>

            <p className="mt-4 text-sm sm:text-base text-gray-300 max-w-xl mx-auto font-sans leading-relaxed">
              Step into the competitive circuit. Receive your unique State Registration Code (e.g. MH27), get scouted, and compete for national prize pools.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/registration"
                className="btn-cyber-primary px-8 py-4 rounded-lg text-sm font-extrabold flex items-center justify-center space-x-2 shadow-neon-emerald"
              >
                <Flame className="w-5 h-5 text-cyber-black fill-current" />
                <span>REGISTER FOR NEXT TOURNAMENT</span>
              </Link>
              <Link
                href="/contact"
                className="btn-cyber-secondary px-8 py-4 rounded-lg text-sm font-bold flex items-center justify-center space-x-2"
              >
                <span>ORGANIZATION INQUIRIES</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 10. QUICK CONTACT SECTION */}
      <section className="py-16 border-t border-cyber-border bg-cyber-dark/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-6 rounded-xl border border-cyber-border">
              <div className="text-neon-emerald font-black font-mono text-xs uppercase">DIRECT EMAIL</div>
              <div className="text-white font-bold font-mono text-sm mt-1">{settings.contact.email}</div>
              <p className="text-xs text-gray-400 mt-2">Sponsorships, complaints, and general tournament queries.</p>
            </div>
            <div className="glass-panel p-6 rounded-xl border border-cyber-border">
              <div className="text-neon-cyan font-black font-mono text-xs uppercase">PLAYER HELPLINE</div>
              <div className="text-white font-bold font-mono text-sm mt-1">{settings.contact.phone}</div>
              <p className="text-xs text-gray-400 mt-2">WhatsApp room assistance & verification helpdesk.</p>
            </div>
            <div className="glass-panel p-6 rounded-xl border border-cyber-border">
              <div className="text-neon-gold font-black font-mono text-xs uppercase">HEADQUARTERS ARENA</div>
              <div className="text-white font-bold font-mono text-sm mt-1">Nagpur, Maharashtra</div>
              <p className="text-xs text-gray-400 mt-2">{settings.contact.address}</p>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY LIGHTBOX MODAL */}
      {selectedGalleryImg && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full glass-panel p-4 rounded-2xl border border-neon-cyan/40">
            <button
              onClick={() => setSelectedGalleryImg(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-lg bg-cyber-dark border border-cyber-border z-10"
            >
              ✕
            </button>
            <div className="relative h-[450px] w-full rounded-lg overflow-hidden">
              <Image
                src={selectedGalleryImg.image_url}
                alt={selectedGalleryImg.title}
                fill
                className="object-contain"
              />
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-black text-white font-mono">{selectedGalleryImg.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{selectedGalleryImg.description}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
