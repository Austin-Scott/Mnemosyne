const express = require('express')
const https = require('https')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const client = path.join(__dirname, 'client')

const usr = fs.readFileSync('server.usr', 'ASCII')
const psw = fs.readFileSync('server.pass', 'ASCII')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use((req, res, next) => {

    // -----------------------------------------------------------------------
    // authentication middleware

    const auth = {login: usr, password: psw}

    // parse login and password from headers
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = new Buffer(b64auth, 'base64').toString().split(':')

    // Verify login and password are set and correct
    if (!login || !password || login !== auth.login || password !== auth.password) {
        res.set('WWW-Authenticate', 'Basic realm="401"') 
        res.status(401).send('Authentication required.') 
        return
    }

    // -----------------------------------------------------------------------
    // Access granted...
    next()

})

app.get('/', (req, res) => res.sendFile(path.join(client, 'index.html')))

app.post('/create', function(req, res) {
    let entry = req.body.entry || ''
    if(entry) {
        let command = `jrnl ${req.body.entry}`
        exec(command, (err, stdout, stderr) => {
            let result = { success: true }
            res.type('json')
            res.send(JSON.stringify(result))
        })
    } else {
        let result = { success: false }
        res.type('json')
        res.send(JSON.stringify(result))
    }
})

app.post('/search', function(req, res) {
    let num = req.body.num || 1
    let starred = req.body.starred || false
    let tags = req.body.tags || ''
    let useAnd = req.body.useAnd || false
    let filterEarlier = req.body.filterEarlier || ''
    let filterLater = req.body.filterLater || ''

    let command = `jrnl -n ${num} `
    if(starred) {
        command+='-starred '
    }
    if(filterEarlier!=='') {
        command+=`-from "${filterEarlier}" `
    }
    if(filterLater!=='') {
        command+=`-until "${filterLater}" `
    }
    if(useAnd) {
        command+='-and '
    }
    command+=tags+' --export json'

    exec(command, (err, stdout, stderr) => {
        res.type('json')
        res.send(stdout)
    })
})

https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
}, app)
.listen(443, function () {
    console.log('App listening on port 443! Go to https://localhost:443/')
})
