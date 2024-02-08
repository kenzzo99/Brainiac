const mongoose = require('mongoose');

const assistantSchema = new mongoose.Schema({
    assistantId: String, // store just the assistant id
    
}, {
    timestamps: true
});

module.exports = mongoose.model('Assistant', assistantSchema);