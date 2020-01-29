const   middlewareObj   = {},
        User            = require('../models/user')

middlewareObj.isLoggedIn = (req,res,next)=>{
    if(req.isAuthenticated() && req.user.isVerified){
        return next()
    }
    console.log('Middleware: User not authenticated')
    req.flash('error',`Please verify your email with the link sent to ${req.user.email}`)
    res.redirect('/verification')
}

module.exports = middlewareObj