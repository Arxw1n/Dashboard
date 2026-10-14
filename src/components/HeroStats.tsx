import React from 'react';
import { Server, Users, Cpu, ShieldCheck, Zap, Lock, Terminal, Radio } from 'lucide-react';
import { BotStats } from '../types';

interface HeroStatsProps {
  stats: BotStats;
}

export const HeroStats: React.FC<HeroStatsProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-violet-500/20 bg-gradient-to-r from-violet-950/30 via-slate-900/60 to-cyan-950/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-400">
              <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
              <span>ONYXGUARD Sentinel Core • Port 3001</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-['Outfit']">
              Ultra-Resilient Discord <span className="gradient-text-purple">Security Engine</span>
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Real-time telemetry, hybrid sharded infrastructure, and automated anti-nuke protection. Directly connected to your local bot process.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <Terminal className="w-5 h-5 text-violet-400" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Bot Prefix</p>
                <p className="text-lg font-mono font-bold text-white">$</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <Radio className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Anti-Nuke Status</p>
                <p className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-badge"></span>
                  Active Shield
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Guilds */}
        <div className="glass-panel glass-panel-hover rounded-xl p-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Protected Guilds</span>
            <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Server className="w-4 h-4 text-violet-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white font-['Outfit']">
              {stats.guilds.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-400 font-medium">● Live Cache</span>
              <span>across shards</span>
            </p>
          </div>
        </div>

        {/* Metric 2: Members */}
        <div className="glass-panel glass-panel-hover rounded-xl p-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</span>
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white font-['Outfit']">
              {stats.users.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-cyan-400 font-medium">● Broadcast Eval</span>
              <span>member cache</span>
            </p>
          </div>
        </div>

        {/* Metric 3: Shards */}
        <div className="glass-panel glass-panel-hover rounded-xl p-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cluster Shards</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white font-['Outfit']">
              4 <span className="text-sm font-normal text-slate-400">/ Cluster</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-indigo-400 font-medium">● Hybrid Mode</span>
              <span>IPC Respawn Ready</span>
            </p>
          </div>
        </div>

        {/* Metric 4: API Response */}
        <div className="glass-panel glass-panel-hover rounded-xl p-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Express API Latency</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white font-['Outfit']">
              {stats.isOnline ? `${stats.ping} ms` : 'Offline'}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className={stats.isOnline ? "text-emerald-400" : "text-amber-400"}>
                {stats.isOnline ? "● Port 3001 Connected" : "● Waiting for node start"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};