const Products = require('../models/Products');

/**
 * @method GET
 * @description Get all products
 * @access Public
 */
async function getAllProducts(req, res) {
  try {
    const products = await Products.find();
    if (!Array.isArray(products) || products.length === 0)
      return res.status(200).json({
        successful: false,
        msg: 'There is no products here'
      });
    return res.status(200).json({
      successful: true,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

/**
 * @method GET
 * @description This method searches for an ite
 */
async function getProductById(req, res) {
  try {
    const { id } = req.params;
    let product;
    try {
      product = await Products.findById({ _id: id });
    } catch (error) {
      return res.status(404).json({
        successful: false,
        msg: 'Item not found',
      });
    }

    return res.status(200).json({
      successful: true,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    })
  }
}

/**
 * @method POST
 * @description Add a new product with images
 * @access Admin
 */
async function addProduct(req, res) {
  try {
    const { title, desc, category, price, sizes, colors, isFeatured } = req.body;
    const imgs = req.files?.map(file => `/uploads/${file.filename}`);

    const colorsArr = JSON.parse(colors);
    const sizesArr = JSON.parse(sizes);

    const newProduct = new Products({
      title, desc,
      category, price,
      salePrice: price,
      size: sizesArr,
      colors: colorsArr,
      images: imgs,
      isFeatured: isFeatured === 'true' || isFeatured === true,
    });

    await newProduct.save();

    return res.status(201).json({
      successful: true,
      data: imgs,
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
 * @description Update a product
 * @access Admin
 */
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { stock, title, desc, category, price, sizes, colors, isFeatured } = req.body;

    const update = {};

    if (typeof stock !== 'undefined') update.stock = stock;
    if (title) update.title = title;
    if (desc) update.desc = desc;
    if (category) update.category = category;
    if (price !== undefined) update.price = Number(price);
    if (isFeatured !== undefined) update.isFeatured = isFeatured === 'true' || isFeatured === true;

    if (sizes) {
      try {
        update.size = JSON.parse(sizes);
      } catch (err) {
        update.size = Array.isArray(sizes) ? sizes : String(sizes).split(',').map(s => s.trim());
      }
    }

    if (colors) {
      try {
        update.colors = JSON.parse(colors);
      } catch (err) {
        update.colors = Array.isArray(colors) ? colors : String(colors).split(',').map(c => c.trim());
      }
    }

    const imgs = req.files?.map(file => `/uploads/${file.filename}`) || [];
    if (imgs.length > 0) {
      const existing = await Products.findById(id).select('images');
      update.images = Array.isArray(existing?.images) ? [...existing.images, ...imgs] : imgs;
    }

    const updatedProduct = await Products.findByIdAndUpdate(id, update, { new: true });

    return res.status(200).json({
      successful: true,
      data: updatedProduct,
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
 * @description Delete a product
 * @access Admin
 */
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    await Products.findByIdAndDelete(id);
    return res.status(200).json({
      successful: true,
      msg: 'Product deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

/**
 * @method GET
 * @description Match products with target (category, title, disc)
 * @access Public
 */
async function matchWithTarget(req, res) {
  try {
    const { target } = req.params;
    
    const matched = await Products.find({
      $or: [
        {category: { $regex: target, $options: 'i' } },
        {title: { $regex: target, $options: 'i' }},
        {desc: { $regex: target, $options: 'i' }},
      ]
    });
    
    if (Array.isArray(matched) && matched.length === 0)
      return res.status(200).json({
        successful: false,
        msg: 'No products matched the target',
      });

    return res.status(200).json({
      successful: true,
      data: matched,
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

/**
 * @method GET
 * @description Get products by category
 * @access Public
 */
async function getProductsByCategory(req, res) {
  try {
    const category = decodeURI(req.params.category);

    const products = await Products.find({ category });

    if (!products.length) {
      return res.status(200).json({
        successful: false,
        msg: 'No products found in this category',
      });
    }

    return res.status(200).json({
      successful: true,
      data: products,
    });

  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

/**
 * @method GET
 * @description This method getts only the featured products
 * @access Public
 */
async function getFeatured(req, res) {
  try {
    const products = await Products.find({ isFeatured: true });
    return res.status(200).json({
      successful: true,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  matchWithTarget,
  getProductsByCategory,
  getFeatured,
};
