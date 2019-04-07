const express = require('express')
const https = require('https')
const bodyParser = require('body-parser')
const app = express()
const fs = require('fs')
const path = require('path')

const jrnl = require('./server/jrnl.js')

const usr = fs.readFileSync('server.usr', 'ASCII')
const psw = fs.readFileSync('server.pass', 'ASCII')

let home = ''
if(process.platform=='linux') {
    home = fs.readFileSync('server.hm', 'ASCII')
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use((req, res, next) => {

    // -----------------------------------------------------------------------
    // authentication middleware

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

    // -----------------------------------------------------------------------
    // Access granted...
    next()

})

app.use('/jrnl', jrnl)

app.use(express.static(path.join(__dirname, 'client')))

https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
}, app)
.listen(443, () => {
    console.log('App listening on port 443! Go to https://localhost:443/')
})
