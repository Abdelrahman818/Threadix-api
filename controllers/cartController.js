const Cart = require('../models/Cart');
const Products = require('../models/Products');
const jwt = require('jsonwebtoken');

/**
 * @method GET
 * @description This method gets all items that is saved by user in database
 * @access Public
 */
async function getUserCart(req, res) {
  try {
    // Verify token from cookies
    const token = req.cookies?.token;
    if (!token)
      return res.status(401).json({
        successful: false,
        msg: 'No token provided',
      });

    let userId;
    try {
      const payload = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
      userId = payload.id;
    } catch (err) {
      return res.status(401).json({
        successful: false,
        msg: 'Invalid or expired token',
      });
    }

    const cartDocs = await Cart.find({ userId });

    // If no cart documents, return empty array
    if (!cartDocs || cartDocs.length === 0)
      return res.status(200).json({
        successful: true,
        msg: 'Cart is empty!',
        data: [],
      });

    // Flatten items from all cart documents and enrich with product data
    const flatItems = [];
    for (const cartDoc of cartDocs) {
      if (cartDoc.items && Array.isArray(cartDoc.items)) {
        for (const item of cartDoc.items) {
          // Fetch product to get title, images, salePrice
          const product = await Products.findById(item.productId);
          if (product) {
            flatItems.push({
              id: item._id || item.productId,
              productId: item.productId,
              title: product.title,
              name: product.title,
              salePrice: product.salePrice,
              image: product.images && product.images[0] ? product.images[0] : '',
              quantity: parseInt(item.quantity) || 1,
              color: item.color || null,
              size: item.size || null,
            });
          }
        }
      }
    }

    // Return flattened cart items
    return res.status(200).json({
      successful: true,
      data: flatItems,
    });

  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

/**
 * @method POST
 * @description This method adds new item to user's cart
 * @access Private
 */
async function addItemToCart(req, res) {
  try {
    // Verify token from cookies
    const token = req.cookies?.token;
    if (!token)
      return res.status(401).json({
        successful: false,
        msg: 'No token provided',
      });

    let userId;
    try {
      const payload = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
      userId = payload.id;
    } catch (err) {
      return res.status(401).json({
        successful: false,
        msg: 'Invalid or expired token',
      });
    }

    const { productId, quantity, color, size } = req.body;

    if (!productId || !quantity)
      return res.status(400).json({
        successful: false,
        msg: 'productId and quantity are required',
      });

    // Find or create user's cart
    let userCart = await Cart.findOne({ userId });
    if (!userCart) {
      userCart = new Cart({ userId, items: [] });
    }

    // Check if item with same productId, color, size exists
    const existingItemIndex = userCart.items.findIndex(
      item => item.productId === productId &&
        item.color === color &&
        item.size === size
    );

    if (existingItemIndex > -1) {
      // Increase quantity if item exists
      userCart.items[existingItemIndex].quantity =
        parseInt(userCart.items[existingItemIndex].quantity) + parseInt(quantity);
    } else {
      // Add new item
      userCart.items.push({
        productId,
        quantity: parseInt(quantity),
        color: color || null,
        size: size || null,
      });
    }

    await userCart.save();

    return res.status(201).json({
      successful: true,
      msg: 'Item added to cart',
      data: userCart,
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

/**
 * @method PUT
 * @description This method deletes an item from the cart and contains userId and productId in params
 * @access Private
 */
async function removeItemFromCart(req, res) {
  try {
    const userId = req.userId;
    const { itemId } = req.params;

    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { _id: itemId } } },
      { new: true }
    );

    return res.status(200).json({
      successful: true,
      msg: 'Item removed from cart',
      data: updatedCart,
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

/**
 * @method PATCH
 * @description This method updates the quantity of an item in the cart
 * @access Private
 */
async function updateCartItemQuantity(req, res) {
  try {
    const userId = req.userId;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ successful: false, msg: 'Quantity must be at least 1' });
    }

    const updatedCart = await Cart.findOneAndUpdate(
      { userId, "items._id": itemId },
      { $set: { "items.$.quantity": quantity } },
      { new: true }
    );

    if (!updatedCart) {
      return res.status(404).json({ successful: false, msg: 'Item not found in cart' });
    }

    return res.status(200).json({
      successful: true,
      msg: 'Quantity updated',
      data: updatedCart,
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

/**
 * @method DELETE
 * @description This method clears the user's cart
 * @access Private
 */
async function clearCart(req, res) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ successful: false, msg: 'No token provided' });

    let userId;
    try {
      const payload = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
      userId = payload.id;
    } catch (err) {
      return res.status(401).json({ successful: false, msg: 'Invalid token' });
    }

    const cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    return res.status(200).json({
      successful: true,
      msg: 'Cart cleared successfully',
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

module.exports = {
  getUserCart,
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  clearCart,
}
