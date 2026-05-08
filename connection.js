// Dotenv
require('dotenv').config();

// Preparing required modules
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const cookies = require('cookie-parser');
const helmet = require('helmet');
const path = require('path');

// App init
const app = express();
const PORT = process.env.PORT || 8080;
app.use(express.json());
app.use(cookies());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

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

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      successful: false,
      msg: 'Invalid JSON body',
    });
  }
  return next(err);
});

// Run server and Database connection
try {
  app.listen(PORT, () => console.log("Server is running at port " + PORT));
  mongoose
    .connect(process.env.DATABASE_CONNECTION_STRING)
    .then(() => console.log('Database is connected successfully!!!'))
    .catch((err) => {
      console.error(err.message);
      console.error('Something went wrong while connecting to MongoDB!!!');
    });
} catch (err) {
  console.error(err.message);
}
