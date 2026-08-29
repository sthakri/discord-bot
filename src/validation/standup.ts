import { z } from 'zod';

export const StandupEntrySchema = z.object({
  userId: z.string().min(1),
  username: z.string().min(1),
  yesterday: z.string().min(1).max(1000),
  today: z.string().min(1).max(1000),
  blockers: z.string().max(1000).optional().default(''),
});

export const UserPreferencesSchema = z.object({
  userId: z.string().min(1),
  guildId: z.string().min(1),
  timezone: z.string().min(1).default('UTC'),
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).default('09:00'),
  dmReminder: z.boolean().default(false),
});

export const GuildSettingsSchema = z.object({
  guildId: z.string().min(1),
  channelId: z.string().min(1),
  standupTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).default('09:00'),
  timezone: z.string().min(1).default('UTC'),
  enabled: z.boolean().default(true),
});

export const StandupModalSchema = z.object({
  yesterday: z.string().min(1).max(1000),
  today: z.string().min(1).max(1000),
  blockers: z.string().max(1000).optional().default(''),
});

export type StandupEntryInput = z.infer<typeof StandupEntrySchema>;
export type UserPreferencesInput = z.infer<typeof UserPreferencesSchema>;
export type GuildSettingsInput = z.infer<typeof GuildSettingsSchema>;
export type StandupModalInput = z.infer<typeof StandupModalSchema>;

export function validateStandupEntry(data: unknown): StandupEntryInput {
  return StandupEntrySchema.parse(data);
}

export function validateUserPreferences(data: unknown): UserPreferencesInput {
  return UserPreferencesSchema.parse(data);
}

export function validateGuildSettings(data: unknown): GuildSettingsInput {
  return GuildSettingsSchema.parse(data);
}

export function validateStandupModal(data: unknown): StandupModalInput {
  return StandupModalSchema.parse(data);
}