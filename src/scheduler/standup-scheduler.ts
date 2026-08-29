import type { Client, TextChannel } from 'discord.js';
import { getGuildSettings, getStandup, setGuildSettings } from '../data/standup.js';
import { logger } from '../utils/logger.js';

interface ScheduledJob {
  guildId: string;
  timeoutId: NodeJS.Timeout;
}

const jobs = new Map<string, ScheduledJob>();

function getTimezoneOffset(timezone: string): number {
  try {
    const now = new Date();
    const utc = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tz = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    return (tz.getTime() - utc.getTime()) / 60000;
  } catch {
    return 0;
  }
}

function calculateNextRun(time: string, timezone: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const offset = getTimezoneOffset(timezone);

  const target = new Date(now);
  target.setUTCHours(hours, minutes, 0, 0);
  target.setMinutes(target.getMinutes() - offset);

  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime() - now.getTime();
}

export function scheduleStandupReminder(client: Client, guildId: string): void {
  const existing = jobs.get(guildId);
  if (existing) {
    clearTimeout(existing.timeoutId);
    jobs.delete(guildId);
  }

  void getGuildSettings(guildId).then((settings) => {
    if (!settings?.enabled) return;

    const delay = calculateNextRun(settings.standupTime, settings.timezone);

    const timeoutId = setTimeout(() => {
      void postStandupReminder(client, guildId, settings).then(() => {
        scheduleStandupReminder(client, guildId);
      });
    }, delay);

    jobs.set(guildId, { guildId, timeoutId });
    logger.info(`Scheduled standup for guild ${guildId} in ${Math.round(delay / 60000)} minutes`);
  });
}

async function postStandupReminder(
  client: Client,
  guildId: string,
  settings: { channelId: string; standupTime: string; timezone: string; enabled: boolean }
): Promise<void> {
  try {
    const channel = client.channels.cache.get(settings.channelId) as TextChannel | undefined;
    if (!channel) {
      logger.warn(`Standup channel ${settings.channelId} not found for guild ${guildId}`);
      return;
    }

    const standup = await getStandup(guildId, settings.timezone);
    if (!standup || standup.entries.length === 0) {
      await channel.send('📋 Daily standup time! No standups submitted yet. Use `/standup` to submit yours.');
      return;
    }

    const { createStandupEmbed } = await import('../ui/standup-embed.js');
    const embed = createStandupEmbed(standup, settings.timezone);
    await channel.send({ embeds: [embed] });

    standup.postedAt = new Date().toISOString();
    const fullSettings = await getGuildSettings(guildId);
    if (fullSettings) {
      await setGuildSettings({ ...fullSettings, guildId });
    }

    logger.info(`Posted standup reminder for guild ${guildId}`);
  } catch (error) {
    logger.error(`Failed to post standup reminder for guild ${guildId}`, { error });
  }
}

export function cancelStandupReminder(guildId: string): void {
  const job = jobs.get(guildId);
  if (job) {
    clearTimeout(job.timeoutId);
    jobs.delete(guildId);
    logger.info(`Cancelled standup reminder for guild ${guildId}`);
  }
}

export function scheduleAllGuilds(_client: Client): void {
  logger.info('Scheduling standup reminders for all guilds...');
}