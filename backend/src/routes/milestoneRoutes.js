const express = require('express');
const router = express.Router();

const milestoneController = require('../controllers/milestoneController');
const { verifyToken, requireRoles } = require('../middlewares/authMiddleware');

const {
    createMilestoneValidator,
    updateMilestoneValidator
} = require('../validators/milestoneValidator');

const validationMiddleware = require('../middlewares/validationMiddleware');

router.post(
    '/',
    verifyToken,
    requireRoles(['CLIENT']),
    createMilestoneValidator,
    validationMiddleware.validateRequest,
    milestoneController.createMilestone
);

router.get(
    '/',
    verifyToken,
    requireRoles(['CLIENT', 'DEVELOPER']),
    milestoneController.getMilestones
);

router.get(
    '/:id',
    verifyToken,
    requireRoles(['CLIENT', 'DEVELOPER']),
    milestoneController.getMilestoneById
);

router.put(
    '/:id',
    verifyToken,
    requireRoles(['CLIENT']),
    updateMilestoneValidator,
    validationMiddleware.validateRequest,
    milestoneController.updateMilestone
);

router.patch(
    '/:id/status',
    verifyToken,
    requireRoles(['CLIENT', 'DEVELOPER']),
    milestoneController.updateMilestoneStatus
);

router.delete(
    '/:id',
    verifyToken,
    requireRoles(['CLIENT']),
    milestoneController.deleteMilestone
);

module.exports = router;
