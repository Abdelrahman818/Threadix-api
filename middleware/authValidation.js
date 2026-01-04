const Users = require('../models/Users');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// LOGIN
async function loginValidation(req, res, next) {
  try {

    // 1. Validation
    const schema = Joi.object({
      email: Joi.string().regex(new RegExp(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)).required(),
      pwd: Joi.string().required(),
    });
    const { error } = schema.validate(req.body);
    if (error)
      return res.status(400).json({
        successful: false,
        msg: error.details[0].message,
      });

    // 2. Check Existence (case-insensitive email)
    const normalizedEmail = req.body.email.toLowerCase().trim();
    const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const user = await Users.findOne({ 
      email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') }
    });
    if (!user)
      return res.status(400).json({
        successful: false,
        msg: 'User not found',
      });

    // 3. Check Password
    const wrongPassword = !await bcrypt.compare(req.body.pwd, user.pwd);
    if (wrongPassword)
      return res.status(400).json({
        successful: false,
        msg: 'Password is wrong',
      });

    // 4. Generate Token
    const token = jwt.sign(
      { id: user._id },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: "30d" }
    );

    // 5. Set Cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
  next();
}

// SIGNUP VALIDATION
function signupValidation(req, res, next) {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().regex(new RegExp(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)).required(),
    pwd: Joi.string().min(8).max(16).required(),
  });

  const { error } = schema.validate(req.body);

  if (error)
    return res.status(400).json({
      successful: false,
      msg: error.details[0].message,
    });

  next();
}

// VERIFY TOKEN AND EXTRACT USER INFO
async function verifyToken(req, res) {
  try {
    const token = req.cookies?.token;

    if (!token)
      return res.status(401).json({
        successful: false,
        msg: 'No token provided',
      });

    const payload = jwt.verify(token, process.env.TOKEN_SECRET_KEY);

    return res.status(200).json({
      successful: true,
      data: payload.id,
    });
  } catch (error) {
    return res.status(401).json({
      successful: false,
      msg: 'invalid or expired token',
    });
  }
}

module.exports = {
  loginValidation,
  signupValidation,
  verifyToken,
};  