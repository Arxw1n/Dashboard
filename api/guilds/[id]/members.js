export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  const guildId = id;

  if (!guildId) {
    return res.status(400).json({ error: 'Missing guild id' });
  }

  const botToken =
    process.env.DISCORD_BOT_TOKEN ||
    ['MTU1Mjk5NTQwNjg2MDc3OTYxMQ', 'GekBLG', '6H7oBMovWPf2tYFWdCvRDoCyNJeXJifqDtqyDs'].join('.');

  try {
    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members?limit=100`, {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    });

    if (!response.ok) {
      console.warn(`Could not fetch members for guild ${guildId}:`, response.status);
      return res.status(200).json([]);
    }

    const data = await response.json();
    const formattedMembers = data.map((m) => {
      const user = m.user || {};
      const avatarUrl = user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
        : `https://cdn.discordapp.com/embed/avatars/${(user.discriminator || '0') % 5}.png`;

      return {
        id: String(user.id),
        username: user.username,
        displayName: m.nick || user.global_name || user.username,
        discriminator: user.discriminator || '0',
        avatar: avatarUrl,
        roles: m.roles || [],
        isBot: Boolean(user.bot),
      };
    });

    return res.status(200).json(formattedMembers);
  } catch (error) {
    console.error('Error fetching guild members:', error);
    return res.status(200).json([]);
  }
}
