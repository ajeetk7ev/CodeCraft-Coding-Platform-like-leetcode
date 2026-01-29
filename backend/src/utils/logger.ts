import winston from "winston";

const { combine, timestamp, printf, colorize, errors } = winston.format;

const myFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    myFormat,
  ),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), myFormat),
    }),
  ],
});
