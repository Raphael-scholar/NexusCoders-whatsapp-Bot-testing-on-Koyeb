const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    premium: {
        type: Boolean,
        default: false
    },
    premiumUntil: Date,
    registered: {
        type: Boolean,
        default: false
    },
    banned: {
        type: Boolean,
        default: false
    },
    warns: {
        type: Number,
        default: 0
    },
    limit: {
        type: Number,
        default: 50
    },
    exp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    lastDaily: Date,
    afk: {
        status: Boolean,
        reason: String,
        since: Date
    },
    settings: {
        language: {
            type: String,
            default: 'en'
        },
        notifications: {
            type: Boolean,
            default: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
