import React from 'react';
import {
  Server,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Cpu,
  Layers,
  ShieldAlert,
  GitCommit,
} from 'lucide-react';
import { TradingServer } from '../types';

interface ServerClusterViewProps {
  servers: TradingServer[];
  onSyncServer: (serverId: string) => void;
  onSyncAll: () => void;
  isLocked: boolean;
}

export const ServerClusterView: React.FC<ServerClusterViewProps> = ({
  servers,
  onSyncServer,
  onSyncAll,
  isLocked,
}) => {
  const hasMismatch = servers.some((s) => s.status === 'MISMATCH');

  return (
    <div className="bg-[#0e1628] border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/50 text-cyan-400">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              Trading Servers & Software Verification
              {hasMismatch ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
                  VERSION CONFLICT FOUND
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  ALL 3 SERVERS MATCH
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Checks that all trading servers in Mumbai run the exact same approved software code
            </p>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-2">
          {hasMismatch && (
            <button
              onClick={onSyncAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/30 transition cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Update All Servers</span>
            </button>
          )}
        </div>
      </div>

      {/* Knight Capital Warning Banner if mismatch */}
      {hasMismatch && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/60 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="text-rose-200 font-bold mb-0.5">
              DANGER: Server SRV-ORD-02 is running Old Software!
            </p>
            <p className="text-rose-300/80 leading-relaxed">
              Server <strong className="text-rose-200">SRV-ORD-02 (BSE Fort)</strong> is running an outdated version{' '}
              <span className="font-mono bg-rose-900/60 px-1 py-0.5 rounded">v3.12.0-LEGACY</span>. Old code has bugs that can place millions of unwanted orders in seconds (like Knight Capital lost ₹3,600 Cr / $440M). RiskLock has automatically locked the system to keep your money safe until updated.
            </p>
          </div>
        </div>
      )}

      {/* Server Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {servers.map((server) => {
          const isMismatch = server.status === 'MISMATCH';

          return (
            <div
              key={server.id}
              className={`p-4 rounded-xl border transition-all duration-300 relative ${
                isMismatch
                  ? 'bg-rose-950/20 border-rose-500/70 shadow-lg shadow-rose-950/30'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Top row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isMismatch ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'
                    }`}
                  />
                  <span className="text-xs font-bold text-white font-mono">{server.name}</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                    server.role === 'PRIMARY'
                      ? 'bg-blue-950 text-blue-300 border border-blue-800'
                      : server.role === 'SECONDARY'
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-purple-950 text-purple-300 border border-purple-800'
                  }`}
                >
                  {server.role === 'PRIMARY' ? 'MAIN ROUTER' : server.role === 'SECONDARY' ? 'BACKUP' : 'REPLICA'}
                </span>
              </div>

              {/* Datacenter */}
              <div className="text-[11px] text-slate-400 mb-2.5 flex items-center justify-between">
                <span>Location:</span>
                <span className="font-medium text-slate-300">{server.datacenter}</span>
              </div>

              {/* Version Comparison */}
              <div className="bg-slate-950/70 rounded-lg p-2.5 mb-3 border border-slate-800/80 space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Software Running:</span>
                  <span
                    className={`font-bold ${
                      isMismatch ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                    }`}
                  >
                    {server.currentVersion}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Target Version:</span>
                  <span className="text-slate-300">{server.approvedVersion}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/60">
                  <span className="text-slate-500 flex items-center gap-1">
                    <GitCommit className="w-3 h-3 text-slate-500" /> Code ID:
                  </span>
                  <span className="text-slate-400 truncate max-w-[120px]" title={server.checksum}>
                    {server.checksum}
                  </span>
                </div>
              </div>

              {/* Health stats */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 mb-3">
                <div className="flex items-center gap-1.5 bg-slate-800/40 px-2 py-1 rounded">
                  <Cpu className="w-3 h-3 text-slate-500" />
                  <span>CPU: {server.cpuUsage}%</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-800/40 px-2 py-1 rounded">
                  <Layers className="w-3 h-3 text-slate-500" />
                  <span>Orders: {server.ordersHandled}</span>
                </div>
              </div>

              {/* Action Button */}
              {isMismatch ? (
                <button
                  onClick={() => onSyncServer(server.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-900/40 transition cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Update to Verified {server.approvedVersion}</span>
                </button>
              ) : (
                <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-400 font-semibold py-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Safe</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
