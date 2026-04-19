const { body } = require('express-validator');

const VALID_MILESTONE_STATUS = [
    'PENDING',
    'IN_PROGRESS',
    'IN_REVIEW',
    'COMPLETED'
];

const createMilestoneValidator = [
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

    body('dueDate')
        .notEmpty().withMessage('Due date is required')
        .isISO8601().withMessage('Invalid date format'),

    body('milestoneAmount')
        .notEmpty().withMessage('Milestone amount is required')
        .isFloat({ min: 0 })
        .withMessage('Amount must be positive'),

    body('assigneeIDs')
        .optional()
        .isArray()
        .withMessage('assigneeIDs must be an array'),

    body('assigneeIDs.*')
        .optional()
        .isUUID()
        .withMessage('assigneeIDs must contain valid UUIDs')
];

const updateMilestoneValidator = [
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

    body('dueDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format'),

    body('milestoneAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Invalid amount'),

    body('assigneeIDs')
        .optional()
        .isArray()
        .withMessage('assigneeIDs must be an array'),

    body('assigneeIDs.*')
        .optional()
        .isUUID()
        .withMessage('assigneeIDs must contain valid UUIDs')
];

module.exports = {
    createMilestoneValidator,
    updateMilestoneValidator
};
