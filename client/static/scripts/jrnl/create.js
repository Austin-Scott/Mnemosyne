
//Prompt the user if they try to leave the page without submitting an entry
window.onbeforeunload = function () {
    if (document.getElementById('compose').value.length > 0) {
        return 'You have an unsubmitted entry that you will lose if you leave. Are you sure you want to proceed?'
    } else {
        return
    }
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

    let button = document.getElementById('submitEntryButton')
    let initialValue = button.value
    button.value = 'Submitting...'
    button.setAttribute('disabled', 'true')

    let entryContent = document.getElementById('compose').value

    if (tagLocation) {
        entryContent += ` @_location ${lat} ${lon}`
    }

    $.ajax({
        type: 'POST',
        url: '/jrnlAPI/create',
        data: {
            entry: entryContent
        },
        success: (data, status) => {
            button.value = initialValue
            button.removeAttribute('disabled')
            if (status == 'success') {
                if (data.success == true) {
                    document.getElementById('compose').value = ''
                    showModal('Entry added', `<strong>Your entry has been added successfully.</strong><br /><small>stdout: "${data.stdo}" stderr: "${data.stde}"</small>`)
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