import React, { useState } from 'react';
import {
  X,
  Send,
  AlertOctagon,
  CheckCircle2,
  Zap,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { OrderSide, EngineStatus } from '../types';
import { formatINR } from '../utils/format';

interface OrderInjectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitOrder: (order: {
    symbol: string;
    side: OrderSide;
    qty: number;
    price: number;
  }) => { success: boolean; message: string };
  engineStatus: EngineStatus;
}

const INDIAN_SYMBOLS = [
  { name: 'RELIANCE', price: 2940 },
  { name: 'TCS', price: 4120 },
  { name: 'HDFCBANK', price: 1680 },
  { name: 'INFY', price: 1890 },
  { name: 'TATAMOTORS', price: 980 },
  { name: 'NIFTY50', price: 25100 },
];

export const OrderInjectorModal: React.FC<OrderInjectorModalProps> = ({
  isOpen,
  onClose,
  onSubmitOrder,
  engineStatus,
}) => {
  const [symbol, setSymbol] = useState('RELIANCE');
  const [side, setSide] = useState<OrderSide>('BUY');
  const [qty, setQty] = useState(100);
  const [price, setPrice] = useState(2940);
  const [lastFeedback, setLastFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const totalValue = qty * price;
  const isEngineHalted =
    engineStatus === 'HALTED_AUTO' ||
    engineStatus === 'HALTED_MANUAL' ||
    engineStatus === 'LOCKED_DEPLOYMENT';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = onSubmitOrder({
      symbol,
      side,
      qty,
      price,
    });
    setLastFeedback(result);
  };

  // 1-Click Preset Helpers
  const handleLoadSafePreset = () => {
    setSymbol('RELIANCE');
    setSide('BUY');
    setQty(100);
    setPrice(2940); // Total: ₹2,94,000 (Safe)
    setLastFeedback(null);
  };

  const handleLoadOversizedPreset = () => {
    setSymbol('RELIANCE');
    setSide('BUY');
    setQty(5000);
    setPrice(2940); // Total: ₹1,47,00,000 (₹1.47 Cr - exceeds ₹50 Lakh single order limit)
    setLastFeedback(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0e1628] border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#0a1020]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Test Single Order Safety (₹)</h3>
              <p className="text-xs text-slate-400">
                Send a test Indian stock order to see if RiskLock accepts or blocks it
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

        {/* Engine Status Banner */}
        {isEngineHalted ? (
          <div className="bg-rose-950/70 border-b border-rose-500/60 p-3.5 px-5 flex items-start gap-2.5 text-xs text-rose-200">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong>Trading Engine is Currently Stopped!</strong>
              <p className="text-rose-300 text-[11px] mt-0.5">
                Because the safety stop is active, any order you send right now will be safely blocked.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-950/40 border-b border-emerald-500/40 p-3 px-5 flex items-center gap-2 text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Engine is <strong>ACTIVE & SAFE</strong>. Valid orders within limits will be executed.
            </span>
          </div>
        )}

        {/* 1-Click Quick Presets */}
        <div className="p-4 mx-5 mt-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-sans">
            <Zap className="w-3.5 h-3.5 text-cyan-400" /> One-Click Test Presets:
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={handleLoadSafePreset}
              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-left transition cursor-pointer"
            >
              <div className="font-bold text-emerald-400">Safe Order (₹2.94 Lakhs)</div>
              <div className="text-[10px] text-slate-400">100 RELIANCE • Fits inside limits</div>
            </button>
            <button
              type="button"
              onClick={handleLoadOversizedPreset}
              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-left transition cursor-pointer"
            >
              <div className="font-bold text-rose-400">Too Big Order (₹1.47 Cr)</div>
              <div className="text-[10px] text-slate-400">5,000 RELIANCE • Exceeds limit</div>
            </button>
          </div>
        </div>

        {/* Visual Receipt / Feedback */}
        {lastFeedback && (
          <div
            className={`p-3.5 mx-5 mt-3 rounded-xl border text-xs font-mono flex items-start gap-2.5 ${
              lastFeedback.success
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                : 'bg-rose-950/80 border-rose-500 text-rose-200'
            }`}
          >
            {lastFeedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <div className="font-bold">
                {lastFeedback.success ? 'ORDER STATUS: SUCCESS (FILLED)' : 'ORDER STATUS: SAFELY BLOCKED'}
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">{lastFeedback.message}</p>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs font-mono">
          {/* Symbol Selection */}
          <div>
            <label className="text-slate-400 block mb-1 font-sans font-medium">Select Stock:</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {INDIAN_SYMBOLS.map((s) => (
                <button
                  type="button"
                  key={s.name}
                  onClick={() => {
                    setSymbol(s.name);
                    setPrice(s.price);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    symbol === s.name
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {s.name} (₹{s.price})
                </button>
              ))}
            </div>
          </div>

          {/* Side & Qty & Price */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="text-slate-400 block mb-1 font-sans">Action:</label>
              <div className="flex rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                <button
                  type="button"
                  onClick={() => setSide('BUY')}
                  className={`flex-1 py-1.5 font-bold text-xs transition cursor-pointer ${
                    side === 'BUY' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => setSide('SELL')}
                  className={`flex-1 py-1.5 font-bold text-xs transition cursor-pointer ${
                    side === 'SELL' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SELL
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-sans">Shares (Qty):</label>
              <input
                type="number"
                min="1"
                step="50"
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-sans">Price (₹):</label>
              <input
                type="number"
                min="1"
                step="10"
                value={price}
                onChange={(e) => setPrice(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Calculated Total Notional */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-sans">Total Order Value:</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">
                {formatINR(totalValue)}
              </span>
              {totalValue > 5_000_000 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-700">
                  EXCEEDS ₹50L LIMIT
                </span>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-cyan-600/30 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Order to Safety Check</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
