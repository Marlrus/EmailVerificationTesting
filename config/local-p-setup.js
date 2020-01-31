const   passport        = require('passport'),
        User            = require('../models/user')

//PASSPORT-LOCAL REQUIRE (NOT BEING USED)
require('passport-local')

//Local Config
passport.use(User.createStrategy())

// Serialize and Deserialize LOCAL PASSPORT MONGOOSE
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())