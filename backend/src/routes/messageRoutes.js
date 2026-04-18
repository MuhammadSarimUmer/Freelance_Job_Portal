const express = require('express');
const router = express.Router();

const messageController = require('../controllers/messageController');
const { verifyToken, requireRoles } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, requireRoles(['CLIENT', 'DEVELOPER']), messageController.sendMessage);
router.get('/:contractID', verifyToken, requireRoles(['CLIENT', 'DEVELOPER']), messageController.getMessages);
router.patch('/:contractID/read', verifyToken, requireRoles(['CLIENT', 'DEVELOPER']), messageController.markAsRead);

module.exports = router;
