const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');

// API Endpoints
router.post('/encode', urlController.encodeUrl);
router.post('/decode', urlController.decodeUrl);
router.get('/statistic/:urlPath', urlController.getUrlStats);
router.get('/list', urlController.listUrls);

// Redirect endpoint
router.get('/:urlPath', urlController.redirectUrl);

module.exports = router;