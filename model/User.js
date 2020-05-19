const mongoose = require("mongoose");


const userSchema = mongoose.Schema({
    name : {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },
    email: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },
    password: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    },
    realPassword: {
        type: String,
    }
})

module.exports = mongoose.model('User', userSchema);