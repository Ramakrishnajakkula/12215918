const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  shortcode: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  referrer: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  location: {
    country: {
      type: String,
      default: null
    },
    city: {
      type: String,
      default: null
    }
  }
});

analyticsSchema.index({ shortcode: 1, timestamp: -1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics;
