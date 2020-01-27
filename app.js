const   express         = require('express'),
        app             = express(),
        mongoose        = require('mongoose'),
        dotenv          = require('dotenv')

//DOTENV
dotenv.config()

//REQUIRED ROUTES
const loginRoutes   = require('./routes')

//ROUTE SETUP
app.use('/', loginRoutes)

//VIEW ENGINE
app.set('view engine', 'ejs')

//LOCALS

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