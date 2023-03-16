const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const path = require('path');

// Get the current date and time
const now = new Date();
const logDate = now.toISOString().slice(0, 10); // Format: YYYY-MM-DD
const logTime = now.toISOString().slice(11, 19); // Format: HH:mm:ss

// Define the log filename with the current date and time
const logFilename = `api_${logDate}_${logTime}.log`;
const logFilePath = path.join(__dirname, logFilename);

// Create the log directory if it doesn't exist
const logDir = path.dirname(logFilePath);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// the timestamp
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
 export