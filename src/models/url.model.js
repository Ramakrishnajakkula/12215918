const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
    trim: true
  },
  shortcode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  expiry: {
    type: Date,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  clickCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

urlSchema.index({ shortcode: 1, expiry: 1 });
urlSchema.index({ createdAt: -1 });

urlSchema.methods.isExpired = function() {
  return new Date() > this.expiry;
};

urlSchema.methods.incrementClick = function() {
  this.clickCount += 1;
  return this.save();
};

const Url = mongoose.model('Url', urlSchema);

module.exports = Url;
