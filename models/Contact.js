const mongoose = require('mongoose');

const schema = mongoose.Schema({
  name: String,
  email: String,
  msg: String,
  subj: String,
  isAdmin: Boolean,
  phone: String,
  address: String,
  isLoggedIn: Boolean,
  isRead: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

const ContactModel = mongoose.model('contact', schema);

module.exports = ContactModel;
