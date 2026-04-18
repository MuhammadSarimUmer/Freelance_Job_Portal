const express = require('express');
const router = express.Router();

const tech = require('../controllers/technologyController');

const {
    createTechnologyValidator,
    addSkillValidator
} = require('../validators/technologyValidator');

const validationMiddleware = require('../middlewares/validationMiddleware');
const { verifyToken, requireDeveloper, requireRoles } = require('../middlewares/authMiddleware');

router.get('/', tech.getTechnologies);

router.post(
    '/',
    verifyToken,
    requireRoles(['CLIENT', 'DEVELOPER']),
    createTechnologyValidator,
    validationMiddleware.validateRequest,
    tech.createTechnology
);

router.post(
    '/skills',
    verifyToken,
    requireDeveloper,
    addSkillValidator,
    validationMiddleware.validateRequest,
    tech.addSkill
);

router.put(
    '/skills/:techID',
    verifyToken,
    requireDeveloper,
    tech.updateSkill
);

router.delete(
    '/skills/:techID',
    verifyToken,
    requireDeveloper,
    tech.deleteSkill
);

module.exports = router;