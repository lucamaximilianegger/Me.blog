const mongoose = require('mongoose');

// Funktion zur Berechnung der Lesezeit
const calculateReadTime = (content) => {
    const wordsPerMinute = 200; // Durchschnittliche Lesegeschwindigkeit
    const words = content.split(/\s+/).length; // Wörter zählen
    const minutes = Math.ceil(words / wordsPerMinute); // Minuten berechnen
    return `${minutes} min read`;
};

// Existing ReviewComment schema (for the review process)
const ReviewCommentSchema = new mongoose.Schema({
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    section: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    readTime: {
        type: String,
    },
    images: {
        type: [String],
    },
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
    }],
    status: {
        type: String,
        enum: ['Draft', 'Published', 'Archived', 'In Review'],
        default: 'Draft',
    },
    review: {
        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        comments: [ReviewCommentSchema],
        isReviewed: {
            type: Boolean,
            default: false,
        },
    },
    publicComments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PublicComment'
    }],
    publicCommentsEnabled: {
        type: Boolean,
        default: true
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});


// Middleware zur Berechnung der Lesezeit vor dem Speichern
BlogSchema.pre('save', function (next) {
    this.readTime = calculateReadTime(this.content);
    next();
});

// Middleware zur Aktualisierung des updatedAt-Feldes
BlogSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updatedAt: new Date() });
    next();
});

module.exports = mongoose.model('Blog', BlogSchema);
