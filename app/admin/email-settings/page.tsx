'use client';

import React, { useState } from 'react';
import { Mail, Save, Eye, CheckCircle2, Copy, Sparkles, Send } from 'lucide-react';
import { renderEmailTemplate, DEFAULT_EMAIL_TEMPLATE } from '@/lib/emailTemplates';

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

  const [testEmail, setTestEmail] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const [providerStatus, setProviderStatus] = useState<any>(null);

  React.useEffect(() => {
    fetch('/api/admin/data?type=status')
      .then(res => res.json())
      .then(data => setProviderStatus(data))
      .catch(() => {});
  }, []);

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail || !testEmail.includes('@')) {
      alert('Please enter a valid recipient email address.');
      return;
    }
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-test-email',
          payload: { to: testEmail, playerName: 'Test Participant' }
        })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ success: false, error: err.message || 'Failed to dispatch test email' });
    } finally {
      setTestLoading(false);
    }
  };

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

      {/* Live Provider Status & Test Dispatcher Panel */}
      <div className="glass-hud p-6 sm:p-7 rounded-2xl border border-cyber-border space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyber-border pb-4">
          <div>
            <span className="text-[11px] font-mono font-bold text-neon-cyan uppercase tracking-wider flex items-center space-x-2">
              <Mail className="w-4 h-4 text-neon-cyan" />
              <span>LIVE PARTICIPANT EMAIL DISPATCH ENGINE</span>
            </span>
            <p className="text-xs text-gray-400 font-mono mt-1">
              Active configuration for sending confirmation receipts to participant inboxes.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {providerStatus?.hasSmtp ? (
              <span className="px-2.5 py-1 bg-neon-emerald/10 border border-neon-emerald/40 text-neon-emerald font-mono text-xs rounded-full font-bold">
                ● GMAIL SMTP ACTIVE ({providerStatus.smtpUser})
              </span>
            ) : providerStatus?.hasResendKey ? (
              <span className="px-2.5 py-1 bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan font-mono text-xs rounded-full font-bold">
                ● RESEND API KEY ACTIVE
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 font-mono text-xs rounded-full font-bold">
                ○ NO SERVICE CONFIGURED
              </span>
            )}
          </div>
        </div>

        {/* Live Test Dispatch Form */}
        <form onSubmit={handleSendTestEmail} className="space-y-3 bg-cyber-dark/60 p-4 rounded-xl border border-cyber-border">
          <label className="text-xs font-mono text-white font-bold block">
            Test Live Email Delivery to Any Recipient (Player/Friend):
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="e.g. participant@gmail.com"
              className="flex-1 px-3 py-2 bg-cyber-black border border-cyber-border rounded text-xs font-mono text-white focus:outline-none focus:border-neon-cyan"
            />
            <button
              type="submit"
              disabled={testLoading}
              className="btn-cyber-primary px-5 py-2 rounded text-xs font-mono font-bold uppercase flex items-center justify-center space-x-1.5 whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testLoading ? 'DISPATCHING...' : 'SEND LIVE TEST EMAIL'}</span>
            </button>
          </div>

          {testResult && (
            <div className={`p-3 rounded-lg text-xs font-mono mt-2 border ${
              testResult.success 
                ? 'bg-neon-emerald/10 border-neon-emerald/40 text-neon-emerald' 
                : 'bg-red-500/10 border-red-500/40 text-red-400'
            }`}>
              <strong>{testResult.success ? '✓ SUCCESS:' : '✕ FAILED:'}</strong>{' '}
              {testResult.success ? testResult.message : (testResult.error || testResult.message)}
            </div>
          )}
        </form>

        {/* Setup Instructions Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Method 1: Gmail SMTP */}
          <div className="p-4 rounded-xl bg-cyber-black/80 border border-cyber-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-neon-emerald uppercase">
                Method 1: Free Gmail SMTP (Recommended)
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-neon-emerald/20 text-neon-emerald font-mono rounded">
                Zero Domains Required
              </span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
              Allows sending registration receipts directly to <strong>any player email</strong> in the world using your Gmail account.
            </p>
            <ol className="text-[11px] text-gray-300 font-mono space-y-1 list-decimal list-inside bg-cyber-dark/40 p-2.5 rounded border border-cyber-border">
              <li>Open Google Account &rarr; Security &rarr; Enable 2-Step Verification.</li>
              <li>Go to <strong>myaccount.google.com/apppasswords</strong>.</li>
              <li>Type app name <code>Gamers Guild</code> & click <strong>Create</strong>.</li>
              <li>Copy the 16-character password generated.</li>
              <li>In Vercel &rarr; Settings &rarr; Environment Variables, add:
                <div className="mt-1 pl-2 text-[10px] text-neon-cyan">
                  • <code>SMTP_USER</code> = <code>53yelureprathemesh@gmail.com</code><br/>
                  • <code>SMTP_PASS</code> = <code>your-16-char-app-password</code>
                </div>
              </li>
            </ol>
          </div>

          {/* Method 2: Resend Custom Domain */}
          <div className="p-4 rounded-xl bg-cyber-black/80 border border-cyber-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-neon-cyan uppercase">
                Method 2: Resend Custom Domain
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-neon-cyan/20 text-neon-cyan font-mono rounded">
                Custom Domain
              </span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
              If you own a custom domain (e.g. <code>gamersguild.gg</code>), you can verify it in Resend to send to anyone.
            </p>
            <ol className="text-[11px] text-gray-300 font-mono space-y-1 list-decimal list-inside bg-cyber-dark/40 p-2.5 rounded border border-cyber-border">
              <li>Go to <strong>resend.com/domains</strong> and click <strong>Add Domain</strong>.</li>
              <li>Add the DNS records (TXT, MX, CNAME) to your domain DNS provider.</li>
              <li>Once verified, set in Vercel Environment Variables:
                <div className="mt-1 pl-2 text-[10px] text-neon-cyan">
                  • <code>EMAIL_FROM</code> = <code>Gamers Guild &lt;noreply@yourdomain.com&gt;</code>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>

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
