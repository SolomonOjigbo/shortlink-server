const Url = require('../models/Url');
const shortId = require('shortid');

// Encode (shorten) URL
exports.encodeUrl = async (req, res) => {
  try {
    const { longUrl } = req.body;
    const urlPath = shortId.generate();
    const shortUrl = `${req.protocol}://${req.get('host')}/${urlPath}`;

    const newUrl = new Url({
      longUrl,
      shortUrl,
      urlPath
    });

    await newUrl.save();
    res.json({ shortUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Decode (get original URL)
exports.decodeUrl = async (req, res) => {
  try {
    const { shortUrl } = req.body;
    const url = await Url.findOne({ shortUrl });
    
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
    const url = await Url.findOne({ urlPath: req.params.urlPath });
    
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }
    
    url.clicks += 1;
    url.lastAccessed = Date.now();
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
    const url = await Url.findOne({ urlPath: req.params.urlPath });
    
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