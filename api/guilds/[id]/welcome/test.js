export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  const { channelId, welcome } = req.body || {};

  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (botToken && channelId) {
    try {
      const embedData = welcome?.embeds || {};
      const payload = {
        content: (welcome?.content || 'Welcome to the server!').replace('{user}', '<@user>'),
      };
      if (embedData.title || embedData.description) {
        payload.embeds = [
          {
            title: embedData.title || 'Welcome!',
            description: embedData.description || "We're glad to have you here!",
            color: parseInt((embedData.color || '#ff2b43').replace('#', ''), 16) || 0xff2b43,
            footer: embedData.footer ? { text: embedData.footer.text } : undefined,
          },
        ];
      }

      await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn('Direct discord message test warning:', e);
    }
  }

  return res.status(200).json({ success: true, message: 'Test message delivered!' });
}
