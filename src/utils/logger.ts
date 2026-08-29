export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  meta?: Record<string, unknown>;
}

class Logger {
  private level: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    if (level < this.level) return;

    const entry: LogEntry = { timestamp: new Date(), level, message, meta };
    this.logs.push(entry);

    const prefix = `[${LogLevel[level]}] ${entry.timestamp.toISOString()}`;
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`${prefix} ${message}${metaStr}`);
        break;
      case LogLevel.INFO:
        console.info(`${prefix} ${message}${metaStr}`);
        break;
      case LogLevel.WARN:
        console.warn(`${prefix} ${message}${metaStr}`);
        break;
      case LogLevel.ERROR:
        console.error(`${prefix} ${message}${metaStr}`);
        break;
    }
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, meta);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }
}

export const logger = new Logger();