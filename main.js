const express = require('express')
const https = require('https')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const client = path.join(__dirname, 'client')
const FuzzySearch = require('fuzzy-search')

const usr = fs.readFileSync('server.usr', 'ASCII')
const psw = fs.readFileSync('server.pass', 'ASCII')

const home = '/home/pi/'

function escapeBashCharacters(str) {
    return '"'+str.replace(/(["$`\\])/g,'\\$1')+'"';
}

function spawnjrnl(args) {
    if(process.platform=='linux') {
        return spawn('jrnl', args, {shell: true, env: {HOME: home}})
    } else {
        return spawn('jrnl', args, {shell: true})
    }
}

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
    console.log('Create entry request received')

    let entry = req.body.entry || ''
    if(entry) {
        let args = [escapeBashCharacters(req.body.entry)]
        let proc = spawnjrnl(args)
        let stdout=''
        let stderr=''
        proc.stdout.on('data', (data) => {
            stdout+=data
        })
        proc.stderr.on('data', (data) => {
            stderr+=data
        })
        proc.on('close', (code) => {
            console.log(`Entry created- stdout: "${stdout}" stderr: "${stderr}"`)

            let result = { success: true, stdo: stdout, stde: stderr }
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
    console.log('Search request received')

    console.log(req.body)

    let terms = req.body.terms || ''
    let limitByNum = req.body.limitByNum || 'true'
    let num = req.body.num || 1
    let starred = req.body.starred || 'false'
    let tags = req.body.tags || ''
    let useAnd = req.body.useAnd || 'false'
    let filterEarlier = req.body.filterEarlier || ''
    let filterLater = req.body.filterLater || ''

    let useSearch = (terms!=='')

    let args = []
    if(!useSearch && limitByNum=='true') {
         args.push('-n', num)
    }
    if(starred=='true') {
        args.push('-starred')
    }
    if(filterEarlier!=='') {
        args.push('-from', escapeBashCharacters(filterEarlier))
    }
    if(filterLater!=='') {
        args.push('-until', escapeBashCharacters(filterLater))
    }
    if(useAnd=='true') {
        args.push('-and')
    }

    tags=tags.split(' ');
    tags.forEach((tag)=>{
        if(tag!=='')
            args.push(escapeBashCharacters(tag))
    })

    args.push('--export')
    args.push('json')

    console.log(args)

    let proc = spawnjrnl(args)
    let stdout=''
    let stderr=''
    proc.stdout.on('data', (data) => {
        stdout+=data
    })
    proc.stderr.on('data', (data) => {
        stderr+=data
    })
    proc.on('close', (code) => {
        res.type('json')
        if(!useSearch) {
            res.send(stdout)
        } else {
            let entries = JSON.parse(stdout)
            const searcher = new FuzzySearch(entries.entries, ['title', 'body'], {sort: true})
            const results = searcher.search(terms)
            const end = num > results.length ? results.length : num
            entries.entries = limitByNum=='true' ? results.slice(0, end) : results.length
            res.send(JSON.stringify(entries))
        }

        console.log('Search results sent')
    })
})

https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
}, app)
.listen(443, function () {
    console.log('App listening on port 443! Go to https://localhost:443/')
})
