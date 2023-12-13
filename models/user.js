const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: { // Store hashed passwords, not plain text
        type: String,
        required: true
    },
    // Additional fields like registration date, profile details, etc.
});

const User = mongoose.model('User', userSchema);