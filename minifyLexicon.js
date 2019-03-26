const fs = require('fs')

console.log('Reading lexiconFull.txt...')
const lexiconFull = fs.readFileSync('lexiconFull.txt', 'ASCII').split('\n')
console.log('Parsing lexiconFull.txt...')

let lexicon = {}

lexiconFull.forEach((line) => {
    let tokens = line.split('\t')
    if (tokens.length == 3) {
        let word = tokens[0]
        if (!(word in lexicon)) {
            lexicon[word] = {
                anger: false,
                fear: false,
                anticipation: false,
                trust: false,
                surprise: false,
                sadness: false,
                joy: false,
                disgust: false,
                positive: false,
                negative: false
            }
        }
        let affect = tokens[1]
        if (tokens[2].includes('1')) {
            lexicon[word][affect] = true
        }
    }
})

console.log('Generating minified version of lexicon...')

let lexiconMin = ''

function p(v,s) { return v==true ? s : '' }

Object.keys(lexicon).forEach((word) => {
    lexiconMin += word+p(lexicon[word].anger, ' ang')+p(lexicon[word].anticipation, ' ant')+p(lexicon[word].disgust, ' d')+p(lexicon[word].fear, ' f')+p(lexicon[word].joy, ' j')+p(lexicon[word].negative, ' n')+p(lexicon[word].positive, ' p')+p(lexicon[word].sadness, ' sa')+p(lexicon[word].surprise, ' su')+p(lexicon[word].trust, ' t')+'\n'
})

console.log('Saving minified version to lexicon.txt...')

fs.writeFileSync('lexicon.txt', lexiconMin)

console.log('...done')

