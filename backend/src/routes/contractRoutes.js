const express = require('express');
const router = express.Router();

const contractController = require('../controllers/contractController');
const { verifyToken, requireRoles } = require('../middlewares/authMiddleware');
const checkContractOwner = require('../middlewares/checkContractOwner');

const {
    createContractValidator,
    updateContractValidator
} = require('../validators/contractValidator');

const validationMiddleware = require('../middlewares/validationMiddleware');

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

router.delete(
    '/:id',
    verifyToken,
    requireRoles(['CLIENT']),
    checkContractOwner,
    contractController.deleteContract
);

module.exports = router;