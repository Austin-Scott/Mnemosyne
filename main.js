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
const wordcount = require('wordcount')

const usr = fs.readFileSync('server.usr', 'ASCII')
const psw = fs.readFileSync('server.pass', 'ASCII')

let home = ''
if(process.platform=='linux') {
    home = fs.readFileSync('server.hm', 'ASCII')
}

function escapeBashCharacters(str) {
    return '"'+str.replace(/(["$`\\])/g,'\\$1')+'"';
}

function terminal(proc, callback) {
    let stdout=''
    let stderr=''
    proc.stdout.on('data', (data) => {
        stdout+=data
    })
    proc.stderr.on('data', (data) => {
        stderr+=data
    })
    proc.on('close', (code) => {
        callback(stdout, stderr, code)
    })
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
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

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

app.post('/create', (req, res) => {
    console.log('Create entry request received')

    let entry = req.body.entry || ''
    if(entry) {
        let args = [escapeBashCharacters(req.body.entry)]

        terminal(spawnjrnl(args), (stdout, stderr, code) => {
            console.log(`Entry created- stdout: "${stdout}" stderr: "${stderr}"`)

            let result = { success: true, stdo: stdout, stde: stderr }
            res.json(result)
        })
    } else {
        let result = { success: false }
        res.json(result)
    }
})

app.get('/statistics', (req, res) => {
    console.log('Statistics request received')

    let result = {
        totalCharacterCount: 0,
        totalWordCount: 0,
        totalEntryCount: 0,
        byYear: {}
    }

    terminal(spawnjrnl(['--export', 'json']), (stdout, stderr, code) => {
        const journal = JSON.parse(stdout)
        journal.entries.forEach((entry)=>{
            let dateTokens = entry.date.split('-')
            let year = dateTokens[0]
            let month = dateTokens[1]
            let day = dateTokens[2]

            let contents = entry.title+entry.body
            let wordCount = wordcount(contents)
            
            result.totalCharacterCount+=contents.length
            result.totalWordCount+=wordCount
            result.totalEntryCount++

            if(result.byYear[year]==undefined) {
                result.byYear[year]={
                    totalCharacterCount: 0,
                    totalWordCount: 0,
                    totalEntryCount: 0,
                    byMonth: {}
                }
            }

            result.byYear[year].totalCharacterCount+=contents.length
            result.byYear[year].totalWordCount+=wordCount
            result.byYear[year].totalEntryCount++

            if(result.byYear[year].byMonth[month]==undefined) {
                result.byYear[year].byMonth[month]={
                    totalCharacterCount: 0,
                    totalWordCount: 0,
                    totalEntryCount: 0,
                    byDay: {}
                }
            }

            result.byYear[year].byMonth[month].totalCharacterCount+=contents.length
            result.byYear[year].byMonth[month].totalWordCount+=wordCount
            result.byYear[year].byMonth[month].totalEntryCount++

            if(result.byYear[year].byMonth[month].byDay[day]==undefined) {
                result.byYear[year].byMonth[month].byDay[day]={
                    totalCharacterCount: 0,
                    totalWordCount: 0,
                    totalEntryCount: 0
                }
            }

            result.byYear[year].byMonth[month].byDay[day].totalCharacterCount+=contents.length
            result.byYear[year].byMonth[month].byDay[day].totalWordCount+=wordCount
            result.byYear[year].byMonth[month].byDay[day].totalEntryCount++
        })

        res.json(result)
        console.log('Statistics sent')
    })

})

app.post('/search', (req, res) => {
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

    args.push('--export', 'json')

    console.log(args)

    terminal(spawnjrnl(args), (stdout, stderr, code) => {
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
.listen(443, () => {
    console.log('App listening on port 443! Go to https://localhost:443/')
})
