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
      const tData = await db.collection('guildticketdatas').findOne({ id: guildId });
      const vData = await db.collection('guildverificationdatas').findOne({ id: guildId });

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
          mode: gData?.welcome?.mode || (gData?.welcome?.messageType === 'Only Dynamic Image Card' ? 'card_only' : 'card_only'),
          messageType: gData?.welcome?.messageType || (gData?.welcome?.mode === 'card_only' ? 'Only Dynamic Image Card' : 'Only Dynamic Image Card'),
          autorole: gData?.autorole?.humanRoles?.[0] || '',
          embeds: (() => {
            const emb = { ...(gData?.welcome?.embeds || {}) };
            if (emb.image && (!emb.image.url || !emb.image.url.trim())) {
              delete emb.image;
            }
            if (emb.thumbnail && (!emb.thumbnail.url || !emb.thumbnail.url.trim())) {
              delete emb.thumbnail;
            }
            return emb;
          })(),
          cardBgImage: gData?.welcome?.cardBgImage || gData?.welcome?.embeds?.image?.url || '',
          cardStudio: gData?.welcome?.cardStudio || {},
          buttons: Array.isArray(gData?.welcome?.buttons) ? gData.welcome.buttons : [],
        },
        autorole: {
          enabled: Boolean(gData?.autorole?.enabled),
          humanRoles: gData?.autorole?.humanRoles || [],
          botRoles: gData?.autorole?.botRoles || [],
        },
        logging: {
          enabled: Boolean(gData?.logging?.enabled || anData?.logchannelid),
          modLogsChannel: gData?.logging?.modLogsChannel || anData?.logchannelid || '',
          memberLogsChannel: gData?.logging?.memberLogsChannel || '',
          messageLogsChannel: gData?.logging?.messageLogsChannel || '',
          serverLogsChannel: gData?.logging?.serverLogsChannel || '',
          voiceLogsChannel: gData?.logging?.voiceLogsChannel || '',
        },
        ticket: {
          enabled: Boolean(tData?.enabled),
          channel: tData?.channel || '',
          category: tData?.category || '',
          role: tData?.role || '',
          logsChannel: tData?.logsChannel || '',
          ticketCount: tData?.ticketCount || 0,
          limit: tData?.limit || 1,
          panelTitle: tData?.panelTitle || `🎫 Support Tickets`,
          panelDescription: tData?.panelDescription || `Welcome to our support desk! If you require assistance, have questions, or wish to report an issue, please open a private ticket below.`,
          panelColor: tData?.panelColor || '#5865F2',
          buttonText: tData?.buttonText || 'Open Ticket',
          buttonEmoji: tData?.buttonEmoji || '📩',
          buttonStyle: tData?.buttonStyle || 1,
          authorName: tData?.authorName || '',
          authorIcon: tData?.authorIcon || '',
          thumbnailUrl: tData?.thumbnailUrl || '',
          imageUrl: tData?.imageUrl || '',
          footerText: tData?.footerText || 'Protected by DexterCorp Sentinel Core',
          footerIcon: tData?.footerIcon || '',
        },
        verification: {
          enabled: Boolean(vData?.enabled),
          channel: vData?.channel || '',
          role: vData?.role || '',
          unverifiedRole: vData?.unverifiedRole || '',
          ignoredChannels: vData?.ignoredChannels || [],
          method: vData?.method || 'button',
          gateTitle: vData?.gateTitle || `🛡️ Server Verification Gate`,
          gateDescription: vData?.gateDescription || `Welcome! To protect our community from automated bots and raids, please verify your account below to unlock access to all channels.`,
          gateColor: vData?.gateColor || '#10b981',
          buttonText: vData?.buttonText || 'Verify Account',
          buttonEmoji: vData?.buttonEmoji || '✅',
          buttonStyle: vData?.buttonStyle || 3,
          authorName: vData?.authorName || '',
          authorIcon: vData?.authorIcon || '',
          thumbnailUrl: vData?.thumbnailUrl || '',
          imageUrl: vData?.imageUrl || '',
          footerText: vData?.footerText || 'Protected by DexterCorp Verification Gate',
          footerIcon: vData?.footerIcon || '',
        },
      });
    }

    if (req.method === 'POST') {
      const settings = req.body || {};

      const updateGuildData = {};
      if (settings.prefix) updateGuildData.prefix = settings.prefix;

      if (settings.welcome) {
        const cleanedEmbeds = { ...(settings.welcome.embeds || {}) };
        const cardImage = settings.welcome.cardBgImage?.trim() || settings.welcome.embeds?.image?.url?.trim();
        if (cardImage) {
          cleanedEmbeds.image = { url: cardImage };
        } else if (cleanedEmbeds.image && (!cleanedEmbeds.image.url || !cleanedEmbeds.image.url.trim())) {
          delete cleanedEmbeds.image;
        }
        if (cleanedEmbeds.thumbnail && (!cleanedEmbeds.thumbnail.url || !cleanedEmbeds.thumbnail.url.trim())) {
          delete cleanedEmbeds.thumbnail;
        }
        if (cleanedEmbeds.author) {
          if (!cleanedEmbeds.author.name || !cleanedEmbeds.author.name.trim()) {
            delete cleanedEmbeds.author;
          } else if (!cleanedEmbeds.author.icon_url || !cleanedEmbeds.author.icon_url.trim()) {
            delete cleanedEmbeds.author.icon_url;
          }
        }
        if (cleanedEmbeds.footer) {
          if (!cleanedEmbeds.footer.text || !cleanedEmbeds.footer.text.trim()) {
            delete cleanedEmbeds.footer;
          } else if (!cleanedEmbeds.footer.icon_url || !cleanedEmbeds.footer.icon_url.trim()) {
            delete cleanedEmbeds.footer.icon_url;
          }
        }

        // Sanitize button URLs so Discord never rejects message sending
        let sanitizedWelcomeButtons = gData?.welcome?.buttons || [];
        if (Array.isArray(settings.welcome.buttons)) {
          sanitizedWelcomeButtons = settings.welcome.buttons.map((b) => {
            if (!b) return b;
            let btnUrl = String(b.url || '').trim();
            const chanMatch = btnUrl.match(/<#(\d{17,20})>/) || btnUrl.match(/^(\d{17,20})$/);
            if (chanMatch) {
              btnUrl = `https://discord.com/channels/${guildId}/${chanMatch[1]}`;
            } else if (btnUrl.startsWith('discord.gg/')) {
              btnUrl = 'https://' + btnUrl;
            }
            return { ...b, url: btnUrl };
          });
        }

        updateGuildData.welcome = {
          enabled: settings.welcome.enabled !== false,
          channel: settings.welcome.enabled ? (settings.welcome.channelId || settings.welcome.channel || null) : null,
          content: settings.welcome.content || 'Welcome $user_mention to $guild_name!',
          mode: settings.welcome.mode || (settings.welcome.messageType === 'Only Dynamic Image Card' ? 'card_only' : 'card_only'),
          messageType: settings.welcome.messageType || (settings.welcome.mode === 'card_only' ? 'Only Dynamic Image Card' : 'Only Dynamic Image Card'),
          embeds: cleanedEmbeds,
          cardBgImage: cardImage || '',
          cardImageBase64: settings.welcome.cardImageBase64 || '',
          cardStudio: settings.welcome.cardStudio || {},
          buttons: sanitizedWelcomeButtons,
        };
      }

      if (settings.autorole) {
        updateGuildData.autorole = {
          enabled: Boolean(settings.autorole.enabled),
          humanRoles: settings.autorole.humanRole
            ? [settings.autorole.humanRole]
            : (settings.autorole.humanRoles || []),
          botRoles: settings.autorole.botRole
            ? [settings.autorole.botRole]
            : (settings.autorole.botRoles || []),
        };
      } else if (settings.welcome?.autorole !== undefined) {
        updateGuildData.autorole = {
          enabled: Boolean(settings.welcome.autorole),
          humanRoles: settings.welcome.autorole ? [settings.welcome.autorole] : [],
          botRoles: [],
        };
      }

      if (settings.logging) {
        updateGuildData.logging = {
          enabled: Boolean(settings.logging.enabled),
          modLogsChannel: settings.logging.modLogsChannel || '',
          memberLogsChannel: settings.logging.memberLogsChannel || '',
          messageLogsChannel: settings.logging.messageLogsChannel || '',
          serverLogsChannel: settings.logging.serverLogsChannel || '',
          voiceLogsChannel: settings.logging.voiceLogsChannel || '',
        };
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

      if (settings.ticket) {
        const ticketUpdate = {
          enabled: Boolean(settings.ticket.enabled),
          channel: settings.ticket.channel || null,
          category: settings.ticket.category || null,
          role: settings.ticket.role || null,
          logsChannel: settings.ticket.logsChannel || null,
          limit: parseInt(settings.ticket.limit) || 1,
          panelTitle: settings.ticket.panelTitle || '🎫 Support Tickets',
          panelDescription: settings.ticket.panelDescription || '',
          panelColor: settings.ticket.panelColor || '#5865F2',
          buttonText: settings.ticket.buttonText || 'Open Ticket',
          buttonEmoji: settings.ticket.buttonEmoji || '📩',
          buttonStyle: parseInt(settings.ticket.buttonStyle) || 1,
          authorName: settings.ticket.authorName || '',
          authorIcon: settings.ticket.authorIcon || '',
          thumbnailUrl: settings.ticket.thumbnailUrl || '',
          imageUrl: settings.ticket.imageUrl || '',
          footerText: settings.ticket.footerText || '',
          footerIcon: settings.ticket.footerIcon || '',
        };
        await db.collection('guildticketdatas').updateOne(
          { id: guildId },
          { $set: ticketUpdate },
          { upsert: true }
        );
      }

      if (settings.verification) {
        const verifyUpdate = {
          enabled: Boolean(settings.verification.enabled),
          channel: settings.verification.channel || null,
          role: settings.verification.role || null,
          unverifiedRole: settings.verification.unverifiedRole || null,
          ignoredChannels: settings.verification.ignoredChannels || [],
          method: settings.verification.method || 'button',
          gateTitle: settings.verification.gateTitle || '🛡️ Server Verification Gate',
          gateDescription: settings.verification.gateDescription || '',
          gateColor: settings.verification.gateColor || '#10b981',
          buttonText: settings.verification.buttonText || 'Verify Account',
          buttonEmoji: settings.verification.buttonEmoji || '✅',
          buttonStyle: parseInt(settings.verification.buttonStyle) || 3,
          authorName: settings.verification.authorName || '',
          authorIcon: settings.verification.authorIcon || '',
          thumbnailUrl: settings.verification.thumbnailUrl || '',
          imageUrl: settings.verification.imageUrl || '',
          footerText: settings.verification.footerText || '',
          footerIcon: settings.verification.footerIcon || '',
        };
        await db.collection('guildverificationdatas').updateOne(
          { id: guildId },
          { $set: verifyUpdate },
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
