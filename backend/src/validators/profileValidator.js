const { body } = require('express-validator');

const updateDeveloperValidator = [
    body('fullName')
        .optional()
        .trim()
        .notEmpty().withMessage('Full name cannot be empty')
        .escape(),
    body('phoneNumber')
        .optional()
        .trim()
        .isMobilePhone('any').withMessage('Invalid phone number'),
    body('hourlyRate')
        .optional()
        .isFloat({ min: 0, max: 9999.99 }).withMessage('Hourly rate must be between 0 and 9999.99'),
    body('portfolioURL')
        .optional()
        .isURL().withMessage('Invalid portfolio URL'),
    body('cvUrl')
        .optional()
        .isURL().withMessage('Invalid CV URL'),
    body('availabilityStatus')
        .optional()
        .isIn(['AVAILABLE', 'BUSY', 'UNAVAILABLE']).withMessage('Invalid availability status'),
    body('experienceYears')
        .optional()
        .isInt({ min: 0, max: 50 }).withMessage('Experience years must be between 0 and 50'),
    body('removeProfileImage')
        .optional()
        .isBoolean().withMessage('removeProfileImage must be a boolean')
        .toBoolean(),
    body('removeCv')
        .optional()
        .isBoolean().withMessage('removeCv must be a boolean')
        .toBoolean(),
    body('removePortfolio')
        .optional()
        .isBoolean().withMessage('removePortfolio must be a boolean')
        .toBoolean()
];

const updateClientValidator = [
    body('fullName')
        .optional()
        .trim()
        .notEmpty().withMessage('Full name cannot be empty')
        .escape(),
    body('phoneNumber')
        .optional()
        .trim()
        .isMobilePhone('any').withMessage('Invalid phone number'),
    body('companyName')
        .optional()
        .trim()
        .escape(),
    body('billingAddress')
        .optional()
        .trim()
        .escape(),
    body('country')
        .optional()
        .trim()
        .notEmpty().withMessage('Country cannot be empty')
        .escape(),
    body('removeProfileImage')
        .optional()
        .isBoolean().withMessage('removeProfileImage must be a boolean')
        .toBoolean()
];

module.exports = {
    updateDeveloperValidator,
    updateClientValidator
};