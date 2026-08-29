import type { SlashCommandBuilder } from 'discord.js';
import { Client, GatewayIntentBits, Events, Collection } from 'discord.js';
import { config } from 'dotenv';
import { standupCommand, handleStandupCommand, handleStandupModal, handleStandupButton } from './commands/standup.js';
import { scheduleAllGuilds, cancelStandupReminder } from './scheduler/standup-scheduler.js';
import { logger } from './utils/logger.js';

config();

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

export const commands = new Collection<string, ReturnType<SlashCommandBuilder['toJSON']>>();

commands.set(standupCommand.name, standupCommand.toJSON());

client.once(Events.ClientReady, (c) => {
  void (async () => {
    logger.info(`Logged in as ${c.user.tag}`);

    try {
      await c.application.commands.set(Array.from(commands.values()));
      logger.info('Slash commands registered globally');
    } catch (error) {
      logger.error('Failed to register commands', { error });
    }

    scheduleAllGuilds(c);
  })();
});

client.on(Events.InteractionCreate, (interaction) => {
  void (async () => {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === 'standup') {
        await handleStandupCommand(interaction);
      }
    } else if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith('standup_') || interaction.customId === 'user_settings_submit' || interaction.customId === 'guild_settings_submit') {
        await handleStandupModal(interaction);
      }
    } else if (interaction.isButton()) {
      if (interaction.customId.startsWith('standup_')) {
        await handleStandupButton(interaction);
      }
    }
  })();
});

client.on(Events.GuildDelete, (guild) => {
  cancelStandupReminder(guild.id);
  logger.info(`Bot removed from guild ${guild.name} (${guild.id}), cancelled reminders`);
});

client.on(Events.Error, (error) => {
  logger.error('Discord client error', { error });
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error });
  process.exit(1);
});

export async function startBot(): Promise<void> {
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    logger.error('DISCORD_TOKEN not set in environment');
    process.exit(1);
  }

  await client.login(token);
}