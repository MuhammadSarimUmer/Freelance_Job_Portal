const express = require('express');
const router = express.Router();

const disputeController = require('../controllers/disputeController');
const { verifyToken, requireRoles } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, requireRoles(['CLIENT', 'DEVELOPER']), disputeController.raiseDispute);
router.get('/contract/:contractID', verifyToken, requireRoles(['CLIENT', 'DEVELOPER']), disputeController.getDisputesForContract);
router.patch('/:disputeId', verifyToken, requireRoles(['CLIENT', 'DEVELOPER']), disputeController.resolveDispute);

module.exports = router;
