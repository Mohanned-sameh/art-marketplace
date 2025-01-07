const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('./config/db');
// Load environment variables
require('dotenv').config();

// Create express app
const app = express();

// Setup server port
const port = process.env.PORT || 5000;

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Parse requests of content-type - application/json
app.use(bodyParser.json());

// Enable CORS
app.use(cors());

// Secure your app by setting various HTTP headers
app.use(helmet());

// initiate mongodb connection
app.use((req, res, next) => {
  mongoose.connection.on('open', () => {
    console.log('MongoDB connection established');
  });

  mongoose.connection.on('error', (err) => {
    console.log(`MongoDB connection error: ${err}`);
  });
  next();
});

// Define a root route
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
