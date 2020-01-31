const   middlewareObj   = {},
        User            = require('../models/user'),
        Token           = require('../models/token'),
        nodemailer      = require('nodemailer'),
        crypto          = require('crypto')

//DOT ENV
require('dotenv').config()

middlewareObj.isLoggedIn = (req,res,next)=>{
    console.log(`
    ==============================
    USING THE isLoggedIn() IMPORTED METHOD
    ==============================
    `)
    if(req.isAuthenticated()){
        // console.log(req.user)
        if(!req.user.isVerified){
            req.flash('error', `Please verify your email with the link sent to ${req.user.email}`)
            res.redirect('/verification')
        }else{
            return next()
        }
    }else{
        req.flash('error', 'You need to log in to do that')
        res.redirect('/login')
    }
}

//TOKEN RELATED
middlewareObj.createToken = async(user)=>{
    console.log(`
    ==============================
    USING THE createToken() IMPORTED METHOD
    ==============================
    `) 
    let token = await Token.create({
        _userID: user._id,
        token: crypto.randomBytes(16).toString('hex')
    })
    console.log('CREATED TOKEN:')
    console.log(token)
    return token
}

//===============================
//NODEMAILER SENDGRID RELATED
//================================
//COULD DO A CREATE TRANSPORTER METHOD AS WELL
middlewareObj.createTransporter = ()=>{
    console.log(`
    ==============================
    USING THE createTransporter() METHOD
    ==============================
    `)
    const transporter = nodemailer.createTransport({
        service: 'Sendgrid',
        auth: {
            user: process.env.SENDGRID_USERNAME,
            pass: process.env.SENDGRID_PASSWORD
        }
    })
    return transporter
}

//VERIFY EMAIL SEND
middlewareObj.sendVerificationEmail = async(user,token,req)=>{
    console.log(`
    ==============================
    USING THE sendVerificationEmail() IMPORTED METHOD
    ==============================
    `)
    //USER AND TOKEN GETTING HERE VERIFIED
    try {
        const transporter = middlewareObj.createTransporter()
        console.log('Creating Mail Options')
        let mailOptions = { 
            from: 'no-reply@emailVerificationTest.com', 
            to: user.email,
            subject: 'Email Test Account Verification Token',
            text: 'Hello, ' +user.first_name+'!\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/verification\/' + token.token + '\n\n' + 'Or copy the token: ' + token.token
        }
        console.log(mailOptions)
        //Sending Mail
        // console.log(`Sending Mail! (Currently Disabled)`)
        console.log('Sending Mail!')
        await transporter.sendMail(mailOptions, (err)=>{
            console.log('SENDING TOKEN')
        })
        return
    } catch (err) {
        console.log(`ERROR FOUND: ${err}`)
        return
    }
}

//SEND PASSWORD TOKEN
middlewareObj.sendPasswordToken = async(user,token,req)=>{
    console.log(`
    ==============================
    USING THE sendPasswordToken() IMPORTED METHOD
    ==============================
    `)
    //USER AND TOKEN GETTING HERE VERIFIED
    try {
        const transporter = middlewareObj.createTransporter()
        console.log('Creating Mail Options')
        let mailOptions = { 
            from: 'no-reply@emailVerificationTest.com', 
            to: user.email,
            subject: 'Password Reset Link and Token',
            text: 'Hello, ' +user.first_name+'!\n\n' + 'We receieved a password reset request from our webpage.\n\n Please reset your password by clicking the link: \nhttp:\/\/' + req.headers.host + '\/password-forgot\/' + token.token + '\n\n' + 'Or copy the token: ' + token.token
        }
        console.log(mailOptions)
        //Sending Mail
        // console.log(`Sending Mail! (Currently Disabled)`)
        console.log('Sending Mail!')
        await transporter.sendMail(mailOptions, (err)=>{
            console.log('SENDING TOKEN')
        })
        return
    } catch (err) {
        console.log(`ERROR FOUND: ${err}`)
        return
    }
}

//Update User related
middlewareObj.updateUser = async (user,req,res)=>{
    console.log(`
    ==============================
    USING THE updateUser() IMPORTED METHOD
    ==============================
    `)
    //Check if the email is taken
    const checkEmail = await User.findOne({email:req.body.email})
    if(checkEmail){
        console.log('Error: User with that email already exists')
        req.flash('error','A user with that email already exists')
        res.redirect('/verification')
        return false
    }else{
        user.email = req.body.email
        user.username = req.body.email
        user.save()
        return user
    }

}

module.exports = middlewareObj