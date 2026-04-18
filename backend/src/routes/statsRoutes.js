const express = require('express');
const router = express.Router();

const statsController = require('../controllers/statsController');
const { verifyToken, requireRoles } = require('../middlewares/authMiddleware');

router.get(
    '/dashboard',
    verifyToken,
    requireRoles(['CLIENT', 'DEVELOPER']),
    statsController.getDashboardStats
);

module.exports = router;
