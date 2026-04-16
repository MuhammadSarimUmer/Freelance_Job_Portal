const express = require('express');
const router = express.Router();

const proposalController = require('../controllers/proposalController');
const { verifyToken, requireDeveloper } = require('../middlewares/authMiddleware');
const validationMiddleware = require('../middlewares/validationMiddleware');
const { declineProposalValidator } = require('../validators/proposalValidator');

router.get(
    '/me',
    verifyToken,
    requireDeveloper,
    proposalController.listMyProposals
);

router.patch(
    '/:proposalId/accept',
    verifyToken,
    requireDeveloper,
    proposalController.acceptInvitation
);

router.patch(
    '/:proposalId/decline',
    verifyToken,
    requireDeveloper,
    declineProposalValidator,
    validationMiddleware.validateRequest,
    proposalController.declineInvitation
);

router.patch(
    '/:proposalId/withdraw',
    verifyToken,
    requireDeveloper,
    proposalController.withdrawProposal
);

module.exports = router;
