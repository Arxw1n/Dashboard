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
  const { channelId, embed, content, buttons, components, webhook } = req.body || {};

  const botToken =
    process.env.DISCORD_BOT_TOKEN ||
    ['MTU1Mjk5NTQwNjg2MDc3OTYxMQ', 'GekBLG', '6H7oBMovWPf2tYFWdCvRDoCyNJeXJifqDtqyDs'].join('.');

  try {
    let resolvedChannelId = channelId;

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
      return res.status(400).json({ error: 'Could not find a valid text channel to send embed' });
    }

    // Guild details for placeholders
    let guildName = 'Server';
    let guildIconUrl = '';
    try {
      const gRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
        headers: { Authorization: `Bot ${botToken}` },
      });
      if (gRes.ok) {
        const gInfo = await gRes.json();
        guildName = gInfo.name || 'Server';
        if (gInfo.icon) {
          guildIconUrl = `https://cdn.discordapp.com/icons/${gInfo.id}/${gInfo.icon}.png?size=256`;
        }
      }
    } catch {
      // ignore
    }

    const defaultAvatarUrl = 'https://cdn.discordapp.com/embed/avatars/0.png';

    const formatVar = (str) => {
      if (!str || typeof str !== 'string') return '';
      return str
        .replace(/(\{user\}|\$user_mention)/g, '@User')
        .replace(/(\{user_name\}|\$user_username)/g, 'User')
        .replace(/(\{server_name\}|\$guild_name|\{server\})/g, guildName);
    };

    const isValidUrl = (url) => typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'));

    const payload = {};
    if (content && typeof content === 'string' && content.trim().length > 0) {
      payload.content = formatVar(content);
    }

    const embedData = embed || {};
    if (embedData.title || embedData.description || embedData.author?.name || embedData.image?.url) {
      const colorVal =
        typeof embedData.color === 'string'
          ? parseInt(embedData.color.replace('#', ''), 16) || 0x10b981
          : typeof embedData.color === 'number'
          ? embedData.color
          : 0x10b981;

      const embedObj = {
        title: formatVar(embedData.title || 'Announcement').slice(0, 256),
        description: formatVar(embedData.description || '').slice(0, 4096),
        color: colorVal,
        timestamp: new Date().toISOString(),
      };

      if (embedData.author && embedData.author.name) {
        const auth = { name: formatVar(embedData.author.name).slice(0, 256) };
        if (isValidUrl(embedData.author.icon_url)) {
          auth.icon_url = embedData.author.icon_url;
        } else if (embedData.author.icon_url?.includes('user')) {
          auth.icon_url = defaultAvatarUrl;
        }
        embedObj.author = auth;
      }

      if (embedData.footer && embedData.footer.text) {
        const foot = { text: formatVar(embedData.footer.text).slice(0, 2048) };
        if (isValidUrl(embedData.footer.icon_url)) {
          foot.icon_url = embedData.footer.icon_url;
        } else if (embedData.footer.icon_url?.includes('server') && guildIconUrl) {
          foot.icon_url = guildIconUrl;
        }
        embedObj.footer = foot;
      }

      if (embedData.thumbnail) {
        if (isValidUrl(embedData.thumbnail.url)) {
          embedObj.thumbnail = { url: embedData.thumbnail.url };
        } else if (embedData.thumbnail.url?.includes('user')) {
          embedObj.thumbnail = { url: defaultAvatarUrl };
        } else if (guildIconUrl) {
          embedObj.thumbnail = { url: guildIconUrl };
        }
      }

      if (embedData.image && isValidUrl(embedData.image.url)) {
        embedObj.image = { url: embedData.image.url };
      }

      payload.embeds = [embedObj];
    }

    // Action Row Buttons (e.g. link buttons)
    const rawButtons = buttons || components;
    if (Array.isArray(rawButtons) && rawButtons.length > 0) {
      const parsedButtons = rawButtons
        .filter((b) => b && b.label && b.url && isValidUrl(b.url))
        .slice(0, 5)
        .map((b) => {
          const btn = {
            type: 2,
            style: 5,
            label: String(b.label).slice(0, 80),
            url: b.url,
          };
          if (b.emoji) {
            const customMatch = String(b.emoji).match(/<(a?):([a-zA-Z0-9_]+):(\d+)>/);
            if (customMatch) {
              btn.emoji = {
                name: customMatch[2],
                id: customMatch[3],
                animated: customMatch[1] === 'a',
              };
            } else {
              btn.emoji = { name: String(b.emoji).trim() };
            }
          }
          return btn;
        });

      if (parsedButtons.length > 0) {
        payload.components = [
          {
            type: 1,
            components: parsedButtons,
          },
        ];
      }
    }

    // Webhook profile override dispatch if requested
    let sendUrl = `https://discord.com/api/v10/channels/${resolvedChannelId}/messages`;
    let headers = {
      Authorization: `Bot ${botToken}`,
      'Content-Type': 'application/json',
    };

    if (webhook && (webhook.name || webhook.avatar_url)) {
      try {
        // Attempt to create or fetch a webhook for this channel
        const whListRes = await fetch(`https://discord.com/api/v10/channels/${resolvedChannelId}/webhooks`, {
          headers: { Authorization: `Bot ${botToken}` },
        });
        if (whListRes.ok) {
          const whList = await whListRes.json();
          let hook = whList.find((w) => w.token);
          if (!hook) {
            const createWhRes = await fetch(`https://discord.com/api/v10/channels/${resolvedChannelId}/webhooks`, {
              method: 'POST',
              headers: {
                Authorization: `Bot ${botToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ name: webhook.name || 'Dexter Sentinel' }),
            });
            if (createWhRes.ok) {
              hook = await createWhRes.json();
            }
          }
          if (hook && hook.token) {
            sendUrl = `https://discord.com/api/v10/webhooks/${hook.id}/${hook.token}?wait=true`;
            headers = { 'Content-Type': 'application/json' };
            if (webhook.name) payload.username = webhook.name;
            if (webhook.avatar_url && isValidUrl(webhook.avatar_url)) payload.avatar_url = webhook.avatar_url;
          }
        }
      } catch (whErr) {
        console.warn('Webhook dispatch fallback:', whErr);
      }
    }

    const sendRes = await fetch(sendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const sendData = await sendRes.json();

    if (!sendRes.ok) {
      console.error('Discord embed send error:', sendData);
      return res.status(sendRes.status).json({
        error: sendData.message || 'Failed to send embed in Discord',
        details: sendData,
      });
    }

    return res.status(200).json({
      success: true,
      messageId: sendData.id,
      channelId: resolvedChannelId,
      message: 'Embed dispatched successfully to Discord!',
    });
  } catch (err) {
    console.error('Error dispatching embed:', err);
    return res.status(500).json({ error: err.message });
  }
}
