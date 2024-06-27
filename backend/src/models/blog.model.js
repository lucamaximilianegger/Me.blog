const mongoose = require('mongoose');

// Funktion zur Berechnung der Lesezeit
const calculateReadTime = (content) => {
    const wordsPerMinute = 200; // Durchschnittliche Lesegeschwindigkeit
    const words = content.split(/\s+/).length; // Wörter zählen
    const minutes = Math.ceil(words / wordsPerMinute); // Minuten berechnen
    return `${minutes} min read`;
};

// Schema für Kommentare
const CommentSchema = new mongoose.Schema({
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
        type: String, // Speichert Informationen über den spezifischen Abschnitt (z.B. ID oder Absatznummer)
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Schema für Blogs
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
        type: [String], // Array von Strings zur Unterstützung mehrerer Bilder
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
        comments: [CommentSchema], // Array von Kommentaren
        isReviewed: {
            type: Boolean,
            default: false,
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
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
