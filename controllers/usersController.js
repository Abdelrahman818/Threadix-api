const Users = require('../models/Users');
const jwt = require('jsonwebtoken');

/**
 * @method GET
 * @description This method gets all users in the database
 * @access Private
 */
async function getAllUsers(req, res) {
  try {
    const users = await Users.find().select('-pwd');
    return res.status(200).json({
      successful: true,
      data: users,
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
 * @description This method modifies a user in the database
 * @access Private
 */
async function modifyUser(req, res) {
  try {
    const { id } = req.params;

    const user = await Users.findOneAndUpdate({
      _id: id
    }, req.body, {
      new: true
    });

    if (!user)
      return res.status(404).json({
        successful: false,
        msg: 'User not found',
      });

    // Only refresh the session token cookie if the requester updated their own account.
    // Avoid replacing the admin's cookie when they modify other users (which could remove admin rights).
    try {
      const requesterToken = req.cookies?.token;
      if (requesterToken) {
        const requesterPayload = jwt.verify(requesterToken, process.env.TOKEN_SECRET_KEY);
        if (requesterPayload && String(requesterPayload.id) === String(user._id)) {
          const newToken = jwt.sign({
            id: user._id,
            isAdmin: user.isAdmin || false
          }, process.env.TOKEN_SECRET_KEY,
            { expiresIn: '1w' });

          res.cookie('token', newToken, { httpOnly: true, secure: true, sameSite: 'Strict' });
        }
      }
    } catch (err) {
      // if token verification fails, do not block the update; just skip resetting cookie
    }

    return res.status(200).json({
      successful: true,
      msg: 'User updated successfully',
    });

  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

/**
 * @method GET
 * @description This method gets only the matched users from the database
 * @access Private
 */
async function getMatchedUsers(req, res) {
  try {
    const { search } = req.params;
    const matchedUsers = await Users.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    });
    if (matchedUsers.length > 0)
      return res.status(200).json({
        successful: true,
        data: matchedUsers,
      });
    return res.status(200).json({
      successful: false,
      msg: 'No users matched',
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

/**
 * @method GET
 * @description This method filters users by their role and ststus
 * @access Private
 */
async function filteredUsers(req, res) {
  try {
    const { roleFilter, statusFilter } = req.query;
    let admin;
    let active;
    let filterCriteria = {};

    if (roleFilter && roleFilter === 'admin')
      admin = true;
    else if (roleFilter && roleFilter === 'customer')
      admin = false;
    if (statusFilter && statusFilter === 'active')
      active = true;
    else if (statusFilter && statusFilter === 'inactive')
      active = false;

    if (admin !== undefined)
      filterCriteria.isAdmin = admin;
    if (active !== undefined)
      filterCriteria.isActive = active;

    const filteredUsers = await Users.find(filterCriteria);

    return res.status(200).json({
      successful: true,
      data: filteredUsers,
    });

  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
  // const matchedUsers = await Users.find({  });
}

/**
 * @method PATCH
 * @description This method modifies the current user's profile
 * @access Private
 */
async function updateProfile(req, res) {
  try {
    const userId = req.user.id; // From authorizingUser middleware
    const updates = req.body;

    // Prevent updating sensitive fields like password or isAdmin through this route
    delete updates.password;
    delete updates.isAdmin;
    delete updates._id;

    const user = await Users.findByIdAndUpdate(userId, updates, { new: true });

    if (!user) {
      return res.status(404).json({ successful: false, msg: 'User not found' });
    }

    return res.status(200).json({
      successful: true,
      msg: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    return res.status(500).json({ successful: false, msg: error.message });
  }
}

/**
 * @method GET
 * @description This method gets user's information
 * @access Public
 */
async function getUserInfo(req, res) {
  try {
    const { token } = req.cookies;
    const userId = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    const userData = await Users.findById(userId).select('-pwd');
    return res.status(200).json({
      successful: true,
      data: userData,
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

module.exports = {
  getAllUsers,
  modifyUser,
  getMatchedUsers,
  filteredUsers,
  updateProfile,
  getUserInfo,
};
