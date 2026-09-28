'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Edit3, 
  Save, 
  Eye, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  Globe, 
  Image as ImageIcon,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { SiteSettings } from '@/lib/types';
import { INITIAL_SITE_SETTINGS } from '@/lib/dataStore';
import { formatExternalUrl } from '@/lib/formatUrl';

export default function AdminHomeEditorPage() {
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('gg_admin_token') || '' : '';
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  useEffect(() => {
    fetch('/api/admin/data?type=site-settings', { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          const raw = res.data.settings || res.data;
          setSettings({
            ...INITIAL_SITE_SETTINGS,
            ...raw,
            hero: { ...INITIAL_SITE_SETTINGS.hero, ...(raw?.hero || {}) },
            about: { ...INITIAL_SITE_SETTINGS.about, ...(raw?.about || {}) },
            contact: { ...INITIAL_SITE_SETTINGS.contact, ...(raw?.contact || {}) },
            statistics: Array.isArray(raw?.statistics) && raw.statistics.length > 0 ? raw.statistics : INITIAL_SITE_SETTINGS.statistics,
            registration_enabled: raw?.registration_enabled !== undefined ? Boolean(raw.registration_enabled) : true,
            registration_closed_message: raw?.registration_closed_message || INITIAL_SITE_SETTINGS.registration_closed_message,
            ongoing_tournaments_active: raw?.ongoing_tournaments_active !== undefined ? Boolean(raw.ongoing_tournaments_active) : false,
            no_ongoing_tournaments_title: raw?.no_ongoing_tournaments_title || INITIAL_SITE_SETTINGS.no_ongoing_tournaments_title,
            no_ongoing_tournaments_message: raw?.no_ongoing_tournaments_message || INITIAL_SITE_SETTINGS.no_ongoing_tournaments_message
          });
        }
      })
      .catch((e) => console.log('Using initial settings:', e))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      const normalizedSettings: SiteSettings = {
        ...settings,
        contact: settings.contact ? {
          ...settings.contact,
          discord: settings.contact.discord ? formatExternalUrl(settings.contact.discord) : '',
          instagram: settings.contact.instagram ? formatExternalUrl(settings.contact.instagram) : '',
          youtube: settings.contact.youtube ? formatExternalUrl(settings.contact.youtube) : '',
          facebook: settings.contact.facebook ? formatExternalUrl(settings.contact.facebook) : '',
        } : settings.contact
      };

      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'update-site-settings',
          payload: normalizedSettings
        })
      });
      const data = await res.json();
      if (data.success) {
        setSettings(normalizedSettings);
        setSaveStatus('Homepage content & settings successfully updated and published to live website!');
        setTimeout(() => setSaveStatus(null), 3500);
      } else {
        alert('Save failed: ' + (data.error || 'Server error'));
      }
    } catch (err: any) {
      alert('Error updating homepage: ' + err.message);
    }
  };

  const updateHero = (key: keyof SiteSettings['hero'], val: string) => {
    setSettings(prev => ({
      ...prev,
      hero: { ...(prev.hero || INITIAL_SITE_SETTINGS.hero), [key]: val }
    }));
  };

  const updateAbout = (key: keyof SiteSettings['about'], val: string) => {
    setSettings(prev => ({
      ...prev,
      about: { ...(prev.about || INITIAL_SITE_SETTINGS.about), [key]: val }
    }));
  };

  const updateStat = (index: number, key: 'number' | 'label', val: string) => {
    const list = settings.statistics || INITIAL_SITE_SETTINGS.statistics;
    const copy = [...list];
    if (copy[index]) {
      copy[index] = { ...copy[index], [key]: val };
      setSettings(prev => ({ ...prev, statistics: copy }));
    }
  };

  const updateContact = (key: keyof SiteSettings['contact'], val: string) => {
    setSettings(prev => ({
      ...prev,
      contact: { ...(prev.contact || INITIAL_SITE_SETTINGS.contact), [key]: val }
    }));
  };

  const statsList = Array.isArray(settings?.statistics) && settings.statistics.length > 0 
    ? settings.statistics 
    : INITIAL_SITE_SETTINGS.statistics;

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-mono uppercase">
            VISUAL HOMEPAGE CONTENT EDITOR
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            Modify hero copy, lore, metrics, and headquarters information without touching source code.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/"
            target="_blank"
            className="btn-cyber-secondary px-4 py-2 rounded text-xs font-mono font-bold uppercase flex items-center space-x-1.5"
          >
            <Eye className="w-4 h-4 text-neon-cyan" />
            <span>PREVIEW LIVE SITE</span>
          </Link>

          <button
            onClick={handleSave}
            className="btn-cyber-primary px-5 py-2 rounded text-xs font-mono font-bold uppercase flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4 text-cyber-black" />
            <span>SAVE & PUBLISH</span>
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className="p-3.5 rounded-xl bg-neon-emerald/20 border border-neon-emerald/50 text-xs font-mono text-neon-emerald flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* 1. HERO SECTION CONFIGURATION */}
      <div className="glass-hud p-6 sm:p-8 rounded-2xl border border-cyber-border space-y-6">
        <h2 className="text-base font-black text-white font-mono uppercase border-b border-cyber-border pb-3 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-neon-emerald" />
          <span>1. HERO SECTION CONTENT</span>
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono font-bold text-gray-300">Hero Main Tagline</label>
            <input
              type="text"
              value={settings?.hero?.tagline || ''}
              onChange={(e) => updateHero('tagline', e.target.value)}
              className="w-full mt-1 px-3.5 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
            />
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-gray-300">Hero Subheading</label>
            <textarea
              rows={3}
              value={settings?.hero?.subheading || ''}
              onChange={(e) => updateHero('subheading', e.target.value)}
              className="w-full mt-1 px-3.5 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono font-bold text-gray-300">Primary CTA Text</label>
              <input
                type="text"
                value={settings?.hero?.cta_primary_text || ''}
                onChange={(e) => updateHero('cta_primary_text', e.target.value)}
                className="w-full mt-1 px-3.5 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
              />
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-gray-300">Primary CTA Link</label>
              <input
                type="text"
                value={settings?.hero?.cta_primary_link || ''}
                onChange={(e) => updateHero('cta_primary_link', e.target.value)}
                className="w-full mt-1 px-3.5 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
              />
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-gray-300">Secondary CTA Text</label>
              <input
                type="text"
                value={settings?.hero?.cta_secondary_text || ''}
                onChange={(e) => updateHero('cta_secondary_text', e.target.value)}
                className="w-full mt-1 px-3.5 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
              />
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-gray-300">Secondary CTA Link</label>
              <input
                type="text"
                value={settings?.hero?.cta_secondary_link || ''}
                onChange={(e) => updateHero('cta_secondary_link', e.target.value)}
                className="w-full mt-1 px-3.5 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-gray-300">Logo Image Path / URL</label>
            <input
              type="text"
              value={settings?.hero?.logo_url || ''}
              onChange={(e) => updateHero('logo_url', e.target.value)}
              className="w-full mt-1 px-3.5 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
            />
          </div>
        </div>
      </div>

      {/* 2. ABOUT & LORE */}
      <div className="glass-hud p-6 sm:p-8 rounded-2xl border border-cyber-border space-y-6">
        <h2 className="text-base font-black text-white font-mono uppercase border-b border-cyber-border pb-3 flex items-center space-x-2">
          <Globe className="w-4 h-4 text-neon-cyan" />
          <span>2. ABOUT GAMERS GUILD & VALUES</span>
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono font-bold text-gray-300">About Heading</label>
            <input
              type="text"
              value={settings?.about?.heading || ''}
              onChange={(e) => updateAbout('heading', e.target.value)}
              className="w-full mt-1 px-3.5 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
            />
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-gray-300">Detailed Description</label>
            <textarea
              rows={3}
              value={settings?.about?.description || ''}
              onChange={(e) => updateAbout('description', e.target.value)}
              className="w-full mt-1 px-3.5 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono font-bold text-gray-300">Organization Mission</label>
              <textarea
                rows={3}
                value={settings?.about?.mission || ''}
                onChange={(e) => updateAbout('mission', e.target.value)}
                className="w-full mt-1 px-3.5 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
              />
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-gray-300">Organization Vision</label>
              <textarea
                rows={3}
                value={settings?.about?.vision || ''}
                onChange={(e) => updateAbout('vision', e.target.value)}
                className="w-full mt-1 px-3.5 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. STATISTICS CARDS */}
      <div className="glass-hud p-6 sm:p-8 rounded-2xl border border-cyber-border space-y-6">
        <h2 className="text-base font-black text-white font-mono uppercase border-b border-cyber-border pb-3 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-neon-gold" />
          <span>3. HOMEPAGE STATISTICS COUNTERS</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsList.map((st, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-cyber-dark/80 border border-cyber-border space-y-2">
              <span className="text-[10px] font-mono text-gray-400 font-bold uppercase">CARD #{idx + 1}</span>
              <div>
                <label className="text-[11px] font-mono text-gray-400">Value (e.g. 500+)</label>
                <input
                  type="text"
                  value={st?.number || ''}
                  onChange={(e) => updateStat(idx, 'number', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-cyber-black border border-cyber-border rounded text-white focus:border-neon-emerald"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-gray-400">Label (e.g. PLAYERS)</label>
                <input
                  type="text"
                  value={st?.label || ''}
                  onChange={(e) => updateStat(idx, 'label', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-cyber-black border border-cyber-border rounded text-white focus:border-neon-emerald"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CONTACT & SOCIAL NETWORKS */}
      <div className="glass-hud p-6 sm:p-8 rounded-2xl border border-cyber-border space-y-6">
        <div className="border-b border-cyber-border pb-3">
          <h2 className="text-base font-black text-white font-mono uppercase">
            4. CONTACT DETAILS & SOCIAL HANDLES
          </h2>
          <p className="text-[11px] font-mono text-neon-cyan mt-1">
            Tip: You can paste handles or full URLs (e.g. www.youtube.com/@GamersGuild-NGP or https://youtube.com/@GamersGuild-NGP). All links are automatically formatted into working external links.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono font-bold text-gray-300">Public Support Email</label>
            <input
              type="email"
              value={settings?.contact?.email || ''}
              onChange={(e) => updateContact('email', e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
            />
          </div>
          <div>
            <label className="text-xs font-mono font-bold text-gray-300">Helpline / WhatsApp</label>
            <input
              type="text"
              value={settings?.contact?.phone || ''}
              onChange={(e) => updateContact('phone', e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-mono font-bold text-gray-300">Headquarters Address</label>
            <input
              type="text"
              value={settings?.contact?.address || ''}
              onChange={(e) => updateContact('address', e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
            />
          </div>
          <div>
            <label className="text-xs font-mono font-bold text-gray-300">Discord Invite URL</label>
            <input
              type="text"
              value={settings?.contact?.discord || ''}
              onChange={(e) => updateContact('discord', e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
            />
          </div>
          <div>
            <label className="text-xs font-mono font-bold text-gray-300">Instagram Handle URL</label>
            <input
              type="text"
              value={settings?.contact?.instagram || ''}
              onChange={(e) => updateContact('instagram', e.target.value)}
              placeholder="https://www.instagram.com/..."
              className="w-full mt-1 px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
            />
          </div>
          <div>
            <label className="text-xs font-mono font-bold text-gray-300">YouTube Channel URL</label>
            <input
              type="text"
              value={settings?.contact?.youtube || ''}
              onChange={(e) => updateContact('youtube', e.target.value)}
              placeholder="https://youtube.com/@..."
              className="w-full mt-1 px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
            />
          </div>
          <div>
            <label className="text-xs font-mono font-bold text-gray-300">Facebook Page / Profile URL</label>
            <input
              type="text"
              value={settings?.contact?.facebook || ''}
              onChange={(e) => updateContact('facebook', e.target.value)}
              placeholder="https://facebook.com/..."
              className="w-full mt-1 px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
            />
          </div>
        </div>
      </div>

      {/* 5. REGISTRATION GATEWAY CONTROLS */}
      <div className="glass-hud p-6 sm:p-8 rounded-2xl border border-cyber-border space-y-6">
        <h2 className="text-base font-black text-white font-mono uppercase border-b border-cyber-border pb-3">
          5. TOURNAMENT REGISTRATION GATEWAY
        </h2>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 rounded-xl bg-cyber-dark/80 border border-cyber-border">
            <input
              type="checkbox"
              id="registration_enabled"
              checked={settings?.registration_enabled ?? true}
              onChange={(e) => setSettings(prev => ({ ...prev, registration_enabled: e.target.checked }))}
              className="w-5 h-5 rounded bg-cyber-black border-cyber-border text-neon-emerald focus:ring-neon-emerald"
            />
            <label htmlFor="registration_enabled" className="text-xs font-mono font-bold text-white cursor-pointer select-none">
              ALLOW PUBLIC TOURNAMENT REGISTRATIONS (GLOBAL GATEWAY)
            </label>
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-gray-300 block mb-1">
              Custom Closed Notice Message (Displayed when registrations are closed or no events exist)
            </label>
            <textarea
              rows={2}
              value={settings?.registration_closed_message || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, registration_closed_message: e.target.value }))}
              placeholder="NO EVENT IS GOING ON / REGISTRATIONS CURRENTLY CLOSED"
              className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
            />
          </div>
        </div>
      </div>

      {/* 6. ONGOING TOURNAMENTS SECTION CONTROLS */}
      <div className="glass-hud p-6 sm:p-8 rounded-2xl border border-neon-cyan/40 space-y-6 shadow-hud">
        <h2 className="text-base font-black text-white font-mono uppercase border-b border-cyber-border pb-3 flex items-center justify-between">
          <span>6. ONGOING TOURNAMENTS SECTION CONTROLS</span>
          <span className="text-xs font-bold text-neon-cyan px-2 py-0.5 rounded bg-neon-cyan/15 border border-neon-cyan/40">
            PUBLIC WEBSITE DISPLAY
          </span>
        </h2>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 rounded-xl bg-cyber-dark/80 border border-cyber-border">
            <input
              type="checkbox"
              id="ongoing_tournaments_active"
              checked={settings?.ongoing_tournaments_active ?? false}
              onChange={(e) => setSettings(prev => ({ ...prev, ongoing_tournaments_active: e.target.checked }))}
              className="w-5 h-5 rounded bg-cyber-black border-cyber-border text-neon-cyan focus:ring-neon-cyan"
            />
            <label htmlFor="ongoing_tournaments_active" className="text-xs font-mono font-bold text-white cursor-pointer select-none">
              ENABLE ONGOING TOURNAMENTS SECTION (If checked, shows live match broadcasts and leaderboards. If unchecked or if no events are ongoing, displays the custom "No Ongoing Tournaments" notice).
            </label>
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-gray-300 block mb-1">
              Custom "No Ongoing Tournaments" Heading
            </label>
            <input
              type="text"
              value={settings?.no_ongoing_tournaments_title || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, no_ongoing_tournaments_title: e.target.value }))}
              placeholder="NO ONGOING TOURNAMENTS AT THE MOMENT"
              className="w-full px-3.5 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-cyan"
            />
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-gray-300 block mb-1">
              Custom "No Ongoing Tournaments" Description Notice
            </label>
            <textarea
              rows={2}
              value={settings?.no_ongoing_tournaments_message || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, no_ongoing_tournaments_message: e.target.value }))}
              placeholder="All live championship stages and match broadcasts have concluded. Check out our upcoming tournaments calendar to register and claim your slot!"
              className="w-full px-3.5 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-cyan"
            />
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex justify-end pt-4 border-t border-cyber-border">
        <button
          onClick={handleSave}
          className="btn-cyber-primary px-8 py-3 rounded-xl text-xs font-mono font-bold uppercase flex items-center space-x-2"
        >
          <Save className="w-4 h-4 text-cyber-black" />
          <span>SAVE & PUBLISH ALL EDITS</span>
        </button>
      </div>

    </div>
  );
}
