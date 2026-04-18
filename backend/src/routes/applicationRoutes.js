const express = require('express');
const router = express.Router();

const application = require('../controllers/applicationController');
const { verifyToken, requireRoles } = require('../middlewares/authMiddleware');

const {
    createApplicationValidator,
    updateApplicationValidator
} = require('../validators/applicationValidator');

const validationMiddleware = require('../middlewares/validationMiddleware');

router.post(
    '/',
    verifyToken,
    requireRoles(['CLIENT']),
    createApplicationValidator,
    validationMiddleware.validateRequest,
    application.createApplication
);
router.get('/', verifyToken, requireRoles(['CLIENT', 'DEVELOPER']), application.getApplications);
router.get('/:id', verifyToken, requireRoles(['CLIENT', 'DEVELOPER']), application.getApplicationById);
router.put(
    '/:id',
    verifyToken,
    requireRoles(['CLIENT']),
    updateApplicationValidator,
    validationMiddleware.validateRequest,
    application.updateApplication
);
router.delete('/:id', verifyToken, requireRoles(['CLIENT']), application.deleteApplication);

module.exports = router;