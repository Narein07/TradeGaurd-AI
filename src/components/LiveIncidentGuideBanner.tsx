import React from 'react';
import {
  Flame,
  AlertOctagon,
  PowerOff,
  RotateCcw,
  RotateCw,
  Send,
  ArrowRight,
} from 'lucide-react';
import { EngineStatus, SimulationMode } from '../types';

interface LiveIncidentGuideBannerProps {
  engineStatus: EngineStatus;
  currentMode: SimulationMode;
  onResetDemo: () => void;
  onDeployPatch: () => void;
  onOpenOrderInjector: () => void;
  onStartNormal: () => void;
}

export const LiveIncidentGuideBanner: React.FC<LiveIncidentGuideBannerProps> = ({
  engineStatus,
  currentMode,
  onResetDemo,
  onDeployPatch,
  onOpenOrderInjector,
  onStartNormal,
}) => {
  // 1. Version Mismatch
  if (engineStatus === 'LOCKED_DEPLOYMENT') {
    return (
      <div className="bg-purple-950/40 border border-purple-500/60 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg shadow-purple-950/20">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-purple-900/60 text-purple-300 mt-0.5 shrink-0">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wide">
                System Locked: Server 2 has Old Software (Knight Capital Incident Prevention)
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-purple-900 text-purple-300">
                Trading Stopped
              </span>
            </div>
            <p className="text-xs text-purple-300/90 mt-0.5 leading-relaxed">
              <strong>What happened in simple words:</strong> Server <em>SRV-ORD-02 (BSE Fort)</em> is running old code (v3.12). If trades continue, this bug can place millions of unwanted orders. RiskLock immediately locked trading to protect your money.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <button
            onClick={onDeployPatch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Update Server 2 Software</span>
          </button>
          <button
            onClick={onOpenOrderInjector}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-purple-200 border border-purple-700/60 hover:bg-slate-850 text-xs font-medium transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-purple-400" />
            <span>Try Test Order (Will Block)</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. Auto Kill Switch Engaged
  if (engineStatus === 'HALTED_AUTO') {
    return (
      <div className="bg-rose-950/40 border border-rose-500/70 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg shadow-rose-950/20">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-900/60 text-rose-300 mt-0.5 shrink-0 danger-live">
            <PowerOff className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-rose-200 uppercase tracking-wide">
                Automatic Emergency Kill Switch Pulled!
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-rose-900 text-rose-300">
                Capital Saved
              </span>
            </div>
            <p className="text-xs text-rose-300/90 mt-0.5 leading-relaxed">
              <strong>What happened in simple words:</strong> The trading algorithm was placing orders too fast (&gt;250 orders/sec) and spending capital dangerously. RiskLock pulled the emergency brake automatically, disconnecting the algorithm and keeping your funds safe.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <button
            onClick={onOpenOrderInjector}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-900/80 text-rose-200 border border-rose-600/80 hover:bg-rose-900 text-xs font-bold transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-rose-400" />
            <span>Verify Order Rejection</span>
          </button>
          <button
            onClick={onResetDemo}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo & Re-Arm</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Manual Halt
  if (engineStatus === 'HALTED_MANUAL') {
    return (
      <div className="bg-red-950/40 border border-red-500/60 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg shadow-red-950/20">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-red-900/60 text-red-300 mt-0.5 shrink-0">
            <PowerOff className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-red-200 uppercase tracking-wide">
                Manual Emergency Stop Engaged
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-red-900 text-red-300">
                Engine Paused
              </span>
            </div>
            <p className="text-xs text-red-300/90 mt-0.5 leading-relaxed">
              <strong>What happened in simple words:</strong> You pressed the master Emergency Kill Switch button. All trading is paused immediately. Any new order sent to the broker will be safely blocked.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <button
            onClick={onOpenOrderInjector}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-red-200 border border-red-700/60 hover:bg-slate-850 text-xs font-medium transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-red-400" />
            <span>Test Blocked Order</span>
          </button>
          <button
            onClick={onResetDemo}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Trading</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. Rogue Trading In Flight (before halt)
  if (currentMode === 'ROGUE') {
    return (
      <div className="bg-amber-950/40 border border-amber-500/60 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg shadow-amber-950/20">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-900/60 text-amber-300 mt-0.5 shrink-0 animate-bounce">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wide">
                Warning: Rogue Trading Loop Running
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-amber-900 text-amber-300">
                Speed Rising Fast
              </span>
            </div>
            <p className="text-xs text-amber-300/90 mt-0.5 leading-relaxed">
              <strong>Watch the order speed:</strong> The bot is submitting buy orders at runaway speeds on Reliance shares! Watch it cross 120/s (Warning) and hit 250/s (Critical) where RiskLock will pull the emergency brake automatically.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <div className="text-xs font-mono text-amber-400 font-semibold px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-700/50">
            Approaching Auto-Halt Limit...
          </div>
        </div>
      </div>
    );
  }

  // 5. Normal Active State
  return (
    <div className="bg-[#0b1424] border border-slate-800 rounded-2xl p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-400">
      <div className="flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 radar-live shrink-0" />
        <span className="text-slate-300">
          <strong className="text-white">Status: Normal & Safe.</strong> The trading algorithm is operating normally within safe limits (speed &lt; 120/sec, money at risk &lt; ₹7.5 Cr).
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <span className="text-slate-500 hidden md:inline">Try this:</span>
        <button
          onClick={onOpenOrderInjector}
          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
        >
          <span>Test Single Order</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
