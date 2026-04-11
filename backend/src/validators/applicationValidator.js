const { body } = require('express-validator');

const createApplicationValidator = [
    body('appName')
        .notEmpty().withMessage('App name is required')
        .trim()
        .escape(),

    body('appType')
        .notEmpty().withMessage('App type is required')
        .trim()
        .escape(),

    body('description')
        .optional()
        .trim()
        .escape(),

    body('currentVersion')
        .optional()
        .isString().withMessage('Version must be a string')
];

const updateApplicationValidator = [
    body('appName')
        .optional()
        .notEmpty().withMessage('App name cannot be empty')
        .trim()
        .escape(),

    body('appType')
        .optional()
        .notEmpty().withMessage('App type cannot be empty')
        .trim()
        .escape(),

    body('description')
        .optional()
        .trim()
        .escape(),

    body('currentVersion')
        .optional()
        .isString().withMessage('Version must be a string')
];

module.exports = {
    createApplicationValidator,
    updateApplicationValidator
};