import React, { useState } from 'react';
import { X, Sliders, Save, RotateCcw, Zap } from 'lucide-react';
import { RiskThresholds } from '../types';
import { formatINR } from '../utils/format';

interface RiskThresholdsModalProps {
  isOpen: boolean;
  onClose: () => void;
  thresholds: RiskThresholds;
  onSaveThresholds: (newThresholds: RiskThresholds) => void;
}

export const RiskThresholdsModal: React.FC<RiskThresholdsModalProps> = ({
  isOpen,
  onClose,
  thresholds,
  onSaveThresholds,
}) => {
  const [form, setForm] = useState<RiskThresholds>({ ...thresholds });

  if (!isOpen) return null;

  const handleApplyPreset = (profile: 'conservative' | 'standard' | 'hft') => {
    if (profile === 'conservative') {
      setForm({
        maxOrderRateWarning: 60,
        maxOrderRateCritical: 120,
        maxExposureWarning: 35_000_000, // ₹3.5 Cr
        maxExposureCritical: 50_000_000, // ₹5.0 Cr
        maxSingleOrderValue: 2_500_000, // ₹25 Lakhs
        autoHaltOnCritical: true,
      });
    } else if (profile === 'standard') {
      setForm({
        maxOrderRateWarning: 120,
        maxOrderRateCritical: 250,
        maxExposureWarning: 75_000_000, // ₹7.5 Cr
        maxExposureCritical: 100_000_000, // ₹10.0 Cr
        maxSingleOrderValue: 5_000_000, // ₹50 Lakhs
        autoHaltOnCritical: true,
      });
    } else if (profile === 'hft') {
      setForm({
        maxOrderRateWarning: 200,
        maxOrderRateCritical: 400,
        maxExposureWarning: 150_000_000, // ₹15.0 Cr
        maxExposureCritical: 200_000_000, // ₹20.0 Cr
        maxSingleOrderValue: 10_000_000, // ₹1.0 Cr
        autoHaltOnCritical: true,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveThresholds(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0e1628] border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#0a1020]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Configure Safety Limits (₹ INR)</h3>
              <p className="text-xs text-slate-400">
                Set how fast trades can go and the maximum money allowed at risk
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

        {/* 1-Click Profile Presets */}
        <div className="p-4 mx-5 mt-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-sans">
            <Zap className="w-3.5 h-3.5 text-cyan-400" /> One-Click Ready Profiles:
          </span>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleApplyPreset('conservative')}
              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-left transition cursor-pointer"
            >
              <div className="font-bold text-emerald-400">Conservative</div>
              <div className="text-[10px] text-slate-400">120/s • ₹5 Cr Cap</div>
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('standard')}
              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-cyan-500/60 text-left transition cursor-pointer"
            >
              <div className="font-bold text-cyan-300">Standard (Recommended)</div>
              <div className="text-[10px] text-slate-400">250/s • ₹10 Cr Cap</div>
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('hft')}
              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-left transition cursor-pointer"
            >
              <div className="font-bold text-amber-400">High Speed</div>
              <div className="text-[10px] text-slate-400">400/s • ₹20 Cr Cap</div>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs font-mono">
          {/* Order Rate Limits */}
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px] font-sans">
                Order Speed Limits (Orders Per Second)
              </span>
              <span className="text-[10px] text-slate-500 font-sans">Safety speed limit</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 font-sans">Warning Alert Rate:</label>
                <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5">
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={form.maxOrderRateWarning}
                    onChange={(e) =>
                      setForm({ ...form, maxOrderRateWarning: Number(e.target.value) })
                    }
                    className="w-full bg-transparent text-amber-400 font-bold outline-none"
                  />
                  <span className="text-slate-500 text-[10px]">/sec</span>
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-sans">Auto-Stop (Kill Switch):</label>
                <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5">
                  <input
                    type="number"
                    min="20"
                    max="1000"
                    value={form.maxOrderRateCritical}
                    onChange={(e) =>
                      setForm({ ...form, maxOrderRateCritical: Number(e.target.value) })
                    }
                    className="w-full bg-transparent text-rose-400 font-bold outline-none"
                  />
                  <span className="text-slate-500 text-[10px]">/sec</span>
                </div>
              </div>
            </div>
          </div>

          {/* Exposure Limits */}
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px] font-sans">
                Total Money at Risk Limits (₹ INR)
              </span>
              <span className="text-[10px] text-slate-500 font-sans">Total capital ceiling</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 font-sans">Warning at ({formatINR(form.maxExposureWarning)}):</label>
                <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5">
                  <span className="text-slate-500 mr-1">₹</span>
                  <input
                    type="number"
                    step="5000000"
                    value={form.maxExposureWarning}
                    onChange={(e) =>
                      setForm({ ...form, maxExposureWarning: Number(e.target.value) })
                    }
                    className="w-full bg-transparent text-amber-400 font-bold outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-sans">Hard Cap Limit ({formatINR(form.maxExposureCritical)}):</label>
                <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5">
                  <span className="text-slate-500 mr-1">₹</span>
                  <input
                    type="number"
                    step="5000000"
                    value={form.maxExposureCritical}
                    onChange={(e) =>
                      setForm({ ...form, maxExposureCritical: Number(e.target.value) })
                    }
                    className="w-full bg-transparent text-rose-400 font-bold outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Single Order Value Cap */}
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div>
              <label className="text-slate-400 block mb-1 font-sans">
                Max Single Order Value ({formatINR(form.maxSingleOrderValue)}):
              </label>
              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5">
                <span className="text-slate-500 mr-1">₹</span>
                <input
                  type="number"
                  step="500000"
                  value={form.maxSingleOrderValue}
                  onChange={(e) =>
                    setForm({ ...form, maxSingleOrderValue: Number(e.target.value) })
                  }
                  className="w-full bg-transparent text-cyan-400 font-bold outline-none"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 pt-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.autoHaltOnCritical}
                onChange={(e) => setForm({ ...form, autoHaltOnCritical: e.target.checked })}
                className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-700 focus:ring-cyan-500"
              />
              <span className="text-slate-300 font-sans text-xs">
                Automatically pull the Emergency Kill Switch if critical limits are crossed
              </span>
            </label>
          </div>

          {/* Buttons Footer */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => handleApplyPreset('standard')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default (₹10 Cr)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-white font-bold bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-600/30 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Limits</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
