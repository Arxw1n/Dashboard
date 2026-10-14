import { BOT_CONFIG } from '../config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Server,
  Users,
  ShieldCheck,
  ExternalLink,
  Settings,
  Search,
  PlusCircle,
  AlertCircle,
  RefreshCw,
  LogOut,
  ChevronLeft,
  Sun,
  Crown,
  Shield,
  Sparkles,
  Hash,
  Volume2,
  Folder,
  CheckCircle2,
  XCircle,
  X,
  Info,
  Sliders,
  Eye,
  Bot,
  PanelLeftClose,
  PanelLeftOpen,
  Calendar,
  Zap,
  Terminal,
} from 'lucide-react';
import { GuildItem, UserProfile, CommandItem } from '../types';
import { SyncingLoader } from './SyncingLoader';
import { CommandsTab } from './CommandsTab';

interface ServersTabProps {
  user: UserProfile;
  discordGuilds: any[];
  commands?: CommandItem[];
  onSelectGuild: (guild: GuildItem) => void;
  onRefreshDiscordGuilds: () => void;
  onRefreshCommands?: () => void;
  onBackToHome: () => void;
  onLogout: () => void;
}

export const ServersTab: React.FC<ServersTabProps> = ({
  user,
  discordGuilds,
  commands = [],
  onSelectGuild,
  onRefreshDiscordGuilds,
  onRefreshCommands,
  onBackToHome,
  onLogout,
}) => {
  const [botGuilds, setBotGuilds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSideRail, setShowSideRail] = useState(true);
  const [selectedSpecsGuild, setSelectedSpecsGuild] = useState<GuildItem | null>(null);

  // Main Section Toggle: Servers vs Commands Directory
  const [activeSection, setActiveSection] = useState<'servers' | 'commands'>('servers');
  const [isSectionSyncing, setIsSectionSyncing] = useState<boolean>(false);

  const handleSectionChange = (section: 'servers' | 'commands') => {
    if (section === activeSection) return;
    setIsSectionSyncing(true);
    setTimeout(() => {
      setActiveSection(section);
      setIsSectionSyncing(false);
    }, 280);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'with_bot' | 'without_bot'>('all');
  const [isFilterSyncing, setIsFilterSyncing] = useState<boolean>(false);

  const handleFilterChange = (tab: 'all' | 'with_bot' | 'without_bot') => {
    if (tab === filterTab) return;
    setIsFilterSyncing(true);
    setTimeout(() => {
      setFilterTab(tab);
      setIsFilterSyncing(false);
    }, 280);
  };

  const BOT_INVITE_URL = BOT_CONFIG.getInviteUrl();

  const DISCORD_SYNC_URL = BOT_CONFIG.getOAuthUrl();

  // Fetch bot guilds from local backend
  useEffect(() => {
    const fetchBotGuilds = async () => {
      setIsLoading(true);
      try {
        let res;
        try {
          res = await axios.get(BOT_CONFIG.getApiUrl('/api/guilds'));
        } catch {
          res = await axios.get(BOT_CONFIG.getApiUrl('/guilds'));
        }
        if (Array.isArray(res.data)) {
          setBotGuilds(res.data);
        }
      } catch (e) {
        console.warn('Could not fetch bot guilds', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBotGuilds();
  }, []);

  const botGuildIds = new Set(botGuilds.map((bg) => String(bg.id)));

  // Combine Discord Admin Guilds with Bot Presence, fallback to bot's connected servers
  const processedGuilds: GuildItem[] =
    discordGuilds.length > 0
      ? discordGuilds.map((g) => {
          const isBotPresent = botGuildIds.has(String(g.id));
          const botMatch = botGuilds.find((bg) => String(bg.id) === String(g.id));

          return {
            id: String(g.id),
            name: g.name,
            icon: g.icon
              ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`
              : (botMatch?.icon || null),
            banner: botMatch?.banner || null,
            memberCount: botMatch?.memberCount || g.approximate_member_count || 1,
            ownerId: g.owner ? user.id : (botMatch?.ownerId || ''),
            hasBot: isBotPresent,
            isAdmin: true,
            isOwner: Boolean(g.owner),
            channelsCount: botMatch?.channelsCount,
            textChannels: botMatch?.textChannels,
            voiceChannels: botMatch?.voiceChannels,
            categoryChannels: botMatch?.categoryChannels,
            rolesCount: botMatch?.rolesCount,
            emojisCount: botMatch?.emojisCount,
            boostCount: botMatch?.boostCount,
            boostTier: botMatch?.boostTier,
            verificationLevel: botMatch?.verificationLevel,
            vanityURLCode: botMatch?.vanityURLCode,
            createdAt: botMatch?.createdAt,
            joinedAt: botMatch?.joinedAt,
            features: botMatch?.features,
            roles: botMatch?.roles,
            channels: botMatch?.channels,
            settings: botMatch?.settings,
            modules: botMatch?.modules,
          };
        })
      : botGuilds.length > 0
      ? [
          ...botGuilds.map((bg, idx) => ({
            ...bg,
            id: String(bg.id),
            hasBot: true,
            isAdmin: true,
            isOwner: bg.ownerId === user.id || idx === 0,
          })),
          // Sample unadded server so user can experience "Add Bot to Server" button flow
          {
            id: '1002',
            name: 'ONYX COMMUNITY',
            icon: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
            memberCount: 1540,
            channelsCount: 38,
            textChannels: 26,
            voiceChannels: 12,
            rolesCount: 22,
            boostCount: 7,
            boostTier: 2,
            ownerId: '9999',
            hasBot: false,
            isAdmin: true,
            isOwner: false,
          },
        ]
      : [
          // Default demonstration servers matching Screenshot 3
          {
            id: '1001',
            name: 'VOLT X CHEATS',
            icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
            memberCount: 87,
            channelsCount: 70,
            textChannels: 45,
            voiceChannels: 25,
            rolesCount: 45,
            boostCount: 2,
            boostTier: 1,
            ownerId: user.id,
            hasBot: true,
            isAdmin: true,
            isOwner: true,
            modules: { antinuke: true, automod: true, welcome: true, logging: false },
          },
          {
            id: '1002',
            name: 'ONYX COMMUNITY',
            icon: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
            memberCount: 1540,
            channelsCount: 38,
            textChannels: 26,
            voiceChannels: 12,
            rolesCount: 22,
            boostCount: 7,
            boostTier: 2,
            ownerId: '9999',
            hasBot: false,
            isAdmin: true,
            isOwner: false,
          },
        ];

  // ONLY servers where the bot is added appear on the left rail!
  const botAddedGuilds = processedGuilds.filter((g) => g.hasBot);

  const manageableCount = processedGuilds.length;
  const ownedCount = processedGuilds.filter((g) => g.isOwner).length;
  const withBotCount = processedGuilds.filter((g) => g.hasBot).length;
  const withoutBotCount = processedGuilds.filter((g) => !g.hasBot).length;

  // Filter guilds based on search and active tab
  const filteredGuilds = processedGuilds.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    if (!matchesSearch) return false;
    if (filterTab === 'with_bot') return g.hasBot;
    if (filterTab === 'without_bot') return !g.hasBot;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col font-['Outfit'] selection:bg-[#ff2b43] selection:text-white">
      {/* Top Header Bar */}
      <header className="h-16 border-b border-white/5 bg-[#090a0f]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={onBackToHome}
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff2b43] to-[#d61a31] hover:from-[#ff4055] hover:to-[#ff2b43] flex items-center justify-center text-white shadow-md shadow-[#ff2b43]/30 transition-transform active:scale-95 cursor-pointer"
            title="Back to Landing Page"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Toggle Side Rail Button if collapsed */}
          {!showSideRail && (
            <button
              onClick={() => setShowSideRail(true)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Show Connected Servers Rail"
            >
              <PanelLeftOpen className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Servers Rail</span>
            </button>
          )}

          <div className="flex items-center gap-3">
            <h1 className="font-orbitron font-bold text-lg sm:text-xl tracking-wider text-white">
              DASHBOARD
            </h1>

            {/* View Switcher: Servers vs Commands Directory */}
            <div className="flex items-center bg-[#13141f] border border-white/10 rounded-xl p-1 gap-1">
              <button
                onClick={() => handleSectionChange('servers')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSection === 'servers'
                    ? 'bg-[#ff2b43] text-white shadow-md shadow-[#ff2b43]/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>Servers</span>
                <span className="text-[10px] font-mono opacity-80">({manageableCount})</span>
              </button>

              <button
                onClick={() => handleSectionChange('commands')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSection === 'commands'
                    ? 'bg-[#ff2b43] text-white shadow-md shadow-[#ff2b43]/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Commands</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">({commands.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Header Icons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open(BOT_INVITE_URL, '_blank')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all cursor-pointer"
            title="Invite Bot to a Server"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Invite Bot</span>
          </button>
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer">
            <Settings className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer">
            <Sun className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-full border border-[#ff2b43]/40 overflow-hidden shadow-sm shadow-[#ff2b43]/20">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={user.username}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* Main Layout: Left Vertical Rail + Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Vertical Server Rail - ONLY SHOWS SERVERS WHERE BOT IS ADDED */}
        {showSideRail && (
          <aside className="w-16 bg-[#08080b] border-r border-white/5 flex flex-col items-center py-3 space-y-3 shrink-0 transition-all duration-300">
            {/* Collapse / Hide Toggle */}
            <button
              onClick={() => setShowSideRail(false)}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Hide Side Rail"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>

            <div className="w-8 h-[1px] bg-white/10"></div>

            {/* Server Icons: ONLY SERVERS WHERE BOT IS ADDED */}
            {botAddedGuilds.map((g, idx) => (
              <button
                key={g.id || idx}
                onClick={() => onSelectGuild(g)}
                title={`${g.name} (Bot Connected - Click to Configure)`}
                className="relative group w-10 h-10 rounded-2xl hover:rounded-xl bg-[#13141c] hover:bg-[#ff2b43]/20 border border-white/5 hover:border-[#ff2b43]/50 transition-all duration-200 flex items-center justify-center overflow-hidden cursor-pointer"
              >
                {g.icon ? (
                  <img src={g.icon} alt={g.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-orbitron font-bold text-[10px] text-white">
                    {g.name.slice(0, 3).toUpperCase()}
                  </span>
                )}
                {/* Active red indicator */}
                <span className="absolute -left-1 w-1 h-3 group-hover:h-5 bg-[#ff2b43] rounded-r transition-all duration-200"></span>
              </button>
            ))}

            <div className="w-8 h-[1px] bg-white/10 my-1"></div>

            {/* Invite button */}
            <a
              href={BOT_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="Add Bot to More Servers"
              className="w-10 h-10 rounded-2xl hover:rounded-xl bg-white/5 hover:bg-emerald-500/20 border border-white/5 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-400 flex items-center justify-center transition-all cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
            </a>

            {/* Bottom user avatar */}
            <div className="mt-auto pt-3">
              <div className="w-9 h-9 rounded-full border border-[#ff2b43]/50 overflow-hidden">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 max-w-6xl mx-auto w-full">
          {isSectionSyncing ? (
            <SyncingLoader
              fullScreen={false}
              title="SYNCING PROTOCOLS"
              subtitle="CONNECTING TO ONYXGUARD SHARD DATA"
            />
          ) : activeSection === 'commands' ? (
            <CommandsTab
              commands={commands}
              isLoading={isLoading}
              onRefresh={onRefreshCommands}
            />
          ) : (
            <>
              {/* User Welcome Banner */}
          <div className="bg-[#0e0f15]/90 border border-white/5 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl backdrop-blur-md relative overflow-hidden">
            {/* Ambient subtle glow */}
            <div className="absolute top-0 right-0 w-80 h-full bg-[#ff2b43]/5 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="flex items-center gap-5 z-10">
              {/* Avatar with red glowing ring */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full p-1 border-2 border-[#ff2b43] shadow-lg shadow-[#ff2b43]/30 overflow-hidden bg-[#0c0d12]">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={user.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>

              {/* User text details */}
              <div className="space-y-1">
                <h2 className="font-orbitron font-extrabold text-2xl sm:text-3xl tracking-wide text-white">
                  {user.username ? user.username.toUpperCase() : 'ONX VEER'}
                </h2>
                <p className="text-xs text-slate-400">Welcome back to your OnyxGuard Control Console</p>

                {/* Inline Stats Badges */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-mono tracking-wider">
                  <span className="text-slate-400">
                    MANAGEABLE:{' '}
                    <strong className="text-white font-bold text-sm">{manageableCount}</strong>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">
                    OWNED:{' '}
                    <strong className="text-white font-bold text-sm">{ownedCount}</strong>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400">
                    WITH BOT:{' '}
                    <strong className="text-white font-bold text-sm">{withBotCount}</strong>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">
                    NOT ADDED:{' '}
                    <strong className="text-amber-400 font-bold text-sm">{withoutBotCount}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Get Premium & Logout */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto z-10">
              <button className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2b43] to-[#dc182f] hover:from-[#ff4055] hover:to-[#ff2b43] text-white text-xs font-bold shadow-lg shadow-[#ff2b43]/30 transition-transform active:scale-95 cursor-pointer">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Get Premium</span>
              </button>

              <button
                onClick={onLogout}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Sync Notice if user only authorized with identify */}
          {discordGuilds.length === 0 && (
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300">
                <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  Want to see all your personal Discord servers to invite OnyxGuard? Authorize server read permissions.
                </span>
              </div>
              <button
                onClick={() => {
                  window.location.href = DISCORD_SYNC_URL;
                }}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30 shrink-0 cursor-pointer transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sync All Discord Servers</span>
              </button>
            </div>
          )}

          {/* "Your Servers" Section */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-orbitron font-bold text-xl text-white">Your Servers</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure OnyxGuard in connected servers or invite to unadded servers
                </p>
              </div>

              {/* Search & Actions */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Box */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search server name..."
                    className="w-44 sm:w-56 pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff2b43]/50 focus:ring-1 focus:ring-[#ff2b43]/50 transition-all"
                  />
                </div>

                {/* Refresh Button */}
                <button
                  onClick={onRefreshDiscordGuilds}
                  title="Refresh servers"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#ff2b43]' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs: All, With Bot, Without Bot */}
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterTab === 'all'
                    ? 'bg-[#ff2b43] text-white shadow-md shadow-[#ff2b43]/30'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                }`}
              >
                All Servers ({manageableCount})
              </button>
              <button
                onClick={() => handleFilterChange('with_bot')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterTab === 'with_bot'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-emerald-400'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Bot Added ({withBotCount})
              </button>
              <button
                onClick={() => handleFilterChange('without_bot')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterTab === 'without_bot'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-amber-400'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Not Added ({withoutBotCount})
              </button>
            </div>

            {/* Grid of Server Cards with SyncingLoader Transition */}
            {isFilterSyncing ? (
              <SyncingLoader
                fullScreen={false}
                title="FILTERING SERVERS"
                subtitle="SYNCING LIVE CLUSTER TELEMETRY"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredGuilds.map((g) => (
                  <div
                    key={g.id}
                    className={`bg-[#0c0d12] hover:bg-[#111219] border ${
                      g.hasBot ? 'border-white/5 hover:border-[#ff2b43]/40' : 'border-white/5 hover:border-emerald-500/40'
                    } rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 group shadow-lg relative`}
                >
                  {/* Top Bar: Ownership Badge + Bot Added Badge */}
                  <div className="flex items-center justify-between mb-3">
                    {g.isOwner ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Crown className="w-3 h-3" />
                        <span>OWNER</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <Shield className="w-3 h-3" />
                        <span>ADMIN</span>
                      </span>
                    )}

                    {g.hasBot ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>BOT ADDED</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-slate-400 border border-white/10 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                        <span>NOT ADDED</span>
                      </span>
                    )}
                  </div>

                  {/* Server Icon & Title */}
                  <div className="flex items-center gap-3.5 mb-3">
                    <div
                      onClick={() => {
                        if (g.hasBot) onSelectGuild(g);
                        else window.open(BOT_CONFIG.getInviteUrl(g.id), '_blank');
                      }}
                      className={`w-14 h-14 rounded-2xl bg-[#161822] p-1 border border-white/10 ${
                        g.hasBot ? 'group-hover:border-[#ff2b43]/50' : 'group-hover:border-emerald-500/50'
                      } flex items-center justify-center overflow-hidden shadow-md cursor-pointer shrink-0`}
                    >
                      {g.icon ? (
                        <img src={g.icon} alt={g.name} className="w-full h-full rounded-xl object-cover" />
                      ) : (
                        <span
                          className={`font-orbitron font-bold text-sm ${
                            g.hasBot ? 'text-[#ff2b43]' : 'text-emerald-400'
                          }`}
                        >
                          {g.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="overflow-hidden">
                      <h4
                        onClick={() => {
                          if (g.hasBot) onSelectGuild(g);
                          else window.open(BOT_CONFIG.getInviteUrl(g.id), '_blank');
                        }}
                        className={`font-orbitron font-bold text-sm sm:text-base text-white tracking-wide truncate ${
                          g.hasBot ? 'group-hover:text-[#ff2b43]' : 'group-hover:text-emerald-400'
                        } transition-colors cursor-pointer`}
                      >
                        {g.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono truncate">ID: {g.id}</p>
                    </div>
                  </div>

                  {/* A-Z Server Metrics Bar (Channels, Roles, Members) */}
                  <div className="grid grid-cols-3 gap-2 w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/5 text-center text-xs mb-3">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-mono block">Members</span>
                      <span className="font-bold text-white font-mono">{g.memberCount}</span>
                    </div>
                    <div className="border-x border-white/10">
                      <span className="text-[9px] text-slate-400 uppercase font-mono block">Channels</span>
                      <span className="font-bold text-cyan-400 font-mono">{g.channelsCount ?? (g.hasBot ? 24 : '—')}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-mono block">Roles</span>
                      <span className="font-bold text-amber-400 font-mono">{g.rolesCount ?? (g.hasBot ? 18 : '—')}</span>
                    </div>
                  </div>

                  {/* Live Functions & Protection Status for Added Servers */}
                  {g.hasBot && (
                    <div className="w-full bg-[#08090d] border border-white/5 rounded-xl p-2.5 mb-4 text-[10px] space-y-1.5">
                      <div className="flex items-center justify-between text-slate-400 uppercase font-mono font-bold text-[9px]">
                        <span>Functions Status</span>
                        <span className="text-emerald-400 font-bold">
                          {(g.modules?.antinuke !== false ? 1 : 0) +
                            (g.modules?.automod !== false ? 1 : 0) +
                            (g.modules?.welcome !== false ? 1 : 0) +
                            (g.modules?.logging ? 1 : 0)}{' '}
                          / 4 Active
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <span
                          className={`inline-flex items-center justify-between px-2 py-0.5 rounded-md ${
                            g.modules?.antinuke !== false
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-white/5 text-slate-500'
                          }`}
                        >
                          <span>Anti-Nuke</span>
                          <span className="font-bold">{g.modules?.antinuke !== false ? '✓ ON' : 'OFF'}</span>
                        </span>
                        <span
                          className={`inline-flex items-center justify-between px-2 py-0.5 rounded-md ${
                            g.modules?.automod !== false
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-white/5 text-slate-500'
                          }`}
                        >
                          <span>Auto-Mod</span>
                          <span className="font-bold">{g.modules?.automod !== false ? '✓ ON' : 'OFF'}</span>
                        </span>
                        <span
                          className={`inline-flex items-center justify-between px-2 py-0.5 rounded-md ${
                            g.modules?.welcome !== false
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-white/5 text-slate-500'
                          }`}
                        >
                          <span>Welcomer</span>
                          <span className="font-bold">{g.modules?.welcome !== false ? '✓ ON' : 'OFF'}</span>
                        </span>
                        <span
                          className={`inline-flex items-center justify-between px-2 py-0.5 rounded-md ${
                            g.modules?.logging
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-white/5 text-slate-500'
                          }`}
                        >
                          <span>Logs</span>
                          <span className="font-bold">{g.modules?.logging ? '✓ ON' : 'OFF'}</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Bottom Action Buttons */}
                  <div className="space-y-2 pt-1">
                    {g.hasBot ? (
                      <>
                        <button
                          onClick={() => onSelectGuild(g)}
                          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#ff2b43] to-[#dc182f] hover:from-[#ff4055] hover:to-[#ff2b43] text-white text-xs font-bold shadow-lg shadow-[#ff2b43]/30 transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>+ Configure Server</span>
                        </button>

                        <button
                          onClick={() => setSelectedSpecsGuild(g)}
                          className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-semibold border border-white/10 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Info className="w-3.5 h-3.5 text-cyan-400" />
                          <span>View A-Z Server Specs</span>
                        </button>
                      </>
                    ) : (
                      <a
                        href={BOT_CONFIG.getInviteUrl(g.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white text-xs font-bold border border-emerald-500/30 hover:border-transparent transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>+ Add Bot to Server</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {/* Dedicated "+ Add Bot to Server" Card */}
              <div
                onClick={() => window.open(BOT_INVITE_URL, '_blank')}
                className="border-2 border-dashed border-white/10 hover:border-emerald-500/50 bg-[#0c0d12]/50 hover:bg-emerald-500/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-200 group shadow-lg cursor-pointer min-h-[260px]"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/20 text-slate-400 group-hover:text-emerald-400 flex items-center justify-center mb-3 transition-colors shadow-inner">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <h4 className="font-orbitron font-bold text-sm sm:text-base text-white tracking-wide mb-1 group-hover:text-emerald-400 transition-colors">
                  Add Bot to Server
                </h4>
                <p className="text-xs text-slate-400 mb-4 max-w-[200px]">
                  Invite OnyxGuard to protect another Discord server
                </p>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>+ Invite OnyxGuard</span>
                </span>
              </div>
            </div>
            )}

            {filteredGuilds.length === 0 && (
              <div className="p-8 text-center bg-[#0c0d12] border border-white/5 rounded-2xl text-slate-400 text-xs space-y-2">
                <p>No servers match your current search/filter.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterTab('all');
                  }}
                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </main>
      </div>

      {/* A TO Z SERVER SPECS MODAL */}
      {selectedSpecsGuild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-['Outfit']">
          <div className="relative w-full max-w-2xl bg-[#0d0e14] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black max-h-[90vh] overflow-y-auto space-y-6">
            {/* Close Button */}
            <button
              onClick={() => setSelectedSpecsGuild(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#161824] p-1 border border-cyan-500/40 overflow-hidden shadow-lg shadow-cyan-950/50 shrink-0">
                {selectedSpecsGuild.icon ? (
                  <img
                    src={selectedSpecsGuild.icon}
                    alt={selectedSpecsGuild.name}
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-cyan-400 font-orbitron font-bold text-lg">
                    {selectedSpecsGuild.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-orbitron font-bold text-xl text-white">
                    {selectedSpecsGuild.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    ONLINE
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Server ID: {selectedSpecsGuild.id} • Owner: {selectedSpecsGuild.ownerId || 'Protected'}
                </p>
              </div>
            </div>

            {/* 4 Stat Tiles: Members, Channels, Roles, Boosts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">
                  Total Members
                </span>
                <span className="font-orbitron font-bold text-xl text-white mt-1 block">
                  {selectedSpecsGuild.memberCount}
                </span>
                <span className="text-[10px] text-emerald-400">✓ Humans & Bots</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">
                  Total Channels
                </span>
                <span className="font-orbitron font-bold text-xl text-cyan-400 mt-1 block">
                  {selectedSpecsGuild.channelsCount ?? 24}
                </span>
                <span className="text-[10px] text-slate-400">
                  {selectedSpecsGuild.textChannels ?? 14} Text • {selectedSpecsGuild.voiceChannels ?? 10} Voice
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">
                  Total Roles
                </span>
                <span className="font-orbitron font-bold text-xl text-amber-400 mt-1 block">
                  {selectedSpecsGuild.rolesCount ?? 18}
                </span>
                <span className="text-[10px] text-slate-400">Managed & Custom</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">
                  Server Boosts
                </span>
                <span className="font-orbitron font-bold text-xl text-purple-400 mt-1 block">
                  Tier {selectedSpecsGuild.boostTier ?? 1}
                </span>
                <span className="text-[10px] text-purple-300">
                  {selectedSpecsGuild.boostCount ?? 2} Boosts Active
                </span>
              </div>
            </div>

            {/* Channels Dossier */}
            <div className="bg-[#12131b] border border-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-orbitron font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Channels Breakdown ({selectedSpecsGuild.channelsCount ?? 24} Total)</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-400">
                  Categories: {selectedSpecsGuild.categoryChannels ?? 4}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                {selectedSpecsGuild.channels && selectedSpecsGuild.channels.length > 0 ? (
                  selectedSpecsGuild.channels.map((ch) => (
                    <span
                      key={ch.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 font-mono"
                    >
                      {ch.type === 2 ? (
                        <Volume2 className="w-3 h-3 text-emerald-400" />
                      ) : ch.type === 4 ? (
                        <Folder className="w-3 h-3 text-amber-400" />
                      ) : (
                        <Hash className="w-3 h-3 text-cyan-400" />
                      )}
                      <span>{ch.name}</span>
                    </span>
                  ))
                ) : (
                  ['rules', 'announcements', 'welcome', 'general', 'bot-commands', 'voice-lounge', 'ticket-support'].map((ch, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 font-mono"
                    >
                      <Hash className="w-3 h-3 text-cyan-400" />
                      <span>{ch}</span>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Roles Dossier */}
            <div className="bg-[#12131b] border border-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-orbitron font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Roles Breakdown ({selectedSpecsGuild.rolesCount ?? 18} Roles)</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-400">Hierarchy Sorted</span>
              </div>

              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                {selectedSpecsGuild.roles && selectedSpecsGuild.roles.length > 0 ? (
                  selectedSpecsGuild.roles.map((r) => (
                    <span
                      key={r.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono font-medium text-white"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: r.color || '#99aab5' }}
                      ></span>
                      <span>{r.name}</span>
                    </span>
                  ))
                ) : (
                  ['@Owner', '@Administrator', '@Moderator', '@VIP', '@Member', '@Bots'].map((r, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono font-medium text-white"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ff2b43]"></span>
                      <span>{r}</span>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Security & Active Functions Audit */}
            <div className="bg-[#12131b] border border-white/5 rounded-2xl p-4 space-y-3">
              <h4 className="font-orbitron font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Security & Functions Audit</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-300">Anti-Nuke</span>
                  <span className="text-emerald-400 font-bold font-mono">ARMED ✓</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-300">AutoMod</span>
                  <span className="text-emerald-400 font-bold font-mono">ACTIVE ✓</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-300">Welcomer</span>
                  <span className="text-emerald-400 font-bold font-mono">ENABLED ✓</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-300">Prefix</span>
                  <span className="text-cyan-400 font-bold font-mono">$</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedSpecsGuild(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Specs
              </button>

              <button
                onClick={() => {
                  const target = selectedSpecsGuild;
                  setSelectedSpecsGuild(null);
                  onSelectGuild(target);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2b43] to-[#dc182f] hover:from-[#ff4055] hover:to-[#ff2b43] text-white text-xs font-bold shadow-lg shadow-[#ff2b43]/30 transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span>Open Full Server Controls</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};