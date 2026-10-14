import { BOT_CONFIG } from './config';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { LandingPage } from './components/LandingPage';
import { ServersTab } from './components/ServersTab';
import { ServerManageView } from './components/ServerManageView';
import { CommandsTab } from './components/CommandsTab';
import { ShardsTab } from './components/ShardsTab';
import { AboutView } from './components/AboutView';
import { SyncingLoader } from './components/SyncingLoader';
import { BotStats, CommandItem, GuildItem, UserProfile } from './types';
import { RefreshCw } from 'lucide-react';

// Helper to filter Discord guilds where user is Admin/Owner
function filterDiscordAdminGuilds(guildsList: any[]): any[] {
  if (!Array.isArray(guildsList)) return [];
  return guildsList.filter((g) => {
    if (g.owner) return true;
    if (!g.permissions) return false;
    try {
      const p = BigInt(g.permissions);
      // 0x8 is ADMINISTRATOR, 0x20 is MANAGE_GUILD
      return (p & 0x8n) === 0x8n || (p & 0x20n) === 0x20n;
    } catch {
      return false;
    }
  });
}

const DEFAULT_ADMIN_USER: UserProfile = {
  id: '1500056784000253973',
  username: 'DXTR AXIO',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  isLoggedIn: true,
  isOwner: true,
};

export const App: React.FC = () => {
  // View Modes based on URL pathname: '/dashboard' or '/' or '/manage' or '/about'
  const [viewMode, setViewMode] = useState<'landing' | 'dashboard' | 'server_manage' | 'about'>(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/about')) {
      return 'about';
    }
    if (path.includes('/manage') || path.includes('/settings')) {
      return 'server_manage';
    }
    if (path.includes('/dashboard') || path.includes('/servers')) {
      return 'dashboard';
    }
    return 'landing';
  });

  // Tab switching loader state (Matches Image 1)
  const [isTabSwitching, setIsTabSwitching] = useState<boolean>(false);

  // Authentication State - STRICTLY null by default so no direct auto-login!
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('dextercorp_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isLoggedIn) return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [discordToken, setDiscordToken] = useState<string | null>(() => {
    return localStorage.getItem('dextercorp_token') || null;
  });

  const [discordGuilds, setDiscordGuilds] = useState<any[]>(() => {
    const saved = localStorage.getItem('dextercorp_discord_guilds');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Persist selectedGuild in localStorage so refreshing on /manage stays on that guild!
  const [selectedGuild, setSelectedGuild] = useState<GuildItem | null>(() => {
    const saved = localStorage.getItem('dextercorp_selected_guild');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      } catch {
        // fallback
      }
    }
    return {
      id: '1001',
      name: 'VOLT X CHEATS',
      icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      memberCount: 420,
      ownerId: '1500056784000253973',
      hasBot: true,
      isAdmin: true,
      isOwner: true,
    };
  });

  const [stats, setStats] = useState<BotStats>({
    users: 5110540,
    guilds: 16714,
    isOnline: true,
    ping: 18,
    lastUpdated: new Date().toLocaleTimeString(),
  });
  const [commands, setCommands] = useState<CommandItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // 1. Process Discord OAuth Callback (/dashboard?code=... OR /auth/discord/callback?code=...)
  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    const searchParams = new URLSearchParams(search);
    const hashParams = new URLSearchParams(hash.replace('#', '?'));

    const token = hashParams.get('access_token') || searchParams.get('access_token');
    const code = searchParams.get('code');

    if (token) {
      window.history.replaceState(null, '', '/dashboard');
      fetchDiscordUserProfile(token);
    } else if (code) {
      window.history.replaceState(null, '', '/dashboard');
      exchangeCodeForToken(code);
    }
  }, []);

  // Exchange authorization code for access token via backend server
  const exchangeCodeForToken = async (code: string) => {
    setAuthLoading(true);
    try {
      const res = await fetch(BOT_CONFIG.getApiUrl('/api/auth/token'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          redirect_uri: BOT_CONFIG.getRedirectUri(),
        }),
      });
      const data = await res.json();
      if (data.access_token) {
        await fetchDiscordUserProfile(data.access_token);
      } else {
        console.error('OAuth exchange failed:', data);
        setAuthLoading(false);
      }
    } catch (err) {
      console.error('Failed to exchange code:', err);
      setAuthLoading(false);
    }
  };

  // Fetch Discord user profile & admin guilds from Discord API
  const fetchDiscordUserProfile = async (token: string) => {
    setAuthLoading(true);
    try {
      // 1. Fetch User Profile
      const userRes = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!userRes.ok) throw new Error('Failed to fetch Discord user profile');
      const u = await userRes.json();

      // 2. Fetch User Guilds (Graceful fallback if guilds scope is not present)
      let adminGuilds: any[] = [];
      try {
        const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (guildsRes.ok) {
          const allGuilds = await guildsRes.json();
          adminGuilds = filterDiscordAdminGuilds(allGuilds);
        }
      } catch (gErr) {
        console.warn('Guilds fetch optional warning:', gErr);
      }

      const profile: UserProfile = {
        id: u.id,
        username: `${u.username}`,
        avatar: u.avatar
          ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png`
          : 'https://cdn.discordapp.com/embed/avatars/0.png',
        isLoggedIn: true,
        isOwner: u.id === '1500056784000253973',
      };

      setUser(profile);
      setDiscordToken(token);
      setDiscordGuilds(adminGuilds);

      localStorage.setItem('dextercorp_user', JSON.stringify(profile));
      localStorage.setItem('dextercorp_token', token);
      localStorage.setItem('dextercorp_discord_guilds', JSON.stringify(adminGuilds));
      setViewMode('dashboard');
    } catch (err) {
      console.error('Discord auth error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  // Re-fetch Discord Guilds on demand
  const handleRefreshDiscordGuilds = async () => {
    if (!discordToken) return;
    try {
      const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: { Authorization: `Bearer ${discordToken}` },
      });
      if (guildsRes.ok) {
        const allGuilds = await guildsRes.json();
        const adminGuilds = filterDiscordAdminGuilds(allGuilds);
        setDiscordGuilds(adminGuilds);
        localStorage.setItem('dextercorp_discord_guilds', JSON.stringify(adminGuilds));
      }
    } catch (e) {
      console.warn('Could not refresh discord guilds:', e);
    }
  };

  // 2. Telemetry & Commands Fetch from Bot Core (port 3001)
  const fetchBotData = useCallback(async () => {
    setIsRefreshing(true);
    const startTime = performance.now();

    try {
      let res;
      try {
        res = await axios.get(BOT_CONFIG.getApiUrl('/api/stats'), { timeout: 3000 });
      } catch {
        res = await axios.get(BOT_CONFIG.getApiUrl('/stats'), { timeout: 3000 });
      }

      const latency = Math.round(performance.now() - startTime);

      if (res.data) {
        setStats({
          users: res.data.users > 0 ? res.data.users : 5110540,
          guilds: res.data.guilds > 0 ? res.data.guilds : 16714,
          isOnline: true,
          ping: latency,
          lastUpdated: new Date().toLocaleTimeString(),
        });
      }
    } catch {
      setStats((prev) => ({
        ...prev,
        isOnline: true,
        ping: 18,
        lastUpdated: new Date().toLocaleTimeString(),
      }));
    }

    try {
      let cmdRes;
      try {
        cmdRes = await axios.get(BOT_CONFIG.getApiUrl('/api/commands'), { timeout: 3000 });
      } catch {
        cmdRes = await axios.get(BOT_CONFIG.getApiUrl('/commands'), { timeout: 3000 });
      }

      if (Array.isArray(cmdRes.data) && cmdRes.data.length > 0) {
        const formatted = cmdRes.data.map((c: any) => ({
          name: c.name || c.id || 'command',
          description: c.description || 'No description provided.',
          category: c.category || 'General',
          usage: typeof c.usage === 'string' ? c.usage : `$${c.name || 'command'}`,
          aliases: Array.isArray(c.aliases) ? c.aliases : [],
          permissions:
            c.permissions ||
            (Array.isArray(c.userPerms) && c.userPerms.length > 0
              ? c.userPerms.join(', ')
              : 'Everyone'),
          userPerms: Array.isArray(c.userPerms) ? c.userPerms : [],
          botPerms: Array.isArray(c.botPerms) ? c.botPerms : [],
          cooldown: typeof c.cooldown === 'number' ? c.cooldown : 3,
        }));
        setCommands(formatted);
      }
    } catch {
      // Handled silently
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBotData();
    const interval = setInterval(fetchBotData, 10000);
    return () => clearInterval(interval);
  }, [fetchBotData]);

  // Handle Browser Back / Forward Buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      setIsTabSwitching(true);
      setTimeout(() => {
        if (path.includes('/about')) {
          setViewMode('about');
        } else if (path.includes('/manage') || path.includes('/settings')) {
          setViewMode('server_manage');
        } else if (path.includes('/dashboard') || path.includes('/servers')) {
          setViewMode('dashboard');
        } else {
          setViewMode('landing');
        }
        setIsTabSwitching(false);
      }, 350);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (mode: 'landing' | 'dashboard' | 'server_manage' | 'about', path: string) => {
    setIsTabSwitching(true);
    setTimeout(() => {
      setViewMode(mode);
      if (window.location.pathname !== path) {
        window.history.pushState(null, '', path);
      }
      setIsTabSwitching(false);
    }, 380);
  };

  const handleLogout = () => {
    setUser(null);
    setDiscordToken(null);
    setDiscordGuilds([]);
    localStorage.removeItem('dextercorp_user');
    localStorage.removeItem('dextercorp_token');
    localStorage.removeItem('dextercorp_discord_guilds');
    localStorage.removeItem('dextercorp_selected_guild');
    navigateTo('landing', '/');
  };

  const handleLoginWithDiscord = () => {
    const oauthUrl = BOT_CONFIG.getOAuthUrl();
    window.location.href = oauthUrl;
  };

  const handleDirectLogin = () => {
    setUser(DEFAULT_ADMIN_USER);
    localStorage.setItem('dextercorp_user', JSON.stringify(DEFAULT_ADMIN_USER));
    navigateTo('dashboard', '/dashboard');
  };

  // If tab switching transition is active, show Image 1 Syncing Loader!
  if (isTabSwitching) {
    return (
      <SyncingLoader
        fullScreen={true}
        title="SYNCING SERVER"
        subtitle="ESTABLISHING CONNECTION WITH DEXTERCORP DASHBOARD"
      />
    );
  }

  // If authorization callback is in progress, show Image 1 loader with Discord authorizing text
  if (authLoading) {
    return (
      <SyncingLoader
        fullScreen={true}
        title="SYNCING SERVER"
        subtitle="AUTHORIZING DISCORD SESSION & FETCHING ADMIN GUILDS"
      />
    );
  }

  // SCREEN 1: LANDING PAGE & LOGIN MODAL (Screenshot 1 & 2)
  if (viewMode === 'landing') {
    return (
      <LandingPage
        stats={stats}
        user={user}
        onNavigateDashboard={() => navigateTo('dashboard', '/dashboard')}
        onNavigateAbout={() => navigateTo('about', '/about')}
        onLoginWithDiscord={handleLoginWithDiscord}
        onDirectLogin={handleDirectLogin}
        onLogout={handleLogout}
      />
    );
  }

  // SCREEN 2: ABOUT / MEET THE TEAM PAGE (Image 2 - Exactly 1 card for AXIO)
  if (viewMode === 'about') {
    return (
      <AboutView
        onBack={() => navigateTo('landing', '/')}
        onNavigateDashboard={() => navigateTo('dashboard', '/dashboard')}
      />
    );
  }

  // SCREEN 3: DASHBOARD - SERVERS LIST & USER PROFILE (Screenshot 3)
  if (viewMode === 'dashboard') {
    return (
      <ServersTab
        user={user || DEFAULT_ADMIN_USER}
        discordGuilds={discordGuilds}
        commands={commands}
        onRefreshCommands={fetchBotData}
        onSelectGuild={(g) => {
          setSelectedGuild(g);
          localStorage.setItem('dextercorp_selected_guild', JSON.stringify(g));
          navigateTo('server_manage', '/manage');
        }}
        onRefreshDiscordGuilds={handleRefreshDiscordGuilds}
        onBackToHome={() => navigateTo('landing', '/')}
        onLogout={handleLogout}
      />
    );
  }

  // SCREEN 4: SERVER SETTINGS & WELCOMER MODULE CONFIGURATION (Screenshot 4)
  if (viewMode === 'server_manage') {
    const activeGuild = selectedGuild || {
      id: '1001',
      name: 'VOLT X CHEATS',
      icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      memberCount: 420,
      ownerId: user?.id || '1500056784000253973',
      hasBot: true,
      isAdmin: true,
      isOwner: true,
    };

    return (
      <ServerManageView
        guild={activeGuild}
        user={user || DEFAULT_ADMIN_USER}
        commands={commands}
        onBack={() => {
          navigateTo('dashboard', '/dashboard');
        }}
      />
    );
  }

  // Fallback
  return (
    <LandingPage
      stats={stats}
      user={user}
      onNavigateDashboard={() => navigateTo('dashboard', '/dashboard')}
      onNavigateAbout={() => navigateTo('about', '/about')}
      onLoginWithDiscord={handleLoginWithDiscord}
      onDirectLogin={handleDirectLogin}
    />
  );
};