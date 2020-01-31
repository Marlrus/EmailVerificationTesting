const   express         = require('express'),
        app             = express(),
        bodyParser      = require('body-parser'),
        mongoose        = require('mongoose'),
        flash           = require('connect-flash'),
        passport        = require('passport'),
        cookieSession   = require('cookie-session'),
        methodOverride  = require('method-override')

//UNUSED REQUIRE CONSTS
require('passport-local')
require('./config/local-p-setup')
require('dotenv').config()

//DOTENV

//BODY PARSER CONFIG
app.use(bodyParser.urlencoded({extended:true}))

//CONNECT FLASH
app.use(flash())

//REQUIRED ROUTES
const loginRoutes   = require('./routes')

//COOKIE SESSION CONFIG
app.use(cookieSession({
    // maxAge: 24*60*60*1000,
    keys: [process.env.COOKIE_KEY]
}))

//PASSPORT INITIALIZE
app.use(passport.initialize())
app.use(passport.session())

//LOCALS
app.use(async (req,res,next)=>{
    res.locals.user = req.user
    res.locals.error = req.flash('error')
    res.locals.success = req.flash('success')
    next()
})

//METHOD OVERRIDE
app.use(methodOverride('_method'))

//ROUTE SETUP
app.use('/', loginRoutes)

//VIEW ENGINE
app.set('view engine', 'ejs')

//DB CONNECTION
mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(()=>{
    console.log(`Mongoose Connected to: ${mongoose.connection.name}`)
}).catch(err=>{
    console.log(`Error: ${err.message}`)
})

//SERVER
const port = process.env.PORT || 3000

app.listen(port, ()=> console.log(`Email Verification Test server started in: ${port}`))