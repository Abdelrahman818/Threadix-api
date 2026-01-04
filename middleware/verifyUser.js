const Users = require('../models/Users');
const jwt = require("jsonwebtoken");

function verifyUser(req, res) {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        successful: false,
        msg: "Verification token is missing",
      });
    }

    let decodedUser;
    try {
      decodedUser = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    } catch (err) {
      return res.status(401).json({
        successful: false,
        msg: "Invalid or expired token",
      });
    }

    const newToken = jwt.sign(
      { id: decodedUser.id },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      successful: true,
      msg: "Email verified successfully",
      token: newToken,
    });

  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: "Internal server error",
    });
  }
}

async function authorizingUser(req, res, next) {
  try {
    let token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      token = req.cookies.token;
    }

    if (!token)
      return res.status(401).json({
        successful: false,
        msg: 'No token provided',
      });

    const payload = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    console.log('authorizingUser - Verified payload:', { id: payload.id, name: payload.name });

    // Check if this is a signup verification token (has name, email, pwd)
    // or a regular auth token (has id)
    if (payload.name && payload.email && payload.pwd) {
      // This is a signup verification token - extract full user data
      req.user = {
        name: payload.name,
        email: payload.email,
        pwd: payload.pwd,
      };
    } else if (payload.id) {
      // This is a regular auth token - extract id
      req.user = { id: payload.id };
      req.userId = payload.id;
      console.log('authorizingUser - Set req.userId:', req.userId);
    } else {
      return res.status(401).json({
        successful: false,
        msg: 'Invalid token format',
      });
    }

  } catch (error) {
    console.error('authorizingUser - Error:', error.message);
    return res.status(401).json({
      successful: false,
      msg: 'invalid or expired token',
    });
  }
  next();
}

async function verifyAdmin(req, res, next) {
  try {
    let token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        successful: false,
        msg: 'No token provided',
      });
    }

    const payload = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    const user = await Users.findById(payload.id);
    if (!(user.isAdmin || payload.isAdmin))
      return res.status(401).json({
        successful: false,
        msg: 'You are not an admin',
      });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
  next();
}

async function defineRole(req, res) {
  try {
    let token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      token = req.cookies.token;
    }

    if (!token)
      return res.status(401).json({
        successful: false,
        msg: 'No token provided'
      });

    const payload = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    const isAdmin = await Users.findOne({ _id: payload.id }).select('isAdmin');

    return res.status(200).json({
      successful: true,
      isAdmin: isAdmin.isAdmin,
    });

  } catch (error) {
    return res.status(401).json({
      successful: false,
      msg: 'Invalid or expired token',
    });
  }
}

module.exports = {
  verifyAdmin,
  verifyUser,
  authorizingUser,
  defineRole,
};
