const express = require('express');
const router = express.Router();

const contractController = require('../controllers/contractController');
const proposalController = require('../controllers/proposalController');
const { verifyToken, requireRoles, requireDeveloper, requireClient } = require('../middlewares/authMiddleware');
const checkContractOwner = require('../middlewares/checkContractOwner');

const {
    createContractValidator,
    updateContractValidator
} = require('../validators/contractValidator');
const {
    createProposalValidator,
    inviteDeveloperValidator,
    declineProposalValidator
} = require('../validators/proposalValidator');

const validationMiddleware = require('../middlewares/validationMiddleware');

router.get(
    '/open',
    verifyToken,
    requireRoles(['CLIENT', 'DEVELOPER']),
    contractController.getOpenContracts
);

router.post(
    '/',
    verifyToken,
    requireRoles(['CLIENT']),
    createContractValidator,
    validationMiddleware.validateRequest,
    contractController.createContract
);

router.get(
    '/',
    verifyToken,
    requireRoles(['CLIENT', 'DEVELOPER']),
    contractController.getContracts
);

router.get(
    '/:id',
    verifyToken,
    requireRoles(['CLIENT', 'DEVELOPER']),
    contractController.getContractById
);

router.put(
    '/:id',
    verifyToken,
    requireRoles(['CLIENT']),
    checkContractOwner,
    updateContractValidator,
    validationMiddleware.validateRequest,
    contractController.updateContract
);

router.patch(
    '/:id/status',
    verifyToken,
    requireRoles(['CLIENT']),
    checkContractOwner,
    contractController.updateContractStatus
);

router.post(
    '/:id/tech',
    verifyToken,
    requireRoles(['CLIENT']),
    checkContractOwner,
    contractController.addContractTech
);

router.post(
    '/:id/team',
    verifyToken,
    requireRoles(['CLIENT']),
    checkContractOwner,
    contractController.assignDeveloper
);

router.post(
    '/:id/proposals',
    verifyToken,
    requireDeveloper,
    createProposalValidator,
    validationMiddleware.validateRequest,
    proposalController.createProposal
);

router.get(
    '/:id/proposals',
    verifyToken,
    requireClient,
    proposalController.listContractProposals
);

router.post(
    '/:id/invitations',
    verifyToken,
    requireClient,
    inviteDeveloperValidator,
    validationMiddleware.validateRequest,
    proposalController.inviteDeveloper
);

router.patch(
    '/:id/proposals/:proposalId/accept',
    verifyToken,
    requireClient,
    proposalController.acceptProposal
);

router.patch(
    '/:id/proposals/:proposalId/decline',
    verifyToken,
    requireClient,
    declineProposalValidator,
    validationMiddleware.validateRequest,
    proposalController.declineProposal
);

router.delete(
    '/:id',
    verifyToken,
    requireRoles(['CLIENT']),
    checkContractOwner,
    contractController.deleteContract
);

module.exports = router;