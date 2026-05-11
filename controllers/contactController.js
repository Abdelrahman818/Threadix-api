const jwt = require('jsonwebtoken');
const Contacts = require('../models/Contact');
const Users = require('../models/Users');

/**
 * @method GET
 * @description This method gets all contact msgs from database
 * @access Admin
 */
async function getAllMsgs(req, res) {
  try {
    const contacts = await Contacts.findAll();
    return res.status(200).json({
      successful: true,
      data: contacts,
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
 * @description This method gets all matched msgs from the database
 * @access Private
 */
async function getMatchedMsgs(req, res) {
  try {
    const { search } = req.params;
    const msgs = await Contacts.search(search);
    return res.status(200).json({
      successful: true,
      data: msgs,
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
 * @description This method gets all unread msgs only
 * @access Private
 */
async function getNewMsgs(req, res) {
  try {
    const msgs = await Contacts.find({ isRead: false });
    return res.status(200).json({
      successful: true,
      data: msgs,
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
 * @description This method adds a new msg to database
 * @access Public
 */
async function addNewMsg(req, res) {
  try {
    let contactData = { ...req.body };

    if (req.body.isLoggedIn) {
      const token = req.cookies?.token;
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
          const userData = await Users.findById(decoded.id);
          if (userData) {
            contactData = {
              ...contactData,
              name: userData.name,
              email: userData.email,
              isAdmin: !!userData.isAdmin,
              phone: userData.phone,
              address: userData.address,
              isLoggedIn: true,
            };
          }
        } catch (err) {
          console.error('Invalid token in contact form:', err.message);
          // Continue as guest if token is invalid
          contactData.isLoggedIn = false;
        }
      }
    }

    const newContact = await Contacts.create(contactData);
    return res.status(201).json({
      successful: true,
      data: newContact,
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
 * @description This method removes a contact msg from database by id
 * @access Admin
 */
async function removeMsg(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Contacts.delete(id);
    if (!deleted) {
      return res.status(404).json({
        successful: false,
        msg: 'Contact message not found',
      });
    }
    return res.status(200).json({
      successful: true,
      msg: 'Contact deleted successfully!',
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
 * @description This method marks the msg as read
 * @access Private
 */
async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const success = await Contacts.update(id, { isRead: true });
    if (!success) {
      return res.status(404).json({
        successful: false,
        msg: 'Contact message not found',
      });
    }
    return res.status(200).json({
      successful: true,
      msg: 'Message is marked as read',
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
 * @description This method gets all read messages
 * @access Private
 */
async function getReadMsgs(req, res) {
  try {
    const msgs = await Contacts.find({ isRead: true });
    return res.status(200).json({
      successful: true,
      data: msgs,
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

module.exports = {
  getAllMsgs,
  getMatchedMsgs,
  getNewMsgs,
  addNewMsg,
  removeMsg,
  markAsRead,
  getReadMsgs,
};
