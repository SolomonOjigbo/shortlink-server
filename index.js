require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const urlRoutes = require('./routes/urlRoutes')

const app = express();

// Connect to database
connectDB();

const corsOptions = {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      // List of allowed domains
      const allowedDomains = [
        'http://localhost:3000', 
        'https://shortlink-ecru.vercel.app/'
      ];
      
      if (allowedDomains.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  };
  
  // Middleware
  app.use(cors(corsOptions));
app.use(express.json());

app.use('/', urlRoutes);




const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }

module.exports = app;