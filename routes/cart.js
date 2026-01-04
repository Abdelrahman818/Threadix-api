const express = require('express');
const route = express.Router();

const verifyItemData = require('../middleware/cartValidation.js');
const { authorizingUser } = require('../middleware/verifyUser.js');

const {
  getUserCart,
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  clearCart,
} = require('../controllers/cartController');

route.get('/', authorizingUser, getUserCart);
route.post('/', authorizingUser, verifyItemData, addItemToCart);
route.patch('/item/:itemId', authorizingUser, updateCartItemQuantity);
route.delete('/item/:itemId', authorizingUser, removeItemFromCart);
route.delete('/', authorizingUser, clearCart);

module.exports = route;
