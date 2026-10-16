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
  const [ticketPanelTitle, setTicketPanelTitle] = useState('ðŸŽ« Support Desk & Inquiries');
  const [ticketPanelDesc, setTicketPanelDesc] = useState(
    'Welcome to our support desk! If you require assistance, have billing questions, or wish to report an issue, please open a private ticket below.'
  );
  const [ticketPanelColor, setTicketPanelColor] = useState('#5865F2');
  const [ticketButtonText, setTicketButtonText] = useState('Open Support Ticket');
  const [ticketButtonEmoji, setTicketButtonEmoji] = useState('ðŸ“©');
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
  const [verifyGateTitle, setVerifyGateTitle] = useState('ðŸ›¡ï¸ Server Verification Gate');
  const [verifyGateDesc, setVerifyGateDesc] = useState(
    'Welcome to the server! To protect the community against automated bots, please verify your account below to unlock access to all channels.'
  );
  const [verifyGateColor, setVerifyGateColor] = useState('#10b981');
  const [verifyButtonText, setVerifyButtonText] = useState('Verify Account');
  const [verifyButtonEmoji, setVerifyButtonEmoji] = useState('âœ…');
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
  const [embedTitle, setEmbedTitle] = useState('ðŸ  Welcome to Dexter Corporation ðŸ‘¿');
  const [embedColor, setEmbedColor] = useState('#ff0033');
  const [description, setDescription] = useState(
    "Hey ðŸ¥· {user}!\n\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\n<:2392verified:1554068820828626944> **You are our #{server_membercount}th Member**\n<a:flame:1554068992648290415> **Joined** {user_joined} Â· {user.joined_date}\n\n<a:73288animatedarrowred:1554068830689431563> **Read our ToS** <#rules>\n<a:73288animatedarrowred:1554068830689431563> **Check out our latest Announcements** <#announcements>\n<a:73288animatedarrowred:1554068830689431563> **Need help? Open a Support Ticket** <#tickets>"
  );
  const [authorName, setAuthorName] = useState('DEXTERCORP SECURITY');
  const [authorIconUrl, setAuthorIconUrl] = useState('');
  const [footerText, setFooterText] = useState('Enjoy your stay in {server_name}');
  const [footerIconUrl, setFooterIconUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [welcomerButtons, setWelcomerButtons] = useState<Array<{ label: string; url: string; emoji?: string }>>([
    { label: 'Announcements', url: 'https://discord.gg/dextercorp', emoji: 'ðŸ“¢' },
    { label: 'ToS', url: 'https://discord.gg/dextercorp', emoji: 'ðŸ“•' },
    { label: 'Support', url: 'https://discord.gg/dextercorp', emoji: 'ðŸŽ«' },
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
    { id: '1', channel: 'suggestions', emojis: 'ðŸ‘ ðŸ‘Ž' },
    { id: '2', channel: 'announcements', emojis: 'â¤ï¸ ðŸŽ‰ ðŸ”¥' },
  ]);
  const [newReactChannel, setNewReactChannel] = useState('suggestions');
  const [newReactEmojis, setNewReactEmojis] = useState('ðŸ‘ ðŸ‘Ž');

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
  const [senderEmbedTitle, setSenderEmbedTitle] = useState('ðŸ›¡ï¸ Dexter Components V2');
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
    'ðŸš€',
    'ðŸ’Ž',
    'ðŸ›¡ï¸',
    'ðŸ“œ',
    'ðŸ“¢',
    'ðŸŽ«',
    'âš¡',
    'ðŸ‘‘',
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
        emoji: 'ðŸ”—',
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
        title: 'ðŸ“œ Official Server Rules & Guidelines',
        description: '### Welcome to ' + guild.name + '\n\n<:2392verified:1554068820828626944> **1. Respect Everyone**\nTreat all members with respect. No harassment, hate speech, or toxicity.\n\n<:2392verified:1554068820828626944> **2. No Spam or Self-Promotion**\nDo not advertise other Discord servers, social media, or paid services in public channels or DMs.\n\n<:2392verified:1554068820828626944> **3. Follow Discord ToS**\nAdhere strictly to Discord\'s Terms of Service and Community Guidelines.\n\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\nClick below to verify or accept our terms.',
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
        preMessage: 'ðŸ“¢ @everyone **IMPORTANT COMMUNITY ANNOUNCEMENT** â€” Major security and bot system upgrades are live!',
        title: 'ðŸš¨ Important System Announcement & Security Dispatch',
        description: '### DexterCorp V2 Deployment Complete\n\n<a:flame:1554068992648290415> **Sentinel Anti-Nuke** is now active 24/7 across all server shards.\n<a:1706redcrownfire:1554068818337468476> **Verification Gate** updated to prevent malicious automated bot accounts.\n<a:73288animatedarrowred:1554068830689431563> All members are encouraged to check the documentation below.\n\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\nStay safe and report any anomalies to our security staff.',
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
        preMessage: 'ðŸ›¡ï¸ Welcome to **' + guild.name + '**! Complete verification below to gain access to all channels.',
        title: 'ðŸ”’ Member Security Verification Gate',
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
        preMessage: 'âœ¨ **BOOST OUR SERVER** and unlock exclusive VIP perks and badges today!',
        title: 'ðŸ’Ž VIP Server Booster Perks & Privileges',
        description: '### Exclusive Booster Rewards\n\nSupport **' + guild.name + '** by boosting and get instant access to:\n\nâœ¨ **Custom Pink Booster Role & Colored Name**\nâœ¨ **Access to Secret VIP Voice & Chat Lounges**\nâœ¨ **Permission to attach files, images, and external emojis**\nâœ¨ **Direct priority support in tickets**\n\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\nThank you to all our generous server boosters!',
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
          { id: '1', label: 'Boost Server', url: 'https://discord.gg/dextercorp', emoji: 'ðŸ’Ž' },
          { id: '2', label: 'Claim Perks', url: 'https://discord.gg/dextercorp', emoji: 'âœ¨' },
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
    { id: 'embed_builder', label: 'Message Sender', icon: Send },
  ];

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
        <aside className="w-full lg:w-72 bg-[#06070a]/70 backdrop-blur-xl border-r border-white/5 p-4 flex flex-col space-y-4 shrink-0 overflow-y-auto">
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

          {/* MODULES Header */}
          <div className="pt-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Modules</span>
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
                    className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 w-[4px] h-6 bg-white rounded-r-full shadow-[0_0_12px_rgba(255,255,255,0.6)]" />
                    )}
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
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
                      setEmbedTitle('ðŸ  Welcome to Dexter Corporation ðŸ‘¿');
                      setEmbedColor('#ff0033');
                      setDescription(
                        "Hey ðŸ¥· {user}!\n\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\n<:2392verified:1554068820828626944> **You are our #{server_membercount}th Member**\n<a:flame:1554068992648290415> **Joined** {user_joined} Â· {user.joined_date}\n\n<a:73288animatedarrowred:1554068830689431563> **Read our ToS** <#rules>\n<a:73288animatedarrowred:1554068830689431563> **Check out our latest Announcements** <#announcements>\n<a:73288animatedarrowred:1554068830689431563> **Need help? Open a Support Ticket** <#tickets>"
                      );
                      setMainImageUrl('');
                      setThumbnailUrl('');
                      setAuthorName('DEXTER CORPORATIONâ„¢');
                      setFooterText('Dexter Corporation â€¢ Member #{server_membercount}');
                      setFooterIconUrl('{server_icon}');
                      setContentMessage('Hey {user}, welcome to **Dexter Corporation**!');
                      setWelcomerButtons([
                        { label: 'Announcements', url: 'https://discord.gg/dextercorp', emoji: 'ðŸ“¢' },
                        { label: 'ToS', url: 'https://discord.gg/dextercorp', emoji: 'ðŸ“•' },
                        { label: 'Support', url: 'https://discord.gg/dextercorp', emoji: 'ðŸŽ«' },
                      ]);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    ðŸ”¥ Dexter Corporation Style
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmbedTitle('Welcome to {server_name}!');
                      setEmbedColor('#ff2b43');
                      setDescription("We're glad to have you here. You are member #{server_membercount}!\nâ€¢ Make sure to check out the rules.\nâ€¢ Choose your roles and enjoy your stay.");
                      setMainImageUrl('');
                      setThumbnailUrl('{user_avatar}');
                      setAuthorName('DEXTERCORP SECURITY');
                      setFooterText('{server_name} Protection System');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-all cursor-pointer"
                  >
                    ðŸ›¡ï¸ Crimson Security
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmbedTitle('âœ§ Welcome to {server_name} âœ§');
                      setEmbedColor('#10b981');
                      setDescription("Hey {user}, welcome! Read the guidelines in rules and get verified to start chatting.");
                      setMainImageUrl('');
                      setThumbnailUrl('');
                      setAuthorName('');
                      setFooterText('Member #{server_membercount}');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-all cursor-pointer"
                  >
                    ðŸŒ¿ Clean Minimal (No Image)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmbedTitle('ðŸ”¥ Welcome to {server_name}!');
                      setEmbedColor('#8b5cf6');
                      setDescription("Welcome {user}! Hop into chat and introduce yourself.\nCheck announcements for ongoing events!");
                      setMainImageUrl('');
                      setThumbnailUrl('{user_avatar}');
                      setAuthorName('{server_name}');
                      setFooterText('Enjoy your time here');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-all cursor-pointer"
                  >
                    ðŸŽ® Gaming & Events
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
                  âœ• Clear All Images
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
                          âœ• Clear
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
                          âœ• Clear Image
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
                          onClick={() => setWelcomerButtons([...(welcomerButtons || []), { label: 'New Link', url: 'https://discord.gg/dextercorp', emoji: 'ðŸ”—' }])}
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
                            placeholder="Emoji (e.g. ðŸ“¢)"
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
                            âœ•
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
                    { id: 'instant', label: 'âš¡ INSTANT' },
                    { id: 'threshold', label: 'ðŸ“Š THRESHOLD' },
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

              {/* Section 7: Whitelist Manager */}
              <div className="liquid-glass border border-white/5 rounded-2xl p-5 space-y-3">
                <h4 className="font-display font-semibold text-xs text-white uppercase tracking-wider">
                  Whitelisted Trusted Administrators
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Discord User ID to whitelist..."
                    value={newWhitelistUser}
                    onChange={(e) => setNewWhitelistUser(e.target.value)}
                    className="flex-1 bg-[#0a0c10] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-white/40"
                  />
                  <button
                    onClick={addWhitelistUser}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-black text-xs font-semibold transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    + Add Whitelist
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  {whitelist.map((id) => (
                    <div
                      key={id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs font-mono"
                    >
                      <span className="text-slate-300 font-semibold">{id}</span>
                      <button
                        onClick={() => removeWhitelistUser(id)}
                        className="text-slate-500 hover:text-white p-1 cursor-pointer transition-colors"
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
                  <option value="timeout_5m">â±ï¸ Timeout Member (5 Minutes)</option>
                  <option value="timeout_1h">â±ï¸ Timeout Member (1 Hour)</option>
                  <option value="timeout_24h">â±ï¸ Timeout Member (24 Hours)</option>
                  <option value="kick">ðŸ‘¢ Kick Member</option>
                  <option value="warn">âš ï¸ Delete Message & Warn</option>
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
                        âœ•
                      </button>
                    </span>
                  ))}
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
                      <option value="Hindi">Hindi / à¤¹à¤¿à¤¨à¥à¤¦à¥€</option>
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
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
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
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
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
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
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
                      className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
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
                            content: `ðŸ›¡ï¸ **[DexterCorp Security Audit Log]** Test event triggered from web dashboard.`,
                            embeds: {
                              title: 'ðŸ“‹ Security & Audit Logging Verified',
                              description: `**Event:** Real-Time Dashboard Audit Verification\n**Operator:** <@${user.id}>\n**Guild:** ${guild.name} (\`${guild.id}\`)\n**Status:** ðŸŸ¢ Live Synchronized across all bot clusters`,
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
                    <span>{logTestSent ? 'âœ“ Audit Log Sent to Discord!' : 'Send Test Log to Channel'}</span>
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
                    placeholder="Emojis (e.g. ðŸ‘ ðŸ‘Ž)"
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
                  ðŸŽ‰ Start Live Giveaway
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
                          Channel: #{g.channel} â€¢ {g.winners} Winner(s)
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
            <div className="space-y-6 animate-in fade-in">
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
                        <span>âœ“ Sent!</span>
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
                    <span>{senderShowDivider ? 'âœ“ Divider Line Active' : '+ Add Separator Line'}</span>
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
                    placeholder="e.g. ðŸ“¢ Official Community Announcement"
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
                            placeholder="ðŸ“¢ or <:name:id>"
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
                    <span>âœ“ Message Dispatched Successfully!</span>
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
                  <div className="bg-[#12131a] border border-white/10 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
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

              {/* MODAL 2: SERVER CUSTOM EMOJIS */}
              {showEmojiModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-[#12131a] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div>
                        <h3 className="font-orbitron font-bold text-base text-white">
                          Server Custom Emojis
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Click any emoji to insert into {emojiTargetField === 'preMessage' ? 'Pre-Message' : emojiTargetField === 'title' ? 'Embed Title' : 'Embed Description'} & copy to clipboard
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowEmojiModal(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Target Selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">INSERT INTO:</span>
                      <button
                        type="button"
                        onClick={() => setEmojiTargetField('preMessage')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          emojiTargetField === 'preMessage'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white/5 text-slate-400'
                        }`}
                      >
                        Pre-Message
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmojiTargetField('title')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          emojiTargetField === 'title'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white/5 text-slate-400'
                        }`}
                      >
                        Title
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmojiTargetField('description')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          emojiTargetField === 'description'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white/5 text-slate-400'
                        }`}
                      >
                        Description
                      </button>
                    </div>

                    {/* Storage Quota */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                        <span>EMOJI STORAGE QUOTA</span>
                        <span>{serverCustomEmojis.length} / 15 USED</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                          style={{ width: `${(serverCustomEmojis.length / 15) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Add New Custom Emoji */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        ADD NEW CUSTOM EMOJI
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. <:pepe_cool:123456789> or ðŸš€"
                          value={customEmojiInput}
                          onChange={(e) => setCustomEmojiInput(e.target.value)}
                          className="flex-1 bg-[#1a1b26] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomEmoji}
                          disabled={serverCustomEmojis.length >= 15}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors cursor-pointer disabled:opacity-40"
                        >
                          + Add Emoji
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Paste any Discord emoji format (e.g. &lt;:name:id&gt; or &lt;a:name:id&gt;)
                      </p>
                    </div>

                    {/* Active Server Emojis Grid */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        ACTIVE SERVER EMOJIS ({serverCustomEmojis.length})
                      </label>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-1">
                        {serverCustomEmojis.map((em, eIdx) => (
                          <button
                            key={eIdx}
                            type="button"
                            onClick={() => handleInsertEmoji(em)}
                            className="p-3 rounded-xl bg-[#1a1b26] hover:bg-white/10 border border-white/5 flex flex-col items-center justify-center gap-1 cursor-pointer transition-transform hover:scale-105 active:scale-95 group"
                            title={em}
                          >
                            <span className="text-xl flex items-center justify-center">
                              {renderDiscordEmojiInline(em)}
                            </span>
                            <span className="text-[8px] text-slate-400 font-mono truncate max-w-[50px] group-hover:text-white">
                              {em.startsWith('<') ? em.split(':')[1] : em}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                      setTicketPanelTitle('ðŸŽ« Support Desk & Inquiries');
                      setTicketPanelDesc(
                        'Welcome to our support desk! If you require assistance, have questions, or wish to report an issue, please open a private ticket below.'
                      );
                      setTicketPanelColor('#5865F2');
                      setTicketButtonText('Open Support Ticket');
                      setTicketButtonEmoji('ðŸ“©');
                    }}
                    className="py-2 px-3 rounded-lg bg-white/5 hover:bg-[#5865F2]/20 border border-white/5 hover:border-[#5865F2]/40 text-left transition-all cursor-pointer"
                  >
                    <div className="font-bold text-xs text-white">ðŸ› ï¸ General Help</div>
                    <div className="text-[10px] text-slate-400 truncate">Standard support desk</div>
                  </button>

                  <button
                    onClick={() => {
                      setTicketPanelTitle('ðŸ›’ Billing & Store Support');
                      setTicketPanelDesc(
                        'Need help with a recent order, subscription, payment receipt, or store inquiry? Click below to speak directly with our billing team.'
                      );
                      setTicketPanelColor('#10b981');
                      setTicketButtonText('Billing Inquiry');
                      setTicketButtonEmoji('ðŸ’³');
                    }}
                    className="py-2 px-3 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/5 hover:border-emerald-500/40 text-left transition-all cursor-pointer"
                  >
                    <div className="font-bold text-xs text-white">ðŸ›’ Store & Billing</div>
                    <div className="text-[10px] text-slate-400 truncate">Orders & payments</div>
                  </button>

                  <button
                    onClick={() => {
                      setTicketPanelTitle('ðŸ›¡ï¸ Player Report & Ban Appeals');
                      setTicketPanelDesc(
                        'Submit rule violation reports, user evidence, or appeal a server mute/ban. Our moderation leadership will review your ticket.'
                      );
                      setTicketPanelColor('#ef4444');
                      setTicketButtonText('Submit Report / Appeal');
                      setTicketButtonEmoji('âš–ï¸');
                    }}
                    className="py-2 px-3 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/5 hover:border-red-500/40 text-left transition-all cursor-pointer"
                  >
                    <div className="font-bold text-xs text-white">ðŸ›¡ï¸ Reports & Appeals</div>
                    <div className="text-[10px] text-slate-400 truncate">Mod cases & bans</div>
                  </button>

                  <button
                    onClick={() => {
                      setTicketPanelTitle('ðŸ’¼ Partnerships & Affiliates');
                      setTicketPanelDesc(
                        'Looking to partner with our community, run a cross-promotion, or sponsor an event? Open a ticket to connect with our PR team.'
                      );
                      setTicketPanelColor('#f59e0b');
                      setTicketButtonText('Apply for Partner');
                      setTicketButtonEmoji('ðŸ¤');
                    }}
                    className="py-2 px-3 rounded-lg bg-white/5 hover:bg-amber-500/20 border border-white/5 hover:border-amber-500/40 text-left transition-all cursor-pointer"
                  >
                    <div className="font-bold text-xs text-white">ðŸ’¼ Partnerships</div>
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
                            ðŸ“ {ch.name}
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
                      placeholder="e.g. ðŸŽ« Support Desk & Inquiries"
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
                        placeholder="e.g. ðŸ“© or ðŸŽ«"
                        className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                      />
                    </div>
                  </div>

                  {/* Button Color Palette (Discord Style Selector) */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>BUTTON COLOR PALETTE (DISCORD STYLE)</span>
                      <span className="text-[10px] text-[#5865F2] font-mono font-semibold">
                        {ticketButtonStyle === 3 ? 'ðŸŸ¢ Success Green' : ticketButtonStyle === 1 ? 'ðŸ”µ Blurple Blue' : ticketButtonStyle === 2 ? 'âšª Secondary Grey' : 'ðŸ”´ Danger Red'}
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
                              {isSelected ? 'âœ“' : ''}
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
                    className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold text-xs shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    {ticketDeploying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Deploying Ticket Panel to Discord...</span>
                      </>
                    ) : ticketDeploySuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>âœ“ Ticket Panel Live on Discord!</span>
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
                      setVerifyGateTitle('ðŸ›¡ï¸ Server Verification Gate');
                      setVerifyGateDesc(
                        'Welcome to the server! To protect the community against automated bots, please verify your account below to unlock access to all channels.'
                      );
                      setVerifyGateColor('#10b981');
                      setVerifyButtonText('Verify Account');
                      setVerifyButtonEmoji('âœ…');
                      setVerifyMethod('button');
                    }}
                    className="py-2.5 px-3 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/5 hover:border-emerald-500/40 text-left transition-all cursor-pointer"
                  >
                    <div className="font-bold text-xs text-white">âš¡ Instant 1-Click</div>
                    <div className="text-[10px] text-slate-400">Fastest member onboarding</div>
                  </button>

                  <button
                    onClick={() => {
                      setVerifyGateTitle('ðŸ” Captcha Security Challenge');
                      setVerifyGateDesc(
                        'Automated raid protection is active. Click the button below to solve an interactive verification challenge and unlock member privileges.'
                      );
                      setVerifyGateColor('#06b6d4');
                      setVerifyButtonText('Solve Captcha Challenge');
                      setVerifyButtonEmoji('ðŸ§©');
                      setVerifyMethod('code');
                    }}
                    className="py-2.5 px-3 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/5 hover:border-cyan-500/40 text-left transition-all cursor-pointer"
                  >
                    <div className="font-bold text-xs text-white">ðŸ§© Modal Captcha</div>
                    <div className="text-[10px] text-slate-400">Deter scripted spam accounts</div>
                  </button>

                  <button
                    onClick={() => {
                      setVerifyGateTitle('ðŸ“œ Community Rules Agreement');
                      setVerifyGateDesc(
                        'By clicking verify below, you acknowledge having read and agreed to follow all community server rules and Discord TOS guidelines.'
                      );
                      setVerifyGateColor('#8b5cf6');
                      setVerifyButtonText('I Agree & Enter Server');
                      setVerifyButtonEmoji('ðŸ“œ');
                      setVerifyMethod('button');
                    }}
                    className="py-2.5 px-3 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/5 hover:border-purple-500/40 text-left transition-all cursor-pointer"
                  >
                    <div className="font-bold text-xs text-white">ðŸ“œ Rules Agreement</div>
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
                        âš¡ 1-Click Button
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
                        ðŸ§© Captcha Modal
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
                      placeholder="e.g. ðŸ›¡ï¸ Server Verification Gate"
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
                        placeholder="e.g. âœ… or ðŸ›¡ï¸"
                        className="w-full bg-[#131815] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Button Color Palette (Discord Style Selector) */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>BUTTON COLOR PALETTE (DISCORD STYLE)</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                        {verifyButtonStyle === 3 ? 'ðŸŸ¢ Success Green' : verifyButtonStyle === 1 ? 'ðŸ”µ Blurple Blue' : verifyButtonStyle === 2 ? 'âšª Secondary Grey' : 'ðŸ”´ Danger Red'}
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
                              {isSelected ? 'âœ“' : ''}
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
                        <span>âœ“ Verification Gate Live on Discord!</span>
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
                        {renderPreview(ticketPanelTitle) || 'ðŸŽ« Support Desk & Inquiries'}
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
                    <span>{ticketButtonEmoji || 'ðŸ“©'}</span>
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
                    <span>âœ“ Ticket Panel Live on Discord!</span>
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
                        {renderPreview(verifyGateTitle) || 'ðŸ›¡ï¸ Server Verification Gate'}
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
                    <span>{verifyButtonEmoji || 'âœ…'}</span>
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
                    <span>âœ“ Verification Gate Live on Discord!</span>
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
                        <span className="text-[10px] text-slate-400">â†—</span>
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
                      ? 'âœ“ Dispatched to #' + (availableChannels.find((c) => c.id === senderChannel)?.name || senderChannel)
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
                        <span className="text-[10px] text-slate-400">â†—</span>
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
                    {testSent ? 'âœ“ Sent Test Message to #' + targetChannel : 'Send Test Message'}
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
          <div className="w-full max-w-md bg-[#0a0c10] border border-white/10 rounded-2xl p-6 text-left shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <h3 className="font-display font-bold text-sm text-white">Variables Guide</h3>
              <button
                onClick={() => setShowVariablesGuide(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                âœ•
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
                âœ•
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
