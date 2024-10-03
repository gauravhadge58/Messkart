// models/Owner.js
const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true }
});

// This will ensure data is saved to the 'owners' collection
const Owner = mongoose.model('Owner', ownerSchema, 'owners');

module.exports = Owner;
