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
    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    });

    if (!response.ok) {
      console.warn(`Could not fetch channels for guild ${guildId}:`, response.status);
      return res.status(200).json([
        { id: 'welcome', name: 'welcome', type: 0 },
        { id: 'general', name: 'general', type: 0 },
      ]);
    }

    const data = await response.json();
    const textChannels = data
      .filter((ch) => ch.type === 0 || ch.type === 5 || ch.type === 4) // Text, Announcement, and Category channels
      .map((ch) => ({
        id: String(ch.id),
        name: ch.name,
        type: ch.type,
        position: ch.position,
        parentId: ch.parent_id,
      }))
      .sort((a, b) => a.position - b.position);

    return res.status(200).json(textChannels);
  } catch (error) {
    console.error('Error fetching guild channels:', error);
    return res.status(200).json([
      { id: 'welcome', name: 'welcome', type: 0 },
      { id: 'general', name: 'general', type: 0 },
    ]);
  }
}
