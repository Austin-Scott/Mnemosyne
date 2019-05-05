
function complete() {

    let button = document.getElementById('completeTaskButton')
    let initialValue = button.value
    button.value = 'Loading...'
    button.setAttribute('disabled', 'true')

    $.ajax({
        type: 'POST',
        url: '/taskwAPI/modify',
        data: {
            type: 'complete',
            uuid: uuid
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

function updateTask() {
    let button = document.getElementById('updateTaskButton')
    let initialValue = button.value
    button.value = 'Loading...'
    button.setAttribute('disabled', 'true')

    $.ajax({
        type: 'POST',
        url: '/taskwAPI/modify',
        data: {
            type: 'update',
            uuid: uuid,
            description: document.getElementById('desc').value
        },
        success: (data, status) => {
            button.value = initialValue
            button.removeAttribute('disabled')
            if (status == 'success') {
                if (data.success == true) {
                    location.reload()
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

function showEditTaskModal() {
    let form = document.getElementById('editTaskForm').innerHTML
    showModal('Edit Task', form)
}

function deleteTask() {
    let button = document.getElementById('deleteTaskButton')
    let initialValue = button.value
    button.value = 'Loading...'
    button.setAttribute('disabled', 'true')

    $.ajax({
        type: 'POST',
        url: '/taskwAPI/modify',
        data: {
            type: 'delete',
            uuid: uuid
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

function makePending() {
    let button = document.getElementById('unDeleteTaskButton') || document.getElementById('unCompleteTaskButton')
    let initialValue = button.value
    button.value = 'Loading...'
    button.setAttribute('disabled', 'true')

    $.ajax({
        type: 'POST',
        url: '/taskwAPI/modify',
        data: {
            type: 'makePending',
            uuid: uuid
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