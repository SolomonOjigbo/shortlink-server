const Url = require('../models/Url');
const shortId = require('shortid');
const { validationResult } = require('express-validator');

// Helper function to validate URLs
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
};

exports.encodeUrl = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { longUrl } = req.body;
    
    // Check if URL already exists
    const existingUrl = await Url.findOne({ longUrl });
    if (existingUrl) {
      return res.json({ shortUrl: existingUrl.shortUrl });
    }

    const urlPath = shortId.generate();
    const shortUrl = `${req.protocol}://${req.get('host')}/${urlPath}`;

    const newUrl = new Url({
      longUrl,
      shortUrl,
      urlPath
    });

    await newUrl.save();
    res.status(201).json({ shortUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Decode (get original URL)
exports.decodeUrl = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shortUrl } = req.body;
    
    // Extract urlPath from shortUrl
    const urlPath = shortUrl.split('/').pop();
    const url = await Url.findOne({ urlPath });
    
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }
    
    res.json({ longUrl: url.longUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Redirect to original URL
exports.redirectUrl = async (req, res) => {
  try {
    const { urlPath } = req.params;
    const url = await Url.findOne({ urlPath });
    
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }
    
    // Update analytics
    url.clicks += 1;
    url.lastAccessed = new Date();
    await url.save();
    
    res.redirect(url.longUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get URL statistics
exports.getUrlStats = async (req, res) => {
  try {
    const { urlPath } = req.params;
    const url = await Url.findOne({ urlPath });
    
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }
    
    res.json({
      longUrl: url.longUrl,
      shortUrl: url.shortUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
      lastAccessed: url.lastAccessed
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// List all URLs with search functionality
exports.listUrls = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search && search.length >= 3) {
      query.longUrl = { $regex: search, $options: 'i' };
    }
    
    const urls = await Url.find(query).sort({ createdAt: -1 });
    res.json(urls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};