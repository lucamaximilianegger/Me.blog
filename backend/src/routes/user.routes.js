const express = require('express'); // Import Express
const router = express.Router(); // Create a new router
const { getUserProfile, updateUserProfile } = require('../controllers/user.controller'); // Import user controllers
const { protect } = require('../middleware/auth.middleware'); // Import protect middleware
const upload = require('../middleware/upload.middleware'); // Import file upload middleware
const csrfProtection = require('csurf')({ cookie: true });

// Route to get user profile
router.get('/profile', protect, getUserProfile);

// Route to update user profile
router.put('/profile', protect, csrfProtection, upload.single('profileImage'), updateUserProfile);

module.exports = router;
