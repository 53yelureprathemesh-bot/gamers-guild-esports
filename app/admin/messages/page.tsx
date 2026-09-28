'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  MessageSquare, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  ExternalLink, 
  RefreshCw, 
  Phone, 
  User, 
  Tag, 
  Send,
  Eye,
  Check,
  X,
  Copy
} from 'lucide-react';
import { ContactMessage } from '@/lib/types';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'UNREAD' | 'READ' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState<string>('');
  const [notice, setNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('gg_admin_token') || '' : '';
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data?type=contact-messages', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMessages(data.data);
      }
    } catch (e) {
      console.warn('Failed to load contact messages:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'UNREAD' | 'READ' | 'RESOLVED', notes?: string) => {
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'update-contact-message-status',
          payload: { id, status, notes: notes !== undefined ? notes : selectedMessage?.admin_notes }
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, status, admin_notes: notes !== undefined ? notes : m.admin_notes } : m));
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(prev => prev ? { ...prev, status, admin_notes: notes !== undefined ? notes : prev.admin_notes } : null);
        }
        setNotice(`Message marked as ${status}!`);
        setTimeout(() => setNotice(null), 3000);
      }
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this transmitted message?')) return;
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'delete-contact-message',
          payload: { id }
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => prev.filter(m => m.id !== id));
        if (selectedMessage?.id === id) setSelectedMessage(null);
        setNotice('Message deleted successfully.');
        setTimeout(() => setNotice(null), 3000);
      }
    } catch (err: any) {
      alert('Error deleting message: ' + err.message);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openMessageModal = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setAdminNoteInput(msg.admin_notes || '');
    if (msg.status === 'UNREAD') {
      handleUpdateStatus(msg.id, 'READ');
    }
  };

  // Filter messages
  const filteredMessages = messages.filter(msg => {
    const matchesStatus = filterStatus === 'ALL' || msg.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || 
      msg.name.toLowerCase().includes(q) ||
      msg.email.toLowerCase().includes(q) ||
      msg.subject.toLowerCase().includes(q) ||
      msg.message.toLowerCase().includes(q) ||
      (msg.phone && msg.phone.toLowerCase().includes(q));
    return matchesStatus && matchesQuery;
  });

  const unreadCount = messages.filter(m => m.status === 'UNREAD').length;
  const resolvedCount = messages.filter(m => m.status === 'RESOLVED').length;

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Top Banner Notice */}
      {notice && (
        <div className="p-3.5 bg-neon-emerald/20 border border-neon-emerald rounded-xl text-neon-emerald text-xs font-mono font-bold flex items-center justify-between animate-fade-in shadow-hud">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-neon-emerald" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-neon-emerald hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-[11px] font-mono font-bold uppercase tracking-wider mb-1.5">
            <Mail className="w-3.5 h-3.5" />
            <span>COMMUNICATION RELAY DESK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase tracking-wide">
            TRANSMITTED USER MESSAGES
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Real-time inquiries, dispute appeals, and partnership proposals transmitted through the public Contact page.
          </p>
        </div>

        <button
          onClick={fetchMessages}
          disabled={loading}
          className="btn-cyber-secondary px-4 py-2.5 rounded-lg text-xs font-mono font-bold uppercase flex items-center space-x-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-neon-cyan ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH INBOX</span>
        </button>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-hud p-4 rounded-xl border border-cyber-border">
          <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">TOTAL INBOX</div>
          <div className="text-2xl font-black text-white font-mono mt-1">{messages.length}</div>
          <div className="text-[10px] font-mono text-gray-500 mt-0.5">Transmitted tickets</div>
        </div>

        <div className={`glass-hud p-4 rounded-xl border ${unreadCount > 0 ? 'border-neon-red/60 bg-neon-red/5' : 'border-cyber-border'}`}>
          <div className="text-[11px] font-mono text-neon-red uppercase tracking-wider flex items-center space-x-1.5">
            {unreadCount > 0 && <span className="w-2 h-2 rounded-full bg-neon-red animate-ping" />}
            <span>UNREAD TICKETS</span>
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">{unreadCount}</div>
          <div className="text-[10px] font-mono text-gray-400 mt-0.5">Require staff attention</div>
        </div>

        <div className="glass-hud p-4 rounded-xl border border-neon-cyan/40">
          <div className="text-[11px] font-mono text-neon-cyan uppercase tracking-wider">IN REVIEW</div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {messages.filter(m => m.status === 'READ').length}
          </div>
          <div className="text-[10px] font-mono text-gray-400 mt-0.5">Under investigation</div>
        </div>

        <div className="glass-hud p-4 rounded-xl border border-neon-emerald/40">
          <div className="text-[11px] font-mono text-neon-emerald uppercase tracking-wider">RESOLVED</div>
          <div className="text-2xl font-black text-white font-mono mt-1">{resolvedCount}</div>
          <div className="text-[10px] font-mono text-gray-400 mt-0.5">Successfully handled</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-hud p-4 rounded-xl border border-cyber-border flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL', 'UNREAD', 'READ', 'RESOLVED'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                filterStatus === st 
                  ? 'bg-neon-cyan text-cyber-black shadow-[0_0_12px_rgba(0,242,254,0.3)]' 
                  : 'bg-cyber-dark text-gray-300 hover:text-white border border-cyber-border'
              }`}
            >
              {st} {st === 'UNREAD' && unreadCount > 0 && `(${unreadCount})`}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by sender, email, subject, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-cyan"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs font-mono"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="glass-hud p-12 text-center rounded-xl border border-cyber-border">
          <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <div className="text-xs font-mono text-gray-300 uppercase tracking-wider">CONNECTING TO TRANSMISSION DATABASE...</div>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="glass-hud p-12 text-center rounded-xl border border-cyber-border space-y-3">
          <Mail className="w-12 h-12 text-gray-600 mx-auto" />
          <div className="text-sm font-mono font-bold text-white uppercase tracking-wider">
            {messages.length === 0 ? 'NO TRANSMITTED MESSAGES YET' : 'NO MESSAGES MATCH YOUR SEARCH FILTER'}
          </div>
          <p className="text-xs font-mono text-gray-400 max-w-md mx-auto">
            {messages.length === 0
              ? 'When players or sponsors fill out the Contact form on your website and click "Transmit Message", their transmissions will appear here instantly.'
              : 'Try clearing your search query or selecting a different status filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`glass-hud p-4 sm:p-5 rounded-xl border transition-all ${
                msg.status === 'UNREAD' 
                  ? 'border-neon-red/50 bg-neon-red/5 hover:border-neon-red' 
                  : msg.status === 'RESOLVED'
                  ? 'border-neon-emerald/30 bg-neon-emerald/5 hover:border-neon-emerald/50'
                  : 'border-cyber-border hover:border-neon-cyan/40'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Left: Sender & Metadata */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Badge */}
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      msg.status === 'UNREAD'
                        ? 'bg-neon-red/20 text-neon-red border border-neon-red/40'
                        : msg.status === 'RESOLVED'
                        ? 'bg-neon-emerald/20 text-neon-emerald border border-neon-emerald/40'
                        : 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40'
                    }`}>
                      {msg.status}
                    </span>

                    {/* Subject Category */}
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-cyber-dark text-gray-200 border border-cyber-border font-bold">
                      {msg.subject}
                    </span>

                    {/* Date Time */}
                    <span className="text-[11px] font-mono text-gray-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(msg.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                    </span>
                  </div>

                  {/* Sender Profile */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono pt-1">
                    <span className="text-white font-bold flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-neon-cyan" />
                      <span>{msg.name}</span>
                    </span>

                    <span className="text-gray-300 flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span>{msg.email}</span>
                      <button 
                        onClick={() => handleCopy(msg.email, `email-${msg.id}`)}
                        className="text-gray-500 hover:text-neon-cyan ml-1"
                        title="Copy email"
                      >
                        {copiedId === `email-${msg.id}` ? <Check className="w-3 h-3 text-neon-emerald" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </span>

                    {msg.phone && (
                      <span className="text-gray-300 flex items-center space-x-1">
                        <Phone className="w-3.5 h-3.5 text-neon-emerald" />
                        <span>{msg.phone}</span>
                      </span>
                    )}
                  </div>

                  {/* Message Preview */}
                  <div className="text-xs font-mono text-gray-300 line-clamp-2 pt-1 bg-cyber-dark/40 p-2.5 rounded border border-cyber-border/40">
                    {msg.message}
                  </div>

                  {/* Admin notes snippet if present */}
                  {msg.admin_notes && (
                    <div className="text-[11px] font-mono text-neon-gold bg-neon-gold/10 px-2 py-1 rounded border border-neon-gold/30">
                      <strong>Admin Note:</strong> {msg.admin_notes}
                    </div>
                  )}
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center flex-wrap gap-2 lg:flex-col lg:items-end justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-cyber-border">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => openMessageModal(msg)}
                      className="px-3 py-1.5 rounded bg-cyber-dark hover:bg-neon-cyan/20 border border-cyber-border text-white hover:text-neon-cyan text-xs font-mono font-bold flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>VIEW FULL</span>
                    </button>

                    <a
                      href={`mailto:${msg.email}?subject=Re: [Gamers Guild Esports] ${encodeURIComponent(msg.subject)}`}
                      className="px-3 py-1.5 rounded bg-neon-emerald/20 hover:bg-neon-emerald/30 border border-neon-emerald/50 text-neon-emerald text-xs font-mono font-bold flex items-center space-x-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>REPLY</span>
                    </a>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {msg.status !== 'RESOLVED' ? (
                      <button
                        onClick={() => handleUpdateStatus(msg.id, 'RESOLVED')}
                        className="px-2.5 py-1 rounded bg-cyber-dark hover:bg-neon-emerald/20 border border-cyber-border text-gray-300 hover:text-neon-emerald text-[11px] font-mono font-semibold"
                        title="Mark as Resolved"
                      >
                        ✓ RESOLVE
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(msg.id, 'READ')}
                        className="px-2.5 py-1 rounded bg-cyber-dark hover:bg-neon-cyan/20 border border-cyber-border text-gray-300 hover:text-neon-cyan text-[11px] font-mono font-semibold"
                        title="Reopen ticket"
                      >
                        REOPEN
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="p-1.5 rounded bg-cyber-dark hover:bg-neon-red/20 border border-cyber-border text-gray-400 hover:text-neon-red"
                      title="Delete transmission"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL TRANSMISSION DETAIL MODAL */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-hud w-full max-w-2xl rounded-2xl border border-neon-cyan/50 p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-cyber-border pb-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    selectedMessage.status === 'UNREAD'
                      ? 'bg-neon-red/20 text-neon-red border border-neon-red/40'
                      : selectedMessage.status === 'RESOLVED'
                      ? 'bg-neon-emerald/20 text-neon-emerald border border-neon-emerald/40'
                      : 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40'
                  }`}>
                    {selectedMessage.status}
                  </span>
                  <span className="text-xs font-mono text-neon-cyan font-bold">
                    {selectedMessage.subject}
                  </span>
                </div>
                <h2 className="text-lg font-black text-white font-mono uppercase">
                  TRANSMISSION #{selectedMessage.id.slice(-6)}
                </h2>
                <p className="text-xs font-mono text-gray-400">
                  Received on {new Date(selectedMessage.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </p>
              </div>

              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-cyber-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sender Information Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-cyber-dark/80 border border-cyber-border text-xs font-mono">
              <div>
                <span className="text-gray-400 block text-[11px]">SENDER NAME</span>
                <span className="text-white font-bold text-sm">{selectedMessage.name}</span>
              </div>

              <div>
                <span className="text-gray-400 block text-[11px]">SENDER EMAIL</span>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <a href={`mailto:${selectedMessage.email}`} className="text-neon-cyan hover:underline font-bold">
                    {selectedMessage.email}
                  </a>
                  <button 
                    onClick={() => handleCopy(selectedMessage.email, 'modal-email')}
                    className="text-gray-400 hover:text-white"
                  >
                    {copiedId === 'modal-email' ? <Check className="w-3.5 h-3.5 text-neon-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {selectedMessage.phone && (
                <div>
                  <span className="text-gray-400 block text-[11px]">PHONE / WHATSAPP</span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-white font-bold">{selectedMessage.phone}</span>
                    <a
                      href={`https://wa.me/${selectedMessage.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] px-2 py-0.5 rounded bg-neon-emerald/20 text-neon-emerald border border-neon-emerald/40 hover:underline"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              )}

              <div>
                <span className="text-gray-400 block text-[11px]">SUBJECT CATEGORY</span>
                <span className="text-neon-gold font-bold">{selectedMessage.subject}</span>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="text-xs font-mono font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                Full Transmission Text:
              </label>
              <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border text-xs font-mono text-white leading-relaxed whitespace-pre-wrap selection:bg-neon-cyan selection:text-black">
                {selectedMessage.message}
              </div>
            </div>

            {/* Admin Resolution Notes */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-gray-300 block uppercase tracking-wider">
                Internal Admin Notes & Action Taken
              </label>
              <textarea
                rows={2}
                placeholder="Add internal resolution details, ticket status, or reply notes..."
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-cyan"
              />
              <button
                onClick={() => handleUpdateStatus(selectedMessage.id, selectedMessage.status, adminNoteInput)}
                className="px-3 py-1.5 rounded bg-cyber-dark hover:bg-neon-cyan/20 border border-cyber-border text-xs font-mono font-bold text-white hover:text-neon-cyan"
              >
                SAVE ADMIN NOTE
              </button>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-cyber-border">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                {selectedMessage.status !== 'RESOLVED' ? (
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.id, 'RESOLVED')}
                    className="btn-cyber-primary px-4 py-2 text-xs font-mono font-bold uppercase flex-1 sm:flex-initial"
                  >
                    ✓ MARK AS RESOLVED
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.id, 'READ')}
                    className="btn-cyber-secondary px-4 py-2 text-xs font-mono font-bold uppercase flex-1 sm:flex-initial"
                  >
                    REOPEN TICKET
                  </button>
                )}

                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="px-3 py-2 rounded bg-neon-red/20 border border-neon-red/50 text-neon-red hover:bg-neon-red hover:text-black text-xs font-mono font-bold"
                >
                  DELETE
                </button>
              </div>

              <a
                href={`mailto:${selectedMessage.email}?subject=Re: [Gamers Guild Esports] ${encodeURIComponent(selectedMessage.subject)}`}
                className="btn-cyber-primary px-6 py-2 text-xs font-mono font-black uppercase flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <Send className="w-3.5 h-3.5 text-cyber-black" />
                <span>EMAIL SENDER NOW</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
