// models/Review.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    username: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 }
});

module.exports = mongoose.model('Review', ReviewSchema);
