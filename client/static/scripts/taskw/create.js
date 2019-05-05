
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

function create() {
    let desc = document.getElementById('desc').value
    if(desc.length==0) {
        showModal('Error', 'New task description must be set.')
        return
    }

    let button = document.getElementById('createTaskButton')
    let initialValue = button.value
    button.value = 'Loading...'
    button.setAttribute('disabled', 'true')

    let dueDate = null
    let recurr = null
    let tags = document.getElementById('tags').value.split(', ')
    let waitDate = null
    let untilDate = null

    if(document.getElementById('addDueDate').checked) {
        dueDate = reformatDatePicker(document.getElementById('dueDate').value)
    }
    if(document.getElementById('addWaitDate').checked) {
        waitDate = reformatDatePicker(document.getElementById('waitDate').value)
    }
    if(document.getElementById('addUntilDate').checked) {
        untilDate = reformatDatePicker(document.getElementById('untilDate').value)
    }

    if(document.getElementById('shouldRecur').checked) {
        recurr = document.getElementById('recurrType').value
    }

    $.ajax({
        type: 'POST',
        url: '/taskwAPI/create',
        data: {
            desc: desc,
            dueDate: dueDate,
            recurr: recurr,
            tags: tags,
            waitDate: waitDate,
            untilDate: untilDate
        },
        success: (data, status) => {
            button.value = initialValue
            button.removeAttribute('disabled')
            if (status == 'success') {
                if (data.success == true) {
                    window.location.href='/taskw'
                    return
                }
            }
            showModal('Error', `Something went wrong. Please try again in a little bit.<br />More info:<br />data: ${JSON.stringify(data)} status: ${status}`)
        },
        error: (jqXHR, status) => {
            button.value = initialValue
            button.removeAttribute('disabled')

            if (status == 'timeout') {
                showModal('Error', 'The server took too long to respond. Please try again in a little bit.')
                return
            }
            showModal('Error', `Your request was unable to be completed: ${status}`)
        },
        dataType: 'json',
        timeout: 10000
    })
}