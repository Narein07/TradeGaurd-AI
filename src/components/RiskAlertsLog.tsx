import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  ShieldBan,
  Download,
  Filter,
  Check,
  Trash2,
} from 'lucide-react';
import { RiskAlert, AlertSeverity } from '../types';

interface RiskAlertsLogProps {
  alerts: RiskAlert[];
  onClearAlerts: () => void;
}

export const RiskAlertsLog: React.FC<RiskAlertsLogProps> = ({ alerts, onClearAlerts }) => {
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | 'ALL' | 'BLOCKED'>('ALL');
  const [copied, setCopied] = useState(false);

  const filteredAlerts = alerts.filter((alert) => {
    if (filterSeverity === 'ALL') return true;
    if (filterSeverity === 'BLOCKED') return alert.category === 'ANOMALY' || alert.title.includes('Blocked') || alert.title.includes('Rejected');
    return alert.severity === filterSeverity;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const warningCount = alerts.filter((a) => a.severity === 'WARNING').length;

  const exportLogsAsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(alerts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `risklock-audit-log-${new Date().toISOString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const copyLogsToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(alerts, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0e1628] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-800/50 text-rose-400">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              Safety Event & Audit Log
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {alerts.length} Events
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Live record of every blocked trade, speed alert, server check, and emergency action
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={copyLogsToClipboard}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs transition cursor-pointer"
            title="Copy audit log to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Export JSON'}</span>
          </button>
          <button
            onClick={onClearAlerts}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 text-xs transition cursor-pointer"
            title="Clear event logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 text-xs font-medium">
        <button
          onClick={() => setFilterSeverity('ALL')}
          className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
            filterSeverity === 'ALL'
              ? 'bg-slate-700 text-white font-semibold'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          All ({alerts.length})
        </button>
        <button
          onClick={() => setFilterSeverity('CRITICAL')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition cursor-pointer ${
            filterSeverity === 'CRITICAL'
              ? 'bg-rose-600 text-white font-semibold'
              : 'text-rose-400 hover:bg-rose-950/40 bg-slate-900/60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          Critical ({criticalCount})
        </button>
        <button
          onClick={() => setFilterSeverity('WARNING')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition cursor-pointer ${
            filterSeverity === 'WARNING'
              ? 'bg-amber-600 text-slate-950 font-semibold'
              : 'text-amber-400 hover:bg-amber-950/40 bg-slate-900/60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Warnings ({warningCount})
        </button>
        <button
          onClick={() => setFilterSeverity('INFO')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition cursor-pointer ${
            filterSeverity === 'INFO'
              ? 'bg-cyan-600 text-white font-semibold'
              : 'text-cyan-400 hover:bg-cyan-950/40 bg-slate-900/60'
          }`}
        >
          <Info className="w-3 h-3" />
          System Info
        </button>
      </div>

      {/* Alerts Scroll List */}
      <div className="overflow-y-auto max-h-[380px] space-y-2.5 pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-mono border border-dashed border-slate-800 rounded-xl">
            No events logged for current filter. System operating smoothly.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isWarning = alert.severity === 'WARNING';

            return (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCritical
                    ? 'bg-rose-950/20 border-rose-500/50 hover:border-rose-400'
                    : isWarning
                    ? 'bg-amber-950/15 border-amber-500/40 hover:border-amber-400'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    {isCritical ? (
                      <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    )}
                    <h4
                      className={`text-xs font-bold ${
                        isCritical
                          ? 'text-rose-200'
                          : isWarning
                          ? 'text-amber-200'
                          : 'text-slate-200'
                      }`}
                    >
                      {alert.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded font-bold ${
                        isCritical
                          ? 'bg-rose-900/80 text-rose-300 border border-rose-700'
                          : isWarning
                          ? 'bg-amber-900/80 text-amber-300 border border-amber-700'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {alert.timestamp}
                    </span>
                  </div>
                </div>

                {/* Explanation text */}
                <p className="text-xs text-slate-300/90 leading-relaxed pl-6 mb-2">
                  {alert.message}
                </p>

                {/* Context breakdown: Root cause and action taken */}
                {(alert.triggerValue || alert.rootCause || alert.actionTaken) && (
                  <div className="ml-6 bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80 text-[11px] font-mono space-y-1">
                    {alert.triggerValue && (
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Trigger Metric vs Limit:</span>
                        <span className={isCritical ? 'text-rose-400 font-bold' : 'text-amber-400'}>
                          {alert.triggerValue} {alert.thresholdValue && `(Threshold: ${alert.thresholdValue})`}
                        </span>
                      </div>
                    )}
                    {alert.rootCause && (
                      <div className="text-slate-400">
                        <strong className="text-slate-300">Root Cause:</strong> {alert.rootCause}
                      </div>
                    )}
                    {alert.actionTaken && (
                      <div className="text-emerald-400/90 flex items-center gap-1">
                        <strong className="text-emerald-400">Action:</strong> {alert.actionTaken}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
