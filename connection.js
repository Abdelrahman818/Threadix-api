const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const cookies = require('cookie-parser');
const helmet = require('helmet');
// const expressRateLimit = require('express-rate-limit');
const path = require('path');

// App init
const app = express();
const PORT = 80;
require('dotenv').config();
app.use(express.json());
app.use(cookies());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Security
// app.use(helmet());
// app.use(expressRateLimit({
//   windowMs: 5 * 60 * 1000,
//   max: 200,
// }));
app.use(cors());

// Initialize routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/users', require('./routes/users'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/test', require('./routes/test'));

// Run server and Database connection
try {
  app.listen(PORT);
  mongoose
    .connect(process.env.DATABASE_CONNECTION_STRING)
    .catch((err) => {
      console.error(err.message);
      console.error('Something went wrong while connecting to MongoDB!!!');
    });
} catch (err) {
  console.error(err.message);
}
