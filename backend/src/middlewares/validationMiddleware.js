const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorList = errors.array();
        return res.status(400).json({
            success: false,
            message: errorList[0]?.msg || 'Validation error',
            errors: errorList
        });
    }
    next();
};

module.exports = {
    validateRequest
};