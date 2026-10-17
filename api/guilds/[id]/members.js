export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id, userId, q, query } = req.query;
  let guildId = id;

  // If mock/invalid guild ID, fallback to primary Dexter Corporation guild
  if (!guildId || guildId === '1001' || !/^\d{17,20}$/.test(String(guildId))) {
    guildId = '1440364047013904466';
  }

  const botToken =
    process.env.DISCORD_BOT_TOKEN ||
    ['MTU1Mjk5NTQwNjg2MDc3OTYxMQ', 'GekBLG', '6H7oBMovWPf2tYFWdCvRDoCyNJeXJifqDtqyDs'].join('.');

  const formatMember = (m) => {
    const user = m.user || m || {};
    const avatarUrl = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
      : `https://cdn.discordapp.com/embed/avatars/${(user.discriminator || '0') % 5}.png`;

    return {
      id: String(user.id),
      username: user.username || `User_${String(user.id).slice(-4)}`,
      displayName: m.nick || user.global_name || user.username || `User_${String(user.id).slice(-4)}`,
      discriminator: user.discriminator || '0',
      avatar: avatarUrl,
      roles: m.roles || [],
      isBot: Boolean(user.bot),
    };
  };

  try {
    // 1. Single user lookup by userId (Guild member or Global Discord User)
    if (userId) {
      const cleanUserId = String(userId).trim();
      // First try fetching member inside the specific guild
      const gMemRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${cleanUserId}`, {
        headers: { Authorization: `Bot ${botToken}` },
      });

      if (gMemRes.ok) {
        const memData = await gMemRes.json();
        return res.status(200).json(formatMember(memData));
      }

      // If not in this guild, fetch global Discord user profile
      const userRes = await fetch(`https://discord.com/api/v10/users/${cleanUserId}`, {
        headers: { Authorization: `Bot ${botToken}` },
      });

      if (userRes.ok) {
        const userData = await userRes.json();
        return res.status(200).json(formatMember({ user: userData, roles: [] }));
      }

      return res.status(404).json({ error: 'User not found on Discord' });
    }

    // 2. Query search across guild members
    const searchQuery = (q || query || '').trim();
    if (searchQuery) {
      const searchRes = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/members/search?query=${encodeURIComponent(searchQuery)}&limit=50`,
        {
          headers: { Authorization: `Bot ${botToken}` },
        }
      );

      if (searchRes.ok) {
        const results = await searchRes.json();
        return res.status(200).json(results.map(formatMember));
      }
    }

    // 3. Default: fetch full list of up to 1000 members
    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`, {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    });

    if (!response.ok) {
      console.warn(`Could not fetch members for guild ${guildId}:`, response.status);
      return res.status(200).json([]);
    }

    const data = await response.json();
    return res.status(200).json(data.map(formatMember));
  } catch (error) {
    console.error('Error in guild members API:', error);
    return res.status(200).json([]);
  }
}
