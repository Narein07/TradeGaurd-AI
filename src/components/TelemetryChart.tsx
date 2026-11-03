import React, { useState } from 'react';
import { Activity, IndianRupee } from 'lucide-react';
import { MetricHistoryPoint, RiskThresholds } from '../types';
import { formatINR } from '../utils/format';

interface TelemetryChartProps {
  history: MetricHistoryPoint[];
  thresholds: RiskThresholds;
  currentRate: number;
  currentExposure: number;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({
  history,
  thresholds,
  currentRate,
  currentExposure,
}) => {
  const [activeMetric, setActiveMetric] = useState<'rate' | 'exposure'>('rate');

  // Chart Dimensions
  const width = 640;
  const height = 180;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Max scale calculation
  const maxRate = Math.max(
    thresholds.maxOrderRateCritical * 1.25,
    ...history.map((h) => h.orderRate),
    300
  );

  const maxExposureCrores = Math.max(
    (thresholds.maxExposureCritical / 10_000_000) * 1.25,
    ...history.map((h) => h.exposureCrores),
    12
  );

  // Scale functions
  const getYForRate = (val: number) => {
    const clamped = Math.min(maxRate, Math.max(0, val));
    return paddingTop + chartHeight - (clamped / maxRate) * chartHeight;
  };

  const getYForExposure = (val: number) => {
    const clamped = Math.min(maxExposureCrores, Math.max(0, val));
    return paddingTop + chartHeight - (clamped / maxExposureCrores) * chartHeight;
  };

  const getX = (index: number) => {
    if (history.length <= 1) return paddingLeft;
    return paddingLeft + (index / (history.length - 1)) * chartWidth;
  };

  // Generate SVG paths
  const ratePoints = history.map((h, i) => `${getX(i)},${getYForRate(h.orderRate)}`).join(' ');
  const exposurePoints = history
    .map((h, i) => `${getX(i)},${getYForExposure(h.exposureCrores)}`)
    .join(' ');

  const currentPoints = activeMetric === 'rate' ? ratePoints : exposurePoints;
  const areaPath = history.length > 0
    ? `M ${getX(0)},${paddingTop + chartHeight} L ${currentPoints} L ${getX(history.length - 1)},${
        paddingTop + chartHeight
      } Z`
    : '';

  // Threshold lines
  const warningY =
    activeMetric === 'rate'
      ? getYForRate(thresholds.maxOrderRateWarning)
      : getYForExposure(thresholds.maxExposureWarning / 10_000_000);

  const criticalY =
    activeMetric === 'rate'
      ? getYForRate(thresholds.maxOrderRateCritical)
      : getYForExposure(thresholds.maxExposureCritical / 10_000_000);

  return (
    <div className="bg-[#0e1628] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
      {/* Chart Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">
            Live Real-Time Risk Monitor (Updated Every Second)
          </h3>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveMetric('rate')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeMetric === 'rate'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>Order Speed (Rate/sec)</span>
          </button>
          <button
            onClick={() => setActiveMetric('exposure')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeMetric === 'exposure'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <IndianRupee className="w-3 h-3" />
            <span>Money at Risk (₹ Cr)</span>
          </button>
        </div>
      </div>

      {/* Threshold Indicators Legend */}
      <div className="flex items-center gap-4 text-[11px] font-mono mb-2 text-slate-400 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-cyan-400" />
          <span>
            {activeMetric === 'rate'
              ? `Current Speed: ${currentRate}/sec`
              : `Current at Risk: ${formatINR(currentExposure)}`}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-b border-dashed border-amber-400" />
          <span className="text-amber-400">
            {activeMetric === 'rate'
              ? `Warning Limit: ${thresholds.maxOrderRateWarning}/s`
              : `Warning Limit: ${formatINR(thresholds.maxExposureWarning)}`}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-b border-dashed border-rose-500" />
          <span className="text-rose-400">
            {activeMetric === 'rate'
              ? `Auto-Halt Limit: ${thresholds.maxOrderRateCritical}/s`
              : `Hard Cap: ${formatINR(thresholds.maxExposureCritical)}`}
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 select-none font-mono text-[10px]"
        >
          <defs>
            <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="exposureGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = paddingTop + chartHeight * (1 - pct);
            const val =
              activeMetric === 'rate'
                ? Math.round(maxRate * pct)
                : (maxExposureCrores * pct).toFixed(1);
            return (
              <g key={pct}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="2 3"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  className="text-[9px]"
                >
                  {activeMetric === 'rate' ? val : `₹${val}Cr`}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          {areaPath && (
            <path
              d={areaPath}
              fill={activeMetric === 'rate' ? 'url(#rateGradient)' : 'url(#exposureGradient)'}
            />
          )}

          {/* Critical Threshold Line */}
          <line
            x1={paddingLeft}
            y1={criticalY}
            x2={width - paddingRight}
            y2={criticalY}
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Warning Threshold Line */}
          <line
            x1={paddingLeft}
            y1={warningY}
            x2={width - paddingRight}
            y2={warningY}
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Main Metric Polyline */}
          <polyline
            fill="none"
            stroke={activeMetric === 'rate' ? '#06b6d4' : '#10b981'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={currentPoints}
          />

          {/* Latest Point Indicator */}
          {history.length > 0 && (
            <circle
              cx={getX(history.length - 1)}
              cy={
                activeMetric === 'rate'
                  ? getYForRate(history[history.length - 1].orderRate)
                  : getYForExposure(history[history.length - 1].exposureCrores)
              }
              r="4.5"
              fill={activeMetric === 'rate' ? '#06b6d4' : '#10b981'}
              stroke="#ffffff"
              strokeWidth="2"
            />
          )}

          {/* X Axis Time Labels */}
          {history
            .filter((_, idx) => idx % Math.max(1, Math.floor(history.length / 5)) === 0)
            .map((pt, idx) => {
              const origIndex = history.indexOf(pt);
              return (
                <text
                  key={idx}
                  x={getX(origIndex)}
                  y={height - 8}
                  textAnchor="middle"
                  fill="#64748b"
                  className="text-[9px]"
                >
                  {pt.timeStr}
                </text>
              );
            })}
        </svg>
      </div>
    </div>
  );
};
