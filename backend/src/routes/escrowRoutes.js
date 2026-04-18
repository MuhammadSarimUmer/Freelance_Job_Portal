const express = require('express');
const router = express.Router();

const escrowController = require('../controllers/escrowController');
const { verifyToken, requireRoles } = require('../middlewares/authMiddleware');

router.post(
    '/deposit',
    verifyToken,
    requireRoles(['CLIENT']),
    escrowController.depositEscrow
);

router.post(
    '/webhook',
    escrowController.handleWebhook
);

router.post(
    '/release',
    verifyToken,
    requireRoles(['CLIENT']),
    escrowController.releaseEscrow
);

router.post(
    '/refund',
    verifyToken,
    requireRoles(['CLIENT']),
    escrowController.refundEscrow
);

router.get(
    '/history',
    verifyToken,
    requireRoles(['CLIENT', 'DEVELOPER']),
    escrowController.getEscrowHistory
);

module.exports = router;
