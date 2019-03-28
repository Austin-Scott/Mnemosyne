const express = require('express')
const https = require('https')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const FuzzySearch = require('fuzzy-search')
const wordcount = require('wordcount')

const usr = fs.readFileSync('server.usr', 'ASCII')
const psw = fs.readFileSync('server.pass', 'ASCII')

const lexicon = loadLexicon()

let home = ''
if(process.platform=='linux') {
    home = fs.readFileSync('server.hm', 'ASCII')
}

function escapeBashCharacters(str) {
    return '"'+str.replace(/(["$`\\])/g,'\\$1')+'"';
}

function loadLexicon() {
    lexiconStr = fs.readFileSync('lexicon.txt', 'ASCII')
    result = {}
    lexiconStr.split('\n').forEach((line)=>{
        let word = ''
        line.split(' ').forEach((token, i)=>{
            if(i==0) {
                word=token
                result[word]={
                    anger: false,
                    anticipation: false,
                    disgust: false,
                    fear: false,
                    joy: false,
                    negative: false,
                    positive: false,
                    sadness: false,
                    surprise: false,
                    trust: false
                }
            } else {
                switch(token) {
                    case 'ang':
                        result[word].anger=true
                        break
                    case 'ant':
                        result[word].anticipation=true
                        break
                    case 'd':
                        result[word].disgust=true
                        break
                    case 'f':
                        result[word].fear=true
                        break
                    case 'j':
                        result[word].joy=true
                        break
                    case 'n':
                        result[word].negative=true
                        break
                    case 'p':
                        result[word].positive=true
                        break
                    case 'sa':
                        result[word].sadness=true
                        break
                    case 'su':
                        result[word].surprise=true
                        break
                    case 't':
                        result[word].trust=true
                        break
                }
            }
        })
    })
    return result
}

function analyzeSentiment(word, result) {
    if(!(data in result)) {
        result.data={
            matches: 0,
            anger: 0,
            anticipation: 0,
            disgust: 0,
            fear: 0,
            joy: 0,
            negative: 0,
            positive: 0,
            sadness: 0,
            surprise: 0,
            trust: 0
        }
    }
    if(lexicon.hasOwnProperty(word)) {
        let wordData = lexicon[word]
        result.data.matches++
        if(wordData.anger)
            result.data.anger++
        if(wordData.anticipation)
            result.data.anticipation++
        if(wordData.disgust)
            result.data.disgust++
        if(wordData.fear)
            result.data.fear++
        if(wordData.joy)
            result.data.joy++
        if(wordData.negative)
            result.data.negative++
        if(wordData.positive)
            result.data.positive++
        if(wordData.sadness)
            result.data.sadness++
        if(wordData.surprise)
            result.data.surprise++
        if(wordData.trust)
            result.data.trust++
    }
    return result
}

function addSentimentResults(res1, res2) {
    let result = {
        data: {
            matches: 0,
            anger: 0,
            anticipation: 0,
            disgust: 0,
            fear: 0,
            joy: 0,
            negative: 0,
            positive: 0,
            sadness: 0,
            surprise: 0,
            trust: 0
        }
    }
    result.data.matches=res1.data.matches+res2.data.matches
    result.data.anger=res1.data.anger+res2.data.anger
    result.data.anticipation=res1.data.anticipation+res2.data.anticipation
    result.data.disgust=res1.data.disgust+res2.data.disgust
    result.data.fear=res1.data.fear+res2.data.fear
    result.data.joy=res1.data.joy+res2.data.joy
    result.data.negative=res1.data.negative+res2.data.negative
    result.data.positive=res1.data.positive+res2.data.positive
    result.data.sadness=res1.data.sadness+res2.data.sadness
    result.data.surprise=res1.data.surprise+res2.data.surprise
    result.data.trust=res1.data.trust+res2.data.trust

    return result
}

function computeSentimentSummary(result) {
    result.summary={
        polarity: 0,
        anger: 0,
        anticipation: 0,
        disgust: 0,
        fear: 0,
        joy: 0,
        sadness: 0,
        surprise: 0,
        trust: 0
    }
    if(result.data.matches>0) {
        result.summary.polarity=(result.data.positive+result.data.negative)/result.data.matches
        result.summary.anger=result.data.anger/result.data.matches
        result.summary.anticipation=result.data.anticipation/result.data.matches
        result.summary.disgust=result.data.disgust/result.data.matches
        result.summary.fear=result.data.fear/result.data.matches
        result.summary.joy=result.data.joy/result.data.matches
        result.summary.sadness=result.data.sadness/result.data.matches
        result.summary.surprise=result.data.surprise/result.data.matches
        result.summary.trust=result.data.trust/result.data.matches
    }
    return result
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
        res.status(401).send('Authentication required. YOU SHALL NOT PASS!') 
        return
    }

    // -----------------------------------------------------------------------
    // Access granted...
    next()

})

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
            if(month[0]=='0')
                month = month[1]
            let day = dateTokens[2]
            if(day[0]=='0')
                day = day[1]

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

app.use(express.static(path.join(__dirname, 'client')))

https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
}, app)
.listen(443, () => {
    console.log('App listening on port 443! Go to https://localhost:443/')
})
