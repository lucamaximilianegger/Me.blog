const express = require('express');
const router = express.Router();
const { getAllTags } = require('../controllers/tag.controller');

// Route to get all tags
router.route('/')
    .get(getAllTags); // Get all tags

module.exports = router;
