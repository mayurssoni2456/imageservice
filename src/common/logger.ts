import winston from 'winston';
import { config } from '../config/env';

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.simple()
);

export const logger = winston.createLogger({
  level: config.logLevel,
  format,
  transports: [new winston.transports.Console()],
});
