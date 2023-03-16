import { createLogger, format, transports } from 'winston';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

// Get the current date and time
const now = new Date();
const logDate = now.toISOString().slice(0, 10); // Format: YYYY-MM-DD
const logTime = now.toISOString().slice(11, 19); // Format: HH:mm:ss

// Define the log filename with the current date and time
const logFilename = `api_${logDate}_${logTime}.log`;
const logFilePath = join('C:/Users/Ramkumar/Desktop/logs', logFilename);
console.log(logFilePath)

// Create the log directory if it doesn't exist
const logDir = dirname(logFilePath);
if (!existsSync(logDir)) {
  mkdirSync(logDir, { recursive: true });
  console.log(logDir);
}

// Define the custom format for the timestamp
const timestampFormat = format.timestamp({
  format: 'YYYY-MM-DD HH:mm:ss'
});

// Create the logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    timestampFormat,
    format.json()
  ),
  transports:[
    new transports.File({
      filename: logFilePath,
      level:'info'
    })
  ]
});

export default logger;
