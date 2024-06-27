const { check, validationResult } = require('express-validator');

// Validation rules for user registration
const validateUserRegistration = [
    check('username')
        .notEmpty().withMessage('Username is required')
        .matches(/^[a-zA-Z0-9._]+$/).withMessage('Username can only contain letters, numbers, dots, and underscores')
        .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters long'),

    check('email')
        .isEmail().withMessage('Please include a valid email'),

    check('password')
        .isLength({ min: 12 }).withMessage('Password must be at least 12 characters long')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[!?._&%-]/).withMessage('Password must contain at least one special character: !?._&%-'),

    check('address.street').optional().isString().escape(),
    check('address.city').optional().isString().escape(),
    check('address.state').optional().isString().escape(),
    check('address.postalCode').optional().isPostalCode('any').withMessage('Invalid postal code'),
    check('address.country').optional().isString().escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateUserRegistration,
};
