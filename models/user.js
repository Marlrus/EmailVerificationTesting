const   mongoose                = require('mongoose')
        // passportLocalMongoose   = require('passport-local-mongoose')

const UserSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    isVerfied: {type: Boolean, default: false},
    password: String,
    password_reset_token: String,
    password_reset_expires: Date
})

//Passport Local Mongoose methods
// UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', UserSchema)