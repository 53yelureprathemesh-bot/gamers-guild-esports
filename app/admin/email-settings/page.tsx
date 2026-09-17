'use client';

import React, { useState } from 'react';
import { Mail, Save, Eye, CheckCircle2, Copy, Sparkles, Send } from 'lucide-react';
import { renderEmailTemplate, DEFAULT_EMAIL_TEMPLATE } from '@/lib/email';

export default function AdminEmailSettingsPage() {
  const [senderName, setSenderName] = useState('Gamers Guild Esports');
  const [replyTo, setReplyTo] = useState('support@gamersguild.gg');
  const [subject, setSubject] = useState('Gamers Guild Esports — Registration Confirmed [{{registration_code}}]');
  const [bodyHtml, setBodyHtml] = useState(DEFAULT_EMAIL_TEMPLATE.trim());
  const [notice, setNotice] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const variables = [
    { tag: '{{player_name}}', desc: 'Full legal name of the player' },
    { tag: '{{registration_code}}', desc: 'Generated state code e.g. MH27' },
    { tag: '{{event_name}}', desc: 'Title of the tournament' },
    { tag: '{{state}}', desc: 'State of origin e.g. Maharashtra' },
    { tag: '{{team_name}}', desc: 'Squad or clan name' },
    { tag: '{{status}}', desc: 'Current registration status' },
    { tag: '{{submission_date}}', desc: 'Formatted date of submission' }
  ];

  const handleSave = () => {
    setNotice('Email template parameters successfully updated and deployed to mail queue!');
    setTimeout(() => setNotice(null), 3500);
  };

  const sampleRenderedHtml = renderEmailTemplate(bodyHtml, {
    player_name: 'Rahul Deshmukh',
    registration_code: 'MH27',
    event_name: 'NEURAL NEXUS 2K26 — BGMI CHAMPIONSHIP',
    state: 'Maharashtra',
    team_name: 'CYBER TITANS',
    status: 'VERIFIED (Arbiter Approved)',
    submission_date: '16/09/2026, 10:15 PM IST'
  });

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-mono uppercase">
            TRANSACTIONAL EMAIL AUTOMATION & TEMPLATES
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            Configure automated confirmation emails dispatched to players immediately after registration.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setPreviewOpen(true)}
            className="btn-cyber-secondary px-4 py-2 rounded text-xs font-mono font-bold uppercase flex items-center space-x-1.5"
          >
            <Eye className="w-4 h-4 text-neon-cyan" />
            <span>PREVIEW DISPATCH</span>
          </button>

          <button
            onClick={handleSave}
            className="btn-cyber-primary px-5 py-2 rounded text-xs font-mono font-bold uppercase flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4 text-cyber-black" />
            <span>SAVE TEMPLATE</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-neon-emerald/20 border border-neon-emerald/50 text-xs font-mono text-neon-emerald flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* Available Variables Ribbon */}
      <div className="glass-panel p-5 rounded-xl border border-cyber-border space-y-2">
        <span className="text-xs font-mono font-bold text-neon-emerald uppercase flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>DYNAMIC TEMPLATE VARIABLES:</span>
        </span>
        <div className="flex flex-wrap gap-2 pt-1">
          {variables.map(v => (
            <div key={v.tag} className="p-2 rounded bg-cyber-dark border border-cyber-border text-xs font-mono">
              <code className="text-neon-cyan font-bold">{v.tag}</code>
              <span className="text-gray-400 block text-[10px]">{v.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Template Form */}
      <div className="glass-hud p-6 sm:p-8 rounded-2xl border border-cyber-border space-y-4 text-xs font-mono">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-300 font-bold block mb-1">Sender Name</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white"
            />
          </div>

          <div>
            <label className="text-gray-300 font-bold block mb-1">Reply-To Address</label>
            <input
              type="email"
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
              className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white"
            />
          </div>
        </div>

        <div>
          <label className="text-gray-300 font-bold block mb-1">Subject Line</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white"
          />
        </div>

        <div>
          <label className="text-gray-300 font-bold block mb-1">Email Body HTML Code</label>
          <textarea
            rows={14}
            value={bodyHtml}
            onChange={(e) => setBodyHtml(e.target.value)}
            className="w-full p-3 bg-cyber-black font-mono text-[11px] border border-cyber-border rounded text-gray-200 focus:outline-none focus:border-neon-emerald"
          />
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-hud p-6 sm:p-8 rounded-2xl border-2 border-neon-cyan/50 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b border-cyber-border pb-3">
              <div>
                <span className="text-[10px] font-mono text-neon-emerald uppercase font-bold">LIVE PREVIEW (SIMULATED VALUES)</span>
                <h3 className="text-sm font-bold text-white font-mono">Subject: {subject.replace('{{registration_code}}', 'MH27')}</h3>
              </div>
              <button onClick={() => setPreviewOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div 
              className="p-4 rounded-xl bg-cyber-black border border-cyber-border overflow-auto max-h-[500px]"
              dangerouslySetInnerHTML={{ __html: sampleRenderedHtml }}
            />

            <div className="pt-3 border-t border-cyber-border flex justify-end">
              <button
                onClick={() => setPreviewOpen(false)}
                className="btn-cyber-primary px-5 py-2 rounded text-xs font-mono font-bold uppercase"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
