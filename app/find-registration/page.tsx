'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Shield, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Printer, 
  Share2, 
  ArrowRight, 
  UserCheck, 
  AlertCircle,
  Sparkles,
  ChevronRight,
  RotateCw
} from 'lucide-react';
import PrintableReceipt, { PrintableReceiptProps } from '@/components/PrintableReceipt';

export default function FindRegistrationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activePrintReceipt, setActivePrintReceipt] = useState<PrintableReceiptProps | null>(null);

  // Load recently submitted registrations on this device
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gg_my_registrations');
      if (stored) {
        setRecentRegistrations(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error reading localStorage registrations:', e);
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setLoading(true);
    setSearched(true);

    try {
      // 1. Check local registrations first
      const cleanDigits = query.replace(/\D/g, '');
      const cleanCode = query.toLowerCase().replace(/^#/, '');

      const localMatches = recentRegistrations.filter(r => {
        const codeMatch = r.publicCode?.toLowerCase().replace(/^#/, '') === cleanCode;
        const emailMatch = r.email?.toLowerCase() === query.toLowerCase();
        const phoneMatch = cleanDigits && r.phone?.replace(/\D/g, '').includes(cleanDigits);
        const nameMatch = r.playerName?.toLowerCase().includes(query.toLowerCase()) || r.inGameName?.toLowerCase().includes(query.toLowerCase());
        const teamMatch = r.teamName?.toLowerCase().includes(query.toLowerCase());
        const uidMatch = cleanDigits && r.playerUid?.replace(/\D/g, '').includes(cleanDigits);
        return codeMatch || emailMatch || phoneMatch || nameMatch || teamMatch || uidMatch;
      });

      // 2. Fetch from backend API
      const res = await fetch(`/api/admin/data?type=find-registration&query=${encodeURIComponent(query)}`);
      const apiData = await res.json();

      let combined = [...localMatches];

      if (apiData.success && Array.isArray(apiData.data)) {
        apiData.data.forEach((serverReg: any) => {
          const formatted = {
            publicCode: serverReg.public_code || serverReg.publicCode,
            playerName: serverReg.player_name || serverReg.playerName,
            inGameName: serverReg.in_game_name || serverReg.inGameName,
            playerUid: serverReg.player_uid || serverReg.playerUid,
            teamName: serverReg.team_name || serverReg.teamName,
            game: serverReg.game,
            eventName: serverReg.event_title || serverReg.eventName || 'Gamers Guild Championship',
            state: serverReg.state,
            district: serverReg.district,
            phone: serverReg.phone,
            email: serverReg.email,
            status: serverReg.status || 'PENDING',
            date: new Date(serverReg.created_at || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
          };

          // Deduplicate by publicCode
          if (!combined.some(c => c.publicCode === formatted.publicCode)) {
            combined.push(formatted);
          }
        });
      }

      setResults(combined);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s.includes('APPROV') || s.includes('VERIF')) {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-neon-emerald/20 text-neon-emerald border border-neon-emerald/50">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>APPROVED & CONFIRMED</span>
        </span>
      );
    }
    if (s.includes('REJECT')) {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-neon-red/20 text-neon-red border border-neon-red/50">
          <XCircle className="w-3.5 h-3.5" />
          <span>VERIFICATION FAILED</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-neon-gold/20 text-neon-gold border border-neon-gold/50">
        <Clock className="w-3.5 h-3.5" />
        <span>PENDING ARBITER REVIEW</span>
      </span>
    );
  };

  const shareOnWhatsApp = (reg: any) => {
    const text = encodeURIComponent(
      `🎮 Gamers Guild Esports Registration Confirmed!\n\n` +
      `📌 Team: ${reg.teamName}\n` +
      `🔥 Player: ${reg.playerName} (${reg.inGameName})\n` +
      `🆔 Character UID: ${reg.playerUid}\n` +
      `🎫 Registration Number: #${reg.publicCode}\n` +
      `⚡ State Circuit: ${reg.state}\n` +
      `🏆 Tournament: ${reg.eventName}\n\n` +
      `Track live status anytime at: ${window.location.origin}/find-registration`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen cyber-bg py-12 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Banner */}
        <div className="text-center max-w-2xl mx-auto mb-10 screen-only">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan text-xs font-mono font-bold uppercase mb-3">
            <UserCheck className="w-4 h-4" />
            <span>PLAYER & SQUAD STATUS PORTAL</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white font-mono uppercase tracking-tight">
            FIND YOUR REGISTRATION
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-gray-400 font-sans">
            Enter your official registration number (e.g. <span className="text-neon-cyan font-mono font-bold">#MH27</span>), character UID, mobile number, or email to verify your slot status and print your official receipt.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="max-w-2xl mx-auto mb-12 screen-only">
          <form onSubmit={handleSearch} className="relative">
            <div className="glass-hud rounded-2xl p-2 border-2 border-neon-cyan/40 focus-within:border-neon-emerald transition-all shadow-hud flex items-center">
              <Search className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Reg Number (#MH27), Phone, UID, or Email..."
                className="w-full px-4 py-3 bg-transparent text-sm sm:text-base font-mono text-white placeholder-gray-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-cyber-primary px-5 sm:px-7 py-3 rounded-xl text-xs font-black font-mono uppercase flex-shrink-0 flex items-center space-x-1.5"
              >
                {loading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-cyber-black" />
                    <span className="hidden sm:inline">SEARCHING...</span>
                  </>
                ) : (
                  <>
                    <span>TRACK STATUS</span>
                    <ArrowRight className="w-4 h-4 text-cyber-black" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Helper tags */}
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-mono justify-center text-gray-400">
            <span>Quick search:</span>
            <button
              type="button"
              onClick={() => { setSearchQuery('MH27'); setTimeout(() => handleSearch(), 100); }}
              className="text-neon-cyan hover:underline"
            >
              #MH27
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => { setSearchQuery('GJ14'); setTimeout(() => handleSearch(), 100); }}
              className="text-neon-cyan hover:underline"
            >
              #GJ14
            </button>
          </div>
        </div>

        {/* PRINT RECEIPT MODAL OVERLAY */}
        {activePrintReceipt && (
          <div className="mb-10">
            <div className="screen-only mb-4 flex justify-between items-center bg-cyber-dark/80 p-3 rounded-lg border border-cyber-border">
              <span className="text-xs font-mono text-gray-300">Viewing Printable Official Receipt:</span>
              <button
                onClick={() => setActivePrintReceipt(null)}
                className="text-xs font-mono text-neon-red hover:underline"
              >
                Close Receipt View &times;
              </button>
            </div>
            <PrintableReceipt data={activePrintReceipt} />
          </div>
        )}

        {/* SEARCH RESULTS */}
        {searched && (
          <div className="space-y-6 mb-16 screen-only">
            <div className="flex items-center justify-between border-b border-cyber-border pb-3">
              <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                SEARCH RESULTS ({results.length})
              </span>
            </div>

            {results.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl border border-cyber-border text-center space-y-4">
                <AlertCircle className="w-10 h-10 text-neon-gold mx-auto" />
                <h3 className="text-lg font-bold font-mono text-white uppercase">
                  NO REGISTRATION FOUND
                </h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto font-sans">
                  We could not find any registration matching <span className="text-neon-cyan font-mono font-bold">&quot;{searchQuery}&quot;</span>. Please double check the registration code (e.g. MH27), character UID, or registered mobile number.
                </p>
                <div className="pt-2">
                  <Link
                    href="/registration"
                    className="btn-cyber-primary inline-flex items-center space-x-2 px-6 py-2.5 rounded-lg text-xs font-mono font-black uppercase"
                  >
                    <span>REGISTER FOR A TOURNAMENT</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyber-black" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {results.map((reg, idx) => (
                  <div
                    key={reg.publicCode || idx}
                    className="glass-hud rounded-2xl border-2 border-neon-cyan/40 p-6 hover:border-neon-emerald transition-all shadow-hud"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border pb-4 mb-4">
                      <div>
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl font-black font-mono text-neon-cyan tracking-wider">
                            #{reg.publicCode}
                          </span>
                          {getStatusBadge(reg.status)}
                        </div>
                        <p className="text-xs font-mono text-gray-400 mt-1">
                          Circuit: <strong className="text-white">{reg.state}</strong> &bull; Registered: {reg.date}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setActivePrintReceipt(reg);
                            window.scrollTo({ top: 150, behavior: 'smooth' });
                          }}
                          className="btn-cyber-primary px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase flex items-center space-x-1.5"
                        >
                          <Printer className="w-3.5 h-3.5 text-cyber-black" />
                          <span>PRINT RECEIPT</span>
                        </button>

                        <button
                          onClick={() => shareOnWhatsApp(reg)}
                          className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
                          title="Share on WhatsApp"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                      <div className="p-3 rounded-lg bg-cyber-dark/80 border border-cyber-border">
                        <span className="text-gray-400 block text-[10px] uppercase">TEAM / SQUAD</span>
                        <span className="font-bold text-white text-sm truncate block mt-0.5">{reg.teamName}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-cyber-dark/80 border border-cyber-border">
                        <span className="text-gray-400 block text-[10px] uppercase">PLAYER IGN</span>
                        <span className="font-bold text-neon-cyan text-sm truncate block mt-0.5">{reg.inGameName}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-cyber-dark/80 border border-cyber-border">
                        <span className="text-gray-400 block text-[10px] uppercase">CHARACTER UID</span>
                        <span className="font-bold text-white text-sm font-mono truncate block mt-0.5">{reg.playerUid}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-cyber-dark/80 border border-cyber-border">
                        <span className="text-gray-400 block text-[10px] uppercase">DISCIPLINE</span>
                        <span className="font-bold text-neon-gold text-sm truncate block mt-0.5">{reg.game}</span>
                      </div>
                    </div>

                    {/* Instructions Banner */}
                    <div className="mt-4 p-3 rounded-lg bg-cyber-black/60 border border-cyber-border text-xs font-mono flex items-start space-x-2 text-gray-300">
                      <Shield className="w-4 h-4 text-neon-emerald flex-shrink-0 mt-0.5" />
                      <span>
                        Match room credentials and lobby slot numbers are dispatched via SMS/WhatsApp 30 minutes before match time. Ensure your Character UID (<strong className="text-white">{reg.playerUid}</strong>) is ready on match day.
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RECENT REGISTRATIONS ON THIS DEVICE */}
        {recentRegistrations.length > 0 && (
          <div className="mt-12 screen-only">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-4 h-4 text-neon-emerald" />
              <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                REGISTRATIONS SAVED ON THIS DEVICE ({recentRegistrations.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentRegistrations.map((rec) => (
                <div
                  key={rec.publicCode}
                  className="glass-panel p-4 rounded-xl border border-cyber-border hover:border-neon-cyan transition cursor-pointer"
                  onClick={() => {
                    setActivePrintReceipt(rec);
                    window.scrollTo({ top: 150, behavior: 'smooth' });
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-black font-mono text-neon-cyan">
                      #{rec.publicCode}
                    </span>
                    <span className="text-[10px] font-mono text-neon-emerald font-bold px-2 py-0.5 rounded bg-neon-emerald/10 border border-neon-emerald/30">
                      SAVED LOCALLY
                    </span>
                  </div>
                  <div className="text-xs font-mono text-white font-bold mt-2 truncate">
                    {rec.teamName} &bull; {rec.inGameName}
                  </div>
                  <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                    UID: {rec.playerUid} &bull; {rec.game}
                  </div>
                  <div className="mt-3 text-[10px] font-mono text-neon-cyan flex items-center space-x-1">
                    <span>Click to view & print official receipt</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Need Help Footer */}
        <div className="mt-16 text-center text-xs font-mono text-gray-500 border-t border-cyber-border pt-8 screen-only">
          <p>Need help with your registration? Contact tournament arbiters at <strong className="text-gray-300">support@gamersguild.gg</strong></p>
        </div>

      </div>
    </div>
  );
}
