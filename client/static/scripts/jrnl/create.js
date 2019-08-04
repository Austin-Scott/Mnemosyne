
//Prompt the user if they try to leave the page without submitting an entry
window.onbeforeunload = function () {
    if (document.getElementById('compose').value.length > 0) {
        return 'You have an unsubmitted entry that you will lose if you leave. Are you sure you want to proceed?'
    } else {
        return
    }
}

function getCurrentTimeString() {
    now = new Date();
    year = "" + now.getFullYear();
    month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
    day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
    hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
    minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
    second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
}

var tagLocation = false
var lat = null
var lon = null

function tagCurrentLocation(cb) {
    let textOutputArea = document.getElementById('gpsText')
    if (cb.checked) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) =>{
                lat = pos.coords.latitude
                lon = pos.coords.longitude
                tagLocation = true
                textOutputArea.innerHTML = `<span class="text-success">Latitude: ${lat} Longitude: ${lon}</span>`
            }, (err) =>{
                tagLocation = false
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        textOutputArea.innerHTML = '<span class="text-warning">Geolocation permission denied</span>'
                        break
                    case err.POSITION_UNAVAILABLE:
                        textOutputArea.innerHTML = '<span class="text-warning">Location unavailable</span>'
                        break
                    case err.TIMEOUT:
                        textOutputArea.innerHTML = '<span class="text-warning">Geolocation request timed out</span>'
                        break
                    case err.UNKNOWN_ERROR:
                        textOutputArea.innerHTML = '<span class="text-warning">An unknown error occurred</span>'
                        break
                }
            })
        } else {
            textOutputArea.innerHTML='<span class="text-warning">Geolocation is not supported by your browser</span>'
        }
    } else {
        tagLocation=false
        textOutputArea.innerHTML=''
    }
}

//Function that submits an entry to the server via AJAX request
function create() {
    if (document.getElementById('compose').value == '') {
        showModal('Error', 'Please compose your entry above before submitting.')
        return
    }
    
    let entryContent = document.getElementById('compose').value

    if (tagLocation) {
        entryContent += ` @_location ${lat} ${lon}`
    }

    entryContent += ` @_time ${getCurrentTimeString()}`

    postFromButton('submitEntryButton', 'Submitting...', '/jrnlAPI/create',
        {
            entry: entryContent
        },
        (data)=>{
            if (data.success == true) {
                document.getElementById('compose').value = ''
                let tagGPS = document.getElementById('tagGPS')
                tagGPS.checked = false
                tagCurrentLocation(tagGPS)
                showModal('Entry added', `<strong>Your entry has been added successfully.</strong><br /><small>stdout: "${data.stdo}" stderr: "${data.stde}"</small>`)
            }
        })
}