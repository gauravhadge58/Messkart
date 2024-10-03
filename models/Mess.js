// models/Mess.js
const mongoose = require('mongoose');

const messSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    image: { type: String, required: true },
    menu: { type: Array, required: true },
    owner: { type: String, required: true }, // Store owner's name
    password: { type: String, required: true } // Store owner's password
});

const Mess = mongoose.model('Mess', messSchema);
module.exports = Mess;
