const Joi = require('joi');

function validateCategory(req, res, next) {
  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      image: Joi.binary().required(),
      status: Joi.string().optional().default('active'),
      imgUrl: Joi.string().required(),
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

module.exports = validateCategory;
