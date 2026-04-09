const { body } = require('express-validator');

const registerValidator = [
    body('fullName')
        .trim()
        .notEmpty().withMessage('Full name is required')
        .escape(),
    body('email')
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role')
        .isIn(['DEVELOPER', 'CLIENT']).withMessage('Role must be DEVELOPER or CLIENT'),
    body('phoneNumber')
        .optional()
        .trim()
        .isMobilePhone('any').withMessage('Invalid phone number'),
    body('country')
        .if(body('role').equals('CLIENT'))
        .notEmpty().withMessage('Country is required for clients')
        .trim()
];

const loginValidator = [
    body('email')
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
];

const forgotPasswordValidator = [
    body('email')
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail()
];

// const resetPasswordValidator = [
//     body('token')
//         .notEmpty().withMessage('Reset token is required'),
//     body('newPassword')
//         .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
// ];

module.exports = {
    registerValidator,
    loginValidator,
    forgotPasswordValidator
};