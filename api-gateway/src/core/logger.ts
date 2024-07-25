import { error } from "console";
import { createLogger, format, transports } from "winston";

const {combine, label, timestamp, printf} = format;

const LOG_FILE_PATH = 'logs/error.log';

const file = new transports.File({filename : LOG_FILE_PATH, level : 'error'})

