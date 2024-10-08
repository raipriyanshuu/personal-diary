// src/models/DiaryEntry.js
const mongoose = require('mongoose');

const diaryEntrySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    // New category or tags field
    category: {
        type: String,
        default: 'General'
    },
    pinned: { type: Boolean, default: false }
    
   
  // Added pinned field
});

module.exports = mongoose.model('DiaryEntry', diaryEntrySchema);
