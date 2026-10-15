export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Known servers where DexterCorp is installed
  const KNOWN_GUILDS = [
    { id: '1440364047013904466', name: 'Dexter Corporation', hasBot: true, memberCount: 100 },
    { id: '1544971372693037136', name: "神 DXTR RUDRAX💳's server", hasBot: true, memberCount: 5 },
    { id: '1546070000752795648', name: "神 DXTR RUDRAX's serverewr", hasBot: true, memberCount: 5 },
    { id: '1552974435412222013', name: "神 DXTR ARX's server", hasBot: true, memberCount: 5 },
    { id: '1554080554020769925', name: 'fcd', hasBot: true, memberCount: 5 },
  ];

  const botToken = process.env.DISCORD_BOT_TOKEN;

  // If token is provided in environment variables, fetch live servers from Discord API
  if (botToken) {
    try {
      const response = await fetch('https://discord.com/api/v10/users/@me/guilds?with_counts=true', {
        headers: { Authorization: `Bot ${botToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        const formattedGuilds = data.map((g) => ({
          id: String(g.id),
          name: g.name,
          icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
          memberCount: g.approximate_member_count || 1,
          ownerId: g.owner ? 'bot' : '',
          hasBot: true,
          permissions: g.permissions,
          features: g.features || [],
        }));
        return res.status(200).json(formattedGuilds);
      }
    } catch (err) {
      console.warn('Discord API fetch failed, falling back to known guilds list', err);
    }
  }

  return res.status(200).json(KNOWN_GUILDS);
}
