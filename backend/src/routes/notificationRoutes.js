const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notificationController');
const { verifyToken, requireRoles } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, requireRoles(['CLIENT', 'DEVELOPER']), notificationController.getMyNotifications);
router.patch('/read', verifyToken, requireRoles(['CLIENT', 'DEVELOPER']), notificationController.markAllRead);

module.exports = router;
