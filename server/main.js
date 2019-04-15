import express from 'express'
import https from 'https'
import bodyParser from 'body-parser'
import fs from 'fs'
import path from 'path'

import jrnl from './routers/jrnl.js'
import taskw from './routers/taskw.js'
import { getTaskList } from './routers/taskw.js'

const app = express()

const usr = fs.readFileSync('server.usr', 'ASCII')
const psw = fs.readFileSync('server.pass', 'ASCII')

//Configure pug to render our HTML pages
app.set('views', path.join(__dirname, '../client/views'))
app.set('view engine', 'pug')

//Parse JSON from body of incoming requests into objects
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//Log all incoming requests to the console
app.use((req, res, next) => {
    console.log(`${req.method} request received for: ${req.originalUrl}`)
    next()
})

//Check username and password of client
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
app.use('/taskwAPI', taskw)

//Render views
app.get('/', (req, res)=>{
    res.render('index', {title: 'Mnemosyne'})
})
app.get('/jrnl', (req, res)=>{
    res.render('jrnl', {title: 'jrnl'})
})
app.get('/taskw', (req, res)=>{
    getTaskList().then((taskList)=>{
        res.render('taskw', {title: 'Taskwarrior', tasks: taskList})
    })
})
app.get('/timew', (req, res)=>{
    res.render('timew', {title: 'Timewarrior'})
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
