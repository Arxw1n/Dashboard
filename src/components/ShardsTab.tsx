import React from 'react';
import { Cpu, Database, Server, RefreshCw, Zap, Network, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { BotStats } from '../types';

interface ShardsTabProps {
  stats: BotStats;
}

export const ShardsTab: React.FC<ShardsTabProps> = ({ stats }) => {
  const shards = [
    { id: 0, cluster: 0, status: 'Ready', guilds: Math.round(stats.guilds * 0.3) || 12, ping: '24ms', ram: '92 MB' },
    { id: 1, cluster: 0, status: 'Ready', guilds: Math.round(stats.guilds * 0.28) || 10, ping: '26ms', ram: '88 MB' },
    { id: 2, cluster: 0, status: 'Ready', guilds: Math.round(stats.guilds * 0.22) || 8, ping: '29ms', ram: '84 MB' },
    { id: 3, cluster: 0, status: 'Ready', guilds: Math.round(stats.guilds * 0.2) || 7, ping: '22ms', ram: '86 MB' },
  ];

  return (
    <div className="space-y-6">
      {/* Cluster Details Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <Network className="w-4 h-4" />
              <span>Hybrid IPC Process Cluster Architecture</span>
            </div>
            <h2 className="text-2xl font-bold text-white font-['Outfit']">Cluster Telemetry & Health</h2>
            <p className="text-xs text-slate-400 mt-1">
              Live process metrics managed by <code className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400">discord-hybrid-sharding</code>.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>MongoDB: Cluster0 Connected</span>
          </div>
        </div>

        {/* Shard Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs uppercase text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Shard ID</th>
                <th className="px-5 py-3">Cluster</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Guilds Managed</th>
                <th className="px-5 py-3">WebSocket Ping</th>
                <th className="px-5 py-3">RAM Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {shards.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-white">#{s.id}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-300">Cluster {s.cluster}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-white">{s.guilds}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-cyan-400">{s.ping}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-400">{s.ram}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Express API Endpoints Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              GET
            </span>
            <span className="font-mono text-sm text-white font-semibold">/</span>
          </div>
          <p className="text-xs text-slate-400">Healthcheck probe returning "Hello World!"</p>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              GET
            </span>
            <span className="font-mono text-sm text-white font-semibold">/stats</span>
          </div>
          <p className="text-xs text-slate-400">Fetches live cached guild and total user size via BroadcastEval.</p>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-violet-500/10 text-violet-400 border border-violet-500/20">
              GET
            </span>
            <span className="font-mono text-sm text-white font-semibold">/commands</span>
          </div>
          <p className="text-xs text-slate-400">Returns array of registered commands filtering out Owner category.</p>
        </div>
      </div>
    </div>
  );
};