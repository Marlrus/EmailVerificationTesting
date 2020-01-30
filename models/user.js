const   mongoose                = require('mongoose'),
        passportLocalMongoose   = require('passport-local-mongoose')

const UserSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    username: String,
    isVerified: {type: Boolean, default: false},
    password: String,
})

//Passport Local Mongoose methods
UserSchema.plugin(passportLocalMongoose, { usernameField: 'email' })

module.exports = mongoose.model('User', UserSchema)