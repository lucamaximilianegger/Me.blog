const User = require('../models/user.model'); // Import the User model
const jwt = require('jsonwebtoken'); // Import JSON Web Token for authentication
const { validateUserRegistration } = require('../middleware/validators.middleware'); // Import the validation middleware
const { sendVerificationEmail, sendDeletionConfirmationEmail } = require('../services/email.service'); // Import email services
const { generateToken, generateRefreshToken, verifyToken, generateAccountDeletionToken } = require('../services/jwt.service'); // Import JWT utils

// Register a new user
exports.registerUser = [
    validateUserRegistration,
    async (req, res) => {
        const { username, email, password } = req.body;

        try {
            let existingUser = await User.findOne({ $or: [{ username }, { email }] });

            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            let user = new User({ username, email, password });

            const emailVerificationToken = generateToken(user._id);
            user.emailVerificationToken = emailVerificationToken;
            user.isVerified = false;

            await sendVerificationEmail(user, emailVerificationToken, req);
            await user.save();

            res.status(201).json({ message: 'Verification email sent. Please check your email to verify your account.' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
];

// Confirm email
exports.confirmEmail = async (req, res) => {
    try {
        const decoded = verifyToken(req.params.token);
        if (!decoded) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        const user = await User.findOne({ _id: decoded.userId, emailVerificationToken: req.params.token });
        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        user.emailVerificationToken = null;
        user.isVerified = true;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Authenticate user and get token
exports.loginUser = async (req, res) => {
    const { email, password, deviceId } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ message: 'Please verify your email to log in' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id, deviceId);

        req.session.userId = user._id;
        req.session.user = user;

        res.json({ token, refreshToken, user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Refresh JWT token
exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.sendStatus(401);

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const newToken = generateToken(decoded.userId);
        res.json({ token: newToken });
    } catch (err) {
        res.sendStatus(403);
    }
};

// Request account deletion
exports.requestAccountDeletion = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(400).json({ message: 'User not authenticated' });
        }

        const user = req.user;
        const accountDeletionToken = generateAccountDeletionToken(user._id);

        user.accountDeletionToken = accountDeletionToken;
        await user.save();
        await sendDeletionConfirmationEmail(user, accountDeletionToken, req);

        res.status(200).json({ message: 'Confirmation email sent. Please check your email to confirm account deletion.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Confirm account deletion
exports.confirmAccountDeletion = async (req, res) => {
    try {
        const token = req.params.token;

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.accountDeletionToken === token) {
            user.accountDeletionToken = null;
            user.deletionRequested = true;
            user.deletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Set deletion date 30 days from now
            await user.save();

            res.status(200).json({ message: 'Account deletion confirmed. Your account will be deleted after 30 days.' });
        } else {
            res.status(400).json({ message: 'Invalid token' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Cancel account deletion
exports.cancelAccountDeletion = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(400).json({ message: 'User not authenticated' });
        }

        const user = req.user;
        user.deletionRequested = false;
        user.deletionDate = null;
        await user.save();

        res.status(200).json({ message: 'Account deletion request cancelled' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
