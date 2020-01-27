const   express         = require('express'),
        app             = express(),
        bodyParser      = require('body-parser'),
        mongoose        = require('mongoose'),
        dotenv          = require('dotenv'),
        passport        = require('passport'),
        passportLocal   = require('passport-local'),
        cookieSession   = require('cookie-session'),
        localSetup      = require('./config/local-p-setup')

//DOTENV
dotenv.config()

//BODY PARSER CONFIG
app.use(bodyParser.urlencoded({extended:true}))

//REQUIRED ROUTES
const loginRoutes   = require('./routes')

//COOKIE SESSION CONFIG
app.use(cookieSession({
    maxAge: 24*60*60*1000,
    keys: [process.env.COOKIE_KEY]
}))

//PASSPORT INITIALIZE
app.use(passport.initialize())
app.use(passport.session())

//ROUTE SETUP
app.use('/', loginRoutes)

//VIEW ENGINE
app.set('view engine', 'ejs')

//LOCALS
app.use(async (req,res,next)=>{
    // res.locals.currentUser = req.user
    // res.locals.error = req.flash('error')
    // res.locals.success = req.flash('success')
    next()
})

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