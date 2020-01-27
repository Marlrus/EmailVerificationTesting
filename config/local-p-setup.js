const   passport        = require('passport'),
        LocalStrategy   = require('passport-local'),
        User            = require('../models/user')

//DOTENV
require('dotenv').config()

//Serialize and Deserialize LOCAL PASSPORT MONGOOSE
// passport.serializeUser(User.serializeUser())
// passport.deserializeUser(User.deserializeUser())

//SERIALIZE AND DESERIALIZE

// passport.use(new LocalStrategy(User.authenticate()))
