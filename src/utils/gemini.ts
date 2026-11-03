import { GoogleGenAI } from '@google/genai';
import { AIAnalysisReport, RiskAlert, RiskThresholds, SimulatedMetrics, TradingServer } from '../types';
import { formatINR } from './format';

export async function runAIIncidentDiagnostic(
  alerts: RiskAlert[],
  metrics: SimulatedMetrics,
  servers: TradingServer[],
  thresholds: RiskThresholds,
  currentMode: string
): Promise<AIAnalysisReport> {
  const latestCriticalOrWarning = alerts.find(
    (a) => a.severity === 'CRITICAL' || a.severity === 'WARNING'
  );

  const incidentContext = {
    currentMode,
    orderRatePerSecond: metrics.currentOrderRate,
    peakOrderRate: metrics.peakOrderRate,
    financialExposureINR: formatINR(metrics.currentExposure),
    ordersRejectedCount: metrics.totalOrdersRejected,
    capitalProtectedINR: formatINR(metrics.totalCapitalProtected),
    servers: servers.map((s) => ({
      name: s.name,
      location: s.datacenter,
      version: s.currentVersion,
      status: s.status,
    })),
  };

  // Check for GEMINI API key in environment
  const apiKey =
    typeof process !== 'undefined' && process.env?.GEMINI_API_KEY
      ? process.env.GEMINI_API_KEY
      : typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: { VITE_GEMINI_API_KEY?: string } }).env?.VITE_GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are RiskLock's Senior Risk and Safety Auditor for Indian financial markets (NSE/BSE).
Explain the following trading incident in simple, clear, easy-to-understand terms for a beginner or financial risk officer:
Context: ${JSON.stringify(incidentContext, null, 2)}

Provide the response in valid JSON matching this schema:
{
  "incidentTitle": "Simple clear incident title",
  "threatLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "executiveSummary": "2-3 simple sentences in plain language explaining what went wrong and how money was protected",
  "anomalyTaxonomy": "Clear name of the issue (e.g. Rogue Trading Loop, Server Version Mismatch, Exposure Cap Breach)",
  "regulatoryExposure": "Mention SEBI Algorithmic Trading Pre-Trade Risk Controls & circular guidelines in simple words",
  "immediateActions": ["3 simple step-by-step actions taken to stay safe"],
  "longTermRemediation": ["3 simple long-term recommendations to prevent this"]
}
Return only JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const responseText = response.text || '';
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        timestamp: new Date().toLocaleTimeString('en-IN'),
        incidentTitle: parsed.incidentTitle || 'Trading Anomaly Diagnostic',
        threatLevel: parsed.threatLevel || 'HIGH',
        executiveSummary: parsed.executiveSummary || 'Anomaly detected and contained by safety thresholds.',
        anomalyTaxonomy: parsed.anomalyTaxonomy || 'Algorithmic Execution Discrepancy',
        regulatoryExposure: parsed.regulatoryExposure || 'SEBI Algorithmic Trading Pre-Trade Risk Controls',
        immediateActions: parsed.immediateActions || ['Stop order routing', 'Clear active broker queues', 'Isolate rogue node'],
        longTermRemediation: parsed.longTermRemediation || ['Strict deployment checks', 'Automated kill switches', 'Continuous system audit'],
        source: 'GEMINI_AI',
      };
    } catch (err) {
      console.warn('Gemini AI call fell back to deterministic safety engine:', err);
    }
  }

  // Fallback to high-fidelity Deterministic Expert System
  return generateDeterministicDiagnostic(latestCriticalOrWarning, metrics, servers, thresholds, currentMode);
}

export function generateDeterministicDiagnostic(
  alert: RiskAlert | undefined,
  metrics: SimulatedMetrics,
  servers: TradingServer[],
  thresholds: RiskThresholds,
  currentMode: string
): AIAnalysisReport {
  const timestamp = new Date().toLocaleTimeString('en-IN');
  const mismatchedServer = servers.find((s) => s.status === 'MISMATCH');

  if (mismatchedServer || currentMode === 'OUTDATED_SERVER') {
    return {
      timestamp,
      incidentTitle: 'Server Software Mismatch: Unapproved Code Detected',
      threatLevel: 'CRITICAL',
      executiveSummary: `Server ${mismatchedServer?.name || 'SRV-ORD-02'} is running old software (${mismatchedServer?.currentVersion || 'v3.12.0-LEGACY'}) instead of the verified version (${mismatchedServer?.approvedVersion || 'v4.18.2-RELEASE'}). In 2012, Knight Capital lost $440M in 45 minutes because 1 server ran old code. RiskLock prevented this by locking the trading engine instantly before any bad orders could go through.`,
      anomalyTaxonomy: 'Server Version Mismatch (Knight Capital Prevention)',
      regulatoryExposure: 'SEBI System Audit Guidelines & Exchange Pre-Trade Code Deployment Rules',
      immediateActions: [
        'Locked all order intake to prevent unintended orders',
        'Disconnected the outdated server node from the trading ring',
        'Protected all client capital and trading margin',
      ],
      longTermRemediation: [
        'Always check that all servers run identical code before opening the market',
        'Remove old unused code routines from the trading system',
        'Use automated software deployment verification tools',
      ],
      source: 'DETERMINISTIC_EXPERT_SYSTEM',
    };
  }

  if (metrics.currentOrderRate >= thresholds.maxOrderRateCritical || currentMode === 'ROGUE') {
    return {
      timestamp,
      incidentTitle: 'Rogue Trading Loop: Order Speed Too High',
      threatLevel: 'CRITICAL',
      executiveSummary: `The trading algorithm started looping out of control, firing ${metrics.peakOrderRate.toLocaleString('en-IN')} orders every second! This is way higher than the safe limit of ${thresholds.maxOrderRateCritical}/sec. RiskLock pulled the Emergency Kill Switch automatically, freezing the algorithm and saving ${formatINR(metrics.totalCapitalProtected)} from loss.`,
      anomalyTaxonomy: 'Runaway Algorithmic Loop (High-Speed Order Flood)',
      regulatoryExposure: 'SEBI Pre-Trade Risk Controls & Order-to-Trade Ratio (OTR) Limits',
      immediateActions: [
        'Emergency Kill Switch automatically pulled; trading halted',
        'Blocked all rapid repeated buy orders at the safety gateway',
        'Preserved account balance and prevented exchange penalties',
      ],
      longTermRemediation: [
        'Set hard software speed limits directly in the algorithm code',
        'Add a loop-detector that pauses repeated identical orders',
        'Require manager approval before restarting a halted algorithm',
      ],
      source: 'DETERMINISTIC_EXPERT_SYSTEM',
    };
  }

  if (metrics.currentExposure >= thresholds.maxExposureCritical) {
    return {
      timestamp,
      incidentTitle: 'Money at Risk Exceeded Safe Limit',
      threatLevel: 'CRITICAL',
      executiveSummary: `Total money in active trades reached ${formatINR(metrics.currentExposure)}, breaking your maximum safe limit of ${formatINR(thresholds.maxExposureCritical)}. RiskLock stepped in to stop any new buy orders to keep your capital safe.`,
      anomalyTaxonomy: 'Maximum Investment Exposure Limit Breached',
      regulatoryExposure: 'SEBI Member Broker Pre-Trade Credit & Position Limits',
      immediateActions: [
        'Paused all new buying to avoid dangerous margin calls',
        'Kept existing positions secure while alerting the risk manager',
        'Saved capital from exceeding clearing house limits',
      ],
      longTermRemediation: [
        'Split investment budgets across individual stocks and desks',
        'Set early warning alerts when 75% of your budget is used',
        'Review risk limits daily based on market volatility',
      ],
      source: 'DETERMINISTIC_EXPERT_SYSTEM',
    };
  }

  return {
    timestamp,
    incidentTitle: 'System Healthy: All Safe & Operating Normally',
    threatLevel: 'LOW',
    executiveSummary: `Everything is running safely. All 3 servers are running verified code (${servers[0]?.approvedVersion || 'v4.18.2-RELEASE'}). Order speed (${metrics.currentOrderRate}/sec) and money at risk (${formatINR(metrics.currentExposure)}) are well within safe bounds.`,
    anomalyTaxonomy: 'Normal Controlled Trading Flow',
    regulatoryExposure: 'Fully compliant with SEBI Pre-Trade Risk Guidelines',
    immediateActions: [
      'Continuing real-time second-by-second safety monitoring',
      'Recording all order activity in the safety audit log',
      'Keeping servers in sync and ready to intervene if needed',
    ],
    longTermRemediation: [
      'Perform regular safety drills to test emergency shutoff',
      'Keep software updated across all trading systems',
    ],
    source: 'DETERMINISTIC_EXPERT_SYSTEM',
  };
}
