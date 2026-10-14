

















































































































export interface BotStats {
  users: number;
  guilds: number;
  isOnline: boolean;
  ping: number;
  lastUpdated: string;
}

export interface CommandItem {
  name: string;
  description: string;
  category: string;
  usage?: string;
  aliases?: string[];
  permissions?: string;
  cooldown?: number;
  botPerms?: string[];
  userPerms?: string[];
}

export interface GuildRole {
  id: string;
  name: string;
  color: string;
  position: number;
  managed?: boolean;
}

export interface GuildChannel {
  id: string;
  name: string;
  type: number;
  parentId?: string | null;
  position?: number;
}

export interface GuildItem {
  id: string;
  name: string;
  icon: string | null;
  banner?: string | null;
  memberCount: number;
  ownerId: string;
  hasBot: boolean;
  isAdmin?: boolean;
  isOwner?: boolean;
  channelsCount?: number;
  textChannels?: number;
  voiceChannels?: number;
  categoryChannels?: number;
  rolesCount?: number;
  emojisCount?: number;
  boostCount?: number;
  boostTier?: number;
  verificationLevel?: number;
  vanityURLCode?: string | null;
  createdAt?: number;
  joinedAt?: number;
  features?: string[];
  roles?: GuildRole[];
  channels?: GuildChannel[];
  settings?: GuildSettings;
  modules?: {
    antinuke?: boolean;
    automod?: boolean;
    welcome?: boolean;
    autorole?: boolean;
    verification?: boolean;
    logging?: boolean;
    prefix?: string;
  };
}

export interface GuildSettings {
  prefix: string;
  antinuke: {
    enabled: boolean;
    punishment: string;
    antiBan: boolean;
    antiKick: boolean;
    antiChannelDelete: boolean;
    antiRoleDelete: boolean;
    antiBot: boolean;
    antiWebhook: boolean;
    antiVanity: boolean;
    whitelist: string[];
  };
  automod: {
    antiSpam: boolean;
    antiLinks: boolean;
    badWords: boolean;
    massMention: boolean;
    blockedWords: string[];
  };
  welcome: {
    enabled: boolean;
    channelId: string;
    content: string;
    autorole: string;
  };
  verification: {
    enabled: boolean;
    verifiedRole: string;
    unverifiedRole: string;
  };
  logsChannel: string;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  isLoggedIn: boolean;
  isOwner: boolean;
}