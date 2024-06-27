const Tag = require('../models/tag.model');

// Get all tags
exports.getAllTags = async (req, res) => {
    try {
        const tags = await Tag.find();
        res.json(tags);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
