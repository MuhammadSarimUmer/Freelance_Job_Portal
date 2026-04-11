const express = require('express');
const router = express.Router();

const application = require('../controllers/applicationController');

const {
    createApplicationValidator,
    updateApplicationValidator
} = require('../validators/applicationValidator');

const validationMiddleware = require('../middlewares/validationMiddleware');

router.post('/',createApplicationValidator,validationMiddleware.validateRequest, application.createApplication);
router.get('/', application.getApplications);
router.get('/:id', application.getApplicationById);
router.put('/:id', updateApplicationValidator, validationMiddleware.validateRequest, application.updateApplication);
router.delete('/:id', application.deleteApplication);

module.exports = router;