const Cat = require('../models/Categories');
const Products = require('../models/Products');
const fs = require('fs').promises;
const path = require('path');

/**
 * @method GET
 * @description This method gets all categories in the database
 * @access Public
 */
async function getAllCategories(req, res) {
  try {
    const categories = await Cat.findAll();
    const payload = await Promise.all(
      categories.map(async (cat) => {
        const productsCount = await Products.countByCategory(cat.name);

        return {
          id: cat.id,
          name: cat.name,
          status: cat.isActive ? 'active' : 'inactive',
          isActive: cat.isActive,
          imgUrl: cat.imgUrl,
          productsCount,
        };
      })
    );
    return res.status(200).json({
      successful: true,
      data: payload,
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
 * @description This method creates a new category and add it into the database
 * @access Private
 */
async function addNewCategory(req, res) {
  try {
    const { name, status } = req.body;
    const imgPath = `/uploads/${req.file.filename}`;
    const isActive = status === 'active' || status === 'true' || status === true;
    const newCat = await Cat.create({ name, imgUrl: imgPath, isActive });
    return res.status(201).json({
      successful: true,
      data: newCat,
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
 * @description This method updates a category's data
 * @access Private
 */
async function modifyCategory(req, res) {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.file) {
      updateData.imgUrl = `/uploads/${req.file.filename}`;
    }

    if (updateData.status) {
      updateData.isActive = updateData.status === 'active' || updateData.status === 'true';
      delete updateData.status;
    }

    await Cat.update(id, updateData);
    const updatedCat = await Cat.findById(id);
    
    return res.status(200).json({
      successful: true,
      data: updatedCat,
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
 * @description This method deletes a category completely from the database
 * @access Private
 */
async function removeCategory(req, res) {
  try {
    const { id } = req.params;

    const category = await Cat.findById(id);
    if (!category) {
      return res.status(404).json({
        successful: false,
        msg: 'Category not found',
      });
    }

    if (category.imgUrl) {
      const absolutePath = path.join(__dirname, '..', category.imgUrl);
      try {
        await fs.unlink(absolutePath);
      } catch (err) {
        console.error(`Failed to delete category image: ${absolutePath}`, err);
      }
    }

    await Cat.delete(id);
    return res.status(200).json({
      successful: true,
      msg: 'Category is deleted successfully!',
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

module.exports = {
  getAllCategories,
  addNewCategory,
  modifyCategory,
  removeCategory,
}
