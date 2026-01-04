const mongoose = require('mongoose');

const schema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
  },
  image: String,
  isActive: Boolean,
  imgUrl: String,
}, {
  timestamps: true,
});

const CatModel = mongoose.model('cat', schema);

module.exports = CatModel;
