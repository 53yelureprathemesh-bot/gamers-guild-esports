'use client';

import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Trophy, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  CheckCircle2, 
  Play, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Event, PointsTableEntry, TournamentMatch } from '@/lib/types';
import { INITIAL_EVENTS, INITIAL_POINTS_TABLE, INITIAL_MATCHES } from '@/lib/dataStore';

export default function AdminOngoingEventsPage() {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState<string>('evt-002');
  const [pointsTable, setPointsTable] = useState<PointsTableEntry[]>(INITIAL_POINTS_TABLE);
  const [matches, setMatches] = useState<TournamentMatch[]>(INITIAL_MATCHES);
  const [notice, setNotice] = useState<string | null>(null);

  // New Points Row State
  const [editingRow, setEditingRow] = useState<Partial<PointsTableEntry> | null>(null);

  // Live Stream State
  const currentEvent = events.find(e => e.id === selectedEventId) || events[0];
  const [streamUrl, setStreamUrl] = useState('');
  const [isStreamLive, setIsStreamLive] = useState(true);
  const [savingStream, setSavingStream] = useState(false);

  useEffect(() => {
    if (currentEvent) {
      setStreamUrl(currentEvent.stream_url || '');
      setIsStreamLive(currentEvent.is_stream_live ?? true);
    }
  }, [selectedEventId, currentEvent]);

  const handleSaveStream = async () => {
    setSavingStream(true);
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-stream-url',
          payload: {
            eventId: selectedEventId,
            streamUrl: streamUrl,
            isLive: isStreamLive
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setNotice('YouTube Live Stream broadcast link updated successfully!');
        setEvents(prev => prev.map(ev => ev.id === selectedEventId ? { ...ev, stream_url: streamUrl, is_stream_live: isStreamLive } : ev));
        setTimeout(() => setNotice(null), 3500);
      }
    } catch (err: any) {
      alert('Error updating stream: ' + err.message);
    } finally {
      setSavingStream(false);
    }
  };

  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const fetchCurrentPoints = () => {
    fetch(`/api/admin/data?type=points-table&eventId=${selectedEventId}`)
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data?.length) setPointsTable(res.data);
      })
      .catch(() => console.log('Using initial points.'));
  };

  useEffect(() => {
    fetchCurrentPoints();
  }, [selectedEventId]);

  const ongoingEvents = events.filter(e => e.status === 'ONGOING');

  const handleSaveRow = async () => {
    if (!editingRow || !editingRow.team_name) {
      alert('Team name is required.');
      return;
    }

    const calculatedTotal = (editingRow.placement_points || 0) + (editingRow.kill_points || 0);

    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-points-entry',
          payload: {
            ...editingRow,
            event_id: selectedEventId,
            total_points: calculatedTotal
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setNotice('Leaderboard standings updated!');
        fetchCurrentPoints();
        setEditingRow(null);
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
          <h1 className="text-2xl font-black text-white font-mono uppercase flex items-center space-x-2">
            <Radio className="w-6 h-6 text-neon-red animate-pulse" />
            <span>LIVE STAGE & POINTS TABLE MANAGER</span>
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            Directly update broadcast rounds, live match rooms, and tournament points tables.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white"
          >
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.title} ({ev.status})</option>
            ))}
          </select>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-neon-emerald/20 border border-neon-emerald/50 text-xs font-mono text-neon-emerald flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* YOUTUBE LIVE STREAM BROADCAST CONTROLLER */}
      <div className="glass-hud p-6 rounded-2xl border-2 border-neon-red/40 space-y-4 shadow-hud">
        <div className="flex items-center justify-between border-b border-cyber-border pb-3">
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-neon-red animate-pulse" />
            <h2 className="text-base font-black text-white font-mono uppercase">
              YOUTUBE LIVE STREAM BROADCAST CONTROLLER
            </h2>
          </div>
          <span className="text-xs font-mono text-gray-400">
            Selected: <strong className="text-white">{currentEvent?.title}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-gray-300">
                YouTube Live Stream URL / Video Link
              </label>
              <input
                type="url"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/..."
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-cyan"
              />
              <p className="text-[10px] font-mono text-gray-400">
                Paste any YouTube Live stream link, standard watch link, or youtu.be short URL.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-cyber-dark/80 border border-cyber-border">
              <div>
                <span className="text-xs font-mono font-bold text-white block">Broadcast Player Status</span>
                <span className="text-[11px] font-mono text-gray-400">Enable live video stream on public Ongoing Events page</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isStreamLive}
                  onChange={(e) => setIsStreamLive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-red"></div>
              </label>
            </div>

            <button
              onClick={handleSaveStream}
              disabled={savingStream}
              className="btn-cyber-primary w-full py-2.5 rounded-lg text-xs font-black font-mono uppercase flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4 text-cyber-black" />
              <span>{savingStream ? 'UPDATING BROADCAST...' : 'SAVE & BROADCAST YOUTUBE STREAM'}</span>
            </button>
          </div>

          {/* Embed Preview */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-gray-400">
              Live Stream Preview (As Displayed on Public Website):
            </label>
            {getYouTubeVideoId(streamUrl) ? (
              <div className="relative w-full pb-[56.25%] rounded-xl overflow-hidden bg-black border border-cyber-border">
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(streamUrl)}`}
                  title="YouTube Preview"
                  className="absolute top-0 left-0 w-full h-full border-0"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="h-44 rounded-xl border-2 border-dashed border-cyber-border flex flex-col items-center justify-center p-4 text-center text-gray-500 font-mono text-xs">
                <Radio className="w-8 h-8 text-gray-600 mb-2" />
                <span>Paste a valid YouTube link to preview the live broadcast player.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Points Table Console */}
      <div className="glass-panel p-6 rounded-2xl border border-cyber-border space-y-4">
        <div className="flex justify-between items-center border-b border-cyber-border pb-3">
          <h2 className="text-base font-black text-white font-mono uppercase flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-neon-gold" />
            <span>LIVE POINTS TABLE ({pointsTable.length} TEAMS)</span>
          </h2>
          <button
            onClick={() => setEditingRow({
              rank: pointsTable.length + 1,
              team_name: '',
              matches_played: 1,
              wwcd: 0,
              placement_points: 0,
              kill_points: 0,
              total_points: 0
            })}
            className="btn-cyber-primary px-3 py-1.5 rounded text-xs font-mono font-bold uppercase flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5 text-cyber-black" />
            <span>Add Team Score</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-cyber-border text-gray-400 uppercase bg-cyber-dark/60">
                <th className="py-2.5 px-3">RANK</th>
                <th className="py-2.5 px-3">TEAM NAME</th>
                <th className="py-2.5 px-3 text-center">MATCHES</th>
                <th className="py-2.5 px-3 text-center">WWCD</th>
                <th className="py-2.5 px-3 text-center">PLACEMENT PTS</th>
                <th className="py-2.5 px-3 text-center">KILL PTS</th>
                <th className="py-2.5 px-3 text-right">TOTAL PTS</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border">
              {pointsTable.map((row) => (
                <tr key={row.id} className="hover:bg-white/5">
                  <td className="py-3 px-3 font-bold text-neon-gold">#{row.rank}</td>
                  <td className="py-3 px-3 font-bold text-white">{row.team_name}</td>
                  <td className="py-3 px-3 text-center">{row.matches_played}</td>
                  <td className="py-3 px-3 text-center text-neon-emerald font-bold">{row.wwcd}</td>
                  <td className="py-3 px-3 text-center">{row.placement_points}</td>
                  <td className="py-3 px-3 text-center text-neon-cyan font-bold">{row.kill_points}</td>
                  <td className="py-3 px-3 text-right font-black text-neon-emerald text-sm">{row.total_points}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setEditingRow(row)}
                      className="p-1 rounded bg-cyber-dark text-gray-400 hover:text-white"
                      title="Edit Row"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT ROW MODAL */}
      {editingRow && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-hud p-6 rounded-2xl border-2 border-neon-cyan/50 max-w-md w-full space-y-4">
            <h3 className="text-base font-black text-white font-mono uppercase">
              TEAM SCORECARD ARBITER
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1">Rank</label>
                  <input
                    type="number"
                    value={editingRow.rank || 1}
                    onChange={(e) => setEditingRow({ ...editingRow, rank: parseInt(e.target.value) || 1 })}
                    className="w-full px-2.5 py-1.5 bg-cyber-dark border border-cyber-border rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Matches Played</label>
                  <input
                    type="number"
                    value={editingRow.matches_played || 0}
                    onChange={(e) => setEditingRow({ ...editingRow, matches_played: parseInt(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 bg-cyber-dark border border-cyber-border rounded text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Team Name *</label>
                <input
                  type="text"
                  value={editingRow.team_name || ''}
                  onChange={(e) => setEditingRow({ ...editingRow, team_name: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-cyber-dark border border-cyber-border rounded text-white"
                  placeholder="e.g. GODLIKE ESPORTS"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1">WWCD (Wins)</label>
                  <input
                    type="number"
                    value={editingRow.wwcd || 0}
                    onChange={(e) => setEditingRow({ ...editingRow, wwcd: parseInt(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 bg-cyber-dark border border-cyber-border rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Placement Pts</label>
                  <input
                    type="number"
                    value={editingRow.placement_points || 0}
                    onChange={(e) => setEditingRow({ ...editingRow, placement_points: parseInt(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 bg-cyber-dark border border-cyber-border rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Kill Pts</label>
                  <input
                    type="number"
                    value={editingRow.kill_points || 0}
                    onChange={(e) => setEditingRow({ ...editingRow, kill_points: parseInt(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 bg-cyber-dark border border-cyber-border rounded text-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-cyber-border flex justify-end space-x-2">
              <button
                onClick={() => setEditingRow(null)}
                className="px-4 py-2 text-xs font-mono font-bold text-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRow}
                className="btn-cyber-primary px-5 py-2 rounded text-xs font-mono font-bold uppercase"
              >
                Save Score
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
