export type ServerStatusType = 'HEALTHY' | 'MISMATCH' | 'OFFLINE';

export interface TradingServer {
  id: string;
  name: string;
  role: 'PRIMARY' | 'SECONDARY' | 'REPLICA';
  datacenter: string;
  currentVersion: string;
  approvedVersion: string;
  checksum: string;
  status: ServerStatusType;
  cpuUsage: number;
  memoryUsage: number;
  ordersHandled: number;
  lastHeartbeat: string;
}

export type EngineStatus =
  | 'ACTIVE_NORMAL'
  | 'ELEVATED_RISK'
  | 'HALTED_AUTO'
  | 'HALTED_MANUAL'
  | 'LOCKED_DEPLOYMENT';

export type SimulationMode =
  | 'NORMAL'
  | 'ROGUE'
  | 'OUTDATED_SERVER'
  | 'HALTED_MANUAL'
  | 'IDLE';

export type OrderSide = 'BUY' | 'SELL';

export type OrderStatus = 'EXECUTED' | 'REJECTED';

export interface SimulatedOrder {
  id: string;
  timestamp: string;
  timestampMs: number;
  symbol: string;
  side: OrderSide;
  qty: number;
  price: number;
  totalValue: number;
  status: OrderStatus;
  rejectionReason?: string;
  serverId: string;
  isLoopAnomaly?: boolean;
}

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type AlertCategory =
  | 'DEPLOYMENT'
  | 'ORDER_RATE'
  | 'EXPOSURE'
  | 'ANOMALY'
  | 'KILL_SWITCH'
  | 'MANUAL_OVERRIDE';

export interface RiskAlert {
  id: string;
  timestamp: string;
  timestampMs: number;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  message: string;
  triggerValue?: string;
  thresholdValue?: string;
  rootCause?: string;
  actionTaken: string;
}

export interface RiskThresholds {
  maxOrderRateWarning: number;
  maxOrderRateCritical: number;
  maxExposureWarning: number; // in INR (e.g. ₹7,50,00,000 / ₹7.5 Cr)
  maxExposureCritical: number; // in INR (e.g. ₹10,00,00,000 / ₹10 Cr)
  maxSingleOrderValue: number; // in INR (e.g. ₹50,00,000 / ₹50 Lakhs)
  autoHaltOnCritical: boolean;
}

export interface MetricHistoryPoint {
  timeStr: string;
  orderRate: number;
  exposureCrores: number;
}

export interface SimulatedMetrics {
  currentOrderRate: number;
  peakOrderRate: number;
  currentExposure: number; // in INR
  totalOrdersProcessed: number;
  totalOrdersExecuted: number;
  totalOrdersRejected: number;
  totalCapitalProtected: number; // in INR
  currentPnl: number; // in INR
  history: MetricHistoryPoint[];
}

export interface AIAnalysisReport {
  timestamp: string;
  incidentTitle: string;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  executiveSummary: string;
  anomalyTaxonomy: string;
  regulatoryExposure: string;
  immediateActions: string[];
  longTermRemediation: string[];
  source: 'GEMINI_AI' | 'DETERMINISTIC_EXPERT_SYSTEM';
}

export interface CandlestickData {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockTickerInfo {
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  currentPrice: number;
  prevClose: number;
  dayHigh: number;
  dayLow: number;
  change: number;
  changePercent: number;
  totalVolume: number;
}

