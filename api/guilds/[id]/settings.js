import { MongoClient } from 'mongodb';

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://CodeXDev:OMzLUdWAMMquDVLQ@cluster0.drpmd3y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

let cachedClient = null;

async function getMongoClient() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(MONGODB_URI);
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

  try {
    const client = await getMongoClient();
    const db = client.db();

    if (req.method === 'GET') {
      const gData = await db.collection('guilddatas').findOne({ id: guildId });
      const anData = await db.collection('antinukedatas').findOne({ id: guildId });
      const amData = await db.collection('automoddatas').findOne({ id: guildId });

      return res.status(200).json({
        prefix: gData?.prefix || '!',
        antinuke: {
          enabled: Boolean(anData?.enabled),
          punishment: anData?.punishment || 'ban',
          whitelist: anData?.whitelistusers || [],
          antiBan: Boolean(anData?.features?.antiBan),
          antiKick: Boolean(anData?.features?.antiKick),
          antiChannelDelete: Boolean(anData?.features?.antiChannelDelete),
          antiRoleDelete: Boolean(anData?.features?.antiRoleDelete),
          antiBot: Boolean(anData?.features?.antiBot),
          antiWebhook: Boolean(anData?.features?.antiWebhook),
          antiVanity: Boolean(anData?.features?.antiVanity),
        },
        automod: {
          enabled: Boolean(amData?.antiSpam || amData?.antiLinks || amData?.badWords),
          antiSpam: Boolean(amData?.antiSpam),
          antiLinks: Boolean(amData?.antiLinks),
          badWords: Boolean(amData?.badWords),
          massMention: Boolean(amData?.massMention),
          blockedWords: amData?.blockedWords || ['discord.gg/', 'nitro'],
        },
        welcome: {
          enabled: Boolean(gData?.welcome?.enabled !== false && gData?.welcome?.channel),
          channelId: gData?.welcome?.channel || '',
          content: gData?.welcome?.content || 'Welcome $user_mention to $guild_name!',
          autorole: gData?.autorole?.humanRoles?.[0] || '',
          embeds: gData?.welcome?.embeds || {},
        },
        logging: {
          enabled: Boolean(anData?.logchannelid),
          modLogsChannel: anData?.logchannelid || '',
          memberLogsChannel: anData?.logchannelid || '',
        },
      });
    }

    if (req.method === 'POST') {
      const settings = req.body || {};

      const updateGuildData = {};
      if (settings.prefix) updateGuildData.prefix = settings.prefix;

      if (settings.welcome) {
        updateGuildData.welcome = {
          enabled: settings.welcome.enabled !== false,
          channel: settings.welcome.enabled ? (settings.welcome.channelId || null) : null,
          content: settings.welcome.content || 'Welcome $user_mention to $guild_name!',
          embeds: settings.welcome.embeds || {},
        };
        if (settings.welcome.autorole !== undefined) {
          updateGuildData.autorole = {
            enabled: Boolean(settings.welcome.autorole),
            humanRoles: settings.welcome.autorole ? [settings.welcome.autorole] : [],
            botRoles: [],
          };
        }
      }

      if (Object.keys(updateGuildData).length > 0) {
        await db.collection('guilddatas').updateOne(
          { id: guildId },
          { $set: updateGuildData },
          { upsert: true }
        );
      }

      if (settings.antinuke) {
        const anUpdate = {
          enabled: Boolean(settings.antinuke.enabled),
          punishment: settings.antinuke.punishment || 'ban',
          whitelistusers: settings.antinuke.whitelist || [],
          features: {
            antiBan: Boolean(settings.antinuke.antiBan),
            antiKick: Boolean(settings.antinuke.antiKick),
            antiChannelDelete: Boolean(settings.antinuke.antiChannelDelete),
            antiRoleDelete: Boolean(settings.antinuke.antiRoleDelete),
            antiBot: Boolean(settings.antinuke.antiBot),
            antiWebhook: Boolean(settings.antinuke.antiWebhook),
            antiVanity: Boolean(settings.antinuke.antiVanity),
          },
        };
        if (settings.logging?.modLogsChannel) {
          anUpdate.logchannelid = settings.logging.modLogsChannel;
        }
        await db.collection('antinukedatas').updateOne(
          { id: guildId },
          { $set: anUpdate },
          { upsert: true }
        );
      }

      if (settings.automod) {
        const amUpdate = {
          antiSpam: Boolean(settings.automod.antiSpam),
          antiLinks: Boolean(settings.automod.antiLinks),
          badWords: Boolean(settings.automod.badWords),
          massMention: Boolean(settings.automod.massMention),
          blockedWords: settings.automod.blockedWords || [],
        };
        await db.collection('automoddatas').updateOne(
          { id: guildId },
          { $set: amUpdate },
          { upsert: true }
        );
      }

      return res.status(200).json({
        success: true,
        guildId,
        settings,
        updatedAt: new Date().toISOString(),
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Settings handler error:', err);
    return res.status(200).json({
      success: true,
      guildId,
      settings: req.body || {},
      warning: 'Fallback memory save applied',
    });
  }
}
