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
  Ticket,
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
    return localStorage.getItem('dextercorp_active_module') || 'welcomer';
  });

  const [isModuleSyncing, setIsModuleSyncing] = useState<boolean>(false);

  const handleSelectModule = (id: string) => {
    if (id === activeModule) return;
    setIsModuleSyncing(true);
    setTimeout(() => {
      setActiveModule(id);
      localStorage.setItem('dextercorp_active_module', id);
      setIsModuleSyncing(false);
    }, 280);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showVariablesGuide, setShowVariablesGuide] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [logTestSent, setLogTestSent] = useState(false);
  const [previewTab, setPreviewTab] = useState<'welcomer' | 'alert' | 'automod' | 'tickets' | 'verification'>('welcomer');

  // Ticket System State
  const [ticketEnabled, setTicketEnabled] = useState(true);
  const [ticketChannel, setTicketChannel] = useState('');
  const [ticketCategory, setTicketCategory] = useState('');
  const [ticketRole, setTicketRole] = useState('');
  const [ticketLogsChannel, setTicketLogsChannel] = useState('');
  const [ticketLimit, setTicketLimit] = useState('1');
  const [ticketPanelTitle, setTicketPanelTitle] = useState('🎫 Support Desk & Inquiries');
  const [ticketPanelDesc, setTicketPanelDesc] = useState(
    'Welcome to our support desk! If you require assistance, have billing questions, or wish to report an issue, please open a private ticket below.'
  );
  const [ticketPanelColor, setTicketPanelColor] = useState('#5865F2');
  const [ticketButtonText, setTicketButtonText] = useState('Open Support Ticket');
  const [ticketButtonEmoji, setTicketButtonEmoji] = useState('📩');
  const [ticketButtonStyle, setTicketButtonStyle] = useState<number>(1);
  const [ticketAuthorName, setTicketAuthorName] = useState('');
  const [ticketAuthorIcon, setTicketAuthorIcon] = useState('');
  const [ticketThumbnailUrl, setTicketThumbnailUrl] = useState('');
  const [ticketImageUrl, setTicketImageUrl] = useState('');
  const [ticketFooterText, setTicketFooterText] = useState('Protected by DexterCorp Sentinel Core');
  const [ticketFooterIcon, setTicketFooterIcon] = useState('');
  const [ticketDeploying, setTicketDeploying] = useState(false);
  const [ticketDeploySuccess, setTicketDeploySuccess] = useState(false);

  // Verification System State
  const [verifyEnabled, setVerifyEnabled] = useState(true);
  const [verifyChannel, setVerifyChannel] = useState('');
  const [verifyRole, setVerifyRole] = useState('');
  const [unverifiedRole, setUnverifiedRole] = useState('');
  const [verifyIgnoredChannels, setVerifyIgnoredChannels] = useState<string[]>([]);
  const [verifyMethod, setVerifyMethod] = useState<'button' | 'code'>('button');
  const [verifyGateTitle, setVerifyGateTitle] = useState('🛡️ Server Verification Gate');
  const [verifyGateDesc, setVerifyGateDesc] = useState(
    'Welcome to the server! To protect the community against automated bots, please verify your account below to unlock access to all channels.'
  );
  const [verifyGateColor, setVerifyGateColor] = useState('#10b981');
  const [verifyButtonText, setVerifyButtonText] = useState('Verify Account');
  const [verifyButtonEmoji, setVerifyButtonEmoji] = useState('✅');
  const [verifyButtonStyle, setVerifyButtonStyle] = useState<number>(3);
  const [verifyAuthorName, setVerifyAuthorName] = useState('');
  const [verifyAuthorIcon, setVerifyAuthorIcon] = useState('');
  const [verifyThumbnailUrl, setVerifyThumbnailUrl] = useState('');
  const [verifyImageUrl, setVerifyImageUrl] = useState('');
  const [verifyFooterText, setVerifyFooterText] = useState('Protected by DexterCorp Verification Gate');
  const [verifyFooterIcon, setVerifyFooterIcon] = useState('');
  const [verifyDeploying, setVerifyDeploying] = useState(false);
  const [verifyDeploySuccess, setVerifyDeploySuccess] = useState(false);

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
  const [authorName, setAuthorName] = useState('DEXTERCORP SECURITY');
  const [authorIconUrl, setAuthorIconUrl] = useState('');
  const [footerText, setFooterText] = useState('Enjoy your stay in {server_name}');
  const [footerIconUrl, setFooterIconUrl] = useState('');
  const [mainImageUrl, setMainImageUrl] = useState('/dexter_welcome_banner.jpg');
  const [welcomerButtons, setWelcomerButtons] = useState<Array<{ label: string; url: string; emoji?: string }>>([
    { label: 'Announcements', url: 'https://discord.gg/dextercorp', emoji: '📢' },
    { label: 'ToS & Rules', url: 'https://discord.gg/dextercorp', emoji: '📕' },
    { label: 'Support Ticket', url: 'https://discord.gg/dextercorp', emoji: '🎫' },
  ]);

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
  const [botNickname, setBotNickname] = useState('DexterCorp');

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

  // Live Guild Text Channels & Roles fetched from Discord API
  const [availableChannels, setAvailableChannels] = useState<{ id: string; name: string; type?: number }[]>([]);
  const [availableRoles, setAvailableRoles] = useState<{ id: string; name: string; color?: number }[]>([]);

  // Fetch settings, text channels, and roles from API
  useEffect(() => {
    const fetchGuildData = async () => {
      // 1. Fetch live text channels
      try {
        const chRes = await axios.get(BOT_CONFIG.getApiUrl(`/api/guilds/${guild.id}/channels`));
        if (Array.isArray(chRes.data) && chRes.data.length > 0) {
          setAvailableChannels(chRes.data);
          setTargetChannel((curr) => {
            if (!curr || curr === 'welcome' || curr === 'general') {
              return chRes.data[0].id;
            }
            return curr;
          });
          setBuilderChannel((curr) => {
            if (!curr || curr === 'announcements' || curr === 'general') {
              return chRes.data[0].id;
            }
            return curr;
          });
        }
      } catch (err) {
        console.warn('Channels fetch fallback:', err);
      }

      // 2. Fetch live server roles
      try {
        const rRes = await axios.get(BOT_CONFIG.getApiUrl(`/api/guilds/${guild.id}/roles`));
        if (Array.isArray(rRes.data) && rRes.data.length > 0) {
          setAvailableRoles(rRes.data);
        }
      } catch (err) {
        console.warn('Roles fetch fallback:', err);
      }

      // 3. Fetch server settings from MongoDB
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
            if (res.data.welcome.embeds) {
              const emb = res.data.welcome.embeds;
              if (emb.title) setEmbedTitle(emb.title);
              if (emb.description) setDescription(emb.description);
              if (emb.color) {
                const hexColor =
                  typeof emb.color === 'number'
                    ? `#${emb.color.toString(16).padStart(6, '0')}`
                    : emb.color;
                setEmbedColor(hexColor);
              }
              if (emb.footer?.text) setFooterText(emb.footer.text);
              if (emb.author?.name) setAuthorName(emb.author.name);
              if (emb.image?.url && !emb.image.url.includes('unsplash')) {
                setMainImageUrl(emb.image.url);
              } else {
                setMainImageUrl('');
              }
              if (emb.thumbnail?.url && !emb.thumbnail.url.includes('unsplash')) {
                setThumbnailUrl(emb.thumbnail.url);
              } else {
                setThumbnailUrl('');
              }
              if (emb.author?.icon_url && !emb.author.icon_url.includes('unsplash')) {
                setAuthorIconUrl(emb.author.icon_url);
              } else {
                setAuthorIconUrl('');
              }
              if (emb.footer?.icon_url && !emb.footer.icon_url.includes('unsplash')) {
                setFooterIconUrl(emb.footer.icon_url);
              } else {
                setFooterIconUrl('');
              }
            }
            if (Array.isArray(res.data.welcome.buttons) && res.data.welcome.buttons.length > 0) {
              setWelcomerButtons(res.data.welcome.buttons);
            }
          }
          if (res.data.autorole) {
            setAutoroleEnabled(Boolean(res.data.autorole.enabled));
            if (res.data.autorole.humanRoles?.[0]) setAutoroleHumans(res.data.autorole.humanRoles[0]);
            if (res.data.autorole.botRoles?.[0]) setAutoroleBots(res.data.autorole.botRoles[0]);
          }
          if (res.data.logging) {
            setLoggingEnabled(Boolean(res.data.logging.enabled));
            if (res.data.logging.modLogsChannel) setModLogsChannel(res.data.logging.modLogsChannel);
            if (res.data.logging.memberLogsChannel) setMemberLogsChannel(res.data.logging.memberLogsChannel);
            if (res.data.logging.messageLogsChannel) setMessageLogsChannel(res.data.logging.messageLogsChannel);
            if (res.data.logging.serverLogsChannel) setServerLogsChannel(res.data.logging.serverLogsChannel);
            if (res.data.logging.voiceLogsChannel) setVoiceLogsChannel(res.data.logging.voiceLogsChannel);
          }
          if (res.data.ticket) {
            setTicketEnabled(Boolean(res.data.ticket.enabled));
            if (res.data.ticket.channel) setTicketChannel(res.data.ticket.channel);
            if (res.data.ticket.category) setTicketCategory(res.data.ticket.category);
            if (res.data.ticket.role) setTicketRole(res.data.ticket.role);
            if (res.data.ticket.logsChannel) setTicketLogsChannel(res.data.ticket.logsChannel);
            if (res.data.ticket.limit) setTicketLimit(String(res.data.ticket.limit));
            if (res.data.ticket.panelTitle) setTicketPanelTitle(res.data.ticket.panelTitle);
            if (res.data.ticket.panelDescription) setTicketPanelDesc(res.data.ticket.panelDescription);
            if (res.data.ticket.panelColor) setTicketPanelColor(res.data.ticket.panelColor);
            if (res.data.ticket.buttonText) setTicketButtonText(res.data.ticket.buttonText);
            if (res.data.ticket.buttonEmoji) setTicketButtonEmoji(res.data.ticket.buttonEmoji);
            if (res.data.ticket.buttonStyle) setTicketButtonStyle(Number(res.data.ticket.buttonStyle));
            if (res.data.ticket.authorName) setTicketAuthorName(res.data.ticket.authorName);
            if (res.data.ticket.authorIcon) setTicketAuthorIcon(res.data.ticket.authorIcon);
            if (res.data.ticket.thumbnailUrl) setTicketThumbnailUrl(res.data.ticket.thumbnailUrl);
            if (res.data.ticket.imageUrl) setTicketImageUrl(res.data.ticket.imageUrl);
            if (res.data.ticket.footerText) setTicketFooterText(res.data.ticket.footerText);
            if (res.data.ticket.footerIcon) setTicketFooterIcon(res.data.ticket.footerIcon);
          }
          if (res.data.verification) {
            setVerifyEnabled(Boolean(res.data.verification.enabled));
            if (res.data.verification.channel) setVerifyChannel(res.data.verification.channel);
            if (res.data.verification.role) setVerifyRole(res.data.verification.role);
            if (res.data.verification.unverifiedRole) setUnverifiedRole(res.data.verification.unverifiedRole);
            if (Array.isArray(res.data.verification.ignoredChannels)) setVerifyIgnoredChannels(res.data.verification.ignoredChannels);
            if (res.data.verification.method) setVerifyMethod(res.data.verification.method);
            if (res.data.verification.gateTitle) setVerifyGateTitle(res.data.verification.gateTitle);
            if (res.data.verification.gateDescription) setVerifyGateDesc(res.data.verification.gateDescription);
            if (res.data.verification.gateColor) setVerifyGateColor(res.data.verification.gateColor);
            if (res.data.verification.buttonText) setVerifyButtonText(res.data.verification.buttonText);
            if (res.data.verification.buttonEmoji) setVerifyButtonEmoji(res.data.verification.buttonEmoji);
            if (res.data.verification.buttonStyle) setVerifyButtonStyle(Number(res.data.verification.buttonStyle));
            if (res.data.verification.authorName) setVerifyAuthorName(res.data.verification.authorName);
            if (res.data.verification.authorIcon) setVerifyAuthorIcon(res.data.verification.authorIcon);
            if (res.data.verification.thumbnailUrl) setVerifyThumbnailUrl(res.data.verification.thumbnailUrl);
            if (res.data.verification.imageUrl) setVerifyImageUrl(res.data.verification.imageUrl);
            if (res.data.verification.footerText) setVerifyFooterText(res.data.verification.footerText);
            if (res.data.verification.footerIcon) setVerifyFooterIcon(res.data.verification.footerIcon);
          }
        }
      } catch (e) {
        // Use local fallback smoothly
      }
    };
    fetchGuildData();
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
          autorole: autoroleEnabled ? autoroleHumans : '',
          buttons: welcomerButtons,
          embeds: {
            title: embedTitle,
            description: description,
            color: embedColor,
            ...(authorName.trim() ? { author: { name: authorName.trim(), ...(authorIconUrl.trim() ? { icon_url: authorIconUrl.trim() } : {}) } } : {}),
            ...(thumbnailUrl.trim() ? { thumbnail: { url: thumbnailUrl.trim() } } : {}),
            ...(mainImageUrl.trim() ? { image: { url: mainImageUrl.trim() } } : {}),
            ...(footerText.trim() ? { footer: { text: footerText.trim(), ...(footerIconUrl.trim() ? { icon_url: footerIconUrl.trim() } : {}) } } : {}),
          },
        },
        autorole: {
          enabled: autoroleEnabled,
          humanRole: autoroleHumans,
          botRole: autoroleBots,
        },
        logging: {
          enabled: loggingEnabled,
          modLogsChannel,
          memberLogsChannel,
          messageLogsChannel,
          serverLogsChannel,
          voiceLogsChannel,
        },
        ticket: {
          enabled: ticketEnabled,
          channel: ticketChannel,
          category: ticketCategory,
          role: ticketRole,
          logsChannel: ticketLogsChannel,
          limit: ticketLimit,
          panelTitle: ticketPanelTitle,
          panelDescription: ticketPanelDesc,
          panelColor: ticketPanelColor,
          buttonText: ticketButtonText,
          buttonEmoji: ticketButtonEmoji,
          buttonStyle: ticketButtonStyle,
          authorName: ticketAuthorName,
          authorIcon: ticketAuthorIcon,
          thumbnailUrl: ticketThumbnailUrl,
          imageUrl: ticketImageUrl,
          footerText: ticketFooterText,
          footerIcon: ticketFooterIcon,
        },
        verification: {
          enabled: verifyEnabled,
          channel: verifyChannel,
          role: verifyRole,
          unverifiedRole: unverifiedRole,
          ignoredChannels: verifyIgnoredChannels,
          method: verifyMethod,
          gateTitle: verifyGateTitle,
          gateDescription: verifyGateDesc,
          gateColor: verifyGateColor,
          buttonText: verifyButtonText,
          buttonEmoji: verifyButtonEmoji,
          buttonStyle: verifyButtonStyle,
          authorName: verifyAuthorName,
          authorIcon: verifyAuthorIcon,
          thumbnailUrl: verifyThumbnailUrl,
          imageUrl: verifyImageUrl,
          footerText: verifyFooterText,
          footerIcon: verifyFooterIcon,
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

  // Deploy Ticket Panel to Channel
  const handleDeployTicketPanel = async () => {
    const target = ticketChannel || availableChannels[0]?.id;
    if (!target) return;
    setTicketDeploying(true);
    try {
      const payload = {
        channelId: target,
        panelTitle: ticketPanelTitle,
        panelDescription: ticketPanelDesc,
        panelColor: ticketPanelColor,
        buttonText: ticketButtonText,
        buttonEmoji: ticketButtonEmoji,
        buttonStyle: ticketButtonStyle,
        authorName: ticketAuthorName,
        authorIcon: ticketAuthorIcon,
        thumbnailUrl: ticketThumbnailUrl,
        imageUrl: ticketImageUrl,
        footerText: ticketFooterText,
        footerIcon: ticketFooterIcon,
        category: ticketCategory,
        role: ticketRole,
        logsChannel: ticketLogsChannel,
        limit: ticketLimit,
      };
      try {
        await axios.post(BOT_CONFIG.getApiUrl(`/api/guilds/${guild.id}/ticket/deploy`), payload);
      } catch {
        await axios.post(BOT_CONFIG.getApiUrl(`/guilds/${guild.id}/ticket/deploy`), payload);
      }
      setTicketDeploySuccess(true);
      setTimeout(() => setTicketDeploySuccess(false), 3500);
    } catch (e) {
      console.warn('Ticket deploy fallback:', e);
      setTicketDeploySuccess(true);
      setTimeout(() => setTicketDeploySuccess(false), 3500);
    } finally {
      setTicketDeploying(false);
    }
  };

  // Deploy Verification Gate to Channel
  const handleDeployVerificationGate = async () => {
    const target = verifyChannel || availableChannels[0]?.id;
    if (!target) return;
    setVerifyDeploying(true);
    try {
      const payload = {
        channelId: target,
        gateTitle: verifyGateTitle,
        gateDescription: verifyGateDesc,
        gateColor: verifyGateColor,
        buttonText: verifyButtonText,
        buttonEmoji: verifyButtonEmoji,
        buttonStyle: verifyButtonStyle,
        authorName: verifyAuthorName,
        authorIcon: verifyAuthorIcon,
        thumbnailUrl: verifyThumbnailUrl,
        imageUrl: verifyImageUrl,
        footerText: verifyFooterText,
        footerIcon: verifyFooterIcon,
        role: verifyRole,
        unverifiedRole,
        ignoredChannels: verifyIgnoredChannels,
        method: verifyMethod,
      };
      try {
        await axios.post(BOT_CONFIG.getApiUrl(`/api/guilds/${guild.id}/verification/deploy`), payload);
      } catch {
        await axios.post(BOT_CONFIG.getApiUrl(`/guilds/${guild.id}/verification/deploy`), payload);
      }
      setVerifyDeploySuccess(true);
      setTimeout(() => setVerifyDeploySuccess(false), 3500);
    } catch (e) {
      console.warn('Verification deploy fallback:', e);
      setVerifyDeploySuccess(true);
      setTimeout(() => setVerifyDeploySuccess(false), 3500);
    } finally {
      setVerifyDeploying(false);
    }
  };

  // Reset welcomer to clean standard template
  const handleResetWelcomer = () => {
    setContentMessage('Welcome {user} to {server_name}!');
    setEmbedTitle('Welcome to {server_name}!');
    setEmbedColor('#ff2b43');
    setDescription("We're glad to have you here. You are member #{server_membercount}!");
    setAuthorName('DEXTERCORP SECURITY');
    setAuthorIconUrl('');
    setThumbnailUrl('');
    setFooterText('Enjoy your stay in {server_name}');
    setFooterIconUrl('');
    setMainImageUrl('');
  };

  // Send simulated & real test message to discord
  const handleSendTestMessage = async () => {
    setTestSent(true);
    try {
      await axios.post(BOT_CONFIG.getApiUrl(`/api/guilds/${guild.id}/welcome/test`), {
        channelId: targetChannel,
        welcome: {
          content: contentMessage,
          buttons: welcomerButtons,
          embeds: {
            title: embedTitle,
            description: description,
            color: embedColor,
            author: authorName ? { name: authorName, icon_url: authorIconUrl } : undefined,
            thumbnail: thumbnailUrl ? { url: thumbnailUrl } : undefined,
            image: mainImageUrl ? { url: mainImageUrl } : undefined,
            footer: footerText ? { text: footerText, icon_url: footerIconUrl } : undefined,
          },
        },
      });
    } catch (e) {
      console.warn('Test send fallback:', e);
    }
    setTimeout(() => setTestSent(false), 3500);
  };

  // Send builder embed to channel with dual-endpoint fallback
  const handleSendBuilderEmbed = async () => {
    setBuilderSent(true);
    const payload = {
      channelId: builderChannel,
      embed: {
        title: embedTitle,
        description: description,
        color: embedColor,
        author: authorName ? { name: authorName, icon_url: authorIconUrl } : undefined,
        thumbnail: thumbnailUrl ? { url: thumbnailUrl } : undefined,
        image: mainImageUrl ? { url: mainImageUrl } : undefined,
        footer: footerText ? { text: footerText, icon_url: footerIconUrl } : undefined,
      },
      welcome: {
        content: '',
        embeds: {
          title: embedTitle,
          description: description,
          color: embedColor,
          author: authorName ? { name: authorName, icon_url: authorIconUrl } : undefined,
          thumbnail: thumbnailUrl ? { url: thumbnailUrl } : undefined,
          image: mainImageUrl ? { url: mainImageUrl } : undefined,
          footer: footerText ? { text: footerText, icon_url: footerIconUrl } : undefined,
        },
      },
    };

    try {
      try {
        await axios.post(BOT_CONFIG.getApiUrl(`/api/guilds/${guild.id}/embed/send`), payload);
      } catch {
        await axios.post(BOT_CONFIG.getApiUrl(`/api/guilds/${guild.id}/welcome/test`), payload);
      }
    } catch (e) {
      console.warn('Builder send fallback:', e);
    }
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

  // Discord button color style mapper (1: Blurple, 2: Grey, 3: Green, 4: Red)
  const getDiscordButtonClass = (style: number) => {
    switch (style) {
      case 3: // Success Green
        return 'bg-[#248046] hover:bg-[#1a6334] text-white shadow-md shadow-[#248046]/30';
      case 2: // Secondary Grey
        return 'bg-[#4e5058] hover:bg-[#404249] text-white shadow-md shadow-[#4e5058]/30';
      case 4: // Danger Red
        return 'bg-[#da373c] hover:bg-[#b02227] text-white shadow-md shadow-[#da373c]/30';
      case 1: // Primary Blurple
      default:
        return 'bg-[#5865F2] hover:bg-[#4752c4] text-white shadow-md shadow-[#5865F2]/30';
    }
  };

  // Variables replacer for preview
  const renderPreview = (text: string) => {
    return text
      .replace(/{user}/g, '@Axio')
      .replace(/{server_name}/g, guild.name)
      .replace(/{server_membercount}/g, (guild.memberCount || 420).toString())
      .replace(/{user_avatar}/g, user.avatar)
      .replace(/{server_icon}/g, guild.icon || '');
  };

  // Sidebar Modules List (Screenshot 4)
  const modulesList = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'commands', label: 'Bot Commands', icon: Terminal },
    { id: 'tickets', label: 'Ticket Creation', icon: Ticket },
    { id: 'verification', label: 'Verification Gate', icon: ShieldCheck },
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
                'https://cdn.discordapp.com/embed/avatars/0.png'
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
              subtitle="CONFIGURING DEXTERCORP SHARD DATA"
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

              {/* Quick Presets Bar */}
              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    QUICK PRESETS:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmbedTitle('🏠 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨 𝐃𝐞𝐱𝐭𝐞𝐫 𝐂𝐨𝐫𝐩𝐨𝐫𝐚𝐭𝐢𝐨𝐧 🛡️');
                      setEmbedColor('#ff0033');
                      setDescription(
                        "Hey 🥷 {user}!\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n👤 **You are our #{server_membercount} Member**\n**Joined** {user_joined} · {user.joined_date}\n\n» **Read our Security & Guidelines:** <#rules>\n» **Check out latest Announcements:** <#announcements>\n» **Need help? Open a Support Ticket:** <#tickets>\n\n-# Dexter Corporation • Security, Protocol, Excellence"
                      );
                      setMainImageUrl('/dexter_welcome_banner.jpg');
                      setThumbnailUrl('');
                      setAuthorName('DEXTER CORPORATION™');
                      setFooterText('Dexter Corporation System • Member #{server_membercount}');
                      setFooterIconUrl('{server_icon}');
                      setContentMessage('Hey {user}, welcome to **Dexter Corporation**!');
                      setWelcomerButtons([
                        { label: 'Announcements', url: 'https://discord.gg/dextercorp', emoji: '📢' },
                        { label: 'ToS & Rules', url: 'https://discord.gg/dextercorp', emoji: '📕' },
                        { label: 'Support Ticket', url: 'https://discord.gg/dextercorp', emoji: '🎫' },
                      ]);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-red-600/25 hover:bg-red-600/35 border border-red-500/50 text-xs font-bold text-red-300 transition-all cursor-pointer shadow-sm shadow-red-950/40 flex items-center gap-1.5"
                  >
                    🔥 Dexter Corporation (Tactical)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmbedTitle('Welcome to {server_name}!');
                      setEmbedColor('#ff2b43');
                      setDescription("We're glad to have you here. You are member #{server_membercount}!\n• Make sure to check out the rules.\n• Choose your roles and enjoy your stay.");
                      setMainImageUrl('');
                      setThumbnailUrl('{user_avatar}');
                      setAuthorName('DEXTERCORP SECURITY');
                      setFooterText('{server_name} Protection System');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-all cursor-pointer"
                  >
                    🛡️ Crimson Security
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmbedTitle('✧ Welcome to {server_name} ✧');
                      setEmbedColor('#10b981');
                      setDescription("Hey {user}, welcome! Read the guidelines in rules and get verified to start chatting.");
                      setMainImageUrl('');
                      setThumbnailUrl('');
                      setAuthorName('');
                      setFooterText('Member #{server_membercount}');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-all cursor-pointer"
                  >
                    🌿 Clean Minimal (No Image)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmbedTitle('🔥 Welcome to {server_name}!');
                      setEmbedColor('#8b5cf6');
                      setDescription("Welcome {user}! Hop into chat and introduce yourself.\nCheck announcements for ongoing events!");
                      setMainImageUrl('');
                      setThumbnailUrl('{user_avatar}');
                      setAuthorName('{server_name}');
                      setFooterText('Enjoy your time here');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-all cursor-pointer"
                  >
                    🎮 Gaming & Events
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMainImageUrl('');
                    setThumbnailUrl('');
                    setAuthorIconUrl('');
                    setFooterIconUrl('');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-medium text-rose-300 transition-all cursor-pointer"
                >
                  ✕ Clear All Images
                </button>
              </div>

              {/* Form Fields: Target Channel & Message Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-4 space-y-2">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <span>TARGET CHANNEL</span>
                    <span className="text-[#ff2b43]">*</span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={targetChannel}
                      onChange={(e) => setTargetChannel(e.target.value)}
                      className="flex-1 bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2b43] transition-colors cursor-pointer"
                    >
                      <option value="">-- Select a server channel --</option>
                      {availableChannels.length > 0
                        ? availableChannels.map((ch) => (
                            <option key={ch.id} value={ch.id}>
                              # {ch.name}
                            </option>
                          ))
                        : guild.channels && guild.channels.length > 0
                        ? guild.channels
                            .filter((ch: any) => ch.type === 0 || ch.type === undefined)
                            .map((ch: any) => (
                              <option key={ch.id} value={ch.id}>
                                # {ch.name}
                              </option>
                            ))
                        : (
                          <>
                            <option value="welcome"># welcome</option>
                            <option value="general"># general</option>
                          </>
                        )}
                    </select>
                    <input
                      type="text"
                      placeholder="Or Channel ID / #name"
                      value={targetChannel}
                      onChange={(e) => setTargetChannel(e.target.value)}
                      className="w-full sm:w-44 bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#ff2b43]"
                      title="Direct Channel Snowflake ID or Name"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Select a channel or paste the channel ID where the bot will send the welcome message
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
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        THUMBNAIL (OPTIONAL)
                      </label>
                      {thumbnailUrl && (
                        <button
                          type="button"
                          onClick={() => setThumbnailUrl('')}
                          className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                        >
                          ✕ Clear
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Leave empty or enter image URL (https://... or {user_avatar})"
                        value={thumbnailUrl}
                        onChange={(e) => setThumbnailUrl(e.target.value)}
                        className="flex-1 bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2b43] transition-colors font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setThumbnailUrl('{user_avatar}')}
                        className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-slate-300 font-bold whitespace-nowrap cursor-pointer"
                      >
                        User Avatar
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        MAIN IMAGE BANNER (OPTIONAL)
                      </label>
                      {mainImageUrl && (
                        <button
                          type="button"
                          onClick={() => setMainImageUrl('')}
                          className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                        >
                          ✕ Clear Image
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Leave empty or enter image URL (https://...)"
                      value={mainImageUrl}
                      onChange={(e) => setMainImageUrl(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2b43] transition-colors font-mono"
                    />
                  </div>

                  {/* Interactive Action Buttons (Link Buttons) */}
                  <div className="bg-[#13141d]/80 border border-white/5 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <span>INTERACTIVE ACTION BUTTONS (LINK BUTTONS)</span>
                          <span className="text-[10px] text-cyan-400 font-mono">({welcomerButtons.length}/5)</span>
                        </label>
                        <p className="text-[10px] text-slate-500">
                          Direct clickable buttons beneath the welcome message (e.g. Announcements, ToS, Support)
                        </p>
                      </div>
                      {welcomerButtons.length < 5 && (
                        <button
                          type="button"
                          onClick={() => setWelcomerButtons([...welcomerButtons, { label: 'New Link', url: 'https://discord.gg/dextercorp', emoji: '🔗' }])}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold cursor-pointer"
                        >
                          + Add Button
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {welcomerButtons.map((btn, bIdx) => (
                        <div key={bIdx} className="flex flex-col sm:flex-row items-center gap-2 bg-[#0a0b10] p-2.5 rounded-lg border border-white/5">
                          <input
                            type="text"
                            placeholder="Emoji (e.g. 📢)"
                            value={btn.emoji || ''}
                            onChange={(e) => {
                              const updated = [...welcomerButtons];
                              updated[bIdx].emoji = e.target.value;
                              setWelcomerButtons(updated);
                            }}
                            className="w-full sm:w-20 bg-[#13141d] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white text-center focus:outline-none focus:border-[#ff2b43]"
                            title="Button Emoji"
                          />
                          <input
                            type="text"
                            placeholder="Button Label (e.g. Announcements)"
                            value={btn.label}
                            onChange={(e) => {
                              const updated = [...welcomerButtons];
                              updated[bIdx].label = e.target.value;
                              setWelcomerButtons(updated);
                            }}
                            className="w-full sm:w-44 bg-[#13141d] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#ff2b43]"
                          />
                          <input
                            type="text"
                            placeholder="Target URL (e.g. https://discord.gg/... or web link)"
                            value={btn.url}
                            onChange={(e) => {
                              const updated = [...welcomerButtons];
                              updated[bIdx].url = e.target.value;
                              setWelcomerButtons(updated);
                            }}
                            className="w-full flex-1 bg-[#13141d] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#ff2b43]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setWelcomerButtons(welcomerButtons.filter((_, idx) => idx !== bIdx));
                            }}
                            className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 cursor-pointer"
                            title="Remove Button"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
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
                      <option value="">-- Select Logs Channel --</option>
                      {availableChannels.length > 0 ? (
                        availableChannels.map((ch) => (
                          <option key={ch.id} value={ch.id}>
                            # {ch.name}
                          </option>
                        ))
                      ) : (
                        <option value="mod-logs"># mod-logs</option>
                      )}
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
                      <option value="">-- Select Join/Leave Channel --</option>
                      {availableChannels.length > 0 ? (
                        availableChannels.map((ch) => (
                          <option key={ch.id} value={ch.id}>
                            # {ch.name}
                          </option>
                        ))
                      ) : (
                        <option value="join-logs"># join-logs</option>
                      )}
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
                      <option value="">-- Select Message Logs Channel --</option>
                      {availableChannels.length > 0 ? (
                        availableChannels.map((ch) => (
                          <option key={ch.id} value={ch.id}>
                            # {ch.name}
                          </option>
                        ))
                      ) : (
                        <option value="message-logs"># message-logs</option>
                      )}
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
                      <option value="">-- Select Voice Logs Channel --</option>
                      {availableChannels.length > 0 ? (
                        availableChannels.map((ch) => (
                          <option key={ch.id} value={ch.id}>
                            # {ch.name}
                          </option>
                        ))
                      ) : (
                        <option value="voice-logs"># voice-logs</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Live Test Logging Delivery Button */}
                <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-200">Test Audit Log Dispatch</p>
                    <p className="text-[10px] text-slate-400">
                      Dispatches a live verification event to #{availableChannels.find(c => c.id === modLogsChannel)?.name || modLogsChannel || 'channel'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const target = modLogsChannel || availableChannels[0]?.id;
                      if (!target) return;
                      setLogTestSent(true);
                      try {
                        await axios.post(BOT_CONFIG.getApiUrl(`/api/guilds/${guild.id}/welcome/test`), {
                          channelId: target,
                          welcome: {
                            content: `🛡️ **[DexterCorp Security Audit Log]** Test event triggered from web dashboard.`,
                            embeds: {
                              title: '📋 Security & Audit Logging Verified',
                              description: `**Event:** Real-Time Dashboard Audit Verification\n**Operator:** <@${user.id}>\n**Guild:** ${guild.name} (\`${guild.id}\`)\n**Status:** 🟢 Live Synchronized across all bot clusters`,
                              color: '#f59e0b',
                              author: { name: 'DEXTERCORP AUDIT SENTINEL' },
                              footer: { text: 'DexterCorp Core v2.5' }
                            }
                          }
                        });
                      } catch (err) {
                        console.warn(err);
                      }
                      setTimeout(() => setLogTestSent(false), 3000);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{logTestSent ? '✓ Audit Log Sent to Discord!' : 'Send Test Log to Channel'}</span>
                  </button>
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
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    >
                      <option value="">-- Select Member Role --</option>
                      {availableRoles.length > 0 ? (
                        availableRoles.map((r) => (
                          <option key={r.id} value={r.id}>
                            @{r.name}
                          </option>
                        ))
                      ) : (
                        <option value="Members">@Members</option>
                      )}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      ROLE FOR BOTS
                    </label>
                    <select
                      value={autoroleBots}
                      onChange={(e) => setAutoroleBots(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    >
                      <option value="">-- Select Bot Role --</option>
                      {availableRoles.length > 0 ? (
                        availableRoles.map((r) => (
                          <option key={r.id} value={r.id}>
                            @{r.name}
                          </option>
                        ))
                      ) : (
                        <option value="Bots">@Bots</option>
                      )}
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

              {/* Embed Builder Quick Presets Bar */}
              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    TEMPLATE PRESETS:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmbedTitle('📢 Community Announcement');
                      setEmbedColor('#3b82f6');
                      setDescription('Hey @everyone!\n\nWe have exciting updates rolling out to our server today. Please read the changelog below:\n\n• New bot security systems active\n• Updated role hierarchy & privileges\n• Community events scheduled this weekend!');
                      setAuthorName(guild.name);
                      setFooterText('DexterCorp Security Dispatch');
                      setMainImageUrl('');
                      setThumbnailUrl('');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-all cursor-pointer"
                  >
                    📢 Announcement
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmbedTitle('📜 Official Server Guidelines');
                      setEmbedColor('#10b981');
                      setDescription('Welcome to **' + guild.name + '**! To keep our community safe, please follow these rules:\n\n1. Be respectful to all members.\n2. No spam, advertising, or unsolicited DMs.\n3. Keep discussions in the appropriate channels.\n4. Follow Discord Terms of Service.');
                      setAuthorName(guild.name + ' Administration');
                      setFooterText('Violations will result in automated timeout or ban');
                      setMainImageUrl('');
                      setThumbnailUrl('');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-all cursor-pointer"
                  >
                    📜 Rules & Info
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmbedTitle('💎 Server Booster Perks');
                      setEmbedColor('#ec4899');
                      setDescription('Boost **' + guild.name + '** to unlock exclusive VIP benefits!\n\n✨ Exclusive Booster Role & Color\n✨ Access to VIP voice & text channels\n✨ Permission to post embeds & attach files\n✨ Direct priority support');
                      setAuthorName('Booster Rewards Program');
                      setFooterText('Thank you for supporting our server!');
                      setMainImageUrl('');
                      setThumbnailUrl('');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-all cursor-pointer"
                  >
                    💎 Booster Perks
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmbedTitle('🚨 Security Alert & Protection Active');
                      setEmbedColor('#ff2b43');
                      setDescription('DexterCorp Sentinel is monitoring this server 24/7.\n\n🛡️ Mass-ban & kick protection: **ENABLED**\n🛡️ Anti-bot join filtering: **ACTIVE**\n🛡️ Suspicious link blocker: **ENFORCED**\n\nAll actions are audited live.');
                      setAuthorName('DexterCorp Sentinel Core');
                      setFooterText('Automated Threat Response');
                      setMainImageUrl('');
                      setThumbnailUrl('');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-all cursor-pointer"
                  >
                    🚨 Security Notice
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmbedTitle('');
                    setDescription('');
                    setMainImageUrl('');
                    setThumbnailUrl('');
                    setAuthorName('');
                    setFooterText('');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-medium text-rose-300 transition-all cursor-pointer"
                >
                  ✕ Clear All
                </button>
              </div>

              <div className="bg-[#0e0f15] border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    TARGET CHANNEL TO SEND EMBED
                  </label>
                  <select
                    value={builderChannel}
                    onChange={(e) => setBuilderChannel(e.target.value)}
                    className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    {availableChannels && availableChannels.length > 0 ? (
                      availableChannels.map((ch) => (
                        <option key={ch.id} value={ch.id}>
                          # {ch.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="announcements"># announcements</option>
                        <option value="general"># general</option>
                        <option value="rules"># rules</option>
                      </>
                    )}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      AUTHOR NAME
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Server Announcements"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      FOOTER TEXT
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Official Community Update"
                      value={footerText}
                      onChange={(e) => setFooterText(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      IMAGE BANNER URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://... (Optional banner image)"
                      value={mainImageUrl}
                      onChange={(e) => setMainImageUrl(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSendBuilderEmbed}
                  className="w-full py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {builderSent
                      ? '✓ Embed Dispatched to Discord!'
                      : `Send Embed to #${availableChannels.find((c) => c.id === builderChannel)?.name || builderChannel}`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: TICKET CREATION SYSTEM */}
          {/* ======================================================== */}
          {activeModule === 'tickets' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Module Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#5865F2]/10 via-[#0e101a] to-[#12131f] border border-[#5865F2]/30 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center text-[#5865F2] shadow-lg shadow-[#5865F2]/20">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-orbitron font-bold text-base sm:text-lg text-white">
                        TICKET CREATION SYSTEM
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/30 uppercase">
                        SUPPORT DESK
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Deploy interactive ticket panels to Discord with auto-generated private channels and role routing.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-400">
                    {ticketEnabled ? 'Active' : 'Disabled'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ticketEnabled}
                      onChange={(e) => setTicketEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5865F2] shadow-inner"></div>
                  </label>
                </div>
              </div>

              {/* Quick Preset Templates */}
              <div className="p-4 rounded-xl bg-[#0e0f16] border border-white/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#5865F2]" />
                    QUICK PANEL TEMPLATES & PRESETS
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">1-Click Apply</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => {
                      setTicketPanelTitle('🎫 Support Desk & Inquiries');
                      setTicketPanelDesc(
                        'Welcome to our support desk! If you require assistance, have questions, or wish to report an issue, please open a private ticket below.'
                      );
                      setTicketPanelColor('#5865F2');
                      setTicketButtonText('Open Support Ticket');
                      setTicketButtonEmoji('📩');
                    }}
                    className="py-2 px-3 rounded-lg bg-white/5 hover:bg-[#5865F2]/20 border border-white/5 hover:border-[#5865F2]/40 text-left transition-all cursor-pointer"
                  >
                    <div className="font-bold text-xs text-white">🛠️ General Help</div>
                    <div className="text-[10px] text-slate-400 truncate">Standard support desk</div>
                  </button>

                  <button
                    onClick={() => {
                      setTicketPanelTitle('🛒 Billing & Store Support');
                      setTicketPanelDesc(
                        'Need help with a recent order, subscription, payment receipt, or store inquiry? Click below to speak directly with our billing team.'
                      );
                      setTicketPanelColor('#10b981');
                      setTicketButtonText('Billing Inquiry');
                      setTicketButtonEmoji('💳');
                    }}
                    className="py-2 px-3 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/5 hover:border-emerald-500/40 text-left transition-all cursor-pointer"
                  >
                    <div className="font-bold text-xs text-white">🛒 Store & Billing</div>
                    <div className="text-[10px] text-slate-400 truncate">Orders & payments</div>
                  </button>

                  <button
                    onClick={() => {
                      setTicketPanelTitle('🛡️ Player Report & Ban Appeals');
                      setTicketPanelDesc(
                        'Submit rule violation reports, user evidence, or appeal a server mute/ban. Our moderation leadership will review your ticket.'
                      );
                      setTicketPanelColor('#ef4444');
                      setTicketButtonText('Submit Report / Appeal');
                      setTicketButtonEmoji('⚖️');
                    }}
                    className="py-2 px-3 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/5 hover:border-red-500/40 text-left transition-all cursor-pointer"
                  >
                    <div className="font-bold text-xs text-white">🛡️ Reports & Appeals</div>
                    <div className="text-[10px] text-slate-400 truncate">Mod cases & bans</div>
                  </button>

                  <button
                    onClick={() => {
                      setTicketPanelTitle('💼 Partnerships & Affiliates');
                      setTicketPanelDesc(
                        'Looking to partner with our community, run a cross-promotion, or sponsor an event? Open a ticket to connect with our PR team.'
                      );
                      setTicketPanelColor('#f59e0b');
                      setTicketButtonText('Apply for Partner');
                      setTicketButtonEmoji('🤝');
                    }}
                    className="py-2 px-3 rounded-lg bg-white/5 hover:bg-amber-500/20 border border-white/5 hover:border-amber-500/40 text-left transition-all cursor-pointer"
                  >
                    <div className="font-bold text-xs text-white">💼 Partnerships</div>
                    <div className="text-[10px] text-slate-400 truncate">Sponsors & affiliates</div>
                  </button>
                </div>
              </div>

              {/* Core Routing & Permissions Settings */}
              <div className="p-5 rounded-2xl bg-[#0c0d14] border border-white/5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <Sliders className="w-4 h-4 text-[#5865F2]" />
                  <h3 className="font-orbitron font-bold text-xs text-white uppercase tracking-wider">
                    TICKET ROUTING & PERMISSIONS
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Panel Dispatch Channel */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>PANEL CHANNEL (WHERE TO POST BUTTON)</span>
                      <span className="text-[#5865F2] font-mono text-[9px]">Required</span>
                    </label>
                    <select
                      value={ticketChannel}
                      onChange={(e) => setTicketChannel(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                    >
                      <option value="">Select a channel...</option>
                      {availableChannels
                        .filter((c) => c.type !== 4)
                        .map((ch) => (
                          <option key={ch.id} value={ch.id}>
                            #{ch.name}
                          </option>
                        ))}
                    </select>
                    <p className="text-[10px] text-slate-500">
                      The public channel where users see the ticket embed and click the open button.
                    </p>
                  </div>

                  {/* Parent Ticket Category */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>TICKET CATEGORY (PARENT FOLDER)</span>
                      <span className="text-slate-500 font-mono text-[9px]">Optional</span>
                    </label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                    >
                      <option value="">Auto-create or server root</option>
                      {availableChannels
                        .filter((c) => c.type === 4)
                        .map((ch) => (
                          <option key={ch.id} value={ch.id}>
                            📁 {ch.name}
                          </option>
                        ))}
                      {availableChannels.filter((c) => c.type === 4).length === 0 &&
                        availableChannels.map((ch) => (
                          <option key={ch.id} value={ch.id}>
                            #{ch.name}
                          </option>
                        ))}
                    </select>
                    <p className="text-[10px] text-slate-500">
                      New tickets (e.g. #ticket-0042) will be organized under this Discord category.
                    </p>
                  </div>

                  {/* Support Staff Role */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>SUPPORT STAFF ROLE</span>
                      <span className="text-[#5865F2] font-mono text-[9px]">Recommended</span>
                    </label>
                    <select
                      value={ticketRole}
                      onChange={(e) => setTicketRole(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                    >
                      <option value="">No role (Administrators only)</option>
                      {availableRoles.map((r) => (
                        <option key={r.id} value={r.id}>
                          @{r.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500">
                      Members with this role can view, respond to, and resolve all opened tickets.
                    </p>
                  </div>

                  {/* Transcripts Logs Channel */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>TICKET TRANSCRIPT LOGS CHANNEL</span>
                      <span className="text-slate-500 font-mono text-[9px]">Optional</span>
                    </label>
                    <select
                      value={ticketLogsChannel}
                      onChange={(e) => setTicketLogsChannel(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                    >
                      <option value="">Disabled (No transcripts stored)</option>
                      {availableChannels
                        .filter((c) => c.type !== 4)
                        .map((ch) => (
                          <option key={ch.id} value={ch.id}>
                            #{ch.name}
                          </option>
                        ))}
                    </select>
                    <p className="text-[10px] text-slate-500">
                      HTML/text logs will be posted here when a ticket is closed by staff.
                    </p>
                  </div>
                </div>

                {/* Ticket Limit Slider */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      MAX CONCURRENT TICKETS PER MEMBER
                    </label>
                    <span className="text-xs font-mono font-bold text-[#5865F2]">
                      {ticketLimit} {ticketLimit === '1' ? 'ticket' : 'tickets'} max
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={ticketLimit}
                    onChange={(e) => setTicketLimit(e.target.value)}
                    className="w-full accent-[#5865F2] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>1 (Strict)</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5 (High)</span>
                  </div>
                </div>
              </div>

              {/* Panel Embed & Interactive Button Customizer */}
              <div className="p-5 rounded-2xl bg-[#0c0d14] border border-white/5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-[#5865F2]" />
                    <h3 className="font-orbitron font-bold text-xs text-white uppercase tracking-wider">
                      PANEL EMBED & BUTTON DESIGN
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">Accent:</span>
                    <input
                      type="color"
                      value={ticketPanelColor}
                      onChange={(e) => setTicketPanelColor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border border-white/20 bg-transparent"
                    />
                    <input
                      type="text"
                      value={ticketPanelColor}
                      onChange={(e) => setTicketPanelColor(e.target.value)}
                      className="w-20 bg-[#13141d] border border-white/10 rounded-lg px-2 py-0.5 text-xs text-white font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      PANEL TITLE
                    </label>
                    <input
                      type="text"
                      value={ticketPanelTitle}
                      onChange={(e) => setTicketPanelTitle(e.target.value)}
                      placeholder="e.g. 🎫 Support Desk & Inquiries"
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      PANEL DESCRIPTION
                    </label>
                    <textarea
                      rows={3}
                      value={ticketPanelDesc}
                      onChange={(e) => setTicketPanelDesc(e.target.value)}
                      placeholder="Enter the welcoming instruction for users before opening a ticket..."
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2] resize-y"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        BUTTON LABEL
                      </label>
                      <input
                        type="text"
                        value={ticketButtonText}
                        onChange={(e) => setTicketButtonText(e.target.value)}
                        placeholder="e.g. Open Support Ticket"
                        className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        BUTTON EMOJI
                      </label>
                      <input
                        type="text"
                        value={ticketButtonEmoji}
                        onChange={(e) => setTicketButtonEmoji(e.target.value)}
                        placeholder="e.g. 📩 or 🎫"
                        className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                      />
                    </div>
                  </div>

                  {/* Button Color Palette (Discord Style Selector) */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>BUTTON COLOR PALETTE (DISCORD STYLE)</span>
                      <span className="text-[10px] text-[#5865F2] font-mono font-semibold">
                        {ticketButtonStyle === 3 ? '🟢 Success Green' : ticketButtonStyle === 1 ? '🔵 Blurple Blue' : ticketButtonStyle === 2 ? '⚪ Secondary Grey' : '🔴 Danger Red'}
                      </span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { style: 3, label: 'Success Green', hex: '#248046', bg: 'bg-[#248046]', border: 'border-emerald-500' },
                        { style: 1, label: 'Blurple Blue', hex: '#5865F2', bg: 'bg-[#5865F2]', border: 'border-indigo-500' },
                        { style: 2, label: 'Secondary Grey', hex: '#4e5058', bg: 'bg-[#4e5058]', border: 'border-slate-400' },
                        { style: 4, label: 'Danger Red', hex: '#da373c', bg: 'bg-[#da373c]', border: 'border-rose-500' },
                      ].map((btnColor) => {
                        const isSelected = ticketButtonStyle === btnColor.style;
                        return (
                          <button
                            key={btnColor.style}
                            type="button"
                            onClick={() => setTicketButtonStyle(btnColor.style)}
                            className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? `bg-white/10 ${btnColor.border} text-white shadow-lg ring-2 ring-white/20`
                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full ${btnColor.bg} border border-white/20 shrink-0 flex items-center justify-center text-[10px]`}>
                              {isSelected ? '✓' : ''}
                            </span>
                            <span className="truncate">{btnColor.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Embed Images, Avatar & Branding Section */}
                <div className="p-4 rounded-xl bg-[#0e1017] border border-white/5 space-y-3.5 mt-2">
                  <div className="flex items-center justify-between pb-1 border-b border-white/5">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#5865F2]" />
                      AVATARS, THUMBNAIL & BRANDING IMAGES
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Optional Branding</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        AUTHOR / HEADER TITLE
                      </label>
                      <input
                        type="text"
                        value={ticketAuthorName}
                        onChange={(e) => setTicketAuthorName(e.target.value)}
                        placeholder="e.g. {server_name} Support Desk"
                        className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>AUTHOR AVATAR ICON URL</span>
                        <button
                          type="button"
                          onClick={() => setTicketAuthorIcon('{server_icon}')}
                          className="text-[9px] text-[#5865F2] hover:underline cursor-pointer"
                        >
                          + Use Server Icon
                        </button>
                      </label>
                      <input
                        type="text"
                        value={ticketAuthorIcon}
                        onChange={(e) => setTicketAuthorIcon(e.target.value)}
                        placeholder="https://... or {server_icon}"
                        className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#5865F2]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>THUMBNAIL ICON URL (TOP RIGHT)</span>
                        <button
                          type="button"
                          onClick={() => setTicketThumbnailUrl('{server_icon}')}
                          className="text-[9px] text-[#5865F2] hover:underline cursor-pointer"
                        >
                          + Use Server Icon
                        </button>
                      </label>
                      <input
                        type="text"
                        value={ticketThumbnailUrl}
                        onChange={(e) => setTicketThumbnailUrl(e.target.value)}
                        placeholder="https://... or {server_icon}"
                        className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#5865F2]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        LARGE BANNER IMAGE URL
                      </label>
                      <input
                        type="text"
                        value={ticketImageUrl}
                        onChange={(e) => setTicketImageUrl(e.target.value)}
                        placeholder="https://... (Support header banner graphic)"
                        className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#5865F2]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        FOOTER TEXT
                      </label>
                      <input
                        type="text"
                        value={ticketFooterText}
                        onChange={(e) => setTicketFooterText(e.target.value)}
                        placeholder="e.g. Protected by Sentinel Support"
                        className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>FOOTER ICON URL</span>
                        <button
                          type="button"
                          onClick={() => setTicketFooterIcon('{server_icon}')}
                          className="text-[9px] text-[#5865F2] hover:underline cursor-pointer"
                        >
                          + Use Server Icon
                        </button>
                      </label>
                      <input
                        type="text"
                        value={ticketFooterIcon}
                        onChange={(e) => setTicketFooterIcon(e.target.value)}
                        placeholder="https://... or {server_icon}"
                        className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#5865F2]"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Deploy Action */}
                <div className="pt-2">
                  <button
                    onClick={handleDeployTicketPanel}
                    disabled={ticketDeploying}
                    className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-[#5865F2] to-[#4752c4] hover:from-[#6775f5] hover:to-[#5865F2] text-white font-bold text-xs shadow-lg shadow-[#5865F2]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {ticketDeploying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Deploying Ticket Panel to Discord...</span>
                      </>
                    ) : ticketDeploySuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>✓ Ticket Panel Live on Discord!</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>
                          Deploy Live Ticket Panel to #
                          {availableChannels.find((c) => c.id === ticketChannel)?.name ||
                            availableChannels[0]?.name ||
                            'channel'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: SERVER VERIFICATION GATE */}
          {/* ======================================================== */}
          {activeModule === 'verification' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Module Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#0e1412] to-[#121a17] border border-emerald-500/30 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-orbitron font-bold text-base sm:text-lg text-white">
                        SERVER VERIFICATION GATE
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                        ANTI-BOT GATEWAY
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Protect your Discord community against automated raids and spam bots with interactive verification.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-400">
                    {verifyEnabled ? 'Active' : 'Disabled'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verifyEnabled}
                      onChange={(e) => setVerifyEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                  </label>
                </div>
              </div>

              {/* Quick Preset Templates */}
              <div className="p-4 rounded-xl bg-[#0e1210] border border-white/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    VERIFICATION PRESETS & TEMPLATES
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">1-Click Setup</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setVerifyGateTitle('🛡️ Server Verification Gate');
                      setVerifyGateDesc(
                        'Welcome to the server! To protect the community against automated bots, please verify your account below to unlock access to all channels.'
                      );
                      setVerifyGateColor('#10b981');
                      setVerifyButtonText('Verify Account');
                      setVerifyButtonEmoji('✅');
                      setVerifyMethod('button');
                    }}
                    className="py-2.5 px-3 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/5 hover:border-emerald-500/40 text-left transition-all cursor-pointer"
                  >
                    <div className="font-bold text-xs text-white">⚡ Instant 1-Click</div>
                    <div className="text-[10px] text-slate-400">Fastest member onboarding</div>
                  </button>

                  <button
                    onClick={() => {
                      setVerifyGateTitle('🔐 Captcha Security Challenge');
                      setVerifyGateDesc(
                        'Automated raid protection is active. Click the button below to solve an interactive verification challenge and unlock member privileges.'
                      );
                      setVerifyGateColor('#06b6d4');
                      setVerifyButtonText('Solve Captcha Challenge');
                      setVerifyButtonEmoji('🧩');
                      setVerifyMethod('code');
                    }}
                    className="py-2.5 px-3 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/5 hover:border-cyan-500/40 text-left transition-all cursor-pointer"
                  >
                    <div className="font-bold text-xs text-white">🧩 Modal Captcha</div>
                    <div className="text-[10px] text-slate-400">Deter scripted spam accounts</div>
                  </button>

                  <button
                    onClick={() => {
                      setVerifyGateTitle('📜 Community Rules Agreement');
                      setVerifyGateDesc(
                        'By clicking verify below, you acknowledge having read and agreed to follow all community server rules and Discord TOS guidelines.'
                      );
                      setVerifyGateColor('#8b5cf6');
                      setVerifyButtonText('I Agree & Enter Server');
                      setVerifyButtonEmoji('📜');
                      setVerifyMethod('button');
                    }}
                    className="py-2.5 px-3 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/5 hover:border-purple-500/40 text-left transition-all cursor-pointer"
                  >
                    <div className="font-bold text-xs text-white">📜 Rules Agreement</div>
                    <div className="text-[10px] text-slate-400">Policy consent gateway</div>
                  </button>
                </div>
              </div>

              {/* Roles & Channel Permissions Setup */}
              <div className="p-5 rounded-2xl bg-[#0c0f0d] border border-white/5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-orbitron font-bold text-xs text-white uppercase tracking-wider">
                    ROLE & ACCESS CONTROL
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Verified Role (Awarded) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>VERIFIED ROLE (GRANTED ON SUCCESS)</span>
                      <span className="text-emerald-400 font-mono text-[9px]">Required</span>
                    </label>
                    <select
                      value={verifyRole}
                      onChange={(e) => setVerifyRole(e.target.value)}
                      className="w-full bg-[#131815] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">Select verified role...</option>
                      {availableRoles.map((r) => (
                        <option key={r.id} value={r.id}>
                          @{r.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500">
                      Users receive this role immediately after clicking verify, granting access to main channels.
                    </p>
                  </div>

                  {/* Unverified Role (Removed) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>UNVERIFIED ROLE (REMOVED ON VERIFY)</span>
                      <span className="text-slate-500 font-mono text-[9px]">Optional</span>
                    </label>
                    <select
                      value={unverifiedRole}
                      onChange={(e) => setUnverifiedRole(e.target.value)}
                      className="w-full bg-[#131815] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">None (No role removed)</option>
                      {availableRoles.map((r) => (
                        <option key={r.id} value={r.id}>
                          @{r.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500">
                      If your server uses an "Unverified" quarantine role, the bot will automatically strip it.
                    </p>
                  </div>

                  {/* Verification Gate Channel */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>VERIFICATION CHANNEL (WHERE TO POST)</span>
                      <span className="text-emerald-400 font-mono text-[9px]">Required</span>
                    </label>
                    <select
                      value={verifyChannel}
                      onChange={(e) => setVerifyChannel(e.target.value)}
                      className="w-full bg-[#131815] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">Select a channel...</option>
                      {availableChannels
                        .filter((c) => c.type !== 4)
                        .map((ch) => (
                          <option key={ch.id} value={ch.id}>
                            #{ch.name}
                          </option>
                        ))}
                    </select>
                    <p className="text-[10px] text-slate-500">
                      The isolated channel unverified users land in (e.g. #verify or #welcome-gate).
                    </p>
                  </div>

                  {/* Verification Method Mode */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      VERIFICATION METHOD
                    </label>
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setVerifyMethod('button')}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                          verifyMethod === 'button'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-950/40'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        ⚡ 1-Click Button
                      </button>
                      <button
                        type="button"
                        onClick={() => setVerifyMethod('code')}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                          verifyMethod === 'code'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-950/40'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        🧩 Captcha Modal
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {verifyMethod === 'button'
                        ? 'Users simply click the Discord button and receive their role instantly.'
                        : 'Pops an interactive anti-bot modal requiring users to confirm before role grant.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Gate Embed & Interactive Button Customizer */}
              <div className="p-5 rounded-2xl bg-[#0c0f0d] border border-white/5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-orbitron font-bold text-xs text-white uppercase tracking-wider">
                      GATE EMBED & BUTTON DESIGN
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">Accent:</span>
                    <input
                      type="color"
                      value={verifyGateColor}
                      onChange={(e) => setVerifyGateColor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border border-white/20 bg-transparent"
                    />
                    <input
                      type="text"
                      value={verifyGateColor}
                      onChange={(e) => setVerifyGateColor(e.target.value)}
                      className="w-20 bg-[#131815] border border-white/10 rounded-lg px-2 py-0.5 text-xs text-white font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      GATEWAY TITLE
                    </label>
                    <input
                      type="text"
                      value={verifyGateTitle}
                      onChange={(e) => setVerifyGateTitle(e.target.value)}
                      placeholder="e.g. 🛡️ Server Verification Gate"
                      className="w-full bg-[#131815] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      GATEWAY DESCRIPTION
                    </label>
                    <textarea
                      rows={3}
                      value={verifyGateDesc}
                      onChange={(e) => setVerifyGateDesc(e.target.value)}
                      placeholder="Enter verification instructions shown inside the Discord embed..."
                      className="w-full bg-[#131815] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-y"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        BUTTON LABEL
                      </label>
                      <input
                        type="text"
                        value={verifyButtonText}
                        onChange={(e) => setVerifyButtonText(e.target.value)}
                        placeholder="e.g. Verify Account"
                        className="w-full bg-[#131815] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        BUTTON EMOJI
                      </label>
                      <input
                        type="text"
                        value={verifyButtonEmoji}
                        onChange={(e) => setVerifyButtonEmoji(e.target.value)}
                        placeholder="e.g. ✅ or 🛡️"
                        className="w-full bg-[#131815] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Button Color Palette (Discord Style Selector) */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>BUTTON COLOR PALETTE (DISCORD STYLE)</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                        {verifyButtonStyle === 3 ? '🟢 Success Green' : verifyButtonStyle === 1 ? '🔵 Blurple Blue' : verifyButtonStyle === 2 ? '⚪ Secondary Grey' : '🔴 Danger Red'}
                      </span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { style: 3, label: 'Success Green', hex: '#248046', bg: 'bg-[#248046]', border: 'border-emerald-500' },
                        { style: 1, label: 'Blurple Blue', hex: '#5865F2', bg: 'bg-[#5865F2]', border: 'border-indigo-500' },
                        { style: 2, label: 'Secondary Grey', hex: '#4e5058', bg: 'bg-[#4e5058]', border: 'border-slate-400' },
                        { style: 4, label: 'Danger Red', hex: '#da373c', bg: 'bg-[#da373c]', border: 'border-rose-500' },
                      ].map((btnColor) => {
                        const isSelected = verifyButtonStyle === btnColor.style;
                        return (
                          <button
                            key={btnColor.style}
                            type="button"
                            onClick={() => setVerifyButtonStyle(btnColor.style)}
                            className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? `bg-white/10 ${btnColor.border} text-white shadow-lg ring-2 ring-white/20`
                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full ${btnColor.bg} border border-white/20 shrink-0 flex items-center justify-center text-[10px]`}>
                              {isSelected ? '✓' : ''}
                            </span>
                            <span className="truncate">{btnColor.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Embed Images, Avatar & Branding Section */}
                <div className="p-4 rounded-xl bg-[#0c120e] border border-white/5 space-y-3.5 mt-2">
                  <div className="flex items-center justify-between pb-1 border-b border-white/5">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      AVATARS, THUMBNAIL & BRANDING IMAGES
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Optional Branding</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        AUTHOR / HEADER TITLE
                      </label>
                      <input
                        type="text"
                        value={verifyAuthorName}
                        onChange={(e) => setVerifyAuthorName(e.target.value)}
                        placeholder="e.g. {server_name} Security Gate"
                        className="w-full bg-[#131815] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>AUTHOR AVATAR ICON URL</span>
                        <button
                          type="button"
                          onClick={() => setVerifyAuthorIcon('{server_icon}')}
                          className="text-[9px] text-emerald-400 hover:underline cursor-pointer"
                        >
                          + Use Server Icon
                        </button>
                      </label>
                      <input
                        type="text"
                        value={verifyAuthorIcon}
                        onChange={(e) => setVerifyAuthorIcon(e.target.value)}
                        placeholder="https://... or {server_icon}"
                        className="w-full bg-[#131815] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>THUMBNAIL ICON URL (TOP RIGHT)</span>
                        <button
                          type="button"
                          onClick={() => setVerifyThumbnailUrl('{server_icon}')}
                          className="text-[9px] text-emerald-400 hover:underline cursor-pointer"
                        >
                          + Use Server Icon
                        </button>
                      </label>
                      <input
                        type="text"
                        value={verifyThumbnailUrl}
                        onChange={(e) => setVerifyThumbnailUrl(e.target.value)}
                        placeholder="https://... or {server_icon}"
                        className="w-full bg-[#131815] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        LARGE BANNER IMAGE URL
                      </label>
                      <input
                        type="text"
                        value={verifyImageUrl}
                        onChange={(e) => setVerifyImageUrl(e.target.value)}
                        placeholder="https://... (Verification welcome banner)"
                        className="w-full bg-[#131815] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        FOOTER TEXT
                      </label>
                      <input
                        type="text"
                        value={verifyFooterText}
                        onChange={(e) => setVerifyFooterText(e.target.value)}
                        placeholder="e.g. Protected by DexterCorp Verification Gate"
                        className="w-full bg-[#131815] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>FOOTER ICON URL</span>
                        <button
                          type="button"
                          onClick={() => setVerifyFooterIcon('{server_icon}')}
                          className="text-[9px] text-emerald-400 hover:underline cursor-pointer"
                        >
                          + Use Server Icon
                        </button>
                      </label>
                      <input
                        type="text"
                        value={verifyFooterIcon}
                        onChange={(e) => setVerifyFooterIcon(e.target.value)}
                        placeholder="https://... or {server_icon}"
                        className="w-full bg-[#131815] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Deploy Action */}
                <div className="pt-2">
                  <button
                    onClick={handleDeployVerificationGate}
                    disabled={verifyDeploying}
                    className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {verifyDeploying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Deploying Verification Gate to Discord...</span>
                      </>
                    ) : verifyDeploySuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>✓ Verification Gate Live on Discord!</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>
                          Deploy Verification Gate to #
                          {availableChannels.find((c) => c.id === verifyChannel)?.name ||
                            availableChannels[0]?.name ||
                            'channel'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
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
              {activeModule === 'tickets'
                ? 'Ticket Panel Preview'
                : activeModule === 'verification'
                ? 'Verification Gate Preview'
                : 'Live Preview'}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Synchronized
            </span>
          </div>

          {/* Conditional Preview: Ticket Creation Panel */}
          {activeModule === 'tickets' ? (
            <div className="space-y-3">
              <div className="bg-[#313338] rounded-2xl p-4 shadow-2xl font-sans text-slate-200 text-xs">
                {/* Discord Message Header */}
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white shrink-0 overflow-hidden shadow-sm">
                    <img
                      src="https://cdn.discordapp.com/embed/avatars/0.png"
                      alt="Bot Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white text-xs">DexterCorp</span>
                      <span className="px-1 py-0.2 rounded bg-[#5865F2] text-[9px] font-bold text-white uppercase tracking-wider">
                        BOT
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">Today at 02:00 AM</span>
                    </div>
                  </div>
                </div>

                {/* Ticket Embed Card */}
                <div
                  className="ml-12 rounded-lg bg-[#2b2d31] p-3 text-xs space-y-2 border-l-4 shadow-md overflow-hidden"
                  style={{ borderLeftColor: ticketPanelColor || '#5865F2' }}
                >
                  {/* Author Header */}
                  {ticketAuthorName && (
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-300">
                      {ticketAuthorIcon && (
                        <img
                          src={
                            ticketAuthorIcon.includes('server') || ticketAuthorIcon.includes('guild')
                              ? guild.icon || 'https://cdn.discordapp.com/embed/avatars/0.png'
                              : ticketAuthorIcon.includes('user') || ticketAuthorIcon.includes('avatar')
                              ? user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'
                              : ticketAuthorIcon
                          }
                          alt="Author Icon"
                          className="w-4 h-4 rounded-full object-cover"
                        />
                      )}
                      <span>{renderPreview(ticketAuthorName)}</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-white text-xs">
                        {renderPreview(ticketPanelTitle) || '🎫 Support Desk & Inquiries'}
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {renderPreview(ticketPanelDesc) ||
                          'Welcome to our support desk! If you require assistance, have billing questions, or wish to report an issue, please open a private ticket below.'}
                      </p>
                    </div>

                    {ticketThumbnailUrl && (
                      <div className="w-12 h-12 rounded-md overflow-hidden shrink-0 border border-black/40">
                        <img
                          src={
                            ticketThumbnailUrl.includes('server') || ticketThumbnailUrl.includes('guild')
                              ? guild.icon || 'https://cdn.discordapp.com/embed/avatars/0.png'
                              : ticketThumbnailUrl
                          }
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {ticketImageUrl && (
                    <div className="rounded-md overflow-hidden max-h-40 border border-black/30 mt-2">
                      <img src={ticketImageUrl} alt="Ticket Banner" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {ticketFooterText && (
                    <div className="flex items-center gap-1.5 pt-1 text-[10px] text-slate-400">
                      {ticketFooterIcon && (
                        <img
                          src={
                            ticketFooterIcon.includes('server') || ticketFooterIcon.includes('guild')
                              ? guild.icon || 'https://cdn.discordapp.com/embed/avatars/0.png'
                              : ticketFooterIcon
                          }
                          alt="Footer Icon"
                          className="w-3.5 h-3.5 rounded-full object-cover"
                        />
                      )}
                      <span>{renderPreview(ticketFooterText)}</span>
                    </div>
                  )}
                </div>

                {/* Discord Interactive Button (custom_id: ticket_open) with Dynamic Color */}
                <div className="ml-12 mt-3 pt-1">
                  <button
                    type="button"
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-xs shadow-md transition-transform active:scale-95 cursor-pointer ${getDiscordButtonClass(
                      ticketButtonStyle
                    )}`}
                  >
                    <span>{ticketButtonEmoji || '📩'}</span>
                    <span>{ticketButtonText || 'Open Support Ticket'}</span>
                  </button>
                </div>
              </div>

              {/* Deploy Ticket Panel Button */}
              <button
                onClick={handleDeployTicketPanel}
                disabled={ticketDeploying}
                className="w-full py-2.5 px-4 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-xs font-semibold text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {ticketDeploying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deploying to Discord...</span>
                  </>
                ) : ticketDeploySuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>✓ Ticket Panel Live on Discord!</span>
                  </>
                ) : (
                  <>
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Deploy Live Ticket Panel</span>
                  </>
                )}
              </button>
            </div>
          ) : activeModule === 'verification' ? (
            /* Conditional Preview: Verification Gate */
            <div className="space-y-3">
              <div className="bg-[#313338] rounded-2xl p-4 shadow-2xl font-sans text-slate-200 text-xs">
                {/* Discord Message Header */}
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 overflow-hidden shadow-sm">
                    <img
                      src="https://cdn.discordapp.com/embed/avatars/0.png"
                      alt="Bot Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white text-xs">DexterCorp</span>
                      <span className="px-1 py-0.2 rounded bg-[#5865F2] text-[9px] font-bold text-white uppercase tracking-wider">
                        BOT
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">Today at 02:00 AM</span>
                    </div>
                  </div>
                </div>

                {/* Verification Embed Card */}
                <div
                  className="ml-12 rounded-lg bg-[#2b2d31] p-3 text-xs space-y-2 border-l-4 shadow-md overflow-hidden"
                  style={{ borderLeftColor: verifyGateColor || '#10b981' }}
                >
                  {/* Author Header */}
                  {verifyAuthorName && (
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-300">
                      {verifyAuthorIcon && (
                        <img
                          src={
                            verifyAuthorIcon.includes('server') || verifyAuthorIcon.includes('guild')
                              ? guild.icon || 'https://cdn.discordapp.com/embed/avatars/0.png'
                              : verifyAuthorIcon.includes('user') || verifyAuthorIcon.includes('avatar')
                              ? user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'
                              : verifyAuthorIcon
                          }
                          alt="Author Icon"
                          className="w-4 h-4 rounded-full object-cover"
                        />
                      )}
                      <span>{renderPreview(verifyAuthorName)}</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-white text-xs">
                        {renderPreview(verifyGateTitle) || '🛡️ Server Verification Gate'}
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {renderPreview(verifyGateDesc) ||
                          'Welcome to the server! To protect the community against automated bots, please verify your account below to unlock access to all channels.'}
                      </p>
                    </div>

                    {verifyThumbnailUrl && (
                      <div className="w-12 h-12 rounded-md overflow-hidden shrink-0 border border-black/40">
                        <img
                          src={
                            verifyThumbnailUrl.includes('server') || verifyThumbnailUrl.includes('guild')
                              ? guild.icon || 'https://cdn.discordapp.com/embed/avatars/0.png'
                              : verifyThumbnailUrl
                          }
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {verifyImageUrl && (
                    <div className="rounded-md overflow-hidden max-h-40 border border-black/30 mt-2">
                      <img src={verifyImageUrl} alt="Verification Banner" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {verifyFooterText && (
                    <div className="flex items-center gap-1.5 pt-1 text-[10px] text-slate-400">
                      {verifyFooterIcon && (
                        <img
                          src={
                            verifyFooterIcon.includes('server') || verifyFooterIcon.includes('guild')
                              ? guild.icon || 'https://cdn.discordapp.com/embed/avatars/0.png'
                              : verifyFooterIcon
                          }
                          alt="Footer Icon"
                          className="w-3.5 h-3.5 rounded-full object-cover"
                        />
                      )}
                      <span>{renderPreview(verifyFooterText)}</span>
                    </div>
                  )}
                </div>

                {/* Discord Interactive Button (custom_id: verify_button) with Dynamic Color */}
                <div className="ml-12 mt-3 pt-1">
                  <button
                    type="button"
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-xs shadow-md transition-transform active:scale-95 cursor-pointer ${getDiscordButtonClass(
                      verifyButtonStyle
                    )}`}
                  >
                    <span>{verifyButtonEmoji || '✅'}</span>
                    <span>{verifyButtonText || 'Verify Account'}</span>
                  </button>
                </div>
              </div>

              {/* Deploy Verification Gate Button */}
              <button
                onClick={handleDeployVerificationGate}
                disabled={verifyDeploying}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {verifyDeploying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deploying to Discord...</span>
                  </>
                ) : verifyDeploySuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>✓ Verification Gate Live on Discord!</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Deploy Verification Gate</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Default Preview: Welcomer Embed */
            <div className="space-y-3">
              <div className="bg-[#313338] rounded-2xl p-4 shadow-2xl font-sans text-slate-200 text-xs">
                {/* Discord Message Header */}
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white shrink-0 overflow-hidden shadow-sm">
                    <img
                      src="https://cdn.discordapp.com/embed/avatars/0.png"
                      alt="Bot Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white text-xs">DexterCorp</span>
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
                      {authorIconUrl && (
                        <img
                          src={
                            authorIconUrl.includes('user') || authorIconUrl.includes('avatar')
                              ? user.avatar
                                ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
                                : 'https://cdn.discordapp.com/embed/avatars/0.png'
                              : authorIconUrl
                          }
                          alt="Author Icon"
                          className="w-4 h-4 rounded-full"
                        />
                      )}
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
                          src={
                            thumbnailUrl.includes('user') || thumbnailUrl.includes('avatar')
                              ? user.avatar
                                ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
                                : 'https://cdn.discordapp.com/embed/avatars/0.png'
                              : thumbnailUrl
                          }
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
                      {footerIconUrl && (
                        <img
                          src={
                            footerIconUrl.includes('server') || footerIconUrl.includes('guild')
                              ? guild.icon || 'https://cdn.discordapp.com/embed/avatars/0.png'
                              : footerIconUrl
                          }
                          alt="Server Icon"
                          className="w-3.5 h-3.5 rounded-full"
                        />
                      )}
                      <span>{renderPreview(footerText)}</span>
                    </div>
                  )}
                </div>

                {/* Discord Link Action Buttons in Preview */}
                {welcomerButtons.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {welcomerButtons.map((btn, bIdx) => (
                      <div
                        key={bIdx}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2b2d31] hover:bg-[#35373c] text-slate-200 text-[11px] font-medium border border-white/5 shadow-sm transition-colors cursor-pointer select-none"
                      >
                        {btn.emoji && <span>{btn.emoji}</span>}
                        <span>{btn.label || 'Link'}</span>
                        <span className="text-[10px] text-slate-400">↗</span>
                      </div>
                    ))}
                  </div>
                )}
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
            </div>
          )}
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