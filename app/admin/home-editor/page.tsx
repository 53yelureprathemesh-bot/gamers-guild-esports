'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Loader2,
  Plus,
  Trash2,
  Swords,
  Trophy
} from 'lucide-react';
import { SiteSettings, BattlegroundDiscipline, HeroShowcase } from '@/lib/types';
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
            no_ongoing_tournaments_message: raw?.no_ongoing_tournaments_message || INITIAL_SITE_SETTINGS.no_ongoing_tournaments_message,
            hero_showcase: raw?.hero_showcase || INITIAL_SITE_SETTINGS.hero_showcase || {
              enabled: false,
              badge_text: 'NATIONAL ROSTER • APEX CHAMPIONS',
              subtitle: 'DOMINATING ALL DISCIPLINES',
              title: 'BGMI • FREE FIRE • VALORANT',
              prize_circuit: '₹5,00,000+',
              status_text: 'CIRCUIT STANDBY',
              image_url: '/images/characters/hero_squad.jpg'
            },
            disciplines: Array.isArray(raw?.disciplines) ? raw.disciplines : []
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
        } : settings.contact,
        hero_showcase: settings.hero_showcase,
        disciplines: settings.disciplines || []
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

  const updateHeroShowcase = (key: keyof HeroShowcase, val: any) => {
    setSettings(prev => ({
      ...prev,
      hero_showcase: {
        ...(prev.hero_showcase || {
          enabled: false,
          badge_text: '',
          subtitle: '',
          title: '',
          prize_circuit: '',
          status_text: '',
          image_url: ''
        }),
        [key]: val
      }
    }));
  };

  const addDiscipline = () => {
    const newDiscipline: BattlegroundDiscipline = {
      id: 'disc-' + Date.now(),
      game: 'BGMI',
      title: 'BGMI CHAMPIONSHIP',
      tagline: 'BATTLE ROYALE • SQUAD',
      prize_pool: '₹2,50,000 INR',
      description: 'Custom competitive rooms, Level-3 loot distribution, Erangel & Miramar state qualifiers.',
      format: '4v4 Squad',
      status: 'CIRCUIT STANDBY',
      image_url: '/images/characters/bgmi_operator.jpg',
      link_url: '/upcoming-events',
      link_text: 'VIEW SCHEDULE'
    };
    setSettings(prev => ({
      ...prev,
      disciplines: [...(prev.disciplines || []), newDiscipline]
    }));
  };

  const updateDiscipline = (id: string, key: keyof BattlegroundDiscipline, val: string) => {
    setSettings(prev => ({
      ...prev,
      disciplines: (prev.disciplines || []).map(d => d.id === id ? { ...d, [key]: val } : d)
    }));
  };

  const removeDiscipline = (id: string) => {
    setSettings(prev => ({
      ...prev,
      disciplines: (prev.disciplines || []).filter(d => d.id !== id)
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

      {/* 5. HERO SQUAD SHOWCASE BANNER (APEX ROSTER) */}
      <div className="glass-hud p-6 sm:p-8 rounded-2xl border border-cyber-border space-y-6">
        <h2 className="text-base font-black text-white font-mono uppercase border-b border-cyber-border pb-3 flex items-center justify-between">
          <span>5. HERO SQUAD SHOWCASE BANNER</span>
          <span className="text-xs font-bold text-neon-cyan px-2 py-0.5 rounded bg-neon-cyan/15 border border-neon-cyan/40">
            HERO ROSTER CARD
          </span>
        </h2>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 rounded-xl bg-cyber-dark/80 border border-cyber-border">
            <input
              type="checkbox"
              id="hero_showcase_enabled"
              checked={settings?.hero_showcase?.enabled ?? false}
              onChange={(e) => updateHeroShowcase('enabled', e.target.checked)}
              className="w-5 h-5 rounded bg-cyber-black border-cyber-border text-neon-emerald focus:ring-neon-emerald"
            />
            <label htmlFor="hero_showcase_enabled" className="text-xs font-mono font-bold text-white cursor-pointer select-none">
              SHOW HERO SQUAD SHOWCASE BANNER ON HOMEPAGE (If unchecked, this section is completely hidden from the public homepage).
            </label>
          </div>

          {settings?.hero_showcase?.enabled && (
            <div className="p-4 rounded-xl bg-cyber-dark/40 border border-cyber-border space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold text-gray-300 block mb-1">Top Live Badge</label>
                  <input
                    type="text"
                    value={settings.hero_showcase?.badge_text || ''}
                    onChange={(e) => updateHeroShowcase('badge_text', e.target.value)}
                    placeholder="NATIONAL ROSTER • APEX CHAMPIONS"
                    className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-gray-300 block mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={settings.hero_showcase?.subtitle || ''}
                    onChange={(e) => updateHeroShowcase('subtitle', e.target.value)}
                    placeholder="DOMINATING ALL DISCIPLINES"
                    className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-gray-300 block mb-1">Main Heading</label>
                  <input
                    type="text"
                    value={settings.hero_showcase?.title || ''}
                    onChange={(e) => updateHeroShowcase('title', e.target.value)}
                    placeholder="BGMI • FREE FIRE • VALORANT"
                    className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-gray-300 block mb-1">Total Prize Circuit</label>
                  <input
                    type="text"
                    value={settings.hero_showcase?.prize_circuit || ''}
                    onChange={(e) => updateHeroShowcase('prize_circuit', e.target.value)}
                    placeholder="₹5,00,000+"
                    className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-gray-300 block mb-1">Status Text</label>
                  <input
                    type="text"
                    value={settings.hero_showcase?.status_text || ''}
                    onChange={(e) => updateHeroShowcase('status_text', e.target.value)}
                    placeholder="CIRCUIT STANDBY"
                    className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-gray-300 block mb-1">Banner Image / Picture URL</label>
                  <input
                    type="text"
                    value={settings.hero_showcase?.image_url || ''}
                    onChange={(e) => updateHeroShowcase('image_url', e.target.value)}
                    placeholder="/images/characters/hero_squad.jpg or https://..."
                    className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. COMPETITIVE DISCIPLINES / BATTLEGROUND CARDS */}
      <div className="glass-hud p-6 sm:p-8 rounded-2xl border border-neon-cyan/40 space-y-6 shadow-hud">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyber-border pb-3">
          <div>
            <h2 className="text-base font-black text-white font-mono uppercase flex items-center space-x-2">
              <Swords className="w-4 h-4 text-neon-cyan" />
              <span>6. BATTLEGROUND DISCIPLINES & GAME CARDS</span>
            </h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Add custom game cards with pictures, titles, formats, and schedules displayed on the homepage.
            </p>
          </div>
          <button
            type="button"
            onClick={addDiscipline}
            className="btn-cyber-primary px-4 py-2 rounded text-xs font-mono font-bold uppercase flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-cyber-black" />
            <span>ADD DISCIPLINE CARD</span>
          </button>
        </div>

        {(!settings.disciplines || settings.disciplines.length === 0) ? (
          <div className="p-8 rounded-xl bg-cyber-dark/60 border border-cyber-border text-center space-y-3">
            <Swords className="w-8 h-8 text-gray-500 mx-auto" />
            <div className="text-sm font-bold text-gray-300 font-mono">
              NO DISCIPLINE CARDS CONFIGURED
            </div>
            <p className="text-xs text-gray-400 font-mono max-w-md mx-auto">
              Hardcoded discipline cards have been deleted per your request. The section will stay hidden from the public homepage until you click &quot;Add Discipline Card&quot; below.
            </p>
            <button
              type="button"
              onClick={addDiscipline}
              className="btn-cyber-secondary px-4 py-2 rounded text-xs font-mono font-bold inline-flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5 text-neon-cyan" />
              <span>ADD YOUR FIRST CARD</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {settings.disciplines.map((item, index) => (
              <div 
                key={item.id} 
                className="p-5 rounded-xl bg-cyber-dark/80 border border-cyber-border space-y-4 relative group hover:border-neon-cyan/40 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-cyber-border pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-neon-cyan/20 border border-neon-cyan text-neon-cyan font-mono text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="font-mono text-xs font-bold text-white uppercase">
                      {item.title || item.game || 'New Discipline'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDiscipline(item.id)}
                    className="p-1.5 rounded-lg bg-cyber-black hover:bg-neon-red/20 text-gray-400 hover:text-neon-red border border-cyber-border transition-colors text-xs font-mono flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>DELETE CARD</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-mono font-bold text-gray-300 block mb-1">Game Name</label>
                    <input
                      type="text"
                      value={item.game || ''}
                      onChange={(e) => updateDiscipline(item.id, 'game', e.target.value)}
                      placeholder="BGMI, Free Fire, Valorant..."
                      className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono font-bold text-gray-300 block mb-1">Championship Title</label>
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => updateDiscipline(item.id, 'title', e.target.value)}
                      placeholder="BGMI CHAMPIONSHIP"
                      className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono font-bold text-gray-300 block mb-1">Tagline / Genre</label>
                    <input
                      type="text"
                      value={item.tagline || ''}
                      onChange={(e) => updateDiscipline(item.id, 'tagline', e.target.value)}
                      placeholder="BATTLE ROYALE • SQUAD"
                      className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono font-bold text-gray-300 block mb-1">Prize Pool</label>
                    <input
                      type="text"
                      value={item.prize_pool || ''}
                      onChange={(e) => updateDiscipline(item.id, 'prize_pool', e.target.value)}
                      placeholder="₹2,50,000 INR"
                      className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono font-bold text-gray-300 block mb-1">Format</label>
                    <input
                      type="text"
                      value={item.format || ''}
                      onChange={(e) => updateDiscipline(item.id, 'format', e.target.value)}
                      placeholder="4v4 Squad, 5v5 Tactical..."
                      className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono font-bold text-gray-300 block mb-1">Status Badge</label>
                    <input
                      type="text"
                      value={item.status || ''}
                      onChange={(e) => updateDiscipline(item.id, 'status', e.target.value)}
                      placeholder="CIRCUIT STANDBY, REGISTRATION OPEN..."
                      className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-mono font-bold text-gray-300 block mb-1">Picture / Image URL</label>
                    <input
                      type="text"
                      value={item.image_url || ''}
                      onChange={(e) => updateDiscipline(item.id, 'image_url', e.target.value)}
                      placeholder="/images/characters/bgmi_operator.jpg or https://..."
                      className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono font-bold text-gray-300 block mb-1">Button Link URL</label>
                    <input
                      type="text"
                      value={item.link_url || ''}
                      onChange={(e) => updateDiscipline(item.id, 'link_url', e.target.value)}
                      placeholder="/upcoming-events or /registration"
                      className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono font-bold text-gray-300 block mb-1">Button Text</label>
                    <input
                      type="text"
                      value={item.link_text || ''}
                      onChange={(e) => updateDiscipline(item.id, 'link_text', e.target.value)}
                      placeholder="VIEW SCHEDULE"
                      className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-mono font-bold text-gray-300 block mb-1">Description</label>
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => updateDiscipline(item.id, 'description', e.target.value)}
                      placeholder="Custom competitive rooms, Level-3 loot distribution..."
                      className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. REGISTRATION GATEWAY CONTROLS */}
      <div className="glass-hud p-6 sm:p-8 rounded-2xl border border-cyber-border space-y-6">
        <h2 className="text-base font-black text-white font-mono uppercase border-b border-cyber-border pb-3">
          7. TOURNAMENT REGISTRATION GATEWAY
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

      {/* 8. ONGOING TOURNAMENTS SECTION CONTROLS */}
      <div className="glass-hud p-6 sm:p-8 rounded-2xl border border-neon-cyan/40 space-y-6 shadow-hud">
        <h2 className="text-base font-black text-white font-mono uppercase border-b border-cyber-border pb-3 flex items-center justify-between">
          <span>8. ONGOING TOURNAMENTS SECTION CONTROLS</span>
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
