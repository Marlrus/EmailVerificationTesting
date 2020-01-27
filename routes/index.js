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

// router.post('/sign-up',(req,res)=>{
//     // console.log(req.body.user)
//     let newUser = new User({
//         username: req.body.user.first_name,
//         first_name: req.body.user.first_name,
//         last_name: req.body.user.last_name,
//         email: req.body.user.email
//     })
//     User.register(newUser,req.body.user.password,(err,user)=>{
//         if(err){
//             console.log('Getting to Error ' +err)
//             res.send('ERROR')
//         }
//         passport.authenticate('local')(req,res,()=>{
//             console.log('getting here')
//             // console.log(req.user)
//             res.redirect('/')
//         })
//     })
// })

router.get('/login', (req,res)=>{
    res.send('FUTURE LOGIN')
})

module.exports = router