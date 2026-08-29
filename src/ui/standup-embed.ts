import { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import type { Standup } from '../data/standup.js';

export function createStandupEmbed(standup: Standup, timezone: string): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(`📋 Daily Standup — ${standup.date} (${timezone})`)
    .setColor(Colors.Blue)
    .setTimestamp()
    .setFooter({ text: `Guild: ${standup.guildId}` });

  if (standup.entries.length === 0) {
    embed.setDescription('No standups submitted yet. Use `/standup` to submit yours!');
    return embed;
  }

  for (const entry of standup.entries) {
    embed.addFields(
      { name: `👤 ${entry.username}`, value: '\u200B', inline: false },
      { name: '✅ Yesterday', value: entry.yesterday || '—', inline: true },
      { name: '🎯 Today', value: entry.today || '—', inline: true },
      { name: '🚧 Blockers', value: entry.blockers || 'None', inline: true }
    );
  }

  return embed;
}

export function createStandupHistoryEmbed(standups: Standup[], page: number, _timezone: string): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(`📜 Standup History — Page ${page}`)
    .setColor(Colors.DarkBlue)
    .setTimestamp();

  if (standups.length === 0) {
    embed.setDescription('No standup history found.');
    return embed;
  }

  for (const standup of standups) {
    const entryCount = standup.entries.length;
    const posted = standup.postedAt ? ` ✅ Posted` : '';
    embed.addFields({
      name: `${standup.date}${posted} (${entryCount} entries)`,
      value: standup.entries.map((e) => `• ${e.username}`).join('\n') || 'No entries',
      inline: false,
    });
  }

  return embed;
}

export function createUserStandupEmbed(entries: { date: string; entry: { yesterday: string; today: string; blockers: string } }[]): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle('📊 Your Standup History')
    .setColor(Colors.Green)
    .setTimestamp();

  if (entries.length === 0) {
    embed.setDescription('You haven\'t submitted any standups yet.');
    return embed;
  }

  for (const { date, entry } of entries) {
    embed.addFields(
      { name: `📅 ${date}`, value: '\u200B', inline: false },
      { name: '✅ Yesterday', value: entry.yesterday, inline: true },
      { name: '🎯 Today', value: entry.today, inline: true },
      { name: '🚧 Blockers', value: entry.blockers || 'None', inline: true }
    );
  }

  return embed;
}

export function createStandupButtons(standupId: string): ActionRowBuilder<ButtonBuilder> {
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`standup_edit:${standupId}`)
      .setLabel('Edit')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`standup_delete:${standupId}`)
      .setLabel('Delete')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`standup_react:${standupId}`)
      .setLabel('React')
      .setStyle(ButtonStyle.Secondary)
  );
  return row;
}