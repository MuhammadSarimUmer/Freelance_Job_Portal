const { body } = require('express-validator');

const createProposalValidator = [
    body('message')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 1, max: 4000 })
        .withMessage('Message must be between 1 and 4000 characters'),
    body('proposedRate')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Proposed rate must be a positive number'),
    body('role')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Role must be between 2 and 100 characters')
];

const inviteDeveloperValidator = [
    body('developerID')
        .notEmpty().withMessage('developerID is required')
        .isUUID().withMessage('Invalid developerID'),
    body('message')
        .optional()
        .trim()
        .isLength({ min: 5, max: 4000 })
        .withMessage('Message must be between 5 and 4000 characters'),
    body('role')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Role must be between 2 and 100 characters')
];

const declineProposalValidator = [
    body('declineReason')
        .optional()
        .trim()
        .isLength({ min: 3, max: 4000 })
        .withMessage('Decline reason must be between 3 and 4000 characters')
];

module.exports = {
    createProposalValidator,
    inviteDeveloperValidator,
    declineProposalValidator
};
