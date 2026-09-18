'use client';

import React from 'react';
import Image from 'next/image';
import { Printer, CheckCircle2 } from 'lucide-react';

export interface PrintableReceiptProps {
  publicCode: string;
  playerName: string;
  inGameName: string;
  playerUid: string;
  teamName: string;
  game: string;
  eventName: string;
  state: string;
  district: string;
  phone: string;
  email: string;
  status: string;
  date: string;
}

export default function PrintableReceipt({ data }: { data: PrintableReceiptProps }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* SCREEN VIEW (Futuristic Cyber HUD Card) */}
      <div className="glass-hud rounded-2xl border-2 border-neon-cyan/50 p-6 sm:p-8 text-center shadow-hud relative screen-only">
        <div className="w-14 h-14 rounded-full bg-neon-emerald/20 border-2 border-neon-emerald flex items-center justify-center mx-auto mb-3 text-neon-emerald">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-[11px] font-mono text-neon-emerald font-bold tracking-widest uppercase">
          REGISTRATION RECORD CONFIRMED
        </span>

        {/* REGISTRATION CODE CARD */}
        <div className="my-5 p-5 rounded-xl bg-cyber-dark/90 border-2 border-neon-cyan text-center shadow-neon-cyan">
          <span className="text-[10px] font-mono uppercase text-gray-400 font-bold tracking-widest block">
            OFFICIAL STATE REGISTRATION NUMBER
          </span>
          <div className="text-4xl sm:text-5xl font-black text-neon-cyan font-mono tracking-widest my-1.5">
            #{data.publicCode}
          </div>
          <span className="text-[11px] font-mono text-neon-emerald font-bold">
            State Circuit: {data.state}
          </span>
        </div>

        {/* SUMMARY GRID */}
        <div className="bg-cyber-black/70 rounded-xl p-4 sm:p-5 border border-cyber-border text-left text-xs font-mono space-y-2.5">
          <div className="flex justify-between border-b border-cyber-border pb-2">
            <span className="text-gray-400">Player Legal Name:</span>
            <span className="text-white font-bold">{data.playerName}</span>
          </div>
          <div className="flex justify-between border-b border-cyber-border pb-2">
            <span className="text-gray-400">In-Game Name (IGN):</span>
            <span className="text-neon-cyan font-bold">{data.inGameName}</span>
          </div>
          <div className="flex justify-between border-b border-cyber-border pb-2">
            <span className="text-gray-400">Character UID:</span>
            <span className="text-white font-mono font-bold tracking-wider">{data.playerUid}</span>
          </div>
          <div className="flex justify-between border-b border-cyber-border pb-2">
            <span className="text-gray-400">Team / Squad Name:</span>
            <span className="text-white font-bold">{data.teamName}</span>
          </div>
          <div className="flex justify-between border-b border-cyber-border pb-2">
            <span className="text-gray-400">Game / Discipline:</span>
            <span className="text-neon-gold font-bold">{data.game}</span>
          </div>
          <div className="flex justify-between border-b border-cyber-border pb-2">
            <span className="text-gray-400">Tournament:</span>
            <span className="text-gray-200 truncate max-w-[220px]">{data.eventName}</span>
          </div>
          <div className="flex justify-between border-b border-cyber-border pb-2">
            <span className="text-gray-400">Region:</span>
            <span className="text-gray-300">{data.district}, {data.state}</span>
          </div>
          <div className="flex justify-between border-b border-cyber-border pb-2">
            <span className="text-gray-400">Verification Status:</span>
            <span className="text-neon-gold font-bold">{data.status}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-gray-400">Submission Date:</span>
            <span className="text-gray-300">{data.date}</span>
          </div>
        </div>

        {/* PRINT BUTTON */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handlePrint}
            type="button"
            className="btn-cyber-primary px-6 py-3 rounded-lg text-xs font-black font-mono uppercase flex items-center justify-center space-x-2"
          >
            <Printer className="w-4 h-4 text-cyber-black" />
            <span>PRINT / DOWNLOAD 1-PAGE RECEIPT (PDF)</span>
          </button>
        </div>
      </div>

      {/* DEDICATED PRINT RECEIPT (FITS 100% ON SINGLE A4 SHEET) */}
      <div id="printable-receipt" className="print-only">
        <div className="w-full max-w-[760px] mx-auto p-6 bg-white text-black font-sans border-2 border-black rounded-lg">
          
          {/* HEADER BAR */}
          <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 relative flex-shrink-0 flex items-center justify-center p-1 border border-black rounded">
                <Image
                  src="/images/logo.png"
                  alt="Gamers Guild Logo"
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-wider text-black uppercase font-mono leading-tight">
                  GAMERS GUILD ESPORTS
                </h1>
                <p className="text-[10px] tracking-widest text-gray-700 uppercase font-mono font-bold">
                  OFFICIAL TOURNAMENT REGISTRATION RECEIPT
                </p>
                <p className="text-[9px] text-gray-500">
                  Arena &bull; Nagpur, Maharashtra, India &bull; support@gamersguild.gg
                </p>
              </div>
            </div>

            {/* LARGE REGISTRATION BADGE */}
            <div className="text-right border-2 border-black rounded px-3 py-1.5 bg-gray-50">
              <span className="text-[9px] font-mono font-bold tracking-widest text-gray-600 block uppercase">
                REGISTRATION NUMBER
              </span>
              <span className="text-2xl font-black font-mono tracking-widest text-black block">
                #{data.publicCode}
              </span>
              <span className="text-[9px] font-mono font-bold text-gray-600 block">
                CIRCUIT: {data.state.toUpperCase()}
              </span>
            </div>
          </div>

          {/* STATUS RIBBON */}
          <div className="flex items-center justify-between bg-gray-100 border border-black rounded px-3 py-2 mb-4 text-xs font-mono">
            <div>
              <span className="text-gray-600 font-bold">EVENT: </span>
              <span className="font-black text-black">{data.eventName}</span>
            </div>
            <div>
              <span className="text-gray-600 font-bold">STATUS: </span>
              <span className="px-2 py-0.5 rounded font-black border border-black text-[10px] bg-white text-black">
                {data.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* TWO-COLUMN DETAILS TABLE */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-xs font-mono">
            
            {/* COLUMN 1: PLAYER DETAILS */}
            <div className="border border-black rounded p-3 space-y-2">
              <div className="font-bold text-[11px] border-b border-black pb-1 uppercase tracking-wider text-gray-700">
                1. PLAYER CREDENTIALS
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Legal Name:</span>
                <span className="font-bold text-black">{data.playerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-bold text-black">{data.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-bold text-black text-[11px] truncate max-w-[160px]">{data.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">State / Region:</span>
                <span className="font-bold text-black">{data.state}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">District:</span>
                <span className="font-bold text-black">{data.district}</span>
              </div>
            </div>

            {/* COLUMN 2: GAMING & ROSTER DETAILS */}
            <div className="border border-black rounded p-3 space-y-2">
              <div className="font-bold text-[11px] border-b border-black pb-1 uppercase tracking-wider text-gray-700">
                2. ROSTER & CHARACTER
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Team / Squad:</span>
                <span className="font-black text-black">{data.teamName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">In-Game Name:</span>
                <span className="font-bold text-black">{data.inGameName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Character UID:</span>
                <span className="font-black text-black tracking-wider text-sm">{data.playerUid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discipline / Game:</span>
                <span className="font-bold text-black">{data.game}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Timestamp:</span>
                <span className="text-gray-700 text-[10px]">{data.date}</span>
              </div>
            </div>

          </div>

          {/* SECURITY & RULES BOX */}
          <div className="border border-black rounded p-3 mb-4 bg-gray-50 text-[10px] font-mono leading-relaxed space-y-1">
            <div className="font-bold uppercase tracking-wider text-black">
              IMPORTANT INSTRUCTIONS FOR PLAYERS & SQUADS:
            </div>
            <ul className="list-disc pl-4 space-y-0.5 text-gray-700">
              <li>Retain this official registration receipt for custom room entry and bracket check-in.</li>
              <li>Official Room ID and Password will be sent to your registered phone/email 30 minutes before match time.</li>
              <li>Only the verified Character UID (<strong>{data.playerUid}</strong>) will be allowed into the official tournament lobby.</li>
              <li>Any form of hacking, third-party plugins, or account sharing results in immediate team disqualification.</li>
            </ul>
          </div>

          {/* FOOTER & VERIFICATION STAMP */}
          <div className="border-t-2 border-black pt-3 flex items-center justify-between text-[10px] font-mono">
            <div className="space-y-0.5">
              <div className="font-black text-black">GAMERS GUILD ESPORTS &bull; COMPETITIVE INTEGRITY</div>
              <div className="text-gray-500 text-[9px]">Receipt Hash: {data.publicCode}-VERIFIED-{Date.now().toString(36).toUpperCase()}</div>
            </div>

            <div className="text-center border border-black rounded px-3 py-1 bg-white">
              <div className="text-[8px] font-bold tracking-widest uppercase text-gray-600">ARBITER VERIFICATION</div>
              <div className="text-[11px] font-black text-black uppercase tracking-wider">&#10004; PERMIT ISSUED</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
