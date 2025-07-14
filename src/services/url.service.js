const Url = require('../models/url.model');
const { generateShortcode, isShortcodeAvailable } = require('../utils/shortcode');
const { validateUrl, validateShortcode, validateValidity } = require('../utils/validation');
const { Log } = require('../middleware/logger');
const moment = require('moment');

async function createShortUrl(originalUrl, customShortcode = null, validityMinutes = 30) {
  try {
    await Log('backend', 'info', 'url-service', 'URL shortening request received');
    
    if (!validateUrl(originalUrl)) {
      await Log('backend', 'error', 'url-service', 'Invalid URL format provided');
      throw new Error('Invalid URL format');
    }
    
    if (!validateValidity(validityMinutes)) {
      await Log('backend', 'error', 'url-service', 'Invalid validity duration provided');
      throw new Error('Invalid validity duration');
    }
    
    let shortcode;
    
    if (customShortcode) {
      if (!validateShortcode(customShortcode)) {
        await Log('backend', 'error', 'url-service', 'Invalid custom shortcode format');
        throw new Error('Invalid shortcode format');
      }
      
      const isAvailable = await isShortcodeAvailable(customShortcode);
      if (!isAvailable) {
        await Log('backend', 'warn', 'url-service', `Custom shortcode collision detected: ${customShortcode}`);
        throw new Error('Shortcode already exists');
      }
      
      shortcode = customShortcode;
    } else {
      shortcode = await generateShortcode();
    }
    
    const expiry = moment().add(validityMinutes, 'minutes').toDate();
    
    const urlDoc = new Url({
      originalUrl,
      shortcode,
      expiry,
      clickCount: 0,
      isActive: true
    });
    
    await urlDoc.save();
    
    await Log('backend', 'info', 'url-service', `URL successfully shortened: ${shortcode}`);
    
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return {
      shortLink: `${baseUrl}/${shortcode}`,
      expiry: expiry.toISOString()
    };
    
  } catch (error) {
    await Log('backend', 'error', 'url-service', `Error creating short URL: ${error.message}`);
    throw error;
  }
}

async function getOriginalUrl(shortcode) {
  try {
    await Log('backend', 'debug', 'url-service', `Looking up shortcode: ${shortcode}`);
    
    const urlDoc = await Url.findOne({ shortcode, isActive: true });
    
    if (!urlDoc) {
      await Log('backend', 'warn', 'url-service', `Shortcode not found: ${shortcode}`);
      return null;
    }
    
    if (urlDoc.isExpired()) {
      await Log('backend', 'warn', 'url-service', `Expired shortcode accessed: ${shortcode}`);
      return null;
    }
    
    await Log('backend', 'info', 'url-service', `Successful lookup for shortcode: ${shortcode}`);
    return urlDoc;
    
  } catch (error) {
    await Log('backend', 'error', 'url-service', `Error looking up shortcode: ${error.message}`);
    throw error;
  }
}

async function incrementClickCount(shortcode) {
  try {
    const urlDoc = await Url.findOne({ shortcode });
    if (urlDoc) {
      await urlDoc.incrementClick();
      await Log('backend', 'debug', 'url-service', `Click count incremented for: ${shortcode}`);
    }
  } catch (error) {
    await Log('backend', 'error', 'url-service', `Error incrementing click count: ${error.message}`);
  }
}

module.exports = {
  createShortUrl,
  getOriginalUrl,
  incrementClickCount
};
