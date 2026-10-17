import { BOT_CONFIG } from '../config';
import React, { useState } from 'react';
import { Shield, Activity, RefreshCw, ExternalLink, Terminal, Server, LogOut, ChevronDown } from 'lucide-react';
import { BotStats, UserProfile } from '../types';

interface NavbarProps {
  stats: BotStats;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  user: UserProfile | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  activeTab,
  setActiveTab,
  onRefresh,
  isRefreshing,
  user,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const BOT_INVITE_URL = BOT_CONFIG.getInviteUrl();

  const navItems = [
    { id: 'servers', label: 'My Servers', icon: Server },
    { id: 'commands', label: 'Commands', icon: Terminal },
    { id: 'shards', label: 'Cluster Telemetry', icon: RefreshCw },
  ];

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('servers')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#12141c] border border-white/20 shadow-lg shadow-red-500/25 group-hover:scale-105 transition-all overflow-hidden ring-1 ring-red-500/40">
            <img src="/dc-logo.png" alt="Dexter Corporation" className="w-full h-full object-cover" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 pulse-badge z-10"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white font-['Outfit']">
                DEXTER<span className="gradient-text-purple">CORP</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Control & Security Hub</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div
            className={`hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${
              stats.isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                stats.isOnline ? 'bg-emerald-400 pulse-badge' : 'bg-amber-400'
              }`}
            ></span>
            <span>{stats.isOnline ? `API Live (${stats.ping}ms)` : 'Connecting...'}</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            title="Refresh bot telemetry"
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-violet-400' : ''}`} />
          </button>

          {/* Real User Profile Menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-white transition-colors cursor-pointer"
              >
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-6 h-6 rounded-full border border-violet-500/40 object-cover"
                />
                <span className="text-xs font-semibold hidden sm:inline max-w-[120px] truncate">
                  {user.username}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 glass-panel p-2 rounded-xl border border-slate-700 shadow-2xl z-50 animate-in fade-in">
                  <div className="px-3 py-2 border-b border-slate-800 text-xs">
                    <p className="font-bold text-white truncate">{user.username}</p>
                    <p className="text-[10px] text-slate-400 font-mono">ID: {user.id}</p>
                  </div>
                  <a
                    href={BOT_CONFIG.getOAuthUrl()}
                    className="w-full text-left px-3 py-2 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg flex items-center gap-2 mt-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Connect Discord Account
                  </a>
                  <button
                    onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg flex items-center gap-2 mt-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Reset to Default Admin
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Add Bot Button */}
          <a
            href={BOT_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-600/30 transition-all transform hover:-translate-y-0.5"
          >
            <span>Invite Bot</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </header>
  );
};