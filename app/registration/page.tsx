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
  Mail,
  Trophy
} from 'lucide-react';
import { INDIAN_STATES, getDistrictsForState } from '@/lib/stateCodes';
import { DEFAULT_FORM_FIELDS } from '@/lib/defaultForm';
import { Event, RegistrationField, SiteSettings } from '@/lib/types';
import { INITIAL_EVENTS } from '@/lib/dataStore';
import PrintableReceipt from '@/components/PrintableReceipt';
import { GamingEmberParticles, HudCornerBrackets } from '@/components/GamingVisualEffects';

function RegistrationFormContent() {
  const searchParams = useSearchParams();
  const preselectedEventId = searchParams.get('event');

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>(preselectedEventId || '');
  const [formFields, setFormFields] = useState<RegistrationField[]>(DEFAULT_FORM_FIELDS);
  const [formTitle, setFormTitle] = useState<string>('OPERATOR & SQUAD REGISTRATION');
  const [formDesc, setFormDesc] = useState<string>('Welcome to the official tactical registration portal for Gamers Guild Esports national tournaments. Enter verified player and in-game credentials. Upon completion, our state code engine will generate your immutable bracket identification (e.g. #MH27).');

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
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState<boolean>(true);

  // Fetch events & form fields & site settings
  useEffect(() => {
    fetch('/api/admin/data')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          const evList = Array.isArray(res.data.events) ? res.data.events : (Array.isArray(res.data) ? res.data : []);
          setEvents(evList);
          if (Array.isArray(res.data.formFields)) setFormFields(res.data.formFields);
          if (res.data.formTitle) setFormTitle(res.data.formTitle);
          if (res.data.formDesc) setFormDesc(res.data.formDesc);
          if (res.data.settings) setSiteSettings(res.data.settings);
        }
      })
      .catch(() => console.log('Loaded default client form structure.'))
      .finally(() => setIsLoadingSettings(false));
  }, []);

  // Update district dropdown when state changes
  useEffect(() => {
    const districts = getDistrictsForState(formData.state);
    if (districts.length > 0 && !districts.includes(formData.district)) {
      setFormData(prev => ({ ...prev, district: districts[0] }));
    }
  }, [formData.state]);

  const activeEvents = events.filter(e => e.is_published && (e.status === 'UPCOMING' || e.status === 'ONGOING'));
  const activeEvent = activeEvents.find(e => e.id === selectedEventId) || activeEvents[0];
  const isRegistrationGloballyClosed = siteSettings?.registration_enabled === false;
  const noEventsAvailable = activeEvents.length === 0;

  useEffect(() => {
    if (activeEvents.length > 0 && !activeEvents.some(e => e.id === selectedEventId)) {
      setSelectedEventId(activeEvents[0].id);
    }
  }, [events, selectedEventId]);

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

  // Dynamic field helpers
  const getField = (id: string) => formFields.find(f => f.id === id);
  const hasField = (id: string) => formFields.some(f => f.id === id);

  const coreIds = [
    'f-name', 'f-dob', 'f-gender', 'f-phone', 'f-email', 'f-state', 'f-district', 'f-city',
    'f-game', 'f-ign', 'f-uid', 'f-team', 'f-role', 'f-exp'
  ];

  const uploadFields = formFields.filter(f => 
    f.field_type === 'IMAGE_UPLOAD' || 
    f.field_type === 'PDF_UPLOAD' || 
    f.field_type === 'FILE_UPLOAD'
  );

  const customFields = formFields.filter(f => 
    !coreIds.includes(f.id) && 
    f.field_type !== 'IMAGE_UPLOAD' && 
    f.field_type !== 'PDF_UPLOAD' && 
    f.field_type !== 'FILE_UPLOAD'
  );

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Dynamic Form Validation based on formFields configuration
    for (const f of formFields) {
      if (f.is_required) {
        if (f.id === 'f-name' && !formData.fullName?.trim()) {
          setErrorMsg(`${f.label} is required.`);
          window.scrollTo({ top: 100, behavior: 'smooth' });
          return;
        }
        if (f.id === 'f-phone' && !formData.phone?.trim()) {
          setErrorMsg(`${f.label} is required.`);
          window.scrollTo({ top: 100, behavior: 'smooth' });
          return;
        }
        if (f.id === 'f-email' && !formData.email?.trim()) {
          setErrorMsg(`${f.label} is required.`);
          window.scrollTo({ top: 100, behavior: 'smooth' });
          return;
        }
        if (f.id === 'f-dob' && !formData.dateOfBirth?.trim()) {
          setErrorMsg(`${f.label} is required.`);
          window.scrollTo({ top: 100, behavior: 'smooth' });
          return;
        }
        if (f.id === 'f-state' && !formData.state?.trim()) {
          setErrorMsg(`${f.label} is required.`);
          window.scrollTo({ top: 100, behavior: 'smooth' });
          return;
        }
        if (f.id === 'f-district' && !formData.district?.trim()) {
          setErrorMsg(`${f.label} is required.`);
          window.scrollTo({ top: 100, behavior: 'smooth' });
          return;
        }
        if (f.id === 'f-city' && !formData.city?.trim()) {
          setErrorMsg(`${f.label} is required.`);
          window.scrollTo({ top: 100, behavior: 'smooth' });
          return;
        }
        if (f.id === 'f-game' && !formData.game?.trim()) {
          setErrorMsg(`${f.label} is required.`);
          window.scrollTo({ top: 100, behavior: 'smooth' });
          return;
        }
        if (f.id === 'f-ign' && !formData.inGameName?.trim()) {
          setErrorMsg(`${f.label} is required.`);
          window.scrollTo({ top: 100, behavior: 'smooth' });
          return;
        }
        if (f.id === 'f-uid' && !formData.playerUid?.trim()) {
          setErrorMsg(`${f.label} is required.`);
          window.scrollTo({ top: 100, behavior: 'smooth' });
          return;
        }
        if (f.id === 'f-team' && !formData.teamName?.trim()) {
          setErrorMsg(`${f.label} is required.`);
          window.scrollTo({ top: 100, behavior: 'smooth' });
          return;
        }
        if (uploadFields.some(uf => uf.id === f.id)) {
          if (!uploadedFiles[f.id]) {
            setErrorMsg(`${f.label} is required. Please upload the requested file.`);
            window.scrollTo({ top: 250, behavior: 'smooth' });
            return;
          }
        }
        if (customFields.some(cf => cf.id === f.id)) {
          const val = customAnswers[f.id];
          if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
            setErrorMsg(`${f.label} is required.`);
            window.scrollTo({ top: 250, behavior: 'smooth' });
            return;
          }
        }
      }
    }

    if (!formData.fullName || !formData.phone || !formData.email || !formData.inGameName || !formData.playerUid) {
      setErrorMsg('Please complete all mandatory identity fields (Name, Phone, Email, IGN, Player UID).');
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

  // LOADING SCREEN WHILE RESOLVING BRACKET DATA
  if (isLoadingSettings) {
    return (
      <div className="min-h-screen gaming-arena-bg py-20 flex items-center justify-center font-rajdhani">
        <GamingEmberParticles />
        <div className="glass-hud p-8 rounded-2xl border border-neon-cyan/40 text-center max-w-sm mx-auto">
          <div className="w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-white font-orbitron font-bold text-sm tracking-wider uppercase">INITIALIZING BRACKET DATA...</div>
        </div>
      </div>
    );
  }

  // REGISTRATION CLOSED OR NO EVENTS VIEW (GAMING ALERT SCREEN)
  if (isRegistrationGloballyClosed || noEventsAvailable) {
    return (
      <div className="min-h-screen gaming-arena-bg py-16 sm:py-24 relative overflow-hidden font-rajdhani flex items-center justify-center">
        <GamingEmberParticles />
        <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="glass-hud rounded-2xl border-2 border-neon-red/60 p-8 sm:p-12 shadow-2xl shadow-neon-red/20 relative overflow-hidden backdrop-blur-xl">
            <HudCornerBrackets color="red" />

            {/* Glowing Lock Icon */}
            <div className="w-20 h-20 mx-auto rounded-2xl bg-neon-red/10 border-2 border-neon-red/50 flex items-center justify-center mb-6 shadow-lg shadow-neon-red/30">
              <Lock className="w-10 h-10 text-neon-red animate-pulse" />
            </div>

            {/* Status Pill */}
            <div className="inline-block px-3 py-1 rounded bg-neon-red/20 border border-neon-red text-neon-red font-orbitron font-bold text-xs tracking-widest uppercase mb-4">
              SYSTEM TRANSMISSION • STATUS LOCKED
            </div>

            <h1 className="text-3xl sm:text-4xl font-orbitron font-black text-white uppercase tracking-wider mb-4">
              {noEventsAvailable && !isRegistrationGloballyClosed 
                ? "NO EVENT IS GOING ON" 
                : "REGISTRATIONS CURRENTLY CLOSED"}
            </h1>

            <p className="text-gray-300 font-rajdhani text-lg sm:text-xl font-medium leading-relaxed max-w-lg mx-auto mb-8">
              {siteSettings?.registration_closed_message || (
                noEventsAvailable 
                  ? "There are currently no active esports tournaments accepting registrations at this moment. Our arbiters are preparing upcoming high-stakes championships!" 
                  : "Tournament registrations have been temporarily closed by administration. Please check back shortly or stay connected for the next bracket drop."
              )}
            </p>

            {/* Tactical Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left font-mono text-xs">
              <div className="p-4 rounded-xl bg-cyber-black/70 border border-cyber-border">
                <span className="text-gray-400 block mb-1">BRACKET INTEL</span>
                <span className="text-neon-cyan font-bold block text-sm">UPCOMING TOURNAMENTS</span>
                <span className="text-gray-400 text-[11px] mt-1 block">New state championship circuits are announced regularly on our schedule.</span>
              </div>
              <div className="p-4 rounded-xl bg-cyber-black/70 border border-cyber-border">
                <span className="text-gray-400 block mb-1">EXISTING ROSTER</span>
                <span className="text-neon-gold font-bold block text-sm">FIND REGISTRATION</span>
                <span className="text-gray-400 text-[11px] mt-1 block">Already submitted an entry? Check your squad status with your mobile number.</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/upcoming-events"
                className="btn-cyber-primary px-6 py-3 rounded-lg text-xs font-black font-mono uppercase flex items-center justify-center space-x-2"
              >
                <Trophy className="w-4 h-4 text-cyber-black" />
                <span>VIEW EVENT SCHEDULE</span>
              </Link>
              <Link
                href="/find-registration"
                className="btn-cyber-secondary px-6 py-3 rounded-lg text-xs font-bold font-mono uppercase flex items-center justify-center space-x-2"
              >
                <UserCheck className="w-4 h-4 text-neon-cyan" />
                <span>FIND MY REGISTRATION</span>
              </Link>
              <Link
                href="/"
                className="px-5 py-3 rounded-lg text-xs font-bold font-mono uppercase text-gray-400 hover:text-white bg-cyber-dark border border-cyber-border flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>ARENA HOME</span>
              </Link>
            </div>
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
                  {formTitle || 'OPERATOR & SQUAD REGISTRATION'}
                </h1>
              </div>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 rounded bg-neon-emerald/10 text-neon-emerald border border-neon-emerald/40 text-xs font-orbitron font-bold">
              CIRCUIT 2026
            </span>
          </div>

          <p className="mt-4 text-xs sm:text-sm text-gray-300 font-rajdhani font-semibold leading-relaxed">
            {formDesc || 'Welcome to the official tactical registration portal for Gamers Guild Esports national tournaments. Enter verified player and in-game credentials. Upon completion, our state code engine will generate your immutable bracket identification (e.g. #MH27).'}
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
              {activeEvents.map((ev) => (
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
          {(hasField('f-name') || hasField('f-dob') || hasField('f-gender') || hasField('f-phone') || hasField('f-email') || hasField('f-state') || hasField('f-district') || hasField('f-city')) && (
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
                {hasField('f-name') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-gray-300">
                      {getField('f-name')?.label || 'Full Legal Name'} {getField('f-name')?.is_required && <span className="text-neon-red">*</span>}
                    </label>
                    <input
                      type="text"
                      required={getField('f-name')?.is_required}
                      placeholder={getField('f-name')?.placeholder || 'e.g. Rahul Deshmukh'}
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                    />
                    {getField('f-name')?.description && (
                      <span className="text-[10px] font-mono text-gray-400 block">{getField('f-name')?.description}</span>
                    )}
                  </div>
                )}

                {/* Date of Birth */}
                {hasField('f-dob') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-gray-300">
                      {getField('f-dob')?.label || 'Date of Birth'} {getField('f-dob')?.is_required && <span className="text-neon-red">*</span>}
                    </label>
                    <input
                      type="date"
                      required={getField('f-dob')?.is_required}
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                    />
                    {getField('f-dob')?.description && (
                      <span className="text-[10px] font-mono text-gray-400 block">{getField('f-dob')?.description}</span>
                    )}
                  </div>
                )}

                {/* Gender */}
                {hasField('f-gender') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-gray-300">
                      {getField('f-gender')?.label || 'Gender'} {getField('f-gender')?.is_required && <span className="text-neon-red">*</span>}
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                    >
                      {(getField('f-gender')?.options && getField('f-gender')!.options!.length > 0
                        ? getField('f-gender')!.options!
                        : ['Male', 'Female', 'Non-Binary', 'Prefer not to say']
                      ).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Mobile Phone */}
                {hasField('f-phone') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-gray-300">
                      {getField('f-phone')?.label || 'Mobile Number (WhatsApp Active)'} {getField('f-phone')?.is_required && <span className="text-neon-red">*</span>}
                    </label>
                    <input
                      type="tel"
                      required={getField('f-phone')?.is_required}
                      placeholder={getField('f-phone')?.placeholder || '+91 98765 43210'}
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                    />
                    {getField('f-phone')?.description && (
                      <span className="text-[10px] font-mono text-gray-400 block">{getField('f-phone')?.description}</span>
                    )}
                  </div>
                )}

                {/* Email */}
                {hasField('f-email') && (
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-mono font-bold text-gray-300">
                      {getField('f-email')?.label || 'Email Address'} {getField('f-email')?.is_required && <span className="text-neon-red">*</span>}
                    </label>
                    <input
                      type="email"
                      required={getField('f-email')?.is_required}
                      placeholder={getField('f-email')?.placeholder || 'player@gmail.com'}
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                    />
                    <span className="text-[11px] font-mono text-gray-400">
                      {getField('f-email')?.description || 'Your state registration code and match schedule will be delivered to this inbox.'}
                    </span>
                  </div>
                )}

                {/* State */}
                {hasField('f-state') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-neon-cyan">
                      {getField('f-state')?.label || 'State (Generates State Code: MH, GJ, MP, etc.)'} {getField('f-state')?.is_required && <span className="text-neon-red">*</span>}
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
                )}

                {/* District */}
                {hasField('f-district') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-gray-300">
                      {getField('f-district')?.label || 'District'} {getField('f-district')?.is_required && <span className="text-neon-red">*</span>}
                    </label>
                    <input
                      type="text"
                      required={getField('f-district')?.is_required}
                      placeholder={getField('f-district')?.placeholder || 'e.g. Nagpur'}
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                    />
                  </div>
                )}

                {/* City */}
                {hasField('f-city') && (
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-mono font-bold text-gray-300">
                      {getField('f-city')?.label || 'City / Town'} {getField('f-city')?.is_required && <span className="text-neon-red">*</span>}
                    </label>
                    <input
                      type="text"
                      required={getField('f-city')?.is_required}
                      placeholder={getField('f-city')?.placeholder || 'e.g. Nagpur'}
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 2: GAMING INFORMATION */}
          {(hasField('f-game') || hasField('f-ign') || hasField('f-uid') || hasField('f-team') || hasField('f-role') || hasField('f-exp')) && (
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
                {hasField('f-game') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-gray-300">
                      {getField('f-game')?.label || 'Selected Game'} {getField('f-game')?.is_required && <span className="text-neon-red">*</span>}
                    </label>
                    <select
                      value={formData.game}
                      onChange={(e) => handleInputChange('game', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                    >
                      {(getField('f-game')?.options && getField('f-game')!.options!.length > 0
                        ? getField('f-game')!.options!
                        : ['BGMI (Battlegrounds Mobile India)', 'Free Fire Max', 'Valorant', 'Call of Duty: Mobile']
                      ).map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* In-Game Name */}
                {hasField('f-ign') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-gray-300">
                      {getField('f-ign')?.label || 'In-Game Name (IGN)'} {getField('f-ign')?.is_required && <span className="text-neon-red">*</span>}
                    </label>
                    <input
                      type="text"
                      required={getField('f-ign')?.is_required}
                      placeholder={getField('f-ign')?.placeholder || 'e.g. TITAN_SNIPER'}
                      value={formData.inGameName}
                      onChange={(e) => handleInputChange('inGameName', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                    />
                  </div>
                )}

                {/* Character UID */}
                {hasField('f-uid') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-gray-300">
                      {getField('f-uid')?.label || 'Character UID / Player ID (Numbers Only)'} {getField('f-uid')?.is_required && <span className="text-neon-red">*</span>}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required={getField('f-uid')?.is_required}
                      placeholder={getField('f-uid')?.placeholder || 'e.g. 5129481023 (Digits Only)'}
                      value={formData.playerUid}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, '');
                        handleInputChange('playerUid', digitsOnly);
                      }}
                      className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                    />
                    <span className="text-[10px] font-mono text-neon-cyan block">
                      {getField('f-uid')?.description || 'Only numeric digits (0-9) allowed. E.g. in-game numeric account ID.'}
                    </span>
                  </div>
                )}

                {/* Team Name */}
                {hasField('f-team') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-gray-300">
                      {getField('f-team')?.label || 'Team / Squad Name'} {getField('f-team')?.is_required && <span className="text-neon-red">*</span>}
                    </label>
                    <input
                      type="text"
                      required={getField('f-team')?.is_required}
                      placeholder={getField('f-team')?.placeholder || 'e.g. CYBER TITANS'}
                      value={formData.teamName}
                      onChange={(e) => handleInputChange('teamName', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                    />
                  </div>
                )}

                {/* Team Role */}
                {hasField('f-role') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-gray-300">
                      {getField('f-role')?.label || 'Tactical Role in Team'} {getField('f-role')?.is_required && <span className="text-neon-red">*</span>}
                    </label>
                    <select
                      value={formData.teamRole}
                      onChange={(e) => handleInputChange('teamRole', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                    >
                      {(getField('f-role')?.options && getField('f-role')!.options!.length > 0
                        ? getField('f-role')!.options!
                        : ['IGL (In-Game Leader)', 'Assaulter', 'Sniper', 'Support / Healer', 'Substitute']
                      ).map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Gaming Experience */}
                {hasField('f-exp') && (
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-mono font-bold text-gray-300">
                      {getField('f-exp')?.label || 'Past Competitive Experience / Achievements'} {getField('f-exp')?.is_required && <span className="text-neon-red">*</span>}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={getField('f-exp')?.placeholder || 'e.g. Tier-2 Scrims finalist, City LAN winner 2025.'}
                      value={formData.gamingExperience}
                      onChange={(e) => handleInputChange('gamingExperience', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 3: DOCUMENT & PROOF UPLOADS (DYNAMIC) */}
          {uploadFields.length > 0 && (
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
                {uploadFields.map((field) => (
                  <div key={field.id} className="p-4 rounded-xl bg-cyber-dark/60 border border-cyber-border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-mono font-bold text-white block">
                          {field.label} {field.is_required && <span className="text-neon-red">*</span>}
                        </span>
                        <span className="text-[11px] font-mono text-gray-400">
                          {field.description || (field.field_type === 'IMAGE_UPLOAD' ? 'Image upload (JPG, PNG, WEBP max 10MB)' : 'Document upload (PDF, JPG, PNG max 10MB)')}
                        </span>
                      </div>
                      <span title="Private Document">
                        <Lock className="w-4 h-4 text-neon-gold" />
                      </span>
                    </div>

                    {uploadedFiles[field.id] ? (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-cyber-black border border-neon-emerald/40 text-xs font-mono">
                        <div className="flex items-center space-x-2.5">
                          {uploadedFiles[field.id].type.startsWith('image/') ? (
                            <img src={uploadedFiles[field.id].url} alt="Uploaded preview" className="w-10 h-10 object-cover rounded border border-cyber-border flex-shrink-0" />
                          ) : (
                            <FileCheck className="w-5 h-5 text-neon-emerald flex-shrink-0" />
                          )}
                          <div>
                            <span className="text-white truncate max-w-[180px] sm:max-w-xs block font-bold">{uploadedFiles[field.id].name}</span>
                            <span className="text-[10px] text-neon-emerald">✓ Uploaded & Ready ({uploadedFiles[field.id].size})</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(field.id)}
                          className="text-neon-red hover:text-white p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-cyber-border hover:border-neon-cyan/50 rounded-lg cursor-pointer bg-cyber-black/40 transition">
                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-xs font-mono text-neon-cyan font-semibold">Select or Drop File</span>
                        <input
                          type="file"
                          accept={field.field_type === 'IMAGE_UPLOAD' ? '.jpg,.jpeg,.png,.webp' : '.jpg,.jpeg,.png,.webp,.pdf'}
                          onChange={(e) => handleFileUpload(field.id, e)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: ADDITIONAL TOURNAMENT QUESTIONS (DYNAMIC) */}
          {customFields.length > 0 && (
            <div className="glass-panel p-6 sm:p-8 rounded-xl border border-cyber-border space-y-6">
              <div className="border-b border-cyber-border pb-3">
                <h2 className="text-base font-black text-white font-mono uppercase flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  <span>4. ADDITIONAL TOURNAMENT QUESTIONS</span>
                </h2>
                <p className="text-xs text-gray-400 font-sans mt-0.5">
                  Custom questions and qualifications configured for this tournament circuit.
                </p>
              </div>

              <div className="space-y-4">
                {customFields.map((cf) => (
                  <div key={cf.id} className="p-4 rounded-xl bg-cyber-dark/60 border border-cyber-border space-y-2">
                    <label className="text-xs font-mono font-bold text-gray-200 block">
                      {cf.label} {cf.is_required && <span className="text-neon-red">*</span>}
                    </label>
                    {cf.description && (
                      <p className="text-[11px] text-gray-400 font-mono">{cf.description}</p>
                    )}

                    {cf.field_type === 'SHORT_TEXT' && (
                      <input
                        type="text"
                        required={cf.is_required}
                        placeholder={cf.placeholder || 'Enter your response'}
                        value={customAnswers[cf.id] || ''}
                        onChange={(e) => handleCustomAnswerChange(cf.id, e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                      />
                    )}

                    {cf.field_type === 'LONG_TEXT' && (
                      <textarea
                        rows={3}
                        required={cf.is_required}
                        placeholder={cf.placeholder || 'Enter your detailed response...'}
                        value={customAnswers[cf.id] || ''}
                        onChange={(e) => handleCustomAnswerChange(cf.id, e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                      />
                    )}

                    {cf.field_type === 'NUMBER' && (
                      <input
                        type="number"
                        required={cf.is_required}
                        placeholder={cf.placeholder || '0'}
                        value={customAnswers[cf.id] || ''}
                        onChange={(e) => handleCustomAnswerChange(cf.id, e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                      />
                    )}

                    {cf.field_type === 'EMAIL' && (
                      <input
                        type="email"
                        required={cf.is_required}
                        placeholder={cf.placeholder || 'email@example.com'}
                        value={customAnswers[cf.id] || ''}
                        onChange={(e) => handleCustomAnswerChange(cf.id, e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                      />
                    )}

                    {cf.field_type === 'PHONE' && (
                      <input
                        type="tel"
                        required={cf.is_required}
                        placeholder={cf.placeholder || '+91 98765 43210'}
                        value={customAnswers[cf.id] || ''}
                        onChange={(e) => handleCustomAnswerChange(cf.id, e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                      />
                    )}

                    {cf.field_type === 'DATE' && (
                      <input
                        type="date"
                        required={cf.is_required}
                        value={customAnswers[cf.id] || ''}
                        onChange={(e) => handleCustomAnswerChange(cf.id, e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                      />
                    )}

                    {cf.field_type === 'DROPDOWN' && (
                      <select
                        required={cf.is_required}
                        value={customAnswers[cf.id] || ''}
                        onChange={(e) => handleCustomAnswerChange(cf.id, e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                      >
                        <option value="">{cf.placeholder || '-- Select an option --'}</option>
                        {cf.options?.map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}

                    {cf.field_type === 'MULTIPLE_CHOICE' && (
                      <div className="space-y-2 pt-1">
                        {cf.options?.map((opt, i) => (
                          <label key={i} className="flex items-center space-x-2 text-xs font-mono text-gray-300 cursor-pointer">
                            <input
                              type="radio"
                              name={cf.id}
                              value={opt}
                              checked={customAnswers[cf.id] === opt}
                              onChange={(e) => handleCustomAnswerChange(cf.id, e.target.value)}
                              className="accent-neon-emerald"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {cf.field_type === 'CHECKBOX' && (
                      <div className="space-y-2 pt-1">
                        {cf.options && cf.options.length > 0 ? (
                          cf.options.map((opt, i) => {
                            const currentList: string[] = Array.isArray(customAnswers[cf.id]) ? customAnswers[cf.id] : [];
                            const checked = currentList.includes(opt);
                            return (
                              <label key={i} className="flex items-center space-x-2 text-xs font-mono text-gray-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => {
                                    const updated = e.target.checked
                                      ? [...currentList, opt]
                                      : currentList.filter(x => x !== opt);
                                    handleCustomAnswerChange(cf.id, updated);
                                  }}
                                  className="accent-neon-emerald"
                                />
                                <span>{opt}</span>
                              </label>
                            );
                          })
                        ) : (
                          <label className="flex items-center space-x-2 text-xs font-mono text-gray-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(customAnswers[cf.id])}
                              onChange={(e) => handleCustomAnswerChange(cf.id, e.target.checked)}
                              className="accent-neon-emerald"
                            />
                            <span>{cf.placeholder || 'I confirm and agree to this condition'}</span>
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
