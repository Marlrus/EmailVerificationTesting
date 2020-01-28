const   express     = require('express'),
        router      = express.Router({mergeParams:true}),
        passport    = require('passport'),
        User        = require('../models/user')

//ROUTES
router.get('/',(req,res)=>{
    res.render('landing')
})

router.get('/sign-up', (req,res)=>{
    res.render('sign-up')
})

//SIGN UP ROUTE REDO 3
router.post('/sign-up',async(req,res)=>{
    const newUser = await new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email
    })
    User.register(newUser, req.body.password, (err,user)=>{
        console.log(`Created new User: ${user}`)
        if (err){
            return res.send(`Error: ${err}`)
        }
        passport.authenticate('local')(req,res,()=>{
            res.redirect('/')
        })
    })
})

//LOGIN
router.get('/login', (req,res)=>{
    res.send('FUTURE LOGIN')
})

module.exports = router