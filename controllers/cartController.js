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
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ successful: false, msg: 'No token provided' });

    let userId;
    try {
      const payload = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
      userId = payload.id;
    } catch (err) {
      return res.status(401).json({ successful: false, msg: 'Invalid or expired token' });
    }

    const cartDoc = await Cart.findByUserId(userId);
    if (!cartDoc || !cartDoc.items || cartDoc.items.length === 0) {
      return res.status(200).json({ successful: true, msg: 'Cart is empty!', data: [] });
    }

    const items = typeof cartDoc.items === 'string' ? JSON.parse(cartDoc.items) : cartDoc.items;
    const enrichedItems = [];
    
    for (const item of items) {
      const product = await Products.findById(item.productId);
      if (product) {
        enrichedItems.push({
          id: item.productId,
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

    return res.status(200).json({ successful: true, data: enrichedItems });
  } catch (error) {
    return res.status(500).json({ successful: false, msg: error.message });
  }
}

/**
 * @method POST
 * @description This method adds new item to user's cart
 * @access Private
 */
async function addItemToCart(req, res) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ successful: false, msg: 'No token provided' });

    let userId;
    try {
      const payload = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
      userId = payload.id;
    } catch (err) {
      return res.status(401).json({ successful: false, msg: 'Invalid or expired token' });
    }

    const { productId, quantity } = req.body;
    if (!productId || !quantity) return res.status(400).json({ successful: false, msg: 'productId and quantity are required' });

    let cartDoc = await Cart.findByUserId(userId);
    let items = cartDoc ? (typeof cartDoc.items === 'string' ? JSON.parse(cartDoc.items) : cartDoc.items) : [];

    const existingItemIndex = items.findIndex(item => item.productId === productId);
    if (existingItemIndex > -1) {
      items[existingItemIndex].quantity = parseInt(items[existingItemIndex].quantity) + parseInt(quantity);
    } else {
      items.push({ productId, quantity: parseInt(quantity) });
    }

    await Cart.createOrUpdate(userId, items);

    return res.status(201).json({ successful: true, msg: 'Item added to cart', data: { userId, items } });
  } catch (error) {
    return res.status(500).json({ successful: false, msg: error.message });
  }
}

/**
 * @method PUT
 * @description Remove item from cart
 * @access Private
 */
async function removeItemFromCart(req, res) {
  try {
    const userId = req.userId;
    const { itemId } = req.params;

    const cartDoc = await Cart.findByUserId(userId);
    if (!cartDoc) return res.status(404).json({ successful: false, msg: 'Cart not found' });

    let items = typeof cartDoc.items === 'string' ? JSON.parse(cartDoc.items) : cartDoc.items;
    items = items.filter(item => item.productId !== itemId);

    await Cart.createOrUpdate(userId, items);

    return res.status(200).json({ successful: true, msg: 'Item removed from cart', data: { userId, items } });
  } catch (error) {
    return res.status(500).json({ successful: false, msg: error.message });
  }
}

/**
 * @method PATCH
 * @description Update quantity
 * @access Private
 */
async function updateCartItemQuantity(req, res) {
  try {
    const userId = req.userId;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) return res.status(400).json({ successful: false, msg: 'Quantity must be at least 1' });

    const cartDoc = await Cart.findByUserId(userId);
    if (!cartDoc) return res.status(404).json({ successful: false, msg: 'Cart not found' });

    let items = typeof cartDoc.items === 'string' ? JSON.parse(cartDoc.items) : cartDoc.items;
    const itemIndex = items.findIndex(item => item.productId === itemId);

    if (itemIndex === -1) return res.status(404).json({ successful: false, msg: 'Item not found in cart' });

    items[itemIndex].quantity = quantity;
    await Cart.createOrUpdate(userId, items);

    return res.status(200).json({ successful: true, msg: 'Quantity updated', data: { userId, items } });
  } catch (error) {
    return res.status(500).json({ successful: false, msg: error.message });
  }
}

/**
 * @method DELETE
 * @description Clear cart
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

    await Cart.createOrUpdate(userId, []);

    return res.status(200).json({ successful: true, msg: 'Cart cleared successfully' });
  } catch (error) {
    return res.status(500).json({ successful: false, msg: error.message });
  }
}

module.exports = {
  getUserCart,
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  clearCart,
}
