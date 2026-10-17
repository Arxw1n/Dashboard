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
  Bookmark,
  Download,
  Upload,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Layers,
  LayoutDashboard,
  Eye,
} from 'lucide-react';
import { GuildItem, GuildSettings, UserProfile, CommandItem } from '../types';
import { SyncingLoader } from './SyncingLoader';
import { CommandsTab } from './CommandsTab';

// Helper to render Discord emojis in preview text
const DiscordFormattedText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, lIdx) => {
        const parts = line.split(/(<(?:a)?:[a-zA-Z0-9_]+:\d+>)/g);
        return (
          <div key={lIdx} className="leading-relaxed break-words min-h-[1.2em]">
            {parts.map((part, pIdx) => {
              const emojiMatch = part.match(/<(a)?:([a-zA-Z0-9_]+):(\d+)>/);
              if (emojiMatch) {
                const isAnimated = emojiMatch[1] === 'a';
                const emojiName = emojiMatch[2];
                const emojiId = emojiMatch[3];
                const url = `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}?size=48&quality=lossless`;
                return (
                  <img
                    key={pIdx}
                    src={url}
                    alt={emojiName}
                    title={`:${emojiName}:`}
                    className="inline-block w-4 h-4 align-sub mx-0.5 object-contain"
                  />
                );
              }
              if (part.includes('**')) {
                const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
                return (
                  <span key={pIdx}>
                    {boldParts.map((bp, bpIdx) => {
                      if (bp.startsWith('**') && bp.endsWith('**')) {
                        return (
                          <strong key={bpIdx} className="font-bold text-white">
                            {bp.slice(2, -2)}
                          </strong>
                        );
                      }
                      return bp;
                    })}
                  </span>
                );
              }
              return <span key={pIdx}>{part}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
};

const getEmojiDisplayName = (emojiStr: string): string => {
  if (emojiStr.startsWith('<')) {
    const parts = emojiStr.split(':');
    if (parts.length > 1) {
      const name = parts[1].toLowerCase();
      if (name.includes('arrow')) return 'Red Arrow';
      if (name.includes('verified')) return 'Verified';
      if (name.includes('flame')) return 'Flame';
      if (name.includes('crown')) return 'Fire Crown';
      if (name.includes('admin')) return 'Admin Shield';
      if (name.includes('check')) return 'Red Check';
      return parts[1].replace(/^\d+/, '').slice(0, 10) || 'Custom';
    }
  }
  const unicodeNames: Record<string, string> = {
    '⚡': 'Lightning',
    '🛡️': 'Security',
    '🔥': 'Flame',
    '👑': 'Crown',
    '💎': 'Diamond',
    '🚀': 'Rocket',
    '✨': 'Sparkles',
    '📜': 'Rules',
    '📢': 'Announce',
    '🎫': 'Ticket',
    '🔒': 'Locked',
    '✅': 'Verified',
    '❤️': 'Heart',
    '⭐': 'Star',
    '⚔️': 'Combat',
  };
  return unicodeNames[emojiStr] || 'Emoji';
};

const renderEmojiVisual = (emojiStr: string) => {
  if (!emojiStr) return null;
  const customMatch = emojiStr.match(/<(a)?:([a-zA-Z0-9_]+):(\d+)>/);
  if (customMatch) {
    const isAnimated = customMatch[1] === 'a';
    const emojiName = customMatch[2];
    const emojiId = customMatch[3];
    return (
      <img
        src={`https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}?size=64&quality=lossless`}
        alt={emojiName}
        className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-md group-hover:scale-110 transition-transform"
      />
    );
  }
  return (
    <span className="text-2xl sm:text-3xl filter drop-shadow group-hover:scale-115 transition-transform select-none">
      {emojiStr}
    </span>
  );
};

const renderDiscordEmojiInline = (emojiStr?: string) => {
  if (!emojiStr) return null;
  const customMatch = emojiStr.match(/<(a)?:([a-zA-Z0-9_]+):(\d+)>/);
  if (customMatch) {
    const isAnimated = customMatch[1] === 'a';
    const emojiName = customMatch[2];
    const emojiId = customMatch[3];
    return (
      <img
        src={`https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}?size=48&quality=lossless`}
        alt={emojiName}
        className="w-4 h-4 object-contain inline-block mr-1 align-sub"
      />
    );
  }
  return <span className="mr-1">{emojiStr}</span>;
};

export interface GuildMemberItem {
  id: string;
  username: string;
  displayName: string;
  discriminator?: string;
  avatar: string;
  roles?: string[];
  isBot?: boolean;
  tier?: string;
}

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

  // Sub-tabs for Welcomer (Screenshots 507-511)
  const [welcomerSubTab, setWelcomerSubTab] = useState<'messages' | 'cards' | 'simulation' | 'customizations'>('messages');

  // Sub-tabs for Tickets (Screenshots 515-521)
  const [ticketSubTab, setTicketSubTab] = useState<'overview' | 'config' | 'panel' | 'modals' | 'transcripts' | 'security'>('overview');

  // Dynamic Image Card Canvas state (Screenshots 508-509)
  // Enhanced Live Welcomer Image Studio States
  const [cardTemplate, setCardTemplate] = useState('Crimson Sentinel');
  const [cardOverlayDarkness, setCardOverlayDarkness] = useState(55);
  const [cardBlur, setCardBlur] = useState(0);
  const [cardAvatarShape, setCardAvatarShape] = useState<'squircle' | 'circle' | 'hexagon' | 'octagon'>('squircle');
  const [cardAvatarGlow, setCardAvatarGlow] = useState<'red' | 'emerald' | 'cyan' | 'gold' | 'purple' | 'none'>('red');
  const [cardAvatarBorderColor, setCardAvatarBorderColor] = useState('#ff0033');
  const [cardAvatarBorderWidth, setCardAvatarBorderWidth] = useState(2);
  const [cardFontFamily, setCardFontFamily] = useState<'Outfit' | 'Inter' | 'JetBrains Mono' | 'Cinzel'>('Outfit');
  const [cardWelcomeTitle, setCardWelcomeTitle] = useState('WELCOME, {user}');
  const [cardSubtitle, setCardSubtitle] = useState('You are citizen #{member_count} of {server}');
  const [cardTitleColor, setCardTitleColor] = useState('#ffffff');
  const [cardAccentColor, setCardAccentColor] = useState('#ff3344');
  const [cardShowBadge, setCardShowBadge] = useState(true);
  const [cardShowServerPill, setCardShowServerPill] = useState(true);
  const [cardShowJoinedDate, setCardShowJoinedDate] = useState(true);
  const [cardShowStatusDot, setCardShowStatusDot] = useState(true);
  const [cardEditorActiveTab, setCardEditorActiveTab] = useState<'presets' | 'background' | 'avatar' | 'typography'>('presets');
  const [cardMockUser, setCardMockUser] = useState<'currentUser' | 'axio' | 'kira' | 'specter'>('currentUser');

  // Whitelist Members States
  const [showMemberSelectModal, setShowMemberSelectModal] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [availableMembers, setAvailableMembers] = useState<GuildMemberItem[]>([
    {
      id: user.id || '1500056784000253973',
      username: user.username || 'CurrentAdmin',
      displayName: user.username || 'Guild Administrator',
      avatar: user.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png',
      tier: 'Server Owner',
      roles: ['Owner', 'Administrator'],
      isBot: false,
    },
    {
      id: '1500056784000253973',
      username: 'DexterCorpBot',
      displayName: 'Dexter Corporation Sentinel',
      avatar: '/dc-logo.png',
      tier: 'System Sentinel',
      roles: ['Bot', 'Sentinel Core'],
      isBot: true,
    },
    {
      id: '141279118800092',
      username: 'AxioSecurity',
      displayName: 'Axio (Security Admin)',
      avatar: 'https://cdn.discordapp.com/embed/avatars/1.png',
      tier: 'Security Lead',
      roles: ['Administrator', 'Moderator'],
      isBot: false,
    },
    {
      id: '139981249911223',
      username: 'KiraOps',
      displayName: 'Kira (Operations Lead)',
      avatar: 'https://cdn.discordapp.com/embed/avatars/2.png',
      tier: 'High Council',
      roles: ['Staff Council'],
      isBot: false,
    },
    {
      id: '128892188291021',
      username: 'SpecterVanguard',
      displayName: 'Specter (Moderation Officer)',
      avatar: 'https://cdn.discordapp.com/embed/avatars/3.png',
      tier: 'Moderator',
      roles: ['Senior Mod'],
      isBot: false,
    },
  ]);
  const [cardWidth, setCardWidth] = useState(800);
  const [cardHeight, setCardHeight] = useState(350);
  const [cardScale, setCardScale] = useState(100);
  const [cardBgColor, setCardBgColor] = useState('#0a0c12');
  const [cardBgImage, setCardBgImage] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80');
  const [cardFitMode, setCardFitMode] = useState<'cover' | 'contain'>('cover');
  const [cardOpacity, setCardOpacity] = useState(85);

  // Ghost ping and DM state for Welcomer (Screenshots 507, 511)
  const [ghostPing, setGhostPing] = useState(false);
  const [dmGreetingEnabled, setDmGreetingEnabled] = useState(false);
  const [dmGreetingMessage, setDmGreetingMessage] = useState('Welcome to **{server_name}**, {user}! Read rules to get started.');
  const [antiFloodEnabled, setAntiFloodEnabled] = useState(true);
  const [welcomerCustomWebhookName, setWelcomerCustomWebhookName] = useState('');
  const [welcomerCustomWebhookAvatar, setWelcomerCustomWebhookAvatar] = useState('');

  // Role Bypass state (Screenshots 504-505)
  const [roleBypassToggles, setRoleBypassToggles] = useState<Record<string, boolean>>({
    lock: true,
    lockall: true,
    unlock: true,
    unlockall: true,
    hide: true,
    hideall: true,
    unhide: true,
    unhideall: true,
    ban: true,
    unban: true,
    unbanAll: false,
    kick: true,
    timeout: true,
    untimeout: true,
    warn: true,
    clearWarn: true,
    mute: true,
    unmute: true,
    deafen: true,
    undeafen: true,
    disconnect: true,
    move: true,
  });

  // Moderation tab state (Screenshot 512)
  const [modImmuneRoles, setModImmuneRoles] = useState<string[]>([]);
  const [modUserNotifications, setModUserNotifications] = useState(true);
  const [modPurgePinned, setModPurgePinned] = useState(false);
  const [modIgnoredChannels, setModIgnoredChannels] = useState<string[]>([]);
  const [modWarnThreshold, setModWarnThreshold] = useState('3');
  const [modDefaultTimeout, setModDefaultTimeout] = useState('10m');

  // Automod Ignored / Bypass state (Screenshot 503)
  const [automodIgnoredChannels, setAutomodIgnoredChannels] = useState<string[]>([]);
  const [automodIgnoredRoles, setAutomodIgnoredRoles] = useState<string[]>([]);
  const [automodIgnoredUsers, setAutomodIgnoredUsers] = useState<string[]>([]);
  const [newAutomodUserId, setNewAutomodUserId] = useState('');
  const [automodLogChannel, setAutomodLogChannel] = useState('');

  // Modal Questions for Tickets (Screenshot 518)
  const [modalQ1Label, setModalQ1Label] = useState('Reason for opening this ticket');
  const [modalQ1Placeholder, setModalQ1Placeholder] = useState('Briefly describe your request or issue...');
  const [modalQ1Style, setModalQ1Style] = useState<'short' | 'paragraph'>('paragraph');
  const [modalQ1Required, setModalQ1Required] = useState(true);
  const [modalQ2Label, setModalQ2Label] = useState('Preferred contact / additional notes');
  const [modalQ2Placeholder, setModalQ2Placeholder] = useState('Discord Tag, Order ID or Transaction hash (optional)');
  const [modalQ2Style, setModalQ2Style] = useState<'short' | 'paragraph'>('short');
  const [modalQ2Required, setModalQ2Required] = useState(false);
  const [ticketEnabled, setTicketEnabled] = useState(true);
  const [ticketChannel, setTicketChannel] = useState('');
  const [ticketCategory, setTicketCategory] = useState('');
  const [ticketRole, setTicketRole] = useState('');
  const [ticketLogsChannel, setTicketLogsChannel] = useState('');
  const [ticketChannelStyle, setTicketChannelStyle] = useState('ticket-{code}');
  const [ticketStaffRoles, setTicketStaffRoles] = useState<string[]>([]);
  const [ticketLimit, setTicketLimit] = useState('1');
  const [ticketPanelTitle, setTicketPanelTitle] = useState('🎫 Support Desk & Inquiries');
  const [ticketPanelDesc, setTicketPanelDesc] = useState(
    'Welcome to our support desk! If you require assistance, have billing questions, or wish to report an issue, please open a private ticket below.'
  );
  const [ticketPanelColor, setTicketPanelColor] = useState('#5865F2');
  const [ticketButtonText, setTicketButtonText] = useState('Open Support Ticket');
  const [ticketButtonEmoji, setTicketButtonEmoji] = useState('✉️');
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
  const [verifyGateTitle, setVerifyGateTitle] = useState('🛡️ Server Verification Gate');
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
  const [embedTitle, setEmbedTitle] = useState('🛡️ Welcome to Dexter Corporation ⚡');
  const [embedColor, setEmbedColor] = useState('#ff0033');
  const [description, setDescription] = useState(
    "Hey 👋 {user}!\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n<:2392verified:1554068820828626944> **You are our #{server_membercount}th Member**\n<a:flame:1554068992648290415> **Joined** {user_joined} Â· {user.joined_date}\n\n<a:73288animatedarrowred:1554068830689431563> **Read our ToS** <#rules>\n<a:73288animatedarrowred:1554068830689431563> **Check out our latest Announcements** <#announcements>\n<a:73288animatedarrowred:1554068830689431563> **Need help? Open a Support Ticket** <#tickets>"
  );
  const [authorName, setAuthorName] = useState('DEXTERCORP SECURITY');
  const [authorIconUrl, setAuthorIconUrl] = useState('');
  const [footerText, setFooterText] = useState('Enjoy your stay in {server_name}');
  const [footerIconUrl, setFooterIconUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [mainImageUrl, setMainImageUrl] = useState('https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3dm5ma3lsMTE5MWpxa25xb2x4eTc4NXFhcjlycTVnMXV6eGZjbnlscSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/WW5p7jd8ImZ16q4w2r/giphy.gif');
  const [welcomerButtons, setWelcomerButtons] = useState<Array<{ label: string; url: string; emoji?: string }>>([
    { label: 'Announcements', url: 'https://discord.gg/dextercorp', emoji: '📢' },
    { label: 'ToS', url: 'https://discord.gg/dextercorp', emoji: '📜' },
    { label: 'Support', url: 'https://discord.gg/dextercorp', emoji: '🎫' },
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
  const [idCopied, setIdCopied] = useState(false);
  const [antiMentionPunishment, setAntiMentionPunishment] = useState('timeout');
  const [antiMentionDuration, setAntiMentionDuration] = useState('24');
  const [detectionMode, setDetectionMode] = useState('instant');
  const [recoveryPacing, setRecoveryPacing] = useState('2000');
  const [logChannel, setLogChannel] = useState('');

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

  // 11. Message Sender (formerly Embed Builder) Independent State
  const [senderChannel, setSenderChannel] = useState('announcements');
  const [senderPreMessage, setSenderPreMessage] = useState(
    'Hey, welcome to **Dexter Corporation**! The easiest way to personalize, protect, and dispatch rich interactive messages to your Discord server.'
  );
  const [senderEmbedTitle, setSenderEmbedTitle] = useState('🛡️ Dexter Components V2');
  const [senderEmbedColor, setSenderEmbedColor] = useState('#ff0033');
  const [senderEmbedDesc, setSenderEmbedDesc] = useState(
    '### Welcome to Dexter Corporation\nCustomize your layout with rich text, dividers, custom emojis, and media cards.'
  );
  const [senderAuthorName, setSenderAuthorName] = useState('Dexter Corporation');
  const [senderAuthorIcon, setSenderAuthorIcon] = useState('');
  const [senderFooterText, setSenderFooterText] = useState('DexterCorp Security & Dispatch');
  const [senderFooterIcon, setSenderFooterIcon] = useState('');
  const [senderThumbnailUrl, setSenderThumbnailUrl] = useState('');
  const [senderImageUrl, setSenderImageUrl] = useState('');
  const [senderShowDivider, setSenderShowDivider] = useState(true);
  const [senderSpoiler, setSenderSpoiler] = useState(false);
  const [senderWebhookName, setSenderWebhookName] = useState('');
  const [senderWebhookAvatar, setSenderWebhookAvatar] = useState('');
  const [senderThreadName, setSenderThreadName] = useState('');
  const [showProfileOverride, setShowProfileOverride] = useState(false);
  const [showThreadTargeting, setShowThreadTargeting] = useState(false);
  const [senderButtons, setSenderButtons] = useState<Array<{ id: string; label: string; url: string; emoji?: string }>>([
    { id: '1', label: 'Announcements', url: 'https://discord.gg/dextercorp', emoji: '<a:73288animatedarrowred:1554068830689431563>' },
    { id: '2', label: 'Support', url: 'https://discord.gg/dextercorp', emoji: '<:2392verified:1554068820828626944>' },
  ]);
  const [senderSent, setSenderSent] = useState(false);
  const [senderSending, setSenderSending] = useState(false);

  // Modals & Emojis for Message Sender
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showEmojiModal, setShowEmojiModal] = useState(false);
  const [emojiTargetField, setEmojiTargetField] = useState<'preMessage' | 'title' | 'description'>('preMessage');
  const [savedTemplates, setSavedTemplates] = useState<Array<{ id: string; name: string; data: any }>>(() => {
    try {
      const stored = localStorage.getItem(`dexter_templates_${guild.id}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [newTemplateName, setNewTemplateName] = useState('');
  const [customEmojiInput, setCustomEmojiInput] = useState('');
  const [serverCustomEmojis, setServerCustomEmojis] = useState<string[]>([
    '<a:73288animatedarrowred:1554068830689431563>',
    '<:2392verified:1554068820828626944>',
    '<a:flame:1554068992648290415>',
    '<a:1706redcrownfire:1554068818337468476>',
    '<:86067verified86x:1554068835227930624>',
    '<a:Admin128:1554066211636248597>',
    '<a:736775redcheck:1554068843981439036>',
    '🚀',
    '💎',
    '🛡️',
    '📜',
    '📢',
    '🎫',
    '⚡',
    '👑',
  ]);
  const [emojiToast, setEmojiToast] = useState('');

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
          setSenderChannel((curr) => {
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

      // 2.5 Fetch server members
      try {
        const mRes = await axios.get(BOT_CONFIG.getApiUrl(`/api/guilds/${guild.id}/members`));
        if (Array.isArray(mRes.data) && mRes.data.length > 0) {
          setAvailableMembers((prev) => {
            const existingIds = new Set(mRes.data.map((m: any) => m.id));
            const merged = [...mRes.data, ...prev.filter((p) => !existingIds.has(p.id))];
            return merged;
          });
        }
      } catch (err) {
        console.warn('Members fetch fallback:', err);
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

  // Message Sender: Dispatch Message with Dual Fallback & Loading States
  const handleSendMessageSender = async () => {
    setSenderSending(true);
    setSenderSent(false);

    const payload = {
      channelId: senderChannel,
      content: senderPreMessage,
      embed: {
        title: senderEmbedTitle,
        description: senderEmbedDesc,
        color: senderEmbedColor,
        author: senderAuthorName ? { name: senderAuthorName, icon_url: senderAuthorIcon } : undefined,
        thumbnail: senderThumbnailUrl ? { url: senderThumbnailUrl } : undefined,
        image: senderImageUrl ? { url: senderImageUrl } : undefined,
        footer: senderFooterText ? { text: senderFooterText, icon_url: senderFooterIcon } : undefined,
      },
      buttons: senderButtons,
      webhook: senderWebhookName || senderWebhookAvatar ? {
        name: senderWebhookName,
        avatar_url: senderWebhookAvatar,
      } : undefined,
    };

    try {
      await axios.post(BOT_CONFIG.getApiUrl(`/api/guilds/${guild.id}/embed/send`), payload);
      setSenderSent(true);
    } catch (e) {
      console.warn('Message sender primary error, trying fallback:', e);
      try {
        await axios.post(BOT_CONFIG.getApiUrl(`/api/guilds/${guild.id}/welcome/test`), {
          channelId: senderChannel,
          welcome: {
            content: senderPreMessage,
            buttons: senderButtons,
            embeds: payload.embed,
          },
        });
        setSenderSent(true);
      } catch (err2) {
        console.error('All send fallbacks failed:', err2);
      }
    } finally {
      setSenderSending(false);
      setTimeout(() => setSenderSent(false), 4000);
    }
  };

  // Add Action Button
  const handleAddSenderButton = () => {
    if (senderButtons.length >= 5) return;
    setSenderButtons([
      ...senderButtons,
      {
        id: Date.now().toString(),
        label: 'New Link',
        url: 'https://discord.gg',
        emoji: '🔗',
      },
    ]);
  };

  // Remove Action Button
  const handleRemoveSenderButton = (id: string) => {
    setSenderButtons(senderButtons.filter((b) => b.id !== id));
  };

  // Update Action Button
  const handleUpdateSenderButton = (id: string, field: 'label' | 'url' | 'emoji', val: string) => {
    setSenderButtons(
      senderButtons.map((b) => (b.id === id ? { ...b, [field]: val } : b))
    );
  };

  // Save current design as template
  const handleSaveCurrentTemplate = () => {
    if (!newTemplateName.trim()) return;
    const newTemplate = {
      id: Date.now().toString(),
      name: newTemplateName.trim(),
      data: {
        preMessage: senderPreMessage,
        title: senderEmbedTitle,
        description: senderEmbedDesc,
        color: senderEmbedColor,
        authorName: senderAuthorName,
        authorIcon: senderAuthorIcon,
        footerText: senderFooterText,
        footerIcon: senderFooterIcon,
        thumbnailUrl: senderThumbnailUrl,
        imageUrl: senderImageUrl,
        showDivider: senderShowDivider,
        spoiler: senderSpoiler,
        buttons: senderButtons,
      },
    };
    const updated = [newTemplate, ...savedTemplates];
    setSavedTemplates(updated);
    try {
      localStorage.setItem(`dexter_templates_${guild.id}`, JSON.stringify(updated));
    } catch (err) {
      console.warn('Template save error:', err);
    }
    setNewTemplateName('');
  };

  // Apply saved or preset template
  const handleApplyTemplate = (data: any) => {
    if (!data) return;
    if (data.preMessage !== undefined) setSenderPreMessage(data.preMessage);
    if (data.title !== undefined) setSenderEmbedTitle(data.title);
    if (data.description !== undefined) setSenderEmbedDesc(data.description);
    if (data.color !== undefined) setSenderEmbedColor(data.color);
    if (data.authorName !== undefined) setSenderAuthorName(data.authorName);
    if (data.authorIcon !== undefined) setSenderAuthorIcon(data.authorIcon);
    if (data.footerText !== undefined) setSenderFooterText(data.footerText);
    if (data.footerIcon !== undefined) setSenderFooterIcon(data.footerIcon);
    if (data.thumbnailUrl !== undefined) setSenderThumbnailUrl(data.thumbnailUrl);
    if (data.imageUrl !== undefined) setSenderImageUrl(data.imageUrl);
    if (data.showDivider !== undefined) setSenderShowDivider(data.showDivider);
    if (data.spoiler !== undefined) setSenderSpoiler(data.spoiler);
    if (Array.isArray(data.buttons)) setSenderButtons(data.buttons);
    setShowTemplatesModal(false);
  };

  // Delete saved template
  const handleDeleteTemplate = (id: string) => {
    const updated = savedTemplates.filter((t) => t.id !== id);
    setSavedTemplates(updated);
    try {
      localStorage.setItem(`dexter_templates_${guild.id}`, JSON.stringify(updated));
    } catch (err) {
      console.warn('Template delete error:', err);
    }
  };

  // Apply Obsidian Instant Presets
  const handleApplyPreset = (type: 'rules' | 'announcement' | 'verification' | 'booster') => {
    if (type === 'rules') {
      handleApplyTemplate({
        preMessage: 'Hey @everyone, please make sure to read and agree to our server rules before participating in the community!',
        title: '📜 Official Server Rules & Guidelines',
        description: '### Welcome to ' + guild.name + '\n\n<:2392verified:1554068820828626944> **1. Respect Everyone**\nTreat all members with respect. No harassment, hate speech, or toxicity.\n\n<:2392verified:1554068820828626944> **2. No Spam or Self-Promotion**\nDo not advertise other Discord servers, social media, or paid services in public channels or DMs.\n\n<:2392verified:1554068820828626944> **3. Follow Discord ToS**\nAdhere strictly to Discord\'s Terms of Service and Community Guidelines.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nClick below to verify or accept our terms.',
        color: '#10b981',
        authorName: guild.name + ' Administration',
        authorIcon: '',
        footerText: 'Violations will result in automated timeout or ban',
        footerIcon: '',
        thumbnailUrl: '',
        imageUrl: '',
        showDivider: true,
        spoiler: false,
        buttons: [
          { id: '1', label: 'Accept Rules', url: 'https://discord.gg/dextercorp', emoji: '<a:736775redcheck:1554068843981439036>' },
          { id: '2', label: 'Support Ticket', url: 'https://discord.gg/dextercorp', emoji: '<:2392verified:1554068820828626944>' },
        ],
      });
    } else if (type === 'announcement') {
      handleApplyTemplate({
        preMessage: '📢 @everyone **IMPORTANT COMMUNITY ANNOUNCEMENT** — Major security and bot system upgrades are live!',
        title: '🚨 Important System Announcement & Security Dispatch',
        description: '### DexterCorp V2 Deployment Complete\n\n<a:flame:1554068992648290415> **Sentinel Anti-Nuke** is now active 24/7 across all server shards.\n<a:1706redcrownfire:1554068818337468476> **Verification Gate** updated to prevent malicious automated bot accounts.\n<a:73288animatedarrowred:1554068830689431563> All members are encouraged to check the documentation below.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nStay safe and report any anomalies to our security staff.',
        color: '#ff2b43',
        authorName: 'DexterCorp Sentinel Core',
        authorIcon: '',
        footerText: 'Automated Threat Dispatch Â· Shard #01',
        footerIcon: '',
        thumbnailUrl: '',
        imageUrl: '',
        showDivider: true,
        spoiler: false,
        buttons: [
          { id: '1', label: 'Changelog', url: 'https://discord.gg/dextercorp', emoji: '<a:73288animatedarrowred:1554068830689431563>' },
          { id: '2', label: 'Report Issue', url: 'https://discord.gg/dextercorp', emoji: '<a:Admin128:1554066211636248597>' },
        ],
      });
    } else if (type === 'verification') {
      handleApplyTemplate({
        preMessage: '🛡️ Welcome to **' + guild.name + '**! Complete verification below to gain access to all channels.',
        title: '🔒 Member Security Verification Gate',
        description: '### Human Verification Required\n\nTo protect the server against automated raids, spam bots, and unauthorized accounts, please verify your account.\n\n<:86067verified86x:1554068835227930624> **Instant Verification**\n<a:73288animatedarrowred:1554068830689431563> Click the verification button below to instantly receive the **Verified Member** role.',
        color: '#5865F2',
        authorName: 'DexterCorp Gatekeeper',
        authorIcon: '',
        footerText: 'Dexter Corporation Â· Anti-Raid Active',
        footerIcon: '',
        thumbnailUrl: '',
        imageUrl: '',
        showDivider: true,
        spoiler: false,
        buttons: [
          { id: '1', label: 'Verify Account', url: 'https://discord.gg/dextercorp', emoji: '<:86067verified86x:1554068835227930624>' },
        ],
      });
    } else if (type === 'booster') {
      handleApplyTemplate({
        preMessage: '✨ **BOOST OUR SERVER** and unlock exclusive VIP perks and badges today!',
        title: '💎 VIP Server Booster Perks & Privileges',
        description: '### Exclusive Booster Rewards\n\nSupport **' + guild.name + '** by boosting and get instant access to:\n\n✨ **Custom Pink Booster Role & Colored Name**\n✨ **Access to Secret VIP Voice & Chat Lounges**\n✨ **Permission to attach files, images, and external emojis**\n✨ **Direct priority support in tickets**\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nThank you to all our generous server boosters!',
        color: '#ec4899',
        authorName: 'DexterCorp Booster Rewards',
        authorIcon: '',
        footerText: 'Boost via Discord Nitro to unlock immediately',
        footerIcon: '',
        thumbnailUrl: '',
        imageUrl: '',
        showDivider: true,
        spoiler: false,
        buttons: [
          { id: '1', label: 'Boost Server', url: 'https://discord.gg/dextercorp', emoji: '💎' },
          { id: '2', label: 'Claim Perks', url: 'https://discord.gg/dextercorp', emoji: '✨' },
        ],
      });
    }
  };

  // Export current template as JSON
  const handleExportTemplate = () => {
    const data = {
      guild: guild.name,
      exportedAt: new Date().toISOString(),
      template: {
        preMessage: senderPreMessage,
        title: senderEmbedTitle,
        description: senderEmbedDesc,
        color: senderEmbedColor,
        authorName: senderAuthorName,
        authorIcon: senderAuthorIcon,
        footerText: senderFooterText,
        footerIcon: senderFooterIcon,
        thumbnailUrl: senderThumbnailUrl,
        imageUrl: senderImageUrl,
        showDivider: senderShowDivider,
        spoiler: senderSpoiler,
        buttons: senderButtons,
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dexter_template_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import template from JSON
  const handleImportTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        const t = json.template || json;
        handleApplyTemplate(t);
      } catch (err) {
        console.warn('Import parse error:', err);
      }
    };
    reader.readAsText(file);
  };

  // Add custom emoji to active server list
  const handleAddCustomEmoji = () => {
    if (!customEmojiInput.trim()) return;
    if (serverCustomEmojis.length >= 15) return;
    if (!serverCustomEmojis.includes(customEmojiInput.trim())) {
      setServerCustomEmojis([...serverCustomEmojis, customEmojiInput.trim()]);
    }
    setCustomEmojiInput('');
  };

  // Insert emoji into targeted input and copy to clipboard
  const handleInsertEmoji = (emoji: string) => {
    if (emojiTargetField === 'preMessage') {
      setSenderPreMessage((prev) => (prev ? prev + ' ' + emoji : emoji));
    } else if (emojiTargetField === 'title') {
      setSenderEmbedTitle((prev) => (prev ? prev + ' ' + emoji : emoji));
    } else if (emojiTargetField === 'description') {
      setSenderEmbedDesc((prev) => (prev ? prev + ' ' + emoji : emoji));
    }
    try {
      navigator.clipboard?.writeText(emoji);
    } catch {}
    setEmojiToast(`Inserted & copied ${emoji} to clipboard!`);
    setTimeout(() => setEmojiToast(''), 2500);
  };

  // Clear Message Sender
  const handleClearMessageSender = () => {
    setSenderPreMessage('');
    setSenderEmbedTitle('');
    setSenderEmbedDesc('');
    setSenderAuthorName('');
    setSenderAuthorIcon('');
    setSenderFooterText('');
    setSenderFooterIcon('');
    setSenderThumbnailUrl('');
    setSenderImageUrl('');
    setSenderButtons([]);
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
  const renderPreview = (text?: string | null) => {
    if (!text || typeof text !== 'string') return '';
    const uAvatar = user?.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png';
    const gName = guild?.name || 'Server';
    const gCount = (guild?.memberCount || 420).toString();
    const gIcon = guild?.icon || '';

    return text
      .replace(/(\{user\}|\$user_mention)/gi, '@Axio')
      .replace(/(\{server_name\}|\$guild_name)/gi, gName)
      .replace(/(\{server_membercount\}|\$guild_membercount)/gi, gCount)
      .replace(/(\{user_avatar\}|\$user_iconurl)/gi, uAvatar)
      .replace(/(\{server_icon\}|\$guild_iconurl)/gi, gIcon)
      .replace(/(\{user_joined\}|\$user_joined)/gi, 'just now')
      .replace(/(\{user\.joined_date\}|\{joined_date\})/gi, new Date().toLocaleDateString());
  };

  // Categorized Sidebar Navigation (Obsidian Security Exact Match - Screenshots 500-522)
  const navCategories = [
    {
      title: 'GENERAL',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutGrid },
        { id: 'commands', label: 'Bot Commands', icon: Terminal },
        { id: 'settings', label: 'Settings', icon: Sliders },
      ],
    },
    {
      title: 'SECURITY',
      items: [
        { id: 'antinuke', label: 'Anti-Nuke', icon: ShieldAlert },
        { id: 'automod', label: 'Automod', icon: Bot },
        { id: 'role_bypass', label: 'Role Bypass', icon: ShieldCheck },
        { id: 'noprefix', label: 'Server No-Prefix', icon: Hash },
      ],
    },
    {
      title: 'MODERATION',
      items: [
        { id: 'logging', label: 'Logging', icon: ScrollText },
        { id: 'welcomer', label: 'Welcomer', icon: UserPlus },
        { id: 'moderation', label: 'Moderation', icon: Shield },
        { id: 'autoreact', label: 'Auto-React', icon: Smile },
        { id: 'autoresponder', label: 'Autoresponder', icon: MessageSquare },
        { id: 'tickets', label: 'Tickets', icon: Ticket },
        { id: 'verification', label: 'Verification Gate', icon: Lock },
        { id: 'custom_role', label: 'Custom Role', icon: UserCheck },
        { id: 'autorole', label: 'Autorole', icon: Sparkles },
        { id: 'giveaway', label: 'Giveaway', icon: Gift },
        { id: 'embed_builder', label: 'Message Sender', icon: Send },
      ],
    },
  ];

  const getMemberDetails = (id: string): GuildMemberItem => {
    const found = availableMembers.find((m) => m.id === id);
    if (found) return found;
    if (id === user?.id) {
      return {
        id,
        username: user.username || 'Admin',
        displayName: user.username || 'Guild Administrator',
        avatar: user.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png',
        tier: 'Server Owner',
        roles: ['Administrator'],
        isBot: false,
      };
    }
    if (id === '1500056784000253973') {
      return {
        id,
        username: 'DexterCorpSentinel',
        displayName: 'Dexter Sentinel Core',
        avatar: '/dc-logo.png',
        tier: 'System Sentinel',
        roles: ['Bot', 'Administrator'],
        isBot: true,
      };
    }
    if (id === '141279118800092') {
      return {
        id,
        username: 'AxioSecurity',
        displayName: 'Axio (Security Admin)',
        avatar: 'https://cdn.discordapp.com/embed/avatars/1.png',
        tier: 'Security Lead',
        roles: ['Admin', 'Security'],
        isBot: false,
      };
    }
    return {
      id,
      username: `Member_${id.slice(-4)}`,
      displayName: `Discord User (${id.slice(0, 6)}...)`,
      avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
      tier: 'Trusted Staff',
      roles: ['Staff Member'],
      isBot: false,
    };
  };

  const getMockUserPreview = () => {
    if (cardMockUser === 'axio') {
      return { username: 'AXIO', avatar: 'https://cdn.discordapp.com/embed/avatars/1.png', num: 1428 };
    }
    if (cardMockUser === 'kira') {
      return { username: 'KIRA', avatar: 'https://cdn.discordapp.com/embed/avatars/2.png', num: 1429 };
    }
    if (cardMockUser === 'specter') {
      return { username: 'SPECTER', avatar: 'https://cdn.discordapp.com/embed/avatars/3.png', num: 1430 };
    }
    return {
      username: (user?.username || 'CITIZEN').toUpperCase(),
      avatar: user?.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png',
      num: guild.memberCount || 1431,
    };
  };

  return (
    <div className="min-h-screen bg-[#06070a] text-white flex flex-col font-['Inter'] selection:bg-white/20 selection:text-white relative">
      {/* Background ambient lighting & mesh */}
      <div className="absolute inset-0 bg-mesh pointer-events-none opacity-40"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Top Header Bar */}
      <header className="h-16 border-b border-white/5 bg-[#06070a]/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl liquid-glass hover:bg-white/10 flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer"
            title="Back to Dashboard"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2]" />
          </button>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display font-bold text-lg sm:text-xl tracking-tight text-white">
              Server Console
            </h1>
            <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-2.5 py-0.5 liquid-glass rounded-full">
              {guild.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-xl liquid-glass hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Toggle Theme"
          >
            <Sun className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 rounded-xl border border-white/20 overflow-hidden shadow-sm bg-[#12141c]">
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

      {/* Main 3-Column Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10">
        {/* Left Column: Server Card + Action Buttons + Modules Sidebar */}
        <aside className="w-full lg:w-72 bg-[#06070a]/90 backdrop-blur-xl border-r border-white/5 p-4 flex flex-col space-y-4 shrink-0 overflow-y-auto">
          {/* Active Server Card */}
          <div className="liquid-glass rounded-2xl p-3.5 flex items-center gap-3 shadow-lg hover:scale-[1.01] transition-all">
            <div className="w-11 h-11 rounded-xl bg-white/5 p-0.5 overflow-hidden shrink-0 border border-white/10">
              {guild.icon ? (
                <img
                  src={guild.icon}
                  alt={guild.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-display font-bold text-xs text-white">
                  {guild.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="overflow-hidden flex-1">
              <h3 className="font-display font-bold text-sm text-white truncate">{guild.name}</h3>
              <p className="text-[10px] text-slate-400 font-mono truncate">ID: {guild.id}</p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl liquid-glass hover:bg-white/10 text-white font-semibold text-xs transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setShowAuditLogs(true)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl liquid-glass hover:bg-white/10 text-slate-300 hover:text-white font-semibold text-xs transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-300" />
              <span>Audit Logs</span>
            </button>
          </div>

          {/* Categorized Modules Navigation (Obsidian Hierarchy) */}
          <div className="pt-1 space-y-4">
            {navCategories.map((cat) => (
              <div key={cat.title} className="space-y-1">
                <div className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase px-2.5 py-1">
                  {cat.title}
                </div>
                <div className="space-y-0.5">
                  {cat.items.map((m) => {
                    const Icon = m.icon;
                    const isActive =
                      activeModule === m.id ||
                      (m.id === 'embed_builder' && activeModule === 'message_sender');
                    return (
                      <button
                        key={m.id}
                        onClick={() => handleSelectModule(m.id)}
                        className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer text-left ${
                          isActive
                            ? 'bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {isActive && (
                          <span className="absolute left-0 w-[3px] h-5 bg-white rounded-r-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                        )}
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-white' : 'text-slate-400'
                          }`}
                        />
                        <span className="truncate">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Center Column: Configuration Form (Changes based on activeModule!) */}
        <main className="flex-1 bg-[#06070a] p-6 lg:p-8 overflow-y-auto space-y-6 relative min-h-[500px]">
          {isModuleSyncing ? (
            <SyncingLoader
              fullScreen={false}
              title="SYNCING MODULE"
              subtitle="CONFIGURING DEXTERCORP SHARD DATA"
            />
          ) : (
            <>
              {/* Obsidian Top Breadcrumb & Live System Status (Screenshots 500-522) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5">
                <div className="flex items-center gap-2 text-xs font-mono tracking-wider">
                  <span className="text-slate-400 uppercase font-semibold">
                    {navCategories.find((c) => c.items.some((i) => i.id === activeModule))?.title || 'SECURITY'}
                  </span>
                  <span className="text-slate-500">/</span>
                  <span className="text-white font-bold uppercase tracking-widest">
                    {activeModule === 'role_bypass'
                      ? 'SETTINGS / HIGHER ROLE BYPASS'
                      : activeModule === 'noprefix'
                      ? 'SERVER NO-PREFIX'
                      : activeModule === 'commands'
                      ? 'BOT COMMANDS DIRECTORY'
                      : activeModule.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass text-[11px] font-mono text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Standby</span>
                  </div>
                  <div className="px-3 py-1 rounded-full liquid-glass text-[11px] font-mono text-slate-300 border border-white/10">
                    {activeModule === 'automod'
                      ? '0/10 Filters Enabled'
                      : activeModule === 'logging'
                      ? '0/7 Configured Channels'
                      : activeModule === 'antinuke'
                      ? 'Core Sentinel Active'
                      : activeModule === 'welcomer'
                      ? 'Engine Ready'
                      : activeModule === 'tickets'
                      ? '4 Nodes Online'
                      : activeModule === 'role_bypass'
                      ? '4 Categories Armed'
                      : activeModule === 'moderation'
                      ? '0 Active Cases'
                      : activeModule === 'autoreact'
                      ? '0/10 Rules Limit'
                      : activeModule === 'autoresponder'
                      ? '0/20 Triggers'
                      : 'System Healthy'}
                  </div>
                </div>
              </div>

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
                <div className="space-y-6">
                  {/* 4 Obsidian Welcomer Sub-Tabs (Screenshots 507-511) */}
                  <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
                    {[
                      { id: 'messages', label: 'Messages & Embeds', icon: MessageSquare },
                      { id: 'cards', label: 'Dynamic Image Cards', icon: Layers },
                      { id: 'simulation', label: 'Join Simulation', icon: Zap },
                      { id: 'customizations', label: 'Advanced Customizations', icon: Sliders },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setWelcomerSubTab(tab.id as any)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                          welcomerSubTab === tab.id
                            ? 'bg-white text-black shadow-lg font-bold'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <tab.icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {welcomerSubTab === 'messages' && (
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
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer border ${
                      welcomerEnabled ? 'bg-white border-white' : 'bg-white/10 border-white/10'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-all ${
                        welcomerEnabled ? 'bg-black translate-x-5' : 'bg-white translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowVariablesGuide(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-glass hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
                    <span>Variables Guide</span>
                  </button>

                  <button
                    onClick={handleResetWelcomer}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-glass hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
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
                      setEmbedTitle('🛡️ Welcome to Dexter Corporation ⚡');
                      setEmbedColor('#ff0033');
                      setDescription(
                        "Hey 👋 {user}!\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n<:2392verified:1554068820828626944> **You are our #{server_membercount}th Member**\n<a:flame:1554068992648290415> **Joined** {user_joined} Â· {user.joined_date}\n\n<a:73288animatedarrowred:1554068830689431563> **Read our ToS** <#rules>\n<a:73288animatedarrowred:1554068830689431563> **Check out our latest Announcements** <#announcements>\n<a:73288animatedarrowred:1554068830689431563> **Need help? Open a Support Ticket** <#tickets>"
                      );
                      setMainImageUrl('');
                      setThumbnailUrl('');
                      setAuthorName('DEXTER CORPORATION™');
                      setFooterText('Dexter Corporation • Member #{server_membercount}');
                      setFooterIconUrl('{server_icon}');
                      setContentMessage('Hey {user}, welcome to **Dexter Corporation**!');
                      setWelcomerButtons([
                        { label: 'Announcements', url: 'https://discord.gg/dextercorp', emoji: '📢' },
                        { label: 'ToS', url: 'https://discord.gg/dextercorp', emoji: '📜' },
                        { label: 'Support', url: 'https://discord.gg/dextercorp', emoji: '🎫' },
                      ]);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    🔥 Dexter Corporation Style
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
                    🛡️ Crimson Security
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmbedTitle('✨ Welcome to {server_name} ✨');
                      setEmbedColor('#10b981');
                      setDescription("Hey {user}, welcome! Read the guidelines in rules and get verified to start chatting.");
                      setMainImageUrl('');
                      setThumbnailUrl('');
                      setAuthorName('');
                      setFooterText('Member #{server_membercount}');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-all cursor-pointer"
                  >
                    🌱 Clean Minimal (No Image)
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
                      className="flex-1 bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40 transition-colors cursor-pointer"
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
                      className="w-full sm:w-44 bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-white/40"
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
                    className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40 transition-colors cursor-pointer"
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
                  className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40 transition-colors placeholder:text-slate-600 font-mono"
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
                    className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40 transition-colors font-mono"
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
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40 transition-colors"
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
                        className="flex-1 bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-white/40"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      DESCRIPTION
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">PORTAL EMOJIS:</span>
                      {[
                        { label: 'Red Arrow', tag: '<a:73288animatedarrowred:1554068830689431563>' },
                        { label: 'Verified', tag: '<:2392verified:1554068820828626944>' },
                        { label: 'Shield', tag: '<:86067verified86x:1554068835227930624>' },
                        { label: 'Flame', tag: '<a:flame:1554068992648290415>' },
                        { label: 'Fire Crown', tag: '<a:1706redcrownfire:1554068818337468476>' },
                        { label: 'Admin', tag: '<a:Admin128:1554066211636248597>' },
                      ].map((em, eIdx) => (
                        <button
                          key={eIdx}
                          type="button"
                          onClick={() => setDescription((prev) => prev + (prev.endsWith('\n') || prev.endsWith(' ') ? '' : ' ') + em.tag)}
                          className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[10px] border border-white/10 cursor-pointer transition-colors"
                          title={`Click to insert ${em.tag}`}
                        >
                          + {em.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#13141d] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-white/40 transition-colors resize-none leading-relaxed font-mono"
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
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40 transition-colors"
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
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40 transition-colors"
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
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40 transition-colors"
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
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40 transition-colors"
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
                        className="flex-1 bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40 transition-colors font-mono"
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
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40 transition-colors font-mono"
                    />
                  </div>
                </div>

                  {/* Interactive Action Buttons (Link Buttons) */}
                  <div className="bg-[#13141d]/80 border border-white/5 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <span>INTERACTIVE ACTION BUTTONS (LINK BUTTONS)</span>
                          <span className="text-[10px] text-cyan-400 font-mono">({(welcomerButtons || []).length}/5)</span>
                        </label>
                        <p className="text-[10px] text-slate-500">
                          Direct clickable buttons beneath the welcome message (e.g. Announcements, ToS, Support)
                        </p>
                      </div>
                      {(welcomerButtons || []).length < 5 && (
                        <button
                          type="button"
                          onClick={() => setWelcomerButtons([...(welcomerButtons || []), { label: 'New Link', url: 'https://discord.gg/dextercorp', emoji: '🔗' }])}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold cursor-pointer"
                        >
                          + Add Button
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {(welcomerButtons || []).map((btn, bIdx) => (
                        <div key={bIdx} className="flex flex-col sm:flex-row items-center gap-2 bg-[#0a0b10] p-2.5 rounded-lg border border-white/5">
                          <input
                            type="text"
                            placeholder="Emoji (e.g. 📢)"
                            value={btn?.emoji || ''}
                            onChange={(e) => {
                              const updated = [...(welcomerButtons || [])];
                              if (updated[bIdx]) updated[bIdx].emoji = e.target.value;
                              setWelcomerButtons(updated);
                            }}
                            className="w-full sm:w-20 bg-[#13141d] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white text-center focus:outline-none focus:border-white/40"
                            title="Button Emoji"
                          />
                          <input
                            type="text"
                            placeholder="Button Label (e.g. Announcements)"
                            value={btn?.label || ''}
                            onChange={(e) => {
                              const updated = [...(welcomerButtons || [])];
                              if (updated[bIdx]) updated[bIdx].label = e.target.value;
                              setWelcomerButtons(updated);
                            }}
                            className="w-full sm:w-44 bg-[#13141d] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white/40"
                          />
                          <input
                            type="text"
                            placeholder="Target URL (e.g. https://discord.gg/... or web link)"
                            value={btn?.url || ''}
                            onChange={(e) => {
                              const updated = [...(welcomerButtons || [])];
                              if (updated[bIdx]) updated[bIdx].url = e.target.value;
                              setWelcomerButtons(updated);
                            }}
                            className="w-full flex-1 bg-[#13141d] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/40"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setWelcomerButtons((welcomerButtons || []).filter((_, idx) => idx !== bIdx));
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
                    </>
                  )}

                  {/* SUBTAB 2: Professional Live Welcomer Card Studio */}
                  {welcomerSubTab === 'cards' && (
                    <div className="space-y-6 animate-fade-in-up">
                      {/* Studio Top Control Bar */}
                      <div className="liquid-glass rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-purple-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shadow-lg shadow-red-500/10">
                            <Layers className="w-5 h-5 text-red-400" />
                          </div>
                          <div>
                            <h3 className="font-display font-bold text-base sm:text-lg text-white tracking-tight flex items-center gap-2">
                              <span>Live Welcomer Image Card Studio</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 font-bold uppercase">
                                Real-Time Vector
                              </span>
                            </h3>
                            <p className="text-xs text-slate-400">
                              Craft ultra-premium, dynamic Discord arrival cards with live vector preview, custom frames, and atmospheric lighting.
                            </p>
                          </div>
                        </div>

                        {/* Simulation User Switcher */}
                        <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 text-xs">
                          <span className="text-[10px] text-slate-400 font-mono uppercase px-2 font-semibold">PREVIEW AS:</span>
                          {(['currentUser', 'axio', 'kira', 'specter'] as const).map((mockKey) => (
                            <button
                              key={mockKey}
                              type="button"
                              onClick={() => setCardMockUser(mockKey)}
                              className={`px-2.5 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                                cardMockUser === mockKey
                                  ? 'bg-white text-black shadow-md font-bold'
                                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              {mockKey === 'currentUser' ? 'You' : mockKey.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* LIVE INTERACTIVE CANVAS DISPLAY */}
                      <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4 shadow-2xl relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                            </span>
                            <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
                              LIVE CARD RENDER PREVIEW ({cardWidth}px × {cardHeight}px)
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-mono">
                            <span className="text-slate-400">Active Theme:</span>
                            <span className="text-white font-bold px-2 py-0.5 rounded bg-white/10 border border-white/15">
                              {cardTemplate}
                            </span>
                          </div>
                        </div>

                        {/* Visual Card Canvas Preview Box */}
                        <div className="w-full flex justify-center py-6 bg-black/60 rounded-3xl border border-white/5 overflow-hidden p-2">
                          {(() => {
                            const mock = getMockUserPreview();
                            const titleFormatted = cardWelcomeTitle
                              .replace('{user}', mock.username)
                              .replace('{server}', guild.name)
                              .replace('{member_count}', String(mock.num));
                            const subtitleFormatted = cardSubtitle
                              .replace('{user}', mock.username)
                              .replace('{server}', guild.name)
                              .replace('{member_count}', String(mock.num));

                            // Glow effect class mapping
                            const glowStyles: Record<string, string> = {
                              red: 'shadow-[0_0_35px_rgba(255,0,51,0.6)] ring-2 ring-red-500/80',
                              emerald: 'shadow-[0_0_35px_rgba(16,185,129,0.6)] ring-2 ring-emerald-400/80',
                              cyan: 'shadow-[0_0_35px_rgba(6,182,212,0.6)] ring-2 ring-cyan-400/80',
                              gold: 'shadow-[0_0_35px_rgba(245,158,11,0.6)] ring-2 ring-amber-400/80',
                              purple: 'shadow-[0_0_35px_rgba(168,85,247,0.6)] ring-2 ring-purple-500/80',
                              none: 'ring-1 ring-white/20',
                            };

                            // Shape class mapping
                            const shapeStyles: Record<string, string> = {
                              circle: 'rounded-full',
                              squircle: 'rounded-3xl',
                              hexagon: 'rounded-2xl rotate-3',
                              octagon: 'rounded-xl',
                            };

                            return (
                              <div
                                style={{
                                  backgroundColor: cardBgColor,
                                  backgroundImage: cardBgImage ? `url(${cardBgImage})` : 'none',
                                  backgroundSize: cardFitMode,
                                  backgroundPosition: 'center',
                                  fontFamily: cardFontFamily,
                                }}
                                className="relative w-full max-w-[700px] min-h-[290px] rounded-3xl border border-white/20 p-7 flex flex-col justify-between shadow-2xl overflow-hidden transition-all duration-300"
                              >
                                {/* Atmospheric Overlay */}
                                <div
                                  className="absolute inset-0 pointer-events-none transition-all duration-300"
                                  style={{
                                    backgroundColor: `rgba(0,0,0,${cardOverlayDarkness / 100})`,
                                    backdropFilter: cardBlur > 0 ? `blur(${cardBlur}px)` : 'none',
                                  }}
                                />

                                {/* Ambient Red Glow Spot */}
                                <div className="absolute -top-12 -right-12 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
                                <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

                                {/* Card Header Row */}
                                <div className="relative z-10 flex items-center justify-between gap-2">
                                  {cardShowServerPill ? (
                                    <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/70 border border-white/15 text-xs text-slate-200 font-mono shadow-md backdrop-blur-md">
                                      <div className="w-4 h-4 rounded-full overflow-hidden bg-[#12141c]">
                                        <img src="/dc-logo.png" alt="Icon" className="w-full h-full object-cover" />
                                      </div>
                                      <span className="font-bold tracking-wider uppercase text-[11px] text-white">
                                        {guild.name}
                                      </span>
                                    </div>
                                  ) : <div />}

                                  {cardShowBadge && (
                                    <div
                                      style={{ borderColor: cardAccentColor }}
                                      className="px-3.5 py-1 rounded-full bg-black/70 border text-xs font-mono font-bold tracking-widest shadow-md backdrop-blur-md"
                                    >
                                      <span style={{ color: cardAccentColor }}>
                                        CITIZEN #{mock.num}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Card Center Row (Avatar + Headline) */}
                                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 my-auto py-2">
                                  {/* Dynamic Avatar Container */}
                                  <div className="relative shrink-0">
                                    <div
                                      className={`w-24 h-24 p-1 overflow-hidden transition-all duration-300 bg-[#0e1017] flex items-center justify-center ${shapeStyles[cardAvatarShape]} ${glowStyles[cardAvatarGlow]}`}
                                      style={{
                                        borderWidth: `${cardAvatarBorderWidth}px`,
                                        borderColor: cardAvatarBorderColor,
                                      }}
                                    >
                                      <img
                                        src={mock.avatar}
                                        alt={mock.username}
                                        className={`w-full h-full object-cover ${shapeStyles[cardAvatarShape]}`}
                                      />
                                    </div>
                                    {cardShowStatusDot && (
                                      <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-3 border-black shadow-lg" />
                                    )}
                                  </div>

                                  {/* Dynamic Titles */}
                                  <div className="space-y-1.5 text-center sm:text-left">
                                    <h3
                                      style={{ color: cardTitleColor }}
                                      className="font-extrabold text-2xl sm:text-3xl tracking-tight leading-none drop-shadow-lg"
                                    >
                                      {titleFormatted}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-300 font-medium drop-shadow leading-relaxed">
                                      {subtitleFormatted}
                                    </p>
                                    <div className="pt-1 flex items-center justify-center sm:justify-start gap-2 text-[10px] font-mono text-slate-400">
                                      <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10 text-white font-semibold">
                                        VERIFIED CITIZEN
                                      </span>
                                      <span>&bull;</span>
                                      <span>ACCESS GRANTED</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Card Footer Row */}
                                <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-white/10">
                                  {cardShowJoinedDate ? (
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                      JOINED {new Date().toLocaleDateString()}
                                    </span>
                                  ) : <span />}
                                  <span className="text-white/80 font-bold tracking-wider">
                                    DEXTER CORPORATION &bull; SENTINEL CORE
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Quick Canvas Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/5">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setMainImageUrl(cardBgImage);
                                alert('Card background applied to main Welcomer embed image!');
                              }}
                              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold text-xs transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Apply to Welcomer Embed</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleSendTestMessage}
                              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all cursor-pointer border border-white/15 flex items-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Send Live Test Card</span>
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setCardTemplate('Crimson Sentinel');
                              setCardBgColor('#08090e');
                              setCardBgImage('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80');
                              setCardOverlayDarkness(55);
                              setCardAvatarShape('squircle');
                              setCardAvatarGlow('red');
                              setCardAvatarBorderColor('#ff0033');
                              setCardAvatarBorderWidth(2);
                              setCardFontFamily('Outfit');
                              setCardWelcomeTitle('WELCOME, {user}');
                              setCardSubtitle('You are citizen #{member_count} of {server}');
                              setCardAccentColor('#ff3344');
                            }}
                            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset Studio Defaults</span>
                          </button>
                        </div>
                      </div>

                      {/* STUDIO CONTROLS ACCORDION / TABS */}
                      <div className="liquid-glass rounded-3xl p-6 sm:p-7 border border-white/10 space-y-6 shadow-2xl">
                        {/* Control Category Tabs */}
                        <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
                          {[
                            { id: 'presets', label: '1. Curated Themes & Presets', icon: Sparkles },
                            { id: 'background', label: '2. Background & Atmosphere', icon: Image },
                            { id: 'avatar', label: '3. Avatar & Glow Styling', icon: Shield },
                            { id: 'typography', label: '4. Live Typography & Pills', icon: MessageSquare },
                          ].map((ctab) => (
                            <button
                              key={ctab.id}
                              type="button"
                              onClick={() => setCardEditorActiveTab(ctab.id as any)}
                              className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                                cardEditorActiveTab === ctab.id
                                  ? 'bg-white text-black shadow-lg font-bold'
                                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <ctab.icon className="w-3.5 h-3.5" />
                              <span>{ctab.label}</span>
                            </button>
                          ))}
                        </div>

                        {/* TAB 1: CURATED THEMES */}
                        {cardEditorActiveTab === 'presets' && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                                1-Click Master Presets
                              </span>
                              <span className="text-[10px] text-slate-400">Instantly loads colors, glows, backgrounds & fonts</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                              {[
                                {
                                  name: 'Crimson Sentinel',
                                  desc: 'Brushed metal with crimson energy sparks',
                                  bg: '#08090e',
                                  img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
                                  glow: 'red',
                                  accent: '#ff0033',
                                  shape: 'squircle',
                                  font: 'Outfit',
                                },
                                {
                                  name: 'Cyberpunk Neon',
                                  desc: 'Synthwave violet with electric cyan rays',
                                  bg: '#090a16',
                                  img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
                                  glow: 'cyan',
                                  accent: '#00f0ff',
                                  shape: 'hexagon',
                                  font: 'JetBrains Mono',
                                },
                                {
                                  name: 'Obsidian Void',
                                  desc: 'Deep carbon fiber with crisp white contrast',
                                  bg: '#000000',
                                  img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
                                  glow: 'none',
                                  accent: '#ffffff',
                                  shape: 'circle',
                                  font: 'Inter',
                                },
                                {
                                  name: 'Emerald Matrix',
                                  desc: 'Sub-millisecond green defense shield',
                                  bg: '#040d08',
                                  img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
                                  glow: 'emerald',
                                  accent: '#10b981',
                                  shape: 'octagon',
                                  font: 'JetBrains Mono',
                                },
                                {
                                  name: 'Midnight Aurora',
                                  desc: 'Deep space cosmic aurora with violet mist',
                                  bg: '#0d0f1a',
                                  img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
                                  glow: 'purple',
                                  accent: '#a855f7',
                                  shape: 'squircle',
                                  font: 'Outfit',
                                },
                                {
                                  name: 'Royal Gold',
                                  desc: 'VIP prestige dark gold with luxury borders',
                                  bg: '#0a0907',
                                  img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
                                  glow: 'gold',
                                  accent: '#f59e0b',
                                  shape: 'squircle',
                                  font: 'Cinzel',
                                },
                              ].map((preset) => (
                                <button
                                  key={preset.name}
                                  type="button"
                                  onClick={() => {
                                    setCardTemplate(preset.name);
                                    setCardBgColor(preset.bg);
                                    setCardBgImage(preset.img);
                                    setCardAvatarGlow(preset.glow as any);
                                    setCardAccentColor(preset.accent);
                                    setCardAvatarBorderColor(preset.accent);
                                    setCardAvatarShape(preset.shape as any);
                                    setCardFontFamily(preset.font as any);
                                  }}
                                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden group hover:scale-[1.02] ${
                                    cardTemplate === preset.name
                                      ? 'bg-white text-black border-white shadow-xl'
                                      : 'bg-white/[0.03] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08]'
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="font-display font-bold text-sm tracking-tight">
                                        {preset.name}
                                      </span>
                                      <span
                                        className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                                        style={{ backgroundColor: preset.accent }}
                                      />
                                    </div>
                                    <p className={`text-xs mt-1 leading-relaxed ${cardTemplate === preset.name ? 'text-slate-600' : 'text-slate-400'}`}>
                                      {preset.desc}
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] font-mono opacity-80 pt-1 border-t border-black/10">
                                    <span>Glow: {preset.glow.toUpperCase()}</span>
                                    <span>Shape: {preset.shape.toUpperCase()}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* TAB 2: BACKGROUND & ATMOSPHERE */}
                        {cardEditorActiveTab === 'background' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  CUSTOM BACKGROUND IMAGE URL
                                </label>
                                <input
                                  type="text"
                                  placeholder="https://images.unsplash.com/..."
                                  value={cardBgImage}
                                  onChange={(e) => setCardBgImage(e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500/50 transition-colors"
                                />
                                <p className="text-[10px] text-slate-500">
                                  Supports high-resolution PNG, JPG, or WebP links (1200x500 recommended)
                                </p>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  CANVAS BASE COLOR
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={cardBgColor}
                                    onChange={(e) => setCardBgColor(e.target.value)}
                                    className="w-10 h-10 rounded-xl bg-transparent border border-white/20 cursor-pointer"
                                  />
                                  <input
                                    type="text"
                                    value={cardBgColor}
                                    onChange={(e) => setCardBgColor(e.target.value)}
                                    className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  IMAGE FIT MODE
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setCardFitMode('cover')}
                                    className={`py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                                      cardFitMode === 'cover'
                                        ? 'bg-white text-black shadow-md'
                                        : 'bg-white/5 text-slate-300 hover:text-white'
                                    }`}
                                  >
                                    Cover (Full Bleed)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setCardFitMode('contain')}
                                    className={`py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                                      cardFitMode === 'contain'
                                        ? 'bg-white text-black shadow-md'
                                        : 'bg-white/5 text-slate-300 hover:text-white'
                                    }`}
                                  >
                                    Contain (Padded)
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-semibold text-slate-300">Dark Overlay Opacity</span>
                                  <span className="font-mono text-white font-bold">{cardOverlayDarkness}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="90"
                                  value={cardOverlayDarkness}
                                  onChange={(e) => setCardOverlayDarkness(Number(e.target.value))}
                                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                                />
                                <p className="text-[10px] text-slate-500 font-mono">
                                  Controls shadow depth behind text for maximum readability.
                                </p>
                              </div>

                              <div className="space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-semibold text-slate-300">Background Backdrop Blur</span>
                                  <span className="font-mono text-white font-bold">{cardBlur}px</span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="16"
                                  value={cardBlur}
                                  onChange={(e) => setCardBlur(Number(e.target.value))}
                                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                                />
                                <p className="text-[10px] text-slate-500 font-mono">
                                  Smooth glassmorphic blur softens complex background images.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* TAB 3: AVATAR & GLOW STYLING */}
                        {cardEditorActiveTab === 'avatar' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  AVATAR FRAME SHAPE
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {(['squircle', 'circle', 'hexagon', 'octagon'] as const).map((shape) => (
                                    <button
                                      key={shape}
                                      type="button"
                                      onClick={() => setCardAvatarShape(shape)}
                                      className={`py-2.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                                        cardAvatarShape === shape
                                          ? 'bg-white text-black shadow-lg font-bold'
                                          : 'bg-white/5 text-slate-300 hover:text-white'
                                      }`}
                                    >
                                      {shape}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  AVATAR GLOW AURA (ENERGY SHIELD)
                                </label>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                  {[
                                    { id: 'red', label: 'Crimson', color: '#ff0033' },
                                    { id: 'emerald', label: 'Emerald', color: '#10b981' },
                                    { id: 'cyan', label: 'Cyan', color: '#06b6d4' },
                                    { id: 'gold', label: 'Gold', color: '#f59e0b' },
                                    { id: 'purple', label: 'Violet', color: '#a855f7' },
                                    { id: 'none', label: 'Off', color: '#64748b' },
                                  ].map((glow) => (
                                    <button
                                      key={glow.id}
                                      type="button"
                                      onClick={() => setCardAvatarGlow(glow.id as any)}
                                      className={`py-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                                        cardAvatarGlow === glow.id
                                          ? 'bg-white text-black shadow-lg font-bold'
                                          : 'bg-white/5 text-slate-300 hover:text-white'
                                      }`}
                                    >
                                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: glow.color }} />
                                      <span className="text-[10px]">{glow.label}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  AVATAR BORDER COLOR
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={cardAvatarBorderColor}
                                    onChange={(e) => setCardAvatarBorderColor(e.target.value)}
                                    className="w-10 h-10 rounded-xl bg-transparent border border-white/20 cursor-pointer"
                                  />
                                  <input
                                    type="text"
                                    value={cardAvatarBorderColor}
                                    onChange={(e) => setCardAvatarBorderColor(e.target.value)}
                                    className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-semibold text-slate-300">Border Ring Width</span>
                                  <span className="font-mono text-white font-bold">{cardAvatarBorderWidth}px</span>
                                </div>
                                <input
                                  type="range"
                                  min="1"
                                  max="6"
                                  value={cardAvatarBorderWidth}
                                  onChange={(e) => setCardAvatarBorderWidth(Number(e.target.value))}
                                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                                />
                              </div>

                              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                                <span className="text-xs font-semibold text-white">Online Presence Status Dot</span>
                                <button
                                  type="button"
                                  onClick={() => setCardShowStatusDot(!cardShowStatusDot)}
                                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer border ${
                                    cardShowStatusDot ? 'bg-white border-white' : 'bg-white/10 border-white/10'
                                  }`}
                                >
                                  <span
                                    className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full transition-all ${
                                      cardShowStatusDot ? 'bg-black translate-x-5' : 'bg-white translate-x-0'
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* TAB 4: LIVE TYPOGRAPHY & PILLS */}
                        {cardEditorActiveTab === 'typography' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  HEADLINE TEMPLATE (TITLE)
                                </label>
                                <input
                                  type="text"
                                  value={cardWelcomeTitle}
                                  onChange={(e) => setCardWelcomeTitle(e.target.value)}
                                  placeholder="e.g. WELCOME, {user}"
                                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/50 transition-colors"
                                />
                                <p className="text-[10px] text-slate-500 font-mono">
                                  Available: {'{user}'}, {'{server}'}, {'{member_count}'}
                                </p>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  SUBTITLE TEMPLATE
                                </label>
                                <input
                                  type="text"
                                  value={cardSubtitle}
                                  onChange={(e) => setCardSubtitle(e.target.value)}
                                  placeholder="e.g. You are citizen #{member_count} of {server}"
                                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/50 transition-colors"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  CARD FONT FAMILY
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {(['Outfit', 'Inter', 'JetBrains Mono', 'Cinzel'] as const).map((font) => (
                                    <button
                                      key={font}
                                      type="button"
                                      onClick={() => setCardFontFamily(font)}
                                      className={`py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                        cardFontFamily === font
                                          ? 'bg-white text-black shadow-lg font-bold'
                                          : 'bg-white/5 text-slate-300 hover:text-white'
                                      }`}
                                    >
                                      {font.split(' ')[0]}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  ACCENT BADGE COLOR
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={cardAccentColor}
                                    onChange={(e) => setCardAccentColor(e.target.value)}
                                    className="w-10 h-10 rounded-xl bg-transparent border border-white/20 cursor-pointer"
                                  />
                                  <input
                                    type="text"
                                    value={cardAccentColor}
                                    onChange={(e) => setCardAccentColor(e.target.value)}
                                    className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2 pt-2">
                                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                                  <span className="text-xs font-semibold text-white">Show Server Name Pill</span>
                                  <button
                                    type="button"
                                    onClick={() => setCardShowServerPill(!cardShowServerPill)}
                                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer border ${
                                      cardShowServerPill ? 'bg-white border-white' : 'bg-white/10 border-white/10'
                                    }`}
                                  >
                                    <span
                                      className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full transition-all ${
                                        cardShowServerPill ? 'bg-black translate-x-5' : 'bg-white translate-x-0'
                                      }`}
                                    />
                                  </button>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                                  <span className="text-xs font-semibold text-white">Show Citizen # Badge</span>
                                  <button
                                    type="button"
                                    onClick={() => setCardShowBadge(!cardShowBadge)}
                                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer border ${
                                      cardShowBadge ? 'bg-white border-white' : 'bg-white/10 border-white/10'
                                    }`}
                                  >
                                    <span
                                      className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full transition-all ${
                                        cardShowBadge ? 'bg-black translate-x-5' : 'bg-white translate-x-0'
                                      }`}
                                    />
                                  </button>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                                  <span className="text-xs font-semibold text-white">Show Joined Date Timestamp</span>
                                  <button
                                    type="button"
                                    onClick={() => setCardShowJoinedDate(!cardShowJoinedDate)}
                                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer border ${
                                      cardShowJoinedDate ? 'bg-white border-white' : 'bg-white/10 border-white/10'
                                    }`}
                                  >
                                    <span
                                      className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full transition-all ${
                                        cardShowJoinedDate ? 'bg-black translate-x-5' : 'bg-white translate-x-0'
                                      }`}
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 3: Join Simulation (Screenshot 510) */}
                  {welcomerSubTab === 'simulation' && (
                    <div className="space-y-6">
                      <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-display font-bold text-base text-white">
                              Live Join Event Simulator
                            </h3>
                            <p className="text-xs text-slate-400">
                              Replicate new member arrivals to test messages, embed cards, auto-roles, and notifications.
                            </p>
                          </div>
                          <button
                            onClick={handleSendTestMessage}
                            className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer shadow-lg active:scale-95"
                          >
                            Dispatch Test to Discord
                          </button>
                        </div>

                        {/* Interactive Sandbox Steps */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                          {[
                            { step: '01', title: 'Member Joins', desc: 'Trigger guildMemberAdd payload' },
                            { step: '02', title: 'Greeting Dispatched', desc: `Target: #${targetChannel || 'welcome'}` },
                            { step: '03', title: 'Dynamic Card Rendered', desc: `${cardTemplate} Canvas 800x350` },
                            { step: '04', title: 'Auto-Roles Granted', desc: 'Assigned: Members, Citizen' },
                          ].map((st) => (
                            <div key={st.step} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                              <span className="text-[10px] font-mono font-bold text-slate-400">{st.step}</span>
                              <h4 className="text-xs font-bold text-white">{st.title}</h4>
                              <p className="text-[11px] text-slate-400">{st.desc}</p>
                            </div>
                          ))}
                        </div>

                        {/* Simulated Channel Preview */}
                        <div className="bg-[#313338] rounded-2xl p-4 text-xs font-sans text-slate-200 space-y-2 mt-4">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                            SIMULATED DISCORD OUTPUT (#{targetChannel || 'welcome'})
                          </span>
                          <div className="flex items-start gap-3 pt-2">
                            <div className="w-9 h-9 rounded-full bg-[#5865F2] overflow-hidden shrink-0">
                              <img src="https://cdn.discordapp.com/embed/avatars/0.png" alt="Bot" className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-white">DexterCorp</span>
                                <span className="px-1 py-0.2 rounded bg-[#5865F2] text-[9px] font-bold text-white">BOT</span>
                                <span className="text-[10px] text-slate-400 ml-1">Simulated Just Now</span>
                              </div>
                              <p className="text-slate-200">{renderPreview(contentMessage)}</p>
                              {embedTitle && (
                                <div className="mt-2 p-3 rounded-lg bg-[#2b2d31] border-l-4 space-y-1" style={{ borderLeftColor: embedColor }}>
                                  <h4 className="font-bold text-white">{renderPreview(embedTitle)}</h4>
                                  <p className="text-[11px] text-slate-300 whitespace-pre-wrap">{renderPreview(description)}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 4: Advanced Customizations (Screenshot 511) */}
                  {welcomerSubTab === 'customizations' && (
                    <div className="space-y-6">
                      {/* Placeholder Tag-Cloud */}
                      <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-4">
                        <div>
                          <h3 className="font-display font-bold text-base text-white">
                            Interactive Dynamic Variables
                          </h3>
                          <p className="text-xs text-slate-400">
                            Click any tag to copy it to your clipboard for use in welcome content or embeds.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            '{user}',
                            '{user_name}',
                            '{user_display}',
                            '{user_id}',
                            '{user_mention}',
                            '{server_name}',
                            '{server_id}',
                            '{member_count}',
                            '{server_membercount}',
                            '{user_created:at}',
                            '{user_joined:at}',
                            '{server_icon}',
                            '{user_avatar}',
                          ].map((tag) => (
                            <button
                              key={tag}
                              onClick={() => {
                                navigator.clipboard.writeText(tag);
                                alert(`Copied ${tag} to clipboard!`);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-white transition-all cursor-pointer hover:border-white/30"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Direct Message Greeting */}
                      <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-display font-bold text-sm text-white">
                              Direct Message (DM) Greetings
                            </h3>
                            <p className="text-xs text-slate-400">
                              Send a private welcoming message straight into the member's Discord direct messages upon joining.
                            </p>
                          </div>
                          <button
                            onClick={() => setDmGreetingEnabled(!dmGreetingEnabled)}
                            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer border ${
                              dmGreetingEnabled ? 'bg-white border-white' : 'bg-white/10 border-white/10'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-all ${
                                dmGreetingEnabled ? 'bg-black translate-x-5' : 'bg-white translate-x-0'
                              }`}
                            />
                          </button>
                        </div>

                        {dmGreetingEnabled && (
                          <div className="space-y-2 pt-2">
                            <label className="text-[10px] font-mono text-slate-400 uppercase">DM CONTENT</label>
                            <textarea
                              rows={3}
                              value={dmGreetingMessage}
                              onChange={(e) => setDmGreetingMessage(e.target.value)}
                              className="w-full bg-[#13141d] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-white/40"
                              placeholder="Welcome to the server, {user}! Make sure to read the rules in #rules."
                            />
                          </div>
                        )}
                      </div>

                      {/* Anti-Flood Rate Limiting Guard */}
                      <div className="liquid-glass rounded-2xl p-6 border border-white/10 flex items-center justify-between">
                        <div>
                          <h3 className="font-display font-bold text-sm text-white">
                            Anti-Flood Rate Limiting Guard
                          </h3>
                          <p className="text-xs text-slate-400">
                            Throttles welcome message dispatches if &gt;10 members join within 60 seconds to protect chat from raid spam.
                          </p>
                        </div>
                        <button
                          onClick={() => setAntiFloodEnabled(!antiFloodEnabled)}
                          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer border ${
                            antiFloodEnabled ? 'bg-white border-white' : 'bg-white/10 border-white/10'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-all ${
                              antiFloodEnabled ? 'bg-black translate-x-5' : 'bg-white translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Custom Webhook Profile */}
                      <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-4">
                        <div>
                          <h3 className="font-display font-bold text-sm text-white">
                            Custom Webhook Avatar & Name
                          </h3>
                          <p className="text-xs text-slate-400">
                            Override default bot branding with your own custom server welcome persona.
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-slate-400 uppercase">CUSTOM BOT USERNAME</label>
                            <input
                              type="text"
                              value={welcomerCustomWebhookName}
                              onChange={(e) => setWelcomerCustomWebhookName(e.target.value)}
                              placeholder="e.g. Dexter Sentinel Gatekeeper"
                              className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-slate-400 uppercase">CUSTOM AVATAR IMAGE URL</label>
                            <input
                              type="text"
                              value={welcomerCustomWebhookAvatar}
                              onChange={(e) => setWelcomerCustomWebhookAvatar(e.target.value)}
                              placeholder="https://..."
                              className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

          {/* ======================================================== */}
          {/* TAB 2: ANTINUKE - OBSIDIAN BLACK & WHITE THEME */}
          {/* ======================================================== */}
          {activeModule === 'antinuke' && (
            <div className="space-y-5">
              {/* Breadcrumb & Header */}
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-slate-400">
                  <span>SECURITY</span>
                  <span>&gt;</span>
                  <span className="text-white font-semibold">ANTI-NUKE</span>
                </div>
                <h2 className="font-display font-bold text-2xl text-white tracking-tight mt-1">
                  Anti-Nuke Protection
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure protection against unauthorized guild deletions, role modifications, and bot integrations.
                </p>
              </div>

              {/* Master Alert Banner */}
              <div className="liquid-glass border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full mt-1 sm:mt-0 shrink-0 ${
                      antinukeEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                        ANTI-NUKE IS {antinukeEnabled ? 'ACTIVE' : 'DISABLED'}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded liquid-glass text-slate-400">
                        {antinukeEnabled ? 'PROTECTING' : 'TURN ON IN HEADER'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      To start using this feature, turn on the master switch in the top right.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    onClick={() => setAntinukeEnabled(!antinukeEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer border ${
                      antinukeEnabled ? 'bg-white border-white' : 'bg-white/10 border-white/10'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-all ${
                        antinukeEnabled ? 'bg-black translate-x-5' : 'bg-white translate-x-0'
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => setShowVariablesGuide(true)}
                    className="px-3.5 py-1.5 rounded-xl liquid-glass hover:bg-white/10 text-xs text-slate-300 hover:text-white border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>How to Setup (Guide)</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* 4 Metric Top Cards (Screenshot 3) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="liquid-glass border border-white/5 rounded-2xl p-4">
                  <p className="font-display font-bold text-base text-white">
                    {antinukeEnabled ? 'Active' : 'Inactive'}
                  </p>
                  <p className="text-[10px] font-mono uppercase text-slate-400 mt-1">Protection</p>
                </div>
                <div className="liquid-glass border border-white/5 rounded-2xl p-4">
                  <p className="font-display font-bold text-base text-white">18/18</p>
                  <p className="text-[10px] font-mono uppercase text-slate-400 mt-1">Events Protected</p>
                </div>
                <div className="liquid-glass border border-white/5 rounded-2xl p-4">
                  <p className="font-display font-bold text-base text-white">
                    {antinukePunishment.toUpperCase()}
                  </p>
                  <p className="text-[10px] font-mono uppercase text-slate-400 mt-1">Punishment</p>
                </div>
                <div className="liquid-glass border border-white/5 rounded-2xl p-4">
                  <p className="font-display font-bold text-base text-white">
                    {detectionMode.toUpperCase()}
                  </p>
                  <p className="text-[10px] font-mono uppercase text-slate-400 mt-1">Mode</p>
                </div>
              </div>

              {/* Section 1: Log Channel */}
              <div className="liquid-glass border border-white/5 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <div>
                    <h4 className="font-display font-semibold text-xs text-white">Log Channel</h4>
                    <p className="text-[11px] text-slate-400">Security events will be reported here</p>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={logChannel || targetChannel}
                    onChange={(e) => setLogChannel(e.target.value)}
                    className="w-full bg-[#0a0c10] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/40 cursor-pointer appearance-none"
                  >
                    <option value="">Select log channel...</option>
                    {guild.channels && guild.channels.length > 0 ? (
                      guild.channels.map((ch) => (
                        <option key={ch.id} value={ch.name}>
                          #{ch.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="mod-logs">#mod-logs</option>
                        <option value="security-audit">#security-audit</option>
                        <option value="bot-alerts">#bot-alerts</option>
                      </>
                    )}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Section 2: Punishment Mode - Black and White Segmented Group */}
              <div className="liquid-glass border border-white/5 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-slate-400" />
                  <div>
                    <h4 className="font-display font-semibold text-xs text-white">Punishment Mode</h4>
                    <p className="text-[11px] text-slate-400">Applied to violators globally</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 p-1 bg-[#0a0c10] border border-white/5 rounded-2xl">
                  {[
                    { id: 'ban', label: 'BAN' },
                    { id: 'kick', label: 'KICK' },
                    { id: 'quarantine', label: 'STRIP' },
                  ].map((btn) => {
                    const isActive = antinukePunishment === btn.id;
                    return (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => setAntinukePunishment(btn.id)}
                        className={`py-2 px-4 rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                          isActive
                            ? 'bg-white/10 text-white border border-white/60 shadow-sm'
                            : 'bg-transparent text-slate-400 hover:text-white border border-transparent hover:bg-white/5'
                        }`}
                      >
                        {btn.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Anti-Mention Punishment & Slider */}
              <div className="liquid-glass border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <div>
                    <h4 className="font-display font-semibold text-xs text-white">
                      Anti-Mention Punishment
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Punishment specifically for @everyone / @here pings
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1 bg-[#0a0c10] border border-white/5 rounded-2xl">
                  {[
                    { id: 'timeout', label: 'TIMEOUT' },
                    { id: 'timeout_warn', label: 'TIMEOUT + WARN' },
                    { id: 'ban', label: 'BAN' },
                    { id: 'kick', label: 'KICK' },
                    { id: 'strip', label: 'STRIP' },
                  ].map((btn) => {
                    const isActive = antiMentionPunishment === btn.id;
                    return (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => setAntiMentionPunishment(btn.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer text-center ${
                          isActive
                            ? 'bg-white/10 text-white border border-white/60 shadow-sm'
                            : 'bg-transparent text-slate-400 hover:text-white border border-transparent hover:bg-white/5'
                        }`}
                      >
                        {btn.label}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Timeout Duration</span>
                    <span className="font-mono text-white font-bold">{antiMentionDuration} Hours</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="168"
                    value={antiMentionDuration}
                    onChange={(e) => setAntiMentionDuration(e.target.value)}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                  <p className="text-[10px] text-slate-500 font-mono">
                    Max 168 hours (7 days) as per Discord limits.
                  </p>
                </div>
              </div>

              {/* Section 4: Detection Mode */}
              <div className="liquid-glass border border-white/5 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-400" />
                  <div>
                    <h4 className="font-display font-semibold text-xs text-white">Detection Mode</h4>
                    <p className="text-[11px] text-slate-400">How violations are detected</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#0a0c10] border border-white/5 rounded-2xl">
                  {[
                    { id: 'instant', label: '⚡ INSTANT' },
                    { id: 'threshold', label: '📊 THRESHOLD' },
                  ].map((btn) => {
                    const isActive = detectionMode === btn.id;
                    return (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => setDetectionMode(btn.id)}
                        className={`py-2 px-4 rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                          isActive
                            ? 'bg-white/10 text-white border border-white/60 shadow-sm'
                            : 'bg-transparent text-slate-400 hover:text-white border border-transparent hover:bg-white/5'
                        }`}
                      >
                        {btn.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 5: Recovery Pacing */}
              <div className="liquid-glass border border-white/5 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <div>
                    <h4 className="font-display font-semibold text-xs text-white">Recovery Pacing</h4>
                    <p className="text-[11px] text-slate-400">
                      Configure pacing limits for recovering deleted/modified resources to avoid Discord rate limits.
                    </p>
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Pacing Delay</span>
                    <span className="font-mono text-white font-bold">{recoveryPacing}ms</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="250"
                    value={recoveryPacing}
                    onChange={(e) => setRecoveryPacing(e.target.value)}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                  <p className="text-[10px] text-slate-500 font-mono">
                    Lower values recover faster but increase the risk of Discord API rate limits (429).
                  </p>
                </div>
              </div>

              {/* Section 6: Security Shield Switches */}
              <div className="liquid-glass border border-white/5 rounded-2xl p-5 space-y-3">
                <h4 className="font-display font-semibold text-xs text-white">Event Shield Triggers</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'antiBan', label: 'Anti-Ban Protection', desc: 'Blocks unauthorized member bans' },
                    { key: 'antiKick', label: 'Anti-Kick Protection', desc: 'Blocks unauthorized member kicks' },
                    { key: 'antiChannelDelete', label: 'Anti-Channel Delete', desc: 'Prevents mass channel deletions' },
                    { key: 'antiRoleDelete', label: 'Anti-Role Delete', desc: 'Prevents role stripping and deletion' },
                    { key: 'antiBot', label: 'Anti-Bot Addition', desc: 'Blocks unauthorized bot invites' },
                    { key: 'antiWebhook', label: 'Anti-Webhook Abuse', desc: 'Prevents unauthorized webhooks' },
                    { key: 'antiVanity', label: 'Anti-Vanity Protect', desc: 'Shields server vanity URL from theft' },
                    { key: 'antiPrune', label: 'Anti-Prune Shield', desc: 'Blocks mass pruning of offline members' },
                  ].map((f) => (
                    <div
                      key={f.key}
                      className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-xs text-white">{f.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{f.desc}</p>
                      </div>
                      <button
                        onClick={() =>
                          setAntinukeFeatures((p) => ({
                            ...p,
                            [f.key]: !(p as any)[f.key],
                          }))
                        }
                        className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer border ${
                          (antinukeFeatures as any)[f.key] ? 'bg-white border-white' : 'bg-white/10 border-white/10'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full transition-all ${
                            (antinukeFeatures as any)[f.key] ? 'bg-black translate-x-5' : 'bg-white translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 7: Professional Whitelist & Member Selection Studio */}
              <div className="liquid-glass border border-white/10 rounded-3xl p-6 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden">
                {/* Header with Title & Quota */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                      <UserCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-base sm:text-lg text-white tracking-tight flex items-center gap-2">
                        <span>Whitelisted Trusted Members & Staff</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                          Zero-Trust Bypass
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Selected members are completely immune to automated Anti-Nuke punishments, role rollbacks, rate-limits, and mutiny filters.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white font-bold">
                      {whitelist.length} Members Whitelisted
                    </span>
                  </div>
                </div>

                {/* Primary Action Controls: Member Picker Modal Trigger & Direct ID Input */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Select Member from Server Button */}
                  <div className="sm:col-span-5">
                    <button
                      type="button"
                      onClick={() => setShowMemberSelectModal(true)}
                      className="w-full h-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-200 text-black font-semibold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 transform active:scale-98"
                    >
                      <UserPlus className="w-4 h-4 text-black" />
                      <span>Select Member from Server</span>
                    </button>
                  </div>

                  {/* Direct User ID Input */}
                  <div className="sm:col-span-7 flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Or enter custom Discord User ID..."
                        value={newWhitelistUser}
                        onChange={(e) => setNewWhitelistUser(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addWhitelistUser();
                          }
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-3.5 py-3 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addWhitelistUser}
                      disabled={!newWhitelistUser.trim()}
                      className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                    >
                      + Add ID
                    </button>
                  </div>
                </div>

                {/* Whitelisted Members Cards List */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
                    <span>ACTIVE WHITELIST ROSTER ({whitelist.length})</span>
                    <span className="text-emerald-400">All Security Modules Bypassed</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {whitelist.map((id) => {
                      const member = getMemberDetails(id);
                      return (
                        <div
                          key={id}
                          className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/15 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md group"
                        >
                          {/* Member Avatar & Identity */}
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="relative w-11 h-11 rounded-2xl p-0.5 bg-white/10 border border-white/20 shrink-0 overflow-hidden shadow-lg">
                              <img
                                src={member.avatar}
                                alt={member.displayName}
                                className="w-full h-full object-cover rounded-xl"
                              />
                              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-black" />
                            </div>

                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-display font-bold text-sm text-white truncate">
                                  {member.displayName}
                                </span>
                                {member.isBot && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                    BOT
                                  </span>
                                )}
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-white/5 text-slate-300 border border-white/10">
                                  {member.tier || 'Trusted Staff'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                                <span>@{member.username}</span>
                                <span>&bull;</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard?.writeText(id);
                                    setIdCopied(true);
                                    setTimeout(() => setIdCopied(false), 2000);
                                  }}
                                  className="text-[10px] bg-black/40 hover:bg-black/80 px-2 py-0.5 rounded text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/5"
                                  title="Click to copy ID"
                                >
                                  ID: {id}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Bypass Tags & Remove Action */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                            <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono">
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                                Anti-Ban
                              </span>
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                                Anti-Kick
                              </span>
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                                Anti-Channels
                              </span>
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                                Anti-Roles
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeWhitelistUser(id)}
                              className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer border border-white/5"
                              title="Revoke Whitelist"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* MODAL: SELECT MEMBER FROM SERVER WITH FULL NAMES & AVATARS */}
                {showMemberSelectModal && (
                  <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0b0c13]/95 border border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 backdrop-blur-2xl animate-fade-in-up relative overflow-hidden">
                      {/* Top Shimmer */}
                      <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent rounded-full animate-shimmer" />

                      {/* Modal Header */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                            <UserPlus className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <h3 className="font-display font-bold text-base sm:text-lg text-white tracking-tight">
                              Select Server Member
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Pick a member by name or avatar to add to the Anti-Nuke Whitelist.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowMemberSelectModal(false);
                            setMemberSearchQuery('');
                          }}
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer hover:rotate-90"
                          title="Close"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Live Member Search Input */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search members by name, @handle, or ID..."
                          value={memberSearchQuery}
                          onChange={(e) => setMemberSearchQuery(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono"
                          autoFocus
                        />
                      </div>

                      {/* Scrollable Members List */}
                      <div className="space-y-2 max-h-72 overflow-y-auto p-1 scrollbar-thin">
                        {availableMembers
                          .filter((m) => {
                            if (!memberSearchQuery.trim()) return true;
                            const q = memberSearchQuery.toLowerCase();
                            return (
                              m.displayName.toLowerCase().includes(q) ||
                              m.username.toLowerCase().includes(q) ||
                              m.id.includes(q)
                            );
                          })
                          .map((m) => {
                            const isWhitelisted = whitelist.includes(m.id);
                            return (
                              <div
                                key={m.id}
                                className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 flex items-center justify-between gap-3 transition-colors"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-9 h-9 rounded-xl overflow-hidden bg-[#12141c] border border-white/10 shrink-0">
                                    <img src={m.avatar} alt={m.displayName} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-display font-bold text-xs text-white truncate">
                                        {m.displayName}
                                      </span>
                                      {m.isBot && (
                                        <span className="text-[8px] font-mono px-1 rounded bg-indigo-500/20 text-indigo-400">
                                          BOT
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-mono truncate">
                                      @{m.username} &bull; ID: {m.id}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  {isWhitelisted ? (
                                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1 font-mono">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Whitelisted</span>
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setWhitelist((prev) => [...prev, m.id]);
                                      }}
                                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold text-xs transition-all cursor-pointer shadow-md active:scale-95"
                                    >
                                      + Whitelist
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>

                      {/* Modal Footer */}
                      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                        <span>Showing {availableMembers.length} server members</span>
                        <button
                          type="button"
                          onClick={() => {
                            setShowMemberSelectModal(false);
                            setMemberSearchQuery('');
                          }}
                          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: AUTOMOD */}
          {/* ======================================================== */}
          {activeModule === 'automod' && (
            <div className="space-y-6">
              {/* Module Header Card */}
              <div className="liquid-glass rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 border border-white/10 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white">
                      AutoMod Sentinel & Detection Filters
                    </h3>
                    <p className="text-xs text-slate-400">
                      Automated chat policing, link shielding & spam controls (Screenshot 503)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-semibold text-slate-400">
                    {automodEnabled ? 'ENABLED' : 'STANDBY'}
                  </span>
                  <button
                    onClick={() => setAutomodEnabled(!automodEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer border ${
                      automodEnabled ? 'bg-white border-white' : 'bg-white/10 border-white/10'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-all ${
                        automodEnabled ? 'bg-black translate-x-5' : 'bg-white translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* 3 Accordion Filter Categories (Screenshot 503) */}
              <div className="space-y-4">
                {/* 1. Anti-Spam Filtering */}
                <div className="liquid-glass rounded-2xl p-5 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div>
                      <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                        <Zap className="w-4 h-4 text-white" />
                        <span>Anti-Spam Filtering</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Shield chat from fast repetitive spam, duplicate flooding, and mass mentions.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                      3 Controls Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'antiSpam', label: 'Anti-Spam (Rapid Messages)', desc: 'Blocks fast message sending' },
                      { key: 'massMention', label: 'Anti-Mass Mention', desc: 'Blocks messages with 5+ mentions' },
                      { key: 'antiCaps', label: 'Anti-Caps Abuse', desc: 'Filters messages with >70% capital letters' },
                      { key: 'antiZalgo', label: 'Anti-Zalgo Text', desc: 'Blocks corrupted glitch fonts' },
                    ].map((f) => (
                      <div key={f.key} className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-xs text-white">{f.label}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{f.desc}</p>
                        </div>
                        <button
                          onClick={() => setAutomodFeatures((p) => ({ ...p, [f.key]: !(p as any)[f.key] }))}
                          className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer border ${
                            (automodFeatures as any)[f.key] ? 'bg-white border-white' : 'bg-white/10 border-white/10'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full transition-all ${
                              (automodFeatures as any)[f.key] ? 'bg-black translate-x-4' : 'bg-white translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Link Enforcement */}
                <div className="liquid-glass rounded-2xl p-5 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div>
                      <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                        <Lock className="w-4 h-4 text-white" />
                        <span>Link Enforcement</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Protect against unauthorized invites, discord links, phishing URLs, and web links.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                      Active Guard
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'antiLinks', label: 'Discord Server Invites', desc: 'Blocks discord.gg links' },
                      { key: 'badWords', label: 'Phishing & Scam Links', desc: 'Blocks steam gift & nitro scams' },
                    ].map((f) => (
                      <div key={f.key} className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-xs text-white">{f.label}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{f.desc}</p>
                        </div>
                        <button
                          onClick={() => setAutomodFeatures((p) => ({ ...p, [f.key]: !(p as any)[f.key] }))}
                          className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer border ${
                            (automodFeatures as any)[f.key] ? 'bg-white border-white' : 'bg-white/10 border-white/10'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full transition-all ${
                              (automodFeatures as any)[f.key] ? 'bg-black translate-x-4' : 'bg-white translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Content Filtering & Custom Blacklist */}
                <div className="liquid-glass rounded-2xl p-5 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div>
                      <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                        <Shield className="w-4 h-4 text-white" />
                        <span>Content Filtering & Phrase Blacklist</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Enforce chat civility, profanity detection, and custom blacklisted words.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add custom phrase or word to block..."
                      value={newBlockedWord}
                      onChange={(e) => setNewBlockedWord(e.target.value)}
                      className="flex-1 bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
                    />
                    <button
                      onClick={addBlockedWord}
                      className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      + Add Phrase
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
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

                {/* AutoMod Bypass Customization (Screenshot 503) */}
                <div className="liquid-glass rounded-2xl p-5 border border-white/10 space-y-4">
                  <div className="border-b border-white/5 pb-2">
                    <h4 className="font-display font-bold text-sm text-white">
                      AutoMod Bypass Customization
                    </h4>
                    <p className="text-xs text-slate-400">
                      Configure channels, roles, and users exempt from automated moderation filtering.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Ignored Channels */}
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
                      <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                        IGNORED CHANNELS
                      </label>
                      <select
                        onChange={(e) => {
                          if (e.target.value && !automodIgnoredChannels.includes(e.target.value)) {
                            setAutomodIgnoredChannels([...automodIgnoredChannels, e.target.value]);
                          }
                        }}
                        className="w-full bg-[#13141d] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="">+ Add Ignored Channel</option>
                        {availableChannels.map((c) => (
                          <option key={c.id} value={c.name}>#{c.name}</option>
                        ))}
                      </select>
                      <div className="flex flex-wrap gap-1 pt-1 max-h-24 overflow-y-auto">
                        {automodIgnoredChannels.map((ch) => (
                          <span key={ch} className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] font-mono text-slate-300 flex items-center gap-1">
                            #{ch}
                            <button onClick={() => setAutomodIgnoredChannels(automodIgnoredChannels.filter((c) => c !== ch))} className="text-slate-500 hover:text-white">✕</button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Ignored Roles */}
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
                      <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                        IGNORED ROLES
                      </label>
                      <select
                        onChange={(e) => {
                          if (e.target.value && !automodIgnoredRoles.includes(e.target.value)) {
                            setAutomodIgnoredRoles([...automodIgnoredRoles, e.target.value]);
                          }
                        }}
                        className="w-full bg-[#13141d] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="">+ Add Ignored Role</option>
                        {availableRoles.map((r) => (
                          <option key={r.id} value={r.name}>@{r.name}</option>
                        ))}
                      </select>
                      <div className="flex flex-wrap gap-1 pt-1 max-h-24 overflow-y-auto">
                        {automodIgnoredRoles.map((ro) => (
                          <span key={ro} className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] font-mono text-slate-300 flex items-center gap-1">
                            @{ro}
                            <button onClick={() => setAutomodIgnoredRoles(automodIgnoredRoles.filter((r) => r !== ro))} className="text-slate-500 hover:text-white">✕</button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Ignored Users */}
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
                      <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                        IGNORED USERS
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="User ID..."
                          value={newAutomodUserId}
                          onChange={(e) => setNewAutomodUserId(e.target.value)}
                          className="flex-1 bg-[#13141d] border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono"
                        />
                        <button
                          onClick={() => {
                            if (newAutomodUserId.trim() && !automodIgnoredUsers.includes(newAutomodUserId.trim())) {
                              setAutomodIgnoredUsers([...automodIgnoredUsers, newAutomodUserId.trim()]);
                              setNewAutomodUserId('');
                            }
                          }}
                          className="px-2.5 py-1 bg-white text-black font-bold text-xs rounded-lg"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1 max-h-24 overflow-y-auto">
                        {automodIgnoredUsers.map((uid) => (
                          <span key={uid} className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] font-mono text-slate-300 flex items-center gap-1">
                            ID:{uid}
                            <button onClick={() => setAutomodIgnoredUsers(automodIgnoredUsers.filter((u) => u !== uid))} className="text-slate-500 hover:text-white">✕</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AutoMod Action on Violation */}
                <div className="liquid-glass rounded-2xl p-5 border border-white/10 space-y-3">
                  <label className="text-[11px] font-bold text-white uppercase tracking-wider">
                    AUTOMOD VIOLATION DISCIPLINARY ACTION
                  </label>
                  <select
                    value={automodPunishment}
                    onChange={(e) => setAutomodPunishment(e.target.value)}
                    className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-white/40 cursor-pointer"
                  >
                    <option value="timeout_5m">⏱️ Timeout Member (5 Minutes)</option>
                    <option value="timeout_1h">⏱️ Timeout Member (1 Hour)</option>
                    <option value="timeout_24h">⏱️ Timeout Member (24 Hours)</option>
                    <option value="kick">👢 Kick Member from Server</option>
                    <option value="warn">⚠️ Delete Message & Warn Member</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: HIGHER ROLE BYPASS (Screenshots 504-505) */}
          {/* ======================================================== */}
          {activeModule === 'role_bypass' && (
            <div className="space-y-6">
              {/* Important Note Alert Callout (Screenshot 504) */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/15 flex items-start gap-3 shadow-lg">
                <AlertTriangle className="w-5 h-5 text-white shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider">
                    Important Note
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Higher Role Bypass settings allow specified elevated roles to bypass automated restrictions. Configure carefully to prevent security loopholes.
                  </p>
                </div>
              </div>

              {/* 4 Categorized Bypass Sections (Screenshots 504-505) */}
              <div className="space-y-4">
                {/* 1. Channel Management Bypass */}
                <div className="liquid-glass rounded-2xl p-5 border border-white/10 space-y-4">
                  <div className="border-b border-white/5 pb-2">
                    <h3 className="font-display font-bold text-sm text-white">
                      Channel Management Bypass
                    </h3>
                    <p className="text-xs text-slate-400">
                      Privileged roles exempt from channel lockdown and visibility restrictions.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['Lock', 'Lockall', 'Unlock', 'Unlockall', 'Hide', 'Hideall', 'Unhide', 'Unhideall'].map((action) => {
                      const key = action.toLowerCase();
                      const isChecked = roleBypassToggles[key] ?? true;
                      return (
                        <div key={action} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">{action}</span>
                          <button
                            onClick={() => setRoleBypassToggles((p) => ({ ...p, [key]: !isChecked }))}
                            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer border ${
                              isChecked ? 'bg-white border-white' : 'bg-white/10 border-white/10'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full transition-all ${
                                isChecked ? 'bg-black translate-x-4' : 'bg-white translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Server Moderation Bypass */}
                <div className="liquid-glass rounded-2xl p-5 border border-white/10 space-y-4">
                  <div className="border-b border-white/5 pb-2">
                    <h3 className="font-display font-bold text-sm text-white">
                      Server Moderation Bypass
                    </h3>
                    <p className="text-xs text-slate-400">
                      Exemptions for high-tier moderation enforcement commands.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['Ban', 'Unban', 'Unban All', 'Kick'].map((action) => {
                      const key = action.toLowerCase().replace(' ', '');
                      const isChecked = roleBypassToggles[key] ?? true;
                      return (
                        <div key={action} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">{action}</span>
                          <button
                            onClick={() => setRoleBypassToggles((p) => ({ ...p, [key]: !isChecked }))}
                            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer border ${
                              isChecked ? 'bg-white border-white' : 'bg-white/10 border-white/10'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full transition-all ${
                                isChecked ? 'bg-black translate-x-4' : 'bg-white translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Timeout & Warnings Bypass */}
                <div className="liquid-glass rounded-2xl p-5 border border-white/10 space-y-4">
                  <div className="border-b border-white/5 pb-2">
                    <h3 className="font-display font-bold text-sm text-white">
                      Timeout & Warnings Bypass
                    </h3>
                    <p className="text-xs text-slate-400">
                      Rules governing automated mute escalations and warning thresholds.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['Timeout', 'Untimeout', 'Warn', 'Clear Warnings'].map((action) => {
                      const key = action.toLowerCase().replace(' ', '');
                      const isChecked = roleBypassToggles[key] ?? true;
                      return (
                        <div key={action} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">{action}</span>
                          <button
                            onClick={() => setRoleBypassToggles((p) => ({ ...p, [key]: !isChecked }))}
                            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer border ${
                              isChecked ? 'bg-white border-white' : 'bg-white/10 border-white/10'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full transition-all ${
                                isChecked ? 'bg-black translate-x-4' : 'bg-white translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Voice Moderation Bypass */}
                <div className="liquid-glass rounded-2xl p-5 border border-white/10 space-y-4">
                  <div className="border-b border-white/5 pb-2">
                    <h3 className="font-display font-bold text-sm text-white">
                      Voice Moderation Bypass
                    </h3>
                    <p className="text-xs text-slate-400">
                      Bypass filters for voice server muting, deafening, and disconnect actions.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {['Mute', 'Unmute', 'Deafen', 'Undeafen', 'Disconnect', 'Move'].map((action) => {
                      const key = action.toLowerCase();
                      const isChecked = roleBypassToggles[key] ?? true;
                      return (
                        <div key={action} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">{action}</span>
                          <button
                            onClick={() => setRoleBypassToggles((p) => ({ ...p, [key]: !isChecked }))}
                            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer border ${
                              isChecked ? 'bg-white border-white' : 'bg-white/10 border-white/10'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full transition-all ${
                                isChecked ? 'bg-black translate-x-4' : 'bg-white translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: SERVER NO-PREFIX */}
          {/* ======================================================== */}
          {activeModule === 'noprefix' && (
            <div className="space-y-6">
              <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-4">
                <div>
                  <h3 className="font-display font-bold text-base text-white">
                    Server No-Prefix Whitelist
                  </h3>
                  <p className="text-xs text-slate-400">
                    Allow designated administrators, boosters, or trusted staff to execute commands without typing the prefix (<code className="text-white font-mono">{prefix}</code>).
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-white">Global No-Prefix for Server Owner</h4>
                    <p className="text-[11px] text-slate-400">Owner can trigger any command by typing the name directly</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-white text-black font-mono font-bold text-[10px]">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: OVERVIEW - OBSIDIAN LIVE PROTECTION POSTURE */}
          {/* ======================================================== */}
          {activeModule === 'overview' && (() => {
            const activeLayers = (antinukeEnabled ? 1 : 0) + (automodEnabled ? 1 : 0) + (loggingEnabled ? 1 : 0);
            const coverageScore = Math.round((activeLayers / 4) * 100);
            return (
              <div className="space-y-5">
                {/* Header: Live Protection Posture */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400 font-bold">
                        LIVE PROTECTION POSTURE
                      </span>
                    </div>
                    <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight mt-1">
                      {guild.name}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      See what protects your community now, what needs attention, and where to take action.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => window.location.reload()}
                      className="px-3.5 py-2 rounded-xl liquid-glass hover:bg-white/10 text-xs text-slate-300 hover:text-white border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                {/* Dexter Sentinel Operational Banner */}
                <div className="liquid-glass rounded-2xl border border-white/10 p-1 relative overflow-hidden group shadow-xl">
                  <div className="relative h-32 sm:h-36 w-full rounded-[14px] overflow-hidden">
                    <img
                      src="/dexter-banner.gif"
                      alt="Dexter Sentinel"
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        if (!img.dataset.fallback) {
                          img.dataset.fallback = '1';
                          img.src = 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3dm5ma3lsMTE5MWpxa25xb2x4eTc4NXFhcjlycTVnMXV6eGZjbnlscSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/WW5p7jd8ImZ16q4w2r/giphy.gif';
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#06070a] via-[#06070a]/30 to-transparent"></div>
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-widest text-slate-300 font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        DEXTER DEFENSE ENGINE • LIVE POSTURE
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full liquid-glass text-slate-300 border border-white/10">
                        CLUSTER 0 • SYNCHRONIZED
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2-Column: Your Protection Layers + Protection Score (Screenshot 2) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Left Column: Your protection layers */}
                  <div className="lg:col-span-7 liquid-glass rounded-2xl p-5 border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 font-medium">Security coverage</span>
                        <h3 className="font-display font-bold text-base text-white mt-0.5">
                          Your protection layers
                        </h3>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full liquid-glass border border-white/10 text-[11px] font-mono text-slate-300">
                        {activeLayers}/4 ACTIVE
                      </span>
                    </div>

                    {/* 4 Layers List */}
                    <div className="space-y-2.5">
                      {/* Layer 1: Anti-Nuke */}
                      <div
                        onClick={() => handleSelectModule('antinuke')}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl liquid-glass flex items-center justify-center text-slate-300 group-hover:text-white transition-colors">
                            <ShieldAlert className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-semibold text-xs text-white">
                                Anti-Nuke
                              </span>
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10">
                                {antinukeEnabled ? 'ACTIVE' : 'SETUP'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Stops destructive server actions
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xs font-mono text-slate-400">
                              {antinukeEnabled ? '100%' : '0%'}
                            </span>
                            <div className="w-16 h-1 rounded-full bg-white/10 mt-1 overflow-hidden">
                              <div
                                className="h-full bg-white transition-all duration-500"
                                style={{ width: antinukeEnabled ? '100%' : '0%' }}
                              />
                            </div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                        </div>
                      </div>

                      {/* Layer 2: Anti-Betray */}
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl liquid-glass flex items-center justify-center text-slate-300">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-semibold text-xs text-white">
                                Anti-Betray
                              </span>
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10">
                                SETUP
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Watches trusted staff activity
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xs font-mono text-slate-400">0%</span>
                            <div className="w-16 h-1 rounded-full bg-white/10 mt-1 overflow-hidden">
                              <div className="h-full bg-white/40" style={{ width: '0%' }} />
                            </div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                        </div>
                      </div>

                      {/* Layer 3: AutoMod */}
                      <div
                        onClick={() => handleSelectModule('automod')}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl liquid-glass flex items-center justify-center text-slate-300 group-hover:text-white transition-colors">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-semibold text-xs text-white">
                                AutoMod
                              </span>
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10">
                                {automodEnabled ? 'ACTIVE' : 'SETUP'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Filters harmful content automatically
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xs font-mono text-slate-400">
                              {automodEnabled ? '100%' : '0%'}
                            </span>
                            <div className="w-16 h-1 rounded-full bg-white/10 mt-1 overflow-hidden">
                              <div
                                className="h-full bg-white transition-all duration-500"
                                style={{ width: automodEnabled ? '100%' : '0%' }}
                              />
                            </div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                        </div>
                      </div>

                      {/* Layer 4: Audit Logging */}
                      <div
                        onClick={() => handleSelectModule('logging')}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl liquid-glass flex items-center justify-center text-slate-300 group-hover:text-white transition-colors">
                            <ScrollText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-semibold text-xs text-white">
                                Audit Logging
                              </span>
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10">
                                {loggingEnabled ? 'ACTIVE' : 'SETUP'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Keeps an incident-ready trail
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xs font-mono text-slate-400">
                              {loggingEnabled ? '100%' : '0%'}
                            </span>
                            <div className="w-16 h-1 rounded-full bg-white/10 mt-1 overflow-hidden">
                              <div
                                className="h-full bg-white transition-all duration-500"
                                style={{ width: loggingEnabled ? '100%' : '0%' }}
                              />
                            </div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>

                    {/* NEXT BEST ACTION Card (Screenshot 2) */}
                    <div className="p-3.5 rounded-xl liquid-glass border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 font-bold block">
                          NEXT BEST ACTION
                        </span>
                        <p className="text-xs text-slate-300 mt-0.5">
                          {antinukeEnabled
                            ? 'Anti-Nuke active. Ensure audit logs channel is properly linked.'
                            : 'Enable Anti-Nuke to increase server coverage by 35%'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleSelectModule('antinuke')}
                        className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-lg cursor-pointer active:scale-95"
                      >
                        <span>Configure</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Protection Score Circular Gauge (Screenshot 2) */}
                  <div className="lg:col-span-5 liquid-glass rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium">Protection score</span>
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          LIVE
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-base text-white mt-0.5">
                        {coverageScore < 50 ? 'Needs attention' : 'Optimal Protection'}
                      </h3>
                    </div>

                    {/* SVG Radial Gauge */}
                    <div className="flex flex-col items-center justify-center py-6">
                      <div className="relative w-44 h-44 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            className="stroke-white/10"
                            strokeWidth="6"
                            fill="transparent"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            className="stroke-white transition-all duration-1000 ease-out"
                            strokeWidth="6"
                            strokeDasharray={2 * Math.PI * 38}
                            strokeDashoffset={2 * Math.PI * 38 * (1 - coverageScore / 100)}
                            strokeLinecap="round"
                            fill="transparent"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="font-display font-bold text-3xl text-white">
                            {coverageScore}%
                          </span>
                          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mt-0.5">
                            COVERAGE
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-center text-xs text-slate-400 pb-1">
                      {antinukeEnabled
                        ? 'All configured modules running in real-time.'
                        : 'Anti-Nuke is the highest-impact improvement available.'}
                    </p>
                  </div>
                </div>

                {/* 4 Metric Tiles: MEMBERS, CHANNELS, ROLES, NUKE SAVES (Screenshot 2) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="liquid-glass border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl liquid-glass flex items-center justify-center text-slate-400 shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-bold block">
                        MEMBERS
                      </span>
                      <p className="font-display font-bold text-lg text-white mt-0.5">
                        {guild.memberCount || 3}
                      </p>
                    </div>
                  </div>

                  <div className="liquid-glass border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl liquid-glass flex items-center justify-center text-slate-400 shrink-0">
                      <Hash className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-bold block">
                        CHANNELS
                      </span>
                      <p className="font-display font-bold text-lg text-white mt-0.5">
                        {guild.channelsCount || 4}
                      </p>
                    </div>
                  </div>

                  <div className="liquid-glass border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl liquid-glass flex items-center justify-center text-slate-400 shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-bold block">
                        ROLES
                      </span>
                      <p className="font-display font-bold text-lg text-white mt-0.5">
                        {guild.rolesCount || 1}
                      </p>
                    </div>
                  </div>

                  <div className="liquid-glass border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl liquid-glass flex items-center justify-center text-slate-400 shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-bold block">
                        NUKE SAVES
                      </span>
                      <p className="font-display font-bold text-lg text-white mt-0.5">0</p>
                    </div>
                  </div>
                </div>

                {/* Server details Card (Screenshot 2) */}
                <div className="liquid-glass border border-white/5 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <Zap className="w-4 h-4 text-slate-400" />
                    <span>Server details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-1">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                        SERVER NAME
                      </span>
                      <p className="font-semibold text-white mt-1 truncate">{guild.name}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                        SERVER ID
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="font-mono text-slate-300 text-xs">{guild.id}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(guild.id);
                            setIdCopied(true);
                            setTimeout(() => setIdCopied(false), 2000);
                          }}
                          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Copy Server ID"
                        >
                          {idCopied ? (
                            <Check className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                        ACCESS LEVEL
                      </span>
                      <p className="font-semibold text-white mt-1">Server Owner</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                        PREMIUM STATUS
                      </span>
                      <div className="flex items-center gap-1.5 mt-1 text-slate-300 font-medium">
                        <Zap className="w-3.5 h-3.5 text-slate-400" />
                        <span>Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

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
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-white/40"
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
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
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
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
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
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
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

          {/* TAB: LOGGING (Screenshot 506) */}
          {/* ======================================================== */}
          {activeModule === 'logging' && (
            <div className="space-y-6">
              {/* Top Status & Deploy Bar (Screenshot 506) */}
              <div className="liquid-glass rounded-2xl p-5 border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                    <ScrollText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white">
                      Comprehensive Event Logging
                    </h3>
                    <p className="text-xs text-slate-400">
                      Record moderation actions, joins, leaves, edits, and voice telemetry (Screenshot 506)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setModLogsChannel(availableChannels[0]?.id || 'mod-logs');
                      setMemberLogsChannel(availableChannels[0]?.id || 'join-logs');
                      setMessageLogsChannel(availableChannels[0]?.id || 'message-logs');
                      setVoiceLogsChannel(availableChannels[0]?.id || 'voice-logs');
                      alert('Auto Magic Setup applied! All 7 audit event routes bound to server channels.');
                    }}
                    className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    Auto Magic Setup [ Deploy ]
                  </button>
                  <button
                    onClick={() => {
                      setModLogsChannel('');
                      setMemberLogsChannel('');
                      setMessageLogsChannel('');
                      setVoiceLogsChannel('');
                    }}
                    className="px-3 py-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Reset Logging
                  </button>
                </div>
              </div>

              {/* 7 Configured Log Channel Categories (Screenshot 506) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: 'Member Actions', desc: 'Joins, leaves, role updates, nickname changes', val: memberLogsChannel, setVal: setMemberLogsChannel },
                  { title: 'Message Actions', desc: 'Message edits, message deletes, bulk message purges', val: messageLogsChannel, setVal: setMessageLogsChannel },
                  { title: 'Voice Actions', desc: 'Voice connects, disconnects, server mutes, deafens', val: voiceLogsChannel, setVal: setVoiceLogsChannel },
                  { title: 'Server Actions', desc: 'Server vanity changes, emojis, stickers, integrations', val: serverLogsChannel, setVal: setServerLogsChannel },
                  { title: 'Channel Actions', desc: 'Channel creation, deletion, topic and permission changes', val: modLogsChannel, setVal: setModLogsChannel },
                  { title: 'Role Actions', desc: 'Role creation, deletion, color, icon, and permission changes', val: modLogsChannel, setVal: setModLogsChannel },
                  { title: 'Mod Logs', desc: 'Bans, unbans, kicks, timeouts, warnings, and anti-nuke triggers', val: modLogsChannel, setVal: setModLogsChannel },
                ].map((item, idx) => (
                  <div key={idx} className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">Route #{idx + 1}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                    <select
                      value={item.val}
                      onChange={(e) => item.setVal(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40 cursor-pointer"
                    >
                      <option value="">-- Route to Discord Channel --</option>
                      {availableChannels.map((ch) => (
                        <option key={ch.id} value={ch.id}>
                          # {ch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Live Test Logging Delivery Button */}
              <div className="liquid-glass rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-white">Test Audit Log Dispatch</p>
                  <p className="text-[10px] text-slate-400">
                    Dispatches a live verification event to #{availableChannels.find(c => c.id === modLogsChannel)?.name || modLogsChannel || 'selected channel'}
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
                            color: '#ffffff',
                            author: { name: 'DEXTERCORP AUDIT SENTINEL' },
                            footer: { text: 'DexterCorp Core Sentinel' }
                          }
                        }
                      });
                    } catch (err) {
                      console.warn(err);
                    }
                    setTimeout(() => setLogTestSent(false), 3000);
                  }}
                  className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-slate-200 transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5 text-black" />
                  <span>{logTestSent ? '✓ Audit Log Sent to Discord!' : 'Send Test Log to Channel'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: MODERATION & CASES (Screenshot 512) */}
          {/* ======================================================== */}
          {activeModule === 'moderation' && (
            <div className="space-y-6">
              {/* Cases & Reports Summary Cards (Screenshot 512) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: 'Total Cases', value: '0', color: 'text-white' },
                  { label: 'Bans', value: '0', color: 'text-slate-300' },
                  { label: 'Kicks', value: '0', color: 'text-slate-300' },
                  { label: 'Timeouts', value: '0', color: 'text-slate-300' },
                  { label: 'Warns', value: '0', color: 'text-slate-300' },
                ].map((stat) => (
                  <div key={stat.label} className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{stat.label}</span>
                    <h3 className={`font-display font-bold text-2xl ${stat.color}`}>{stat.value}</h3>
                  </div>
                ))}
              </div>

              {/* View Cases Action & Search */}
              <div className="liquid-glass rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="font-display font-bold text-sm text-white">
                    Cases Log & Reports
                  </h4>
                  <p className="text-xs text-slate-400">
                    Comprehensive moderation action history with case IDs, reasons, and evidence.
                  </p>
                </div>
                <button
                  onClick={() => alert('No active moderation cases found in database. All clear!')}
                  className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer shadow-md"
                >
                  View Cases Directory
                </button>
              </div>

              {/* Protection & Policy Settings (Screenshot 512) */}
              <div className="liquid-glass rounded-2xl p-5 border border-white/10 space-y-5">
                <div className="border-b border-white/5 pb-2">
                  <h4 className="font-display font-bold text-sm text-white">
                    Protection & Policy Settings
                  </h4>
                  <p className="text-xs text-slate-400">
                    Immunity boundaries, user notification preferences, and punishment thresholds.
                  </p>
                </div>

                {/* Immune Roles Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                    IMMUNE ROLES (CANNOT BE WARNED/PUNISHED)
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value && !modImmuneRoles.includes(e.target.value)) {
                        setModImmuneRoles([...modImmuneRoles, e.target.value]);
                      }
                    }}
                    className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="">+ Add Immune Role</option>
                    {availableRoles.map((r) => (
                      <option key={r.id} value={r.name}>@{r.name}</option>
                    ))}
                  </select>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {modImmuneRoles.map((r) => (
                      <span key={r} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-200 flex items-center gap-1.5">
                        @{r}
                        <button onClick={() => setModImmuneRoles(modImmuneRoles.filter((item) => item !== r))} className="text-slate-500 hover:text-white">✕</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Toggles: User Notifications & Purge Pinned */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-xs text-white">User Notifications (DM)</p>
                      <p className="text-[10px] text-slate-400">Send direct message to punished user with reason</p>
                    </div>
                    <button
                      onClick={() => setModUserNotifications(!modUserNotifications)}
                      className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer border ${
                        modUserNotifications ? 'bg-white border-white' : 'bg-white/10 border-white/10'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full transition-all ${
                          modUserNotifications ? 'bg-black translate-x-4' : 'bg-white translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-xs text-white">Purge Pinned Messages</p>
                      <p className="text-[10px] text-slate-400">Allow bulk delete commands to remove pinned messages</p>
                    </div>
                    <button
                      onClick={() => setModPurgePinned(!modPurgePinned)}
                      className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer border ${
                        modPurgePinned ? 'bg-white border-white' : 'bg-white/10 border-white/10'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full transition-all ${
                          modPurgePinned ? 'bg-black translate-x-4' : 'bg-white translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Punishment Escalation Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                      WARN ACTION THRESHOLD
                    </label>
                    <select
                      value={modWarnThreshold}
                      onChange={(e) => setModWarnThreshold(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="3">3 Warns → Auto Timeout (10 Minutes)</option>
                      <option value="5">5 Warns → Auto Kick Member</option>
                      <option value="7">7 Warns → Auto Ban Member</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                      DEFAULT TIMEOUT DURATION
                    </label>
                    <select
                      value={modDefaultTimeout}
                      onChange={(e) => setModDefaultTimeout(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="5m">5 Minutes</option>
                      <option value="10m">10 Minutes</option>
                      <option value="1h">1 Hour</option>
                      <option value="1d">1 Day</option>
                      <option value="7d">7 Days</option>
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
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    >
                      <option value="0">Instant (0s)</option>
                      <option value="5">5 seconds</option>
                      <option value="30">30 seconds</option>
                      <option value="60">1 minute</option>
                      <option value="300">5 minutes</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: AUTO-REACT (Screenshot 513) */}
          {/* ======================================================== */}
          {activeModule === 'autoreact' && (
            <div className="space-y-6">
              {/* 3 Metric Cards (Screenshot 513) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">RULES LIMIT</span>
                  <h3 className="font-display font-bold text-xl text-white">{(autoreactRules || []).length}/10 Rules Limit</h3>
                  <p className="text-[10px] text-slate-500">Maximum concurrent reactions</p>
                </div>

                <div className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">ACTIVE RULES</span>
                  <h3 className="font-display font-bold text-xl text-white">{(autoreactRules || []).length} Active</h3>
                  <p className="text-[10px] text-slate-500">Monitoring target channels</p>
                </div>

                <div className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">STRATEGY</span>
                  <h3 className="font-display font-bold text-xs text-white pt-1">Exact Match vs Contains Substring</h3>
                  <p className="text-[10px] text-slate-500">Case-insensitive matching</p>
                </div>
              </div>

              {/* Add New Rule Card */}
              <div className="liquid-glass rounded-2xl p-5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div>
                    <h4 className="font-display font-bold text-sm text-white">
                      Add New Auto-Reaction Rule
                    </h4>
                    <p className="text-xs text-slate-400">
                      Instruct the bot to automatically add reaction emojis when messages are sent in a channel.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">CHANNEL</label>
                    <select
                      value={newReactChannel}
                      onChange={(e) => setNewReactChannel(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40 cursor-pointer"
                    >
                      {availableChannels.length > 0 ? (
                        availableChannels.map((c) => (
                          <option key={c.id} value={c.name}>#{c.name}</option>
                        ))
                      ) : (
                        <>
                          <option value="suggestions"># suggestions</option>
                          <option value="announcements"># announcements</option>
                          <option value="memes"># memes</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">EMOJIS TO REACT</label>
                    <input
                      type="text"
                      placeholder="e.g. 👍 👎 or <:emoji:id>"
                      value={newReactEmojis}
                      onChange={(e) => setNewReactEmojis(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={addAutoreactRule}
                      className="w-full py-2.5 px-4 rounded-xl bg-white text-black font-bold text-xs hover:bg-slate-200 cursor-pointer transition-all shadow-md active:scale-95"
                    >
                      + Add Rule
                    </button>
                  </div>
                </div>

                {/* Existing Rules List */}
                <div className="space-y-2 pt-2">
                  {(autoreactRules || []).map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs hover:border-white/15 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-slate-400" />
                        <span className="font-mono font-semibold text-white">#{rule.channel}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-base tracking-widest">{rule.emojis}</span>
                        <button
                          onClick={() => setAutoreactRules(autoreactRules.filter((r) => r.id !== rule.id))}
                          className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                          title="Delete Rule"
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
          {/* TAB: AUTORESPONDER (Screenshot 514) */}
          {/* ======================================================== */}
          {activeModule === 'autoresponder' && (
            <div className="space-y-6">
              {/* 3 Metric Cards (Screenshot 514) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">TRIGGERS CONFIGURED</span>
                  <h3 className="font-display font-bold text-xl text-white">{(autoresponders || []).length}/20 Limit</h3>
                  <p className="text-[10px] text-slate-500">Autonomous chat responders</p>
                </div>

                <div className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">ACTIVE TRIGGERS</span>
                  <h3 className="font-display font-bold text-xl text-white">{(autoresponders || []).length} Active</h3>
                  <p className="text-[10px] text-slate-500">Listening to chat events</p>
                </div>

                <div className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">DISPATCH RATE</span>
                  <h3 className="font-display font-bold text-xs text-white pt-1">Real-Time Instant Delivery</h3>
                  <p className="text-[10px] text-slate-500">Sub-second websocket reply</p>
                </div>
              </div>

              {/* Create Auto-Responder Form */}
              <div className="liquid-glass rounded-2xl p-5 border border-white/10 space-y-4">
                <div className="border-b border-white/5 pb-2">
                  <h4 className="font-display font-bold text-sm text-white">
                    Create Custom Auto-Response
                  </h4>
                  <p className="text-xs text-slate-400">
                    Define keywords that trigger automated bot reply messages or information embed panels.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">TRIGGER KEYWORD / COMMAND</label>
                      <input
                        type="text"
                        placeholder="e.g. !help, !store, or ip"
                        value={newTrigger}
                        onChange={(e) => setNewTrigger(e.target.value)}
                        className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-white/40"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">MATCHING STRATEGY</label>
                      <select
                        value={newMatchType}
                        onChange={(e) => setNewMatchType(e.target.value)}
                        className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40 cursor-pointer"
                      >
                        <option value="Exact Match">Exact Match (Full message equals trigger)</option>
                        <option value="Contains">Contains (Anywhere in message text)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">REPLY CONTENT (SUPPORTS VARIABLES)</label>
                    <textarea
                      rows={2}
                      placeholder="Bot response message... (supports {user}, {server_name})"
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-white/40 resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    onClick={addAutoresponder}
                    className="py-2.5 px-5 rounded-xl bg-white text-black font-bold text-xs hover:bg-slate-200 transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    + Add Trigger Rule
                  </button>
                </div>

                {/* Existing Autoresponders List */}
                <div className="space-y-2 pt-2">
                  {(autoresponders || []).map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs space-y-1.5 hover:border-white/15 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-white/10">
                          {item.trigger}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                            {item.matchType}
                          </span>
                          <button
                            onClick={() => setAutoresponders(autoresponders.filter((a) => a.id !== item.id))}
                            className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                            title="Delete Trigger"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-300 text-xs pl-0.5">{item.response}</p>
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
                        â³ Ends in {g.endsIn}
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
          {/* ======================================================== */}
          {/* TAB 12: MESSAGE SENDER (OBSIDIAN EDITION) */}
          {/* ======================================================== */}
          {(activeModule === 'embed_builder' || activeModule === 'message_sender') && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Toast Notification */}
              {emojiToast && (
                <div className="fixed top-20 right-6 z-50 bg-[#1e2029] border border-emerald-500/40 text-emerald-300 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{emojiToast}</span>
                </div>
              )}

              {/* Obsidian Top Action Bar */}
              <div className="bg-[#0e0f15] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTemplatesModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                    <span>Templates</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmojiTargetField('preMessage');
                      setShowEmojiModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
                  >
                    <Smile className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Custom Emojis</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportTemplate}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
                    title="Export Template JSON"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Export</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearMessageSender}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-semibold text-rose-300 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                </div>

                {/* Target Channel & Send Button */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex-1 sm:w-48">
                    <select
                      value={senderChannel}
                      onChange={(e) => setSenderChannel(e.target.value)}
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

                  <button
                    onClick={handleSendMessageSender}
                    disabled={senderSending}
                    className="py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {senderSending ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : senderSent ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>✓ Sent!</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Section 1: Pre-Message Content */}
              <div className="bg-[#0e0f15] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white text-[10px] font-bold flex items-center justify-center">
                      1
                    </span>
                    <h4 className="font-orbitron font-bold text-xs uppercase tracking-wider text-slate-200">
                      Pre-Message Content
                    </h4>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEmojiTargetField('preMessage');
                        setShowEmojiModal(true);
                      }}
                      className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-amber-300 font-medium flex items-center gap-1 border border-white/5 cursor-pointer"
                    >
                      <Smile className="w-3.5 h-3.5" />
                      <span>Emoji</span>
                    </button>
                    <span className="text-[10px] font-mono text-slate-400">
                      {senderPreMessage.length}/2000
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    TEXT MESSAGE (OUTSIDE EMBED)
                  </label>
                  <textarea
                    rows={3}
                    value={senderPreMessage}
                    onChange={(e) => setSenderPreMessage(e.target.value)}
                    placeholder="Enter message text that appears above the embed..."
                    className="w-full bg-[#13141d] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                  />
                </div>

                {/* Collapsible: Profile Override (Webhook) */}
                <div className="border border-white/5 rounded-xl overflow-hidden bg-[#13141d]/50">
                  <button
                    type="button"
                    onClick={() => setShowProfileOverride(!showProfileOverride)}
                    className="w-full p-3 flex items-center justify-between text-left text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-purple-400" />
                      <span>PROFILE OVERRIDE (WEBHOOK)</span>
                      {senderWebhookName && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-500/20 text-purple-300">
                          Active: {senderWebhookName}
                        </span>
                      )}
                    </div>
                    {showProfileOverride ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {showProfileOverride && (
                    <div className="p-4 pt-0 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          CUSTOM DISPLAY NAME
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Dexter Sentinel"
                          value={senderWebhookName}
                          onChange={(e) => setSenderWebhookName(e.target.value)}
                          className="w-full bg-[#0e0f15] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          CUSTOM AVATAR URL
                        </label>
                        <input
                          type="text"
                          placeholder="https://... (PNG/JPG)"
                          value={senderWebhookAvatar}
                          onChange={(e) => setSenderWebhookAvatar(e.target.value)}
                          className="w-full bg-[#0e0f15] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Collapsible: Thread Targeting */}
                <div className="border border-white/5 rounded-xl overflow-hidden bg-[#13141d]/50">
                  <button
                    type="button"
                    onClick={() => setShowThreadTargeting(!showThreadTargeting)}
                    className="w-full p-3 flex items-center justify-between text-left text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-cyan-400" />
                      <span>THREAD & FORUM TARGETING (OPTIONAL)</span>
                    </div>
                    {showThreadTargeting ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {showThreadTargeting && (
                    <div className="p-4 pt-0 border-t border-white/5 space-y-1.5 mt-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        TARGET THREAD ID OR FORUM POST NAME
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1549027457531904072"
                        value={senderThreadName}
                        onChange={(e) => setSenderThreadName(e.target.value)}
                        className="w-full bg-[#0e0f15] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Components Container (Embed Card) */}
              <div className="bg-[#0e0f15] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white text-[10px] font-bold flex items-center justify-center">
                      2
                    </span>
                    <h4 className="font-orbitron font-bold text-xs uppercase tracking-wider text-slate-200">
                      Components Container (Rich Embed)
                    </h4>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Spoiler Overlay Toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Spoiler Overlay</span>
                      <button
                        type="button"
                        onClick={() => setSenderSpoiler(!senderSpoiler)}
                        className={`w-9 h-5 rounded-full transition-colors p-0.5 cursor-pointer ${
                          senderSpoiler ? 'bg-amber-500' : 'bg-white/10'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            senderSpoiler ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Accent Color */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">BORDER:</span>
                      <input
                        type="color"
                        value={senderEmbedColor}
                        onChange={(e) => setSenderEmbedColor(e.target.value)}
                        className="w-6 h-6 rounded-md bg-transparent border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={senderEmbedColor}
                        onChange={(e) => setSenderEmbedColor(e.target.value)}
                        className="w-20 bg-[#13141d] border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Sub-component quick action bar */}
                <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEmojiTargetField('title');
                      setShowEmojiModal(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-slate-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-emerald-400" />
                    <span>Title Emoji</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSenderShowDivider(!senderShowDivider)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors ${
                      senderShowDivider
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-white/5 border-white/5 text-slate-400'
                    }`}
                  >
                    <span>{senderShowDivider ? '✓ Divider Line Active' : '+ Add Separator Line'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmojiTargetField('description');
                      setShowEmojiModal(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-slate-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Smile className="w-3 h-3 text-amber-400" />
                    <span>Insert Emoji in Body</span>
                  </button>
                </div>

                {/* Embed Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      EMBED TITLE
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setEmojiTargetField('title');
                        setShowEmojiModal(true);
                      }}
                      className="text-[10px] text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Smile className="w-3 h-3" />
                      <span>Add Emoji</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={senderEmbedTitle}
                    onChange={(e) => setSenderEmbedTitle(e.target.value)}
                    placeholder="e.g. 📢 Official Community Announcement"
                    className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Embed Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      DESCRIPTION (MARKDOWN & EMOJIS SUPPORTED)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setEmojiTargetField('description');
                        setShowEmojiModal(true);
                      }}
                      className="text-[10px] text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Smile className="w-3 h-3" />
                      <span>Add Emoji</span>
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={senderEmbedDesc}
                    onChange={(e) => setSenderEmbedDesc(e.target.value)}
                    placeholder="Write your embed description here..."
                    className="w-full bg-[#13141d] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none font-mono text-[11px] leading-relaxed"
                  />
                </div>

                {/* Author Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      AUTHOR NAME
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dexter Corporation"
                      value={senderAuthorName}
                      onChange={(e) => setSenderAuthorName(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      AUTHOR ICON URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://... or {server_icon}"
                      value={senderAuthorIcon}
                      onChange={(e) => setSenderAuthorIcon(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Media Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      THUMBNAIL URL (TOP RIGHT)
                    </label>
                    <input
                      type="text"
                      placeholder="https://... (Square thumbnail)"
                      value={senderThumbnailUrl}
                      onChange={(e) => setSenderThumbnailUrl(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      IMAGE BANNER URL (LARGE FOOTER IMAGE)
                    </label>
                    <input
                      type="text"
                      placeholder="https://... (Full-width banner)"
                      value={senderImageUrl}
                      onChange={(e) => setSenderImageUrl(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Footer Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      FOOTER TEXT
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. DexterCorp Security Dispatch"
                      value={senderFooterText}
                      onChange={(e) => setSenderFooterText(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      FOOTER ICON URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://... or {server_icon}"
                      value={senderFooterIcon}
                      onChange={(e) => setSenderFooterIcon(e.target.value)}
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Interactive Action Buttons */}
              <div className="bg-[#0e0f15] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white text-[10px] font-bold flex items-center justify-center">
                      3
                    </span>
                    <div>
                      <h4 className="font-orbitron font-bold text-xs uppercase tracking-wider text-slate-200">
                        Interactive Action Buttons
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Attach clickable Discord link buttons (Max 5 buttons in row)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSenderButton}
                    disabled={senderButtons.length >= 5}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Button</span>
                  </button>
                </div>

                {senderButtons.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-xs text-slate-400">
                    No buttons added yet. Click &quot;Add Button&quot; to attach direct links to your message!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {senderButtons.map((btn, idx) => (
                      <div
                        key={btn.id}
                        className="bg-[#13141d] border border-white/5 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3"
                      >
                        <div className="w-full sm:w-28 space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">EMOJI</label>
                          <input
                            type="text"
                            placeholder="📢 or <:name:id>"
                            value={btn.emoji || ''}
                            onChange={(e) => handleUpdateSenderButton(btn.id, 'emoji', e.target.value)}
                            className="w-full bg-[#0e0f15] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="w-full sm:w-44 space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">BUTTON LABEL</label>
                          <input
                            type="text"
                            placeholder="e.g. Announcements"
                            value={btn.label}
                            onChange={(e) => handleUpdateSenderButton(btn.id, 'label', e.target.value)}
                            className="w-full bg-[#0e0f15] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="flex-1 w-full space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">DESTINATION URL</label>
                          <input
                            type="text"
                            placeholder="https://discord.gg/..."
                            value={btn.url}
                            onChange={(e) => handleUpdateSenderButton(btn.id, 'url', e.target.value)}
                            className="w-full bg-[#0e0f15] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveSenderButton(btn.id)}
                          className="self-end sm:self-center p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors cursor-pointer"
                          title="Delete Button"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Big Bottom Dispatch Button */}
              <button
                onClick={handleSendMessageSender}
                disabled={senderSending}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {senderSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching Message to Discord Channel...</span>
                  </>
                ) : senderSent ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>✓ Message Dispatched Successfully!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>
                      Send Message to #
                      {availableChannels.find((c) => c.id === senderChannel)?.name || senderChannel}
                    </span>
                  </>
                )}
              </button>

              {/* MODAL 1: TEMPLATES & BACKUPS */}
              {showTemplatesModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-[#12131a] border border-white/10 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-fade-in-up zoom-in-95">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <Bookmark className="w-5 h-5 text-amber-400" />
                        <h3 className="font-orbitron font-bold text-base text-white">
                          Templates & Backups
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowTemplatesModal(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Save Current Design */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        SAVE CURRENT DESIGN AS TEMPLATE
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Template Name (e.g. Verification Rules)..."
                          value={newTemplateName}
                          onChange={(e) => setNewTemplateName(e.target.value)}
                          className="flex-1 bg-[#1a1b26] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={handleSaveCurrentTemplate}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors cursor-pointer"
                        >
                          Save Template
                        </button>
                      </div>
                    </div>

                    {/* Instant Presets */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        DEXTER INSTANT PRESETS
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-[#1a1b26] border border-white/5 rounded-xl p-3 space-y-2">
                          <h5 className="font-bold text-xs text-white">Server Rules & Guidelines</h5>
                          <p className="text-[10px] text-slate-400">
                            Standard community rules ended with an &apos;Accept Rules&apos; button.
                          </p>
                          <button
                            type="button"
                            onClick={() => handleApplyPreset('rules')}
                            className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                          >
                            Apply Preset
                          </button>
                        </div>

                        <div className="bg-[#1a1b26] border border-white/5 rounded-xl p-3 space-y-2">
                          <h5 className="font-bold text-xs text-white">Important Announcement</h5>
                          <p className="text-[10px] text-slate-400">
                            Eye-catching announcement embed with server notification ping.
                          </p>
                          <button
                            type="button"
                            onClick={() => handleApplyPreset('announcement')}
                            className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                          >
                            Apply Preset
                          </button>
                        </div>

                        <div className="bg-[#1a1b26] border border-white/5 rounded-xl p-3 space-y-2">
                          <h5 className="font-bold text-xs text-white">Verification Gate</h5>
                          <p className="text-[10px] text-slate-400">
                            Rich verification message asking members to click a button for access.
                          </p>
                          <button
                            type="button"
                            onClick={() => handleApplyPreset('verification')}
                            className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                          >
                            Apply Preset
                          </button>
                        </div>

                        <div className="bg-[#1a1b26] border border-white/5 rounded-xl p-3 space-y-2">
                          <h5 className="font-bold text-xs text-white">Booster Perks</h5>
                          <p className="text-[10px] text-slate-400">
                            VIP perks and exclusive rewards for server boosters.
                          </p>
                          <button
                            type="button"
                            onClick={() => handleApplyPreset('booster')}
                            className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                          >
                            Apply Preset
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Saved Templates List */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        YOUR SAVED TEMPLATES ({savedTemplates.length})
                      </label>
                      {savedTemplates.length === 0 ? (
                        <div className="p-4 rounded-xl bg-[#1a1b26]/50 border border-white/5 text-center text-xs text-slate-400">
                          No saved templates yet. Save your current layout above!
                        </div>
                      ) : (
                        <div className="max-h-40 overflow-y-auto space-y-2">
                          {savedTemplates.map((tpl) => (
                            <div
                              key={tpl.id}
                              className="bg-[#1a1b26] border border-white/5 rounded-xl p-2.5 flex items-center justify-between"
                            >
                              <span className="text-xs font-medium text-slate-200">{tpl.name}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleApplyTemplate(tpl.data)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold cursor-pointer"
                                >
                                  Apply
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTemplate(tpl.id)}
                                  className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Import / Export JSON buttons */}
                    <div className="border-t border-white/5 pt-4 flex items-center justify-between gap-3">
                      <label className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer">
                        <Upload className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Import .JSON</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportTemplate}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={handleExportTemplate}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>Export .JSON</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL 2: SERVER CUSTOM EMOJIS (Professional Obsidian Glass Edition) */}
              {showEmojiModal && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                  <div className="bg-[#0c0d14]/95 border border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 backdrop-blur-2xl animate-fade-in-up relative overflow-hidden">
                    {/* Top Shimmer Line */}
                    <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent rounded-full animate-shimmer" />

                    {/* Modal Header */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500/20 to-amber-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shadow-lg shadow-red-500/10">
                          <Sparkles className="w-4 h-4 text-red-400 animate-pulse" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-base sm:text-lg text-white tracking-tight flex items-center gap-2">
                            <span>Server Custom Emojis</span>
                            <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                              Pro
                            </span>
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Click any emoji to insert into <span className="text-white font-medium">{emojiTargetField === 'preMessage' ? 'Pre-Message' : emojiTargetField === 'title' ? 'Embed Title' : 'Embed Description'}</span> & copy to clipboard
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowEmojiModal(false)}
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer hover:rotate-90"
                        title="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Target Selector Segmented Control */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Target Insertion Field</span>
                        <span className="text-white font-mono">Active: {emojiTargetField}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/5">
                        <button
                          type="button"
                          onClick={() => setEmojiTargetField('preMessage')}
                          className={`py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                            emojiTargetField === 'preMessage'
                              ? 'bg-white text-black shadow-lg shadow-white/10'
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span>Pre-Message</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEmojiTargetField('title')}
                          className={`py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                            emojiTargetField === 'title'
                              ? 'bg-white text-black shadow-lg shadow-white/10'
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span>Title</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEmojiTargetField('description')}
                          className={`py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                            emojiTargetField === 'description'
                              ? 'bg-white text-black shadow-lg shadow-white/10'
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span>Description</span>
                        </button>
                      </div>
                    </div>

                    {/* Storage Quota Bar */}
                    <div className="space-y-1.5 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-300">Emoji Storage Capacity</span>
                        <span className="font-mono text-xs font-bold text-white">
                          {serverCustomEmojis.length} <span className="text-slate-500">/ 15</span>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${(serverCustomEmojis.length / 15) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Add New Custom Emoji */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Add New Custom Emoji</span>
                        <span className="text-[10px] text-slate-500 font-normal">Discord CDN or Unicode</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. <:pepe_cool:123456789> or 🚀"
                          value={customEmojiInput}
                          onChange={(e) => setCustomEmojiInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomEmoji();
                            }
                          }}
                          className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 transition-colors font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomEmoji}
                          disabled={serverCustomEmojis.length >= 15 || !customEmojiInput.trim()}
                          className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-200 text-black font-bold text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:scale-[1.02] active:scale-95"
                        >
                          + Add
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Paste any Discord emoji tag format (e.g. &lt;:name:id&gt; or &lt;a:name:id&gt;) or native emoji symbol.
                      </p>
                    </div>

                    {/* Active Server Emojis Grid (5 Columns, Crisp Preview Cards) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Active Server Emojis ({serverCustomEmojis.length})
                        </label>
                        <span className="text-[10px] text-emerald-400 font-medium">Click to insert & copy</span>
                      </div>
                      <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto p-1 scrollbar-thin">
                        {serverCustomEmojis.map((em, eIdx) => {
                          const displayName = getEmojiDisplayName(em);
                          return (
                            <button
                              key={eIdx}
                              type="button"
                              onClick={() => handleInsertEmoji(em)}
                              className="p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.1] border border-white/5 hover:border-white/20 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 active:scale-95 group relative shadow-md"
                              title={`${displayName} (${em})`}
                            >
                              <div className="w-10 h-10 flex items-center justify-center">
                                {renderEmojiVisual(em)}
                              </div>
                              <span className="text-[9px] text-slate-400 font-medium truncate max-w-[56px] group-hover:text-white transition-colors">
                                {displayName}
                              </span>
                              {/* Remove hover button */}
                              {serverCustomEmojis.length > 5 && (
                                <button
                                  type="button"
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    setServerCustomEmojis((curr) => curr.filter((_, i) => i !== eIdx));
                                  }}
                                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500/80 hover:bg-rose-500 text-white text-[9px] font-bold items-center justify-center hidden group-hover:flex shadow-sm cursor-pointer"
                                  title="Remove emoji"
                                >
                                  &times;
                                </button>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: SUPPORT TICKETS (Screenshots 515-521) */}
          {/* ======================================================== */}
          {activeModule === 'tickets' && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Header Title & Master Switch (Screenshots 515-521) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                    Support Tickets
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage tickets, customize create forms, and archive logs with hosted transcripts.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                    {ticketEnabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                  <button
                    onClick={() => setTicketEnabled(!ticketEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      ticketEnabled ? 'bg-white' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform ${
                        ticketEnabled ? 'translate-x-6 bg-black' : 'translate-x-0 bg-slate-400'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Warning Alert if Disabled */}
              {!ticketEnabled && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <div>
                      <strong className="font-mono text-[11px] uppercase tracking-wider text-amber-300 mr-2">
                        TICKET SYSTEM IS DISABLED
                      </strong>
                      <span className="text-amber-300/80">
                        To start using this feature, turn on the master switch in the top right.
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setTicketEnabled(true)}
                    className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    Turn On in Header
                  </button>
                </div>
              )}

              {/* Obsidian Ticket Subtabs Layout (Screenshots 515-521) */}
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Left Ticket Management Sub-Navigation */}
                <div className="w-full lg:w-52 shrink-0 space-y-1 liquid-glass rounded-2xl p-3 border border-white/10">
                  <div className="px-3 py-2 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                    TICKET MANAGEMENT
                  </div>
                  <button
                    onClick={() => setTicketSubTab('overview')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      ticketSubTab === 'overview'
                        ? 'bg-white text-black font-bold shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                    <span>OVERVIEW</span>
                  </button>
                  <button
                    onClick={() => setTicketSubTab('config')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      ticketSubTab === 'config'
                        ? 'bg-white text-black font-bold shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5 shrink-0" />
                    <span>SETUP CONFIG</span>
                  </button>
                  <button
                    onClick={() => setTicketSubTab('panel')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      ticketSubTab === 'panel'
                        ? 'bg-white text-black font-bold shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span>MESSAGE PANEL</span>
                  </button>
                  <button
                    onClick={() => setTicketSubTab('modals')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      ticketSubTab === 'modals'
                        ? 'bg-white text-black font-bold shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>MODAL QUESTIONS</span>
                  </button>
                  <button
                    onClick={() => setTicketSubTab('transcripts')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      ticketSubTab === 'transcripts'
                        ? 'bg-white text-black font-bold shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span>TRANSCRIPTS</span>
                  </button>
                  <button
                    onClick={() => setTicketSubTab('security')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      ticketSubTab === 'security'
                        ? 'bg-white text-black font-bold shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>SECURITY CONTROLS</span>
                  </button>
                </div>

                {/* Subtab Dynamic Content */}
                <div className="flex-1 w-full space-y-6">
                  {/* SUBTAB 1: OVERVIEW (Screenshot 515) */}
                  {ticketSubTab === 'overview' && (
                    <div className="space-y-6">
                      {/* 4 Metric Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-1">
                          <span className="text-[10px] font-mono text-slate-400 uppercase">NEURAL NODES</span>
                          <h3 className="font-display font-bold text-2xl text-white">1</h3>
                          <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            ACTIVE
                          </p>
                        </div>
                        <div className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-1">
                          <span className="text-[10px] font-mono text-slate-400 uppercase">DATA THROUGHPUT</span>
                          <h3 className="font-display font-bold text-2xl text-white">48</h3>
                          <p className="text-[10px] text-slate-500 font-mono">LIFETIME CLAIMS</p>
                        </div>
                        <div className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-1">
                          <span className="text-[10px] font-mono text-slate-400 uppercase">CLAIMED TICKETS</span>
                          <h3 className="font-display font-bold text-2xl text-white">12</h3>
                          <p className="text-[10px] text-slate-500 font-mono">TOTAL TICKET CLAIMS</p>
                        </div>
                        <div className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-1">
                          <span className="text-[10px] font-mono text-slate-400 uppercase">AI LOAD</span>
                          <h3 className="font-display font-bold text-base text-white pt-1">STANDBY</h3>
                          <p className="text-[10px] text-slate-500 font-mono">AI CHATBOT READY</p>
                        </div>
                      </div>

                      {/* Operational Impact Chart + Personnel Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Chart (2 cols) */}
                        <div className="lg:col-span-2 liquid-glass rounded-2xl p-5 border border-white/10 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-display font-bold text-sm text-white">Operational Impact</h4>
                              <p className="text-xs text-slate-400">Claims analytics over the past 7 dynamic cycles.</p>
                            </div>
                            <span className="text-[10px] font-mono text-white bg-white/10 border border-white/10 px-2 py-0.5 rounded-full">
                              LIVE TELEMETRY
                            </span>
                          </div>

                          {/* Visual Chart */}
                          <div className="relative h-44 rounded-xl bg-black/40 border border-white/5 p-4 flex flex-col justify-between overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                                ❯ TELEMETRY CLEAR • STANDBY MODE
                              </span>
                            </div>
                            <svg className="w-full h-24 overflow-visible opacity-50" viewBox="0 0 500 100">
                              <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                              <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                              <path
                                d="M 0,80 Q 120,78 250,75 T 500,70"
                                fill="none"
                                stroke="#a855f7"
                                strokeWidth="2"
                              />
                            </svg>
                            <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-white/5">
                              <span>Mon</span>
                              <span>Tue</span>
                              <span>Wed</span>
                              <span>Thu</span>
                              <span>Fri</span>
                              <span>Sat</span>
                              <span>Sun</span>
                            </div>
                          </div>
                        </div>

                        {/* Active Personnel & Staff Leaderboard */}
                        <div className="space-y-4">
                          <div className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-display font-bold text-xs text-white">Active Personnel</span>
                              <span className="text-[10px] font-mono text-slate-500">1 CONFIGURED</span>
                            </div>
                            <p className="text-xs text-slate-400">
                              Staff members handling incoming tickets for {guild.name}.
                            </p>
                          </div>

                          <div className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-display font-bold text-xs text-white">Staff Leaderboard</span>
                              <span className="text-[10px] font-mono text-white bg-white/10 px-2 py-0.5 rounded">
                                ELITE HANDLERS
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">No ticket claims logged for this cycle.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 2: SETUP CONFIG (Screenshot 516) */}
                  {ticketSubTab === 'config' && (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                      <div className="xl:col-span-2 liquid-glass rounded-2xl p-5 border border-white/10 space-y-4">
                        <div className="border-b border-white/5 pb-2">
                          <h4 className="font-display font-bold text-sm text-white">Ticket Setup Configuration</h4>
                          <p className="text-xs text-slate-400">Set target ticket category, logging, and permissions</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-slate-400 uppercase">TICKET CATEGORY</label>
                            <select
                              value={ticketCategory}
                              onChange={(e) => setTicketCategory(e.target.value)}
                              className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40 cursor-pointer"
                            >
                              <option value="">Select ticket category...</option>
                              {availableChannels
                                .filter((c) => c.type === 4)
                                .map((ch) => (
                                  <option key={ch.id} value={ch.id}>
                                    📁 {ch.name}
                                  </option>
                                ))}
                            </select>
                            <p className="text-[10px] text-slate-500">Where ticket text channels will be generated</p>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-slate-400 uppercase">STAFF ROLES (MULTIPLE)</label>
                            <select
                              value={ticketRole}
                              onChange={(e) => setTicketRole(e.target.value)}
                              className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40 cursor-pointer"
                            >
                              <option value="">@ Add staff Role...</option>
                              {availableRoles.map((r) => (
                                <option key={r.id} value={r.id}>
                                  @{r.name}
                                </option>
                              ))}
                            </select>
                            <p className="text-[10px] text-slate-500">Permit role members to view and support ticket channels</p>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-400 uppercase">TRANSCRIPT LOGGING CHANNEL</label>
                          <select
                            value={ticketLogsChannel}
                            onChange={(e) => setTicketLogsChannel(e.target.value)}
                            className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40 cursor-pointer"
                          >
                            <option value="">Select logs channel...</option>
                            {availableChannels
                              .filter((c) => c.type !== 4)
                              .map((ch) => (
                                <option key={ch.id} value={ch.id}>
                                  #{ch.name}
                                </option>
                              ))}
                          </select>
                          <p className="text-[10px] text-slate-500">Where closed transcripts online links and HTML files will be logged</p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-400 uppercase">DEPLOY PANEL TARGET CHANNEL</label>
                          <select
                            value={ticketChannel}
                            onChange={(e) => setTicketChannel(e.target.value)}
                            className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40 cursor-pointer"
                          >
                            <option value="">Select deploy target channel...</option>
                            {availableChannels
                              .filter((c) => c.type !== 4)
                              .map((ch) => (
                                <option key={ch.id} value={ch.id}>
                                  #{ch.name}
                                </option>
                              ))}
                          </select>
                          <p className="text-[10px] text-slate-500">Specific channel where the support ticket panel embed is deployed in Discord</p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-400 uppercase">TICKET CHANNEL NAME STYLE</label>
                          <input
                            type="text"
                            value={ticketChannelStyle}
                            onChange={(e) => setTicketChannelStyle(e.target.value)}
                            className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-white/40"
                          />
                        </div>
                      </div>

                      {/* Right Panel Preview */}
                      <div className="space-y-4">
                        <div className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-white">
                            <Eye className="w-4 h-4 text-slate-400" />
                            <span>Discord Panel Preview</span>
                          </div>
                          <p className="text-[10px] text-slate-500">Simulated embed preview of the panel card</p>
                          <div className="bg-[#2b2d31] rounded-xl p-3 border-l-4 border-[#5865F2] text-xs space-y-2">
                            <div className="text-[10px] text-slate-400 font-semibold">{ticketAuthorName || 'Obsidian Security'}</div>
                            <h4 className="font-bold text-white text-xs">{ticketPanelTitle || 'Obsidian Ticket Support'}</h4>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              {ticketPanelDesc || 'Need help? Click the button below to open a ticket and talk to our support staff.'}
                            </p>
                            <div className="pt-1">
                              <button className="px-3 py-1.5 rounded bg-[#5865F2] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                                <span>{ticketButtonEmoji || '✉'}</span>
                                <span>{ticketButtonText || 'Create Ticket'}</span>
                              </button>
                            </div>
                            <div className="text-[9px] text-slate-500 pt-1 border-t border-white/5">
                              {ticketFooterText || 'Obsidian Security • Transcripts expire in 30 days'}
                            </div>
                          </div>

                          <button
                            onClick={handleDeployTicketPanel}
                            disabled={ticketDeploying}
                            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                              ticketChannel
                                ? 'bg-white hover:bg-slate-200 text-black'
                                : 'bg-white/10 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>
                              {ticketDeploying
                                ? 'Deploying...'
                                : ticketDeploySuccess
                                ? '✓ Panel Deployed Live!'
                                : ticketChannel
                                ? `Deploy Live to #${availableChannels.find((c) => c.id === ticketChannel)?.name || 'channel'}`
                                : 'Select Target Channel to Send'}
                            </span>
                          </button>
                          {!ticketChannel && (
                            <p className="text-[10px] text-amber-400/90 text-center flex items-center justify-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Target channel is not set. Select a channel above to dispatch.</span>
                            </p>
                          )}
                        </div>

                        <div className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Transcript Hosting Notice</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Ticket transcripts are saved in Gzip compressed format on the bot database server. Links can be viewed online for <strong className="text-white">30 days</strong> before expiring.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 3: MESSAGE PANEL (Screenshot 517) */}
                  {ticketSubTab === 'panel' && (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                      <div className="xl:col-span-2 space-y-4">
                        {/* Live Panel Dispatch Bar */}
                        <div className="liquid-glass rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="font-display font-bold text-xs text-white">Live Panel Dispatch</span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Target Channel:{' '}
                              <strong className="text-white font-mono">
                                {ticketChannel
                                  ? '#' + (availableChannels.find((c) => c.id === ticketChannel)?.name || ticketChannel)
                                  : 'None selected (Select in Setup Config)'}
                              </strong>
                            </p>
                          </div>

                          <button
                            onClick={handleDeployTicketPanel}
                            disabled={ticketDeploying || !ticketChannel}
                            className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-slate-200 transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-40"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Dispatch Panel to Discord</span>
                          </button>
                        </div>

                        {/* Embed Customizer Form */}
                        <div className="liquid-glass rounded-2xl p-5 border border-white/10 space-y-4">
                          <div className="border-b border-white/5 pb-2">
                            <h4 className="font-display font-bold text-sm text-white">Ticket Message Panel</h4>
                            <p className="text-xs text-slate-400">Customize the embed panel sent to the discord channel</p>
                          </div>

                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-slate-400 uppercase">PANEL EMBED TITLE</label>
                              <input
                                type="text"
                                value={ticketPanelTitle}
                                onChange={(e) => setTicketPanelTitle(e.target.value)}
                                className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-slate-400 uppercase">PANEL EMBED DESCRIPTION</label>
                              <textarea
                                rows={3}
                                value={ticketPanelDesc}
                                onChange={(e) => setTicketPanelDesc(e.target.value)}
                                className="w-full bg-[#13141d] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-white/40 resize-none leading-relaxed"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono text-slate-400 uppercase">PANEL EMBED HEADER TEXT</label>
                                <input
                                  type="text"
                                  value={ticketAuthorName}
                                  onChange={(e) => setTicketAuthorName(e.target.value)}
                                  placeholder="Obsidian Security"
                                  className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-mono text-slate-400 uppercase">PANEL EMBED FOOTER TEXT</label>
                                <input
                                  type="text"
                                  value={ticketFooterText}
                                  onChange={(e) => setTicketFooterText(e.target.value)}
                                  placeholder="Obsidian Security • Transcripts expire in 30 days"
                                  className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono text-slate-400 uppercase">PANEL TYPE</label>
                                <select className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40 cursor-pointer">
                                  <option value="button">Interactive Button</option>
                                  <option value="select">Dropdown Menu</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-mono text-slate-400 uppercase">BUTTON LABEL</label>
                                <input
                                  type="text"
                                  value={ticketButtonText}
                                  onChange={(e) => setTicketButtonText(e.target.value)}
                                  className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-mono text-slate-400 uppercase">BUTTON EMOJI</label>
                                <input
                                  type="text"
                                  value={ticketButtonEmoji}
                                  onChange={(e) => setTicketButtonEmoji(e.target.value)}
                                  placeholder="✉"
                                  className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-slate-400 uppercase">PANEL IMAGE URL</label>
                              <input
                                type="text"
                                value={ticketImageUrl}
                                onChange={(e) => setTicketImageUrl(e.target.value)}
                                placeholder="https://domain.com/banner.png"
                                className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Panel Preview */}
                      <div className="space-y-4">
                        <div className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-white">
                            <Eye className="w-4 h-4 text-slate-400" />
                            <span>Discord Panel Preview</span>
                          </div>
                          <p className="text-[10px] text-slate-500">Simulated embed preview of the panel card</p>
                          <div className="bg-[#2b2d31] rounded-xl p-3 border-l-4 border-[#5865F2] text-xs space-y-2">
                            <div className="text-[10px] text-slate-400 font-semibold">{ticketAuthorName || 'Obsidian Security'}</div>
                            <h4 className="font-bold text-white text-xs">{ticketPanelTitle || 'Obsidian Ticket Support'}</h4>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              {ticketPanelDesc || 'Need help? Click the button below to open a ticket and talk to our support staff.'}
                            </p>
                            <div className="pt-1">
                              <button className="px-3 py-1.5 rounded bg-[#5865F2] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                                <span>{ticketButtonEmoji || '✉'}</span>
                                <span>{ticketButtonText || 'Create Ticket'}</span>
                              </button>
                            </div>
                            <div className="text-[9px] text-slate-500 pt-1 border-t border-white/5">
                              {ticketFooterText || 'Obsidian Security • Transcripts expire in 30 days'}
                            </div>
                          </div>

                          <button
                            onClick={handleDeployTicketPanel}
                            disabled={ticketDeploying}
                            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                              ticketChannel
                                ? 'bg-white hover:bg-slate-200 text-black'
                                : 'bg-white/10 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>
                              {ticketDeploying
                                ? 'Deploying...'
                                : ticketDeploySuccess
                                ? '✓ Panel Deployed Live!'
                                : ticketChannel
                                ? `Deploy to #${availableChannels.find((c) => c.id === ticketChannel)?.name || 'channel'}`
                                : 'Select Target Channel to Send'}
                            </span>
                          </button>
                          {!ticketChannel && (
                            <p className="text-[10px] text-amber-400/90 text-center flex items-center justify-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Target channel is not set. Select a channel in "Setup Config" to dispatch.</span>
                            </p>
                          )}
                        </div>

                        <div className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Transcript Hosting Notice</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Ticket transcripts are saved in Gzip compressed format on the bot database server. Links can be viewed online for <strong className="text-white">30 days</strong> before expiring.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 4: MODAL QUESTIONS (Screenshot 518) */}
                  {ticketSubTab === 'modals' && (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                      <div className="xl:col-span-2 liquid-glass rounded-2xl p-5 border border-white/10 space-y-5">
                        <div className="border-b border-white/5 pb-2">
                          <h4 className="font-display font-bold text-sm text-white">Interactive Questions Modal</h4>
                          <p className="text-xs text-slate-400">Up to 2 customized text questions shown when a user clicks the support button</p>
                        </div>

                        {/* Question #1 Card */}
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                          <div className="flex items-center justify-between pb-1">
                            <span className="font-mono font-bold text-xs text-white">Question #1</span>
                            <button
                              onClick={() => {
                                setModalQ1Label('');
                                setModalQ1Placeholder('');
                              }}
                              className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                              title="Delete Question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-slate-400 uppercase">QUESTION FIELD LABEL</label>
                              <input
                                type="text"
                                value={modalQ1Label}
                                onChange={(e) => setModalQ1Label(e.target.value)}
                                placeholder="Why are you opening this ticket?"
                                className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-slate-400 uppercase">PLACEHOLDER TEXT</label>
                              <input
                                type="text"
                                value={modalQ1Placeholder}
                                onChange={(e) => setModalQ1Placeholder(e.target.value)}
                                placeholder="Describe your issue..."
                                className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-slate-400 uppercase">Response Box Style:</span>
                              <div className="flex rounded-lg overflow-hidden border border-white/10">
                                <button
                                  type="button"
                                  onClick={() => setModalQ1Style('short')}
                                  className={`px-2.5 py-1 text-[10px] font-bold cursor-pointer transition-colors ${
                                    modalQ1Style === 'short' ? 'bg-white text-black' : 'bg-[#13141d] text-slate-400'
                                  }`}
                                >
                                  Short Box
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModalQ1Style('paragraph')}
                                  className={`px-2.5 py-1 text-[10px] font-bold cursor-pointer transition-colors ${
                                    modalQ1Style === 'paragraph' ? 'bg-white text-black' : 'bg-[#13141d] text-slate-400'
                                  }`}
                                >
                                  Paragraph
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-slate-400 uppercase">Required Question:</span>
                              <button
                                type="button"
                                onClick={() => setModalQ1Required(!modalQ1Required)}
                                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                                  modalQ1Required ? 'bg-emerald-500' : 'bg-slate-700'
                                }`}
                              >
                                <span
                                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                                    modalQ1Required ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Question #2 Card */}
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                          <div className="flex items-center justify-between pb-1">
                            <span className="font-mono font-bold text-xs text-white">Question #2</span>
                            <button
                              onClick={() => {
                                setModalQ2Label('');
                                setModalQ2Placeholder('');
                              }}
                              className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                              title="Delete Question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-slate-400 uppercase">QUESTION FIELD LABEL</label>
                              <input
                                type="text"
                                value={modalQ2Label}
                                onChange={(e) => setModalQ2Label(e.target.value)}
                                placeholder="Discord Username"
                                className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-slate-400 uppercase">PLACEHOLDER TEXT</label>
                              <input
                                type="text"
                                value={modalQ2Placeholder}
                                onChange={(e) => setModalQ2Placeholder(e.target.value)}
                                placeholder="e.g. user_x"
                                className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-slate-400 uppercase">Response Box Style:</span>
                              <div className="flex rounded-lg overflow-hidden border border-white/10">
                                <button
                                  type="button"
                                  onClick={() => setModalQ2Style('short')}
                                  className={`px-2.5 py-1 text-[10px] font-bold cursor-pointer transition-colors ${
                                    modalQ2Style === 'short' ? 'bg-white text-black' : 'bg-[#13141d] text-slate-400'
                                  }`}
                                >
                                  Short Box
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModalQ2Style('paragraph')}
                                  className={`px-2.5 py-1 text-[10px] font-bold cursor-pointer transition-colors ${
                                    modalQ2Style === 'paragraph' ? 'bg-white text-black' : 'bg-[#13141d] text-slate-400'
                                  }`}
                                >
                                  Paragraph
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-slate-400 uppercase">Required Question:</span>
                              <button
                                type="button"
                                onClick={() => setModalQ2Required(!modalQ2Required)}
                                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                                  modalQ2Required ? 'bg-emerald-500' : 'bg-slate-700'
                                }`}
                              >
                                <span
                                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                                    modalQ2Required ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Panel Preview */}
                      <div className="space-y-4">
                        <div className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-white">
                            <Eye className="w-4 h-4 text-slate-400" />
                            <span>Discord Panel Preview</span>
                          </div>
                          <p className="text-[10px] text-slate-500">Simulated embed preview of the panel card</p>
                          <div className="bg-[#2b2d31] rounded-xl p-3 border-l-4 border-[#5865F2] text-xs space-y-2">
                            <div className="text-[10px] text-slate-400 font-semibold">{ticketAuthorName || 'Obsidian Security'}</div>
                            <h4 className="font-bold text-white text-xs">{ticketPanelTitle || 'Obsidian Ticket Support'}</h4>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              {ticketPanelDesc || 'Need help? Click the button below to open a ticket and talk to our support staff.'}
                            </p>
                            <div className="pt-1">
                              <button className="px-3 py-1.5 rounded bg-[#5865F2] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                                <span>{ticketButtonEmoji || '✉'}</span>
                                <span>{ticketButtonText || 'Create Ticket'}</span>
                              </button>
                            </div>
                            <div className="text-[9px] text-slate-500 pt-1 border-t border-white/5">
                              {ticketFooterText || 'Obsidian Security • Transcripts expire in 30 days'}
                            </div>
                          </div>
                        </div>

                        <div className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Transcript Hosting Notice</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Ticket transcripts are saved in Gzip compressed format on the bot database server. Links can be viewed online for <strong className="text-white">30 days</strong> before expiring.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 5: TRANSCRIPTS (Screenshot 519) */}
                  {ticketSubTab === 'transcripts' && (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                      <div className="xl:col-span-2 liquid-glass rounded-2xl p-5 border border-white/10 space-y-4">
                        <div className="border-b border-white/5 pb-2">
                          <h4 className="font-display font-bold text-sm text-white">Historical Database</h4>
                          <p className="text-xs text-slate-400">Comprehensive logs of all operational ticket cycles. 0 total transcript files archived.</p>
                        </div>

                        <div className="py-12 px-4 rounded-xl border border-dashed border-white/10 text-center space-y-2">
                          <FileText className="w-8 h-8 text-slate-500 mx-auto" />
                          <h5 className="font-display font-bold text-xs text-white">No closed ticket transcripts logged yet.</h5>
                          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                            Transcripts will automatically generate and stream here when staff or members close active tickets.
                          </p>
                        </div>
                      </div>

                      {/* Right Panel Preview */}
                      <div className="space-y-4">
                        <div className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-white">
                            <Eye className="w-4 h-4 text-slate-400" />
                            <span>Discord Panel Preview</span>
                          </div>
                          <p className="text-[10px] text-slate-500">Simulated embed preview of the panel card</p>
                          <div className="bg-[#2b2d31] rounded-xl p-3 border-l-4 border-[#5865F2] text-xs space-y-2">
                            <div className="text-[10px] text-slate-400 font-semibold">{ticketAuthorName || 'Obsidian Security'}</div>
                            <h4 className="font-bold text-white text-xs">{ticketPanelTitle || 'Obsidian Ticket Support'}</h4>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              {ticketPanelDesc || 'Need help? Click the button below to open a ticket and talk to our support staff.'}
                            </p>
                            <div className="pt-1">
                              <button className="px-3 py-1.5 rounded bg-[#5865F2] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                                <span>{ticketButtonEmoji || '✉'}</span>
                                <span>{ticketButtonText || 'Create Ticket'}</span>
                              </button>
                            </div>
                            <div className="text-[9px] text-slate-500 pt-1 border-t border-white/5">
                              {ticketFooterText || 'Obsidian Security • Transcripts expire in 30 days'}
                            </div>
                          </div>
                        </div>

                        <div className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Transcript Hosting Notice</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Ticket transcripts are saved in Gzip compressed format on the bot database server. Links can be viewed online for <strong className="text-white">30 days</strong> before expiring.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 6: SECURITY CONTROLS (Screenshot 521) */}
                  {ticketSubTab === 'security' && (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                      <div className="xl:col-span-2 liquid-glass rounded-2xl p-5 border border-white/10 space-y-4">
                        <div className="border-b border-white/5 pb-2">
                          <h4 className="font-display font-bold text-sm text-white">Security Controls & Claims Reset</h4>
                          <p className="text-xs text-slate-400">Perform critical administration tasks and purge logs.</p>
                        </div>

                        <div className="space-y-4 pt-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="space-y-0.5">
                              <span className="font-display font-bold text-xs text-white">Reset Active Ticket Claims</span>
                              <p className="text-[11px] text-slate-400">
                                Reset claim statistics for all staff members. Active claimed tickets will revert back to unassigned.
                              </p>
                            </div>
                            <button
                              onClick={() => alert('Active ticket claims reset to default unassigned.')}
                              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer transition-colors shrink-0"
                            >
                              Reset Claims
                            </button>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
                            <div className="space-y-0.5">
                              <span className="font-display font-bold text-xs text-rose-300">Purge Transcript Records</span>
                              <p className="text-[11px] text-slate-400">
                                Permanently wipe all archived closed ticket transcripts and hosted HTML links for this server.
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to permanently purge all transcripts for this server?')) {
                                  alert('Transcript database purged successfully.');
                                }
                              }}
                              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer transition-colors shrink-0"
                            >
                              Purge Database
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right Panel Preview */}
                      <div className="space-y-4">
                        <div className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-white">
                            <Eye className="w-4 h-4 text-slate-400" />
                            <span>Discord Panel Preview</span>
                          </div>
                          <p className="text-[10px] text-slate-500">Simulated embed preview of the panel card</p>
                          <div className="bg-[#2b2d31] rounded-xl p-3 border-l-4 border-[#5865F2] text-xs space-y-2">
                            <div className="text-[10px] text-slate-400 font-semibold">{ticketAuthorName || 'Obsidian Security'}</div>
                            <h4 className="font-bold text-white text-xs">{ticketPanelTitle || 'Obsidian Ticket Support'}</h4>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              {ticketPanelDesc || 'Need help? Click the button below to open a ticket and talk to our support staff.'}
                            </p>
                            <div className="pt-1">
                              <button className="px-3 py-1.5 rounded bg-[#5865F2] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                                <span>{ticketButtonEmoji || '✉'}</span>
                                <span>{ticketButtonText || 'Create Ticket'}</span>
                              </button>
                            </div>
                            <div className="text-[9px] text-slate-500 pt-1 border-t border-white/5">
                              {ticketFooterText || 'Obsidian Security • Transcripts expire in 30 days'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}


          {/* ======================================================== */}
          {/* TAB: SERVER VERIFICATION GATE */}
          {/* ======================================================== */}
          {activeModule === 'verification' && (
            <div className="space-y-6 animate-fade-in-up">
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
                      setVerifyGateTitle('🛡️ Server Verification Gate');
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
                      setVerifyGateTitle('🧩 Captcha Security Challenge');
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
                      placeholder="e.g. 🛡️ Server Verification Gate"
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
                        placeholder="e.g. ✅ or 🛡️"
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
                    className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold text-xs shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
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
              className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold text-sm shadow-xl transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>Saving to Bot Shards...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Configuration Saved Live!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-black" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </main>

        {/* Right Column: Live Discord Message Preview (Screenshot 4) */}
        {((activeModule === 'welcomer' && welcomerSubTab === 'messages') ||
          ['embed_builder', 'message_sender', 'verification'].includes(activeModule)) && (
          <aside className="w-full lg:w-96 bg-[#08080c] border-l border-white/5 p-5 shrink-0 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between pb-2">
            <span className="font-orbitron font-bold text-xs tracking-wider text-slate-300 uppercase">
              {activeModule === 'tickets'
                ? 'Ticket Panel Preview'
                : activeModule === 'verification'
                ? 'Verification Gate Preview'
                : (activeModule === 'embed_builder' || activeModule === 'message_sender')
                ? 'Message Sender Preview'
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
                    <span>{ticketButtonEmoji || '✉️'}</span>
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
                        {renderPreview(verifyGateTitle) || '🛡️ Server Verification Gate'}
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
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-200 text-xs font-semibold text-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
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
          ) : (activeModule === 'embed_builder' || activeModule === 'message_sender') ? (
            /* Message Sender Live Discord Preview (Completely Independent from Welcomer!) */
            <div className="space-y-3">
              <div className="bg-[#313338] rounded-2xl p-4 shadow-2xl font-sans text-slate-200 text-xs">
                {/* Discord Message Header */}
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white shrink-0 overflow-hidden shadow-sm">
                    <img
                      src={
                        senderWebhookAvatar
                          ? senderWebhookAvatar
                          : 'https://cdn.discordapp.com/embed/avatars/0.png'
                      }
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white text-xs">
                        {senderWebhookName || 'DexterCorp'}
                      </span>
                      <span className="px-1 py-0.2 rounded bg-[#5865F2] text-[9px] font-bold text-white uppercase tracking-wider">
                        {senderWebhookName ? 'WEBHOOK' : 'BOT'}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">Today at 02:30 AM</span>
                    </div>

                    {/* Pre-Message Content Outside Embed */}
                    {senderPreMessage && (
                      <div className="mt-1 text-slate-200 text-xs">
                        <DiscordFormattedText text={renderPreview(senderPreMessage)} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Discord Embed Card with custom accent color */}
                <div
                  className={`ml-12 rounded-lg bg-[#2b2d31] p-3 text-xs space-y-2 border-l-4 shadow-md overflow-hidden ${
                    senderSpoiler ? 'blur-sm hover:blur-none transition-all cursor-pointer' : ''
                  }`}
                  style={{ borderLeftColor: senderEmbedColor || '#ff0033' }}
                >
                  {/* Author Header */}
                  {senderAuthorName && (
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-300">
                      {senderAuthorIcon && (
                        <img
                          src={
                            senderAuthorIcon.includes('server') || senderAuthorIcon.includes('guild')
                              ? guild?.icon || 'https://cdn.discordapp.com/embed/avatars/0.png'
                              : senderAuthorIcon
                          }
                          alt="Author Icon"
                          className="w-4 h-4 rounded-full object-cover"
                        />
                      )}
                      <span>{renderPreview(senderAuthorName)}</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      {senderEmbedTitle && (
                        <h4 className="font-bold text-white text-xs">
                          <DiscordFormattedText text={renderPreview(senderEmbedTitle)} />
                        </h4>
                      )}
                      {senderEmbedDesc && (
                        <div className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                          <DiscordFormattedText text={renderPreview(senderEmbedDesc)} />
                        </div>
                      )}
                    </div>

                    {senderThumbnailUrl && (
                      <div className="w-12 h-12 rounded-md overflow-hidden shrink-0 border border-black/40">
                        <img
                          src={
                            senderThumbnailUrl.includes('server') || senderThumbnailUrl.includes('guild')
                              ? guild?.icon || 'https://cdn.discordapp.com/embed/avatars/0.png'
                              : senderThumbnailUrl
                          }
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Divider Line */}
                  {senderShowDivider && <hr className="border-white/10 my-1.5" />}

                  {/* Main Banner Image */}
                  {senderImageUrl && (
                    <div className="rounded-md overflow-hidden max-h-40 border border-black/30 mt-2">
                      <img src={senderImageUrl} alt="Banner" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Footer */}
                  {senderFooterText && (
                    <div className="flex items-center gap-1.5 pt-1 text-[10px] text-slate-400">
                      {senderFooterIcon && (
                        <img
                          src={
                            senderFooterIcon.includes('server') || senderFooterIcon.includes('guild')
                              ? guild?.icon || 'https://cdn.discordapp.com/embed/avatars/0.png'
                              : senderFooterIcon
                          }
                          alt="Footer Icon"
                          className="w-3.5 h-3.5 rounded-full object-cover"
                        />
                      )}
                      <span>{renderPreview(senderFooterText)}</span>
                    </div>
                  )}
                </div>

                {/* Discord Link Action Buttons in Preview */}
                {(senderButtons || []).length > 0 && (
                  <div className="ml-12 flex flex-wrap gap-2 mt-2 pt-1">
                    {(senderButtons || []).map((btn) => (
                      <div
                        key={btn.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2b2d31] hover:bg-[#35373c] text-slate-200 text-[11px] font-medium border border-white/5 shadow-sm transition-colors cursor-pointer select-none"
                      >
                        {renderDiscordEmojiInline(btn.emoji)}
                        <span>{btn.label || 'Link'}</span>
                        <span className="text-[10px] text-slate-400">↗</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Sender Send Button */}
              <div className="pt-2">
                <button
                  onClick={handleSendMessageSender}
                  disabled={senderSending}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {senderSending
                      ? 'Dispatching...'
                      : senderSent
                      ? '✓ Dispatched to #' + (availableChannels.find((c) => c.id === senderChannel)?.name || senderChannel)
                      : 'Send to #' + (availableChannels.find((c) => c.id === senderChannel)?.name || senderChannel)}
                  </span>
                </button>
              </div>
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
                            (thumbnailUrl || '').includes('user') || (thumbnailUrl || '').includes('avatar')
                              ? user?.avatar
                                ? user.avatar.startsWith('http')
                                  ? user.avatar
                                  : `https://cdn.discordapp.com/avatars/${user?.id || '0'}/${user.avatar}.png`
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
                            (footerIconUrl || '').includes('server') || (footerIconUrl || '').includes('guild')
                              ? guild?.icon || 'https://cdn.discordapp.com/embed/avatars/0.png'
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
                {(welcomerButtons || []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(welcomerButtons || []).map((btn, bIdx) => (
                      <div
                        key={bIdx}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2b2d31] hover:bg-[#35373c] text-slate-200 text-[11px] font-medium border border-white/5 shadow-sm transition-colors cursor-pointer select-none"
                      >
                        {btn?.emoji && <span>{btn.emoji}</span>}
                        <span>{btn?.label || 'Link'}</span>
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
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-200 text-black text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
                >
                  <Send className="w-3.5 h-3.5 text-black" />
                  <span>
                    {testSent ? '✓ Sent Test Message to #' + targetChannel : 'Send Test Message'}
                  </span>
                </button>
              </div>
            </div>
          )}
          </aside>
        )}
      </div>

      {/* Variables Guide Modal */}
      {showVariablesGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#0a0c10] border border-white/10 rounded-2xl p-6 text-left shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <h3 className="font-display font-bold text-sm text-white">Variables Guide</h3>
              <button
                onClick={() => setShowVariablesGuide(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <code className="text-white font-mono font-bold">{'{user}'}</code>
                <p className="text-slate-400 text-[11px] mt-0.5">Mentions the joining member.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <code className="text-white font-mono font-bold">{'{server_name}'}</code>
                <p className="text-slate-400 text-[11px] mt-0.5">The current server's name.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <code className="text-white font-mono font-bold">{'{server_membercount}'}</code>
                <p className="text-slate-400 text-[11px] mt-0.5">Total member count after joining.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <code className="text-white font-mono font-bold">{'{user_avatar}'}</code>
                <p className="text-slate-400 text-[11px] mt-0.5">Direct URL to user avatar picture.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <code className="text-white font-mono font-bold">{'{server_icon}'}</code>
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
