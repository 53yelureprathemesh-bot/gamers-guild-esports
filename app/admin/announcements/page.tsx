'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, Edit3, CheckCircle2, Sparkles } from 'lucide-react';
import { Announcement } from '@/lib/types';
import { INITIAL_ANNOUNCEMENTS } from '@/lib/dataStore';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [editingAnn, setEditingAnn] = useState<Partial<Announcement> | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/data?type=announcements')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) setAnnouncements(res.data);
      })
      .catch(() => console.log('Loaded default announcements.'));
  }, []);

  const handleSave = async () => {
    if (!editingAnn || !editingAnn.title || !editingAnn.content) {
      alert('Title and content are required.');
      return;
    }

    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-announcement',
          payload: editingAnn
        })
      });
      const data = await res.json();
      if (data.success) {
        setNotice('Announcement published successfully!');
        setAnnouncements([data.data, ...announcements.filter(a => a.id !== data.data.id)]);
        setEditingAnn(null);
        setTimeout(() => setNotice(null), 3000);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-announcement', payload: { id } })
      });
      setAnnouncements(announcements.filter(a => a.id !== id));
      setNotice('Announcement removed.');
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-mono uppercase">
            ANNOUNCEMENTS & NEWS DISPATCH
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            Broadcast emergency updates, anti-cheat warnings, and registration launches.
          </p>
        </div>

        <button
          onClick={() => setEditingAnn({
            title: '',
            content: '',
            priority: 'HIGH',
            image_url: '',
            link: '/registration',
            is_published: true
          })}
          className="btn-cyber-primary px-4 py-2 rounded text-xs font-mono font-bold uppercase flex items-center space-x-1"
        >
          <Plus className="w-4 h-4 text-cyber-black" />
          <span>NEW ANNOUNCEMENT</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-neon-emerald/20 border border-neon-emerald/50 text-xs font-mono text-neon-emerald flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {announcements.map((ann) => (
          <div key={ann.id} className="glass-panel p-5 rounded-xl border border-cyber-border space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  ann.priority === 'URGENT' ? 'bg-neon-red/20 text-neon-red border border-neon-red/40 animate-pulse' :
                  ann.priority === 'HIGH' ? 'bg-neon-gold/20 text-neon-gold border border-neon-gold/40' :
                  'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40'
                }`}>
                  {ann.priority} PRIORITY
                </span>
                <span className="text-[10px] font-mono text-gray-400">{ann.created_at}</span>
              </div>
              <h3 className="text-sm font-black text-white font-mono">{ann.title}</h3>
              <p className="text-xs text-gray-300 font-sans leading-relaxed">{ann.content}</p>
            </div>

            <div className="pt-3 border-t border-cyber-border flex justify-between items-center">
              <span className="text-[10px] font-mono text-neon-emerald">
                {ann.is_published ? 'Published' : 'Draft'}
              </span>
              <div className="space-x-1">
                <button
                  onClick={() => setEditingAnn(ann)}
                  className="p-1 rounded bg-cyber-dark text-gray-400 hover:text-white"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(ann.id)}
                  className="p-1 rounded bg-cyber-dark text-gray-400 hover:text-neon-red"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editingAnn && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-hud p-6 rounded-2xl border-2 border-neon-cyan/50 max-w-md w-full space-y-4 text-xs font-mono">
            <h3 className="text-base font-black text-white uppercase">ANNOUNCEMENT DISPATCH</h3>

            <div>
              <label className="text-gray-300 block mb-1">Headline Title *</label>
              <input
                type="text"
                value={editingAnn.title || ''}
                onChange={(e) => setEditingAnn({ ...editingAnn, title: e.target.value })}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white"
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-1">Priority Level</label>
              <select
                value={editingAnn.priority || 'MEDIUM'}
                onChange={(e) => setEditingAnn({ ...editingAnn, priority: e.target.value as any })}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT (LIVE TICKER)</option>
              </select>
            </div>

            <div>
              <label className="text-gray-300 block mb-1">Detailed Content *</label>
              <textarea
                rows={3}
                value={editingAnn.content || ''}
                onChange={(e) => setEditingAnn({ ...editingAnn, content: e.target.value })}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white"
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-1">Target Link (Optional)</label>
              <input
                type="text"
                value={editingAnn.link || ''}
                onChange={(e) => setEditingAnn({ ...editingAnn, link: e.target.value })}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white"
                placeholder="/registration"
              />
            </div>

            <div className="pt-3 border-t border-cyber-border flex justify-end space-x-2">
              <button
                onClick={() => setEditingAnn(null)}
                className="px-4 py-2 text-gray-400 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-cyber-primary px-5 py-2 rounded font-bold uppercase"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
