/**
 * @brief sends a post request to the API to end a timer
 *        that has the input tags.
 * @param {string} tags An string encoding an array of tags
 */
function endTask(tags) {
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
      // IDK what to do with this...
    },
    error: (success, stdout, stderr) => {
      // TODO ask Austin what I should do with this.
    },
    dataType: 'json',
    timeout: 10000
  })
}

/**
 * @brief sends a post request to the API to start a timer
 * @return none
 */
function startTask() {
  let tagsInput = document.getElementById('timew-tags')
  let tagsStr = tagsInput.value
  let tags = tagsStr.split(',')
  tags.array.forEach(element => {
    // Cleaning the input of whitespace
    element.string.trim()
    // Input doesn't need to be sanitize because that
    // is monitored server side, but that would go here.
  })
  $.ajax({
    type: 'POST',
    url: '/timewAPI/stop',
    data: {
      args: tags
    },
    success: (success, stdout, stderr) => {
      // WIP
    },
    error: (success, stdout, stderr) => {
      // WIP
    },
    dataType: 'json',
    timeout: 10000
  })
}