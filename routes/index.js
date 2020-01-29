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
router.post('/sign-up',(req,res)=>{
    console.log('In the Post Route')
    const newUser = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        username: req.body.email
    })
    console.log(newUser)
    User.register(newUser, req.body.password, async(err,user)=>{
        console.log(`Created new User: ${user}`)
        if (err){
            req.flash('error', `${err.message}`)
            return res.redirect('/sign-up')
        }
        //Create & save verification token for this user
        let token = await Token.create({
            _userID: user._id,
            token: crypto.randomBytes(16).toString('hex')
        })
        console.log('CREATED TOKEN:')
        console.log(token)
        //Send the Email CREATED SENDGRID
        let transporter = nodemailer.createTransport({
            service: 'Sendgrid',
            auth: {
                user: process.env.SENDGRID_USERNAME,
                pass: process.env.SENDGRID_PASSWORD
            }
        })
        let mailOptions = { 
            from: 'no-reply@emailVerificationTest.com', 
            to: user.email,
            subject: 'Account Verification Token',
            text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/verification\/' + token.token + '\n'
        }
        transporter.sendMail(mailOptions, (err)=>{
            console.log('SENDING FIRST TOKEN')
        })
        passport.authenticate('local')(req,res,()=>{
            if(user.isVerified){
                res.redirect('/profile')
            }else{
                res.redirect('/verification')
            }
        })
    })
})

//verification Message
router.get('/verification',(req,res)=>{
    res.render('verification')
})

//verification RESEND
router.post('/verification',async(req,res)=>{
    //find user in DB
    const foundUser = await User.findById(req.user._id)
    console.log(foundUser)
    console.log('Checking Emails')
    //Handle if email is the same
    if(foundUser.email === req.body.email){
        console.log('Same Email')
        //CAN BE MADE INTO MIDDLEWARE
        //Create & save verification token for this user
        let token = await Token.create({
            _userID: foundUser._id,
            token: crypto.randomBytes(16).toString('hex')
        })
        console.log('CREATED TOKEN:')
        console.log(token)
        //Send the Email CREATED SENDGRID
        let transporter = nodemailer.createTransport({
            service: 'Sendgrid',
            auth: {
                user: process.env.SENDGRID_USERNAME,
                pass: process.env.SENDGRID_PASSWORD
            }
        })
        let mailOptions = { 
            from: 'no-reply@emailVerificationTest.com', 
            to: foundUser.email,
            subject: 'Email Test Account Verification Token',
            text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/verification\/' + token.token + '\n'
        }
        transporter.sendMail(mailOptions, (err)=>{
            console.log('SENDING NEW TOKEN')
        })
        //Return to verification Message
        res.render('verification')
    }else{
        //change email and save
        foundUser.email = req.body.email
        foundUser.username = req.body.email
        await foundUser.save()
        console.log('Different Email Handler: UPDATING')
        console.log(foundUser)
        //Handle if email is different
        let token = await Token.create({
            _userID: foundUser._id,
            token: crypto.randomBytes(16).toString('hex')
        })
        console.log('CREATED TOKEN:')
        console.log(token)
        //Send the Email CREATED SENDGRID
        let transporter = nodemailer.createTransport({
            service: 'Sendgrid',
            auth: {
                user: process.env.SENDGRID_USERNAME,
                pass: process.env.SENDGRID_PASSWORD
            }
        })
        let mailOptions = { 
            from: 'no-reply@emailVerificationTest.com', 
            to: foundUser.email,
            subject: 'Account Verification Token',
            text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/verification\/' + token.token + '\n'
        }
        transporter.sendMail(mailOptions, (err)=>{
            console.log('SENDING NEW TOKEN')
        })
        //Return to verification Message
        res.render('verification')
    }
})

//verification LINK
router.get('/verification/:token',async (req,res)=>{
    console.log('VERIFICATION ROUTE')
    console.log(req.params.token)
    const foundToken = await Token.findOne({token: req.params.token})
    console.log(foundToken)
    if(!foundToken){
        console.log('Token not found')
        res.redirect('/')
    } else{
        const confirmedUser = await User.findById(foundToken._userID)
        console.log(confirmedUser)
        confirmedUser.isVerified = true
        await confirmedUser.save()
        // console.log(confirmedUser.isVerified)
        console.log(req.user)
        req.flash('success', 'Email successfuly verified!')
        res.redirect('/login')  
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
            res.redirect('/profile')
        }else{
            req.flash('error',`Please verify your email with the link sent to ${req.user.email}`)
            res.redirect('/login')
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

module.exports = router