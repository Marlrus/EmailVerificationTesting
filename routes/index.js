const   express     = require('express'),
        router      = express.Router({mergeParams:true})

//ROUTES
router.get('/',(req,res)=>{
    res.render('landing')
})

router.get('/sign-up', (req,res)=>{
    res.render('sign-up')
})

router.post('/sign-up',(req,res)=>{
    console.log(req.body.user)
    res.redirect('/')
})

module.exports = router