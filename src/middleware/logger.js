const axios = require('axios');

async function Log(stack, level, pkg, message) {
  const timestamp = new Date().toISOString();
  
  const logPayload = {
    stack: stack,
    level: level,
    package: pkg,
    message: message,
    timestamp: timestamp
  };

  try {
    const logServerUrl = process.env.LOG_SERVER_URL || 'https://test-server.com/api/logs';
    
    await axios.post(logServerUrl, logPayload, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'URL-Shortener-Service/1.0'
      }
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${timestamp}] ${level.toUpperCase()} [${stack}:${pkg}] ${message}`);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Logging service unavailable:', error.message);
      console.log(`[${timestamp}] ${level.toUpperCase()} [${stack}:${pkg}] ${message}`);
    }
  }
}

const Logger = {
  info: (stack, pkg, message) => Log(stack, 'info', pkg, message),
  warn: (stack, pkg, message) => Log(stack, 'warn', pkg, message),
  error: (stack, pkg, message) => Log(stack, 'error', pkg, message),
  fatal: (stack, pkg, message) => Log(stack, 'fatal', pkg, message),
  debug: (stack, pkg, message) => Log(stack, 'debug', pkg, message)
};

module.exports = { Log, Logger };
