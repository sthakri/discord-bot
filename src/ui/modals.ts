import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export function createStandupModal(): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId('standup_submit')
    .setTitle('Daily Standup Submission');

  const yesterday = new TextInputBuilder()
    .setCustomId('yesterday')
    .setLabel('What did you do yesterday?')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1000)
    .setPlaceholder('Completed feature X, reviewed PR #123...');

  const today = new TextInputBuilder()
    .setCustomId('today')
    .setLabel('What will you do today?')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1000)
    .setPlaceholder('Finish feature Y, deploy to staging...');

  const blockers = new TextInputBuilder()
    .setCustomId('blockers')
    .setLabel('Any blockers? (optional)')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
    .setMaxLength(1000)
    .setPlaceholder('Waiting for API access, need design review...');

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(yesterday),
    new ActionRowBuilder<TextInputBuilder>().addComponents(today),
    new ActionRowBuilder<TextInputBuilder>().addComponents(blockers)
  );

  return modal;
}

export function createUserSettingsModal(current?: { timezone: string; reminderTime: string; dmReminder: boolean }): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId('user_settings_submit')
    .setTitle('Your Standup Settings');

  const timezone = new TextInputBuilder()
    .setCustomId('timezone')
    .setLabel('Timezone (IANA format)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(50)
    .setValue(current?.timezone || 'UTC')
    .setPlaceholder('America/New_York, Europe/London, Asia/Tokyo...');

  const reminderTime = new TextInputBuilder()
    .setCustomId('reminderTime')
    .setLabel('Reminder time (24h format)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(5)
    .setValue(current?.reminderTime || '09:00')
    .setPlaceholder('09:00');

  const dmReminder = new TextInputBuilder()
    .setCustomId('dmReminder')
    .setLabel('DM reminder? (true/false)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(5)
    .setValue(String(current?.dmReminder || false))
    .setPlaceholder('true or false');

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(timezone),
    new ActionRowBuilder<TextInputBuilder>().addComponents(reminderTime),
    new ActionRowBuilder<TextInputBuilder>().addComponents(dmReminder)
  );

  return modal;
}

export function createGuildSettingsModal(current?: { channelId: string; standupTime: string; timezone: string }): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId('guild_settings_submit')
    .setTitle('Guild Standup Settings');

  const channelId = new TextInputBuilder()
    .setCustomId('channelId')
    .setLabel('Channel ID for standup posts')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(20)
    .setValue(current?.channelId || '')
    .setPlaceholder('123456789012345678');

  const standupTime = new TextInputBuilder()
    .setCustomId('standupTime')
    .setLabel('Standup time (24h format)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(5)
    .setValue(current?.standupTime || '09:00')
    .setPlaceholder('09:00');

  const timezone = new TextInputBuilder()
    .setCustomId('timezone')
    .setLabel('Timezone (IANA format)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(50)
    .setValue(current?.timezone || 'UTC')
    .setPlaceholder('America/New_York, Europe/London, Asia/Tokyo...');

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(channelId),
    new ActionRowBuilder<TextInputBuilder>().addComponents(standupTime),
    new ActionRowBuilder<TextInputBuilder>().addComponents(timezone)
  );

  return modal;
}