const express = require('express');
const rateLimit = require('express-rate-limit'); // Import rateLimit
const router = express.Router();
const { registerUser, confirmEmail, loginUser, refreshToken, confirmAccountDeletion, requestAccountDeletion, cancelAccountDeletion } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const csrfProtection = require('csurf')({ cookie: true });

// Rate limit middleware
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login requests per windowMs
    message: 'Too many login attempts from this IP, please try again later.'
});

// Route to register a new user
router.post('/register', registerUser);

// Route to confirm user email
router.get('/email-confirmation/:token', confirmEmail);

// Route to authenticate user and get token
router.post('/login', loginLimiter, loginUser);

// Route to refresh JWT token
router.post('/token/refresh', csrfProtection, refreshToken);

// Route to request account deletion
router.post('/account-deletion/request', protect, csrfProtection, requestAccountDeletion);

// Route to confirm account deletion
router.get('/account-deletion/confirm/:token', confirmAccountDeletion);

// Route to cancel account deletion
router.post('/account-deletion/cancel', protect, csrfProtection, cancelAccountDeletion);

module.exports = router;
