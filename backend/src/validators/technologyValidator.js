const { body } = require('express-validator');

const createTechnologyValidator = [
    body('techName')
        .notEmpty().withMessage('Technology name is required')
        .trim()
        .escape(),

    body('category')
        .notEmpty().withMessage('Category is required')
        .trim()
        .escape(),

    body('version')
        .optional()
        .isString().withMessage('Version must be a string')
];

const addSkillValidator = [
    body('techID')
        .notEmpty().withMessage('techID is required'),

    body('proficiencyLevel')
        .notEmpty().withMessage('Proficiency level is required')
        .isIn(['BEGINNER', 'INTERMEDIATE', 'EXPERT'])
        .withMessage('Invalid proficiency level'),

    body('yearsExperience')
        .optional()
        .isInt({ min: 0, max: 50 })
        .withMessage('Years must be between 0 and 50')
];

module.exports = {
    createTechnologyValidator,
    addSkillValidator
};