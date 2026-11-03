import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { ScenarioBar } from './components/ScenarioBar';
import { GuidedTourBanner } from './components/GuidedTourBanner';
import { LiveIncidentGuideBanner } from './components/LiveIncidentGuideBanner';
import { EducationalGlossaryModal } from './components/EducationalGlossaryModal';
import { MetricsCards } from './components/MetricsCards';
import { ServerClusterView } from './components/ServerClusterView';
import { TelemetryChart } from './components/TelemetryChart';
import { RiskAlertsLog } from './components/RiskAlertsLog';
import { RecentOrdersTable } from './components/RecentOrdersTable';
import { RiskThresholdsModal } from './components/RiskThresholdsModal';
import { AIDiagnosticModal } from './components/AIDiagnosticModal';
import { OrderInjectorModal } from './components/OrderInjectorModal';
import { StockCandlestickChart } from './components/StockCandlestickChart';
import {
  TradingServer,
  SimulatedOrder,
  RiskAlert,
  RiskThresholds,
  SimulatedMetrics,
  EngineStatus,
  SimulationMode,
  AIAnalysisReport,
  OrderSide,
  CandlestickData,
  StockTickerInfo,
} from './types';
import { playSound, setAudioMuted, getAudioMuted } from './utils/audio';
import { runAIIncidentDiagnostic } from './utils/gemini';
import { formatINR, formatIndianNumber } from './utils/format';

// 3 Simulated Indian Trading Servers
const INITIAL_SERVERS: TradingServer[] = [
  {
    id: 'srv-01',
    name: 'SRV-ORD-01',
    role: 'PRIMARY',
    datacenter: 'NSE Colocation (BKC, Mumbai)',
    currentVersion: 'v4.18.2-RELEASE',
    approvedVersion: 'v4.18.2-RELEASE',
    checksum: '7b94fa2e89c011e4',
    status: 'HEALTHY',
    cpuUsage: 26,
    memoryUsage: 41,
    ordersHandled: 14250,
    lastHeartbeat: '0.4ms',
  },
  {
    id: 'srv-02',
    name: 'SRV-ORD-02',
    role: 'SECONDARY',
    datacenter: 'BSE Colocation (Fort, Mumbai)',
    currentVersion: 'v4.18.2-RELEASE',
    approvedVersion: 'v4.18.2-RELEASE',
    checksum: '7b94fa2e89c011e4',
    status: 'HEALTHY',
    cpuUsage: 22,
    memoryUsage: 38,
    ordersHandled: 11420,
    lastHeartbeat: '0.6ms',
  },
  {
    id: 'srv-03',
    name: 'SRV-ORD-03',
    role: 'REPLICA',
    datacenter: 'CtrlS Datacenter (Navi Mumbai DR)',
    currentVersion: 'v4.18.2-RELEASE',
    approvedVersion: 'v4.18.2-RELEASE',
    checksum: '7b94fa2e89c011e4',
    status: 'HEALTHY',
    cpuUsage: 16,
    memoryUsage: 30,
    ordersHandled: 5120,
    lastHeartbeat: '1.1ms',
  },
];

// Default Safe Limits in Indian Rupees
const DEFAULT_THRESHOLDS: RiskThresholds = {
  maxOrderRateWarning: 120,
  maxOrderRateCritical: 250,
  maxExposureWarning: 75_000_000, // ₹7.50 Crore
  maxExposureCritical: 100_000_000, // ₹10.00 Crore
  maxSingleOrderValue: 5_000_000, // ₹50 Lakhs
  autoHaltOnCritical: true,
};

// Leading Indian Stock Market Instruments (NSE/BSE)
const INDIAN_STOCK_PRICES: Record<string, number> = {
  RELIANCE: 2940.5,
  TCS: 4120.0,
  HDFCBANK: 1680.5,
  INFY: 1890.0,
  ICICIBANK: 1240.0,
  TATAMOTORS: 980.5,
  NIFTY50: 25100.0,
};

export const AVAILABLE_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', basePrice: 2940.5 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', basePrice: 4120.0 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', basePrice: 1680.5 },
  { symbol: 'INFY', name: 'Infosys Limited', basePrice: 1890.0 },
  { symbol: 'NIFTY50', name: 'Nifty 50 Index (NSE)', basePrice: 25100.0 },
];

function createInitialCandles(basePrice: number): CandlestickData[] {
  const candles: CandlestickData[] = [];
  const now = Date.now();
  let currentOpen = +(basePrice * 0.985).toFixed(2);

  for (let i = 24; i >= 0; i--) {
    const timestamp = now - i * 60000;
    const timeStr = new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const volatility = basePrice * 0.0035;
    const delta = (Math.random() - 0.48) * volatility;
    const close = +(currentOpen + delta).toFixed(2);
    const high = +(Math.max(currentOpen, close) + Math.random() * volatility * 0.7).toFixed(2);
    const low = +(Math.min(currentOpen, close) - Math.random() * volatility * 0.7).toFixed(2);
    const volume = Math.floor(18000 + Math.random() * 45000);

    candles.push({
      time: timeStr,
      timestamp,
      open: +currentOpen.toFixed(2),
      high,
      low,
      close,
      volume,
    });
    currentOpen = close;
  }
  return candles;
}

const SAMPLE_SYMBOLS = Object.keys(INDIAN_STOCK_PRICES);

function createInitialOrders(): SimulatedOrder[] {
  const now = Date.now();
  const orders: SimulatedOrder[] = [];

  for (let i = 0; i < 12; i++) {
    const sym = SAMPLE_SYMBOLS[i % SAMPLE_SYMBOLS.length];
    const side: OrderSide = i % 3 === 0 ? 'SELL' : 'BUY';
    const qty = 50 + (i * 25);
    const price = INDIAN_STOCK_PRICES[sym];
    const totalValue = qty * price;
    const time = new Date(now - (12 - i) * 3200).toLocaleTimeString('en-IN');

    orders.unshift({
      id: `ORD-IN-${982100 + i}`,
      timestamp: time,
      timestampMs: now - (12 - i) * 3200,
      symbol: sym,
      side,
      qty,
      price,
      totalValue,
      status: 'EXECUTED',
      serverId: `SRV-ORD-0${(i % 3) + 1}`,
    });
  }
  return orders;
}

function createInitialAlerts(): RiskAlert[] {
  const time = new Date().toLocaleTimeString('en-IN');
  return [
    {
      id: 'alt-001',
      timestamp: time,
      timestampMs: Date.now() - 30000,
      severity: 'INFO',
      category: 'DEPLOYMENT',
      title: 'All 3 Mumbai Trading Servers Verified',
      message: 'Servers in NSE BKC, BSE Fort, and Navi Mumbai DR are running identical approved code (v4.18.2).',
      triggerValue: '3 / 3 OK',
      thresholdValue: '100% Match',
      actionTaken: 'Deployment verified safe; trading engine enabled',
    },
    {
      id: 'alt-002',
      timestamp: time,
      timestampMs: Date.now() - 15000,
      severity: 'INFO',
      category: 'ORDER_RATE',
      title: 'Safety Shield Active (SEBI Compliant)',
      message: 'Automatic pre-trade safety filters are running. Speed limit: 250 orders/sec. Capital cap: ₹10.00 Cr.',
      triggerValue: '48 orders/sec',
      thresholdValue: 'Max 250/sec',
      actionTaken: 'Normal trading flow running smoothly',
    },
  ];
}

export default function App() {
  // State
  const [servers, setServers] = useState<TradingServer[]>(INITIAL_SERVERS);
  const [thresholds, setThresholds] = useState<RiskThresholds>(DEFAULT_THRESHOLDS);
  const [engineStatus, setEngineStatus] = useState<EngineStatus>('ACTIVE_NORMAL');
  const [currentMode, setCurrentMode] = useState<SimulationMode>('NORMAL');
  const [orders, setOrders] = useState<SimulatedOrder[]>(createInitialOrders);
  const [alerts, setAlerts] = useState<RiskAlert[]>(createInitialAlerts);
  const [isAudioMutedState, setIsAudioMutedState] = useState(true);
  const [currentTimeStr, setCurrentTimeStr] = useState(new Date().toLocaleTimeString('en-IN'));

  // Metrics State (in INR)
  const [metrics, setMetrics] = useState<SimulatedMetrics>({
    currentOrderRate: 48,
    peakOrderRate: 64,
    currentExposure: 38_200_000, // ₹3.82 Crore
    totalOrdersProcessed: 1420,
    totalOrdersExecuted: 1420,
    totalOrdersRejected: 0,
    totalCapitalProtected: 0,
    currentPnl: 184500, // ₹1,84,500
    history: Array.from({ length: 20 }, (_, i) => ({
      timeStr: new Date(Date.now() - (20 - i) * 2000).toLocaleTimeString('en-IN').slice(3),
      orderRate: 42 + Math.floor(Math.random() * 18),
      exposureCrores: +(3.2 + i * 0.03).toFixed(2),
    })),
  });

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAIDiagnosticOpen, setIsAIDiagnosticOpen] = useState(false);
  const [isOrderInjectorOpen, setIsOrderInjectorOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [activeTourStep, setActiveTourStep] = useState(1);
  const [aiReport, setAiReport] = useState<AIAnalysisReport | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Real-Time Stock Candlestick States
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string>('RELIANCE');
  const [stockCandles, setStockCandles] = useState<Record<string, CandlestickData[]>>(() => ({
    RELIANCE: createInitialCandles(2940.5),
    TCS: createInitialCandles(4120.0),
    HDFCBANK: createInitialCandles(1680.5),
    INFY: createInitialCandles(1890.0),
    NIFTY50: createInitialCandles(25100.0),
  }));
  const tickCounterRef = useRef(0);

  // Guided Tour Step Selector
  const handleSelectTourStep = (stepNumber: number) => {
    setActiveTourStep(stepNumber);
    if (stepNumber === 1) {
      handleStartNormal();
    } else if (stepNumber === 2) {
      handleTriggerRogue();
    } else if (stepNumber === 3) {
      handleTriggerOutdatedServer();
    } else if (stepNumber === 4) {
      setIsOrderInjectorOpen(true);
    }
  };

  // References to keep callbacks current in setInterval
  const stateRef = useRef({
    servers,
    thresholds,
    engineStatus,
    currentMode,
    metrics,
    selectedStockSymbol,
  });
  stateRef.current = {
    servers,
    thresholds,
    engineStatus,
    currentMode,
    metrics,
    selectedStockSymbol,
  };

  // Helper to append alerts
  const addAlert = useCallback(
    (
      severity: 'INFO' | 'WARNING' | 'CRITICAL',
      category: RiskAlert['category'],
      title: string,
      message: string,
      triggerValue?: string,
      thresholdValue?: string,
      rootCause?: string,
      actionTaken = 'Safety action executed'
    ) => {
      const newAlert: RiskAlert = {
        id: `alt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toLocaleTimeString('en-IN'),
        timestampMs: Date.now(),
        severity,
        category,
        title,
        message,
        triggerValue,
        thresholdValue,
        rootCause,
        actionTaken,
      };

      setAlerts((prev) => [newAlert, ...prev.slice(0, 79)]);

      if (severity === 'CRITICAL') {
        playSound('critical');
      } else if (severity === 'WARNING') {
        playSound('warning');
      }
    },
    []
  );

  // Clock ticker (IST)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeStr(new Date().toLocaleTimeString('en-IN'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Main Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      const {
        servers: currentServers,
        thresholds: currentLimits,
        engineStatus: curStatus,
        currentMode: curMode,
        metrics: curMetrics,
      } = stateRef.current;

      const hasMismatch = currentServers.some((s) => s.status === 'MISMATCH');

      // Check if cluster integrity has failed
      if (hasMismatch && curStatus !== 'LOCKED_DEPLOYMENT') {
        setEngineStatus('LOCKED_DEPLOYMENT');
        return;
      }

      // Check if halted
      const isHalted =
        curStatus === 'HALTED_AUTO' ||
        curStatus === 'HALTED_MANUAL' ||
        curStatus === 'LOCKED_DEPLOYMENT';

      let newOrderRate = 0;
      let newExposure = curMetrics.currentExposure;
      const now = Date.now();
      const timeStr = new Date(now).toLocaleTimeString('en-IN');
      const newOrdersBatch: SimulatedOrder[] = [];
      let rejectedValueBatch = 0;
      let newExecutionsCount = 0;
      let newRejectionsCount = 0;

      if (curMode === 'NORMAL') {
        if (isHalted) {
          // If halted, simulated order rate is 0, but attempt simulated rejected orders
          newOrderRate = 0;
          const sampleQty = 100;
          const samplePrice = 2940.0;
          const orderVal = sampleQty * samplePrice;
          newOrdersBatch.push({
            id: `ORD-IN-${Math.floor(100000 + Math.random() * 900000)}`,
            timestamp: timeStr,
            timestampMs: now,
            symbol: 'RELIANCE',
            side: 'BUY',
            qty: sampleQty,
            price: samplePrice,
            totalValue: orderVal,
            status: 'REJECTED',
            rejectionReason:
              curStatus === 'LOCKED_DEPLOYMENT'
                ? 'BLOCKED: SERVER_VERSION_MISMATCH'
                : 'BLOCKED: ENGINE_HALTED_SAFETY_LOCK',
            serverId: 'SRV-ORD-01',
          });
          newRejectionsCount++;
          rejectedValueBatch += orderVal;
        } else {
          // Normal active trading: 40-75 orders/sec
          newOrderRate = 38 + Math.floor(Math.random() * 32);
          // Exposure changes gently up/down with balanced buying and selling
          const exposureDelta = (Math.random() - 0.48) * 1_200_000;
          newExposure = Math.max(10_000_000, newExposure + exposureDelta);

          // Generate 2 executed orders for the live feed
          for (let i = 0; i < 2; i++) {
            const sym = SAMPLE_SYMBOLS[Math.floor(Math.random() * SAMPLE_SYMBOLS.length)];
            const side: OrderSide = Math.random() > 0.45 ? 'BUY' : 'SELL';
            const qty = 25 + Math.floor(Math.random() * 200);
            const basePrice = INDIAN_STOCK_PRICES[sym] || 2500;
            const price = basePrice + (Math.random() * 10 - 5);
            const totalValue = qty * price;

            // Pre-trade check for single order value limit
            if (totalValue > currentLimits.maxSingleOrderValue) {
              newOrdersBatch.push({
                id: `ORD-IN-${Math.floor(100000 + Math.random() * 900000)}`,
                timestamp: timeStr,
                timestampMs: now + i * 100,
                symbol: sym,
                side,
                qty,
                price: +price.toFixed(2),
                totalValue: +totalValue.toFixed(2),
                status: 'REJECTED',
                rejectionReason: 'BLOCKED: SINGLE_ORDER_EXCEEDS_50L',
                serverId: `SRV-ORD-0${(i % 3) + 1}`,
              });
              newRejectionsCount++;
              rejectedValueBatch += totalValue;
            } else {
              newOrdersBatch.push({
                id: `ORD-IN-${Math.floor(100000 + Math.random() * 900000)}`,
                timestamp: timeStr,
                timestampMs: now + i * 100,
                symbol: sym,
                side,
                qty,
                price: +price.toFixed(2),
                totalValue: +totalValue.toFixed(2),
                status: 'EXECUTED',
                serverId: `SRV-ORD-0${(i % 3) + 1}`,
              });
              newExecutionsCount++;
            }
          }
        }
      } else if (curMode === 'ROGUE') {
        // Runaway algorithmic loop simulation
        if (isHalted) {
          // If already halted, order rate is 0, but massive orders attempt and get intercepted!
          newOrderRate = 0;
          for (let i = 0; i < 3; i++) {
            const rogueVal = 4_410_000 + Math.floor(Math.random() * 2_000_000);
            newOrdersBatch.push({
              id: `ROGUE-${Math.floor(100000 + Math.random() * 900000)}`,
              timestamp: timeStr,
              timestampMs: now + i * 50,
              symbol: 'RELIANCE',
              side: 'BUY',
              qty: 1500,
              price: 2940.0,
              totalValue: rogueVal,
              status: 'REJECTED',
              rejectionReason: 'BLOCKED: KILL_SWITCH_ENGAGED',
              serverId: 'SRV-ORD-02',
              isLoopAnomaly: true,
            });
            newRejectionsCount++;
            rejectedValueBatch += rogueVal;
          }
        } else {
          // Escalating burst rate!
          newOrderRate = Math.min(
            580,
            curMetrics.currentOrderRate + 60 + Math.floor(Math.random() * 40)
          );
          // Rapidly surge exposure by millions (Crores) per second
          newExposure += 9_500_000 + Math.floor(Math.random() * 6_000_000);

          // Generate rapid repeated rogue buy orders on RELIANCE
          for (let i = 0; i < 3; i++) {
            const rogueVal = 4_410_000;
            newOrdersBatch.push({
              id: `ROGUE-${Math.floor(100000 + Math.random() * 900000)}`,
              timestamp: timeStr,
              timestampMs: now + i * 50,
              symbol: 'RELIANCE',
              side: 'BUY',
              qty: 1500,
              price: 2940.0,
              totalValue: rogueVal,
              status: 'EXECUTED',
              serverId: 'SRV-ORD-02',
              isLoopAnomaly: true,
            });
            newExecutionsCount++;
          }

          // Check if rate or exposure breached limits
          if (
            newOrderRate >= currentLimits.maxOrderRateCritical ||
            newExposure >= currentLimits.maxExposureCritical
          ) {
            if (currentLimits.autoHaltOnCritical) {
              setEngineStatus('HALTED_AUTO');
              addAlert(
                'CRITICAL',
                newOrderRate >= currentLimits.maxOrderRateCritical ? 'ORDER_RATE' : 'EXPOSURE',
                'EMERGENCY KILL SWITCH AUTOMATICALLY PULLED',
                `Order speed reached ${newOrderRate}/sec and money at risk breached ${formatINR(
                  newExposure
                )}. RiskLock pulled the emergency brake to protect your money.`,
                `${newOrderRate}/sec, ${formatINR(newExposure)}`,
                `Limit: ${currentLimits.maxOrderRateCritical}/sec, ${formatINR(
                  currentLimits.maxExposureCritical
                )}`,
                'High-speed execution loop resembling Knight Capital incident',
                'Pre-trade kill switch engaged; all further orders blocked'
              );
            } else {
              setEngineStatus('ELEVATED_RISK');
              addAlert(
                'CRITICAL',
                'ORDER_RATE',
                'CRITICAL LIMIT BREACH DETECTED (AUTO-HALT OFF)',
                `Order velocity reached ${newOrderRate}/sec. Caution: auto-halt is disabled in settings.`,
                `${newOrderRate}/sec`,
                `${currentLimits.maxOrderRateCritical}/sec`,
                'Rogue order burst',
                'Manual operator intervention required'
              );
            }
          } else if (
            newOrderRate >= currentLimits.maxOrderRateWarning ||
            newExposure >= currentLimits.maxExposureWarning
          ) {
            setEngineStatus('ELEVATED_RISK');
            addAlert(
              'WARNING',
              'ORDER_RATE',
              'Order Speed Warning: Getting Too Fast',
              `Order rate (${newOrderRate}/sec) has crossed the warning mark (${currentLimits.maxOrderRateWarning}/sec).`,
              `${newOrderRate}/sec`,
              `${currentLimits.maxOrderRateWarning}/sec`,
              'Unusual speed cluster detected from BSE Fort router',
              'Monitoring limits; ready to halt'
            );
          }
        }
      } else if (curMode === 'OUTDATED_SERVER') {
        // In outdated server mode, engine is blocked
        newOrderRate = 0;
        const testVal = 2_940_000;
        newOrdersBatch.push({
          id: `ORD-IN-${Math.floor(100000 + Math.random() * 900000)}`,
          timestamp: timeStr,
          timestampMs: now,
          symbol: 'RELIANCE',
          side: 'BUY',
          qty: 1000,
          price: 2940.0,
          totalValue: testVal,
          status: 'REJECTED',
          rejectionReason: 'BLOCKED: SERVER_2_OLD_SOFTWARE',
          serverId: 'SRV-ORD-02',
        });
        newRejectionsCount++;
        rejectedValueBatch += testVal;
      }

      // Update metrics
      setMetrics((prev) => {
        const peak = Math.max(prev.peakOrderRate, newOrderRate);
        const updatedHistory = [
          ...prev.history.slice(1),
          {
            timeStr: timeStr.slice(3),
            orderRate: newOrderRate,
            exposureCrores: +(newExposure / 10_000_000).toFixed(2),
          },
        ];

        return {
          currentOrderRate: newOrderRate,
          peakOrderRate: peak,
          currentExposure: newExposure,
          totalOrdersProcessed: prev.totalOrdersProcessed + newExecutionsCount + newRejectionsCount,
          totalOrdersExecuted: prev.totalOrdersExecuted + newExecutionsCount,
          totalOrdersRejected: prev.totalOrdersRejected + newRejectionsCount,
          totalCapitalProtected: prev.totalCapitalProtected + rejectedValueBatch,
          currentPnl: prev.currentPnl + (newExecutionsCount > 0 ? (Math.random() - 0.45) * 8000 : 0),
          history: updatedHistory,
        };
      });

      // Append new orders to feed
      if (newOrdersBatch.length > 0) {
        setOrders((prev) => [...newOrdersBatch, ...prev.slice(0, 49)]);
      }

      // Update real-time stock candlestick chart for selected symbol
      tickCounterRef.current += 1;
      const curSelected = stateRef.current.selectedStockSymbol;

      if (!isHalted) {
        setStockCandles((prevMap) => {
          const symCandles = prevMap[curSelected] || [];
          if (symCandles.length === 0) return prevMap;

          const lastCandle = symCandles[symCandles.length - 1];
          const isRogueStock = curMode === 'ROGUE' && curSelected === 'RELIANCE';

          // Price volatility tick
          const tickVol = isRogueStock ? lastCandle.close * 0.0035 : lastCandle.close * 0.0009;
          const tickDelta = isRogueStock
            ? Math.random() * tickVol * 1.6 // strong buying pressure during rogue algo loop
            : (Math.random() - 0.48) * tickVol;

          const updatedClose = +(lastCandle.close + tickDelta).toFixed(2);
          const updatedHigh = +Math.max(lastCandle.high, updatedClose).toFixed(2);
          const updatedLow = +Math.min(lastCandle.low, updatedClose).toFixed(2);
          const addVol = isRogueStock
            ? Math.floor(4000 + Math.random() * 9000)
            : Math.floor(300 + Math.random() * 900);

          const updatedLastCandle: CandlestickData = {
            ...lastCandle,
            high: updatedHigh,
            low: updatedLow,
            close: updatedClose,
            volume: lastCandle.volume + addVol,
          };

          // Form a new candle every 15 seconds
          const shouldRoll = tickCounterRef.current % 15 === 0;
          let newCandleArray: CandlestickData[];

          if (shouldRoll) {
            const timeLabel = new Date().toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            });
            const newCandle: CandlestickData = {
              time: timeLabel,
              timestamp: Date.now(),
              open: updatedClose,
              high: updatedClose,
              low: updatedClose,
              close: updatedClose,
              volume: addVol,
            };
            newCandleArray = [...symCandles.slice(1), newCandle];
          } else {
            newCandleArray = [...symCandles.slice(0, -1), updatedLastCandle];
          }

          return {
            ...prevMap,
            [curSelected]: newCandleArray,
          };
        });
      }

      // Simulate minor CPU fluctuation on healthy servers
      setServers((prev) =>
        prev.map((s) => ({
          ...s,
          cpuUsage:
            s.status === 'MISMATCH'
              ? 88
              : Math.min(95, Math.max(12, s.cpuUsage + Math.floor(Math.random() * 7 - 3))),
          ordersHandled: s.ordersHandled + (curMode === 'NORMAL' && !isHalted ? 1 : 0),
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [addAlert]);

  // Scenario Handlers
  const handleStartNormal = () => {
    playSound('click');
    const hasMismatch = servers.some((s) => s.status === 'MISMATCH');
    if (hasMismatch) {
      addAlert(
        'CRITICAL',
        'DEPLOYMENT',
        'Cannot Start Trading: Old Software on Server 2',
        'Server SRV-ORD-02 is running legacy version v3.12.0. Please update the server before opening trading.',
        'Version Mismatch',
        'Required: v4.18.2-RELEASE',
        'Deployment version parity enforcement',
        'Trading startup aborted'
      );
      setEngineStatus('LOCKED_DEPLOYMENT');
      setCurrentMode('OUTDATED_SERVER');
      return;
    }

    setCurrentMode('NORMAL');
    setEngineStatus('ACTIVE_NORMAL');
    addAlert(
      'INFO',
      'ORDER_RATE',
      'Normal Trading Resumed',
      'Indian market trading engine active. Pre-trade risk filters operational.',
      'Active',
      'Normal',
      'Operator command',
      'Normal routing enabled'
    );
  };

  const handleTriggerRogue = () => {
    playSound('warning');
    setCurrentMode('ROGUE');
    setEngineStatus('ELEVATED_RISK');
    addAlert(
      'WARNING',
      'ANOMALY',
      'Simulating Rogue Algorithmic Trading Loop',
      'Simulating runaway order loop on Reliance: order speed surging past safe limits.',
      'Rogue scenario armed',
      'Warning threshold 120/s',
      'Automated high-speed loop test',
      'Watching auto-kill threshold'
    );
  };

  const handleTriggerOutdatedServer = () => {
    playSound('critical');
    setCurrentMode('OUTDATED_SERVER');
    setEngineStatus('LOCKED_DEPLOYMENT');

    // Downgrade Server 2 to legacy code (Knight Capital reproduction)
    setServers((prev) =>
      prev.map((s) =>
        s.id === 'srv-02'
          ? {
              ...s,
              currentVersion: 'v3.12.0-LEGACY',
              checksum: '882ca19b5523910c',
              status: 'MISMATCH',
              cpuUsage: 94,
            }
          : s
      )
    );

    addAlert(
      'CRITICAL',
      'DEPLOYMENT',
      'OLD SOFTWARE DETECTED on Server 2 (BSE Fort)',
      'Server 2 is running legacy code v3.12.0 instead of verified v4.18.2. Trading locked to prevent Knight Capital style losses.',
      'v3.12.0 vs v4.18.2',
      '100% match required',
      'Server 2 rollback failure',
      'Trading engine locked immediately; orders blocked'
    );
  };

  const handleEmergencyKillSwitch = () => {
    playSound('killswitch');
    setEngineStatus('HALTED_MANUAL');
    setCurrentMode('HALTED_MANUAL');
    addAlert(
      'CRITICAL',
      'KILL_SWITCH',
      'MANUAL EMERGENCY KILL SWITCH PULLED',
      'Operator pressed the master Emergency Kill Switch. All trading frozen immediately. Incoming orders will be blocked.',
      'Manual Stop',
      'Hard Stop',
      'Human operator intervention',
      'Engine stopped; orders frozen'
    );
  };

  const handleResetDemo = () => {
    playSound('recovery');
    // Restore servers
    setServers(INITIAL_SERVERS);
    setEngineStatus('ACTIVE_NORMAL');
    setCurrentMode('NORMAL');
    setMetrics({
      currentOrderRate: 45,
      peakOrderRate: 58,
      currentExposure: 32_500_000, // ₹3.25 Cr
      totalOrdersProcessed: 120,
      totalOrdersExecuted: 120,
      totalOrdersRejected: 0,
      totalCapitalProtected: 0,
      currentPnl: 142000,
      history: Array.from({ length: 20 }, (_, i) => ({
        timeStr: new Date(Date.now() - (20 - i) * 2000).toLocaleTimeString('en-IN').slice(3),
        orderRate: 40 + Math.floor(Math.random() * 15),
        exposureCrores: +(3.0 + i * 0.015).toFixed(2),
      })),
    });
    setOrders(createInitialOrders());
    setAlerts([
      {
        id: `alt-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-IN'),
        timestampMs: Date.now(),
        severity: 'INFO',
        category: 'DEPLOYMENT',
        title: 'Environment Cleanly Reset',
        message: 'All 3 servers restored to approved build v4.18.2. Exposure reset to safe baseline (₹3.25 Cr).',
        triggerValue: 'Clean State',
        thresholdValue: 'Safe',
        actionTaken: 'System restored to safe operations',
      },
    ]);
  };

  // Sync individual server
  const handleSyncServer = (serverId: string) => {
    playSound('recovery');
    setServers((prev) =>
      prev.map((s) =>
        s.id === serverId
          ? {
              ...s,
              currentVersion: s.approvedVersion,
              checksum: '7b94fa2e89c011e4',
              status: 'HEALTHY',
              cpuUsage: 25,
            }
          : s
      )
    );

    addAlert(
      'INFO',
      'DEPLOYMENT',
      `Server ${serverId.toUpperCase()} Updated & In Sync`,
      `Successfully updated software to approved verified version (v4.18.2-RELEASE).`,
      'v4.18.2-RELEASE',
      '100% match',
      'Software update applied',
      'Server marked SAFE and rejoined cluster'
    );

    // If all servers are now healthy, release lockdown
    const remainingMismatches = servers.filter((s) => s.id !== serverId && s.status === 'MISMATCH');
    if (remainingMismatches.length === 0) {
      setEngineStatus('ACTIVE_NORMAL');
      setCurrentMode('NORMAL');
      addAlert(
        'INFO',
        'DEPLOYMENT',
        'Cluster Lock Released',
        'All 3 servers verified. Trading engine restarted.',
        '3/3 verified',
        '100% parity',
        'All servers in sync',
        'Trading enabled'
      );
    }
  };

  const handleSyncAllServers = () => {
    playSound('recovery');
    setServers(INITIAL_SERVERS);
    setEngineStatus('ACTIVE_NORMAL');
    setCurrentMode('NORMAL');
    addAlert(
      'INFO',
      'DEPLOYMENT',
      'All 3 Servers Updated to Verified Version',
      'All 3 trading servers verified with approved build v4.18.2-RELEASE. Trading lockdown lifted.',
      '3/3 servers synced',
      '100% match',
      'Automated patch applied',
      'Engine returned to ACTIVE_NORMAL status'
    );
  };

  // Handle manual test order submission (in INR)
  const handleSubmitManualOrder = (orderData: {
    symbol: string;
    side: OrderSide;
    qty: number;
    price: number;
  }) => {
    const totalValue = orderData.qty * orderData.price;
    const now = Date.now();
    const timeStr = new Date(now).toLocaleTimeString('en-IN');
    const isHalted =
      engineStatus === 'HALTED_AUTO' ||
      engineStatus === 'HALTED_MANUAL' ||
      engineStatus === 'LOCKED_DEPLOYMENT';

    // 1. Check if halted
    if (isHalted) {
      const reason =
        engineStatus === 'LOCKED_DEPLOYMENT'
          ? 'BLOCKED: SERVER_SOFTWARE_MISMATCH'
          : engineStatus === 'HALTED_AUTO'
          ? 'BLOCKED: AUTO_KILLSWITCH_ENGAGED'
          : 'BLOCKED: MANUAL_KILLSWITCH_STOP';

      const newOrder: SimulatedOrder = {
        id: `MAN-IN-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: timeStr,
        timestampMs: now,
        symbol: orderData.symbol,
        side: orderData.side,
        qty: orderData.qty,
        price: orderData.price,
        totalValue,
        status: 'REJECTED',
        rejectionReason: reason,
        serverId: 'SRV-ORD-01',
      };

      setOrders((prev) => [newOrder, ...prev.slice(0, 49)]);
      setMetrics((prev) => ({
        ...prev,
        totalOrdersProcessed: prev.totalOrdersProcessed + 1,
        totalOrdersRejected: prev.totalOrdersRejected + 1,
        totalCapitalProtected: prev.totalCapitalProtected + totalValue,
      }));

      addAlert(
        'WARNING',
        'ANOMALY',
        `Test Order Blocked: ${orderData.side} ${orderData.qty} ${orderData.symbol}`,
        `Attempted order while trading engine is stopped (${engineStatus}). Order blocked at safety shield.`,
        `${formatINR(totalValue)}`,
        'Engine Stopped',
        'Engine paused safety rejection',
        'Safety shield blocked order; money protected'
      );

      return {
        success: false,
        message: `ORDER SAFELY BLOCKED: Trading engine is stopped (${engineStatus}). Money saved: ${formatINR(totalValue)}.`,
      };
    }

    // 2. Check if exceeds single order value limit (₹50 Lakhs)
    if (totalValue > thresholds.maxSingleOrderValue) {
      const newOrder: SimulatedOrder = {
        id: `MAN-IN-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: timeStr,
        timestampMs: now,
        symbol: orderData.symbol,
        side: orderData.side,
        qty: orderData.qty,
        price: orderData.price,
        totalValue,
        status: 'REJECTED',
        rejectionReason: 'BLOCKED: EXCEEDS_50L_SINGLE_LIMIT',
        serverId: 'SRV-ORD-01',
      };

      setOrders((prev) => [newOrder, ...prev.slice(0, 49)]);
      setMetrics((prev) => ({
        ...prev,
        totalOrdersProcessed: prev.totalOrdersProcessed + 1,
        totalOrdersRejected: prev.totalOrdersRejected + 1,
        totalCapitalProtected: prev.totalCapitalProtected + totalValue,
      }));

      addAlert(
        'WARNING',
        'EXPOSURE',
        `Single Order Limit Crossed: ${orderData.symbol} (${formatINR(totalValue)})`,
        `Order exceeds maximum allowed single order limit (${formatINR(thresholds.maxSingleOrderValue)}).`,
        `${formatINR(totalValue)}`,
        `Max ${formatINR(thresholds.maxSingleOrderValue)}`,
        'Oversized single trade safety rule',
        'Safety filter rejected order'
      );

      return {
        success: false,
        message: `ORDER BLOCKED: Order value (${formatINR(totalValue)}) exceeds single-trade limit (${formatINR(thresholds.maxSingleOrderValue)}).`,
      };
    }

    // 3. Otherwise order executes successfully
    const newOrder: SimulatedOrder = {
      id: `MAN-IN-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: timeStr,
      timestampMs: now,
      symbol: orderData.symbol,
      side: orderData.side,
      qty: orderData.qty,
      price: orderData.price,
      totalValue,
      status: 'EXECUTED',
      serverId: 'SRV-ORD-01',
    };

    setOrders((prev) => [newOrder, ...prev.slice(0, 49)]);
    setMetrics((prev) => ({
      ...prev,
      totalOrdersProcessed: prev.totalOrdersProcessed + 1,
      totalOrdersExecuted: prev.totalOrdersExecuted + 1,
      currentExposure: prev.currentExposure + (orderData.side === 'BUY' ? totalValue : -totalValue),
    }));

    return {
      success: true,
      message: `ORDER FILLED: ${orderData.side} ${orderData.qty} ${orderData.symbol} @ ₹${orderData.price.toFixed(2)} (${formatINR(totalValue)}).`,
    };
  };

  // Audio mute toggle
  const handleToggleAudio = () => {
    const nextState = !isAudioMutedState;
    setIsAudioMutedState(nextState);
    setAudioMuted(nextState);
    if (!nextState) {
      playSound('click');
    }
  };

  // Run AI Risk Analyst
  const handleOpenAIDiagnostic = async () => {
    setIsAIDiagnosticOpen(true);
    setIsAiLoading(true);
    try {
      const report = await runAIIncidentDiagnostic(
        alerts,
        metrics,
        servers,
        thresholds,
        currentMode
      );
      setAiReport(report);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Real-Time Stock Candlestick Ticker calculation for NSE Indian Stocks
  const currentCandles = stockCandles[selectedStockSymbol] || [];
  const lastCandle = currentCandles[currentCandles.length - 1];
  const firstCandle = currentCandles[0];
  const currentPrice = lastCandle ? lastCandle.close : (INDIAN_STOCK_PRICES[selectedStockSymbol] || 1000);
  const prevClose = firstCandle ? firstCandle.open : currentPrice;
  const change = +(currentPrice - prevClose).toFixed(2);
  const changePercent = prevClose ? +((change / prevClose) * 100).toFixed(2) : 0;
  const dayHigh = currentCandles.reduce((max, c) => Math.max(max, c.high), currentPrice);
  const dayLow = currentCandles.reduce((min, c) => Math.min(min, c.low), currentPrice);
  const totalVolume = currentCandles.reduce((sum, c) => sum + c.volume, 0);

  const stockMeta = AVAILABLE_STOCKS.find((s) => s.symbol === selectedStockSymbol) || {
    symbol: selectedStockSymbol,
    name: selectedStockSymbol,
    basePrice: currentPrice,
  };

  const tickerInfo: StockTickerInfo = {
    symbol: selectedStockSymbol,
    name: stockMeta.name,
    exchange: 'NSE',
    currentPrice,
    prevClose,
    dayHigh,
    dayLow,
    change,
    changePercent,
    totalVolume,
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-white">
      {/* 1. Header */}
      <Header
        engineStatus={engineStatus}
        isAudioMuted={isAudioMutedState}
        onToggleAudio={handleToggleAudio}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAIDiagnostic={handleOpenAIDiagnostic}
        onOpenServerModal={() => {
          document.getElementById('server-cluster-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        serverMismatchCount={servers.filter((s) => s.status === 'MISMATCH').length}
        totalServers={servers.length}
        currentTimeStr={currentTimeStr}
      />

      {/* Main Dashboard Container */}
      <main className="max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-5">
        {/* Interactive Guided Tour Banner */}
        <GuidedTourBanner
          activeStep={activeTourStep}
          onSelectStep={handleSelectTourStep}
          onOpenGlossary={() => setIsGlossaryOpen(true)}
        />

        {/* Real-Time Situational Context & Plain English Guide Banner */}
        <LiveIncidentGuideBanner
          engineStatus={engineStatus}
          currentMode={currentMode}
          onResetDemo={handleResetDemo}
          onDeployPatch={() => handleSyncServer('srv-02')}
          onOpenOrderInjector={() => setIsOrderInjectorOpen(true)}
          onStartNormal={handleStartNormal}
        />

        {/* 2. Interactive Incident Scenarios & Controls Bar */}
        <ScenarioBar
          currentMode={currentMode}
          engineStatus={engineStatus}
          onStartNormal={handleStartNormal}
          onTriggerRogue={handleTriggerRogue}
          onTriggerOutdatedServer={handleTriggerOutdatedServer}
          onEmergencyKillSwitch={handleEmergencyKillSwitch}
          onResetDemo={handleResetDemo}
          onOpenOrderInjector={() => setIsOrderInjectorOpen(true)}
        />

        {/* 3. Real-Time KPI Metric Cards */}
        <MetricsCards
          metrics={metrics}
          thresholds={thresholds}
          servers={servers}
          engineStatus={engineStatus}
        />

        {/* 4. Real-Time Stock Market Candlestick & Tick Stream Monitor */}
        <StockCandlestickChart
          candles={currentCandles}
          ticker={tickerInfo}
          availableSymbols={AVAILABLE_STOCKS}
          selectedSymbol={selectedStockSymbol}
          onSelectSymbol={(sym) => setSelectedStockSymbol(sym)}
          engineStatus={engineStatus}
          currentMode={currentMode}
        />

        {/* 5. Telemetry Stream Chart & Server Cluster Integrity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12 xl:col-span-7">
            <TelemetryChart
              history={metrics.history}
              thresholds={thresholds}
              currentRate={metrics.currentOrderRate}
              currentExposure={metrics.currentExposure}
            />
          </div>

          <div id="server-cluster-section" className="lg:col-span-12 xl:col-span-5">
            <ServerClusterView
              servers={servers}
              onSyncServer={handleSyncServer}
              onSyncAll={handleSyncAllServers}
              isLocked={engineStatus === 'LOCKED_DEPLOYMENT'}
            />
          </div>
        </div>

        {/* 5. Risk Event Log & Recent Orders Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12 xl:col-span-6">
            <RiskAlertsLog
              alerts={alerts}
              onClearAlerts={() => setAlerts([])}
            />
          </div>

          <div className="lg:col-span-12 xl:col-span-6">
            <RecentOrdersTable orders={orders} />
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="border-t border-slate-900 bg-[#060a14] py-4 px-6 text-center text-xs text-slate-500 font-mono">
        <p>
          RiskLock India • SEBI Pre-Trade Risk Framework (NSE / BSE) • Fully Simulated Environment (No Real Money at Risk)
        </p>
      </footer>

      {/* Modals */}
      <RiskThresholdsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        thresholds={thresholds}
        onSaveThresholds={(newLimits) => {
          setThresholds(newLimits);
          addAlert(
            'INFO',
            'EXPOSURE',
            'Safe Limits Updated',
            `Max Speed Limit: ${newLimits.maxOrderRateCritical}/s, Max Exposure Cap: ${formatINR(newLimits.maxExposureCritical)}, Single Order Cap: ${formatINR(newLimits.maxSingleOrderValue)}`,
            'Limits Saved',
            'User configured',
            'Settings updated',
            'Updated pre-trade gating parameters'
          );
        }}
      />

      <AIDiagnosticModal
        isOpen={isAIDiagnosticOpen}
        onClose={() => setIsAIDiagnosticOpen(false)}
        report={aiReport}
        isLoading={isAiLoading}
        onRefresh={handleOpenAIDiagnostic}
      />

      <OrderInjectorModal
        isOpen={isOrderInjectorOpen}
        onClose={() => setIsOrderInjectorOpen(false)}
        onSubmitOrder={handleSubmitManualOrder}
        engineStatus={engineStatus}
      />

      <EducationalGlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />
    </div>
  );
}
