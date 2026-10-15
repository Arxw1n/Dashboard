export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
