const   express     = require('express'),
        router      = express.Router({mergeParams:true})

//ROUTES
router.get('/',(req,res)=>{
    res.render('landing')
})


module.exports = router