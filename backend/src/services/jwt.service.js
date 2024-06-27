const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Generate Refresh Token
const generateRefreshToken = (userId, deviceId) => {
    return jwt.sign({ userId, deviceId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// Generate Account Deletion Token
const generateAccountDeletionToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateToken,
    generateRefreshToken,
    generateAccountDeletionToken,
    verifyToken
};
