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

  return (
    <div className="space-y-6 font-['Inter'] select-none">
      {/* Top Banner & Telemetry Header */}
      <div className="liquid-glass rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Shimmer Accent Line */}
        <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full animate-shimmer" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-md">
                <Terminal className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-display font-bold text-xl sm:text-2xl tracking-tight text-white">
                Command <span className="text-gradient">Directory</span>
              </h2>
              <span className="px-3 py-1 rounded-full liquid-glass text-emerald-400 text-[10px] font-semibold tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Cluster Synced
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Showing <strong className="text-white font-mono">{filteredCommands.length}</strong> of{' '}
              <strong className="text-white font-mono">{commands.length}</strong> verified commands
              loaded directly from the core shard telemetry.
            </p>
          </div>

          {/* Quick Search & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search commands, aliases, syntax..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 liquid-glass rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-white/40 transition-all font-mono"
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
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl liquid-glass hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
                title="Re-sync commands from bot"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-white' : ''}`} />
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-white text-black shadow-lg shadow-white/10 scale-[1.02]'
                    : 'liquid-glass hover:bg-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                    isSelected ? 'bg-black/20 text-black font-bold' : 'bg-white/5 text-slate-400'
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
          const fullUsage = cmd.usage || `$${cmd.name}`;

          return (
            <div
              key={cmd.name}
              className="liquid-glass hover:scale-[1.01] hover:border-white/20 rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 group shadow-xl relative overflow-hidden"
            >
              <div className="space-y-3">
                {/* Command Header: Name + Category */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-display font-bold text-base text-white group-hover:text-slate-200 transition-colors flex items-center gap-1">
                      <span className="text-slate-400 font-mono">$</span>
                      {cmd.name}
                    </span>
                    {/* Aliases Pills if available */}
                    {cmd.aliases && cmd.aliases.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                        <Tag className="w-2.5 h-2.5 text-slate-500" />
                        {cmd.aliases.map((alias) => (
                          <span
                            key={alias}
                            className="text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.2 rounded-md"
                          >
                            {alias}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Category Pill */}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider liquid-glass text-slate-300 shrink-0">
                    {cmd.category}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed font-light line-clamp-2 min-h-[34px]">
                  {cmd.description}
                </p>

                {/* Meta details: Cooldown & Permissions */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
                  {/* Cooldown */}
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg liquid-glass text-slate-400">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{cmd.cooldown || 3}s</span>
                  </div>

                  {/* User Perms */}
                  <div
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg liquid-glass text-slate-300 max-w-[190px] truncate"
                    title={cmd.permissions || 'Everyone'}
                  >
                    <Shield className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{cmd.permissions || 'Everyone'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Usage Box + Copy Action */}
              <div className="mt-4 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between gap-2 bg-[#06070a]/60 border border-white/5 rounded-xl px-3 py-2 group/copy">
                  <span className="font-mono text-xs text-slate-300 truncate select-all flex-1" title={fullUsage}>
                    {fullUsage}
                  </span>
                  <button
                    onClick={() => handleCopy(fullUsage, cmd.name)}
                    className="p-1.5 rounded-lg liquid-glass hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0"
                    title="Copy syntax"
                  >
                    {copiedCmd === cmd.name ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
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
        <div className="p-12 text-center liquid-glass rounded-3xl space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto opacity-70" />
          <h4 className="font-display font-bold text-base text-white">No Matching Commands</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No commands matched your query &ldquo;{search}&rdquo;. Try another keyword or switch category.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-slate-200 cursor-pointer shadow-md"
          >
            Clear Search Filter
          </button>
        </div>
      )}
    </div>
  );
};