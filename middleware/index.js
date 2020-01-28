const   middlewareObj   = {},
        User            = require('../models/user')

middlewareObj.isLoggedIn = (req,res,next)=>{
    if(req.isAuthenticated() && req.user.isVerified){
        return next()
    }
    console.log('Middleware: User not authenticated')
    res.redirect('/login')
}

module.exports = middlewareObj