const mongoose = require('mongoose');

const schema = mongoose.Schema({
  userId: String,
  items: [{
    productId: String,
    quantity: String,
    color: String,
    size: String,
  }],
}, {
  timestamps: true,
});

const CartModel = mongoose.model('cart', schema);

module.exports = CartModel;
