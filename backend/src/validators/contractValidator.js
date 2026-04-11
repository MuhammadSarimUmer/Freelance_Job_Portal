const { body } = require('express-validator');

const VALID_CONTRACT_STATUS = [
    'DRAFT',
    'SIGNED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
];

const createContractValidator = [
    body('appID')
        .notEmpty().withMessage('appID is required')
        .isUUID().withMessage('Invalid appID'),

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

    body('startDate')
        .notEmpty().withMessage('Start date is required')
        .isISO8601().withMessage('Invalid date format'),

    body('endDate')
        .optional()
        .isISO8601().withMessage('Invalid date format'),

    body('totalAmount')
        .notEmpty().withMessage('Total amount is required')
        .isFloat({ min: 0 })
        .withMessage('Amount must be positive'),

    body('status')
        .optional()
        .isIn(VALID_CONTRACT_STATUS)
        .withMessage('Invalid contract status')
];

const updateContractValidator = [
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

    body('startDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid date'),

    body('endDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid date'),

    body('totalAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Invalid amount'),

    body('status')
        .optional()
        .isIn(VALID_CONTRACT_STATUS)
        .withMessage('Invalid contract status')
];

module.exports = {
    createContractValidator,
    updateContractValidator
};