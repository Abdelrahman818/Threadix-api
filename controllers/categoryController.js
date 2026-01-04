const Cat = require('../models/Categories');
const Products = require('../models/Products');

/**
 * @method GET
 * @description This method gets all categories in the database
 * @access Public
 */
async function getAllCategories(req, res) {
  try {
    const categories = await Cat.find();
    const payload = await Promise.all(
      categories.map(async (cat) => {
        const productsCount = await Products.countDocuments({
          category: cat.name,
        });

        return {
          _id: cat._id,
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
    const path = `/uploads/${req.file.filename}`;
    const isActive = status === 'active' || status === 'true' || status === true;
    const newCat = new Cat({ name, imgUrl: path, isActive });
    await newCat.save();
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
    
    // If a new image is uploaded, update the imgUrl
    if (req.file) {
      updateData.imgUrl = `/uploads/${req.file.filename}`;
    }
    
    // Convert status string to isActive boolean if provided
    if (updateData.status) {
      updateData.isActive = updateData.status === 'active' || updateData.status === 'true';
      delete updateData.status; // Remove status as model uses isActive
    }
    
    const cat = await Cat.findByIdAndUpdate(id, updateData, { new: true });
    return res.status(200).json({
      successful: true,
      data: cat,
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
 * @description This mehtod deletes a categroy completely from the database
 * @access Private
 */
async function removeCategory(req, res) {
  try {
    const { id } = req.params;
    await Cat.findByIdAndDelete(id);
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
