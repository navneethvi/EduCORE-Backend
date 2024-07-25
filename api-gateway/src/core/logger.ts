// src/core/logger.ts
import { createLogger, format, transports } from 'winston';

const { combine, label, timestamp, printf } = format;

function createFormatWrap(opts: { [key: string]: any }) {
    return printf(({ level, message, label: logLabel, timestamp: logTimestamp }) => {
      return `${logTimestamp} [${logLabel}] ${level}: ${message}`;
    });
  }

const LOG_FILE_PATH = 'logs/error.log';

const fileTransport = new transports.File({ filename: LOG_FILE_PATH, level: 'error' });
const consoleTransport = new transports.Console();

const logFormat = createFormatWrap({});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    label({ label: process.env.NODE_ENV || 'localhost' }),
    timestamp(),
    logFormat
  ),
  transports: [fileTransport],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(consoleTransport);
}

export default logger;
