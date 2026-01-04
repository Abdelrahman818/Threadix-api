const Joi = require('joi');

function validateContactData(req, res, next) {
  try {
    const nonUserSchema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().regex(new RegExp(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)).required(),
      subj: Joi.string().required(),
      msg: Joi.string().required(),
      isLoggedIn: Joi.boolean().required(),
    });

    const userSchema = Joi.object({
      subj: Joi.string().required(),
      msg: Joi.string().required(),
      isLoggedIn: Joi.boolean().required(),
    });

    if (req.body.isLoggedIn) {
      const { error } = userSchema.validate(req.body);
      if (error)
        return res.status(400).json({
          successful: false,
          msg: error.details[0].message,
        });
    } else {
      const { error } = nonUserSchema.validate(req.body);
      if (error)
        return res.status(400).json({
          successful: false,
          msg: error.details[0].message,
        });
    }

  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
  next();
}

module.exports = validateContactData;
