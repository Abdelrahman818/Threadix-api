const Joi = require('joi');

function cartValidation(req, res, next) {
  try {
    const schema = Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().min(1).required(),
      color: Joi.string().optional().allow(null),
      size: Joi.string().optional().allow(null),
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

module.exports = cartValidation;
