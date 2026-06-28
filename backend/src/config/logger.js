import winston from "winston";

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",

  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    logFormat
  ),

  transports: [    //logs appear in the terminal
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        logFormat
      ),
    }),

    new winston.transports.File({      //store only errors
      filename: "logs/error.log",
      level: "error",
    }),
   
    new winston.transports.File({         //for combined logs
      filename: "logs/combined.log",
    }),
  ],
});

export default logger;