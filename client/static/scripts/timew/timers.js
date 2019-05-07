/**
 * @brief sends a post request to the API to end a timer
 *        that has the input tags.
 * @param {string} tags An string encoding an array of tags
 */
function endTimer(tags) {
  // turning the string into an array
  let tagsArr = tags.split(', ')
  // make a request to the API to end the task selected
  post('/timewAPI/stop',
    {
      args: tagsArr
    },
    (data)=>{
      if(data.success) {
        location.reload()
      } else {
        showModal("Error", 'Operation failed: '+data.stderr)
      }
    })
}

/**
 * @brief sends a post request to the API to start a timer
 * @return none
 */
function startTimer() {
  let tagsInput = document.getElementById('timew-tags')
  let tagsStr = tagsInput.value
  let tags = tagsStr.split(',')
  
  post('/timewAPI/start',
    {
      args: tags
    },
    (data)=>{
      if(data.success) {
        location.reload()
      } else {
        showModal("Error", 'Operation failed: '+data.stderr)
      }
    })
}

//Taken from: https://stackoverflow.com/a/17147973
jQuery(document).ready(function ($) {
  // Convert table with id of 'allTimersTable' into a DataTable
  $('#allTimersTable').DataTable({
      order: [[0, 'desc']] //asc
  })
})