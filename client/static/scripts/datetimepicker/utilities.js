/**
 * 
 * @param {Number} num Number to have zeros added to the left side.
 * @param {Number} zeros Minimal length of the returned string. Extra spaces will be padded with zeros on the left side.
 * @returns {String} String of num with extra zeros padded to the left side.
 */
function padZero(num, zeros) {
    let str = String(num)
    while(str.length<zeros) {
        str = '0'+str
    }
    return str
}

/**
 * 
 * @param {String} unformatted 
 */
function reformatDatePicker(unformatted) {
    let dateParser = /(\d{2})\/(\d{2})\/(\d{4}) (\d{1,2}):(\d{2}) (.{2})/
    let result = dateParser.exec(unformatted)
    if(result.length==7) {
        let month = result[1]
        let day = result[2]
        let year = result[3]
        let hour = Number(result[4])
        let minute = result[5]
        let timeOfDay = result[6]
        if(timeOfDay=='PM' && hour!==12) {
            hour+=12
        }
        hour = padZero(hour, 2)
        return year+month+day+'T'+hour+minute+'00'
    }
    return null
}
