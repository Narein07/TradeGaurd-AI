import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Volume2,
  VolumeX,
  Sparkles,
  Server,
  Clock,
  BookOpen,
} from 'lucide-react';
import { EngineStatus } from '../types';

interface HeaderProps {
  engineStatus: EngineStatus;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  onOpenSettings: () => void;
  onOpenAIDiagnostic: () => void;
  onOpenServerModal: () => void;
  onOpenGlossary: () => void;
  serverMismatchCount: number;
  totalServers: number;
  currentTimeStr: string;
}

export const Header: React.FC<HeaderProps> = ({
  engineStatus,
  isAudioMuted,
  onToggleAudio,
  onOpenSettings,
  onOpenAIDiagnostic,
  onOpenServerModal,
  onOpenGlossary,
  serverMismatchCount,
  totalServers,
  currentTimeStr,
}) => {
  const getStatusBadge = () => {
    switch (engineStatus) {
      case 'ACTIVE_NORMAL':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-xs font-semibold tracking-wide shadow-sm shadow-emerald-950">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 radar-live" />
            <span>SYSTEM: SAFE & TRADING</span>
          </div>
        );
      case 'ELEVATED_RISK':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-300 text-xs font-semibold tracking-wide animate-pulse shadow-sm shadow-amber-950">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>WARNING: APPROACHING RISK LIMIT</span>
          </div>
        );
      case 'HALTED_AUTO':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-950/90 border border-rose-500/70 text-rose-300 text-xs font-bold tracking-wide danger-live shadow-sm shadow-rose-950">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>STOPPED: AUTO KILL SWITCH PULLED</span>
          </div>
        );
      case 'HALTED_MANUAL':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/90 border border-red-500/70 text-red-300 text-xs font-bold tracking-wide danger-live shadow-sm shadow-red-950">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>STOPPED: MANUAL EMERGENCY STOP</span>
          </div>
        );
      case 'LOCKED_DEPLOYMENT':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/90 border border-purple-500/70 text-purple-300 text-xs font-bold tracking-wide animate-pulse shadow-sm shadow-purple-950">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span>LOCKED: SERVER SOFTWARE MISMATCH</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <header className="border-b border-slate-800 bg-[#0a1020]/95 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
            {engineStatus === 'ACTIVE_NORMAL' ? (
              <ShieldCheck className="w-6 h-6 text-white" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Risk<span className="text-cyan-400">Lock</span>
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800 font-mono">
                INDIA (NSE / BSE)
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Detect Anomalies • Stop Rogue Trades • Protect Your Capital (₹)
            </p>
          </div>
        </div>

        {/* Center: Live Status Indicator */}
        <div className="flex items-center gap-3">{getStatusBadge()}</div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 flex-wrap justify-end w-full md:w-auto">
          {/* Wall Clock (IST) */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{currentTimeStr} IST</span>
          </div>

          {/* Handbook & Knight Story */}
          <button
            onClick={onOpenGlossary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
            title="Read simple explanation of risk concepts & the Knight Capital case study"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>How It Works</span>
          </button>

          {/* Server Cluster Quick Button */}
          <button
            onClick={onOpenServerModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
              serverMismatchCount > 0
                ? 'bg-rose-950/80 border-rose-500/60 text-rose-300'
                : 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-700 text-slate-200'
            }`}
            title="Inspect 3 Trading Servers (Mumbai BKC, Fort, Navi Mumbai)"
          >
            <Server className={`w-3.5 h-3.5 ${serverMismatchCount > 0 ? 'text-rose-400' : 'text-cyan-400'}`} />
            <span>
              Servers: {totalServers - serverMismatchCount}/{totalServers} OK
            </span>
          </button>

          {/* AI Risk Analyst Button */}
          <button
            onClick={onOpenAIDiagnostic}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 text-xs font-semibold shadow-sm shadow-indigo-500/10 transition cursor-pointer"
            title="Open AI & Rule-based Safety Report"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Risk Check</span>
          </button>

          {/* Risk Limits Settings */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer"
            title="Configure Safe Limits (₹)"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Set Limits</span>
          </button>

          {/* Audio Telemetry Toggle */}
          <button
            onClick={onToggleAudio}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
              isAudioMuted
                ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                : 'bg-cyan-950/80 border-cyan-500/50 text-cyan-400 hover:bg-cyan-900/60'
            }`}
            title={isAudioMuted ? 'Sound is Off (Click to enable audio beeps)' : 'Sound is On (Click to mute)'}
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isAudioMuted ? 'Sound Off' : 'Sound On'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
