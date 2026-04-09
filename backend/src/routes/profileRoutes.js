const express = require('express');
const router = express.Router();

const validationMiddleware = require('../middlewares/validationMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const profileController = require('../controllers/profileController');
const profileValidator = require('../validators/profileValidator');

router.get('/developers', authMiddleware.verifyToken, profileController.getDevelopers);
router.get('/developers/:id', authMiddleware.verifyToken, profileController.getDeveloperById);
router.patch('/developers/me', authMiddleware.verifyToken, authMiddleware.requireDeveloper, profileValidator.updateDeveloperValidator, validationMiddleware.validateRequest, profileController.updateDeveloperMe);

router.get('/clients/:id', authMiddleware.verifyToken, profileController.getClientById);
router.patch('/clients/me', authMiddleware.verifyToken, authMiddleware.requireClient, profileValidator.updateClientValidator, validationMiddleware.validateRequest, profileController.updateClientMe);

router.delete('/users/me', authMiddleware.verifyToken, profileController.deleteUserMe);

module.exports = router;