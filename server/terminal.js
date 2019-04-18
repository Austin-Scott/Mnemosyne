const fs = require('fs')

function escapeBashCharacters(str) {
    return '"' + str.replace(/(["$`\\])/g, '\\$1') + '"';
}
/**
 * 
 * @param {ChildProcessWithoutNullStreams} proc 
 * @param {function} callback 
 * @param {String} stdin 
 */
function terminal(proc, callback, stdin) {
    let stdout = ''
    let stderr = ''
    if(stdin!==undefined) {
        proc.stdin.setEncoding('utf-8')
        proc.stdin.write(stdin)
        proc.stdin.end()
    }
    proc.stdout.on('data', (data) => {
        stdout += data
    })
    proc.stderr.on('data', (data) => {
        stderr += data
    })
    proc.on('close', (code) => {
        callback(stdout, stderr, code)
    })
}

let home = ''
if (process.platform == 'linux') {
    home = fs.readFileSync('server.hm', 'ASCII')
}

module.exports.terminal = terminal
module.exports.escapeBashCharacters = escapeBashCharacters
module.exports.home = home