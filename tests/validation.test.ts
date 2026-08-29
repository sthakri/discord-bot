import { describe, it, expect } from 'vitest';
import { validateStandupModal, validateUserPreferences, validateGuildSettings } from '../src/validation/standup.js';

describe('Validation Schemas', () => {
  describe('validateStandupModal', () => {
    it('accepts valid standup input', () => {
      const input = {
        yesterday: 'Completed feature X',
        today: 'Working on feature Y',
        blockers: 'Waiting for review',
      };
      expect(() => validateStandupModal(input)).not.toThrow();
    });

    it('accepts minimal valid input', () => {
      const input = { yesterday: 'Did stuff', today: 'Doing stuff' };
      expect(() => validateStandupModal(input)).not.toThrow();
    });

    it('rejects empty yesterday', () => {
      expect(() => validateStandupModal({ yesterday: '', today: 'Today' })).toThrow();
    });

    it('rejects too long yesterday', () => {
      expect(() => validateStandupModal({ yesterday: 'a'.repeat(1001), today: 'Today' })).toThrow();
    });
  });

  describe('validateUserPreferences', () => {
    it('accepts valid preferences', () => {
      const input = {
        userId: '123',
        guildId: '456',
        timezone: 'America/New_York',
        reminderTime: '09:00',
        dmReminder: true,
      };
      expect(() => validateUserPreferences(input)).not.toThrow();
    });

    it('rejects invalid time format', () => {
      expect(() => validateUserPreferences({
        userId: '123', guildId: '456', timezone: 'UTC', reminderTime: '9:00', dmReminder: false
      })).toThrow();
    });

    it('rejects invalid timezone', () => {
      expect(() => validateUserPreferences({
        userId: '123', guildId: '456', timezone: '', reminderTime: '09:00', dmReminder: false
      })).toThrow();
    });
  });

  describe('validateGuildSettings', () => {
    it('accepts valid settings', () => {
      const input = {
        guildId: '123',
        channelId: '456',
        standupTime: '10:30',
        timezone: 'Europe/London',
        enabled: true,
      };
      expect(() => validateGuildSettings(input)).not.toThrow();
    });

    it('rejects invalid channel ID', () => {
      expect(() => validateGuildSettings({
        guildId: '123', channelId: '', standupTime: '09:00', timezone: 'UTC', enabled: true
      })).toThrow();
    });
  });
});