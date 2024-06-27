const User = require('../models/user.model'); // Import the User model

// Get user profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
    const { username, email, address } = req.body;

    const updatedUser = {};
    if (username) updatedUser.username = username;
    if (email) updatedUser.email = email;
    if (address) updatedUser.address = address;
    if (req.file) {
        updatedUser.profileImage = req.file.buffer.toString('base64');
    }

    try {
        let user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updatedUser },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
