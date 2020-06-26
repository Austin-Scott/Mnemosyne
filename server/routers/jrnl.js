import express from 'express'
import FuzzySearch from 'fuzzy-search'
import wordcount from 'wordcount'
import chalk from 'chalk'
import { spawn } from 'child_process'

import t from '../terminal.js'

const jrnl = new express.Router()

/**
* 
* @param {Array} args Array of Strings to be passed as arguments to jrnl
* @returns {ChildProcessWithoutNullStreams} Reference to the launched instance of jrnl 
*/
function spawnjrnl(args) {
    console.log(chalk.blueBright('jrnl '+args.join(' ')))
    if (process.platform == 'linux') {
        return spawn('jrnl', args, { shell: true, env: { HOME: t.home } })
    } else {
        return spawn('jrnl', args, { shell: true })
    }
}

/**
* Handle create new entry request.
*/
jrnl.post('/create', (req, res) => {
    console.log('Create jrnl entry request received')
    
    let entry = req.body.entry || ''
    if (entry) {
        let args = [t.escapeBashCharacters(req.body.entry)]
        
        t.terminal(spawnjrnl(args), (stdout, stderr, code) => {
            
            let result = { success: true, stdo: stdout, stde: stderr }
            res.json(result)
        })
    } else {
        let result = { success: false }
        res.json(result)
    }
})

/**
* Handle statistics request
*/
jrnl.get('/statistics', (req, res) => {
    console.log('jrnl statistics request received')
    
    let result = {
        totalCharacterCount: 0,
        totalWordCount: 0,
        totalEntryCount: 0,
        byYear: {}
    }
    
    t.terminal(spawnjrnl(['--export', 'json']), (stdout, stderr, code) => {
        try {
            const journal = JSON.parse(stdout)
            journal.entries.forEach((entry) => {
                let dateTokens = entry.date.split('-')
                let year = dateTokens[0]
                let month = dateTokens[1]
                if (month[0] == '0')
                month = month[1]
                let day = dateTokens[2]
                if (day[0] == '0')
                day = day[1]
                
                let contents = entry.title + entry.body
                let wordCount = wordcount(contents)
                
                result.totalCharacterCount += contents.length
                result.totalWordCount += wordCount
                result.totalEntryCount++
                
                if (result.byYear[year] == undefined) {
                    result.byYear[year] = {
                        totalCharacterCount: 0,
                        totalWordCount: 0,
                        totalEntryCount: 0,
                        byMonth: {}
                    }
                }
                
                result.byYear[year].totalCharacterCount += contents.length
                result.byYear[year].totalWordCount += wordCount
                result.byYear[year].totalEntryCount++
                
                if (result.byYear[year].byMonth[month] == undefined) {
                    result.byYear[year].byMonth[month] = {
                        totalCharacterCount: 0,
                        totalWordCount: 0,
                        totalEntryCount: 0,
                        byDay: {}
                    }
                }
                
                result.byYear[year].byMonth[month].totalCharacterCount += contents.length
                result.byYear[year].byMonth[month].totalWordCount += wordCount
                result.byYear[year].byMonth[month].totalEntryCount++
                
                if (result.byYear[year].byMonth[month].byDay[day] == undefined) {
                    result.byYear[year].byMonth[month].byDay[day] = {
                        totalCharacterCount: 0,
                        totalWordCount: 0,
                        totalEntryCount: 0
                    }
                }
                
                result.byYear[year].byMonth[month].byDay[day].totalCharacterCount += contents.length
                result.byYear[year].byMonth[month].byDay[day].totalWordCount += wordCount
                result.byYear[year].byMonth[month].byDay[day].totalEntryCount++
            })
            
            res.json(result)
            console.log('Statistics sent')
        } catch(err) {
            console.log(chalk.red('Error: '+err))
            res.json({
                success: false,
                stdout: '',
                stderr: err.toString()
            })
        }
        
    })
    
})

function searchJrnl(query) {
    return new Promise((resolve, reject)=>{
        let terms = query.terms || ''
        let limitByNum = query.limitByNum || 'true'
        let num = query.num || 1
        let starred = query.starred || 'false'
        let tags = query.tags || ''
        let useAnd = query.useAnd || 'false'
        let filterEarlier = query.filterEarlier || ''
        let filterLater = query.filterLater || ''
        
        let useSearch = (terms !== '')
        
        let args = []
        if (!useSearch && limitByNum == 'true') {
            args.push('-n', num)
        }
        if (starred == 'true') {
            args.push('-starred')
        }
        if (filterEarlier !== '') {
            args.push('-from', t.escapeBashCharacters(filterEarlier))
        }
        if (filterLater !== '') {
            args.push('-until', t.escapeBashCharacters(filterLater))
        }
        if (useAnd == 'true') {
            args.push('-and')
        }
        
        tags = tags.split(' ');
        tags.forEach((tag) => {
            if (tag !== '')
            args.push(t.escapeBashCharacters(tag))
        })
        
        args.push('--export', 'json')
        
        t.terminal(spawnjrnl(args), (stdout, stderr, code) => {
            try {
                let entries = JSON.parse(stdout)
                if (useSearch) {
                    const searcher = new FuzzySearch(entries.entries, ['title', 'body'], { sort: true })
                    const results = searcher.search(terms)
                    const end = num > results.length ? results.length : num
                    entries.entries = limitByNum == 'true' ? results.slice(0, end) : results.length
                }
                resolve(entries)
            } catch(err) {
                console.log(chalk.red('Error: '+err))
                reject(err)
            }
            
        })
    })
}

/**
* Handle search jrnl request
*/
jrnl.post('/search', (req, res) => {
    console.log('jrnl search request received')
    searchJrnl(req.body).then(entries => {
        res.json(entries)
    }, err => {
        res.json({
            success: false,
            stdout: '',
            stderr: err.toString()
        })
    })
})

export default jrnl