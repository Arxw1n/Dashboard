import React, { useState, useMemo } from 'react';
import {
  Search,
  Terminal,
  Copy,
  Check,
  Shield,
  Clock,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Zap,
  Tag,
  Key,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { CommandItem } from '../types';

interface CommandsTabProps {
  commands: CommandItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const CommandsTab: React.FC<CommandsTabProps> = ({
  commands,
  isLoading = false,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // Extract all unique categories dynamically from the synced commands
  const categories = useMemo(() => {
    if (!commands || commands.length === 0) return ['All'];
    const uniqueCats = Array.from(
      new Set(commands.map((c) => c.category || 'General'))
    ).filter(Boolean);
    // Sort with high-priority categories first
    const priority = ['Antinuke', 'AutoMod', 'Moderation', 'Welcome', 'Utilities', 'Giveaways', 'Fun'];
    uniqueCats.sort((a, b) => {
      const idxA = priority.indexOf(a);
      const idxB = priority.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
    return ['All', ...uniqueCats];
  }, [commands]);

  // Filter commands by search & category
  const filteredCommands = useMemo(() => {
    const q = search.toLowerCase().trim();
    return (commands || []).filter((cmd) => {
      const matchesCat =
        selectedCategory === 'All' ||
        (cmd.category || '').toLowerCase() === selectedCategory.toLowerCase();

      if (!matchesCat) return false;

      if (!q) return true;

      const nameMatch = cmd.name.toLowerCase().includes(q);
      const descMatch = (cmd.description || '').toLowerCase().includes(q);
      const catMatch = (cmd.category || '').toLowerCase().includes(q);
      const usageMatch = (cmd.usage || '').toLowerCase().includes(q);
      const aliasMatch = (cmd.aliases || []).some((a) => a.toLowerCase().includes(q));

      return nameMatch || descMatch || catMatch || usageMatch || aliasMatch;
    });
  }, [commands, search, selectedCategory]);

  const handleCopy = (usageText: string, cmdName: string) => {
    navigator.clipboard.writeText(usageText);
    setCopiedCmd(cmdName);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const getCategoryTheme = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'antinuke':
        return {
          badge: 'bg-[#ff2b43]/15 text-[#ff4d61] border-[#ff2b43]/40',
          borderHover: 'hover:border-[#ff2b43]/60',
          glow: 'group-hover:shadow-[0_0_25px_rgba(255,43,67,0.15)]',
          iconColor: 'text-[#ff2b43]',
        };
      case 'automod':
        return {
          badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          borderHover: 'hover:border-emerald-500/60',
          glow: 'group-hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]',
          iconColor: 'text-emerald-400',
        };
      case 'moderation':
        return {
          badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
          borderHover: 'hover:border-cyan-500/60',
          glow: 'group-hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]',
          iconColor: 'text-cyan-400',
        };
      case 'welcome':
        return {
          badge: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
          borderHover: 'hover:border-pink-500/60',
          glow: 'group-hover:shadow-[0_0_25px_rgba(236,72,153,0.15)]',
          iconColor: 'text-pink-400',
        };
      case 'utilities':
      case 'utility':
        return {
          badge: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
          borderHover: 'hover:border-indigo-500/60',
          glow: 'group-hover:shadow-[0_0_25px_rgba(99,102,241,0.15)]',
          iconColor: 'text-indigo-400',
        };
      case 'giveaways':
        return {
          badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          borderHover: 'hover:border-amber-500/60',
          glow: 'group-hover:shadow-[0_0_25px_rgba(245,158,11,0.15)]',
          iconColor: 'text-amber-400',
        };
      case 'fun':
        return {
          badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          borderHover: 'hover:border-purple-500/60',
          glow: 'group-hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]',
          iconColor: 'text-purple-400',
        };
      default:
        return {
          badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
          borderHover: 'hover:border-white/20',
          glow: 'group-hover:shadow-lg',
          iconColor: 'text-slate-400',
        };
    }
  };

  return (
    <div className="space-y-6 font-['Outfit'] select-none">
      {/* Top Banner & Telemetry Header */}
      <div className="bg-[#0e0f16]/90 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-[#ff2b43]/10 rounded-full blur-[70px] pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-[#ff2b43]/20 border border-[#ff2b43]/40 flex items-center justify-center text-[#ff2b43]">
                <Terminal className="w-4 h-4" />
              </div>
              <h2 className="font-orbitron font-extrabold text-xl sm:text-2xl tracking-wider text-white">
                COMMANDS <span className="text-[#ff2b43]">DIRECTORY</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE SYNCED
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Showing <strong className="text-white font-mono">{filteredCommands.length}</strong> of{' '}
              <strong className="text-[#ff2b43] font-mono">{commands.length}</strong> native commands
              loaded directly from OnyxGuard core hybrid shard cluster.
            </p>
          </div>

          {/* Quick Search & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search command, alias, syntax..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#13141f] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff2b43] focus:ring-1 focus:ring-[#ff2b43] transition-all font-mono"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {onRefresh && (
              <button
                onClick={onRefresh}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
                title="Re-sync commands from bot"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#ff2b43]' : ''}`} />
                <span>Sync</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-5 border-t border-white/5 mt-5 pb-1 scrollbar-thin">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count =
              cat === 'All'
                ? commands.length
                : commands.filter((c) => (c.category || '').toLowerCase() === cat.toLowerCase()).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#ff2b43] text-white shadow-lg shadow-[#ff2b43]/30 scale-102'
                    : 'bg-[#13141f] hover:bg-[#1a1c2a] text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                    isSelected ? 'bg-black/30 text-white' : 'bg-white/5 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Commands */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCommands.map((cmd) => {
          const theme = getCategoryTheme(cmd.category);
          const fullUsage = cmd.usage || `$${cmd.name}`;

          return (
            <div
              key={cmd.name}
              className={`bg-[#0c0d13] border border-white/5 ${theme.borderHover} ${theme.glow} rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 group shadow-lg relative overflow-hidden`}
            >
              <div className="space-y-3">
                {/* Command Header: Name + Category */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-orbitron font-extrabold text-base text-white group-hover:text-[#ff2b43] transition-colors flex items-center gap-1">
                      <span className="text-[#ff2b43] font-mono">$</span>
                      {cmd.name}
                    </span>
                    {/* Aliases Pills if available */}
                    {cmd.aliases && cmd.aliases.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                        <Tag className="w-2.5 h-2.5 text-slate-500" />
                        {cmd.aliases.map((alias) => (
                          <span
                            key={alias}
                            className="text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.2 rounded"
                          >
                            {alias}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Category Pill */}
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border shrink-0 ${theme.badge}`}
                  >
                    {cmd.category}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300/90 leading-relaxed font-light line-clamp-2 min-h-[34px]">
                  {cmd.description}
                </p>

                {/* Meta details: Cooldown & Permissions */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
                  {/* Cooldown */}
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/5">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{cmd.cooldown || 3}s</span>
                  </div>

                  {/* User Perms */}
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/5 max-w-[190px] truncate" title={cmd.permissions || 'Everyone'}>
                    <Shield className="w-3 h-3 text-[#ff2b43]" />
                    <span className="truncate">{cmd.permissions || 'Everyone'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Usage Box + Copy Action */}
              <div className="mt-4 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between gap-2 bg-[#12131c] border border-white/5 rounded-xl px-3 py-2 group/copy">
                  <span className="font-mono text-xs text-slate-300 truncate select-all flex-1" title={fullUsage}>
                    {fullUsage}
                  </span>
                  <button
                    onClick={() => handleCopy(fullUsage, cmd.name)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-[#ff2b43] text-slate-400 hover:text-white transition-all cursor-pointer shrink-0"
                    title="Copy syntax"
                  >
                    {copiedCmd === cmd.name ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 group-hover/copy:text-white" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCommands.length === 0 && (
        <div className="p-12 text-center bg-[#0c0d13] border border-white/5 rounded-3xl space-y-3">
          <AlertCircle className="w-10 h-10 text-[#ff2b43] mx-auto opacity-70" />
          <h4 className="font-orbitron font-bold text-base text-white">No Matching Commands</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No commands matched your query &ldquo;{search}&rdquo;. Try another keyword or switch category.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
            }}
            className="px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold cursor-pointer border border-white/10"
          >
            Clear Search Filter
          </button>
        </div>
      )}
    </div>
  );
};