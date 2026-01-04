const Joi = require('joi');

function productValidation(req, res, next) {
  try {
    const schema = Joi.object({
      title: Joi.string().required(),
      desc: Joi.string().required(),
      category: Joi.string().required(),
      price: Joi.number().required(),
      salePrice: Joi.number().optional(),
      size: Joi.array().items(Joi.string()).required(),
      color: Joi.array().items(Joi.string()).optional(),
      stock: Joi.boolean().optional().default(true),
      images: Joi.array().items(Joi.string().uri()).required(),
    });
    const { error } = schema.validate(req.body);
    if (error)
      return res.status(400).json({
        successful: false,
        msg: error.details[0].message,
      });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
  next();
}

module.exports = productValidation;
