const express = require('express');
const route = express.Router();

const {
  getAllUsers,
  modifyUser,
  getMatchedUsers,
  filteredUsers,
  getUserInfo,
  updateProfile
} = require('../controllers/usersController');

const {
  verifyAdmin,
  authorizingUser
} = require('../middleware/verifyUser');

route.get('/', verifyAdmin, getAllUsers);
route.get('/search/:search', verifyAdmin, getMatchedUsers);
route.get('/filter', verifyAdmin, filteredUsers);
route.get('/userInfo', getUserInfo);

// Profile route must come before /:id to avoid route conflicts
route.patch('/profile', authorizingUser, updateProfile);
route.patch('/:id', verifyAdmin, modifyUser);

module.exports = route;
