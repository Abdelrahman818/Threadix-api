const express = require('express');
const route = express.Router();

const {
  loginValidation,
  signupValidation,
  verifyToken,
} = require('../middleware/authValidation');

const mailValidation = require('../middleware/varificationMail');

const {
  authorizingUser,
  defineRole,
} = require('../middleware/verifyUser');

const {
  login,
  signup,
  logout,
  getCurrentUser,
} = require('../controllers/authController.js');

route.post('/login', loginValidation, login);
route.post('/signup', signupValidation, mailValidation);

route.get('/verifyUser', authorizingUser, signup);
route.get('/verifyToken', verifyToken);
route.get('/getRole', defineRole);
route.get('/getCurrentUser', getCurrentUser);
route.get('/logout', logout);

module.exports = route;
