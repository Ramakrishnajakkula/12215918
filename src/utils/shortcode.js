const { nanoid } = require('nanoid');
const Url = require('../models/url.model');
const { Log } = require('../middleware/logger');

async function generateShortcode(length = 6) {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const shortcode = nanoid(length);
    
    try {
      const existingUrl = await Url.findOne({ shortcode });
      
      if (!existingUrl) {
        await Log('backend', 'debug', 'shortcode-generator', `Generated unique shortcode: ${shortcode}`);
        return shortcode;
      }
      
      attempts++;
      await Log('backend', 'warn', 'shortcode-generator', `Shortcode collision detected: ${shortcode}, attempt: ${attempts}`);
    } catch (error) {
      await Log('backend', 'error', 'shortcode-generator', `Error checking shortcode uniqueness: ${error.message}`);
      throw error;
    }
  }
  
  if (length < 10) {
    await Log('backend', 'warn', 'shortcode-generator', `Increasing shortcode length to ${length + 1}`);
    return generateShortcode(length + 1);
  }
  
  await Log('backend', 'error', 'shortcode-generator', 'Failed to generate unique shortcode after maximum attempts');
  throw new Error('Unable to generate unique shortcode');
}

function validateShortcode(shortcode) {
  if (!shortcode || typeof shortcode !== 'string') {
    return false;
  }
  
  const shortcodeRegex = /^[a-zA-Z0-9]{3,20}$/;
  return shortcodeRegex.test(shortcode);
}

async function isShortcodeAvailable(shortcode) {
  try {
    const existingUrl = await Url.findOne({ shortcode });
    return !existingUrl;
  } catch (error) {
    await Log('backend', 'error', 'shortcode-generator', `Error checking shortcode availability: ${error.message}`);
    throw error;
  }
}

module.exports = {
  generateShortcode,
  validateShortcode,
  isShortcodeAvailable
};
