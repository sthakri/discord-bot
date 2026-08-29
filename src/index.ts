import { startBot } from './bot.js';

startBot().catch((error) => {
  console.error('Failed to start bot:', error);
  process.exit(1);
});