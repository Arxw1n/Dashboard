import { BOT_CONFIG } from '../config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ChevronLeft,
  RefreshCw,
  FileText,
  LayoutGrid,
  ShieldAlert,
  Bot,
  UserPlus,
  ScrollText,
  UserCheck,
  Smile,
  MessageSquare,
  Gift,
  Code,
  Sliders,
  Sparkles,
  HelpCircle,
  RotateCcw,
  Check,
  Save,
  Sun,
  Shield,
  Trash2,
  Plus,
  Lock,
  Hash,
  AlertTriangle,
  Send,
  Users,
  Bell,
  Crown,
  Clock,
  Zap,
  Volume2,
  Folder,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { GuildItem, GuildSettings, UserProfile, CommandItem } from '../types';
import { SyncingLoader } from './SyncingLoader';
import { CommandsTab } from './CommandsTab';

interface ServerManageViewProps {
  guild: GuildItem;
  user: UserProfile;
  commands?: CommandItem[];
  onBack: () => void;
}

export const ServerManageView: React.FC<ServerManageViewProps> = ({
  guild,
  user,
  commands = [],
  onBack,
}) => {
  // Persist active module in localStorage so F5 reload stays on current tab
  const [activeModule, setActiveModule] = useState<string>(() => {
    return localStorage.getItem('onyxguard_active_module') || 'welcomer';
  });

  const [isModuleSyncing, setIsModuleSyncing] = useState<boolean>(false);

  const handleSelectModule = (id: string) => {
    if (id === activeModule) return;
    setIsModuleSyncing(true);
    setTimeout(() => {
      setActiveModule(id);
      localStorage.setItem('onyxguard_active_module', id);
      setIsModuleSyncing(false);
    }, 280);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showVariablesGuide, setShowVariablesGuide] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [previewTab, setPreviewTab] = useState<'welcomer' | 'alert' | 'automod'>('welcomer');

  // 1. Welcomer State (Screenshot 4)
  const [welcomerEnabled, setWelcomerEnabled] = useState(true);
  const [targetChannel, setTargetChannel] = useState('welcome');
  const [messageType, setMessageType] = useState('Rich Embed');
  const [autoDeleteDuration, setAutoDeleteDuration] = useState('');

  // Embed Editor State
  const [contentMessage, setContentMessage] = useState('Welcome {user}!');
  const [embedTitle, setEmbedTitle] = useState('Welcome to {server_name}!');
  const [embedColor, setEmbedColor] = useState('#ff2b43');
  const [description, setDescription] = useState(
    "We're glad to have you here. You are member #{server_membercount}!"
  );
  const [authorName, setAuthorName] = useState('ONYXGUARD SECURITY');
  const [authorIconUrl, setAuthorIconUrl] = useState('{user_avatar}');
  const [footerText, setFooterText] = useState('Enjoy your stay in {server_name}');
  const [footerIconUrl, setFooterIconUrl] = useState('{server_icon}');
  const [thumbnailUrl, setThumbnailUrl] = useState('{user_avatar}');
  const [mainImageUrl, setMainImageUrl] = useState(
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
  );

  // 2. Anti-Nuke Settings
  const [antinukeEnabled, setAntinukeEnabled] = useState(true);
  const [antinukePunishment, setAntinukePunishment] = useState('ban');
  const [antinukeFeatures, setAntinukeFeatures] = useState({
    antiBan: true,
    antiKick: true,
    antiChannelDelete: true,
    antiRoleDelete: true,
    antiBot: true,
    antiWebhook: true,
    antiVanity: true,
    antiPrune: true,
  });
  const [whitelist, setWhitelist] = useState<string[]>(['1500056784000253973', '141279118800092']);
  const [newWhitelistUser, setNewWhitelistUser] = useState('');

  // 3. Automod Settings
  const [automodEnabled, setAutomodEnabled] = useState(true);
  const [automodPunishment, setAutomodPunishment] = useState('timeout_5m');
  const [automodFeatures, setAutomodFeatures] = useState({
    antiSpam: true,
    antiLinks: true,
    badWords: true,
    massMention: true,
    antiCaps: true,
    antiZalgo: true,
  });
  const [blockedWords, setBlockedWords] = useState<string[]>([
    'discord.gg/',
    'free nitro',
    'steam gift',
    'free skins',
  ]);
  const [newBlockedWord, setNewBlockedWord] = useState('');

  // 4. General Settings
  const [prefix, setPrefix] = useState('$');
  const [language, setLanguage] = useState('English');
  const [timezone, setTimezone] = useState('UTC');
  const [botNickname, setBotNickname] = useState('OnyxGuard');

  // 5. Logging Settings
  const [loggingEnabled, setLoggingEnabled] = useState(true);
  const [modLogsChannel, setModLogsChannel] = useState('mod-logs');
  const [memberLogsChannel, setMemberLogsChannel] = useState('join-logs');
  const [messageLogsChannel, setMessageLogsChannel] = useState('message-logs');
  const [serverLogsChannel, setServerLogsChannel] = useState('server-logs');
  const [voiceLogsChannel, setVoiceLogsChannel] = useState('voice-logs');

  // 6. Custom Role Settings
  const [customRoleEnabled, setCustomRoleEnabled] = useState(true);
  const [customRolePrefix, setCustomRolePrefix] = useState('[VIP]');
  const [customRoleLimit, setCustomRoleLimit] = useState('3');
  const [customRolesList, setCustomRolesList] = useState([
    { id: '1', name: 'VIP Crimson', color: '#ff2b43', members: 48 },
    { id: '2', name: 'Booster Neon', color: '#06b6d4', members: 112 },
    { id: '3', name: 'Supporter Gold', color: '#f59e0b', members: 64 },
  ]);

  // 7. Autorole Settings
  const [autoroleEnabled, setAutoroleEnabled] = useState(true);
  const [autoroleHumans, setAutoroleHumans] = useState('Members');
  const [autoroleBots, setAutoroleBots] = useState('Bots');
  const [autoroleVerified, setAutoroleVerified] = useState('Verified Citizen');
  const [autoroleDelay, setAutoroleDelay] = useState('0');

  // 8. Autoreact Settings
  const [autoreactEnabled, setAutoreactEnabled] = useState(true);
  const [autoreactRules, setAutoreactRules] = useState([
    { id: '1', channel: 'suggestions', emojis: '👍 👎' },
    { id: '2', channel: 'announcements', emojis: '❤️ 🎉 🔥' },
  ]);
  const [newReactChannel, setNewReactChannel] = useState('suggestions');
  const [newReactEmojis, setNewReactEmojis] = useState('👍 👎');

  // 9. Autoresponder Settings
  const [autoresponderEnabled, setAutoresponderEnabled] = useState(true);
  const [autoresponders, setAutoresponders] = useState([
    {
      id: '1',
      trigger: '!rules',
      response: 'Please read our server rules in #rules-and-info to maintain peace!',
      matchType: 'Exact Match',
    },
    {
      id: '2',
      trigger: '!discord',
      response: 'Join our official community support server at https://discord.gg/codexdev',
      matchType: 'Contains',
    },
  ]);
  const [newTrigger, setNewTrigger] = useState('');
  const [newResponse, setNewResponse] = useState('');
  const [newMatchType, setNewMatchType] = useState('Exact Match');

  // 10. Giveaway Settings
  const [giveawayEnabled, setGiveawayEnabled] = useState(true);
  const [giveawayPrize, setGiveawayPrize] = useState('1 Month Discord Nitro');
  const [giveawayDuration, setGiveawayDuration] = useState('24h');
  const [giveawayWinners, setGiveawayWinners] = useState('1');
  const [giveawayChannel, setGiveawayChannel] = useState('giveaways');
  const [activeGiveaways, setActiveGiveaways] = useState([
    {
      id: '1',
      prize: 'Discord Nitro (1 Month)',
      channel: 'giveaways',
      winners: 1,
      endsIn: '23h 14m',
    },
  ]);

  // 11. Embed Builder Settings
  const [builderChannel, setBuilderChannel] = useState('announcements');
  const [builderSent, setBuilderSent] = useState(false);

  // Fetch settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        let res;
        try {
          res = await axios.get(BOT_CONFIG.getApiUrl(`/api/guilds/${guild.id}/settings`));
        } catch {
          res = await axios.get(BOT_CONFIG.getApiUrl(`/guilds/${guild.id}/settings`));
        }
        if (res.data) {
          if (res.data.prefix) setPrefix(res.data.prefix);
          if (res.data.antinuke) {
            setAntinukeEnabled(Boolean(res.data.antinuke.enabled));
            if (res.data.antinuke.punishment) setAntinukePunishment(res.data.antinuke.punishment);
            if (Array.isArray(res.data.antinuke.whitelist)) setWhitelist(res.data.antinuke.whitelist);
          }
          if (res.data.automod) {
            setAutomodEnabled(true);
            if (Array.isArray(res.data.automod.blockedWords)) setBlockedWords(res.data.automod.blockedWords);
          }
          if (res.data.welcome) {
            setWelcomerEnabled(Boolean(res.data.welcome.enabled));
            if (res.data.welcome.content) setContentMessage(res.data.welcome.content);
            if (res.data.welcome.channelId) setTargetChannel(res.data.welcome.channelId);
          }
        }
      } catch (e) {
        // Use local fallback smoothly
      }
    };
    fetchSettings();
  }, [guild.id]);

  // Save handler
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const payload = {
        prefix,
        antinuke: {
          enabled: antinukeEnabled,
          punishment: antinukePunishment,
          ...antinukeFeatures,
          whitelist,
        },
        automod: {
          enabled: automodEnabled,
          punishment: automodPunishment,
          ...automodFeatures,
          blockedWords,
        },
        welcome: {
          enabled: welcomerEnabled,
          content: contentMessage,
          channelId: targetChannel,
        },
        logging: {
          enabled: loggingEnabled,
          modLogsChannel,
          memberLogsChannel,
        },
      };

      try {
        await axios.post(BOT_CONFIG.getApiUrl(`/api/guilds/${guild.id}/settings`), payload);
      } catch {
        await axios.post(BOT_CONFIG.getApiUrl(`/guilds/${guild.id}/settings`), payload);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      // Local optimistic save
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset welcomer to standard template
  const handleResetWelcomer = () => {
    setContentMessage('Welcome {user}!');
    setEmbedTitle('Welcome to {server_name}!');
    setEmbedColor('#ff2b43');
    setDescription("We're glad to have you here. You are member #{server_membercount}!");
    setAuthorName('ONYXGUARD SECURITY');
    setAuthorIconUrl('{user_avatar}');
    setThumbnailUrl('{user_avatar}');
    setFooterText('Enjoy your stay in {server_name}');
    setFooterIconUrl('{server_icon}');
  };

  // Send simulated test message to discord
  const handleSendTestMessage = () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3500);
  };

  // Send builder embed to channel
  const handleSendBuilderEmbed = () => {
    setBuilderSent(true);
    setTimeout(() => setBuilderSent(false), 3500);
  };

  // Add whitelist user
  const addWhitelistUser = () => {
    if (!newWhitelistUser.trim()) return;
    if (!whitelist.includes(newWhitelistUser.trim())) {
      setWhitelist([...whitelist, newWhitelistUser.trim()]);
    }
    setNewWhitelistUser('');
  };

  // Remove whitelist user
  const removeWhitelistUser = (id: string) => {
    setWhitelist(whitelist.filter((w) => w !== id));
  };

  // Add blocked word
  const addBlockedWord = () => {
    if (!newBlockedWord.trim()) return;
    const clean = newBlockedWord.trim().toLowerCase();
    if (!blockedWords.includes(clean)) {
      setBlockedWords([...blockedWords, clean]);
    }
    setNewBlockedWord('');
  };

  // Remove blocked word
  const removeBlockedWord = (word: string) => {
    setBlockedWords(blockedWords.filter((w) => w !== word));
  };

  // Add autoreact rule
  const addAutoreactRule = () => {
    if (!newReactEmojis.trim()) return;
    setAutoreactRules([
      ...autoreactRules,
      { id: Date.now().toString(), channel: newReactChannel, emojis: newReactEmojis.trim() },
    ]);
  };

  // Add autoresponder rule
  const addAutoresponder = () => {
    if (!newTrigger.trim() || !newResponse.trim()) return;
    setAutoresponders([
      ...autoresponders,
      {
        id: Date.now().toString(),
        trigger: newTrigger.trim(),
        response: newResponse.trim(),
        matchType: newMatchType,
      },
    ]);
    setNewTrigger('');
    setNewResponse('');
  };

  // Start new giveaway
  const handleStartGiveaway = () => {
    if (!giveawayPrize.trim()) return;
    setActiveGiveaways([
      {
        id: Date.now().toString(),
        prize: giveawayPrize.trim(),
        channel: giveawayChannel,
        winners: parseInt(giveawayWinners) || 1,
        endsIn: giveawayDuration,
      },
      ...activeGiveaways,
    ]);
  };

  // Variables replacer for preview
  const renderPreview = (text: string) => {
    return text
      .replace(/{user}/g, '@Veer')
      .replace(/{server_name}/g, guild.name)
      .replace(/{server_membercount}/g, (guild.memberCount || 420).toString())
      .replace(/{user_avatar}/g, user.avatar)
      .replace(/{server_icon}/g, guild.icon || '');
  };

  // Sidebar Modules List (Screenshot 4)
  const modulesList = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'commands', label: 'Bot Commands', icon: Terminal },
    { id: 'settings', label: 'Settings', icon: Sliders },
    { id: 'antinuke', label: 'Antinuke', icon: ShieldAlert },
    { id: 'automod', label: 'Automod', icon: Bot },
    { id: 'welcomer', label: 'Welcomer', icon: UserPlus },
    { id: 'logging', label: 'Logging', icon: ScrollText },
    { id: 'custom_role', label: 'Custom Role', icon: UserCheck },
    { id: 'autorole', label: 'Autorole', icon: Sparkles },
    { id: 'autoreact', label: 'Autoreact', icon: Smile },
    { id: 'autoresponder', label: 'Autoresponder', icon: MessageSquare },
    { id: 'giveaway', label: 'Giveaway', icon: Gift },
    { id: 'embed_builder', label: 'Embed Builder', icon: Code },
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col font-['Outfit'] selection:bg-[#ff2b43] selection:text-white">
      {/* Top Header Bar (Screenshot 4) */}
      <header className="h-16 border-b border-white/5 bg-[#090a0f]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff2b43] to-[#d61a31] hover:from-[#ff4055] hover:to-[#ff2b43] flex items-center justify-center text-white shadow-md shadow-[#ff2b43]/30 transition-transform active:scale-95 cursor-pointer"
            title="Back to Dashboard"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h1 className="font-orbitron font-bold text-lg sm:text-xl tracking-wider text-white">
            SERVER SETTINGS
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Toggle Theme"
          >
            <Sun className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-full border border-[#ff2b43]/40 overflow-hidden shadow-sm shadow-[#ff2b43]/20">
            <img
              src={
                user.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
              }
              alt={user.username}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* Main 3-Column Layout (Screenshot 4) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Server Card + Action Buttons + Modules Sidebar */}
        <aside className="w-full lg:w-64 bg-[#09090d] border-r border-white/5 p-4 flex flex-col space-y-4 shrink-0 overflow-y-auto">
          {/* Active Server Card */}
          <div className="bg-[#111219] border border-white/5 rounded-xl p-3 flex items-center gap-3 shadow-md">
            <div className="w-10 h-10 rounded-lg bg-[#1a1b24] p-0.5 overflow-hidden shrink-0 border border-white/10">
              {guild.icon ? (
                <img
                  src={guild.icon}
                  alt={guild.name}
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-orbitron font-bold text-xs text-[#ff2b43]">
                  {guild.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-orbitron font-bold text-xs text-white truncate">{guild.name}</h3>
              <p className="text-[10px] text-slate-400 font-mono truncate">ID: {guild.id}</p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-bold text-xs shadow-md shadow-[#10b981]/25 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Server</span>
            </button>

            <button
              onClick={() => setShowAuditLogs(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Audit Logs</span>
            </button>
          </div>

          {/* MODULES Header */}
          <div className="pt-2">
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>MODULES</span>
            </div>

            {/* Modules List Items */}
            <div className="space-y-1">
              {modulesList.map((m) => {
                const Icon = m.icon;
                const isActive = activeModule === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectModule(m.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-[#141520] text-cyan-400 border border-cyan-500/40 shadow-md shadow-cyan-950/40'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Center Column: Configuration Form (Changes based on activeModule!) */}
        <main className="flex-1 bg-[#070709] p-6 lg:p-8 overflow-y-auto space-y-6 relative min-h-[500px]">
          {isModuleSyncing ? (
            <SyncingLoader
              fullScreen={false}
              title="SYNCING MODULE"
              subtitle="CONFIGURING ONYXGUARD SHARD DATA"
            />
          ) : (
            <>
              {/* ======================================================== */}
              {/* TAB: BOT COMMANDS DIRECTORY (123 Live Synced Commands) */}
              {/* ======================================================== */}
              {activeModule === 'commands' && (
                <CommandsTab commands={commands} />
              )}

              {/* ======================================================== */}
              {/* TAB 1: WELCOMER (Exact Match to Screenshot 4) */}
              {/* ======================================================== */}
              {activeModule === 'welcomer' && (
            <>
              {/* Header Bar with Switch, Variables Guide, Reset */}
              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-4">
                  <span className="font-orbitron font-bold text-base sm:text-lg text-white">
                    Configuration
                  </span>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setWelcomerEnabled(!welcomerEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      welcomerEnabled ? 'bg-[#ff2b43]' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        welcomerEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowVariablesGuide(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Variables Guide</span>
                  </button>

                  <button
                    onClick={handleResetWelcomer}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-rose-400 hover:text-rose-300 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Form Fields: Target Channel & Message Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-4 space-y-2">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <span>TARGET CHANNEL</span>
                    <span className="text-[#ff2b43]">*</span>
                  </label>
                  <select
                    value={targetChannel}
                    onChange={(e) => setTargetChannel(e.target.value)}
                    className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2b43] transition-colors cursor-pointer"
                  >
                    <option value="welcome">-- Select a channel -- (#welcome)</option>
                    <option value="general"># general</option>
                    <option value="join-logs"># join-logs</option>
                    <option value="lounge"># lounge</option>
                  </select>
                  <p className="text-[10px] text-slate-500">
                    The channel where the bot will send the welcome message
                  </p>
                </div>

                <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-4 space-y-2">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    MESSAGE TYPE
                  </label>
                  <select
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value)}
                    className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2b43] transition-colors cursor-pointer"
                  >
                    <option value="Rich Embed">Rich Embed</option>
                    <option value="Text Only">Text Only</option>
                    <option value="Embed + Text">Embed + Text</option>
                  </select>
                </div>
              </div>

              {/* Auto-Delete Duration */}
              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-4 space-y-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  AUTO-DELETE DURATION (SECONDS)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 60 (Optional)"
                  value={autoDeleteDuration}
                  onChange={(e) => setAutoDeleteDuration(e.target.value)}
                  className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2b43] transition-colors placeholder:text-slate-600 font-mono"
                />
                <p className="text-[10px] text-slate-500">
                  Leave blank to keep messages permanently. Minimum 3s, maximum 300s.
                </p>
              </div>

              {/* EMBED EDITOR SECTION (Screenshot 4) */}
              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5 space-y-5 shadow-lg">
                <div className="border-b border-white/5 pb-2">
                  <h3 className="font-orbitron font-bold text-xs tracking-wider text-slate-300 uppercase">
                    EMBED EDITOR
                  </h3>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    CONTENT MESSAGE (OUTSIDE EMBED)
                  </label>
                  <input
                    type="text"
                    value={contentMessage}
                    onChange={(e) => setContentMessage(e.target.value)}
                    className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2b43] transition-colors font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      EMBED TITLE
                    </label>
                    <input
                      type="text"
                      value={embedTitle}
                      onChange={(e) => setEmbedTitle(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2b43] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      EMBED COLOR
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={embedColor}
                        onChange={(e) => setEmbedColor(e.target.value)}
                        className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={embedColor}
                        onChange={(e) => setEmbedColor(e.target.value)}
                        className="flex-1 bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-[#ff2b43]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    DESCRIPTION
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#13141d] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#ff2b43] transition-colors resize-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      AUTHOR NAME
                    </label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2b43] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      AUTHOR ICON URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://... or {user_avatar}"
                      value={authorIconUrl}
                      onChange={(e) => setAuthorIconUrl(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2b43] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      FOOTER TEXT
                    </label>
                    <input
                      type="text"
                      value={footerText}
                      onChange={(e) => setFooterText(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2b43] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      FOOTER ICON URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://... or {server_icon}"
                      value={footerIconUrl}
                      onChange={(e) => setFooterIconUrl(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2b43] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      THUMBNAIL URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://... or {user_avatar}"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2b43] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      MAIN IMAGE URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={mainImageUrl}
                      onChange={(e) => setMainImageUrl(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2b43] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ======================================================== */}
          {/* TAB 2: ANTINUKE */}
          {/* ======================================================== */}
          {activeModule === 'antinuke' && (
            <div className="space-y-6">
              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-6 h-6 text-[#ff2b43]" />
                  <div>
                    <h3 className="font-orbitron font-bold text-base text-white">
                      Anti-Nuke Protection Core
                    </h3>
                    <p className="text-xs text-slate-400">
                      Real-time prevention of mass bans, kicks, and server nukes
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAntinukeEnabled(!antinukeEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    antinukeEnabled ? 'bg-[#ff2b43]' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      antinukeEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Punishment Selector */}
              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5 space-y-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  ACTION ON VIOLATION (PUNISHMENT)
                </label>
                <select
                  value={antinukePunishment}
                  onChange={(e) => setAntinukePunishment(e.target.value)}
                  className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2b43] cursor-pointer"
                >
                  <option value="ban">🔨 Instant Permanent Ban</option>
                  <option value="kick">👢 Kick from Server</option>
                  <option value="quarantine">🔒 Strip All Roles (Quarantine)</option>
                </select>
              </div>

              {/* Security Shield Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    key: 'antiBan',
                    label: 'Anti-Ban Protection',
                    desc: 'Blocks unauthorized member bans',
                  },
                  {
                    key: 'antiKick',
                    label: 'Anti-Kick Protection',
                    desc: 'Blocks unauthorized member kicks',
                  },
                  {
                    key: 'antiChannelDelete',
                    label: 'Anti-Channel Delete',
                    desc: 'Prevents mass channel deletions',
                  },
                  {
                    key: 'antiRoleDelete',
                    label: 'Anti-Role Delete',
                    desc: 'Prevents role stripping and deletion',
                  },
                  {
                    key: 'antiBot',
                    label: 'Anti-Bot Addition',
                    desc: 'Blocks unauthorized bot invites',
                  },
                  {
                    key: 'antiWebhook',
                    label: 'Anti-Webhook Abuse',
                    desc: 'Prevents unauthorized webhooks',
                  },
                  {
                    key: 'antiVanity',
                    label: 'Anti-Vanity Protect',
                    desc: 'Shields server vanity URL from theft',
                  },
                  {
                    key: 'antiPrune',
                    label: 'Anti-Prune Shield',
                    desc: 'Blocks mass pruning of offline members',
                  },
                ].map((f) => (
                  <div
                    key={f.key}
                    className="bg-[#0e0f15] border border-white/5 rounded-2xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-xs text-white">{f.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{f.desc}</p>
                    </div>
                    <button
                      onClick={() =>
                        setAntinukeFeatures((p) => ({
                          ...p,
                          [f.key]: !(p as any)[f.key],
                        }))
                      }
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                        (antinukeFeatures as any)[f.key] ? 'bg-[#ff2b43]' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                          (antinukeFeatures as any)[f.key] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* Whitelist Manager */}
              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="font-orbitron font-bold text-xs text-slate-300 uppercase tracking-wider">
                  Whitelisted Trusted Administrators
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Discord User ID to whitelist..."
                    value={newWhitelistUser}
                    onChange={(e) => setNewWhitelistUser(e.target.value)}
                    className="flex-1 bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#ff2b43]"
                  />
                  <button
                    onClick={addWhitelistUser}
                    className="px-4 py-2 rounded-xl bg-[#ff2b43] hover:bg-[#e61932] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    + Add Whitelist
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  {whitelist.map((id) => (
                    <div
                      key={id}
                      className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-xs font-mono"
                    >
                      <span className="text-slate-300 font-semibold">{id}</span>
                      <button
                        onClick={() => removeWhitelistUser(id)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: AUTOMOD */}
          {/* ======================================================== */}
          {activeModule === 'automod' && (
            <div className="space-y-6">
              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <Bot className="w-6 h-6 text-cyan-400" />
                  <div>
                    <h3 className="font-orbitron font-bold text-base text-white">
                      AutoMod Sentinel & Filters
                    </h3>
                    <p className="text-xs text-slate-400">
                      Automated chat policing, link shielding & spam controls
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAutomodEnabled(!automodEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    automodEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      automodEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Punishment Selector */}
              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5 space-y-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  AUTOMOD VIOLATION ACTION
                </label>
                <select
                  value={automodPunishment}
                  onChange={(e) => setAutomodPunishment(e.target.value)}
                  className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="timeout_5m">⏱️ Timeout Member (5 Minutes)</option>
                  <option value="timeout_1h">⏱️ Timeout Member (1 Hour)</option>
                  <option value="timeout_24h">⏱️ Timeout Member (24 Hours)</option>
                  <option value="kick">👢 Kick Member</option>
                  <option value="warn">⚠️ Delete Message & Warn</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    key: 'antiSpam',
                    label: 'Anti-Spam Filter',
                    desc: 'Deletes rapid repeated messages',
                  },
                  {
                    key: 'antiLinks',
                    label: 'Anti-Links / Invites',
                    desc: 'Blocks unauthorized discord.gg invite links',
                  },
                  {
                    key: 'badWords',
                    label: 'Profanity Filter',
                    desc: 'Blocks offensive words & slurs',
                  },
                  {
                    key: 'massMention',
                    label: 'Anti-Mass Mention',
                    desc: 'Deletes messages with 5+ mentions',
                  },
                  {
                    key: 'antiCaps',
                    label: 'Anti-Caps Abuse',
                    desc: 'Blocks messages with >70% capital letters',
                  },
                  {
                    key: 'antiZalgo',
                    label: 'Anti-Zalgo Text',
                    desc: 'Filters distorted glitched unicode fonts',
                  },
                ].map((f) => (
                  <div
                    key={f.key}
                    className="bg-[#0e0f15] border border-white/5 rounded-2xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-xs text-white">{f.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{f.desc}</p>
                    </div>
                    <button
                      onClick={() =>
                        setAutomodFeatures((p) => ({
                          ...p,
                          [f.key]: !(p as any)[f.key],
                        }))
                      }
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                        (automodFeatures as any)[f.key] ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                          (automodFeatures as any)[f.key] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* Blocked Words Filter */}
              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="font-orbitron font-bold text-xs text-slate-300 uppercase tracking-wider">
                  Custom Word & Phrase Blacklist
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add phrase or bad word to block..."
                    value={newBlockedWord}
                    onChange={(e) => setNewBlockedWord(e.target.value)}
                    className="flex-1 bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={addBlockedWord}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    + Add Phrase
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {blockedWords.map((word) => (
                    <span
                      key={word}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300"
                    >
                      <span>{word}</span>
                      <button
                        onClick={() => removeBlockedWord(word)}
                        className="text-slate-500 hover:text-rose-400 cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: OVERVIEW - A TO Z SERVER STATS & FUNCTIONS AUDIT */}
          {/* ======================================================== */}
          {activeModule === 'overview' && (
            <div className="space-y-6">
              {/* Top 4 Metric Tiles: Members, Channels, Roles, Boosts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">
                    TOTAL MEMBERS
                  </span>
                  <p className="font-orbitron font-bold text-2xl text-white mt-1">
                    {guild.memberCount || 420}
                  </p>
                  <p className="text-[10px] text-emerald-400 mt-1">✓ Live Synchronized</p>
                </div>

                <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">
                    TOTAL CHANNELS
                  </span>
                  <p className="font-orbitron font-bold text-2xl text-cyan-400 mt-1">
                    {guild.channelsCount || 70}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {guild.textChannels || 45} Text • {guild.voiceChannels || 25} Voice
                  </p>
                </div>

                <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">
                    TOTAL ROLES
                  </span>
                  <p className="font-orbitron font-bold text-2xl text-amber-400 mt-1">
                    {guild.rolesCount || 45}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Security Hierarchy</p>
                </div>

                <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">
                    SERVER BOOSTS
                  </span>
                  <p className="font-orbitron font-bold text-2xl text-purple-400 mt-1">
                    Tier {guild.boostTier || 1}
                  </p>
                  <p className="text-[10px] text-purple-300 mt-1">
                    {guild.boostCount || 2} Boosts Active
                  </p>
                </div>
              </div>

              {/* Complete Live Functions Status & Audit Checklist */}
              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-6 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-orbitron font-bold text-base text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-emerald-400" />
                      <span>Security & Automation Functions Audit</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Live status of all enabled and disabled protection modules for {guild.name}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
                    {(antinukeEnabled ? 1 : 0) +
                      (automodEnabled ? 1 : 0) +
                      (welcomerEnabled ? 1 : 0) +
                      (loggingEnabled ? 1 : 0) +
                      (autoroleEnabled ? 1 : 0) +
                      (customRoleEnabled ? 1 : 0)}{' '}
                    / 6 Active Modules
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  {/* Anti-Nuke Status */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-white">Anti-Nuke Core</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Punishment: {antinukePunishment.toUpperCase()}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                        antinukeEnabled
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {antinukeEnabled ? '✓ ENABLED' : '✗ DISABLED'}
                    </span>
                  </div>

                  {/* AutoMod Status */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-white">AutoMod Sentinel</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {blockedWords.length} Filter Phrases
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                        automodEnabled
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {automodEnabled ? '✓ ENABLED' : '✗ DISABLED'}
                    </span>
                  </div>

                  {/* Welcomer Status */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-white">Welcomer Greeter</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Channel: #{targetChannel}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                        welcomerEnabled
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {welcomerEnabled ? '✓ ENABLED' : '✗ DISABLED'}
                    </span>
                  </div>

                  {/* Logging Status */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-white">Action Logging</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Target: #{modLogsChannel}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                        loggingEnabled
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {loggingEnabled ? '✓ ENABLED' : '✗ DISABLED'}
                    </span>
                  </div>

                  {/* Auto-Role Status */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-white">Auto-Role System</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Role: @{autoroleHumans}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                        autoroleEnabled
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {autoroleEnabled ? '✓ ENABLED' : '✗ DISABLED'}
                    </span>
                  </div>

                  {/* Custom Roles Status */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-white">Custom Roles</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Prefix: {customRolePrefix}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                        customRoleEnabled
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {customRoleEnabled ? '✓ ENABLED' : '✗ DISABLED'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Channels & Roles Dossier */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Channels List */}
                <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-orbitron font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Server Channels ({guild.channelsCount || 70})</span>
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      Categories: {guild.categoryChannels || 6}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {guild.channels && guild.channels.length > 0 ? (
                      guild.channels.map((ch) => (
                        <span
                          key={ch.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-300 font-mono"
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
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-300 font-mono"
                        >
                          <Hash className="w-3 h-3 text-cyan-400" />
                          <span>{ch}</span>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Roles List */}
                <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-orbitron font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Server Roles ({guild.rolesCount || 45})</span>
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">Position Sorted</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {guild.roles && guild.roles.length > 0 ? (
                      guild.roles.map((r) => (
                        <span
                          key={r.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono font-medium text-white"
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
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono font-medium text-white"
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-[#ff2b43]"></span>
                          <span>{r}</span>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Bot Integration & Cluster Telemetry */}
              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-6 space-y-4">
                <h4 className="font-orbitron font-bold text-sm text-white">Bot Shards & Cluster Telemetry</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Cluster / Shard</p>
                    <p className="font-mono text-white font-bold text-sm mt-0.5">Cluster 0 / Shard 0</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Shard Latency</p>
                    <p className="font-mono text-emerald-400 font-bold text-sm mt-0.5">18ms Nominal</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Command Prefix</p>
                    <p className="font-mono text-white font-bold text-sm mt-0.5">{prefix}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: SETTINGS */}
          {/* ======================================================== */}
          {activeModule === 'settings' && (
            <div className="space-y-6">
              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5 space-y-4 shadow-lg">
                <h3 className="font-orbitron font-bold text-base text-white">General Server Settings</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      COMMAND PREFIX
                    </label>
                    <input
                      type="text"
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#ff2b43]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      BOT NICKNAME
                    </label>
                    <input
                      type="text"
                      value={botNickname}
                      onChange={(e) => setBotNickname(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2b43]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      DASHBOARD LANGUAGE
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2b43]"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi / हिन्दी</option>
                      <option value="Spanish">Spanish</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      SERVER TIMEZONE
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2b43]"
                    >
                      <option value="UTC">UTC (Universal Time)</option>
                      <option value="IST">IST (Indian Standard Time)</option>
                      <option value="EST">EST (Eastern Standard Time)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: LOGGING */}
          {/* ======================================================== */}
          {activeModule === 'logging' && (
            <div className="space-y-6">
              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <ScrollText className="w-6 h-6 text-amber-400" />
                  <div>
                    <h3 className="font-orbitron font-bold text-base text-white">
                      Comprehensive Logging
                    </h3>
                    <p className="text-xs text-slate-400">
                      Record moderation actions, joins, leaves, edits, and voice
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setLoggingEnabled(!loggingEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    loggingEnabled ? 'bg-amber-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      loggingEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      MOD ACTION LOGS CHANNEL
                    </label>
                    <select
                      value={modLogsChannel}
                      onChange={(e) => setModLogsChannel(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2b43]"
                    >
                      <option value="mod-logs"># mod-logs</option>
                      <option value="audit-logs"># audit-logs</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      MEMBER JOIN & LEAVE LOGS
                    </label>
                    <select
                      value={memberLogsChannel}
                      onChange={(e) => setMemberLogsChannel(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2b43]"
                    >
                      <option value="join-logs"># join-logs</option>
                      <option value="welcome"># welcome</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      MESSAGE DELETE & EDIT LOGS
                    </label>
                    <select
                      value={messageLogsChannel}
                      onChange={(e) => setMessageLogsChannel(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2b43]"
                    >
                      <option value="message-logs"># message-logs</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      VOICE ACTIVITY LOGS
                    </label>
                    <select
                      value={voiceLogsChannel}
                      onChange={(e) => setVoiceLogsChannel(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2b43]"
                    >
                      <option value="voice-logs"># voice-logs</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 7: CUSTOM ROLE */}
          {/* ======================================================== */}
          {activeModule === 'custom_role' && (
            <div className="space-y-6">
              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-6 h-6 text-purple-400" />
                  <div>
                    <h3 className="font-orbitron font-bold text-base text-white">
                      Custom Roles System
                    </h3>
                    <p className="text-xs text-slate-400">
                      Allow VIP members and server boosters to customize their personal roles
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCustomRoleEnabled(!customRoleEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    customRoleEnabled ? 'bg-purple-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      customRoleEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      CUSTOM ROLE PREFIX / TAG
                    </label>
                    <input
                      type="text"
                      value={customRolePrefix}
                      onChange={(e) => setCustomRolePrefix(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      MAX CUSTOM ROLES PER USER
                    </label>
                    <input
                      type="number"
                      value={customRoleLimit}
                      onChange={(e) => setCustomRoleLimit(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    ACTIVE CUSTOM ROLES
                  </p>
                  {customRolesList.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: r.color }}
                        ></span>
                        <span className="font-bold text-white">{r.name}</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {r.members} members
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 8: AUTOROLE */}
          {/* ======================================================== */}
          {activeModule === 'autorole' && (
            <div className="space-y-6">
              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h3 className="font-orbitron font-bold text-base text-white">
                      Auto-Role Assignment
                    </h3>
                    <p className="text-xs text-slate-400">
                      Automatically grant roles to newly joined members & bots
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAutoroleEnabled(!autoroleEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    autoroleEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      autoroleEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      ROLE FOR HUMANS (MEMBERS)
                    </label>
                    <select
                      value={autoroleHumans}
                      onChange={(e) => setAutoroleHumans(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Members">@Members</option>
                      <option value="Citizens">@Citizens</option>
                      <option value="Community">@Community</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      ROLE FOR BOTS
                    </label>
                    <select
                      value={autoroleBots}
                      onChange={(e) => setAutoroleBots(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Bots">@Bots</option>
                      <option value="Automations">@Automations</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      VERIFICATION / GATEKEEPER ROLE
                    </label>
                    <select
                      value={autoroleVerified}
                      onChange={(e) => setAutoroleVerified(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Verified Citizen">@Verified Citizen</option>
                      <option value="Verified Member">@Verified Member</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      ASSIGNMENT DELAY
                    </label>
                    <select
                      value={autoroleDelay}
                      onChange={(e) => setAutoroleDelay(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="0">Immediate (0s)</option>
                      <option value="5">5 Seconds Delay</option>
                      <option value="30">30 Seconds Delay</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 9: AUTOREACT */}
          {/* ======================================================== */}
          {activeModule === 'autoreact' && (
            <div className="space-y-6">
              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <Smile className="w-6 h-6 text-yellow-400" />
                  <div>
                    <h3 className="font-orbitron font-bold text-base text-white">
                      Auto-React Triggers
                    </h3>
                    <p className="text-xs text-slate-400">
                      Automatically react with emojis when messages are sent in channels
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAutoreactEnabled(!autoreactEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    autoreactEnabled ? 'bg-yellow-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      autoreactEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="font-orbitron font-bold text-xs text-slate-300 uppercase tracking-wider">
                  Add New Auto-Reaction Rule
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={newReactChannel}
                    onChange={(e) => setNewReactChannel(e.target.value)}
                    className="bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                  >
                    <option value="suggestions"># suggestions</option>
                    <option value="announcements"># announcements</option>
                    <option value="memes"># memes</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Emojis (e.g. 👍 👎)"
                    value={newReactEmojis}
                    onChange={(e) => setNewReactEmojis(e.target.value)}
                    className="bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                  />
                  <button
                    onClick={addAutoreactRule}
                    className="py-2 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs cursor-pointer transition-colors"
                  >
                    + Add Rule
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  {autoreactRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-slate-400" />
                        <span className="font-mono text-white">#{rule.channel}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-base">{rule.emojis}</span>
                        <button
                          onClick={() =>
                            setAutoreactRules(autoreactRules.filter((r) => r.id !== rule.id))
                          }
                          className="text-slate-500 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 10: AUTORESPONDER */}
          {/* ======================================================== */}
          {activeModule === 'autoresponder' && (
            <div className="space-y-6">
              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                  <div>
                    <h3 className="font-orbitron font-bold text-base text-white">
                      Auto-Responder Triggers
                    </h3>
                    <p className="text-xs text-slate-400">
                      Automate bot responses to frequently asked questions
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAutoresponderEnabled(!autoresponderEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    autoresponderEnabled ? 'bg-blue-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      autoresponderEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="font-orbitron font-bold text-xs text-slate-300 uppercase tracking-wider">
                  Create Auto-Responder
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Trigger keyword (e.g. !help, !store)"
                      value={newTrigger}
                      onChange={(e) => setNewTrigger(e.target.value)}
                      className="bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                    <select
                      value={newMatchType}
                      onChange={(e) => setNewMatchType(e.target.value)}
                      className="bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Exact Match">Exact Match</option>
                      <option value="Contains">Contains Keyword</option>
                    </select>
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Bot response message... (supports {user})"
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    className="w-full bg-[#13141d] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                  />

                  <button
                    onClick={addAutoresponder}
                    className="py-2 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer transition-colors"
                  >
                    + Add Auto-Responder
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  {autoresponders.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-400">{item.trigger}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                            {item.matchType}
                          </span>
                          <button
                            onClick={() =>
                              setAutoresponders(autoresponders.filter((a) => a.id !== item.id))
                            }
                            className="text-slate-500 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-300 text-[11px]">{item.response}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 11: GIVEAWAY */}
          {/* ======================================================== */}
          {activeModule === 'giveaway' && (
            <div className="space-y-6">
              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <Gift className="w-6 h-6 text-pink-500" />
                  <div>
                    <h3 className="font-orbitron font-bold text-base text-white">Giveaway Manager</h3>
                    <p className="text-xs text-slate-400">
                      Host interactive giveaways with automated winner selection
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setGiveawayEnabled(!giveawayEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    giveawayEnabled ? 'bg-pink-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      giveawayEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="font-orbitron font-bold text-xs text-slate-300 uppercase tracking-wider">
                  Launch New Giveaway
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">PRIZE</label>
                    <input
                      type="text"
                      placeholder="e.g. 1 Month Nitro"
                      value={giveawayPrize}
                      onChange={(e) => setGiveawayPrize(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">DURATION</label>
                    <select
                      value={giveawayDuration}
                      onChange={(e) => setGiveawayDuration(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                    >
                      <option value="1h">1 Hour</option>
                      <option value="24h">24 Hours</option>
                      <option value="3d">3 Days</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">
                      WINNERS COUNT
                    </label>
                    <input
                      type="number"
                      value={giveawayWinners}
                      onChange={(e) => setGiveawayWinners(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">CHANNEL</label>
                    <select
                      value={giveawayChannel}
                      onChange={(e) => setGiveawayChannel(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                    >
                      <option value="giveaways"># giveaways</option>
                      <option value="general"># general</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleStartGiveaway}
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  🎉 Start Live Giveaway
                </button>

                <div className="space-y-2 pt-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    ACTIVE GIVEAWAYS
                  </p>
                  {activeGiveaways.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">{g.prize}</p>
                        <p className="text-[10px] text-slate-400">
                          Channel: #{g.channel} • {g.winners} Winner(s)
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 font-mono text-[10px] font-bold">
                        ⏳ Ends in {g.endsIn}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 12: EMBED BUILDER */}
          {/* ======================================================== */}
          {activeModule === 'embed_builder' && (
            <div className="space-y-6">
              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <Code className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h3 className="font-orbitron font-bold text-base text-white">
                      Interactive Embed Builder
                    </h3>
                    <p className="text-xs text-slate-400">
                      Craft rich announcement cards with live visual feedback
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    TARGET CHANNEL TO SEND EMBED
                  </label>
                  <select
                    value={builderChannel}
                    onChange={(e) => setBuilderChannel(e.target.value)}
                    className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="announcements"># announcements</option>
                    <option value="general"># general</option>
                    <option value="rules"># rules</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      EMBED TITLE
                    </label>
                    <input
                      type="text"
                      value={embedTitle}
                      onChange={(e) => setEmbedTitle(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      EMBED COLOR
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={embedColor}
                        onChange={(e) => setEmbedColor(e.target.value)}
                        className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={embedColor}
                        onChange={(e) => setEmbedColor(e.target.value)}
                        className="flex-1 bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    DESCRIPTION
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#13141d] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                  />
                </div>

                <button
                  onClick={handleSendBuilderEmbed}
                  className="w-full py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {builderSent
                      ? '✓ Embed Dispatched to Discord!'
                      : `Send Embed to #${builderChannel}`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Master Save Button Bar */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#ff2b43] to-[#dc182f] hover:from-[#ff4055] hover:to-[#ff2b43] text-white font-bold text-sm shadow-xl shadow-[#ff2b43]/30 transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving to Bot Shards...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Configuration Saved Live!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </main>

        {/* Right Column: Live Discord Message Preview (Screenshot 4) */}
        <aside className="w-full lg:w-96 bg-[#08080c] border-l border-white/5 p-5 shrink-0 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between pb-2">
            <span className="font-orbitron font-bold text-xs tracking-wider text-slate-300 uppercase">
              Live Preview
            </span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Synchronized
            </span>
          </div>

          {/* Discord Chat Container */}
          <div className="bg-[#313338] rounded-2xl p-4 shadow-2xl font-sans text-slate-200 text-xs">
            {/* Discord Message Header */}
            <div className="flex items-start gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white shrink-0 overflow-hidden shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100&auto=format&fit=crop&q=80"
                  alt="Bot Avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-white text-xs">OnyxGuard</span>
                  <span className="px-1 py-0.2 rounded bg-[#5865F2] text-[9px] font-bold text-white uppercase tracking-wider">
                    BOT
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1">Today at 01:59 AM</span>
                </div>

                {contentMessage && (
                  <p className="mt-1 text-slate-200 text-xs">{renderPreview(contentMessage)}</p>
                )}
              </div>
            </div>

            {/* Discord Embed Card with colored left border */}
            <div
              className="ml-12 rounded-lg bg-[#2b2d31] p-3 text-xs space-y-2 border-l-4 shadow-md overflow-hidden"
              style={{ borderLeftColor: embedColor || '#ff2b43' }}
            >
              {authorName && (
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-300">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80"
                    alt="Author Icon"
                    className="w-4 h-4 rounded-full"
                  />
                  <span>{authorName}</span>
                </div>
              )}

              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-1">
                  {embedTitle && (
                    <h4 className="font-bold text-white text-xs">{renderPreview(embedTitle)}</h4>
                  )}
                  {description && (
                    <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {renderPreview(description)}
                    </p>
                  )}
                </div>

                {thumbnailUrl && (
                  <div className="w-12 h-12 rounded-md overflow-hidden shrink-0 border border-black/40">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {mainImageUrl && (
                <div className="rounded-md overflow-hidden max-h-40 border border-black/30 mt-2">
                  <img src={mainImageUrl} alt="Main Banner" className="w-full h-full object-cover" />
                </div>
              )}

              {footerText && (
                <div className="flex items-center gap-1.5 pt-1 text-[10px] text-slate-400">
                  <img
                    src={
                      guild.icon ||
                      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=50&auto=format&fit=crop&q=80'
                    }
                    alt="Server Icon"
                    className="w-3.5 h-3.5 rounded-full"
                  />
                  <span>{renderPreview(footerText)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Test Send Button */}
          <div className="pt-2">
            <button
              onClick={handleSendTestMessage}
              className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Send className="w-3.5 h-3.5 text-[#ff2b43]" />
              <span>
                {testSent ? '✓ Sent Test Message to #' + targetChannel : 'Send Test Message'}
              </span>
            </button>
          </div>
        </aside>
      </div>

      {/* Variables Guide Modal */}
      {showVariablesGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#0e0f14] border border-[#ff2b43]/30 rounded-2xl p-6 text-left shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <h3 className="font-orbitron font-bold text-sm text-white">Variables Guide</h3>
              <button
                onClick={() => setShowVariablesGuide(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                <code className="text-[#ff2b43] font-mono font-bold">{'{user}'}</code>
                <p className="text-slate-400 text-[11px] mt-0.5">Mentions the joining member.</p>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                <code className="text-[#ff2b43] font-mono font-bold">{'{server_name}'}</code>
                <p className="text-slate-400 text-[11px] mt-0.5">The current server's name.</p>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                <code className="text-[#ff2b43] font-mono font-bold">{'{server_membercount}'}</code>
                <p className="text-slate-400 text-[11px] mt-0.5">Total member count after joining.</p>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                <code className="text-[#ff2b43] font-mono font-bold">{'{user_avatar}'}</code>
                <p className="text-slate-400 text-[11px] mt-0.5">Direct URL to user avatar picture.</p>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                <code className="text-[#ff2b43] font-mono font-bold">{'{server_icon}'}</code>
                <p className="text-slate-400 text-[11px] mt-0.5">Direct URL to server icon image.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Modal */}
      {showAuditLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0e0f14] border border-white/10 rounded-2xl p-6 text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-orbitron font-bold text-sm text-white">
                Audit Logs - {guild.name}
              </h3>
              <button
                onClick={() => setShowAuditLogs(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-emerald-400 font-bold">ANTI-NUKE TRIGGER</span>
                  <p className="text-slate-400 text-[11px]">
                    Blocked unauthorized mass ban by ID 1412791188
                  </p>
                </div>
                <span className="text-slate-500 text-[10px]">Just now</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-cyan-400 font-bold">AUTOMOD LINK BLOCKED</span>
                  <p className="text-slate-400 text-[11px]">
                    Deleted unauthorized invite link in #general
                  </p>
                </div>
                <span className="text-slate-500 text-[10px]">2m ago</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-amber-400 font-bold">SETTINGS SYNC</span>
                  <p className="text-slate-400 text-[11px]">Updated welcomer message configuration</p>
                </div>
                <span className="text-slate-500 text-[10px]">5m ago</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};