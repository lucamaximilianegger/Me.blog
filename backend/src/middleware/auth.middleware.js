const jwt = require('jsonwebtoken');
const User = require('../models/user.model'); // Import the User model

// Middleware to authenticate API requests using JWT
const authenticateToken = async (req, res, next) => {
    let token;

    // Check if token is in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1]; // Get token from header
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
        console.log('Decoded token:', decoded); // Debugging statement

        req.user = await User.findById(decoded.userId).select('-password'); // Get user from token
        console.log('Authenticated user:', req.user); // Debugging statement

        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        next(); // Proceed to the next middleware
    } catch (err) {
        console.error('Error in authenticateToken:', err.message);
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// Middleware to check session
const checkSession = (req, res, next) => {
    if (req.session.user && req.session.userId) {
        console.log('Session user:', req.session.user); // Debugging statement
        next(); // Proceed to the next middleware
    } else {
        res.status(401).json({ message: 'Not authorized, session not found' });
    }
};

const protect = (req, res, next) => {
    if (req.headers.authorization) {
        // If authorization header is present, use JWT authentication
        authenticateToken(req, res, next);
    } else if (req.session && req.session.userId) {
        // If session is present, use session authentication
        console.log('Session user:', req.session.user); // Debugging statement
        req.user = req.session.user;
        next();
    } else {
        res.status(401).json({ message: 'Not authorized, no token or session' });
    }
};

module.exports = { authenticateToken, checkSession, protect };