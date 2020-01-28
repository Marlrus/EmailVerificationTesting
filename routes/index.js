const   express     = require('express'),
        router      = express.Router({mergeParams:true}),
        passport    = require('passport'),
        User        = require('../models/user'),
        Token        = require('../models/token'),
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
            return res.send(`Error: ${err}`)
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
            text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '\n'
        }
        transporter.sendMail(mailOptions, (err)=>{
            console.log('INSIDE SENDMAIL')
        })
        passport.authenticate('local')(req,res,()=>{
            if(user.isVerified){
                res.redirect('/profile')
            }else{
                res.send(`A verification email was sent to ${user.email}, please verify to continue.`)
            }
        })
    })
})

//CONFIRMATION LINK
router.get('/confirmation/:token',async (req,res)=>{
    console.log(req.params.token)
    const foundToken = await Token.findOne({token: req.params.token})
    // console.log(foundToken)
    if(!foundToken){
        console.log('Token not found')
        res.redirect('/')
    } else{
        const confirmedUser = await User.findById(req.user._id)
        // console.log(confirmedUser)
        confirmedUser.isVerified = true
        await confirmedUser.save()
        // console.log(confirmedUser.isVerified)
        // console.log(req.user)
        res.redirect('/profile')  
    }
})

//LOGIN
router.get('/login', (req,res)=>{
    res.render('login')
})

// router.post('/login', passport.authenticate('local',
//     {
//         successRedirect: '/profile',
//         failureRedirect: '/login',
//     }),(req,res)=>{

//     }
// )

//Login Post for Verification
router.post('/login', passport.authenticate('local'), async (req,res)=>{
    const foundUser = await User.findById(req.user._id)
    if(!foundUser.isVerified){
        res.send('User Email is not Verified')
    }else{
        res.send({token: generateToken(user), user: user.toJSON()})
    }
})

//LOGOUT
router.get('/logout', middleware.isLoggedIn, (req,res)=>{
    req.logout()
    res.redirect('/')
})

//Profile Route
router.get('/profile', middleware.isLoggedIn, (req,res)=>{
    // res.send(`${req.user} is logged in`)
    res.render('profile')
})

module.exports = router