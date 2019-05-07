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
    ()=>{
      location.reload()
    })
}

/**
 * @brief sends a post request to the API to start a timer
 * @return none
 */
function startTimer() {
  let tagsInput = document.getElementById('timew-tags')
  let tagsStr = tagsInput.value
  if (tagsStr != ''){
    let tags = tagsStr.split(',')
    // trims whitespace on the end of tag strings
    let tagsMap = tags.map((tag) => { return tag.trim() })
    // prevent tags that are all whitespace characters (causes timew error 255)
    tags = tagsMap.filter((str) => { return (/\S/.test(str)) })

    post('/timewAPI/start',
      {
        args: tags
      },
      ()=>{
        location.reload()
      })
  } else {
    // Tell the user to put in a tag
    showModal('Error', 'Please give some tags as an array of comma separated values')
  }
}

//Taken from: https://stackoverflow.com/a/17147973
jQuery(document).ready(function ($) {
  // Convert table with id of 'allTimersTable' into a DataTable
  $('#allTimersTable').DataTable({
      order: [[0, 'desc']] //asc
  })
})