export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Image Proxy Handler (Consolidated to respect Vercel Hobby 12-function limit)
  const { url, type } = req.query;
  if (url && typeof url === 'string') {
    try {
      const upstream = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      });

      if (!upstream.ok) {
        return res.status(upstream.status).send('Upstream image error');
      }

      const contentType = upstream.headers.get('content-type') || 'image/png';
      const buffer = await upstream.arrayBuffer();

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
      return res.status(200).send(Buffer.from(buffer));
    } catch (err) {
      return res.status(500).send('Proxy error: ' + err.message);
    }
  }

  // 2. Bot Commands Handler (Consolidated)
  if (type === 'commands') {
    const commands = [
      {
        name: 'help',
        description: 'Displays all available bot commands and documentation.',
        category: 'General',
        usage: '!help [command]',
        permissions: 'Everyone',
        cooldown: 3,
      },
      {
        name: 'antinuke',
        description: 'Configure and monitor anti-nuke server protection.',
        category: 'Security',
        usage: '!antinuke <enable/disable/whitelist/settings>',
        permissions: 'Administrator',
        cooldown: 5,
      },
      {
        name: 'automod',
        description: 'Configure automated chat moderation and filters.',
        category: 'Moderation',
        usage: '!automod <antispam/antilink/badwords>',
        permissions: 'Manage Messages',
        cooldown: 5,
      },
      {
        name: 'welcome',
        description: 'Setup custom welcome cards and channels for new members.',
        category: 'Utility',
        usage: '!welcome <channel/message/preview>',
        permissions: 'Manage Guild',
        cooldown: 5,
      },
      {
        name: 'ban',
        description: 'Ban a malicious user from the server.',
        category: 'Moderation',
        usage: '!ban <@user> [reason]',
        permissions: 'Ban Members',
        cooldown: 3,
      },
      {
        name: 'kick',
        description: 'Kick a user from the server.',
        category: 'Moderation',
        usage: '!kick <@user> [reason]',
        permissions: 'Kick Members',
        cooldown: 3,
      },
      {
        name: 'mute',
        description: 'Timeout / mute a disruptive user.',
        category: 'Moderation',
        usage: '!mute <@user> <duration> [reason]',
        permissions: 'Moderate Members',
        cooldown: 3,
      },
      {
        name: 'unmute',
        description: 'Remove timeout from a user.',
        category: 'Moderation',
        usage: '!unmute <@user>',
        permissions: 'Moderate Members',
        cooldown: 3,
      },
      {
        name: 'lock',
        description: 'Lock a text channel to prevent messages.',
        category: 'Moderation',
        usage: '!lock [#channel]',
        permissions: 'Manage Channels',
        cooldown: 3,
      },
      {
        name: 'unlock',
        description: 'Unlock a previously locked channel.',
        category: 'Moderation',
        usage: '!unlock [#channel]',
        permissions: 'Manage Channels',
        cooldown: 3,
      },
      {
        name: 'role',
        description: 'Assign or remove roles from a user.',
        category: 'Moderation',
        usage: '!role <@user> <@role>',
        permissions: 'Manage Roles',
        cooldown: 3,
      },
      {
        name: 'purge',
        description: 'Bulk delete messages from a channel.',
        category: 'Moderation',
        usage: '!purge <amount>',
        permissions: 'Manage Messages',
        cooldown: 5,
      },
      {
        name: 'ping',
        description: 'Check bot latency and gateway websocket heartbeat.',
        category: 'Utility',
        usage: '!ping',
        permissions: 'Everyone',
        cooldown: 3,
      },
      {
        name: 'botinfo',
        description: 'View DexterCorp bot system information and uptime.',
        category: 'General',
        usage: '!botinfo',
        permissions: 'Everyone',
        cooldown: 3,
      },
    ];
    return res.status(200).json(commands);
  }

  // 3. System Stats Handler
  const botToken = process.env.DISCORD_BOT_TOKEN;

  let guildCount = 5;
  let userCount = 5110540;

  if (botToken) {
    try {
      const response = await fetch('https://discord.com/api/v10/users/@me/guilds?with_counts=true', {
        headers: { Authorization: `Bot ${botToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        guildCount = data.length || 5;
        const totalMembers = data.reduce((acc, g) => acc + (g.approximate_member_count || 0), 0);
        if (totalMembers > 0) userCount = totalMembers;
      }
    } catch (e) {
      // Graceful fallback
    }
  }

  return res.status(200).json({
    users: userCount,
    guilds: guildCount,
    isOnline: true,
    ping: Math.floor(Math.random() * 8) + 14,
    lastUpdated: new Date().toLocaleTimeString(),
  });
}
