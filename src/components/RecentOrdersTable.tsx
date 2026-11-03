import React from 'react';
import { ShoppingCart, CheckCircle, XCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { SimulatedOrder } from '../types';
import { formatINR, formatIndianNumber } from '../utils/format';

interface RecentOrdersTableProps {
  orders: SimulatedOrder[];
}

export const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({ orders }) => {
  return (
    <div className="bg-[#0e1628] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-950/80 border border-indigo-800/50 text-indigo-400">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              Live Indian Stock Orders (NSE / BSE)
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Live Feed
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Watch orders getting executed or blocked in real time by the safety shield
            </p>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] sticky top-0 z-10 border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3">Order ID</th>
              <th className="py-2.5 px-3">Stock Symbol</th>
              <th className="py-2.5 px-3">Action</th>
              <th className="py-2.5 px-3 text-right">Shares (Qty)</th>
              <th className="py-2.5 px-3 text-right">Price (₹)</th>
              <th className="py-2.5 px-3 text-right">Total (₹)</th>
              <th className="py-2.5 px-3">Server</th>
              <th className="py-2.5 px-3 text-center">Safety Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500 font-sans">
                  No orders generated yet. Click a scenario button above to start the live stream.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const isExecuted = order.status === 'EXECUTED';
                const isBuy = order.side === 'BUY';

                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      !isExecuted ? 'bg-rose-950/20' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                      {order.timestamp}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 truncate max-w-[90px]">
                      {order.id}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">
                      {order.symbol}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isBuy
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                        }`}
                      >
                        {isBuy ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {order.side === 'BUY' ? 'BUY' : 'SELL'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      {formatIndianNumber(order.qty)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      ₹{order.price.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-200">
                      {formatINR(order.totalValue)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {order.serverId}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {isExecuted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/90 text-emerald-400 border border-emerald-800/80">
                          <CheckCircle className="w-3 h-3" />
                          <span>FILLED (SAFE)</span>
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-600 animate-pulse"
                          title={order.rejectionReason}
                        >
                          <XCircle className="w-3 h-3 text-rose-400" />
                          <span>{order.rejectionReason || 'BLOCKED: RISK LIMIT'}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
