'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Image as GalleryIcon, Plus, Trash2, CheckCircle2, Upload, Sparkles, Filter, X } from 'lucide-react';
import { GalleryItem } from '@/lib/types';
import { INITIAL_GALLERY } from '@/lib/dataStore';

export default function AdminGalleryPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [editingItem, setEditingItem] = useState<Partial<GalleryItem> | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('gg_admin_token') || '' : '';
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  useEffect(() => {
    fetch('/api/admin/data?type=gallery', { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) setGallery(res.data);
      })
      .catch(() => console.log('Using default gallery.'));
  }, []);

  // Handle direct device file upload (Phone / PC) with canvas compression
  const handleDeviceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP).');
      return;
    }

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const rawDataUrl = loadEvt.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        const maxDim = 1600;
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
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setEditingItem(prev => ({
            ...prev,
            image_url: compressed,
            title: prev?.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
          }));
        } else {
          setEditingItem(prev => ({
            ...prev,
            image_url: rawDataUrl,
            title: prev?.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
          }));
        }
        setIsCompressing(false);
      };
      img.onerror = () => {
        setIsCompressing(false);
        setEditingItem(prev => ({
          ...prev,
          image_url: rawDataUrl
        }));
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!editingItem || !editingItem.title || !editingItem.image_url) {
      alert('Title and Image are required.');
      return;
    }

    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: getAuthHeaders(),
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
      } else {
        alert('Save failed: ' + (data.error || 'Server error'));
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media item?')) return;
    try {
      await fetch('/api/admin/data', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'delete-gallery', payload: { id } })
      });
      setGallery(gallery.filter(g => g.id !== id));
      setNotice('Photo removed.');
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const filteredGallery = selectedCategory === 'ALL'
    ? gallery
    : gallery.filter(item => item.category === selectedCategory);

  const categories = ['ALL', 'POSTERS', 'LAN_EVENTS', 'ARENA', 'STAGE', 'COMMUNITY'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-mono uppercase">
            MEDIA & LAN GALLERY MANAGER
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            Upload tournament posters from device, stage photos, trophy lifts, and LAN highlights.
          </p>
        </div>

        <button
          onClick={() => setEditingItem({
            title: '',
            description: '',
            category: 'POSTERS',
            image_url: '',
            is_published: true
          })}
          className="btn-cyber-primary px-4 py-2.5 rounded text-xs font-mono font-bold uppercase flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-cyber-black" />
          <span>UPLOAD POSTER / PHOTO</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-neon-emerald/20 border border-neon-emerald/50 text-xs font-mono text-neon-emerald flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 pt-1 border-b border-cyber-border pb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition ${
              selectedCategory === cat
                ? 'bg-neon-emerald text-cyber-black shadow-neon-glow'
                : 'bg-cyber-dark text-gray-400 hover:text-white border border-cyber-border'
            }`}
          >
            {cat === 'ALL' ? 'ALL MEDIA' : cat.replace('_', ' ')}
            {cat === 'POSTERS' && ' 🏆'}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredGallery.map((item) => (
          <div key={item.id} className="glass-panel rounded-xl overflow-hidden border border-cyber-border flex flex-col justify-between group hover:border-neon-cyan/50 transition">
            <div className="relative h-48 w-full bg-cyber-dark overflow-hidden">
              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-cyber-black/85 text-[10px] font-mono font-bold text-neon-cyan border border-neon-cyan/30">
                {item.category === 'POSTERS' ? '🏆 TOURNAMENT POSTER' : item.category}
              </div>
            </div>
            <div className="p-3.5 space-y-2">
              <h3 className="text-xs font-bold text-white font-mono truncate">{item.title}</h3>
              <p className="text-[11px] text-gray-400 line-clamp-2">{item.description || 'No description provided.'}</p>
              <div className="pt-2 border-t border-cyber-border flex justify-between items-center text-[10px] font-mono text-gray-500">
                <span>{item.category === 'POSTERS' ? 'Usable for Events' : 'Gallery Item'}</span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded bg-cyber-dark text-gray-400 hover:text-neon-red hover:bg-neon-red/10 transition"
                  title="Delete media"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload & Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-hud p-6 rounded-2xl border-2 border-neon-cyan/50 max-w-lg w-full space-y-4 text-xs font-mono max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-cyber-border pb-3">
              <h3 className="text-base font-black text-white uppercase flex items-center space-x-2">
                <GalleryIcon className="w-4 h-4 text-neon-cyan" />
                <span>UPLOAD MEDIA & POSTER</span>
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Direct Device Upload Box */}
            <div className="space-y-2">
              <label className="text-gray-300 font-bold block">1. Select Poster / Image from Device *</label>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="p-6 border-2 border-dashed border-neon-cyan/50 hover:border-neon-emerald rounded-xl cursor-pointer bg-cyber-dark/60 text-center flex flex-col items-center justify-center space-y-2 transition group"
              >
                <div className="w-10 h-10 rounded-full bg-neon-cyan/10 border border-neon-cyan/40 flex items-center justify-center group-hover:scale-110 transition">
                  <Upload className="w-5 h-5 text-neon-cyan" />
                </div>
                <div className="text-white font-bold text-xs">
                  {isCompressing ? 'Compressing for web...' : 'Click to Browse from Phone / PC'}
                </div>
                <div className="text-[10px] text-gray-400">
                  PNG, JPG, WEBP (Auto-optimized for ultra-fast loading across all devices)
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleDeviceUpload}
                className="hidden"
              />
            </div>

            {/* Image Preview & URL fallback */}
            {editingItem.image_url ? (
              <div className="space-y-1.5 p-3 rounded-xl bg-cyber-dark border border-neon-emerald/40">
                <span className="text-[10px] text-neon-emerald font-bold uppercase block">✓ Image Selected & Optimized</span>
                <div className="relative h-44 w-full rounded-lg overflow-hidden border border-cyber-border bg-black">
                  <img src={editingItem.image_url} alt="Preview" className="w-full h-full object-contain" />
                </div>
                <button
                  type="button"
                  onClick={() => setEditingItem({ ...editingItem, image_url: '' })}
                  className="text-[10px] text-neon-red hover:underline block pt-1"
                >
                  ✕ Remove / Choose different image
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-gray-400 block text-[11px]">Or paste an external Image URL:</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={editingItem.image_url || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
                  className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white text-xs"
                />
              </div>
            )}

            <div>
              <label className="text-gray-300 font-bold block mb-1">Title / Caption *</label>
              <input
                type="text"
                placeholder="e.g. BGMI National Championship Official Poster"
                value={editingItem.title || ''}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white"
              />
            </div>

            <div>
              <label className="text-gray-300 font-bold block mb-1">Category</label>
              <select
                value={editingItem.category || 'POSTERS'}
                onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded text-white"
              >
                <option value="POSTERS">🏆 TOURNAMENT POSTER (Usable for Upcoming / Ongoing Events)</option>
                <option value="LAN_EVENTS">LAN EVENTS (Trophies & Tournaments)</option>
                <option value="ARENA">ARENA (Battleground Stadium & Setups)</option>
                <option value="STAGE">STAGE (Broadcasts & Casters)</option>
                <option value="COMMUNITY">COMMUNITY (Squads & Players)</option>
              </select>
            </div>

            <div>
              <label className="text-gray-300 font-bold block mb-1">Description / Intel</label>
              <textarea
                rows={2}
                placeholder="High-stakes finals poster for Erangel and Miramar qualifiers..."
                value={editingItem.description || ''}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                className="w-full px-3.5 py-2 bg-cyber-dark border border-cyber-border rounded text-white"
              />
            </div>

            <div className="pt-3 border-t border-cyber-border flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-gray-400 font-bold hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isCompressing || !editingItem.image_url}
                className="btn-cyber-primary px-5 py-2 rounded font-bold uppercase disabled:opacity-50"
              >
                Save to Gallery & Posters
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
