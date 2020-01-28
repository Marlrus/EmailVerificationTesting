const   middlewareObj   = {},
        User            = require('../models/user')

middlewareObj.isLoggedIn = (req,res,next)=>{
    if(req.isAuthenticated()){
        return next()
    }
    console.log('No Authenticated User')
    res.redirect('/login')
}

module.exports = middlewareObj