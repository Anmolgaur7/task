const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    Password: {
        type: String,
        required: true,
        minlength: 6
    },
    Date: {
        type: Date,
        default: Date.now
    },
    Points: {
        type: Number,
        default: 5000
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;