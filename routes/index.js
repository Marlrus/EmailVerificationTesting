const   express     = require('express'),
        router      = express.Router({mergeParams:true}),
        passport    = require('passport'),
        User        = require('../models/user'),
        Token       = require('../models/token'),
        middleware  = require('../middleware'),
        crypto      = require('crypto'),
        nodemailer  = require('nodemailer')

//DOT ENV
require('dotenv').config()

//ROUTES
router.get('/',(req,res)=>{
    res.render('landing')
})

router.get('/sign-up', (req,res)=>{
    res.render('sign-up')
})

//SIGN UP ROUTE REDO 3
router.post('/sign-up',async(req,res)=>{
    console.log('In the Post Route')
    const newUser = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        username: req.body.email
    })
    console.log(newUser)
    try {
        const user = await User.register(newUser, req.body.password)
        console.log('Right after register method')
        console.log(`Created new User: ${user}`)
        //Create & save verification token for this user
        const token = await middleware.createToken(user)
        //Send the Email CREATED SENDGRID
        await middleware.sendVerificationEmail(user,token,req)
        console.log('AFTER EMAIL MIDDLEWARE')
        passport.authenticate('local')(req,res,()=>{
            if(user.isVerified){
                res.redirect('/profile')
            }else{
                res.redirect('/verification')
            }
        })
    } catch (err) {
        req.flash('error', `${err.message}`)
        return res.redirect('/sign-up')
    }
})

//verification Message
router.get('/verification',(req,res)=>{
    if(req.user){
        res.render('verification')
    }else{
        req.flash('error','You must log in to do that')
        res.redirect('Login')
    }
})

//Verification Resend
router.post('/verification',async(req,res)=>{
    console.log('==================')
    console.log('IN THE VERIFICATION POST ROUTE')
    console.log('==================')
    const user = await User.findById(req.user._id)
    console.log(user)
    //look for token using user
    const token = await Token.findOne({_userID: user._id})
    console.log(token)
    console.log(req.body.email)
    //Boolean
    let sameEmail = (user.email===req.body.email)
    //handle found token
    if(token && sameEmail){
        //Same email
        console.log('Token Exists & Emails Match')
        req.flash('success', `Email verification token is still valid check your inbox or spam folder at ${user.email}`)
        res.redirect('/verification')
    }else if (token && !sameEmail){
        //new email
        console.log('Token Exists but Emails Not matching')
        console.log(`Old email: ${user.email}`)
        const updatedUser = await middleware.updateUser(user,req,res)
        if(updatedUser){
            console.log(`Updated user: ${updatedUser}`)
            middleware.sendVerificationEmail(updatedUser,token,req)
            req.flash('success',`Email changed and token sent to ${updatedUser.email}. Must login again`)
            res.redirect('/login')
        }
    //handle expired token
    }else if (!token && sameEmail){
        //same email
        console.log(`Token expired, Emails Match`)
        const newToken =await middleware.createToken(user)
        middleware.sendVerificationEmail(user,newToken,req)
        req.flash('success',`Token had expired, re-sent to ${user.email}`)
        res.redirect('/verification')
    }else{
        //new email
        console.log(`Token expired, Emails don't match`)
        console.log(`Old email: ${user.email}`)
        const updatedUser = await middleware.updateUser(user,req,res)
        if(updatedUser){
            console.log(`Updated user: ${updatedUser}`)
            const newToken =await middleware.createToken(updatedUser)
            middleware.sendVerificationEmail(updatedUser,newToken,req)
            req.flash('success',`Email changed and token sent to ${updatedUser.email}. Must login again`)
            res.redirect('/login')
        }
    }
    
})

//verification LINK
router.get('/verification/:token',async (req,res)=>{
    console.log('VERIFICATION ROUTE')
    console.log(req.params.token)
    const foundToken = await Token.findOne({token: req.params.token})
    console.log(foundToken)
    const confirmedUser = await User.findById(foundToken._userID)
    if(foundToken && confirmedUser){
        console.log(confirmedUser)
        confirmedUser.isVerified = true
        await confirmedUser.save()
        // console.log(confirmedUser.isVerified)
        console.log(req.user)
        req.flash('success', 'Email successfuly verified!')
        res.redirect('/profile')  
    } else{
        console.log('Token not found')
        req.flash('error','Token Expired!')
        res.redirect('/verification')
    }
})

//verification FORM
router.post('/verification/tokenforminput',async(req,res)=>{
    console.log(req.body.token)
    const foundToken = await Token.findOne({token: req.body.token})
    console.log(foundToken)
    const confirmedUser = await User.findById(foundToken._userID)
    if (foundToken && confirmedUser){
        console.log(confirmedUser)
        confirmedUser.isVerified = true
        await confirmedUser.save()
        console.log(req.user)
        req.flash('success', 'Email successfuly verified!')
        res.redirect('/profile')  
    }else{
        req.flash('error',`Invalid token value sent through the form. Please verify with the value sent to the email: ${req.user.email}`)
        res.redirect('/verification')
    }
})

//LOGIN
router.get('/login', (req,res)=>{
    res.render('login')
})

//CORRECT LOGIN HANDLER
router.post('/login', passport.authenticate('local',
    {
        // successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true,
    }),(req,res)=>{
        console.log('==================')
        console.log('IN THE LOGIN ROUTE')
        console.log('==================')
        // console.log(req.user)
        if(req.user.isVerified){
            console.log(`${req.user.first_name} is Verified`)
            req.flash('success',`Welcome Back ${req.user.first_name}`)
            res.redirect('/profile')
        }else{
            req.flash('error',`Please verify your email with the link sent to ${req.user.email}`)
            res.redirect('/verification')
        }
    }
)

//LOGOUT
router.get('/logout', middleware.isLoggedIn, (req,res)=>{
    req.logout()
    res.redirect('/')
})

//Profile Route
router.get('/profile', middleware.isLoggedIn, (req,res)=>{
    req.flash('success', `Welcome back ${req.user.first_name}!`)
    res.render('profile')
})

//==================
//PASSWORD ROUTES
//==================
router.get('/profile/password-change',middleware.isLoggedIn,(req,res)=>{
    res.render('password-change')
})

//PASSWORD ChANGE ROUTE
router.put('/profile/password-change',middleware.isLoggedIn,async(req,res)=>{
    let currentPassword = req.body.currentPassword
    let newPassword = req.body.newPassword
    if(currentPassword === newPassword){
        req.flash('error','New password cannot be the same as current password')
        res.redirect('/profile/password-change')
    }else{
        const user = await User.findById(req.user._id)
        console.log(user)
        user.changePassword(currentPassword, newPassword, (err, user)=>{
            console.log('Inside changePassword')
            if(err && err.name==='IncorrectPasswordError'){
                req.flash('error', `Wrong password, please try again.`)
                res.redirect('/profile/password-change')
            }else if(err){
                req.flash('error', 'Something went wrong, please try again!')
            }else{
                req.flash('success', 'Password changed Successfuly!')
                res.redirect('/profile')
            }
        })
    }
})

//PASSWORD FORGOT
router.get('/password-forgot',(req,res)=>{
    res.render('password-forgot')
})

//PASSWORD RESET TOKEN
router.post('/password-forgot',async(req,res)=>{
    //find user
    const user = await User.findOne({email:req.body.email})
    console.log(user)
    if(user){
        //look for existing token
        const existingToken = await Token.findOne({_userID: user._id})
        if(existingToken){
            console.log(existingToken)
            req.flash('success',`A valid token has already been sent to ${user.email}, please check your inbox and spam.`)
            res.redirect('/token-password-reset')
        }else{
            //create token
            const token = await middleware.createToken(user)
            console.log(token)
            //send token
            middleware.sendPasswordToken(user,token,req)
            req.flash('success', `Sent token to ${user.email}`)
            res.redirect('/token-password-reset')
        }
    }else{
        req.flash('error','Email not associated with a registered user')
        res.redirect('/password-forgot')
    }
})

//token input form
router.get('/token-password-reset',(req,res)=>{
    res.render('token-password-reset')
})

router.put('/password-forgot',async(req,res)=>{
    console.log(req.body)
    //find token through form
    token = await Token.findOne({token:req.body.token})
    console.log(token)
    if(token){
        //find user using token
        user = await User.findById(token._userID)
        console.log(user)
        //set password using form
        user.setPassword(req.body.newPassword,(err)=>{
            if(err){
                console.log(err)
                req.flash('error', 'Something went wrong, please try again')
                res.redirect('/token-password-reset')
            }else{
                user.save()
                req.flash('success', `Password successfuly changed! Log in again please`)
                res.redirect('/login')
            }
        })
    }else{
        req.flash('error', 'Token value invalid, please try again')
        res.redirect('/token-password-reset')
    }
})

//TESTING
router.get('/test',async(req,res)=>{
    console.log('==================')
    console.log('IN THE TEST ROUTE')
    console.log('==================')
    const user = await User.findOne({})
    console.log(user)
    const token = await middleware.createToken(user)
    console.log('AFTER CREATETOKEN METHOD')
    console.log(token)
    res.send('TESTING')
})

module.exports = router