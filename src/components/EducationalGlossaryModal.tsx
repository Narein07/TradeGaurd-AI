import React from 'react';
import { X, BookOpen, AlertTriangle, ShieldCheck, Cpu, Scale, CheckCircle2 } from 'lucide-react';

interface EducationalGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EducationalGlossaryModal: React.FC<EducationalGlossaryModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0e1628] border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#0a1020]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                How RiskLock Works (Simple Guide)
              </h3>
              <p className="text-xs text-slate-400">
                Understanding algorithmic trading safety, SEBI risk guidelines, and the Knight Capital story
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed font-sans">
          {/* Quick 3-Step Summary */}
          <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>What is RiskLock in 3 Simple Points?</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 block">1. Server Check</span>
                <p className="text-slate-400">Makes sure all 3 servers in Mumbai run the exact same approved software code.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-amber-400 block">2. Speed Radar</span>
                <p className="text-slate-400">Monitors order speed every second. If trades go abnormally fast, it sounds an alarm.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-rose-400 block">3. Emergency Brake</span>
                <p className="text-slate-400">Pulls the Kill Switch instantly if limits are crossed, saving your money from loss.</p>
              </div>
            </div>
          </div>

          {/* 1. Knight Capital Story */}
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/50 space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-purple-400" />
              <span>Why We Need This: The Knight Capital Disaster ($440M / ~₹3,600+ Cr Lost)</span>
            </div>
            <p className="text-slate-200">
              In August 2012, Knight Capital updated 7 out of their 8 trading servers. But 1 server was accidentally left running old, obsolete code.
            </p>
            <p className="text-slate-200">
              When trading started, that 1 old server went into an uncontrolled loop, buying and selling millions of shares in seconds. Within 45 minutes, they lost $440 Million (over ₹3,600 Crores) and the firm went bankrupt.
            </p>
            <div className="p-2.5 rounded-lg bg-purple-950/60 border border-purple-800/80 text-[11px] text-purple-200 font-mono flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>
                <strong>RiskLock's Solution:</strong> Before any trading starts, RiskLock checks that all servers have 100% identical verified software. If even one server has old code, trading is locked automatically!
              </span>
            </div>
          </div>

          {/* 2. Key Terms Explained Simply */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Automatic Safety Shield */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="font-bold text-cyan-400 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-3.5 h-3.5" /> Pre-Trade Safety Shield (SEBI Rules)
              </span>
              <p className="text-[11px] text-slate-400">
                A security checkpoint for every order. If an order is too big or the system is paused, the order is blocked immediately before going to the National Stock Exchange (NSE).
              </p>
            </div>

            {/* Emergency Kill Switch */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="font-bold text-rose-400 flex items-center gap-1.5 text-xs">
                <Cpu className="w-3.5 h-3.5" /> Emergency Kill Switch
              </span>
              <p className="text-[11px] text-slate-400">
                The master emergency brake. Clicking it (or having it trigger automatically) freezes the trading engine instantly so no more money can be lost.
              </p>
            </div>

            {/* Money at Risk (Exposure) */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                <Scale className="w-3.5 h-3.5" /> Money at Risk (₹ Exposure)
              </span>
              <p className="text-[11px] text-slate-400">
                The total rupee value currently invested across open trades. RiskLock ensures your total exposure stays strictly below your safe ceiling (e.g. ₹10 Crore limit).
              </p>
            </div>

            {/* Rogue Algorithm */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                <AlertTriangle className="w-3.5 h-3.5" /> Rogue Trading Loop
              </span>
              <p className="text-[11px] text-slate-400">
                A software glitch where an automated bot starts placing hundreds of orders per second by accident. RiskLock detects this sudden speed burst and stops it immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0a1020] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition cursor-pointer"
          >
            Understood! Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
