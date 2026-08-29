# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-01-15

### Features
- Discord bot for async daily standups
- Slash commands: `/standup submit`, `/standup history`, `/standup settings`
- Modal-based standup submission (yesterday, today, blockers)
- Rich embeds with action buttons
- Daily scheduled reminders with timezone/DST support
- User preferences (timezone, reminder time, DM preference)
- Guild settings (channel, time, timezone)
- Standup history with pagination
- JSON file storage (no database required)

### Testing
- Unit tests for data layer and validation
- Integration tests for full standup flow
- Timezone and DST handling tests

### Infrastructure
- ESLint, Prettier, Husky, Vitest
- TypeScript strict mode
- Conventional commits

## [0.1.1] - 2024-01-10

### Fixes
- Prevent scheduler crash when standup channel is deleted

## [0.1.0] - 2024-01-05

### Features
- Initial bot skeleton with Discord.js v14
- Basic command registration
- JSON file data layer