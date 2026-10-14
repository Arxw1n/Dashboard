import React, { useState } from 'react';
import { Shield, ShieldAlert, Lock, UserCheck, Eye, Bell, CheckCircle2, Sliders } from 'lucide-react';

export const SecurityTab: React.FC = () => {
  const [securityModules, setSecurityModules] = useState([
    {
      id: 'antiban',
      title: 'Anti-Ban & Mass Prune',
      desc: 'Instantly de-ranks and bans unauthorized administrators who exceed maximum ban threshold.',
      enabled: true,
      risk: 'Critical Protection',
    },
    {
      id: 'antikick',
      title: 'Anti-Kick Enforcement',
      desc: 'Monitors member removal events and strips permissions from rouge bots or compromised staff.',
      enabled: true,
      risk: 'Critical Protection',
    },
    {
      id: 'antichannel',
      title: 'Anti-Channel Delete & Wipe',
      desc: 'Restores channels instantly and quarantines offenders if mass deletions are detected.',
      enabled: true,
      risk: 'High Protection',
    },
    {
      id: 'antirole',
      title: 'Anti-Role Deletion & Mention',
      desc: 'Prevents mass deleting administrative roles and unauthorized dangerous permission grants.',
      enabled: true,
      risk: 'High Protection',
    },
    {
      id: 'vanityguard',
      title: 'Vanity URL Guard',
      desc: 'Locks your guild vanity invite URL. Immediately reverts changes if someone attempts to change or steal it.',
      enabled: true,
      risk: 'Brand Protection',
    },
    {
      id: 'antiwebhook',
      title: 'Anti-Webhook Spam Spammer',
      desc: 'Instantly eliminates rogue webhooks created to spam phishing links across announcements.',
      enabled: true,
      risk: 'Medium Protection',
    },
  ]);

  const toggleModule = (id: string) => {
    setSecurityModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>DEXTERCORP Active Defense Matrix</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-['Outfit']">Anti-Nuke & Guild Protection</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Real-time event interceptors running through Prismo / Vaxera core. All actions are logged to your configured audit channel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 pulse-badge"></span>
            6/6 Modules Armed
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {securityModules.map((module) => (
          <div
            key={module.id}
            className={`glass-panel rounded-xl p-5 border transition-all ${
              module.enabled
                ? 'border-violet-500/30 bg-slate-900/70 shadow-lg shadow-violet-950/20'
                : 'border-slate-800/80 bg-slate-950/40 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <Shield className="w-5 h-5" />
              </div>
              <button
                onClick={() => toggleModule(module.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  module.enabled ? 'bg-violet-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    module.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <h3 className="text-base font-bold text-white mb-1">{module.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4 min-h-[36px]">
              {module.desc}
            </p>

            <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-400">
                {module.risk}
              </span>
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Zero-Latency Hook
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Whitelist Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 font-['Outfit']">
          <UserCheck className="w-5 h-5 text-cyan-400" />
          Anti-Nuke Whitelist Control
        </h3>
        <p className="text-xs text-slate-400 mb-4 max-w-xl">
          Whitelisted administrators can execute bulk actions without triggering automated quarantine. Configure directly in Discord via <code className="px-1.5 py-0.5 rounded bg-slate-800 text-violet-400 font-mono text-xs">$whitelist add @user</code>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <p className="text-xs text-slate-400">Server Owners</p>
            <p className="text-lg font-bold text-white mt-1">Immune by Default</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <p className="text-xs text-slate-400">Quarantine Action</p>
            <p className="text-lg font-bold text-amber-400 mt-1">Strip All Roles & Ban</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <p className="text-xs text-slate-400">Logging Channel</p>
            <p className="text-lg font-bold text-cyan-400 mt-1">Audit Webhook Linked</p>
          </div>
        </div>
      </div>
    </div>
  );
};