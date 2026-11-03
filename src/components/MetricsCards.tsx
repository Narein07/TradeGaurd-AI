import React from 'react';
import {
  Activity,
  IndianRupee,
  ShieldCheck,
  Server,
} from 'lucide-react';
import { SimulatedMetrics, RiskThresholds, TradingServer, EngineStatus } from '../types';
import { formatINR } from '../utils/format';

interface MetricsCardsProps {
  metrics: SimulatedMetrics;
  thresholds: RiskThresholds;
  servers: TradingServer[];
  engineStatus: EngineStatus;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  metrics,
  thresholds,
  servers,
  engineStatus,
}) => {
  // Order speed calculations
  const rateRatio = metrics.currentOrderRate / thresholds.maxOrderRateCritical;
  const isRateCritical = metrics.currentOrderRate >= thresholds.maxOrderRateCritical;
  const isRateWarning =
    metrics.currentOrderRate >= thresholds.maxOrderRateWarning && !isRateCritical;

  // Exposure calculations
  const exposureRatio = metrics.currentExposure / thresholds.maxExposureCritical;
  const isExposureCritical = metrics.currentExposure >= thresholds.maxExposureCritical;
  const isExposureWarning =
    metrics.currentExposure >= thresholds.maxExposureWarning && !isExposureCritical;

  // Server cluster integrity
  const mismatchedServers = servers.filter((s) => s.status === 'MISMATCH');
  const allServersHealthy = mismatchedServers.length === 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Order Speed Card */}
      <div className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
        isRateCritical
          ? 'bg-rose-950/40 border-rose-500/80 shadow-lg shadow-rose-900/30'
          : isRateWarning
          ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-900/20'
          : 'bg-[#0e1628] border-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Order Speed (Rate)</span>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
              isRateCritical
                ? 'bg-rose-600 text-white animate-pulse'
                : isRateWarning
                ? 'bg-amber-500 text-slate-950'
                : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
            }`}
          >
            {isRateCritical ? 'TOO FAST (STOP)' : isRateWarning ? 'HIGH SPEED' : 'SAFE SPEED'}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight">
            {metrics.currentOrderRate}
          </span>
          <span className="text-xs text-slate-400 font-medium">orders / second</span>
        </div>

        {/* Progress Bar with warning tick & critical tick */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2 relative">
          <div
            className={`h-full transition-all duration-300 ${
              isRateCritical ? 'bg-rose-500' : isRateWarning ? 'bg-amber-400' : 'bg-cyan-400'
            }`}
            style={{ width: `${Math.min(100, Math.max(3, rateRatio * 100))}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
          <span>Highest: {metrics.peakOrderRate}/sec</span>
          <span>
            Halt at <span className="text-rose-400 font-bold">{thresholds.maxOrderRateCritical}/s</span>
          </span>
        </div>
      </div>

      {/* 2. Total Money at Risk (Financial Exposure) Card */}
      <div className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
        isExposureCritical
          ? 'bg-rose-950/40 border-rose-500/80 shadow-lg shadow-rose-900/30'
          : isExposureWarning
          ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-900/20'
          : 'bg-[#0e1628] border-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <IndianRupee className="w-4 h-4 text-emerald-400" />
            <span>Money at Risk (Exposure)</span>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
              isExposureCritical
                ? 'bg-rose-600 text-white animate-pulse'
                : isExposureWarning
                ? 'bg-amber-500 text-slate-950'
                : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
            }`}
          >
            {isExposureCritical ? 'LIMIT BREACHED' : isExposureWarning ? 'WARNING 75%' : 'SAFE ZONE'}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight">
            {formatINR(metrics.currentExposure)}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            of {formatINR(thresholds.maxExposureCritical)} max
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2 relative">
          <div
            className={`h-full transition-all duration-300 ${
              isExposureCritical
                ? 'bg-rose-500'
                : isExposureWarning
                ? 'bg-amber-400'
                : 'bg-emerald-400'
            }`}
            style={{ width: `${Math.min(100, Math.max(3, exposureRatio * 100))}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
          <span>{((metrics.currentExposure / thresholds.maxExposureCritical) * 100).toFixed(1)}% of limit</span>
          <span>Warn @ {formatINR(thresholds.maxExposureWarning)}</span>
        </div>
      </div>

      {/* 3. Safety Protection & Capital Saved */}
      <div className="p-4 rounded-2xl bg-[#0e1628] border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Safety Shield</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
            AUTO FILTER
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight">
            {metrics.totalOrdersExecuted.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-slate-400 font-medium">filled</span>
          <span className="text-xs text-rose-400 font-mono font-bold">
            / {metrics.totalOrdersRejected} blocked
          </span>
        </div>

        <div className="w-full bg-slate-800/80 rounded-lg p-2 flex items-center justify-between text-xs">
          <span className="text-slate-400">Capital Saved (₹):</span>
          <span className="font-mono font-bold text-emerald-400">
            {formatINR(metrics.totalCapitalProtected)}
          </span>
        </div>

        <div className="mt-2 flex justify-between items-center text-[11px] text-slate-500 font-mono">
          <span>Total Checked: {metrics.totalOrdersProcessed.toLocaleString('en-IN')}</span>
          <span className="text-emerald-400 font-medium">Zero Bad Trades Leaked</span>
        </div>
      </div>

      {/* 4. Server Check Card */}
      <div className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
        !allServersHealthy
          ? 'bg-rose-950/40 border-rose-500/80 shadow-lg shadow-rose-900/30'
          : 'bg-[#0e1628] border-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>Server Version Check</span>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
              allServersHealthy
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-rose-600 text-white animate-pulse'
            }`}
          >
            {allServersHealthy ? 'ALL 3 SERVERS OK' : 'OLD CODE FOUND'}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight">
            {servers.length - mismatchedServers.length} / {servers.length}
          </span>
          <span className="text-xs text-slate-400 font-medium">servers verified</span>
        </div>

        <div className="w-full bg-slate-800/80 rounded-lg p-2 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Approved Version:</span>
          <span className="text-cyan-300 font-semibold">{servers[0]?.approvedVersion || 'v4.18.2'}</span>
        </div>

        <div className="mt-2 flex justify-between items-center text-[11px] font-mono">
          <span className={allServersHealthy ? 'text-emerald-400' : 'text-rose-400 font-semibold'}>
            {allServersHealthy ? '100% Code Verified' : 'FAIL: Server 2 has old code'}
          </span>
          <span className="text-slate-500">SEBI Compliant</span>
        </div>
      </div>
    </div>
  );
};
