const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    deviceType: String, // PC or PS4
    startTime: Date,
    endTime: Date,
    duration: Number, // in minutes
    charge: Number
});

module.exports = mongoose.model('Session', SessionSchema);
