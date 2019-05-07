
function create() {
    let desc = document.getElementById('desc').value
    if(desc.length==0) {
        showModal('Error', 'New task description must be set.')
        return
    }

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

    postFromButton('createTaskButton', 'Loading...', '/taskwAPI/create', 
        {
            desc: desc,
            dueDate: dueDate,
            recurr: recurr,
            tags: tags,
            waitDate: waitDate,
            untilDate: untilDate
        }, 
        (data)=>{
            if (data.success == true) {
                window.location.href='/taskw'
                return
            }
        })
}

//Taken from: https://stackoverflow.com/a/17147973
jQuery(document).ready(function ($) {
    $('.clickable-row').click(function () {
        window.location = $(this).data('href')
    })
    $('#pendingTaskTable').DataTable({
        order: [[3, 'desc']]
    })
    $('#allTaskTable').DataTable({
        order: [[2, 'desc']]
    })
})