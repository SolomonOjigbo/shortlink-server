require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const urlRoutes = require('./routes/urlRoutes');

const app = express();

// Connect to database
connectDB();

app.use(cors());
app.use(express.json());

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204
};


app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

app.use('/', urlRoutes);

// Error handling middleware for CORS
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: 'Invalid token' });
  } else if (err.message === 'CORS') {
    res.status(403).json({ error: 'CORS policy blocked this request' });
  }
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;