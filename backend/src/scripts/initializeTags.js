const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Tag = require('../models/tag.model'); // Import the Tag model

dotenv.config(); // Load environment variables

// Log the MONGO_URI to check if it's correctly loaded
console.log('MONGO_URI:', process.env.MONGO_URI);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const initializeTags = async () => {
    const tagsFilePath = path.join(__dirname, 'tags.json');
    let tags;

    try {
        const fileContent = fs.readFileSync(tagsFilePath, 'utf8');
        tags = JSON.parse(fileContent);
    } catch (err) {
        console.error('Error reading or parsing tags.json:', err.message);
        process.exit(1);
    }

    if (!Array.isArray(tags)) {
        console.error('The tags data is not an array');
        process.exit(1);
    }

    try {
        const existingTags = await Tag.find();
        const existingTagNames = existingTags.map(tag => tag.name);

        // Filter out duplicates from the tags.json file
        const uniqueTags = [...new Set(tags)];

        const newTags = uniqueTags.filter(tag => !existingTagNames.includes(tag));
        const tagPromises = newTags.map(tag => new Tag({ name: tag }).save());

        await Promise.all(tagPromises);
        console.log('Tags initialized successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error initializing tags:', err.message);
        process.exit(1);
    }
};

connectDB().then(initializeTags);
