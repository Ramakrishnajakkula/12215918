const express = require('express');
const {
  createShortUrlController,
  redirectController,
  getStatisticsController
} = require('../controllers/url.controller');

const router = express.Router();

router.post('/shorturls', createShortUrlController);

router.get('/shorturls/:shortcode', getStatisticsController);

router.get('/:shortcode', redirectController);

module.exports = router;
