const   middlewareObj   = {},
        User            = require('../models/user'),
        Token           = require('../models/token'),
        nodemailer      = require('nodemailer'),
        crypto          = require('crypto')

//DOT ENV
require('dotenv').config()

middlewareObj.isLoggedIn = (req,res,next)=>{
    console.log('==================')
    console.log('IN THE ISLOGGEDIN MIDDLEWARE')
    console.log('==================')
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
    console.log('==================')
    console.log('IN THE TOKEN CREATE METHOD')
    console.log('==================') 
    let token = await Token.create({
        _userID: user._id,
        token: crypto.randomBytes(16).toString('hex')
    })
    console.log('CREATED TOKEN:')
    console.log(token)
    console.log('==================')
    console.log('LEAVING TOKEN CREATE METHOD')
    console.log('==================')     
    return token
}

//NODEMAILER SENDGRID RELATED
middlewareObj.sendVerificationEmail = async(user,token,req)=>{
    console.log('==================')
    console.log('IN THE EMAIL METHOD')
    console.log('==================')
    //USER AND TOKEN GETTING HERE VERIFIED
    try {
        const transporter = nodemailer.createTransport({
            service: 'Sendgrid',
            auth: {
                user: process.env.SENDGRID_USERNAME,
                pass: process.env.SENDGRID_PASSWORD
            }
        })
        console.log('Creating Mail Options')
        let mailOptions = { 
            from: 'no-reply@emailVerificationTest.com', 
            to: user.email,
            subject: 'Email Test Account Verification Token',
            text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/verification\/' + token.token + '\n\n' + 'Or copy the token: ' + token.token
        }
        console.log(mailOptions)
        //Sending Mail
        console.log(`Sending Mail! (Currently Disabled)`)
        // await transporter.sendMail(mailOptions, (err)=>{
        //     console.log('SENDING TOKEN')
        // })
        return
    } catch (err) {
        console.log(`ERROR FOUND: ${err}`)
        return
    }
}

//Update User related
middlewareObj.updateUser = async (user,req,res)=>{
    console.log('==================')
    console.log('IN THE UPDATEUSER METHOD')
    console.log('==================')
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