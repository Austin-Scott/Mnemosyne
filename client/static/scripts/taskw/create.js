
function create() {
    let button = document.getElementById('createTaskButton')
    let initialValue = button.value
    button.value = 'Loading...'
    button.setAttribute('disabled', 'true')

    $.ajax({
        type: 'POST',
        url: '/taskwAPI/create',
        data: {
            desc: document.getElementById('desc').value
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