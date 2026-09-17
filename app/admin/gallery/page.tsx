'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Image as GalleryIcon, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { GalleryItem } from '@/lib/types';
import { INITIAL_GALLERY } from '@/lib/dataStore';

export default function AdminGalleryPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [editingItem, setEditingItem] = useState<Partial<GalleryItem> | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/data?type=gallery')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) setGallery(res.data);
      })
      .catch(() => console.log('Using default gallery.'));
  }, []);

  const handleSave = async () => {
    if (!editingItem || !editingItem.title || !editingItem.image_url) {
      alert('Title and Image URL are required.');
      return;
    }

    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-gallery',
          payload: editingItem
        })
      });
      const data = await res.json();
      if (data.success) {
        setNotice('Media uploaded and saved to gallery!');
        setGallery([data.data, ...gallery.filter(g => g.id !== data.data.id)]);
        setEditingItem(null);
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
        body: JSON.stringify({ action: 'delete-gallery', payload: { id } })
      });
      setGallery(gallery.filter(g => g.id !== id));
      setNotice('Photo removed.');
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
            MEDIA & LAN GALLERY MANAGER
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            Upload stage photos, trophy lifts, and LAN event highlights.
          </p>
        </div>

        <button
          onClick={() => setEditingItem({
            title: '',
            description: '',
            category: 'LAN_EVENTS',
            image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
            is_published: true
          })}
          className="btn-cyber-primary px-4 py-2 rounded text-xs font-mono font-bold uppercase flex items-center space-x-1"
        >
          <Plus className="w-4 h-4 text-cyber-black" />
          <span>UPLOAD PHOTO</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-neon-emerald/20 border border-neon-emerald/50 text-xs font-mono text-neon-emerald flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {gallery.map((item) => (
          <div key={item.id} className="glass-panel rounded-xl overflow-hidden border border-cyber-border flex flex-col justify-between">
            <div className="relative h-44 w-full bg-cyber-dark">
              <Image src={item.image_url} alt={item.title} fill className="object-cover" />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-cyber-black/80 text-[10px] font-mono text-neon-cyan font-bold">
                {item.category}
              </div>
            </div>
            <div className="p-3.5 space-y-2">
              <h3 className="text-xs font-bold text-white font-mono truncate">{item.title}</h3>
              <p className="text-[11px] text-gray-400 line-clamp-2">{item.description}</p>
              <div className="pt-2 border-t border-cyber-border flex justify-end">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 rounded bg-cyber-dark text-gray-400 hover:text-neon-red"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-hud p-6 rounded-2xl border-2 border-neon-cyan/50 max-w-md w-full space-y-4 text-xs font-mono">
            <h3 className="text-base font-black text-white uppercase">ADD GALLERY PHOTO</h3>

            <div>
              <label className="text-gray-300 block mb-1">Title *</label>
              <input
                type="text"
                value={editingItem.title || ''}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white"
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-1">Category</label>
              <select
                value={editingItem.category || 'LAN_EVENTS'}
                onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white"
              >
                <option value="LAN_EVENTS">LAN EVENTS</option>
                <option value="ARENA">ARENA</option>
                <option value="STAGE">STAGE</option>
                <option value="COMMUNITY">COMMUNITY</option>
              </select>
            </div>

            <div>
              <label className="text-gray-300 block mb-1">Image URL *</label>
              <input
                type="text"
                value={editingItem.image_url || ''}
                onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white"
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-1">Description</label>
              <textarea
                rows={2}
                value={editingItem.description || ''}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white"
              />
            </div>

            <div className="pt-3 border-t border-cyber-border flex justify-end space-x-2">
              <button
                onClick={() => setEditingItem(null)}
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
