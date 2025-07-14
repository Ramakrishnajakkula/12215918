const { createShortUrl, getOriginalUrl, incrementClickCount } = require('../services/url.service');
const { recordClick, getStatistics } = require('../services/analytics.service');
const { Log } = require('../middleware/logger');

async function createShortUrlController(req, res) {
  try {
    await Log('backend', 'info', 'url-controller', 'URL shortening request received');
    
    const { url, validity, shortcode } = req.body;
    
    if (!url) {
      await Log('backend', 'error', 'url-controller', 'Missing required field: url');
      return res.status(400).json({
        error: {
          code: 'MISSING_URL',
          message: 'URL is required',
          timestamp: new Date().toISOString()
        }
      });
    }
    
    const validityMinutes = validity || 30;
    
    const result = await createShortUrl(url, shortcode, validityMinutes);
    
    await Log('backend', 'info', 'url-controller', `Short URL created successfully: ${shortcode || 'auto-generated'}`);
    
    res.status(201).json(result);
    
  } catch (error) {
    await Log('backend', 'error', 'url-controller', `Error creating short URL: ${error.message}`);
    
    if (error.message === 'Invalid URL format') {
      return res.status(400).json({
        error: {
          code: 'INVALID_URL',
          message: 'The provided URL format is invalid',
          timestamp: new Date().toISOString()
        }
      });
    }
    
    if (error.message === 'Shortcode already exists') {
      return res.status(409).json({
        error: {
          code: 'SHORTCODE_COLLISION',
          message: 'The requested shortcode is already in use',
          timestamp: new Date().toISOString()
        }
      });
    }
    
    if (error.message === 'Invalid shortcode format') {
      return res.status(400).json({
        error: {
          code: 'INVALID_SHORTCODE',
          message: 'Shortcode must be alphanumeric and 3-20 characters long',
          timestamp: new Date().toISOString()
        }
      });
    }
    
    if (error.message === 'Invalid validity duration') {
      return res.status(400).json({
        error: {
          code: 'INVALID_VALIDITY',
          message: 'Validity must be a positive number of minutes',
          timestamp: new Date().toISOString()
        }
      });
    }
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An internal server error occurred',
        timestamp: new Date().toISOString()
      }
    });
  }
}

async function redirectController(req, res) {
  try {
    const { shortcode } = req.params;
    
    await Log('backend', 'info', 'redirect-handler', `Redirect request for shortcode: ${shortcode}`);
    
    const urlDoc = await getOriginalUrl(shortcode);
    
    if (!urlDoc) {
      await Log('backend', 'error', 'redirect-handler', `Shortcode not found or expired: ${shortcode}`);
      return res.status(404).json({
        error: {
          code: 'SHORTCODE_NOT_FOUND',
          message: 'The requested shortcode does not exist or has expired',
          timestamp: new Date().toISOString()
        }
      });
    }
    
    recordClick(shortcode, req);
    
    incrementClickCount(shortcode);
    
    await Log('backend', 'info', 'redirect-handler', `Successful redirect performed for: ${shortcode}`);
    
    res.redirect(302, urlDoc.originalUrl);
    
  } catch (error) {
    await Log('backend', 'error', 'redirect-handler', `Error during redirect: ${error.message}`);
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An internal server error occurred',
        timestamp: new Date().toISOString()
      }
    });
  }
}

/**
 * GET /shorturls/:shortcode - Get Statistics
 */
async function getStatisticsController(req, res) {
  try {
    const { shortcode } = req.params;
    
    await Log('backend', 'info', 'url-controller', `Statistics request for shortcode: ${shortcode}`);
    
    const statistics = await getStatistics(shortcode);
    
    if (!statistics) {
      await Log('backend', 'warn', 'url-controller', `Statistics requested for non-existent shortcode: ${shortcode}`);
      return res.status(404).json({
        error: {
          code: 'SHORTCODE_NOT_FOUND',
          message: 'The requested shortcode does not exist',
          timestamp: new Date().toISOString()
        }
      });
    }
    
    await Log('backend', 'info', 'url-controller', `Statistics retrieved successfully for: ${shortcode}`);
    
    res.status(200).json(statistics);
    
  } catch (error) {
    await Log('backend', 'error', 'url-controller', `Error retrieving statistics: ${error.message}`);
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An internal server error occurred',
        timestamp: new Date().toISOString()
      }
    });
  }
}

module.exports = {
  createShortUrlController,
  redirectController,
  getStatisticsController
};
