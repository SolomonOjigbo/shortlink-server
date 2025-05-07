require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const urlRoutes = require('./routes/urlRoutes')

const app = express();

// Connect to database
connectDB();

const corsOptions = {
    origin: '*', 
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], 
    credentials: false 
  };
  

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 
app.use(express.json());

app.use('/', urlRoutes);




const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }

module.exports = app;