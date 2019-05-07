//Tells the server to mark the task currently being viewed as completed
function complete() {

    postFromButton('completeTaskButton', 'Loading...', '/taskwAPI/modify',
        {
            type: 'complete',
            uuid: uuid
        },
        (data)=>{
            if (data.success == true) {
                window.location.href='/taskw'
            }
        })
}

//Tells the server to update the information about the currently viewed task
function updateTask() {

    postFromButton('updateTaskButton', 'Loading...', '/taskwAPI/modify',
        {
            type: 'update',
            uuid: uuid,
            description: document.getElementById('desc').value
        },
        (data)=>{
            if (data.success == true) {
                location.reload()
            }
        })
}

//Delete the currently viewed task
function deleteTask() {

    postFromButton('deleteTaskButton', 'Loading...', '/taskwAPI/modify',
        {
            type: 'delete',
            uuid: uuid
        },
        (data)=>{
            if (data.success == true) {
                window.location.href='/taskw'
            }
        })
}

//Un-Complete or Un-Delete the currently viewed task
function makePending() {

    postFromButton(document.getElementById('unDeleteTaskButton')?'unDeleteTaskButton':'unCompleteTaskButton', 'Loading...', '/taskwAPI/modify', 
        {
            type: 'makePending',
            uuid: uuid
        },
        (data)=>{
            if (data.success == true) {
                window.location.href='/taskw'
            }
        })
}

//Show the edit current task form in a modal
function showEditTaskModal() {
    let form = document.getElementById('editTaskForm').innerHTML
    showModal('Edit Task', form)
}