'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
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
  Trophy,
  Loader2,
  Info
} from 'lucide-react';
import { INDIAN_STATES, getDistrictsForState } from '@/lib/stateCodes';
import { DEFAULT_FORM_FIELDS } from '@/lib/defaultForm';
import { Event, RegistrationField, SiteSettings } from '@/lib/types';
import PrintableReceipt from '@/components/PrintableReceipt';
import { GamingEmberParticles, HudCornerBrackets } from '@/components/GamingVisualEffects';

function RegistrationFormContent() {
  const searchParams = useSearchParams();
  const preselectedEventId = searchParams.get('event');

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>(preselectedEventId || '');
  const [formFields, setFormFields] = useState<RegistrationField[]>(DEFAULT_FORM_FIELDS);
  const [formTitle, setFormTitle] = useState<string>('NATIONAL ESPORTS CHAMPIONSHIP');
  const [formDesc, setFormDesc] = useState<string>('Fill out legal player details, game identifiers, and required verification proofs to enter the competitive bracket.');

  // Unified Form State for all fields
  const [formValues, setFormValues] = useState<Record<string, any>>({
    'f-state': 'Maharashtra',
    'f-district': 'Nagpur',
    'f-city': 'Nagpur',
    'f-game': 'BGMI (Battlegrounds Mobile India)'
  });

  // File uploads state
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { name: string; url: string; size: string; type: string }>>({});

  // UI Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<any | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch published form fields, title, description, and events directly from server
  useEffect(() => {
    // 1. Direct dedicated form-fields fetch with cache-busting (instantly reflects admin edits)
    fetch(`/api/admin/data?type=form-fields&_t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          if (Array.isArray(res.data) && res.data.length > 0) {
            setFormFields(res.data);
          }
          if (res.formTitle) setFormTitle(res.formTitle);
          if (res.formDesc) setFormDesc(res.formDesc);
        }
      })
      .catch(() => console.log('Loaded direct form fields.'));

    // 2. Events & site settings bundle
    fetch(`/api/admin/data?_t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          const evList = Array.isArray(res.data.events) ? res.data.events : (Array.isArray(res.data) ? res.data : []);
          setEvents(evList);
          if (res.data.settings) setSiteSettings(res.data.settings);
          if (Array.isArray(res.data.formFields) && res.data.formFields.length > 0) {
            setFormFields(res.data.formFields);
          }
          if (res.data.formTitle) setFormTitle(res.data.formTitle);
          if (res.data.formDesc) setFormDesc(res.data.formDesc);
        }
      })
      .catch(() => console.log('Loaded client bundle.'))
      .finally(() => setIsLoading(false));
  }, []);

  // Sort fields strictly according to sort_order as configured by admin in Form Builder
  const sortedFields = useMemo(() => {
    return [...formFields].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [formFields]);

  // Active tournaments
  const activeEvents = events.filter(e => e.is_published && (e.status === 'UPCOMING' || e.status === 'ONGOING'));
  const activeEvent = activeEvents.find(e => e.id === selectedEventId) || activeEvents[0];
  const isRegistrationGloballyClosed = siteSettings?.registration_enabled === false;
  const noEventsAvailable = activeEvents.length === 0;

  useEffect(() => {
    if (activeEvents.length > 0 && !activeEvents.some(e => e.id === selectedEventId)) {
      setSelectedEventId(activeEvents[0].id);
    }
  }, [events, selectedEventId, activeEvents]);

  // Handle value change for any field
  const handleValueChange = (fieldId: string, value: any) => {
    setFormValues(prev => {
      const next = { ...prev, [fieldId]: value };
      if (fieldId === 'f-state') {
        const districts = getDistrictsForState(value);
        if (districts.length > 0 && !districts.includes(next['f-district'])) {
          next['f-district'] = districts[0];
        }
      }
      return next;
    });
  };

  // Get available district suggestions for selected state
  const currentState = formValues['f-state'] || 'Maharashtra';
  const availableDistricts = useMemo(() => getDistrictsForState(currentState), [currentState]);

  // File upload handler with validation and canvas Base64 compression
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

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Dynamic validation of all required fields in the active form
    for (const f of sortedFields) {
      if (f.is_required) {
        if (['IMAGE_UPLOAD', 'PDF_UPLOAD', 'FILE_UPLOAD'].includes(f.field_type)) {
          if (!uploadedFiles[f.id]) {
            setErrorMsg(`"${f.label}" is required. Please upload the requested verification file.`);
            window.scrollTo({ top: 150, behavior: 'smooth' });
            return;
          }
        } else {
          const val = formValues[f.id];
          if (val === undefined || val === null || (typeof val === 'string' && !val.trim()) || (Array.isArray(val) && val.length === 0)) {
            setErrorMsg(`"${f.label}" is required. Please complete this field.`);
            window.scrollTo({ top: 150, behavior: 'smooth' });
            return;
          }
        }
      }
    }

    // Extract core identity details for tournament allocation
    const playerName = formValues['f-name'] || formValues['f-fullname'] || formValues[sortedFields.find(f => /name/i.test(f.label))?.id || ''] || '';
    const email = formValues['f-email'] || formValues[sortedFields.find(f => f.field_type === 'EMAIL' || /email/i.test(f.label))?.id || ''] || '';
    const phone = formValues['f-phone'] || formValues[sortedFields.find(f => f.field_type === 'PHONE' || /phone|mobile/i.test(f.label))?.id || ''] || '';
    const inGameName = formValues['f-ign'] || formValues[sortedFields.find(f => /in-game|ign/i.test(f.label))?.id || ''] || playerName;
    const playerUid = formValues['f-uid'] || formValues[sortedFields.find(f => /uid|player id/i.test(f.label))?.id || ''] || String(Date.now()).slice(-8);

    if (!playerName || !email || !phone || !inGameName || !playerUid) {
      setErrorMsg('Please ensure all essential operator identity fields (Full Name, Email, Phone, IGN, and Player UID) are filled.');
      window.scrollTo({ top: 150, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Collect all custom responses and qualifications for arbiter review
      const answers: Record<string, any> = {};
      sortedFields.forEach(f => {
        if (!['IMAGE_UPLOAD', 'PDF_UPLOAD', 'FILE_UPLOAD'].includes(f.field_type)) {
          if (formValues[f.id] !== undefined && formValues[f.id] !== '') {
            answers[f.label] = formValues[f.id];
          }
        }
      });

      const files = Object.entries(uploadedFiles).map(([k, v]) => {
        const f = sortedFields.find(sf => sf.id === k);
        return {
          fieldId: k,
          fieldName: f?.label || k,
          fileName: v.name,
          fileUrl: v.url,
          mimeType: v.type
        };
      });

      const payload = {
        eventId: selectedEventId,
        playerName,
        email,
        phone,
        dateOfBirth: String(formValues['f-dob'] || formValues[sortedFields.find(f => /birth|dob/i.test(f.label))?.id || ''] || ''),
        gender: formValues['f-gender'] || formValues[sortedFields.find(f => /gender/i.test(f.label))?.id || ''] || 'Male',
        state: formValues['f-state'] || 'Maharashtra',
        district: formValues['f-district'] || 'General',
        city: formValues['f-city'] || 'General',
        game: formValues['f-game'] || activeEvent?.game || 'BGMI (Battlegrounds Mobile India)',
        inGameName,
        playerUid,
        teamName: formValues['f-team'] || formValues[sortedFields.find(f => /team/i.test(f.label))?.id || ''] || `${playerName}'s Squad`,
        teamRole: formValues['f-role'] || 'Player',
        gamingExperience: formValues['f-exp'] || '',
        answers,
        files
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
        playerName,
        inGameName,
        playerUid,
        teamName: payload.teamName,
        game: payload.game,
        eventName: activeEvent?.title || 'Gamers Guild Championship',
        state: payload.state,
        district: payload.district,
        phone,
        email,
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

          <div className="mt-8 text-center space-y-4 screen-only">
            <button
              onClick={() => {
                setSubmissionSuccess(null);
                setFormValues({
                  'f-state': 'Maharashtra',
                  'f-district': 'Nagpur',
                  'f-city': 'Nagpur',
                  'f-game': 'BGMI (Battlegrounds Mobile India)'
                });
                setUploadedFiles({});
              }}
              className="text-xs font-mono text-neon-cyan hover:underline inline-block"
            >
              &larr; Submit Another Registration
            </button>
            <div>
              <Link
                href="/"
                className="btn-cyber-secondary inline-flex items-center space-x-2 px-6 py-3 rounded-lg text-xs font-bold font-mono uppercase"
              >
                <ArrowLeft className="w-4 h-4 text-neon-cyan" />
                <span>RETURN TO TOURNAMENT ARENA</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // REGISTRATIONS CURRENTLY CLOSED / LOCKED VIEW
  if (isRegistrationGloballyClosed || noEventsAvailable) {
    return (
      <div className="min-h-screen cyber-bg py-16 sm:py-24 flex items-center justify-center relative overflow-hidden font-rajdhani">
        <GamingEmberParticles />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          
          <div className="glass-hud rounded-2xl border border-neon-red/50 p-8 sm:p-12 shadow-2xl relative">
            <HudCornerBrackets color="red" />
            
            <div className="w-20 h-20 rounded-full bg-neon-red/10 border-2 border-neon-red flex items-center justify-center mx-auto mb-6 shadow-neon-glow">
              <Lock className="w-10 h-10 text-neon-red" />
            </div>

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

  // DYNAMIC FORM VIEW: STRICTLY RENDERS ADMIN'S FIELDS IN EXACT SORT ORDER
  return (
    <div className="min-h-screen gaming-arena-bg py-12 sm:py-16 relative overflow-hidden font-rajdhani">
      <GamingEmberParticles />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Dynamic Form Header Banner */}
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
                <h1 className="text-xl sm:text-2xl font-black text-white font-orbitron uppercase tracking-wide">
                  {formTitle || 'NATIONAL ESPORTS CHAMPIONSHIP'}
                </h1>
              </div>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 rounded bg-neon-emerald/10 text-neon-emerald border border-neon-emerald/40 text-xs font-orbitron font-bold">
              CIRCUIT 2026
            </span>
          </div>

          <p className="mt-4 text-xs sm:text-sm text-gray-300 font-rajdhani font-semibold leading-relaxed">
            {formDesc || 'Fill out legal player details, game identifiers, and required verification proofs to enter the competitive bracket.'}
          </p>

          <div className="mt-4 pt-3 border-t border-cyber-border flex items-center text-xs font-mono text-neon-red space-x-1">
            <span>* Mandatory tournament questions required for bracket validation</span>
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
          
          {/* TOURNAMENT EVENT SELECTOR CARD */}
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

          {/* DYNAMIC FORM QUESTIONS: RENDERED SEQUENTIALLY IN EXACT ADMIN ORDER */}
          <div className="space-y-4">
            {sortedFields.map((field, index) => {
              const isUpload = ['IMAGE_UPLOAD', 'PDF_UPLOAD', 'FILE_UPLOAD'].includes(field.field_type);

              return (
                <div 
                  key={field.id}
                  className="glass-panel p-5 sm:p-6 rounded-xl border border-cyber-border hover:border-cyber-border/80 transition-all space-y-2.5"
                >
                  {/* Field Header / Question Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-cyber-dark text-[10px] font-mono font-bold text-neon-emerald border border-neon-emerald/30">
                          #{index + 1}
                        </span>
                        <label className="text-xs font-mono font-bold text-gray-200">
                          {field.label} {field.is_required && <span className="text-neon-red font-bold">*</span>}
                        </label>
                      </div>
                      {field.description && (
                        <p className="text-[11px] text-gray-400 font-mono mt-1 pl-7">
                          {field.description}
                        </p>
                      )}
                    </div>

                    {isUpload && (
                      <span title="Private Arbiter Document" className="text-neon-gold mt-0.5">
                        <Lock className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  {/* Field Input Elements by Type */}
                  <div className="pt-1">
                    
                    {/* 1. SHORT_TEXT */}
                    {field.field_type === 'SHORT_TEXT' && (
                      <>
                        <input
                          type="text"
                          required={field.is_required}
                          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                          value={formValues[field.id] || ''}
                          onChange={(e) => {
                            if (field.id === 'f-uid') {
                              // If UID, enforce numeric digits
                              handleValueChange(field.id, e.target.value.replace(/\D/g, ''));
                            } else {
                              handleValueChange(field.id, e.target.value);
                            }
                          }}
                          className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                          {...(field.id === 'f-district' ? { list: `districts-${field.id}` } : {})}
                        />
                        {field.id === 'f-district' && (
                          <datalist id={`districts-${field.id}`}>
                            {availableDistricts.map(d => <option key={d} value={d} />)}
                          </datalist>
                        )}
                      </>
                    )}

                    {/* 2. LONG_TEXT */}
                    {field.field_type === 'LONG_TEXT' && (
                      <textarea
                        rows={3}
                        required={field.is_required}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                        value={formValues[field.id] || ''}
                        onChange={(e) => handleValueChange(field.id, e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                      />
                    )}

                    {/* 3. NUMBER */}
                    {field.field_type === 'NUMBER' && (
                      <input
                        type="number"
                        inputMode="numeric"
                        required={field.is_required}
                        placeholder={field.placeholder || 'Enter numeric value...'}
                        value={formValues[field.id] || ''}
                        onChange={(e) => handleValueChange(field.id, e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                      />
                    )}

                    {/* 4. EMAIL */}
                    {field.field_type === 'EMAIL' && (
                      <input
                        type="email"
                        required={field.is_required}
                        placeholder={field.placeholder || 'player@gmail.com'}
                        value={formValues[field.id] || ''}
                        onChange={(e) => handleValueChange(field.id, e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                      />
                    )}

                    {/* 5. PHONE */}
                    {field.field_type === 'PHONE' && (
                      <input
                        type="tel"
                        required={field.is_required}
                        placeholder={field.placeholder || '+91 98765 43210'}
                        value={formValues[field.id] || ''}
                        onChange={(e) => handleValueChange(field.id, e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                      />
                    )}

                    {/* 6. DATE */}
                    {field.field_type === 'DATE' && (
                      <input
                        type="date"
                        required={field.is_required}
                        value={formValues[field.id] || ''}
                        onChange={(e) => handleValueChange(field.id, e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                      />
                    )}

                    {/* 7. DROPDOWN */}
                    {field.field_type === 'DROPDOWN' && (
                      <select
                        required={field.is_required}
                        value={formValues[field.id] || ''}
                        onChange={(e) => handleValueChange(field.id, e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                      >
                        <option value="">{field.placeholder || `-- Select ${field.label} --`}</option>
                        
                        {/* State Dropdown with Indian State Codes */}
                        {field.id === 'f-state' ? (
                          <>
                            {INDIAN_STATES.map((st) => (
                              <option key={st.code} value={st.name}>
                                {st.name} ({st.code})
                              </option>
                            ))}
                            <option value="Other">Other / International</option>
                          </>
                        ) : field.id === 'f-game' && (!field.options || field.options.length === 0) ? (
                          <>
                            <option value="BGMI (Battlegrounds Mobile India)">BGMI (Battlegrounds Mobile India)</option>
                            <option value="Free Fire Max">Free Fire Max</option>
                            <option value="Valorant">Valorant</option>
                            <option value="Call of Duty: Mobile">Call of Duty: Mobile</option>
                          </>
                        ) : (
                          field.options?.map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))
                        )}
                      </select>
                    )}

                    {/* 8. MULTIPLE_CHOICE */}
                    {field.field_type === 'MULTIPLE_CHOICE' && (
                      <div className="space-y-2 pt-1">
                        {field.options?.map((opt, i) => (
                          <label key={i} className="flex items-center space-x-2 text-xs font-mono text-gray-300 cursor-pointer hover:text-white">
                            <input
                              type="radio"
                              name={field.id}
                              value={opt}
                              checked={formValues[field.id] === opt}
                              onChange={(e) => handleValueChange(field.id, e.target.value)}
                              className="accent-neon-emerald"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* 9. CHECKBOX */}
                    {field.field_type === 'CHECKBOX' && (
                      <div className="space-y-2 pt-1">
                        {field.options && field.options.length > 0 ? (
                          field.options.map((opt, i) => {
                            const list: string[] = Array.isArray(formValues[field.id]) ? formValues[field.id] : [];
                            const checked = list.includes(opt);
                            return (
                              <label key={i} className="flex items-center space-x-2 text-xs font-mono text-gray-300 cursor-pointer hover:text-white">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => {
                                    const updated = e.target.checked
                                      ? [...list, opt]
                                      : list.filter(x => x !== opt);
                                    handleValueChange(field.id, updated);
                                  }}
                                  className="accent-neon-emerald"
                                />
                                <span>{opt}</span>
                              </label>
                            );
                          })
                        ) : (
                          <label className="flex items-center space-x-2 text-xs font-mono text-gray-300 cursor-pointer hover:text-white">
                            <input
                              type="checkbox"
                              checked={Boolean(formValues[field.id])}
                              onChange={(e) => handleValueChange(field.id, e.target.checked)}
                              className="accent-neon-emerald"
                            />
                            <span>{field.placeholder || 'I confirm and agree to this condition'}</span>
                          </label>
                        )}
                      </div>
                    )}

                    {/* 10. UPLOAD FIELDS: IMAGE_UPLOAD, PDF_UPLOAD, FILE_UPLOAD */}
                    {isUpload && (
                      <div className="mt-1">
                        {uploadedFiles[field.id] ? (
                          <div className="flex items-center justify-between p-3 rounded-lg bg-cyber-black border border-neon-emerald/40 text-xs font-mono">
                            <div className="flex items-center space-x-2.5">
                              {uploadedFiles[field.id].type.startsWith('image/') ? (
                                <img 
                                  src={uploadedFiles[field.id].url} 
                                  alt="Uploaded preview" 
                                  className="w-10 h-10 object-cover rounded border border-cyber-border flex-shrink-0" 
                                />
                              ) : (
                                <FileCheck className="w-6 h-6 text-neon-emerald flex-shrink-0" />
                              )}
                              <div className="min-w-0">
                                <span className="text-white truncate max-w-[180px] sm:max-w-xs block font-bold">
                                  {uploadedFiles[field.id].name}
                                </span>
                                <span className="text-[10px] text-neon-emerald">
                                  ✓ Uploaded & Ready ({uploadedFiles[field.id].size})
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(field.id)}
                              className="text-neon-red hover:text-white p-1 transition-colors"
                              title="Remove file"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-cyber-border hover:border-neon-cyan/50 rounded-lg cursor-pointer bg-cyber-black/40 transition">
                            <Upload className="w-6 h-6 text-gray-400 mb-1" />
                            <span className="text-xs font-mono text-neon-cyan font-semibold">Select or Drop Document</span>
                            <span className="text-[10px] font-mono text-gray-400 mt-0.5">
                              {field.field_type === 'IMAGE_UPLOAD' ? 'JPG, PNG, WEBP (Max 10MB)' : 'PDF, JPG, PNG (Max 10MB)'}
                            </span>
                            <input
                              type="file"
                              accept={field.field_type === 'IMAGE_UPLOAD' ? '.jpg,.jpeg,.png,.webp' : '.jpg,.jpeg,.png,.webp,.pdf'}
                              onChange={(e) => handleFileUpload(field.id, e)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>

          {/* SUBMISSION ACTION BUTTON */}
          <div className="pt-4 text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-cyber-primary clip-esports-btn w-full py-4 text-sm font-black font-orbitron uppercase tracking-widest flex items-center justify-center space-x-2 shadow-neon-emerald disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>ALLOCATING STATE CODE & VERIFYING...</span>
                </>
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
