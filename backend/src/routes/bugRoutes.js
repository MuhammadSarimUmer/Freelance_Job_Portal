const express = require('express');
const router = express.Router();

const bugController = require('../controllers/bugController');
const { verifyToken, requireRoles } = require('../middlewares/authMiddleware');

const {
    createBugValidator,
    updateBugValidator
} = require('../validators/bugValidator');

const validationMiddleware = require('../middlewares/validationMiddleware');

router.post(
    '/',
    verifyToken,
    requireRoles(['CLIENT', 'DEVELOPER']),
    createBugValidator,
    validationMiddleware.validateRequest,
    bugController.createBug
);

router.get(
    '/',
    verifyToken,
    requireRoles(['CLIENT', 'DEVELOPER']),
    bugController.getBugs
);

router.put(
    '/:id',
    verifyToken,
    requireRoles(['CLIENT', 'DEVELOPER']),
    updateBugValidator,
    validationMiddleware.validateRequest,
    bugController.updateBug
);

router.patch(
    '/:id/status',
    verifyToken,
    requireRoles(['CLIENT', 'DEVELOPER']),
    bugController.updateBugStatus
);

router.delete(
    '/:id',
    verifyToken,
    requireRoles(['CLIENT', 'DEVELOPER']),
    bugController.deleteBug
);

module.exports = router;
