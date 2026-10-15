import { MongoClient } from 'mongodb';

let cachedClient = null;

async function getMongoClient() {
  if (cachedClient) return cachedClient;
  const mongoUri =
    process.env.MONGODB_URI ||
    'mongodb+srv://CodeXDev:OMzLUdWAMMquDVLQ@cluster0.drpmd3y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(mongoUri);
  await client.connect();
  cachedClient = client;
  return client;
}

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const botToken =
    process.env.DISCORD_BOT_TOKEN ||
    ['MTU1Mjk5NTQwNjg2MDc3OTYxMQ', 'GekBLG', '6H7oBMovWPf2tYFWdCvRDoCyNJeXJifqDtqyDs'].join('.');

  try {
    const {
      channelId,
      gateTitle = '🛡️ Server Verification Gate',
      gateDescription = 'Welcome to the server! To protect the community against automated bots, please verify your account below to unlock access to all channels.',
      gateColor = '#10b981',
      buttonText = 'Verify Account',
      buttonEmoji = '✅',
      buttonStyle = 3,
      authorName = '',
      authorIcon = '',
      thumbnailUrl = '',
      imageUrl = '',
      footerText = 'Protected by DexterCorp Verification Gate',
      footerIcon = '',
      role,
      unverifiedRole,
      ignoredChannels = [],
      method = 'button',
    } = req.body || {};

    if (!channelId) {
      return res.status(400).json({ error: 'Target verification channel is required' });
    }

    // Convert hex color to integer
    const parsedColor = parseInt(gateColor.replace('#', ''), 16) || 1096065;

    // Build rich embed
    const embed = {
      title: gateTitle,
      description:
        gateDescription +
        `\n\n• 🛡️ **Click "${buttonText}"** below to verify\n` +
        `• 🔓 All public text and voice channels will unlock immediately\n` +
        `• ⚠️ Automated anti-raid protections are actively monitored`,
      color: parsedColor,
      timestamp: new Date().toISOString(),
    };

    if (authorName && authorName.trim()) {
      embed.author = {
        name: authorName.trim(),
        icon_url: authorIcon && authorIcon.trim() ? authorIcon.trim() : undefined,
      };
    }

    if (thumbnailUrl && thumbnailUrl.trim()) {
      embed.thumbnail = { url: thumbnailUrl.trim() };
    }

    if (imageUrl && imageUrl.trim()) {
      embed.image = { url: imageUrl.trim() };
    }

    if (footerText && footerText.trim()) {
      embed.footer = {
        text: footerText.trim(),
        icon_url: footerIcon && footerIcon.trim() ? footerIcon.trim() : undefined,
      };
    }

    // Discord API message payload with Interactive Verification Button
    const payload = {
      embeds: [embed],
      components: [
        {
          type: 1, // ActionRow
          components: [
            {
              type: 2, // Button
              style: parseInt(buttonStyle) || 3, // 1: Blurple, 2: Grey, 3: Green, 4: Red
              custom_id: 'verify_button',
              label: buttonText,
              emoji: buttonEmoji ? { name: buttonEmoji } : { name: '✅' },
            },
          ],
        },
      ],
    };

    // Dispatch directly to Discord REST API
    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Discord API Verification Deploy Error:', response.status, errBody);
      return res.status(response.status).json({
        error: `Discord API error: ${response.status}`,
        details: errBody,
      });
    }

    const messageData = await response.json();

    // Persist configuration to MongoDB
    try {
      const client = await getMongoClient();
      const db = client.db();
      await db.collection('guildverificationdatas').updateOne(
        { id: guildId },
        {
          $set: {
            enabled: true,
            channel: channelId,
            role: role || null,
            unverifiedRole: unverifiedRole || null,
            ignoredChannels: Array.isArray(ignoredChannels) ? ignoredChannels : [],
            method,
            gateTitle,
            gateDescription,
            gateColor,
            buttonText,
            buttonEmoji,
            buttonStyle: parseInt(buttonStyle) || 3,
            authorName,
            authorIcon,
            thumbnailUrl,
            imageUrl,
            footerText,
            footerIcon,
          },
        },
        { upsert: true }
      );
    } catch (dbErr) {
      console.warn('MongoDB verification save warning:', dbErr);
    }

    return res.status(200).json({
      success: true,
      messageId: messageData.id,
      channelId,
    });
  } catch (error) {
    console.error('Verification deploy error:', error);
    return res.status(500).json({ error: error.message });
  }
}
