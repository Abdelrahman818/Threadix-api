const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/verifyUser');
const { getDashboardStats } = require('../controllers/adminController');

router.get('/stats', verifyAdmin, getDashboardStats);

module.exports = router;
