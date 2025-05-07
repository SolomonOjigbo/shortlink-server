const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');
const { encodeUrlValidator, decodeUrlValidator } = require('../middleware/validator');

// API Endpoints
router.post('/encode', encodeUrlValidator, urlController.encodeUrl);
router.post('/decode', decodeUrlValidator, urlController.decodeUrl);
router.get('/statistic/:urlPath', urlController.getUrlStats);
router.get('/list', urlController.listUrls);

// Redirect endpoint
router.get('/:urlPath', urlController.redirectUrl);

module.exports = router;