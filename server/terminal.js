

function escapeBashCharacters(str) {
    return '"' + str.replace(/(["$`\\])/g, '\\$1') + '"';
}

function terminal(proc, callback) {
    let stdout = ''
    let stderr = ''
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

module.exports.terminal = terminal
module.exports.escapeBashCharacters = escapeBashCharacters