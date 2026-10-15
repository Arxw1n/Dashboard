// Centralized configuration for DexterCorp Dashboard

export const BOT_CONFIG = {
  // Application / Client ID
  clientId: import.meta.env.VITE_DISCORD_CLIENT_ID || '1552995406860779611',

  // Backend API base URL
  // In development: defaults to http://localhost:3001
  // On Vercel: if VITE_API_URL is set, uses that, else uses '' (proxied through vercel.json)
  apiUrl: import.meta.env.VITE_API_URL !== undefined 
    ? import.meta.env.VITE_API_URL 
    : (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3001' : ''),

  // OAuth Redirect URI: uses permanent production domain on Vercel to guarantee Discord match
  getRedirectUri: (): string => {
    if (import.meta.env.VITE_REDIRECT_URI) {
      return import.meta.env.VITE_REDIRECT_URI;
    }
    if (typeof window !== 'undefined' && window.location.origin) {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return `${window.location.origin}/dashboard`;
      }
      return 'https://dashboard-phi-seven-48.vercel.app/dashboard';
    }
    return 'https://dashboard-phi-seven-48.vercel.app/dashboard';
  },

  // Discord OAuth2 authorization URL (Implicit grant: instant client-side login on Vercel)
  getOAuthUrl: (): string => {
    const clientId = BOT_CONFIG.clientId;
    const redirectUri = BOT_CONFIG.getRedirectUri();
    return `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=identify+guilds`;
  },

  // Bot invite URL
  getInviteUrl: (guildId?: string): string => {
    const clientId = BOT_CONFIG.clientId;
    let url = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&integration_type=0&scope=bot`;
    if (guildId) {
      url += `&guild_id=${guildId}`;
    }
    return url;
  },

  // Helper to construct endpoint URLs
  getApiUrl: (endpoint: string): string => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    if (!BOT_CONFIG.apiUrl) {
      return cleanEndpoint;
    }
    return `${BOT_CONFIG.apiUrl.replace(/\/+$/, '')}${cleanEndpoint}`;
  },
};
