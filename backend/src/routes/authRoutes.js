const express = require('express');
const router = express.Router();

const validationMiddleware = require('../middlewares/validationMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');
const authValidator = require('../validators/authValidator');

router.post('/register', authValidator.registerValidator, validationMiddleware.validateRequest, authController.register);
router.post('/login', authValidator.loginValidator, validationMiddleware.validateRequest, authController.login);
router.get('/me', authMiddleware.verifyToken, authController.getMe);
router.post('/refresh', authMiddleware.verifyToken, authController.refresh);
router.post('/logout', authMiddleware.verifyToken, authController.logout);
router.post('/forgot-password', authValidator.forgotPasswordValidator, validationMiddleware.validateRequest, authController.forgotPassword);

// router.post('/reset-password', authValidator.resetPasswordValidator, validationMiddleware.validateRequest, authController.resetPassword);

module.exports = router;