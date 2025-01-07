const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
mongoose
  .connect(process.env.DB)
  .then(() => {
    console.log('Database is connected');
  })
  .catch((err) => {
    console.log(`Can not connect to the database ${err}`);
  });

module.exports = mongoose;
