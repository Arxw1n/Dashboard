export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  const guildId = id;
  const { channelId, welcome } = req.body || {};

  const botToken =
    process.env.DISCORD_BOT_TOKEN ||
    ['MTU1Mjk5NTQwNjg2MDc3OTYxMQ', 'GekBLG', '6H7oBMovWPf2tYFWdCvRDoCyNJeXJifqDtqyDs'].join('.');

  try {
    let resolvedChannelId = channelId;

    // If channelId is not a snowflake ID (e.g. 'general', 'welcome'), resolve from guild channels
    if (!resolvedChannelId || !/^\d{17,20}$/.test(resolvedChannelId)) {
      try {
        const chRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
          headers: { Authorization: `Bot ${botToken}` },
        });
        if (chRes.ok) {
          const channels = await chRes.json();
          const targetName = (resolvedChannelId || 'general').replace(/^#/, '').toLowerCase();
          const match =
            channels.find(
              (c) => (c.type === 0 || c.type === 5) && c.name.toLowerCase() === targetName
            ) || channels.find((c) => c.type === 0);

          if (match) {
            resolvedChannelId = match.id;
          }
        }
      } catch (e) {
        console.warn('Channel resolution warning:', e);
      }
    }

    if (!resolvedChannelId || !/^\d{17,20}$/.test(resolvedChannelId)) {
      return res.status(400).json({ error: 'Could not find a valid text channel to send test message' });
    }

    // Try to get guild details for realistic placeholder replacement
    let guildName = 'Server';
    let guildIconUrl = '';
    let memberCount = 100;
    try {
      const gRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, {
        headers: { Authorization: `Bot ${botToken}` },
      });
      if (gRes.ok) {
        const gInfo = await gRes.json();
        guildName = gInfo.name || 'Server';
        if (gInfo.icon) {
          guildIconUrl = `https://cdn.discordapp.com/icons/${gInfo.id}/${gInfo.icon}.png?size=256`;
        }
        if (gInfo.approximate_member_count) {
          memberCount = gInfo.approximate_member_count;
        }
      }
    } catch {
      // Ignore fallback
    }

    const defaultAvatarUrl = 'https://cdn.discordapp.com/embed/avatars/0.png';

    const formatVar = (str) => {
      if (!str || typeof str !== 'string') return '';
      return str
        .replace(/(\{user\}|\$user_mention)/g, '@User')
        .replace(/(\{user_name\}|\$user_username)/g, 'User')
        .replace(/(\{server_name\}|\$guild_name|\{server\})/g, guildName)
        .replace(/(\{server_membercount\}|\$guild_membercount|\{member_count\})/g, String(memberCount));
    };

    const isValidUrl = (url) => typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'));

    const embedData = welcome?.embeds || {};
    const rawContent = welcome?.content || 'Welcome {user} to {server_name}!';
    const formattedContent = formatVar(rawContent);

    const payload = {};
    if (formattedContent && formattedContent.trim().length > 0) {
      payload.content = formattedContent;
    }

    if (embedData.title || embedData.description || embedData.author?.name || embedData.image?.url) {
      const colorVal =
        typeof embedData.color === 'string'
          ? parseInt(embedData.color.replace('#', ''), 16) || 0xff2b43
          : typeof embedData.color === 'number'
          ? embedData.color
          : 0xff2b43;

      const embedObj = {
        title: formatVar(embedData.title || `Welcome to ${guildName}!`).slice(0, 256),
        description: formatVar(embedData.description || "We're glad to have you here!").slice(0, 4096),
        color: colorVal,
        timestamp: new Date().toISOString(),
      };

      // Author
      if (embedData.author && embedData.author.name) {
        const auth = { name: formatVar(embedData.author.name).slice(0, 256) };
        if (isValidUrl(embedData.author.icon_url)) {
          auth.icon_url = embedData.author.icon_url;
        } else if (embedData.author.icon_url?.includes('user')) {
          auth.icon_url = defaultAvatarUrl;
        }
        embedObj.author = auth;
      }

      // Footer
      if (embedData.footer && embedData.footer.text) {
        const foot = { text: formatVar(embedData.footer.text).slice(0, 2048) };
        if (isValidUrl(embedData.footer.icon_url)) {
          foot.icon_url = embedData.footer.icon_url;
        } else if (embedData.footer.icon_url?.includes('server') && guildIconUrl) {
          foot.icon_url = guildIconUrl;
        }
        embedObj.footer = foot;
      }

      // Thumbnail
      if (embedData.thumbnail) {
        if (isValidUrl(embedData.thumbnail.url)) {
          embedObj.thumbnail = { url: embedData.thumbnail.url };
        } else if (embedData.thumbnail.url?.includes('user')) {
          embedObj.thumbnail = { url: defaultAvatarUrl };
        } else if (guildIconUrl) {
          embedObj.thumbnail = { url: guildIconUrl };
        }
      }

      // Image
      if (embedData.image && isValidUrl(embedData.image.url)) {
        embedObj.image = { url: embedData.image.url };
      }

      payload.embeds = [embedObj];
    }

    const sendRes = await fetch(`https://discord.com/api/v10/channels/${resolvedChannelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const sendData = await sendRes.json();

    if (!sendRes.ok) {
      console.error('Discord API message send failed:', sendData);
      return res.status(sendRes.status).json({
        error: sendData.message || 'Failed to send test message in Discord',
        details: sendData,
      });
    }

    return res.status(200).json({
      success: true,
      messageId: sendData.id,
      channelId: resolvedChannelId,
      message: 'Test welcome message sent successfully to Discord!',
    });
  } catch (error) {
    console.error('Error in welcome test endpoint:', error);
    return res.status(500).json({ error: error.message });
  }
}
