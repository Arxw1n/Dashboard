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
    let resolvedChannelName = 'welcome';

    // 1. Fetch live guild channels to validate or auto-resolve the best welcome channel
    let allChannels = [];
    try {
      const chRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
        headers: { Authorization: `Bot ${botToken}` },
      });
      if (chRes.ok) {
        allChannels = await chRes.json();
      }
    } catch (e) {
      console.warn('Channel fetch error:', e);
    }

    const textChannels = allChannels.filter((c) => c.type === 0 || c.type === 5);
    const normalizeStr = (s) => (s ? String(s).normalize('NFKD').replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : '');

    // If channelId is a valid Snowflake ID, check if it exists
    if (resolvedChannelId && /^\d{17,20}$/.test(String(resolvedChannelId))) {
      const exactMatch = textChannels.find((c) => c.id === String(resolvedChannelId));
      if (exactMatch) {
        resolvedChannelName = exactMatch.name;
      }
    } else {
      // Auto-resolve channel by name or fallback with Unicode NFKD normalization
      const cleanTarget = normalizeStr(resolvedChannelId || 'welcome');

      const welcomeMatch =
        textChannels.find((c) => normalizeStr(c.name).includes('welcome')) ||
        (cleanTarget ? textChannels.find((c) => normalizeStr(c.name).includes(cleanTarget)) : null) ||
        textChannels.find((c) => normalizeStr(c.name).includes('general') || normalizeStr(c.name).includes('chat')) ||
        textChannels[0];

      if (welcomeMatch) {
        resolvedChannelId = welcomeMatch.id;
        resolvedChannelName = welcomeMatch.name;
      }
    }

    if (!resolvedChannelId || !/^\d{17,20}$/.test(String(resolvedChannelId))) {
      return res.status(400).json({
        error: 'No valid text channel found in server. Please select a valid Discord channel.',
      });
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
    const rawContent = welcome?.content || 'Welcome {user} to **{server_name}**!';
    const formattedContent = formatVar(rawContent);

    // Resolve Image URL: card studio background, embed image, or main image
    const effectiveImageUrl =
      (typeof welcome?.cardBgImage === 'string' && isValidUrl(welcome.cardBgImage) ? welcome.cardBgImage : null) ||
      (typeof welcome?.mainImageUrl === 'string' && isValidUrl(welcome.mainImageUrl) ? welcome.mainImageUrl : null) ||
      (typeof embedData.image?.url === 'string' && isValidUrl(embedData.image.url) ? embedData.image.url : null) ||
      (typeof welcome?.image === 'string' && isValidUrl(welcome.image) ? welcome.image : null);

    const payload = {};
    if (formattedContent && formattedContent.trim().length > 0) {
      payload.content = formattedContent;
    }

    // Build Embed
    const colorVal =
      typeof embedData.color === 'string'
        ? parseInt(embedData.color.replace('#', ''), 16) || 0xff0033
        : typeof embedData.color === 'number'
        ? embedData.color
        : 0xff0033;

    const titleText =
      welcome?.cardWelcomeTitle ||
      embedData.title ||
      `Welcome to ${guildName}!`;

    const descText =
      welcome?.cardSubtitle ||
      embedData.description ||
      `You are our #${memberCount}th citizen! We are thrilled to have you here.`;

    const embedObj = {
      title: formatVar(titleText).slice(0, 256),
      description: formatVar(descText).slice(0, 4096),
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
    } else {
      embedObj.author = {
        name: `${guildName} • Welcome Sentinel`,
        icon_url: guildIconUrl || defaultAvatarUrl,
      };
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
    } else {
      embedObj.footer = {
        text: `Dexter Corporation • Citizen #${memberCount}`,
        icon_url: guildIconUrl || defaultAvatarUrl,
      };
    }

    // Thumbnail
    if (embedData.thumbnail && isValidUrl(embedData.thumbnail.url)) {
      embedObj.thumbnail = { url: embedData.thumbnail.url };
    } else if (embedData.thumbnail?.url?.includes('user')) {
      embedObj.thumbnail = { url: defaultAvatarUrl };
    } else if (guildIconUrl) {
      embedObj.thumbnail = { url: guildIconUrl };
    }

    // Guild ID fallback
    let effectiveGuildId = guildId;
    if (!effectiveGuildId || effectiveGuildId === '1001' || !/^\d{17,20}$/.test(String(effectiveGuildId))) {
      effectiveGuildId = '1440364047013904466';
    }

    // Main Card Image (Supports composite card base64, custom GIF, and CDN wallpapers)
    if (effectiveImageUrl) {
      embedObj.image = { url: effectiveImageUrl };
    }

    payload.embeds = [embedObj];

    // Buttons - Defensive URL sanitization to prevent Discord 400 errors
    if (welcome?.buttons && Array.isArray(welcome.buttons) && welcome.buttons.length > 0) {
      const validButtons = [];
      for (const b of welcome.buttons.slice(0, 5)) {
        if (!b || !b.label) continue;
        let btnUrl = String(b.url || '').trim();
        // Convert Discord channel mentions or raw IDs into valid https web links
        const chanMatch = btnUrl.match(/<#(\d{17,20})>/) || btnUrl.match(/^(\d{17,20})$/);
        if (chanMatch) {
          btnUrl = `https://discord.com/channels/${effectiveGuildId}/${chanMatch[1]}`;
        } else if (btnUrl.startsWith('#')) {
          const cleanName = normalizeStr(btnUrl);
          const found = textChannels.find((c) => normalizeStr(c.name) === cleanName);
          if (found) {
            btnUrl = `https://discord.com/channels/${effectiveGuildId}/${found.id}`;
          }
        }
        if (!btnUrl.startsWith('http://') && !btnUrl.startsWith('https://')) {
          if (btnUrl.startsWith('discord.gg/')) {
            btnUrl = 'https://' + btnUrl;
          } else {
            continue;
          }
        }
        const btnObj = {
          type: 2, // BUTTON
          style: 5, // LINK
          label: String(b.label).slice(0, 80),
          url: btnUrl,
        };
        if (b.emoji) {
          btnObj.emoji = { name: b.emoji };
        }
        validButtons.push(btnObj);
      }

      if (validButtons.length > 0) {
        payload.components = [
          {
            type: 1, // ACTION_ROW
            components: validButtons,
          },
        ];
      }
    }

    // Send payload to Discord Channel (Either with attached rendered card or direct JSON)
    let sendRes;
    if (welcome?.cardImageBase64 && typeof welcome.cardImageBase64 === 'string') {
      try {
        const rawBase64 = welcome.cardImageBase64.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(rawBase64, 'base64');
        embedObj.image = { url: 'attachment://welcome-card.png' };
        payload.embeds = [embedObj];

        const formData = new FormData();
        formData.append('payload_json', JSON.stringify(payload));
        formData.append('files[0]', new Blob([imageBuffer], { type: 'image/png' }), 'welcome-card.png');

        sendRes = await fetch(`https://discord.com/api/v10/channels/${resolvedChannelId}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bot ${botToken}`,
          },
          body: formData,
        });
      } catch (uploadErr) {
        console.warn('FormData card attachment failed, falling back to JSON:', uploadErr);
      }
    }

    if (!sendRes) {
      if (effectiveImageUrl) {
        embedObj.image = { url: effectiveImageUrl };
      }
      payload.embeds = [embedObj];

      sendRes = await fetch(`https://discord.com/api/v10/channels/${resolvedChannelId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    }

    const sendData = await sendRes.json();

    if (!sendRes.ok) {
      console.error('Discord API message send failed:', sendData);
      return res.status(sendRes.status).json({
        error: sendData.message || 'Failed to send message to Discord',
        details: sendData,
        channelId: resolvedChannelId,
        channelName: resolvedChannelName,
      });
    }

    return res.status(200).json({
      success: true,
      messageId: sendData.id,
      channelId: resolvedChannelId,
      channelName: resolvedChannelName,
      message: `Welcome Card successfully dispatched to #${resolvedChannelName}!`,
    });
  } catch (error) {
    console.error('Error in welcome test endpoint:', error);
    return res.status(500).json({ error: error.message });
  }
}
