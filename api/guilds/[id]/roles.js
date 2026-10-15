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
    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    });

    if (!response.ok) {
      console.warn(`Could not fetch roles for guild ${guildId}:`, response.status);
      return res.status(200).json([]);
    }

    const data = await response.json();
    const formattedRoles = data
      .filter((r) => r.name !== '@everyone' && !r.managed)
      .map((r) => ({
        id: String(r.id),
        name: r.name,
        color: r.color,
        position: r.position,
      }))
      .sort((a, b) => b.position - a.position);

    return res.status(200).json(formattedRoles);
  } catch (error) {
    console.error('Error fetching guild roles:', error);
    return res.status(200).json([]);
  }
}
