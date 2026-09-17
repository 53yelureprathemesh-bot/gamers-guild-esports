'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Calendar, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Flame, 
  Eye, 
  Trophy, 
  Users, 
  Clock, 
  MapPin, 
  X
} from 'lucide-react';
import { Event, EventStatus, EventMode } from '@/lib/types';
import { INITIAL_EVENTS } from '@/lib/dataStore';

export default function AdminUpcomingEventsPage() {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchEvents = () => {
    fetch('/api/admin/data?type=events')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) setEvents(res.data);
      })
      .catch(() => console.log('Using initial events.'));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenAdd = () => {
    setEditingEvent({
      title: '',
      game: 'BGMI (Battlegrounds Mobile India)',
      poster_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      date: '2026-11-20',
      time: '06:00 PM IST',
      venue: 'Online Custom Rooms',
      mode: 'ONLINE',
      prize_pool: '₹50,000',
      entry_fee: 'FREE ENTRY',
      registration_deadline: '2026-11-18 23:59:59',
      total_slots: 100,
      filled_slots: 0,
      description: '',
      rules: [
        'All team members must have minimum level 35 account.',
        'No emulators, triggers, or iPads allowed.',
        'POV recording required for top 3 squads.'
      ],
      status: 'UPCOMING',
      is_published: true
    });
    setIsNew(true);
  };

  const handleSave = async () => {
    if (!editingEvent || !editingEvent.title) {
      alert('Event title is required.');
      return;
    }

    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-event',
          payload: editingEvent
        })
      });
      const data = await res.json();
      if (data.success) {
        setNotice('Tournament event successfully saved!');
        fetchEvents();
        setEditingEvent(null);
        setTimeout(() => setNotice(null), 3500);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tournament?')) return;
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-event',
          payload: { id }
        })
      });
      const data = await res.json();
      if (data.success) {
        setEvents(events.filter(e => e.id !== id));
        setNotice('Tournament deleted.');
        setTimeout(() => setNotice(null), 3000);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-mono uppercase">
            TOURNAMENT & EVENT MANAGEMENT
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            Configure posters, prize pools, slots, schedules, and transition events between stages.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-cyber-primary px-5 py-2.5 rounded text-xs font-mono font-bold uppercase flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-cyber-black" />
          <span>CREATE NEW TOURNAMENT</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-neon-emerald/20 border border-neon-emerald/50 text-xs font-mono text-neon-emerald flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* Events Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="glass-panel rounded-xl overflow-hidden border border-cyber-border flex flex-col justify-between"
          >
            <div className="relative h-44 w-full bg-cyber-dark">
              <Image
                src={event.poster_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'}
                alt={event.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-cyber-black/80 text-[10px] font-mono text-neon-cyan font-bold uppercase">
                {event.game}
              </div>
              <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                event.status === 'ONGOING' ? 'bg-neon-red text-black animate-pulse' :
                event.status === 'COMPLETED' ? 'bg-gray-700 text-gray-300' :
                'bg-neon-emerald/20 text-neon-emerald border border-neon-emerald/40'
              }`}>
                {event.status}
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-sm font-black text-white font-mono">{event.title}</h3>
                <div className="mt-2 text-xs font-mono text-gray-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Prize Pool:</span>
                    <span className="text-neon-gold font-bold">{event.prize_pool}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date:</span>
                    <span>{event.date} ({event.time})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Slots:</span>
                    <span className="text-neon-emerald font-bold">{event.filled_slots} / {event.total_slots}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-cyber-border flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-400">
                  {event.is_published ? '🟢 Published' : '⚪ Draft Hidden'}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => { setEditingEvent(event); setIsNew(false); }}
                    className="p-1.5 rounded bg-cyber-dark hover:bg-neon-cyan/20 text-gray-300 hover:text-neon-cyan border border-cyber-border"
                    title="Edit Tournament"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-1.5 rounded bg-cyber-dark hover:bg-neon-red/20 text-gray-300 hover:text-neon-red border border-cyber-border"
                    title="Delete Tournament"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT / CREATE MODAL */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-hud p-6 sm:p-8 rounded-2xl border-2 border-neon-cyan/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b border-cyber-border pb-3">
              <h3 className="text-lg font-black text-white font-mono uppercase">
                {isNew ? 'CREATE NEW TOURNAMENT EVENT' : 'EDIT TOURNAMENT SETTINGS'}
              </h3>
              <button onClick={() => setEditingEvent(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-gray-300 font-bold block mb-1">Tournament Title *</label>
                <input
                  type="text"
                  value={editingEvent.title || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-white"
                  placeholder="NEURAL NEXUS 2K26 — BGMI CHAMPIONSHIP"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 font-bold block mb-1">Competitive Game Title</label>
                  <input
                    type="text"
                    value={editingEvent.game || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, game: e.target.value })}
                    className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-bold block mb-1">Tournament Status</label>
                  <select
                    value={editingEvent.status || 'UPCOMING'}
                    onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value as EventStatus })}
                    className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-white"
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="ONGOING">ONGOING (LIVE)</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-300 font-bold block mb-1">Prize Pool</label>
                  <input
                    type="text"
                    value={editingEvent.prize_pool || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, prize_pool: e.target.value })}
                    className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-white"
                    placeholder="₹50,000"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-bold block mb-1">Entry Fee</label>
                  <input
                    type="text"
                    value={editingEvent.entry_fee || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, entry_fee: e.target.value })}
                    className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-white"
                    placeholder="FREE ENTRY / ₹500"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-bold block mb-1">Event Date</label>
                  <input
                    type="date"
                    value={editingEvent.date || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-bold block mb-1">Event Time</label>
                  <input
                    type="text"
                    value={editingEvent.time || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                    className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-white"
                    placeholder="05:00 PM IST"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-bold block mb-1">Tournament Mode</label>
                  <select
                    value={editingEvent.mode || 'ONLINE'}
                    onChange={(e) => setEditingEvent({ ...editingEvent, mode: e.target.value as EventMode })}
                    className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-white"
                  >
                    <option value="ONLINE">ONLINE</option>
                    <option value="OFFLINE">OFFLINE (LAN)</option>
                    <option value="HYBRID">HYBRID</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-300 font-bold block mb-1">Total Team Slots</label>
                  <input
                    type="number"
                    value={editingEvent.total_slots || 100}
                    onChange={(e) => setEditingEvent({ ...editingEvent, total_slots: parseInt(e.target.value) || 100 })}
                    className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-300 font-bold block mb-1">Venue / Server Details</label>
                <input
                  type="text"
                  value={editingEvent.venue || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                  className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-gray-300 font-bold block mb-1">Poster Image URL</label>
                <input
                  type="text"
                  value={editingEvent.poster_url || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, poster_url: e.target.value })}
                  className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-gray-300 font-bold block mb-1">Event Description</label>
                <textarea
                  rows={3}
                  value={editingEvent.description || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-white"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="pubCheck"
                  checked={editingEvent.is_published ?? true}
                  onChange={(e) => setEditingEvent({ ...editingEvent, is_published: e.target.checked })}
                  className="w-4 h-4 rounded text-neon-emerald bg-cyber-dark border-cyber-border"
                />
                <label htmlFor="pubCheck" className="text-gray-300">
                  Visible to Public on Website
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-cyber-border flex justify-end space-x-3">
              <button
                onClick={() => setEditingEvent(null)}
                className="px-4 py-2 text-xs font-mono font-bold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-cyber-primary px-5 py-2 rounded text-xs font-mono font-bold uppercase"
              >
                Save Event
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
