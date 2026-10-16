import { BOT_CONFIG } from '../config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Server,
  PlusCircle,
  ExternalLink,
  Crown,
  Shield,
  Search,
  RefreshCw,
  LogOut,
  Home,
  Terminal,
  Zap,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { GuildItem, UserProfile, CommandItem } from '../types';
import { CommandsTab } from './CommandsTab';
import { SyncingLoader } from './SyncingLoader';

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
  const [activeView, setActiveView] = useState<'servers' | 'commands'>('servers');
  const [searchQuery, setSearchQuery] = useState('');

  const BOT_INVITE_URL = BOT_CONFIG.getInviteUrl();

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

  const addedLocally: string[] = (() => {
    try {
      return JSON.parse(localStorage.getItem('dextercorp_added_guilds') || '[]');
    } catch {
      return [];
    }
  })();

  const botGuildIds = new Set([
    ...botGuilds.map((bg) => String(bg.id)),
    ...addedLocally,
  ]);

  // Combine Discord Admin Guilds with Bot Presence
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
            rolesCount: botMatch?.rolesCount,
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
          {
            id: '1002',
            name: 'DEXTER COMMUNITY',
            icon: null,
            memberCount: 1540,
            hasBot: false,
            isAdmin: true,
            isOwner: false,
          },
        ]
      : [
          {
            id: '1001',
            name: 'VOLT X CHEATS',
            icon: null,
            memberCount: 87,
            hasBot: true,
            isAdmin: true,
            isOwner: true,
          },
          {
            id: '1002',
            name: 'DEXTER COMMUNITY',
            icon: null,
            memberCount: 1540,
            hasBot: false,
            isAdmin: true,
            isOwner: false,
          },
        ];

  // Configured (Bot present) vs Unconfigured (Available to invite)
  const filteredAll = processedGuilds.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );
  const withBotGuilds = filteredAll.filter((g) => g.hasBot);
  const withoutBotGuilds = filteredAll.filter((g) => !g.hasBot);

  return (
    <div className="min-h-screen bg-[#06070a] text-white flex flex-col font-['Inter'] selection:bg-white/20 selection:text-white relative">
      {/* Background ambient lighting & mesh */}
      <div className="absolute inset-0 bg-mesh pointer-events-none opacity-40"></div>
      <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-white/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Obsidian Dashboard Header Bar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#06070a]/80 border-b border-white/5">
        <div className="max-w-[1650px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Left Brand + Mode Switcher */}
          <div className="flex items-center gap-3 min-w-0 flex-shrink">
            <div
              onClick={onBackToHome}
              className="flex items-center gap-2.5 group min-w-0 cursor-pointer"
            >
              <img
                src="/astra-avatar.png"
                alt="Dexter"
                className="h-8 w-8 rounded-xl object-contain group-hover:scale-105 transition-transform duration-300 flex-shrink-0 border border-white/10"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://obsidiansecurity.in/assets/bot-logo-gif-CqVxt4Yt.gif';
                }}
              />
              <span className="font-display font-bold text-sm sm:text-base tracking-tight text-white truncate">
                Dexter <span className="text-slate-400">Corporation</span>
              </span>
              <span className="hidden sm:inline text-xs font-semibold uppercase tracking-widest text-slate-400 px-2.5 py-0.5 liquid-glass rounded-full flex-shrink-0">
                Dashboard
              </span>
            </div>

            {/* Switcher: Servers vs Commands */}
            <div className="hidden sm:flex items-center liquid-glass rounded-xl p-1 gap-1 ml-2">
              <button
                onClick={() => setActiveView('servers')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeView === 'servers'
                    ? 'bg-white text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>Servers</span>
                <span className="text-[10px] font-mono opacity-80">({processedGuilds.length})</span>
              </button>

              <button
                onClick={() => setActiveView('commands')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeView === 'commands'
                    ? 'bg-white text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Commands</span>
                <span className="text-[10px] font-mono opacity-80">({commands.length || 72})</span>
              </button>
            </div>
          </div>

          {/* Right Header Navigation Icons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onBackToHome}
              className="liquid-glass h-9 w-9 rounded-xl grid place-items-center text-slate-400 hover:text-white hover:scale-105 transition-all cursor-pointer"
              title="Back to Landing Page"
            >
              <Home className="h-4 w-4" />
            </button>

            <button
              onClick={onRefreshDiscordGuilds}
              className="liquid-glass h-9 px-2.5 rounded-xl flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white hover:scale-105 transition-all cursor-pointer"
              title="Refresh server list"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-white' : ''}`} />
              <span className="hidden md:inline">Sync</span>
            </button>

            <button
              onClick={onLogout}
              className="liquid-glass h-9 w-9 rounded-xl grid place-items-center text-slate-400 hover:text-rose-400 hover:scale-105 transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>

            {/* User Pill */}
            <div className="liquid-glass h-9 px-2 rounded-xl flex items-center gap-2">
              <div className="relative">
                <img
                  src={user.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                  alt="avatar"
                  className="h-6 w-6 rounded-full ring-1 ring-white/20"
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 border border-black" />
              </div>
              <span className="hidden md:block text-xs font-semibold max-w-[100px] truncate text-white">
                {user.username || 'Operator'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1650px] mx-auto w-full px-4 sm:px-6 py-10 relative z-10">
        {activeView === 'commands' ? (
          <CommandsTab
            commands={commands}
            isLoading={isLoading}
            onRefresh={onRefreshCommands}
          />
        ) : (
          <>
            {/* Dexter Corporation Animated Banner Showcase */}
            <div className="mb-8 liquid-glass rounded-3xl border border-white/10 p-1 relative overflow-hidden group shadow-2xl">
              <div className="relative h-44 sm:h-52 w-full rounded-[22px] overflow-hidden">
                <img
                  src="/dexter-banner.gif"
                  alt="Dexter Corporation Sentinel"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (!img.dataset.fallback) {
                      img.dataset.fallback = '1';
                      img.src = 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3dm5ma3lsMTE5MWpxa25xb2x4eTc4NXFhcjlycTVnMXV6eGZjbnlscSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/WW5p7jd8ImZ16q4w2r/giphy.gif';
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06070a] via-[#06070a]/40 to-transparent"></div>
                <div className="absolute bottom-4 left-5 right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold">
                        DEXTER CORPORATION SENTINEL ACTIVE
                      </span>
                    </div>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight drop-shadow-md">
                      Next-Gen Discord Shield Architecture
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="liquid-glass px-3 py-1 rounded-full text-slate-300 border border-white/10">
                      Cluster 0 • 18ms
                    </span>
                    <span className="liquid-glass px-3 py-1 rounded-full text-emerald-400 border border-emerald-500/20">
                      100% Synced
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Header Area */}
            <div className="mb-10 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                Select a server
              </p>
              <h1 className="font-display font-bold text-3xl md:text-5xl tracking-tight text-white">
                Welcome back,{' '}
                <span className="text-gradient">
                  {user.username || 'Operator'}
                </span>
              </h1>
              <p className="mt-2 text-sm text-slate-400 max-w-lg leading-relaxed">
                Choose a server below to configure. Servers with{' '}
                <span className="text-white font-medium">Dexter Corporation</span> installed are shown first.
              </p>
            </div>

            {/* Search & Action Bar */}
            <div className="mb-8 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  placeholder="Search servers…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="liquid-glass border-0 h-11 pl-11 pr-4 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-white/40 w-full"
                />
              </div>

              <a
                href={BOT_INVITE_URL}
                target="_blank"
                rel="noreferrer"
                className="h-11 px-5 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold text-xs shadow-md flex items-center gap-2 transition-all shrink-0 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add to Server</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </a>
            </div>

            {/* Telemetry Status Counters */}
            <div className="flex items-center gap-4 mb-8 text-xs font-medium text-slate-400">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {withBotGuilds.length} server{withBotGuilds.length === 1 ? '' : 's'} configured
                </span>
              </div>
              {withoutBotGuilds.length > 0 && (
                <>
                  <div className="w-px h-3 bg-white/10" />
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-slate-500" />
                    <span>{withoutBotGuilds.length} available to add</span>
                  </div>
                </>
              )}
            </div>

            {/* SECTION 1: Configured Servers */}
            {withBotGuilds.length > 0 && (
              <div className="mb-12">
                <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 mb-4">
                  Your Configured Servers
                </h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {withBotGuilds.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => onSelectGuild(g)}
                      className="group liquid-glass rounded-2xl p-4 text-left hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 w-full cursor-pointer relative"
                    >
                      <div className="flex items-center gap-3.5">
                        {g.icon ? (
                          <img
                            src={g.icon}
                            alt={g.name}
                            className="h-12 w-12 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-xl liquid-glass grid place-items-center text-base font-bold flex-shrink-0 text-white font-display">
                            {g.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate mb-1 text-white group-hover:text-slate-200">
                            {g.name}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {g.isOwner ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
                                <Crown className="h-2.5 w-2.5" /> Owner
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-2 py-0.5">
                                <Shield className="h-2.5 w-2.5" /> Admin
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                              Active
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="h-8 w-8 rounded-lg bg-white/10 grid place-items-center">
                            <ExternalLink className="h-3.5 w-3.5 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 2: Add Dexter to These Servers */}
            {withoutBotGuilds.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 mb-4">
                  Add Dexter to These Servers
                </h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {withoutBotGuilds.map((g) => (
                    <a
                      key={g.id}
                      href={BOT_CONFIG.getInviteUrl(g.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="group liquid-glass rounded-2xl p-4 text-left opacity-60 hover:opacity-100 hover:scale-[1.02] transition-all duration-300 w-full border-dashed cursor-pointer block"
                    >
                      <div className="flex items-center gap-3.5">
                        {g.icon ? (
                          <img
                            src={g.icon}
                            alt={g.name}
                            className="h-12 w-12 rounded-xl object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-xl liquid-glass grid place-items-center text-base font-bold flex-shrink-0 text-slate-400 font-display">
                            {g.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate mb-0.5 text-white">
                            {g.name}
                          </div>
                          <div className="text-xs text-slate-400">Click to invite bot</div>
                        </div>
                        <PlusCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 group-hover:rotate-90 transition-transform duration-300" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {filteredAll.length === 0 && (
              <div className="p-16 text-center liquid-glass rounded-3xl space-y-3">
                <Server className="w-12 h-12 text-slate-500 mx-auto" />
                <h4 className="font-display font-bold text-lg text-white">No Servers Found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No discord servers match your search &ldquo;{searchQuery}&rdquo;. Try another term or re-sync servers.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-slate-200 cursor-pointer shadow-md"
                >
                  Clear Search
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};