# Standup Bot

A Discord bot for async daily standups. Team members submit their standup via a modal, and the bot posts a summary in a designated channel at a scheduled time.

## Features

- `/standup submit` — Submit standup via modal (Yesterday, Today, Blockers)
- `/standup history` — View paginated standup history
- `/standup settings user` — Personal timezone, reminder time, DM preference
- `/standup settings guild` — Guild channel, time, timezone (admin only)
- Daily scheduled reminders with timezone/DST support
- Rich embeds with action buttons

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and add your Discord bot token
4. Run development: `npm run dev`
5. Build: `npm run build`
6. Start: `npm start`

## Commands

| Command | Description |
|---------|-------------|
| `/standup submit` | Open modal to submit standup |
| `/standup history` | View team standup history |
| `/standup settings user view` | View your personal settings |
| `/standup settings user edit` | Edit your personal settings |
| `/standup settings guild view` | View guild settings (admin) |
| `/standup settings guild edit` | Edit guild settings (admin) |

## Development

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Format code
npm run format

# Type check
npm run typecheck
```

## Project Structure

```
src/
├── bot.ts              # Discord client setup
├── index.ts            # Entry point
├── commands/           # Slash command handlers
├── data/               # Data layer (JSON file storage)
├── events/             # Discord event handlers
├── scheduler/          # Daily cron jobs
├── ui/                 # Embeds, modals, buttons
├── utils/              # Logger, helpers
└── validation/         # Zod schemas
```

## Git Workflow (Meta-style)

This project follows trunk-based development:

- `main` is always deployable
- Feature branches are short-lived (< 3 days)
- Rebase before merge
- Merge commits (not squash) to preserve topology
- Conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `chore:`
- Hotfixes branch from `main`, merge directly, tag immediately
- Releases use `release/vX.Y.Z` branch, tag on merge

## License

MIT