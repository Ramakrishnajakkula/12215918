const Analytics = require('../models/analytics.model');
const Url = require('../models/url.model');
const { Log } = require('../middleware/logger');

async function recordClick(shortcode, req) {
  try {
    const clickData = {
      shortcode,
      timestamp: new Date(),
      referrer: req.get('Referrer') || req.get('Referer') || null,
      userAgent: req.get('User-Agent') || null,
      ipAddress: getClientIP(req),
      location: await getLocationFromIP(getClientIP(req))
    };
    
    const analytics = new Analytics(clickData);
    await analytics.save();
    
    await Log('backend', 'debug', 'analytics-service', `Click recorded for shortcode: ${shortcode}`);
    
  } catch (error) {
    await Log('backend', 'error', 'analytics-service', `Error recording click: ${error.message}`);
  }
}

async function getStatistics(shortcode) {
  try {
    await Log('backend', 'info', 'analytics-service', `Statistics requested for shortcode: ${shortcode}`);
    
    const urlDoc = await Url.findOne({ shortcode });
    if (!urlDoc) {
      await Log('backend', 'warn', 'analytics-service', `Statistics requested for non-existent shortcode: ${shortcode}`);
      return null;
    }
    
    const clickData = await Analytics.find({ shortcode })
      .sort({ timestamp: -1 })
      .select('-_id -__v');
    
    const statistics = {
      totalClicks: urlDoc.clickCount,
      originalUrl: urlDoc.originalUrl,
      createdAt: urlDoc.createdAt.toISOString(),
      expiry: urlDoc.expiry.toISOString(),
      clickData: clickData.map(click => ({
        timestamp: click.timestamp.toISOString(),
        referrer: click.referrer,
        location: click.location
      }))
    };
    
    await Log('backend', 'info', 'analytics-service', `Statistics retrieved for shortcode: ${shortcode}`);
    return statistics;
    
  } catch (error) {
    await Log('backend', 'error', 'analytics-service', `Error retrieving statistics: ${error.message}`);
    throw error;
  }
}

function getClientIP(req) {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         '127.0.0.1';
}

async function getLocationFromIP(ip) {
  try {
    if (!ip || ip === '127.0.0.1' || ip === '::1') {
      return {
        country: 'Local',
        city: 'Development'
      };
    }
    
    return {
      country: 'Unknown',
      city: 'Unknown'
    };
    
  } catch (error) {
    await Log('backend', 'warn', 'analytics-service', `Error getting location for IP: ${error.message}`);
    return {
      country: 'Unknown',
      city: 'Unknown'
    };
  }
}

module.exports = {
  recordClick,
  getStatistics
};
