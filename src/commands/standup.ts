import type { ChatInputCommandInteraction, ModalSubmitInteraction, ButtonInteraction } from 'discord.js';
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { addStandupEntry, getStandupHistory, getUserPreferences, setUserPreferences } from '../data/standup.js';
import { createStandupModal, createUserSettingsModal, createGuildSettingsModal } from '../ui/modals.js';
import { createStandupHistoryEmbed } from '../ui/standup-embed.js';
import { validateStandupModal, validateUserPreferences, validateGuildSettings } from '../validation/standup.js';
import { logger } from '../utils/logger.js';

export const standupCommand = new SlashCommandBuilder()
  .setName('standup')
  .setDescription('Daily standup commands')
  .addSubcommand((sub) =>
    sub.setName('submit').setDescription('Submit your daily standup')
  )
  .addSubcommand((sub) =>
    sub.setName('history').setDescription('View standup history').addIntegerOption((opt) =>
      opt.setName('page').setDescription('Page number').setMinValue(1).setRequired(false)
    )
  )
  .addSubcommand((sub) =>
    sub.setName('settings_user_view').setDescription('View your personal standup settings')
  )
  .addSubcommand((sub) =>
    sub.setName('settings_user_edit').setDescription('Edit your personal standup settings')
  )
  .addSubcommand((sub) =>
    sub.setName('settings_guild_view').setDescription('View guild standup settings (admin only)')
  )
  .addSubcommand((sub) =>
    sub.setName('settings_guild_edit').setDescription('Edit guild standup settings (admin only)')
  );

export async function handleStandupCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'submit') {
    await interaction.showModal(createStandupModal());
    return;
  }

  if (subcommand === 'history') {
    const page = interaction.options.getInteger('page') || 1;
    const guildId = interaction.guildId!;
    const { getGuildSettings } = await import('../data/standup.js');
    const settings = await getGuildSettings(guildId);
    const tz = settings?.timezone || 'UTC';

    const history = await getStandupHistory(guildId, 5 * page);
    const start = (page - 1) * 5;
    const pageItems = history.slice(start, start + 5);

    const embed = createStandupHistoryEmbed(pageItems, page, tz);
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  if (subcommand === 'settings_user_view') {
    const prefs = await getUserPreferences(interaction.user.id, interaction.guildId!);
    if (!prefs) {
      await interaction.reply({ content: 'No settings found. Use `/standup settings_user_edit` to set them up.', ephemeral: true });
      return;
    }
    await interaction.reply({
      content: `**Your Settings:**\nTimezone: ${prefs.timezone}\nReminder: ${prefs.reminderTime}\nDM Reminder: ${prefs.dmReminder ? 'Enabled' : 'Disabled'}`,
      ephemeral: true,
    });
    return;
  }

  if (subcommand === 'settings_user_edit') {
    const prefs = await getUserPreferences(interaction.user.id, interaction.guildId!);
    await interaction.showModal(createUserSettingsModal(prefs));
    return;
  }

  if (subcommand === 'settings_guild_view') {
    const { getGuildSettings } = await import('../data/standup.js');
    const settings = await getGuildSettings(interaction.guildId!);
    if (!settings) {
      await interaction.reply({ content: 'No guild settings configured.', ephemeral: true });
      return;
    }
    await interaction.reply({
      content: `**Guild Settings:**\nChannel: <#${settings.channelId}>\nTime: ${settings.standupTime}\nTimezone: ${settings.timezone}\nEnabled: ${settings.enabled ? 'Yes' : 'No'}`,
      ephemeral: true,
    });
    return;
  }

  if (subcommand === 'settings_guild_edit') {
    const { getGuildSettings } = await import('../data/standup.js');
    const settings = await getGuildSettings(interaction.guildId!);
    await interaction.showModal(createGuildSettingsModal(settings));
    return;
  }
}

export async function handleStandupModal(interaction: ModalSubmitInteraction): Promise<void> {
  if (interaction.customId === 'standup_submit') {
    const yesterday = interaction.fields.getTextInputValue('yesterday');
    const today = interaction.fields.getTextInputValue('today');
    const blockers = interaction.fields.getTextInputValue('blockers');

    try {
      validateStandupModal({ yesterday, today, blockers });
    } catch {
      await interaction.reply({ content: 'Invalid input. Please check your entries.', ephemeral: true });
      return;
    }

    const { getGuildSettings } = await import('../data/standup.js');
    const settings = await getGuildSettings(interaction.guildId!);
    const tz = settings?.timezone || 'UTC';

    await addStandupEntry(interaction.guildId!, tz, {
      userId: interaction.user.id,
      username: interaction.user.username,
      yesterday,
      today,
      blockers,
      submittedAt: new Date().toISOString(),
    });

    await interaction.reply({ content: '✅ Standup submitted successfully!', ephemeral: true });
    logger.info('Standup submitted', { userId: interaction.user.id, guildId: interaction.guildId });
    return;
  }

  if (interaction.customId === 'user_settings_submit') {
    const timezone = interaction.fields.getTextInputValue('timezone');
    const reminderTime = interaction.fields.getTextInputValue('reminderTime');
    const dmReminder = interaction.fields.getTextInputValue('dmReminder') === 'true';

    try {
      validateUserPreferences({ userId: interaction.user.id, guildId: interaction.guildId!, timezone, reminderTime, dmReminder });
    } catch {
      await interaction.reply({ content: 'Invalid settings. Check timezone format and time (HH:MM).', ephemeral: true });
      return;
    }

    await setUserPreferences({ userId: interaction.user.id, guildId: interaction.guildId!, timezone, reminderTime, dmReminder });
    await interaction.reply({ content: '✅ Settings saved!', ephemeral: true });
    logger.info('User preferences updated', { userId: interaction.user.id, guildId: interaction.guildId });
    return;
  }

  if (interaction.customId === 'guild_settings_submit') {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({ content: 'You need Manage Server permission.', ephemeral: true });
      return;
    }

    const channelId = interaction.fields.getTextInputValue('channelId');
    const standupTime = interaction.fields.getTextInputValue('standupTime');
    const timezone = interaction.fields.getTextInputValue('timezone');

    try {
      validateGuildSettings({ guildId: interaction.guildId!, channelId, standupTime, timezone, enabled: true });
    } catch {
      await interaction.reply({ content: 'Invalid settings. Check channel ID, time format (HH:MM), and timezone.', ephemeral: true });
      return;
    }

    const { setGuildSettings } = await import('../data/standup.js');
    await setGuildSettings({ guildId: interaction.guildId!, channelId, standupTime, timezone, enabled: true });

    const { scheduleStandupReminder } = await import('../scheduler/standup-scheduler.js');
    scheduleStandupReminder(interaction.client, interaction.guildId!);

    await interaction.reply({ content: '✅ Guild settings saved and standup scheduled!', ephemeral: true });
    logger.info('Guild settings updated', { guildId: interaction.guildId });
    return;
  }
}

export async function handleStandupButton(interaction: ButtonInteraction): Promise<void> {
  const [action] = interaction.customId.split(':');

  if (action === 'standup_edit') {
    await interaction.showModal(createStandupModal());
    return;
  }

  if (action === 'standup_delete') {
    await interaction.reply({ content: 'Delete functionality coming soon!', ephemeral: true });
    return;
  }

  if (action === 'standup_react') {
    await interaction.reply({ content: '👍', ephemeral: true });
    return;
  }
}/ /   C o m m a n d   r e g i s t r a t i o n  
 