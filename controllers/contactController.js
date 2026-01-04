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
    const contacts = await Contacts.find();
    return res.status(200).json({
      successful: true,
      data: contacts,
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    })
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
    const msgs = await Contacts.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subj: { $regex: search, $options: 'i' } },
        { subj: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ],
    });
    return res.status(500).json({
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
 * @description This method gets all un readed msgs only
 * @access Private
 */
async function getNewMsgs(req, res) {
  try {
    const msgs = await Contacts.find({ isRead: false, });
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
    if (req.body.isLoggedIn) {
      const { token } = req.cookies;
      const userId = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
      const userData = await Users.findOne({ _id: userId.id });
      const payload = {
        ...req.body,
        name: userData.name,
        email: userData.email,
        isAdmin: userData.isAdmin,
        phone: userData.phone,
        address: userData.address,
        isLoggedIn: true,
      };
      const newContact = new Contacts({ ...payload, isLoggedIn: false, });
      await newContact.save();
      return res.status(201).json({
        successful: true,
        data: newContact,
      });
    }
    const newContact = new Contacts(req.body);
    await newContact.save();
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
    await Contacts.findByIdAndDelete(id);
    return res.status(200).json({
      successful: true,
      msg: 'Contact deleted successfully!',
    });
  } catch (error) {
    return res.status(500).json({
      sucessful: false,
      msg: error.message,
    });
  }
}

/**
 * @method GET
 * @description This method just modifing the msg to me readed
 * @access Private
 */
async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    await Contacts.findByIdAndUpdate(id, { isRead: true, });
    return res.status(200).json({
      successful: true,
      msg: 'Message is readed',
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
    const msgs = await Contacts.find({ isRead: true, });
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
