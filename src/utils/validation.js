const validator = require('validator');
const { Log } = require('../middleware/logger');

function validateUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_host: true,
    require_valid_protocol: true
  });
}

function validateShortcode(shortcode) {
  if (!shortcode || typeof shortcode !== 'string') {
    return false;
  }
  
  const shortcodeRegex = /^[a-zA-Z0-9]{3,20}$/;
  return shortcodeRegex.test(shortcode);
}

function validateValidity(validity) {
  if (validity === undefined || validity === null) {
    return true;
  }
  
  if (typeof validity !== 'number' || validity <= 0) {
    return false;
  }
  
  return validity <= 525600;
}

function sanitizeString(str) {
  if (typeof str !== 'string') {
    return '';
  }
  return str.trim();
}

module.exports = {
  validateUrl,
  validateShortcode,
  validateValidity,
  sanitizeString
};
