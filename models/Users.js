const mongoose = require('mongoose');

const schema = mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
  },
  pwd: String,
  isAdmin: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    default: null,
  },
  address: {
    type: String,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

const UsersModel = mongoose.model('user', schema);

module.exports = UsersModel;
