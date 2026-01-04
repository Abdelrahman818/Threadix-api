const Joi = require('joi');

function orderValidation(req, res, next) {
  try {
    const schema = Joi.object({
      items: Joi.array().items(Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().required(),
        color: Joi.string().optional().allow(null),
        size: Joi.string().optional().allow(null),
      })).required(),
      name: Joi.string().optional(),
      email: Joi.string().email().optional(),
      phone: Joi.string().optional(),
      totalPrice: Joi.number().required(),
      paymentMethod: Joi.string().required(),
      paymentStatus: Joi.string().required(),
      orderStatus: Joi.string().required(),
      address: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        successful: false,
        message: error.details[0].message,
      });
    }

  } catch (error) {
    return res.status(500).json({
      successful: false,
      message: error.message,
    });
  }
  next();
}

module.exports = orderValidation;
