import React from 'react';
import {
  X,
  Sparkles,
  ShieldAlert,
  FileCheck2,
  Cpu,
  Scale,
  ListOrdered,
  RefreshCw,
} from 'lucide-react';
import { AIAnalysisReport } from '../types';

interface AIDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AIAnalysisReport | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const AIDiagnosticModal: React.FC<AIDiagnosticModalProps> = ({
  isOpen,
  onClose,
  report,
  isLoading,
  onRefresh,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0e1628] border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#0a1020]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-700 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Risk & Anomaly Diagnostic Post-Mortem
                </h3>
                {report?.source === 'GEMINI_AI' ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-900 text-indigo-300 border border-indigo-700">
                    GEMINI 2.5 FLASH
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                    DETERMINISTIC SAFETY ENGINE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Institutional-grade algorithmic anomaly forensics and SEC compliance check
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Refresh Diagnostic Analysis"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-slate-300 font-medium">Analyzing trading telemetry and order logs...</p>
              <p className="text-[11px] font-mono text-slate-500">Cross-referencing SEC Rule 15c-3 thresholds and historical incident taxonomy</p>
            </div>
          ) : report ? (
            <>
              {/* Incident Title & Threat Level Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                  report.threatLevel === 'CRITICAL'
                    ? 'bg-rose-950/40 border-rose-500/60'
                    : report.threatLevel === 'HIGH'
                    ? 'bg-amber-950/40 border-amber-500/60'
                    : 'bg-emerald-950/30 border-emerald-500/50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase ${
                        report.threatLevel === 'CRITICAL'
                          ? 'bg-rose-600 text-white animate-pulse'
                          : report.threatLevel === 'HIGH'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      THREAT LEVEL: {report.threatLevel}
                    </span>
                    <span className="text-slate-400 text-[11px] font-mono">
                      Generated at {report.timestamp}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{report.incidentTitle}</h4>
                </div>
                <ShieldAlert
                  className={`w-6 h-6 shrink-0 ${
                    report.threatLevel === 'CRITICAL'
                      ? 'text-rose-400'
                      : report.threatLevel === 'HIGH'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                />
              </div>

              {/* Executive Summary */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5" /> Executive Forensic Summary
                </span>
                <p className="text-slate-200 leading-relaxed">{report.executiveSummary}</p>
              </div>

              {/* Anomaly Taxonomy & Regulatory Scope */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Anomaly Classification
                  </span>
                  <p className="text-indigo-200 font-semibold font-mono text-xs">
                    {report.anomalyTaxonomy}
                  </p>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                    <Scale className="w-3.5 h-3.5 text-amber-400" /> Regulatory Impact
                  </span>
                  <p className="text-amber-200/90 font-medium text-xs">
                    {report.regulatoryExposure}
                  </p>
                </div>
              </div>

              {/* Immediate Containment Actions */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                  <ListOrdered className="w-3.5 h-3.5 text-rose-400" /> Immediate Tactical Interventions
                </span>
                <ul className="space-y-1.5 pl-2">
                  {report.immediateActions.map((action, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300">
                      <span className="text-rose-400 font-bold font-mono">[{i + 1}]</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Long Term Prevention */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" /> Long-Term Remediation & Controls
                </span>
                <ul className="space-y-1.5 pl-2">
                  {report.longTermRemediation.map((rem, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300">
                      <span className="text-emerald-400 font-bold font-mono">•</span>
                      <span>{rem}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Model Transparency Disclaimer */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>
                  <strong>Safety Architecture Note:</strong> Deterministic pre-trade circuit breakers operate locally in sub-millisecond execution time. AI analysis acts strictly as a supervisory post-trade / advisory auditor.
                </span>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
