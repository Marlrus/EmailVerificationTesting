const mongoose      = require('mongoose')

const UserSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    isVerfied: {type: Boolean, default: false},
    password: String,
    password_reset_token: String,
    password_reset_expires: Date
})

module.exports = mongoose.model('User', UserSchema)