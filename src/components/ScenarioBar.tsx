import React from 'react';
import {
  Play,
  Flame,
  AlertTriangle,
  PowerOff,
  RotateCcw,
  PlusCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { SimulationMode, EngineStatus } from '../types';

interface ScenarioBarProps {
  currentMode: SimulationMode;
  engineStatus: EngineStatus;
  onStartNormal: () => void;
  onTriggerRogue: () => void;
  onTriggerOutdatedServer: () => void;
  onEmergencyKillSwitch: () => void;
  onResetDemo: () => void;
  onOpenOrderInjector: () => void;
}

export const ScenarioBar: React.FC<ScenarioBarProps> = ({
  currentMode,
  engineStatus,
  onStartNormal,
  onTriggerRogue,
  onTriggerOutdatedServer,
  onEmergencyKillSwitch,
  onResetDemo,
  onOpenOrderInjector,
}) => {
  const isHalted =
    engineStatus === 'HALTED_AUTO' ||
    engineStatus === 'HALTED_MANUAL' ||
    engineStatus === 'LOCKED_DEPLOYMENT';

  return (
    <div className="bg-[#0e1628] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
      {/* Top row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Interactive Safety Scenarios:
          </span>
          <span className="text-[11px] text-slate-400">
            Click any button below to see how RiskLock stops catastrophic trading failures
          </span>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 self-start sm:self-auto font-mono">
          <span className="text-slate-500">Current Simulation:</span>
          <span className="text-cyan-300 font-bold uppercase">{currentMode}</span>
        </div>
      </div>

      {/* Buttons Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* 1. Normal Trading */}
        <button
          onClick={onStartNormal}
          className={`flex flex-col items-start p-2.5 rounded-xl text-left transition cursor-pointer border ${
            currentMode === 'NORMAL' && !isHalted
              ? 'bg-emerald-950/80 text-white border-emerald-400 shadow-lg shadow-emerald-950 ring-1 ring-emerald-400'
              : 'bg-slate-900/90 text-slate-200 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
            <span>Normal Trading</span>
          </div>
          <span className="text-[10px] text-slate-400 leading-tight">
            Safe flow (~50/s) within risk limits
          </span>
        </button>

        {/* 2. Rogue Trading */}
        <button
          onClick={onTriggerRogue}
          className={`flex flex-col items-start p-2.5 rounded-xl text-left transition cursor-pointer border ${
            currentMode === 'ROGUE'
              ? 'bg-amber-950/80 text-white border-amber-400 shadow-lg shadow-amber-950 ring-1 ring-amber-400'
              : 'bg-slate-900/90 text-amber-300 border-amber-500/40 hover:bg-amber-950/40 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>Rogue Algo Loop</span>
          </div>
          <span className="text-[10px] text-slate-400 leading-tight">
            Spikes &gt; 250/s & auto-halts
          </span>
        </button>

        {/* 3. Outdated Server */}
        <button
          onClick={onTriggerOutdatedServer}
          className={`flex flex-col items-start p-2.5 rounded-xl text-left transition cursor-pointer border ${
            currentMode === 'OUTDATED_SERVER'
              ? 'bg-purple-950/80 text-white border-purple-400 shadow-lg shadow-purple-950 ring-1 ring-purple-400'
              : 'bg-slate-900/90 text-purple-300 border-purple-500/40 hover:bg-purple-950/40 hover:border-purple-400'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
            <AlertTriangle className="w-3.5 h-3.5 text-purple-400" />
            <span>Outdated Server</span>
          </div>
          <span className="text-[10px] text-slate-400 leading-tight">
            Knight Capital version skew
          </span>
        </button>

        {/* 4. Emergency Kill Switch */}
        <button
          onClick={onEmergencyKillSwitch}
          className={`flex flex-col items-start p-2.5 rounded-xl text-left transition cursor-pointer border shadow-lg ${
            isHalted
              ? 'bg-red-950/90 text-white border-red-400 shadow-red-950 ring-2 ring-red-500/40 animate-pulse'
              : 'bg-gradient-to-br from-red-600/90 to-rose-700/90 text-white border-red-500 hover:from-red-500 hover:to-rose-600'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
            <PowerOff className="w-3.5 h-3.5 text-red-200" />
            <span>KILL SWITCH</span>
          </div>
          <span className="text-[10px] text-rose-100/80 leading-tight">
            Instant manual freeze
          </span>
        </button>

        {/* 5. Inject Manual Order */}
        <button
          onClick={onOpenOrderInjector}
          className="flex flex-col items-start p-2.5 rounded-xl text-left transition cursor-pointer bg-slate-900 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-950/50 hover:border-cyan-400"
        >
          <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
            <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Inject Order</span>
          </div>
          <span className="text-[10px] text-slate-400 leading-tight">
            Test pre-trade filter pass/fail
          </span>
        </button>

        {/* 6. Reset Demo */}
        <button
          onClick={onResetDemo}
          className="flex flex-col items-start p-2.5 rounded-xl text-left transition cursor-pointer bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800 hover:text-white"
        >
          <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Demo</span>
          </div>
          <span className="text-[10px] text-slate-400 leading-tight">
            Restore cluster & clear alerts
          </span>
        </button>
      </div>
    </div>
  );
};
