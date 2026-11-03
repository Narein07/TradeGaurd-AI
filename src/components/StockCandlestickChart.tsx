import React, { useState, useRef, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  Activity,
  Layers,
  ShieldAlert,
  Radio,
  Sliders,
  Maximize2,
} from 'lucide-react';
import { CandlestickData, StockTickerInfo, EngineStatus, SimulationMode } from '../types';
import { formatINR, formatIndianNumber } from '../utils/format';

interface StockCandlestickChartProps {
  candles: CandlestickData[];
  ticker: StockTickerInfo;
  availableSymbols: { symbol: string; name: string; basePrice: number }[];
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  engineStatus: EngineStatus;
  currentMode: SimulationMode;
}

export const StockCandlestickChart: React.FC<StockCandlestickChartProps> = ({
  candles,
  ticker,
  availableSymbols,
  selectedSymbol,
  onSelectSymbol,
  engineStatus,
  currentMode,
}) => {
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle');
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m'>('1m');
  const [hoveredCandle, setHoveredCandle] = useState<CandlestickData | null>(null);

  const isHalted =
    engineStatus === 'HALTED_AUTO' ||
    engineStatus === 'HALTED_MANUAL' ||
    engineStatus === 'LOCKED_DEPLOYMENT';

  // SVG Chart Dimensions
  const width = 800;
  const height = 300;
  const paddingTop = 25;
  const paddingBottom = 45;
  const paddingLeft = 15;
  const paddingRight = 65;

  const chartWidth = width - paddingLeft - paddingRight;
  const priceChartHeight = height - paddingTop - paddingBottom - 50; // top 180px for price
  const volumeChartHeight = 40; // bottom 40px for volume
  const volumeTop = height - paddingBottom - volumeChartHeight;

  // Calculate Price Range
  const { minPrice, maxPrice, maxVolume } = useMemo(() => {
    if (!candles || candles.length === 0) {
      return { minPrice: 100, maxPrice: 200, maxVolume: 1000 };
    }
    let min = Infinity;
    let max = -Infinity;
    let maxVol = 0;

    candles.forEach((c) => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (c.volume > maxVol) maxVol = c.volume;
    });

    // Add 4% padding on top and bottom for smooth wick display
    const range = Math.max(1, max - min);
    return {
      minPrice: Math.max(0.1, min - range * 0.08),
      maxPrice: max + range * 0.08,
      maxVolume: Math.max(100, maxVol * 1.15),
    };
  }, [candles]);

  const priceRange = Math.max(0.01, maxPrice - minPrice);

  // Helper coordinate functions
  const getYForPrice = (price: number) => {
    const ratio = (price - minPrice) / priceRange;
    return paddingTop + priceChartHeight * (1 - ratio);
  };

  const getYForVolume = (vol: number) => {
    const ratio = Math.min(1, vol / maxVolume);
    return volumeTop + volumeChartHeight * (1 - ratio);
  };

  const candleCount = candles.length;
  const candleSlotWidth = chartWidth / Math.max(1, candleCount);
  const candleBodyWidth = Math.max(4, Math.min(18, candleSlotWidth * 0.65));

  const getXForIndex = (index: number) => {
    return paddingLeft + index * candleSlotWidth + candleSlotWidth / 2;
  };

  const activeCandle = hoveredCandle || (candles.length > 0 ? candles[candles.length - 1] : null);

  const isPositiveChange = ticker.change >= 0;

  // Generate Line Path if Line mode active
  const linePoints = useMemo(() => {
    if (chartType !== 'line' || !candles.length) return '';
    return candles
      .map((c, i) => `${getXForIndex(i)},${getYForPrice(c.close)}`)
      .join(' ');
  }, [candles, chartType, minPrice, maxPrice]);

  return (
    <div className="bg-[#0e1628] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col space-y-4">
      {/* Top Header: Stock Selector & Ticker Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        {/* Left: Stock Tabs & Company Info */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Symbol Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {availableSymbols.map((item) => (
              <button
                key={item.symbol}
                onClick={() => onSelectSymbol(item.symbol)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer whitespace-nowrap ${
                  selectedSymbol === item.symbol
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {item.symbol}
              </button>
            ))}
          </div>

          <div className="hidden sm:block h-6 w-px bg-slate-800" />

          {/* Current Stock Quote Headline */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase">{ticker.name}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
              {ticker.exchange}
            </span>
          </div>
        </div>

        {/* Right: Live Price Ticker & Controls */}
        <div className="flex items-center gap-4 flex-wrap justify-between sm:justify-end">
          {/* Live Price Readout */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono tracking-tight">
              ₹{ticker.currentPrice.toFixed(2)}
            </span>
            <span
              className={`text-xs font-bold font-mono flex items-center gap-0.5 ${
                isPositiveChange ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPositiveChange ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>
                {isPositiveChange ? '+' : ''}₹{ticker.change.toFixed(2)} (
                {isPositiveChange ? '+' : ''}
                {ticker.changePercent.toFixed(2)}%)
              </span>
            </span>
          </div>

          {/* Chart View Switcher (Candles vs Line) */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setChartType('candle')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                chartType === 'candle'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Candlestick Chart"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Candles</span>
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                chartType === 'line'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Line Chart"
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Line</span>
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
            {(['1m', '5m', '15m'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                  timeframe === tf
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-Header: Live Candlestick OHLCV Data Bar */}
      <div className="bg-slate-950/80 rounded-xl px-3.5 py-2 border border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-slate-500">
            TIME: <strong className="text-slate-300">{activeCandle?.time || '--'}</strong>
          </span>
          <span className="text-slate-400">
            O: <strong className="text-white">₹{activeCandle?.open.toFixed(2) || '0.00'}</strong>
          </span>
          <span className="text-slate-400">
            H: <strong className="text-emerald-400">₹{activeCandle?.high.toFixed(2) || '0.00'}</strong>
          </span>
          <span className="text-slate-400">
            L: <strong className="text-rose-400">₹{activeCandle?.low.toFixed(2) || '0.00'}</strong>
          </span>
          <span className="text-slate-400">
            C: <strong className="text-white">₹{activeCandle?.close.toFixed(2) || '0.00'}</strong>
          </span>
          <span className="text-slate-400">
            VOL:{' '}
            <strong className="text-cyan-400">
              {formatIndianNumber(activeCandle?.volume || 0)}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {currentMode === 'ROGUE' && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700 animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              ROGUE VOLATILITY SURGE
            </span>
          )}
          {isHalted ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              FEED FROZEN BY KILL SWITCH
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 radar-live" />
              LIVE TICK STREAM
            </span>
          )}
        </div>
      </div>

      {/* SVG Candlestick Chart Area */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-64 sm:h-72 font-mono text-[10px]"
          onMouseLeave={() => setHoveredCandle(null)}
        >
          <defs>
            <linearGradient id="chartLineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Lines & Price Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = paddingTop + priceChartHeight * (1 - pct);
            const priceVal = minPrice + priceRange * pct;
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
                  x={width - paddingRight + 6}
                  y={y + 3}
                  textAnchor="start"
                  fill="#64748b"
                  className="text-[9px]"
                >
                  ₹{priceVal.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Volume Baseline Line */}
          <line
            x1={paddingLeft}
            y1={volumeTop}
            x2={width - paddingRight}
            y2={volumeTop}
            stroke="#1e293b"
            strokeDasharray="1 2"
          />
          <text
            x={width - paddingRight + 6}
            y={volumeTop + 12}
            textAnchor="start"
            fill="#475569"
            className="text-[8px]"
          >
            VOL
          </text>

          {/* Candlesticks & Volume Bars */}
          {candles.map((c, i) => {
            const x = getXForIndex(i);
            const isBullish = c.close >= c.open;
            const candleColor = isBullish ? '#10b981' : '#f43f5e';

            // Wick Y positions
            const yHigh = getYForPrice(c.high);
            const yLow = getYForPrice(c.low);

            // Body Y positions
            const yOpen = getYForPrice(c.open);
            const yClose = getYForPrice(c.close);
            const bodyY = Math.min(yOpen, yClose);
            const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

            // Volume Bar
            const volBarY = getYForVolume(c.volume);
            const volBarHeight = Math.max(2, volumeTop + volumeChartHeight - volBarY);

            const isHovered = hoveredCandle?.timestamp === c.timestamp;

            return (
              <g
                key={c.timestamp}
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setHoveredCandle(c)}
              >
                {/* Interactive Hit Area */}
                <rect
                  x={x - candleSlotWidth / 2}
                  y={paddingTop}
                  width={candleSlotWidth}
                  height={height - paddingTop - paddingBottom}
                  fill="transparent"
                />

                {/* Hover Column Highlight */}
                {isHovered && (
                  <rect
                    x={x - candleSlotWidth / 2}
                    y={paddingTop}
                    width={candleSlotWidth}
                    height={height - paddingTop - paddingBottom}
                    fill="#38bdf8"
                    fillOpacity="0.08"
                  />
                )}

                {chartType === 'candle' && (
                  <>
                    {/* Candle Wick (High to Low) */}
                    <line
                      x1={x}
                      y1={yHigh}
                      x2={x}
                      y2={yLow}
                      stroke={candleColor}
                      strokeWidth={1.5}
                    />

                    {/* Candle Body */}
                    <rect
                      x={x - candleBodyWidth / 2}
                      y={bodyY}
                      width={candleBodyWidth}
                      height={bodyHeight}
                      fill={candleColor}
                      rx={1}
                    />
                  </>
                )}

                {/* Volume Bar at Bottom */}
                <rect
                  x={x - candleBodyWidth / 2}
                  y={volBarY}
                  width={candleBodyWidth}
                  height={volBarHeight}
                  fill={candleColor}
                  fillOpacity={isHovered ? 0.8 : 0.4}
                  rx={1}
                />
              </g>
            );
          })}

          {/* Line Chart Polyline (if Line mode active) */}
          {chartType === 'line' && (
            <>
              {/* Fill Area */}
              <polygon
                points={`${getXForIndex(0)},${
                  paddingTop + priceChartHeight
                } ${linePoints} ${getXForIndex(candles.length - 1)},${
                  paddingTop + priceChartHeight
                }`}
                fill="url(#chartLineGradient)"
              />
              {/* Stroke */}
              <polyline
                points={linePoints}
                fill="none"
                stroke="#06b6d4"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Current Live Price Line (Horizontal tracker) */}
          {candles.length > 0 && (
            <g>
              <line
                x1={paddingLeft}
                y1={getYForPrice(ticker.currentPrice)}
                x2={width - paddingRight}
                y2={getYForPrice(ticker.currentPrice)}
                stroke={isPositiveChange ? '#10b981' : '#f43f5e'}
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <rect
                x={width - paddingRight + 2}
                y={getYForPrice(ticker.currentPrice) - 8}
                width={56}
                height={16}
                rx={3}
                fill={isPositiveChange ? '#065f46' : '#881337'}
              />
              <text
                x={width - paddingRight + 6}
                y={getYForPrice(ticker.currentPrice) + 3}
                fill="#ffffff"
                className="text-[9px] font-bold"
              >
                ₹{ticker.currentPrice.toFixed(1)}
              </text>
            </g>
          )}

          {/* Time Labels on X Axis */}
          {candles
            .filter((_, idx) => idx % Math.max(1, Math.floor(candles.length / 6)) === 0)
            .map((c, idx) => {
              const origIndex = candles.indexOf(c);
              return (
                <text
                  key={c.timestamp}
                  x={getXForIndex(origIndex)}
                  y={height - 12}
                  textAnchor="middle"
                  fill="#64748b"
                  className="text-[9px]"
                >
                  {c.time}
                </text>
              );
            })}
        </svg>

        {/* Safety Halt Screen Overlay if Kill Switch Active */}
        {isHalted && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 text-center border border-rose-500/40 rounded-xl">
            <div className="p-3 rounded-full bg-rose-950 border border-rose-600 text-rose-400 mb-2 danger-live">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-bold text-rose-200 tracking-wide uppercase">
              Trading Frozen by RiskLock Circuit Breaker
            </h4>
            <p className="text-xs text-rose-300/90 max-w-md mt-1 leading-relaxed">
              Real-time exchange matching engine halted. Order feeds and price adjustments are frozen to protect capital from unauthorized trade loops.
            </p>
          </div>
        )}
      </div>

      {/* Footer Info & Statistics */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
        <div className="flex items-center gap-3">
          <span>
            Day High: <strong className="text-emerald-400">₹{ticker.dayHigh.toFixed(2)}</strong>
          </span>
          <span>
            Day Low: <strong className="text-rose-400">₹{ticker.dayLow.toFixed(2)}</strong>
          </span>
          <span>
            Prev Close: <strong className="text-slate-300">₹{ticker.prevClose.toFixed(2)}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Real-Time OHLCV Stream • High-Frequency Pre-Trade Guard</span>
        </div>
      </div>
    </div>
  );
};
