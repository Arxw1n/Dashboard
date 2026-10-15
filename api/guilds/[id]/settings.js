// In-memory cache for serverless invocation reuse
const settingsStore = new Map();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  const guildId = id;

  if (!guildId) {
    return res.status(400).json({ error: 'Missing guild id' });
  }

  if (req.method === 'GET') {
    if (settingsStore.has(guildId)) {
      return res.status(200).json(settingsStore.get(guildId));
    }

    return res.status(200).json({
      prefix: '!',
      antinuke: {
        enabled: true,
        punishment: 'ban',
        antiBot: true,
        antiBan: true,
        antiKick: true,
        antiChannelDelete: true,
        antiRoleDelete: true,
        antiWebhook: true,
        antiVanity: true,
        whitelist: [],
      },
      automod: {
        enabled: true,
        punishment: 'mute',
        antiSpam: true,
        antiLinks: true,
        badWords: true,
        massMention: true,
        blockedWords: ['discord.gg/', 't.me/', 'bit.ly/'],
      },
      welcome: {
        enabled: true,
        channelId: '',
        content: 'Welcome $user_mention to $guild_name!',
        autorole: '',
      },
      logging: {
        enabled: true,
        modLogsChannel: '',
        memberLogsChannel: '',
      },
    });
  }

  if (req.method === 'POST') {
    const payload = req.body || {};
    settingsStore.set(guildId, payload);

    return res.status(200).json({
      success: true,
      guildId,
      settings: payload,
      updatedAt: new Date().toISOString(),
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
