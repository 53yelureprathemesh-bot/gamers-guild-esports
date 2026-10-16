'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Printer, 
  Share2, 
  ArrowRight, 
  AlertCircle,
  Phone,
  Hash,
  RotateCw,
  Lock,
  Search,
  Mail,
  UserCheck,
  Sparkles
} from 'lucide-react';
import PrintableReceipt, { PrintableReceiptProps } from '@/components/PrintableReceipt';
import { GamingEmberParticles, HudCornerBrackets } from '@/components/GamingVisualEffects';

function FindRegistrationContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [searchedTerm, setSearchedTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [activePrintReceipt, setActivePrintReceipt] = useState<PrintableReceiptProps | null>(null);

  const executeSearch = useCallback(async (rawInput: string) => {
    const term = (rawInput || '').trim();
    if (!term) {
      setValidationError('Please enter your Registration Code (#MH11), 10-digit Mobile Number, or Email.');
      return;
    }

    setValidationError(null);
    setLoading(true);
    setSearched(true);
    setSearchedTerm(term);

    try {
      const cleanTerm = term.replace(/^#+/, '').trim();
      const queryUrl = `/api/admin/data?type=find-registration&query=${encodeURIComponent(cleanTerm)}`;
      const res = await fetch(queryUrl);
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        const formatted = data.data.map((serverReg: any) => ({
          publicCode: serverReg.public_code || serverReg.publicCode,
          playerName: serverReg.player_name || serverReg.playerName,
          inGameName: serverReg.in_game_name || serverReg.inGameName,
          playerUid: serverReg.player_uid || serverReg.playerUid,
          teamName: serverReg.team_name || serverReg.teamName,
          game: serverReg.game,
          eventName: serverReg.event_title || serverReg.eventName || 'Gamers Guild Championship',
          state: serverReg.state,
          district: serverReg.district || '',
          phone: serverReg.phone || '',
          email: serverReg.email || '',
          status: serverReg.status || 'PENDING',
          date: new Date(serverReg.created_at || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        }));
        setResults(formatted);
      } else {
        setResults([]);
        if (data.error) {
          setValidationError(data.error);
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fill and execute search if present in URL (e.g. from confirmation email: ?query=MH11 or ?code=MH11)
  useEffect(() => {
    const urlParam = searchParams.get('query') || searchParams.get('code') || searchParams.get('phone') || searchParams.get('q');
    if (urlParam) {
      const clean = urlParam.trim();
      setQuery(clean);
      executeSearch(clean);
    }
  }, [searchParams, executeSearch]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s.includes('APPROV') || s.includes('VERIF')) {
      return (
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-neon-emerald/20 text-neon-emerald border border-neon-emerald/50">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>APPROVED & CONFIRMED</span>
        </span>
      );
    }
    if (s.includes('REJECT')) {
      return (
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-neon-red/20 text-neon-red border border-neon-red/50">
          <XCircle className="w-3.5 h-3.5" />
          <span>VERIFICATION FAILED</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-neon-gold/20 text-neon-gold border border-neon-gold/50">
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
      `Track your live status securely at: ${window.location.origin}/find-registration?query=${reg.publicCode}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen gaming-arena-bg py-12 sm:py-20 relative overflow-hidden font-rajdhani">
      {/* Ambient floating glowing embers */}
      <GamingEmberParticles />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Banner */}
        <div className="text-center max-w-2xl mx-auto mb-10 screen-only">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-neon-cyan/15 border border-neon-cyan/40 text-neon-cyan text-xs font-orbitron font-bold uppercase mb-3">
            <ShieldCheck className="w-4 h-4 text-neon-emerald" />
            <span>SECURE ARBITER VERIFICATION PORTAL</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white font-orbitron uppercase tracking-tight">
            FIND YOUR REGISTRATION
          </h1>

          <p className="mt-3 text-base text-gray-300 font-rajdhani font-semibold">
            Search with your <strong className="text-neon-cyan">Registration Code (#MH11)</strong>, <strong className="text-neon-emerald">10-Digit Mobile Number</strong>, or <strong className="text-neon-gold">Registered Email</strong> to view your tournament entry and download your official receipt.
          </p>
        </div>

        {/* Verification Form Card */}
        <div className="max-w-2xl mx-auto mb-12 screen-only">
          <div className="glass-hud rounded-2xl p-6 sm:p-8 border-2 border-neon-cyan/50 shadow-hud relative overflow-hidden">
            <HudCornerBrackets color="cyan" />
            <form onSubmit={handleFormSubmit} className="space-y-4 relative z-10">
              
              {/* Universal Search Input */}
              <div className="space-y-2">
                <label className="text-xs font-rajdhani font-bold uppercase text-gray-200 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Search className="w-3.5 h-3.5 text-neon-cyan" />
                    <span>Search Registration *</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-normal font-mono">Code / Mobile / Email</span>
                </label>

                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-gray-400">
                    <Search className="w-4 h-4 text-neon-cyan" />
                  </div>
                  <input
                    type="text"
                    required
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setValidationError(null);
                    }}
                    placeholder="Enter Registration Code (e.g. #MH11), Mobile, or Email..."
                    className="w-full pl-11 pr-4 py-3.5 bg-cyber-dark border border-cyber-border rounded-xl text-sm font-mono text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan shadow-inner"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="absolute right-3 text-xs font-mono text-gray-400 hover:text-white px-2 py-1"
                    >
                      &times; Clear
                    </button>
                  )}
                </div>

                {/* Helper Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-gray-400">
                  <span className="text-gray-500">Quick Search:</span>
                  <span className="px-2 py-0.5 rounded bg-cyber-dark border border-cyber-border text-neon-cyan flex items-center space-x-1">
                    <Hash className="w-3 h-3" />
                    <span>Code (#MH11)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyber-dark border border-cyber-border text-neon-emerald flex items-center space-x-1">
                    <Phone className="w-3 h-3" />
                    <span>Mobile Number</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyber-dark border border-cyber-border text-neon-gold flex items-center space-x-1">
                    <Mail className="w-3 h-3" />
                    <span>Email Address</span>
                  </span>
                </div>
              </div>

              {validationError && (
                <div className="p-3 rounded-xl bg-neon-red/20 border border-neon-red/50 text-xs font-mono text-neon-red flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-cyber-primary clip-esports-btn w-full py-3.5 text-xs font-black font-orbitron uppercase tracking-wider flex items-center justify-center space-x-2 shadow-neon-emerald mt-3"
              >
                {loading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-cyber-black" />
                    <span>VERIFYING REGISTRATION...</span>
                  </>
                ) : (
                  <>
                    <span>VERIFY & VIEW MY STATUS</span>
                    <ArrowRight className="w-4 h-4 text-cyber-black" />
                  </>
                )}
              </button>
            </form>

            {/* Privacy Guarantee Note */}
            <div className="mt-4 pt-4 border-t border-cyber-border/60 flex items-start space-x-2 text-[10px] font-mono text-gray-400">
              <Lock className="w-3.5 h-3.5 text-neon-emerald flex-shrink-0 mt-0.5" />
              <span>
                <strong>Instant Tournament Verification:</strong> Validated in real-time against official tournament arbiter logs. You can print your official receipt or share it directly to WhatsApp.
              </span>
            </div>
          </div>
        </div>

        {/* PRINT RECEIPT OVERLAY */}
        {activePrintReceipt && (
          <div className="mb-10">
            <div className="screen-only mb-4 flex justify-between items-center bg-cyber-dark/80 p-3 rounded-lg border border-cyber-border">
              <span className="text-xs font-mono text-gray-300">Viewing Printable Official Receipt:</span>
              <button
                onClick={() => setActivePrintReceipt(null)}
                className="text-xs font-mono text-neon-red hover:underline font-bold"
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
                VERIFIED REGISTRATION RECORDS ({results.length})
              </span>
            </div>

            {results.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl border border-cyber-border text-center space-y-4">
                <AlertCircle className="w-10 h-10 text-neon-gold mx-auto" />
                <h3 className="text-lg font-bold font-mono text-white uppercase">
                  NO REGISTRATION FOUND
                </h3>
                <p className="text-xs text-gray-300 max-w-md mx-auto font-sans leading-relaxed">
                  No active tournament registration was found matching <strong className="text-neon-cyan font-mono">&quot;{searchedTerm}&quot;</strong>.
                </p>
                <div className="text-[11px] font-mono text-gray-400 max-w-sm mx-auto bg-cyber-dark/80 p-3 rounded-xl border border-cyber-border text-left space-y-1">
                  <p className="font-bold text-gray-300 text-center mb-1">Search Tips:</p>
                  <p>&bull; Try entering your Registration Code (e.g. <strong className="text-neon-cyan">#MH11</strong>).</p>
                  <p>&bull; Enter your registered 10-digit mobile number.</p>
                  <p>&bull; Or search using your registered email address.</p>
                </div>
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
                      <ShieldCheck className="w-4 h-4 text-neon-emerald flex-shrink-0 mt-0.5" />
                      <span>
                        Match room credentials and lobby slot numbers are dispatched via SMS/WhatsApp to your registered number 30 minutes before match time. Ensure your Character UID (<strong className="text-white">{reg.playerUid}</strong>) is ready on match day.
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            )}
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

export default function FindRegistrationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen cyber-bg flex items-center justify-center p-4">
        <div className="glass-hud p-8 rounded-2xl border border-neon-cyan/40 text-center font-mono">
          <RotateCw className="w-8 h-8 mx-auto animate-spin text-neon-emerald mb-3" />
          <div className="text-xs text-gray-300">LOADING REGISTRATION PORTAL...</div>
        </div>
      </div>
    }>
      <FindRegistrationContent />
    </Suspense>
  );
}

