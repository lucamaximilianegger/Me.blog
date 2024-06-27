const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ActivitySchema = new mongoose.Schema({
    action: {
        type: String,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const ReviewHistorySchema = new mongoose.Schema({
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
    },
    comments: [{
        type: String,
    }],
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
    },
    roles: {
        type: [String],
        default: ['Reader'],
    },
    profileImage: {
        type: String, // URL oder Base64-String
    },
    emailVerificationToken: {
        type: String,
    },
    accountDeletionToken: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    deletionRequested: {
        type: Boolean,
        default: false,
    },
    deletionDate: {
        type: Date,
    },
    notificationSettings: {
        email: {
            type: Boolean,
            default: true,
        },
        sms: {
            type: Boolean,
            default: false,
        },
    },
    activityLog: {
        enabled: {
            type: Boolean,
            default: true,
        },
        activities: [ActivitySchema],
    },
    reviewHistory: [ReviewHistorySchema],
    date: {
        type: Date,
        default: Date.now,
    },
});

// Middleware to hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(12); // Increase salt rounds for added security
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
