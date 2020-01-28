const   passport        = require('passport'),
        LocalStrategy   = require('passport-local'),
        User            = require('../models/user')

// //Serialize into cookie
// passport.serializeUser((user,done)=>{
//     done(null,user._id)
// })

// //Deserialize Find User Based on Cookie
// passport.deserializeUser(async(_id,done)=>{
//     const foundUser = await User.findById(_id)
//     done(null,foundUser)
// })

//Static Auth Method
// passport.use(new LocalStrategy(User.authenticate()))

//Local Config
passport.use(User.createStrategy())

// Serialize and Deserialize LOCAL PASSPORT MONGOOSE
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())