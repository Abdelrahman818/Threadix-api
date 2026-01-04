const mongoose = require('mongoose');

const schema = mongoose.Schema({
  title: String,
  desc: String,
  category: String,
  price: Number,
  salePrice: Number,
  stock: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  size: [String],
  colors: [String],
  images: [String],
}, {
  timestamps: true,
});

const ProductsModel = mongoose.model('product', schema);

module.exports = ProductsModel;
