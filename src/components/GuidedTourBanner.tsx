import React, { useState } from 'react';
import {
  Compass,
  Play,
  Flame,
  AlertTriangle,
  Send,
  X,
  BookOpen,
} from 'lucide-react';

interface GuidedTourBannerProps {
  onSelectStep: (stepNumber: number) => void;
  activeStep: number;
  onOpenGlossary: () => void;
}

export const GuidedTourBanner: React.FC<GuidedTourBannerProps> = ({
  onSelectStep,
  activeStep,
  onOpenGlossary,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return (
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>New to RiskLock? Follow the 4-step quick demo to see how it protects your money.</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDismissed(false)}
            className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer underline"
          >
            Show Quick Tour
          </button>
          <span className="text-slate-600">•</span>
          <button
            onClick={onOpenGlossary}
            className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>How It Works</span>
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    {
      num: 1,
      title: '1. Normal Trading',
      desc: 'Watch healthy Indian stock orders flow safely within limits',
      icon: Play,
    },
    {
      num: 2,
      title: '2. Rogue Trading Spike',
      desc: 'Watch order speed surge past 250/sec until the auto Kill Switch halts it',
      icon: Flame,
    },
    {
      num: 3,
      title: '3. Outdated Server',
      desc: 'Simulate old code on Server 2 (Knight Capital incident) & see auto-lock',
      icon: AlertTriangle,
    },
    {
      num: 4,
      title: '4. Test Single Order',
      desc: 'Try submitting an order while halted to verify it gets safely blocked',
      icon: Send,
    },
  ];

  return (
    <div className="bg-gradient-to-r from-blue-950/70 via-slate-900/90 to-indigo-950/70 border border-cyan-500/30 rounded-2xl p-4 shadow-xl relative overflow-hidden">
      {/* Top row */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
              Simple 60-Second Interactive Tour
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700">
                Click any step to test
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Follow these 4 simple steps to see how RiskLock stops bad trades and protects your capital:
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGlossary}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
            title="Read how Knight Capital lost $440M and how pre-trade risk stops it"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">How It Works & Story</span>
            <span className="sm:hidden">Guide</span>
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Hide guide banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Steps grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {steps.map((step) => {
          const isCurrent = activeStep === step.num;
          const Icon = step.icon;

          return (
            <button
              key={step.num}
              onClick={() => onSelectStep(step.num)}
              className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                isCurrent
                  ? 'bg-cyan-950/60 border-cyan-400 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold font-mono ${
                      isCurrent
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'
                    }`}
                  >
                    {step.num}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      isCurrent ? 'text-white' : 'text-slate-300 group-hover:text-white'
                    }`}
                  >
                    {step.title.split('. ')[1]}
                  </span>
                </div>
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isCurrent ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">{step.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
