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
  ExternalLink
} from 'lucide-react';
import { SiteSettings } from '@/lib/types';
import { INITIAL_SITE_SETTINGS } from '@/lib/dataStore';

export default function AdminHomeEditorPage() {
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/data?type=settings')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) setSettings(res.data);
      })
      .catch(() => console.log('Using initial settings.'));
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-site-settings',
          payload: settings
        })
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus('Homepage content successfully updated and published to production!');
        setTimeout(() => setSaveStatus(null), 3500);
      }
    } catch (err: any) {
      alert('Error updating homepage: ' + err.message);
    }
  };

  const updateHero = (key: keyof SiteSettings['hero'], val: string) => {
    setSettings(prev => ({
      ...prev,
      hero: { ...prev.hero, [key]: val }
    }));
  };

  const updateAbout = (key: keyof SiteSettings['about'], val: string) => {
    setSettings(prev => ({
      ...prev,
      about: { ...prev.about, [key]: val }
    }));
  };

  const updateStat = (index: number, key: 'number' | 'label', val: string) => {
    const copy = [...settings.statistics];
    copy[index] = { ...copy[index], [key]: val };
    setSettings(prev => ({ ...prev, statistics: copy }));
  };

  const updateContact = (key: keyof SiteSettings['contact'], val: string) => {
    setSettings(prev => ({
      ...prev,
      contact: { ...prev.contact, [key]: val }
    }));
  };

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
              value={settings.hero.tagline}
              onChange={(e) => updateHero('tagline', e.target.value)}
              className="w-full mt-1 px-3.5 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
            />
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-gray-300">Hero Subheading</label>
            <textarea
              rows={3}
              value={settings.hero.subheading}
              onChange={(e) => updateHero('subheading', e.target.value)}
              className="w-full mt-1 px-3.5 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono font-bold text-gray-300">Primary CTA Text</label>
              <input
                type="text"
                value={settings.hero.cta_primary_text}
                onChange={(e) => updateHero('cta_primary_text', e.target.value)}
                className="w-full mt-1 px-3.5 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
              />
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-gray-300">Primary CTA Link</label>
              <input
                type="text"
                value={settings.hero.cta_primary_link}
                onChange={(e) => updateHero('cta_primary_link', e.target.value)}
                className="w-full mt-1 px-3.5 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
              />
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-gray-300">Secondary CTA Text</label>
              <input
                type="text"
                value={settings.hero.cta_secondary_text}
                onChange={(e) => updateHero('cta_secondary_text', e.target.value)}
                className="w-full mt-1 px-3.5 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
              />
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-gray-300">Secondary CTA Link</label>
              <input
                type="text"
                value={settings.hero.cta_secondary_link}
                onChange={(e) => updateHero('cta_secondary_link', e.target.value)}
                className="w-full mt-1 px-3.5 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-gray-300">Logo Image Path / URL</label>
            <input
              type="text"
              value={settings.hero.logo_url}
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
              value={settings.about.heading}
              onChange={(e) => updateAbout('heading', e.target.value)}
              className="w-full mt-1 px-3.5 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
            />
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-gray-300">Detailed Description</label>
            <textarea
              rows={3}
              value={settings.about.description}
              onChange={(e) => updateAbout('description', e.target.value)}
              className="w-full mt-1 px-3.5 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono font-bold text-gray-300">Organization Mission</label>
              <textarea
                rows={3}
                value={settings.about.mission}
                onChange={(e) => updateAbout('mission', e.target.value)}
                className="w-full mt-1 px-3.5 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
              />
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-gray-300">Organization Vision</label>
              <textarea
                rows={3}
                value={settings.about.vision}
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
          {settings.statistics.map((st, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-cyber-dark/80 border border-cyber-border space-y-2">
              <span className="text-[10px] font-mono text-gray-400 font-bold uppercase">CARD #{idx + 1}</span>
              <div>
                <label className="text-[11px] font-mono text-gray-400">Value (e.g. 500+)</label>
                <input
                  type="text"
                  value={st.number}
                  onChange={(e) => updateStat(idx, 'number', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-cyber-black border border-cyber-border rounded text-white focus:border-neon-emerald"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-gray-400">Label (e.g. PLAYERS)</label>
                <input
                  type="text"
                  value={st.label}
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
        <h2 className="text-base font-black text-white font-mono uppercase border-b border-cyber-border pb-3">
          4. CONTACT DETAILS & SOCIAL HANDLES
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono font-bold text-gray-300">Public Support Email</label>
            <input
              type="email"
              value={settings.contact.email}
              onChange={(e) => updateContact('email', e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
            />
          </div>
          <div>
            <label className="text-xs font-mono font-bold text-gray-300">Helpline / WhatsApp</label>
            <input
              type="text"
              value={settings.contact.phone}
              onChange={(e) => updateContact('phone', e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-mono font-bold text-gray-300">Headquarters Address</label>
            <input
              type="text"
              value={settings.contact.address}
              onChange={(e) => updateContact('address', e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
            />
          </div>
          <div>
            <label className="text-xs font-mono font-bold text-gray-300">Discord Invite URL</label>
            <input
              type="text"
              value={settings.contact.discord}
              onChange={(e) => updateContact('discord', e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
            />
          </div>
          <div>
            <label className="text-xs font-mono font-bold text-gray-300">Instagram Handle URL</label>
            <input
              type="text"
              value={settings.contact.instagram}
              onChange={(e) => updateContact('instagram', e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
