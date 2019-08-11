import express from 'express'
import https from 'https'
import bodyParser from 'body-parser'
import fs from 'fs'
import path from 'path'

import jrnl from './routers/jrnl'

const app = express()

const usr = fs.readFileSync('server.usr', 'ASCII')
const psw = fs.readFileSync('server.pass', 'ASCII')

//Configure pug to render our HTML pages
app.set('views', path.join(__dirname, '../client/views'))
app.set('view engine', 'pug')

//Parse JSON from body of incoming requests into objects
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//Check username and password of client
// Modified from code found here: https://stackoverflow.com/a/33905671
app.use((req, res, next) => {
    const auth = {login: usr, password: psw}

    // parse login and password from headers
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

    // Verify login and password are set and correct
    if (!login || !password || login !== auth.login || password !== auth.password) {
        res.set('WWW-Authenticate', 'Basic realm="401"') 
        res.status(401).send('Authentication required. YOU SHALL NOT PASS!') 
        return
    }

    next()
})

//Respond to AJAX API requests
app.use('/jrnlAPI', jrnl)

//Render views
app.get('/', (req, res)=>{
    let hours = new Date().getHours()
    let greeting = ''
    let prompt = ''
    if(hours < 5) {
        greeting = 'Early Morning'
        prompt = 'What\'s on your mind?'
    } else if(hours < 12) {
        greeting = 'Good Morning'
        prompt = 'What do you plan to accomplish today?'
    } else if(hours < 17) {
        greeting = 'Good Afternoon'
        prompt = 'What have you been doing?'
    } else {
        greeting = 'Good Evening'
        prompt = 'What did you do today?'
    }
    res.render('jrnl', {title: 'Mnemosyne', greeting: greeting, prompt: prompt})
})

//Serve static files
app.use(express.static(path.join(__dirname, '../client/static')))

//Create the server and start listening for requests
https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
}, app)
.listen(443, () => {
    console.log('App listening on port 443! Go to https://localhost:443/')
})
