require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const urlRoutes = require('./routes/urlRoutes');

const app = express();

// Connect to database
connectDB();


const corsOptions = {
    origin: 'https://shortlink-ecru.vercel.app',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false, 
    optionsSuccessStatus: 200
  };

// app.use(cors());

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));
app.use(express.json());

app.use('/api', urlRoutes);

app.get('/', (req, res) => {
  res.send('URL Shortener API is running');
});


// Error handling middleware for CORS
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: 'Invalid request' });
  } else if (err.message === 'CORS') {
    res.status(403).json({ error: 'CORS policy blocked this request' });
  }
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;