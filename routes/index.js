const   express     = require('express'),
        router      = express.Router({mergeParams:true}),
        passport    = require('passport'),
        User        = require('../models/user'),
        middleware  = require('../middleware')

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
    User.register(newUser, req.body.password, (err,user)=>{
        console.log(`Created new User: ${user}`)
        if (err){
            return res.send(`Error: ${err}`)
        }
        passport.authenticate('local')(req,res,()=>{
            res.redirect('/profile')
        })
    })
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