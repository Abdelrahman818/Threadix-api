const Users = require('../models/Users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const getFirebaseAdminApp = require('../config/firebaseAdmin');

const AUTH_COOKIE_NAME = 'token';
const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function getAuthCookieOptions(maxAge = AUTH_COOKIE_MAX_AGE) {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'Strict' : 'Lax',
    maxAge,
  };
}

function setAuthCookie(res, userId) {
  const token = jwt.sign(
    { id: userId },
    process.env.TOKEN_SECRET_KEY,
    { expiresIn: '1w' }
  );

  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
}

function normalizeEmail(email) {
  return email?.toLowerCase().trim();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function findUserByEmail(email) {
  return Users.findByEmail(normalizeEmail(email));
}

async function login(req, res) {
  try {
    return res.status(200).json({
      successful: true,
      msg: 'Logged in successfully',
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

async function socialAuth(req, res) {
  try {
    const { idToken, name: requestedName } = req.body;

    if (!idToken) {
      return res.status(400).json({
        successful: false,
        msg: 'Firebase ID token is required',
      });
    }

    const firebaseAdmin = getFirebaseAdminApp();
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const email = normalizeEmail(decodedToken.email);
    const name = requestedName || decodedToken.name || decodedToken.email?.split('@')[0] || 'Threadix user';

    if (!email) {
      return res.status(400).json({
        successful: false,
        msg: 'Your social account must include an email address',
      });
    }

    let user = await findUserByEmail(email);

    if (!user) {
      const unusablePassword = await bcrypt.hash(`firebase:${decodedToken.uid}:${Date.now()}`, 10);
      user = await Users.create({
        name,
        email,
        pwd: unusablePassword,
        isActive: true,
      });
    }

    setAuthCookie(res, user.id);

    return res.status(200).json({
      successful: true,
      msg: 'Logged in successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    return res.status(401).json({
      successful: false,
      msg: error.message || 'Social authentication failed',
    });
  }
}

async function signup(req, res) {
  try {
    const { name, email, pwd } = req.user;

    // Normalize email (lowercase and trim)

async function signup(req, res) {
  try {
    const { name, email, pwd } = req.user;

    // Normalize email (lowercase and trim)
    const normalizedEmail = normalizeEmail(email);

    // Check if user already exists (case-insensitive search)
    // Escape special regex characters in email
    const existingUser = await findUserByEmail(normalizedEmail);
    
    // If user already exists, just log them in (they might be re-verifying)
    if (existingUser) {
      setAuthCookie(res, existingUser.id);

      return res.status(200).json({
        successful: true,
        msg: 'Account already verified. You are now logged in.',
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPwd = await bcrypt.hash(pwd, salt);

    // Save user to database (use normalized email)
    const newUser = await Users.create({
      name,
      email: normalizedEmail,
      pwd: hashedPwd,
    });

    setAuthCookie(res, newUser.id);

    return res.status(201).json({
      successful: true,
      msg: 'User created successfully',
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

function logout(req, res) {
  try {
    res.cookie(AUTH_COOKIE_NAME, '', getAuthCookieOptions(0));
    return res.status(200).json({
      successful: true,
      msg: 'logged out',
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

async function getCurrentUser(req, res) {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];

    return res.status(200).json({
      successful: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

module.exports = {
  login,
  signup,
  socialAuth,
  logout,
  getCurrentUser,
}
