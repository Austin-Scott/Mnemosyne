/**
 * @brief sends a post request to the API to end a timer
 *        that has the input tags.
 * @param {string} tags An string encoding an array of tags
 */
function endTimer(tags) {
  // turning the string into an array
  let tagsArr = tags.split(', ')
  // make a request to the API to end the task selected
  $.ajax({
    type: 'POST',
    url: '/timewAPI/stop',
    data: {
      args: tagsArr
    },
    success: (success, stdout, stderr) => {
      location.reload()
    },
    error: (httpRequest, error) => {
      showModal('Error', `Error connecting to API:\n${error}`)
    },
    dataType: 'json',
    timeout: 10000
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
    $.ajax({
      type: 'POST',
      url: '/timewAPI/start',
      data: {
        args: tags
      },
      success: (success, stdout, stderr) => {
        location.reload()
      },
      error: (httpRequest, error) => {
        showModal('Error', `Error connecting to API:\n${error}`)
      },
      dataType: 'json',
      timeout: 10000
    })
  } else {
    // Tell the user to put in a tag
    showModal('Error', 'Please give some tags as an array of comma separated values')
  }
}