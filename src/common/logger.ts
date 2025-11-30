import winston from 'winston';
export function getLogger(label: string): winston.Logger {
  return winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.label({ label }),
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.printf(({ timestamp, level, message, label, ...meta }) => {
        return `${String(timestamp)} [${String(label)}] ${String(level)}: ${String(message)}${Object.keys(meta).length ? ' ' + JSON.stringify(meta) : ''}`;
      })
    ),
    transports: [new winston.transports.Console()],
  });
}
