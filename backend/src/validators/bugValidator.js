const { body } = require('express-validator');

const VALID_BUG_SEVERITY = ['LOW', 'MINOR', 'MAJOR', 'CRITICAL'];

const createBugValidator = [
    body('contractID')
        .notEmpty().withMessage('contractID is required')
        .isUUID().withMessage('Invalid contractID'),

    body('title')
        .notEmpty().withMessage('Title is required')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Title too short')
        .escape(),

    body('description')
        .notEmpty().withMessage('Description is required')
        .trim()
        .escape(),

    body('severity')
        .notEmpty().withMessage('Severity is required')
        .isIn(VALID_BUG_SEVERITY)
        .withMessage(`Severity must be one of: ${VALID_BUG_SEVERITY.join(', ')}`)
];

const updateBugValidator = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 3 })
        .withMessage('Title too short')
        .escape(),

    body('description')
        .optional()
        .trim()
        .escape(),

    body('severity')
        .optional()
        .isIn(VALID_BUG_SEVERITY)
        .withMessage(`Severity must be one of: ${VALID_BUG_SEVERITY.join(', ')}`)
];

module.exports = {
    createBugValidator,
    updateBugValidator
};
