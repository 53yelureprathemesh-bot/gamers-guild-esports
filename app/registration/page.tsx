'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  Printer, 
  Download, 
  ArrowLeft, 
  FileText, 
  FileCheck, 
  UserCheck, 
  Sparkles,
  Gamepad2,
  Trash2,
  Lock,
  Mail
} from 'lucide-react';
import { INDIAN_STATES, getDistrictsForState } from '@/lib/stateCodes';
import { DEFAULT_FORM_FIELDS } from '@/lib/defaultForm';
import { Event, RegistrationField } from '@/lib/types';
import { INITIAL_EVENTS } from '@/lib/dataStore';
import PrintableReceipt from '@/components/PrintableReceipt';
import { GamingEmberParticles, HudCornerBrackets } from '@/components/GamingVisualEffects';

function RegistrationFormContent() {
  const searchParams = useSearchParams();
  const preselectedEventId = searchParams.get('event');

  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState<string>(preselectedEventId || 'evt-001');
  const [formFields, setFormFields] = useState<RegistrationField[]>(DEFAULT_FORM_FIELDS);

  // Form State
  const [formData, setFormData] = useState<Record<string, any>>({
    fullName: '',
    dateOfBirth: '',
    gender: 'Male',
    phone: '',
    email: '',
    state: 'Maharashtra',
    district: 'Nagpur',
    city: 'Nagpur',
    game: 'BGMI (Battlegrounds Mobile India)',
    inGameName: '',
    playerUid: '',
    teamName: '',
    teamRole: 'IGL (In-Game Leader)',
    gamingExperience: ''
  });

  // Dynamic custom answers
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});
  
  // File uploads state (mock storage / URL)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { name: string; url: string; size: string; type: string }>>({});
  
  // UI Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<any | null>(null);

  // Fetch events & form fields
  useEffect(() => {
    fetch('/api/admin/data')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          if (res.data.events?.length) setEvents(res.data.events);
          if (res.data.formFields?.length) setFormFields(res.data.formFields);
        }
      })
      .catch(() => console.log('Loaded default client form structure.'));
  }, []);

  // Update district dropdown when state changes
  useEffect(() => {
    const districts = getDistrictsForState(formData.state);
    if (districts.length > 0 && !districts.includes(formData.district)) {
      setFormData(prev => ({ ...prev, district: districts[0] }));
    }
  }, [formData.state]);

  const activeEvent = events.find(e => e.id === selectedEventId) || events[0];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomAnswerChange = (fieldId: string, value: any) => {
    setCustomAnswers(prev => ({ ...prev, [fieldId]: value }));
  };

  // Handle file uploads with validation and Base64 compression
  const handleFileUpload = (fieldKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Invalid file format. Only JPG, PNG, WEBP, and PDF files are permitted.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    setErrorMsg(null);

    // If it's an image, read, resize and compress via canvas
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const rawDataUrl = loadEvt.target?.result as string;
        const img = new window.Image();
        img.onload = () => {
          const maxDim = 1400;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedUrl = canvas.toDataURL('image/jpeg', 0.82);
            setUploadedFiles(prev => ({
              ...prev,
              [fieldKey]: {
                name: file.name,
                url: compressedUrl,
                size: `${Math.round((compressedUrl.length * 0.75) / 1024)} KB`,
                type: 'image/jpeg'
              }
            }));
          } else {
            setUploadedFiles(prev => ({
              ...prev,
              [fieldKey]: {
                name: file.name,
                url: rawDataUrl,
                size: `${Math.round(file.size / 1024)} KB`,
                type: file.type
              }
            }));
          }
        };
        img.onerror = () => {
          setUploadedFiles(prev => ({
            ...prev,
            [fieldKey]: {
              name: file.name,
              url: rawDataUrl,
              size: `${Math.round(file.size / 1024)} KB`,
              type: file.type
            }
          }));
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    } else {
      // PDF document
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const dataUrl = loadEvt.target?.result as string;
        setUploadedFiles(prev => ({
          ...prev,
          [fieldKey]: {
            name: file.name,
            url: dataUrl,
            size: `${Math.round(file.size / 1024)} KB`,
            type: file.type
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (fieldKey: string) => {
    setUploadedFiles(prev => {
      const copy = { ...prev };
      delete copy[fieldKey];
      return copy;
    });
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!formData.fullName || !formData.phone || !formData.email || !formData.inGameName || !formData.playerUid || !formData.teamName) {
      setErrorMsg('Please complete all required fields with valid details.');
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        eventId: selectedEventId,
        playerName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        state: formData.state,
        district: formData.district,
        city: formData.city,
        game: formData.game,
        inGameName: formData.inGameName,
        playerUid: formData.playerUid,
        teamName: formData.teamName,
        teamRole: formData.teamRole,
        gamingExperience: formData.gamingExperience,
        answers: customAnswers,
        files: Object.entries(uploadedFiles).map(([k, v]) => ({
          fieldId: k,
          fileName: v.name,
          fileUrl: v.url,
          mimeType: v.type
        }))
      };

      const res = await fetch('/api/registrations/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Registration submission failed.');
      }

      const receiptRecord = {
        publicCode: data.publicCode,
        playerName: formData.fullName,
        inGameName: formData.inGameName,
        playerUid: formData.playerUid,
        teamName: formData.teamName,
        game: formData.game,
        eventName: activeEvent?.title || 'Tournament',
        state: formData.state,
        district: formData.district,
        phone: formData.phone,
        email: formData.email,
        status: 'PENDING (Under Review)',
        date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      };

      // Save to client localStorage for instant lookups on this device
      try {
        const stored = JSON.parse(localStorage.getItem('gg_my_registrations') || '[]');
        stored.unshift(receiptRecord);
        localStorage.setItem('gg_my_registrations', JSON.stringify(stored));
      } catch (e) {
        console.error('LocalStorage save error:', e);
      }

      setSubmissionSuccess(receiptRecord);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit registration. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION SCREEN WITH 1-PAGE PRINTABLE RECEIPT
  if (submissionSuccess) {
    return (
      <div className="min-h-screen cyber-bg py-12 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          
          {/* Automated Email Confirmation Banner */}
          <div className="mb-6 p-4 sm:p-5 rounded-xl border border-neon-emerald/50 bg-cyber-dark/95 backdrop-blur-md shadow-neon-glow flex items-start space-x-3 screen-only">
            <div className="w-9 h-9 rounded-full bg-neon-emerald/10 border border-neon-emerald flex items-center justify-center flex-shrink-0 mt-0.5">
              <Mail className="w-5 h-5 text-neon-emerald animate-pulse" />
            </div>
            <div className="flex-1 text-xs">
              <div className="text-neon-emerald font-black font-mono tracking-wider uppercase flex items-center space-x-2">
                <span>AUTOMATIC EMAIL DISPATCHED</span>
                <span className="inline-block w-2 h-2 rounded-full bg-neon-emerald animate-ping" />
              </div>
              <p className="text-slate-300 mt-1 leading-relaxed text-sm">
                Official tournament receipt has been automatically generated and sent to <span className="text-neon-cyan font-bold font-mono">{submissionSuccess.email}</span>.
              </p>
              <p className="text-amber-400/90 mt-2 font-medium leading-relaxed bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                ⚠️ <strong className="text-white">Notice for Gmail users:</strong> If not immediately visible in your Primary inbox, please check your <strong className="text-white">Spam</strong> or <strong className="text-white">Promotions</strong> folder and click <strong className="text-white">&quot;Report not spam&quot;</strong> so you never miss custom room ID/passwords on tournament day.
              </p>
            </div>
          </div>

          <PrintableReceipt data={submissionSuccess} />

          {/* Action Links */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center screen-only">
            <Link
              href="/find-registration"
              className="btn-cyber-primary px-6 py-3 rounded-lg text-xs font-black font-mono uppercase flex items-center justify-center space-x-2"
            >
              <UserCheck className="w-4 h-4 text-cyber-black" />
              <span>TRACK IN REGISTRATION DASHBOARD</span>
            </Link>

            <Link
              href="/"
              className="btn-cyber-secondary px-6 py-3 rounded-lg text-xs font-bold font-mono uppercase flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4 text-neon-cyan" />
              <span>BACK TO ARENA HOME</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD FORM VIEW
  return (
    <div className="min-h-screen gaming-arena-bg py-12 sm:py-16 relative overflow-hidden font-rajdhani">
      {/* Ambient floating glowing embers */}
      <GamingEmberParticles />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Form Title Banner with Tactical Operator Badge & HUD Brackets */}
        <div className="glass-hud rounded-2xl border-t-4 border-t-neon-emerald border-x border-b border-cyber-border p-6 sm:p-8 mb-8 shadow-hud relative overflow-hidden">
          <HudCornerBrackets color="emerald" />
          <div className="flex items-center justify-between pb-4 border-b border-cyber-border">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 rounded-lg bg-cyber-dark border border-neon-emerald/50 p-1 flex items-center justify-center overflow-hidden">
                <Image src="/images/characters/bgmi_operator.jpg" alt="Tactical Operator" fill className="object-cover" />
              </div>
              <div>
                <span className="text-[10px] font-orbitron uppercase text-neon-emerald font-black tracking-widest flex items-center space-x-1">
                  <span>GAMERS GUILD ESPORTS</span>
                  <span>•</span>
                  <span className="text-neon-cyan">OFFICIAL ENLISTMENT</span>
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white font-orbitron uppercase">
                  OPERATOR & SQUAD REGISTRATION
                </h1>
              </div>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 rounded bg-neon-emerald/10 text-neon-emerald border border-neon-emerald/40 text-xs font-orbitron font-bold">
              CIRCUIT 2026
            </span>
          </div>

          <p className="mt-4 text-xs sm:text-sm text-gray-300 font-rajdhani font-semibold leading-relaxed">
            Welcome to the official tactical registration portal for Gamers Guild Esports national tournaments. Enter verified player and in-game credentials. Upon completion, our state code engine will generate your immutable bracket identification (e.g. #MH27).
          </p>

          <div className="mt-4 pt-3 border-t border-cyber-border flex items-center text-xs font-mono text-neon-red space-x-1">
            <span>* Mandatory tournament fields required for bracket validation</span>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-neon-red/20 border border-neon-red/50 text-xs font-mono text-neon-red flex items-center space-x-3 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 0: TOURNAMENT SELECTOR */}
          <div className="glass-panel p-6 rounded-xl border border-cyber-border space-y-3">
            <label className="block text-xs font-mono font-bold text-neon-cyan uppercase">
              SELECT TOURNAMENT EVENT *
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-4 py-3 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.game}) — {ev.prize_pool}
                </option>
              ))}
            </select>
            {activeEvent && (
              <div className="text-[11px] font-mono text-gray-400 pt-1 flex justify-between">
                <span>Mode: {activeEvent.mode} &bull; Venue: {activeEvent.venue}</span>
                <span className="text-neon-emerald font-bold">Slots: {activeEvent.filled_slots}/{activeEvent.total_slots}</span>
              </div>
            )}
          </div>

          {/* SECTION 1: PERSONAL INFORMATION */}
          <div className="glass-panel p-6 sm:p-8 rounded-xl border border-cyber-border space-y-6">
            <div className="border-b border-cyber-border pb-3">
              <h2 className="text-base font-black text-white font-mono uppercase flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-neon-emerald"></span>
                <span>1. PERSONAL IDENTIFICATION</span>
              </h2>
              <p className="text-xs text-gray-400 font-sans mt-0.5">
                Legal player details for identity verification and prize distributions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-gray-300">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Deshmukh"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                />
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-gray-300">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                />
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-gray-300">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {/* Mobile Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-gray-300">
                  Mobile Number (WhatsApp Active) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                />
              </div>

              {/* Email */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-mono font-bold text-gray-300">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="player@gmail.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                />
                <span className="text-[11px] font-mono text-gray-400">
                  Your state registration code and match schedule will be delivered to this inbox.
                </span>
              </div>

              {/* State */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-neon-cyan">
                  State (Generates State Code: MH, GJ, MP, etc.) *
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-cyan"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st.code} value={st.name}>
                      {st.name} ({st.code})
                    </option>
                  ))}
                  <option value="Other">Other / International</option>
                </select>
              </div>

              {/* District */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-gray-300">
                  District *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nagpur"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                />
              </div>

              {/* City */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-mono font-bold text-gray-300">
                  City / Town *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nagpur"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: GAMING INFORMATION */}
          <div className="glass-panel p-6 sm:p-8 rounded-xl border border-cyber-border space-y-6">
            <div className="border-b border-cyber-border pb-3">
              <h2 className="text-base font-black text-white font-mono uppercase flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-neon-cyan"></span>
                <span>2. GAMING & ROSTER INFORMATION</span>
              </h2>
              <p className="text-xs text-gray-400 font-sans mt-0.5">
                Exact handle and account UID used to identify and invite your character.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Game */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-gray-300">
                  Selected Game *
                </label>
                <select
                  value={formData.game}
                  onChange={(e) => handleInputChange('game', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                >
                  <option value="BGMI (Battlegrounds Mobile India)">BGMI (Battlegrounds Mobile India)</option>
                  <option value="Free Fire Max">Free Fire Max</option>
                  <option value="Valorant">Valorant</option>
                  <option value="Call of Duty: Mobile">Call of Duty: Mobile</option>
                </select>
              </div>

              {/* In-Game Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-gray-300">
                  In-Game Name (IGN) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TITAN_SNIPER"
                  value={formData.inGameName}
                  onChange={(e) => handleInputChange('inGameName', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                />
              </div>

              {/* Character UID */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-gray-300">
                  Character UID / Player ID (Numbers Only) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  placeholder="e.g. 5129481023 (Digits Only)"
                  value={formData.playerUid}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, '');
                    handleInputChange('playerUid', digitsOnly);
                  }}
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                />
                <span className="text-[10px] font-mono text-neon-cyan block">
                  Only numeric digits (0-9) allowed. E.g. in-game numeric account ID.
                </span>
              </div>

              {/* Team Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-gray-300">
                  Team / Squad Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CYBER TITANS"
                  value={formData.teamName}
                  onChange={(e) => handleInputChange('teamName', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                />
              </div>

              {/* Team Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-gray-300">
                  Tactical Role in Team
                </label>
                <select
                  value={formData.teamRole}
                  onChange={(e) => handleInputChange('teamRole', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                >
                  <option value="IGL (In-Game Leader)">IGL (In-Game Leader)</option>
                  <option value="Assaulter">Assaulter</option>
                  <option value="Sniper">Sniper</option>
                  <option value="Support / Healer">Support / Healer</option>
                  <option value="Substitute">Substitute</option>
                </select>
              </div>

              {/* Gaming Experience */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-mono font-bold text-gray-300">
                  Past Competitive Experience / Achievements
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Tier-2 Scrims finalist, City LAN winner 2025."
                  value={formData.gamingExperience}
                  onChange={(e) => handleInputChange('gamingExperience', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: DOCUMENT & PROOF UPLOADS */}
          <div className="glass-panel p-6 sm:p-8 rounded-xl border border-cyber-border space-y-6">
            <div className="border-b border-cyber-border pb-3">
              <h2 className="text-base font-black text-white font-mono uppercase flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-neon-gold"></span>
                <span>3. DOCUMENT & VERIFICATION PROOFS</span>
              </h2>
              <p className="text-xs text-gray-400 font-sans mt-0.5">
                Private uploads. Strictly accessible only by authorized tournament arbiters.
              </p>
            </div>

            <div className="space-y-4">
              
              {/* ID Proof (Mandatory) */}
              <div className="p-4 rounded-xl bg-cyber-dark/60 border border-cyber-border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-white block">
                      Government ID Proof (Aadhaar / Driving License / College ID)
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">
                      Optional online (can be presented at tournament check-in). PDF, JPG, PNG (Max 5MB)
                    </span>
                  </div>
                  <span title="Private Document">
                    <Lock className="w-4 h-4 text-neon-gold" />
                  </span>
                </div>

                {uploadedFiles['f-doc-id'] ? (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-cyber-black border border-neon-emerald/40 text-xs font-mono">
                    <div className="flex items-center space-x-2.5">
                      {uploadedFiles['f-doc-id'].type.startsWith('image/') ? (
                        <img src={uploadedFiles['f-doc-id'].url} alt="ID preview" className="w-10 h-10 object-cover rounded border border-cyber-border flex-shrink-0" />
                      ) : (
                        <FileCheck className="w-5 h-5 text-neon-emerald flex-shrink-0" />
                      )}
                      <div>
                        <span className="text-white truncate max-w-[180px] sm:max-w-xs block font-bold">{uploadedFiles['f-doc-id'].name}</span>
                        <span className="text-[10px] text-neon-emerald">✓ Uploaded & Ready ({uploadedFiles['f-doc-id'].size})</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile('f-doc-id')}
                      className="text-neon-red hover:text-white p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-cyber-border hover:border-neon-cyan/50 rounded-lg cursor-pointer bg-cyber-black/40 transition">
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs font-mono text-neon-cyan font-semibold">Select or Drop Document</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileUpload('f-doc-id', e)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Profile Photo */}
              <div className="p-4 rounded-xl bg-cyber-dark/60 border border-cyber-border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-white block">
                      Player Profile Photo / Headshot
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">
                      High-resolution portrait photo for stream overlays
                    </span>
                  </div>
                </div>

                {uploadedFiles['f-doc-photo'] ? (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-cyber-black border border-neon-emerald/40 text-xs font-mono">
                    <div className="flex items-center space-x-2.5">
                      {uploadedFiles['f-doc-photo'].type.startsWith('image/') ? (
                        <img src={uploadedFiles['f-doc-photo'].url} alt="Photo preview" className="w-10 h-10 object-cover rounded-full border border-neon-cyan flex-shrink-0" />
                      ) : (
                        <FileCheck className="w-5 h-5 text-neon-emerald flex-shrink-0" />
                      )}
                      <div>
                        <span className="text-white truncate max-w-[180px] sm:max-w-xs block font-bold">{uploadedFiles['f-doc-photo'].name}</span>
                        <span className="text-[10px] text-neon-emerald">✓ Uploaded & Ready ({uploadedFiles['f-doc-photo'].size})</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile('f-doc-photo')}
                      className="text-neon-red hover:text-white p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-cyber-border hover:border-neon-cyan/50 rounded-lg cursor-pointer bg-cyber-black/40 transition">
                    <Upload className="w-5 h-5 text-gray-400 mb-1" />
                    <span className="text-xs font-mono text-neon-cyan font-semibold">Upload Photo (JPG/PNG)</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('f-doc-photo', e)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Payment Screenshot (Optional) */}
              <div className="p-4 rounded-xl bg-cyber-dark/60 border border-cyber-border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-white block">
                      Payment Screenshot (If Entry Fee Applicable)
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">
                      Upload transaction screenshot if event has paid slot entry
                    </span>
                  </div>
                </div>

                {uploadedFiles['f-doc-payment'] ? (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-cyber-black border border-neon-emerald/40 text-xs font-mono">
                    <div className="flex items-center space-x-2.5">
                      {uploadedFiles['f-doc-payment'].type.startsWith('image/') ? (
                        <img src={uploadedFiles['f-doc-payment'].url} alt="Payment preview" className="w-10 h-10 object-cover rounded border border-cyber-border flex-shrink-0" />
                      ) : (
                        <FileCheck className="w-5 h-5 text-neon-emerald flex-shrink-0" />
                      )}
                      <div>
                        <span className="text-white truncate max-w-[180px] sm:max-w-xs block font-bold">{uploadedFiles['f-doc-payment'].name}</span>
                        <span className="text-[10px] text-neon-emerald">✓ Uploaded & Ready ({uploadedFiles['f-doc-payment'].size})</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile('f-doc-payment')}
                      className="text-neon-red hover:text-white p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-cyber-border hover:border-neon-cyan/50 rounded-lg cursor-pointer bg-cyber-black/40 transition">
                    <Upload className="w-5 h-5 text-gray-400 mb-1" />
                    <span className="text-xs font-mono text-neon-cyan font-semibold">Upload Payment Proof</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('f-doc-payment', e)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

            </div>
          </div>

          {/* SUBMISSION ACTION BUTTON */}
          <div className="pt-4 text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-cyber-primary clip-esports-btn w-full py-4 text-sm font-black font-orbitron uppercase tracking-widest flex items-center justify-center space-x-2 shadow-neon-emerald disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>ALLOCATING STATE CODE & VERIFYING...</span>
              ) : (
                <>
                  <Flame className="w-5 h-5 text-cyber-black fill-current animate-pulse" />
                  <span>SUBMIT REGISTRATION & RECEIVE CODE</span>
                </>
              )}
            </button>
            <p className="mt-3 text-[11px] font-mono text-gray-400">
              By clicking submit, you agree to Gamers Guild Fair Play, Anti-Cheat, and Identity Verification Directives.
            </p>
          </div>

        </form>

      </div>
    </div>
  );
}

export default function RegistrationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen cyber-bg flex items-center justify-center text-neon-cyan font-mono text-sm">
        Loading Gamers Guild Registration Portal...
      </div>
    }>
      <RegistrationFormContent />
    </Suspense>
  );
}
